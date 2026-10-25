const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

const User = require("../../models/users");
const Provider = require("../../models/providers");
const Recipient = require("../../models/recipients");

const jwt = require("jsonwebtoken");
const { io: ioClient } = require("socket.io-client");

const { once } = require("node:events");

require("dotenv").config();

const mongoose = require("mongoose");

const {
    connectDB,
    disconnectDB
} = require("../../utils/database");

if (process.env.NODE_ENV !== "test") {
    throw new Error("Tests must run with NODE_ENV=test");
}

const { server, io } = require("../../app");

// Loome testkasutajale JWT tokeni
const createToken = (userId) => {
    return jwt.sign(
        {
            id: userId,
            username: userId
        },
        process.env.SECRET,
        { expiresIn: "1h" }
    );
};

// Loome autentitud Socket.io ühenduse
const connectClient = async (url, userId) => {

    const socket = ioClient(url, {
        auth: {
            token: createToken(userId)
        },

        transports: ["websocket"],
        reconnection: false
    });

    await new Promise((resolve, reject) => {

        const timeout = setTimeout(() => {
            reject(new Error("Socket connection timeout"));
        }, 5000);

        socket.once("connect", () => {
            clearTimeout(timeout);
            resolve();
        });

        socket.once("connect_error", error => {
            clearTimeout(timeout);
            reject(error);
        });
    });

    return socket;
};

let url;

before(async () => {

    // Ühendame testandmebaasiga
    await connectDB();

    // Turvakontroll: õige andmebaas
    assert.equal(
        mongoose.connection.name,
        "prore_test_db"
    );

    // Käivitame testserveri juhuslikul vabal pordil
    await new Promise(resolve => {
        server.listen(0, resolve);
    });

    const port = server.address().port;

    url = `http://127.0.0.1:${port}`;
});

after(async () => {

    // Sulgeme Socket.io ja HTTP serveri
    await new Promise(resolve => {
        io.close(resolve);
    });

    // Katkestame testandmebaasi ühenduse
    await disconnectDB();

});

const createTestProvider = async (unique, name) => {

    // 1. Loome kasutajakonto
    const user = await User.create({
        username: `${name}_${unique}`,
        email: `${name}_${unique}@test.com`
    });

    // 2. Loome pakkuja dokumendi
    const provider = await Provider.create({
        personId: user._id,
        user: user._id,

        pName: `Test ${name}`,
        address: "Test address",

        latitude: 60.3,
        longitude: 24.8,

        profession: ["electrician"],
        range: 50,

        proposal: []
    });

    // 3. Tagastame mõlemad dokumendid
    return {
        user,
        provider
    };
};

test(
    "Kaardilt saadetud tellimus jõuab ainult valitud pakkujale",
    async () => {

        const unique = `${Date.now()}_${Math.random()
            .toString(36)
            .slice(2)}`;

        let client;
        let providerA;
        let providerB;
        let booking;

        let clientSocket;
        let providerASocket;
        let providerBSocket;

        try {
            // 1. Loome tellimuse esitaja

            client = await User.create({
                username: `client_${unique}`,
                email: `client_${unique}@test.com`
            });

            // 2. Loome kaks pakkujat

            providerA = await createTestProvider(
                unique,
                "electricianA"
            );

            providerB = await createTestProvider(
                unique,
                "electricianB"
            );

            // 3. Loome tellimuse MongoDB-s

            booking = await Recipient.create({
                author_id: client._id,
                user: client._id,

                header: "Direct booking test",
                description: "Electrical installation",

                created: new Date(
                    Date.now() + 86400000
                ),

                created_ms: Date.now() + 86400000,

                address: "Test address",

                latitude: 60.3,
                longitude: 24.8,

                professionCode: "electrician",
                professional: ["electrician"],

                status: "active",

                // Tellimus saadetakse ainult pakkujale A
                ordered: [providerA.provider._id]
            });

            // 4. Loome Socket.io ühendused

            clientSocket = await connectClient(
                url,
                client._id.toString()
            );

            providerASocket = await connectClient(
                url,
                providerA.user._id.toString()
            );

            providerBSocket = await connectClient(
                url,
                providerB.user._id.toString()
            );

            // 5. Jälgime, kas pakkuja B saab teavituse

            let providerBReceived = false;

            providerBSocket.on(
                "handle client request",
                () => {
                    providerBReceived = true;
                }
            );

            // 6. Valmistume pakkuja A teavitust vastu võtma

            const notificationPromise = once(
                providerASocket,
                "handle client request"
            );

            // 7. Klient saadab kaardilt tellimuse teavituse

            clientSocket.emit(
                "client made request",
                providerA.user._id.toString(),
                booking._id.toString()
            );

            // 8. Ootame pakkuja A teavitust

            const [notification] = await Promise.race([
                notificationPromise,

                new Promise((_, reject) => {
                    setTimeout(
                        () => reject(
                            new Error(
                                "Direct booking notification timeout"
                            )
                        ),
                        5000
                    );
                })
            ]);

            // 9. Kontrollime teavituse sisu

            assert.deepEqual(notification, {
                bookingId: booking._id.toString()
            });

            // 10. Anname aega võimaliku vale teavituse saabumiseks

            await new Promise(resolve => {
                setTimeout(resolve, 300);
            });

            // Pakkuja B ei tohi teavitust saada

            assert.equal(
                providerBReceived,
                false
            );

        } finally {

            // Sulgeme Socket.io ühendused

            clientSocket?.disconnect();
            providerASocket?.disconnect();
            providerBSocket?.disconnect();

            // Kustutame testtellimuse

            if (booking?._id) {
                await Recipient.deleteOne({
                    _id: booking._id
                });
            }

            // Kustutame testpakkujad

            const providerIds = [
                providerA?.provider?._id,
                providerB?.provider?._id
            ].filter(Boolean);

            if (providerIds.length) {
                await Provider.deleteMany({
                    _id: { $in: providerIds }
                });
            }

            // Kustutame testkasutajad

            const userIds = [
                client?._id,
                providerA?.user?._id,
                providerB?.user?._id
            ].filter(Boolean);

            if (userIds.length) {
                await User.deleteMany({
                    _id: { $in: userIds }
                });
            }
        }
    }
);