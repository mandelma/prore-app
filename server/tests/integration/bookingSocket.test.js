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

test("Socket.io edastab tellimuse õigetele pakkujatele", async () => {

    const clients = [];

    // Testandmete unikaalne tunnus
    const unique = `${Date.now()}_${Math.random().toString(36).slice(2)}`;

    let clientUser;
    let providerA;
    let providerB;
    let providerC;
    let booking;

    try {

        // 1. Loome tellimuse omaniku

        clientUser = await User.create({
            username: `client_${unique}`,
            email: `client_${unique}@test.com`
        });


        // 2. Loome kolm pakkujat

        providerA = await createTestProvider(unique, "providerA");

        providerB = await createTestProvider(unique, "providerB");

        providerC = await createTestProvider(unique, "providerC");


        // 3. Loome tellimuse

        const bookingDate =
            Date.now() + 7 * 24 * 60 * 60 * 1000;

        booking = await Recipient.create({
            author_id: clientUser._id.toString(),
            user: clientUser._id,

            header: "Test electrical installation",
            address: "Test address",

            professionCode: "electrician",
            professional: ["electrician"],

            description: "Test booking",

            status: "active",
            created: new Date(bookingDate),
            created_ms: bookingDate,

            zone: 100,

            // Tellimus on seotud pakkujatega A ja B
            ordered: [
                providerA.provider._id,
                providerB.provider._id
            ]
        });


        // 4. Loome päris Socket.io ühendused

        const client = await connectClient(
            url,
            clientUser._id.toString()
        );

        clients.push(client);

        const socketA = await connectClient(
            url,
            providerA.user._id.toString()
        );

        clients.push(socketA);

        const socketB = await connectClient(
            url,
            providerB.user._id.toString()
        );

        clients.push(socketB);

        const socketC = await connectClient(
            url,
            providerC.user._id.toString()
        );

        clients.push(socketC);


        // 5. Registreerime sündmuste kuulajad

        const messageA = once(
            socketA,
            "handle-create-booking-multiple"
        );

        const messageB = once(
            socketB,
            "handle-create-booking-multiple"
        );

        let providerCReceived = false;

        socketC.on(
            "handle-create-booking-multiple",
            () => {
                providerCReceived = true;
            }
        );


        // 6. Saadame tellimuse

        const providerUserIds = [
            providerA.user._id.toString(),
            providerB.user._id.toString()
        ];

        const bookingId = booking._id.toString();

        client.emit(
            "create-booking-multiple",
            providerUserIds,
            bookingId
        );


        // 7. Ootame teavituste saabumist

        const [receivedA, receivedB] = await Promise.all([
            messageA,
            messageB
        ]);


        // 8. Kontrollime pakkuja A teavitust

        assert.deepEqual(receivedA, [
            providerA.user._id.toString(),
            bookingId,
            providerUserIds
        ]);


        // 9. Kontrollime pakkuja B teavitust

        assert.deepEqual(receivedB, [
            providerB.user._id.toString(),
            bookingId,
            providerUserIds
        ]);


        // 10. Pakkuja C ei tohi teavitust saada

        assert.equal(providerCReceived, false);

    } finally {

        // Sulgeme Socket.io kliendid
        for (const client of clients) {
            client.disconnect();
        }

        // Kustutame ainult selle testi loodud dokumendid
        if (booking?._id) {
            await Recipient.deleteOne({
                _id: booking._id
            });
        }

        for (const item of [providerA, providerB, providerC]) {
            if (item?.provider?._id) {
                await Provider.deleteOne({
                    _id: item.provider._id
                });
            }
        }

        const userIds = [
            clientUser?._id,
            providerA?.user?._id,
            providerB?.user?._id,
            providerC?.user?._id
        ].filter(Boolean);

        if (userIds.length > 0) {
            await User.deleteMany({
                _id: { $in: userIds }
            });
        }
    }
});

test("Socket.io keeldub ühendusest ilma JWT tokenita", async () => {

    // Loome Socket.io kliendi ilma tokenita
    const socket = ioClient(url, {
        transports: ["websocket"],
        reconnection: false,
        timeout: 5000
    });

    try {
        // Ootame ühenduse loomise viga
        const error = await new Promise((resolve, reject) => {

            const timeout = setTimeout(() => {
                reject(new Error("Socket connection timeout"));
            }, 5000);

            socket.once("connect_error", (err) => {
                clearTimeout(timeout);
                resolve(err);
            });

            socket.once("connect", () => {
                clearTimeout(timeout);

                reject(new Error(
                    "Socket connected without JWT token"
                ));
            });
        });

        // Kontrollime serveri veateadet
        assert.equal(error.message, "No token");

        // Kontrollime, et ühendust ei loodud
        assert.equal(socket.connected, false);

    } finally {

        // Sulgeme testkliendi
        socket.disconnect();
    }
});

test("Socket.io keeldub ühendusest vigase JWT tokeniga", async () => {

    const socket = ioClient(url, {
        auth: {
            token: "invalid-jwt-token"
        },
        transports: ["websocket"],
        reconnection: false,
        timeout: 5000
    });

    try {
        const error = await new Promise((resolve, reject) => {

            const timeout = setTimeout(() => {
                reject(new Error("Socket connection timeout"));
            }, 5000);

            socket.once("connect_error", (err) => {
                clearTimeout(timeout);
                resolve(err);
            });

            socket.once("connect", () => {
                clearTimeout(timeout);

                reject(new Error(
                    "Socket connected with invalid JWT token"
                ));
            });
        });

        assert.equal(error.message, "jwt malformed");

        assert.equal(socket.connected, false);

    } finally {
        socket.disconnect();
    }
});

test("Socket.io ei tohiks edastada suvalise tellimuse teavitust", async () => {

    const clients = [];

    try {
        // Loome kaks autentitud kasutajat
        const sender = await connectClient(url, "sender123");
        clients.push(sender);

        const receiver = await connectClient(url, "receiver123");
        clients.push(receiver);

        // Jälgime, kas receiver saab teavituse
        let notificationReceived = false;

        receiver.on(
            "handle-create-booking-multiple",
            () => {
                notificationReceived = true;
            }
        );

        // Saatja proovib saata teavituse
        // suvalise tellimuse kohta
        sender.emit(
            "create-booking-multiple",
            ["receiver123"],
            "nonexistentBooking123"
        );

        // Anname sündmusele aega serverisse jõuda
        await new Promise(resolve => setTimeout(resolve, 300));

        // Turvaline server ei tohiks seda teavitust edastada
        assert.equal(notificationReceived, false);

    } finally {
        for (const client of clients) {
            client.disconnect();
        }
    }
});

test("Socket.io ei luba saata teavitust võõra tellimuse kohta", async () => {

    const clients = [];

    const unique = `${Date.now()}_${Math.random().toString(36).slice(2)}`;

    let bookingOwner;
    let attacker;
    let provider;
    let booking;

    try {

        // 1. Loome tellimuse omaniku
        bookingOwner = await User.create({
            username: `owner_${unique}`,
            email: `owner_${unique}@test.com`
        });

        // 2. Loome teise kasutaja
        attacker = await User.create({
            username: `attacker_${unique}`,
            email: `attacker_${unique}@test.com`
        });

        // 3. Loome pakkuja
        provider = await createTestProvider(unique, "securityProvider");

        // 4. Loome tellimuse, mis kuulub esimesele kasutajale
        const bookingDate = Date.now() + 7 * 24 * 60 * 60 * 1000;

        booking = await Recipient.create({
            author_id: bookingOwner._id.toString(),
            user: bookingOwner._id,

            header: "Security test booking",
            address: "Test address",

            professionCode: "electrician",
            professional: ["electrician"],

            description: "Test booking ownership",

            status: "active",
            created: new Date(bookingDate),
            created_ms: bookingDate,

            zone: 100,

            ordered: [provider.provider._id]
        });

        // 5. Ühendame teise kasutaja ja pakkuja Socket.io-ga
        const attackerSocket = await connectClient(
            url,
            attacker._id.toString()
        );

        clients.push(attackerSocket);

        const providerSocket = await connectClient(
            url,
            provider.user._id.toString()
        );

        clients.push(providerSocket);

        // 6. Kontrollime, kas pakkuja saab teavituse
        let notificationReceived = false;

        providerSocket.on(
            "handle-create-booking-multiple",
            () => {
                notificationReceived = true;
            }
        );

        // 7. Teine kasutaja proovib saata teavitust
        attackerSocket.emit(
            "create-booking-multiple",
            [provider.user._id.toString()],
            booking._id.toString()
        );

        // Anname serverile aega sündmuse töötlemiseks
        await new Promise(resolve => setTimeout(resolve, 300));

        // 8. Pakkuja ei tohi teavitust saada
        assert.equal(notificationReceived, false);

    } finally {

        // Sulgeme ühendused
        for (const client of clients) {
            client.disconnect();
        }

        // Kustutame testi loodud tellimuse
        if (booking?._id) {
            await Recipient.deleteOne({ _id: booking._id });
        }

        // Kustutame pakkuja
        if (provider?.provider?._id) {
            await Provider.deleteOne({
                _id: provider.provider._id
            });
        }

        // Kustutame kasutajad
        const userIds = [
            bookingOwner?._id,
            attacker?._id,
            provider?.user?._id
        ].filter(Boolean);

        if (userIds.length > 0) {
            await User.deleteMany({
                _id: { $in: userIds }
            });
        }
    }
});

test("Socket.io ignoreerib kliendi saadetud vale pakkujate nimekirja", async () => {

    const clients = [];
    const unique = `${Date.now()}_${Math.random().toString(36).slice(2)}`;

    let clientUser;
    let providerA;
    let providerB;
    let booking;

    try {
        // 1. Loome tellimuse omaniku
        clientUser = await User.create({
            username: `client_${unique}`,
            email: `client_${unique}@test.com`
        });

        // 2. Loome kaks pakkujat
        providerA = await createTestProvider(unique, "providerA");
        providerB = await createTestProvider(unique, "providerB");

        // 3. Loome tellimuse, millega on seotud ainult A
        const bookingDate = Date.now() + 7 * 24 * 60 * 60 * 1000;

        booking = await Recipient.create({
            author_id: clientUser._id.toString(),
            user: clientUser._id,

            header: "Socket security test",
            address: "Test address",

            professionCode: "electrician",
            professional: ["electrician"],

            description: "Test provider validation",

            status: "active",
            created: new Date(bookingDate),
            created_ms: bookingDate,

            zone: 100,
            ordered: [providerA.provider._id]
        });

        // 4. Loome Socket.io ühendused
        const clientSocket = await connectClient(
            url,
            clientUser._id.toString()
        );
        clients.push(clientSocket);

        const socketA = await connectClient(
            url,
            providerA.user._id.toString()
        );
        clients.push(socketA);

        const socketB = await connectClient(
            url,
            providerB.user._id.toString()
        );
        clients.push(socketB);

        // 5. Ootame pakkuja A teavitust
        const messageA = once(
            socketA,
            "handle-create-booking-multiple"
        );

        // 6. Jälgime, kas pakkuja B saab teavituse
        let providerBReceived = false;

        socketB.on("handle-create-booking-multiple", () => {
            providerBReceived = true;
        });

        // 7. Klient saadab vale pakkuja ID
        clientSocket.emit(
            "create-booking-multiple",
            [providerB.user._id.toString()],
            booking._id.toString()
        );

        // 8. Pakkuja A peab teavituse saama
        const receivedA = await messageA;

        assert.deepEqual(receivedA, [
            providerA.user._id.toString(),
            booking._id.toString(),
            [providerA.user._id.toString()]
        ]);

        // 9. Kontrollime, et B ei saanud teavitust
        await new Promise(resolve => setTimeout(resolve, 300));

        assert.equal(providerBReceived, false);

    } finally {

        // Sulgeme Socket.io ühendused
        for (const client of clients) {
            client.disconnect();
        }

        // Kustutame testi loodud tellimuse
        if (booking?._id) {
            await Recipient.deleteOne({ _id: booking._id });
        }

        // Kustutame pakkujad
        for (const item of [providerA, providerB]) {
            if (item?.provider?._id) {
                await Provider.deleteOne({
                    _id: item.provider._id
                });
            }
        }

        // Kustutame kasutajad
        const userIds = [
            clientUser?._id,
            providerA?.user?._id,
            providerB?.user?._id
        ].filter(Boolean);

        if (userIds.length > 0) {
            await User.deleteMany({
                _id: { $in: userIds }
            });
        }
    }
});