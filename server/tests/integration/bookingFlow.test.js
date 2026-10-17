const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const { once } = require("node:events");
const { io: ioClient } = require("socket.io-client");

require("dotenv").config();

if (process.env.NODE_ENV !== "test") {
    throw new Error("Tests must run with NODE_ENV=test");
}

const { app, io, server } = require("../../app");
const { connectDB, disconnectDB } = require("../../utils/database");

const User = require("../../models/users");
const Recipient = require("../../models/recipients");
const Provider = require("../../models/providers");


let socketUrl;

before(async () => {

    // 1. Ühendame MongoDB testandmebaasiga
    await connectDB();

    assert.equal(
        mongoose.connection.name,
        "prore_test_db"
    );

    // 2. Käivitame HTTP serveri
    await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, () => {
            server.off("error", reject);
            resolve();
        });
    });

    // 3. Salvestame serveri aadressi
    const port = server.address().port;

    socketUrl = `http://127.0.0.1:${port}`;

});


// Sulgeme ühendused pärast teste
after(async () => {
    await new Promise(resolve => io.close(resolve));
    await disconnectDB();
});


// JWT tokeni loomise abifunktsioon
const createToken = (userId) => {
    return jwt.sign(
        {
            id: userId,
            username: "testuser"
        },
        process.env.SECRET,
        { expiresIn: "1h" }
    );
};

const connectClient = async (userId) => {

    const socket = ioClient(socketUrl, {
        auth: {
            token: createToken(userId)
        },

        transports: ["websocket"],
        reconnection: false
    });

    try {
        await new Promise((resolve, reject) => {

            const timeout = setTimeout(() => {
                reject(new Error("Socket connection timeout"));
            }, 5000);

            socket.once("connect", () => {
                clearTimeout(timeout);
                resolve();
            });

            socket.once("connect_error", (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });

        return socket;

    } catch (error) {
        socket.disconnect();
        throw error;
    }
};


// TEST 1
test("Tellimuse loomine HTTP API kaudu", async () => {

    const unique = `${Date.now()}_${Math.random().toString(36).slice(2)}`;

    let clientUser;
    let bookingId;

    try {

        // 1. Loome testkasutaja
        clientUser = await User.create({
            username: `booking_client_${unique}`,
            email: `booking_client_${unique}@test.com`
        });

        // 2. Loome JWT tokeni
        const token = createToken(
            clientUser._id.toString()
        );

        // 3. Koostame tellimuse andmed
        const bookingDate =
            Date.now() + 7 * 24 * 60 * 60 * 1000;

        const bookingData = {
            created: new Date(bookingDate).toISOString(),
            created_ms: bookingDate,

            header: "Test electrical installation",
            address: "Test address",

            latitude: 60.3,
            longitude: 24.8,

            professionCode: "electrician",
            professional: ["electrician"],

            description: "Test booking created through API",

            zone: 100,
            status: "active",

            agreement: true,

            photos: [],
            customFields: [],
            customFieldValues: []
        };

        // 4. Saadame päringu päris Express API-le
        const response = await request(app)
            .post("/api/recipients")
            .set("Authorization", `Bearer ${token}`)
            .send(bookingData);

        // 5. Kontrollime HTTP vastust
        assert.equal(response.status, 200);

        assert.ok(response.body.id || response.body._id);

        // 6. Leiame loodud tellimuse ID
        bookingId = response.body._id || response.body.id;

        // 7. Otsime tellimuse MongoDB-st
        const savedBooking = await Recipient.findById(bookingId);

        assert.ok(savedBooking);

        // 8. Kontrollime salvestatud andmeid
        assert.equal(
            savedBooking.header,
            "Test electrical installation"
        );

        assert.equal(
            savedBooking.author_id,
            clientUser._id.toString()
        );

        assert.equal(
            savedBooking.description,
            "Test booking created through API"
        );

    } finally {

        // Kustutame testi loodud tellimuse
        if (bookingId) {
            await Recipient.deleteOne({
                _id: bookingId
            });
        }

        // Kustutame testkasutaja
        if (clientUser?._id) {
            await User.deleteOne({
                _id: clientUser._id
            });
        }
    }
});

test("Pakkuja lisamine tellimusele HTTP API kaudu", async () => {

    const unique = `${Date.now()}_${Math.random().toString(36).slice(2)}`;

    let clientUser;
    let providerUser;
    let provider;
    let bookingId;

    try {

        // 1. Loome tellimuse omaniku
        clientUser = await User.create({
            username: `client_${unique}`,
            email: `client_${unique}@test.com`
        });

        // 2. Loome pakkuja kasutajakonto
        providerUser = await User.create({
            username: `provider_${unique}`,
            email: `provider_${unique}@test.com`
        });

        // 3. Loome pakkuja
        provider = await Provider.create({
            personId: providerUser._id,
            user: providerUser._id,

            pName: "Test Electrician",
            address: "Test address",

            latitude: 60.3,
            longitude: 24.8,

            profession: ["electrician"],
            range: 50,

            proposal: []
        });

        // 4. Loome tellimuse omaniku JWT tokeni
        const token = createToken(
            clientUser._id.toString()
        );

        const bookingDate =
            Date.now() + 7 * 24 * 60 * 60 * 1000;

        // 5. Loome tellimuse HTTP API kaudu
        const createResponse = await request(app)
            .post("/api/recipients")
            .set("Authorization", `Bearer ${token}`)
            .send({
                created: new Date(bookingDate).toISOString(),
                created_ms: bookingDate,

                header: "Test electrical installation",
                address: "Test address",

                latitude: 60.3,
                longitude: 24.8,

                professionCode: "electrician",
                professional: ["electrician"],

                description: "Test booking",

                zone: 100,
                status: "active",

                agreement: true,

                photos: [],
                customFields: [],
                customFieldValues: []
            });

        assert.equal(createResponse.status, 200);

        bookingId =
            createResponse.body._id || createResponse.body.id;

        // 6. Lisame pakkuja tellimusele
        const addResponse = await request(app)
            .post(`/api/recipients/${bookingId}/add-ordered`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                providerId: provider._id.toString()
            });

        // 7. Kontrollime API vastust
        assert.equal(addResponse.status, 200);
        assert.equal(addResponse.body.success, true);

        // 8. Kontrollime tellimust MongoDB-s
        const savedBooking = await Recipient.findById(bookingId);

        assert.ok(savedBooking);

        assert.ok(
            savedBooking.ordered.some(
                id => String(id) === String(provider._id)
            )
        );

        // 9. Kontrollime pakkujat MongoDB-s
        const savedProvider = await Provider.findById(provider._id);

        assert.ok(savedProvider);

        assert.ok(
            savedProvider.proposal.some(
                id => String(id) === String(bookingId)
            )
        );

    } finally {

        // Kustutame testtellimuse
        if (bookingId) {
            await Recipient.deleteOne({
                _id: bookingId
            });
        }

        // Kustutame testpakkuja
        if (provider?._id) {
            await Provider.deleteOne({
                _id: provider._id
            });
        }

        // Kustutame testkasutajad
        const userIds = [
            clientUser?._id,
            providerUser?._id
        ].filter(Boolean);

        if (userIds.length > 0) {
            await User.deleteMany({
                _id: { $in: userIds }
            });
        }
    }
});

test("Tellimuse loomine ja Socket.io teavituse saatmine", async () => {

    const unique = `${Date.now()}_${Math.random().toString(36).slice(2)}`;

    let clientUser;
    let providerUser;
    let provider;
    let bookingId;
    let clientSocket;
    let providerSocket;

    try {
        // 1. Loome kasutajad

        clientUser = await User.create({
            username: `client_${unique}`,
            email: `client_${unique}@test.com`
        });

        providerUser = await User.create({
            username: `provider_${unique}`,
            email: `provider_${unique}@test.com`
        });

        // 2. Loome pakkuja

        provider = await Provider.create({
            personId: providerUser._id,
            user: providerUser._id,

            pName: "Test Electrician",
            address: "Test address",

            latitude: 60.3,
            longitude: 24.8,

            profession: ["electrician"],
            range: 50,

            proposal: []
        });

        // 3. Loome tellimuse omaniku JWT tokeni

        const token = createToken(
            clientUser._id.toString()
        );

        const bookingDate =
            Date.now() + 7 * 24 * 60 * 60 * 1000;

        // 4. Loome tellimuse HTTP API kaudu

        const createResponse = await request(app)
            .post("/api/recipients")
            .set("Authorization", `Bearer ${token}`)
            .send({
                created: new Date(bookingDate).toISOString(),
                created_ms: bookingDate,

                header: "Socket.io integration booking",
                address: "Test address",

                latitude: 60.3,
                longitude: 24.8,

                professionCode: "electrician",
                professional: ["electrician"],

                description: "Full booking flow test",

                zone: 100,
                status: "active",

                agreement: true,

                photos: [],
                customFields: [],
                customFieldValues: []
            });

        assert.equal(createResponse.status, 200);

        bookingId =
            createResponse.body._id || createResponse.body.id;

        assert.ok(bookingId);

        // 5. Lisame pakkuja tellimusele HTTP API kaudu

        const addResponse = await request(app)
            .post(`/api/recipients/${bookingId}/add-ordered`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                providerId: provider._id.toString()
            });

        assert.equal(addResponse.status, 200);
        assert.equal(addResponse.body.success, true);

        // 6. Kontrollime MongoDB andmeid

        const savedBooking = await Recipient.findById(bookingId);

        assert.ok(savedBooking);

        assert.ok(
            savedBooking.ordered.some(
                id => String(id) === String(provider._id)
            )
        );

        // 7. Loome Socket.io ühendused

        clientSocket = await connectClient(
            clientUser._id.toString()
        );

        providerSocket = await connectClient(
            providerUser._id.toString()
        );

        // 8. Valmistume pakkuja teavitust vastu võtma

        const notificationPromise = once(
            providerSocket,
            "handle-create-booking-multiple"
        );

        // 9. Klient saadab Socket.io sündmuse

        clientSocket.emit(
            "create-booking-multiple",
            [providerUser._id.toString()],
            bookingId
        );

        // 10. Ootame pakkuja teavitust

        const notification = await Promise.race([
            notificationPromise,
            new Promise((_, reject) =>
                setTimeout(
                    () => reject(new Error("Socket notification timeout")),
                    5000
                )
            )
        ]);

        // 11. Kontrollime saadud teavitust

        assert.deepEqual(notification, [
            providerUser._id.toString(),
            bookingId,
            [providerUser._id.toString()]
        ]);

    } finally {

        // Sulgeme Socket.io ühendused

        clientSocket?.disconnect();
        providerSocket?.disconnect();

        // Kustutame testtellimuse

        if (bookingId) {
            await Recipient.deleteOne({
                _id: bookingId
            });
        }

        // Kustutame testpakkuja

        if (provider?._id) {
            await Provider.deleteOne({
                _id: provider._id
            });
        }

        // Kustutame testkasutajad

        const userIds = [
            clientUser?._id,
            providerUser?._id
        ].filter(Boolean);

        if (userIds.length > 0) {
            await User.deleteMany({
                _id: { $in: userIds }
            });
        }
    }
});