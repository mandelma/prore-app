const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const Recipient = require("../../models/recipients");

if (process.env.NODE_ENV !== "test") {
    throw new Error("Tests must run with NODE_ENV=test");
}

const { app, io } = require("../../app");

const {
    connectDB,
    disconnectDB
} = require("../../utils/database");


before(async () => {
    await connectDB();

    assert.equal(
        mongoose.connection.name,
        "prore_test_db"
    );
});

after(async () => {
    await disconnectDB();

    await new Promise(resolve => io.close(resolve));
});

test("POST /api/recipients → klient saab luua tellimuse", async () => {

    const userId = new mongoose.Types.ObjectId();

    const token = jwt.sign(
        {
            id: userId.toString(),
            username: "testclient"
        },
        process.env.SECRET,
        { expiresIn: "1h" }
    );

    const bookingDate = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    const bookingData = {
        created: bookingDate.toISOString(),
        created_ms: bookingDate.getTime(),

        dateStr: "15.10.2026 13:00",

        header: "Electrical installation",
        professionCode: "electrician",
        professional: ["electrician"],

        address: "Test Street 1",
        latitude: 60.3,
        longitude: 24.8,

        zone: 20,

        description: "Electrical installation work",

        agreement: true,
        isIncludeOffers: true,

        customFieldValues: {},
        customFields: [],

        isBudget: false,
        budget: null,

        photos: [],
        status: "active"
    };

    let createdBookingId;

    try {
        const response = await request(app)
            .post("/api/recipients")
            .set("Authorization", `Bearer ${token}`)
            .send(bookingData);

        assert.equal(response.status, 200);

        createdBookingId =
            response.body.id || response.body._id;

        assert.ok(createdBookingId);

        const savedBooking =
            await Recipient.findById(createdBookingId);

        assert.ok(savedBooking);

        assert.equal(
            savedBooking.header,
            bookingData.header
        );

        assert.equal(
            savedBooking.zone,
            bookingData.zone
        );

        assert.deepEqual(
            savedBooking.professional,
            bookingData.professional
        );

        assert.equal(
            String(savedBooking.author_id),
            String(userId)
        );

        assert.equal(
            savedBooking.created_ms,
            bookingDate.getTime()
        );

    } finally {
        if (createdBookingId) {
            await Recipient.deleteOne({
                _id: createdBookingId
            });
        }
    }
});

test("POST /api/recipients → autentimata kasutaja ei saa tellimust luua", async () => {

    const response = await request(app)
        .post("/api/recipients")
        .send({
            header: "Unauthorized booking",
            professional: ["electrician"],
            address: "Test address",
            description: "Test description"
        });

    assert.equal(response.status, 401);

    assert.equal(
        response.body.error,
        "Missing token"
    );
});