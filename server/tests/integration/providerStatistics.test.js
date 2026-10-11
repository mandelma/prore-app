const { test, before, after, mock } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

require("dotenv").config();

if (process.env.NODE_ENV !== "test") {
    throw new Error("Tests must run with NODE_ENV=test");
}

const { app, io } = require("../../app");
const { connectDB, disconnectDB } = require("../../utils/database");
const Provider = require("../../models/providers");

before(async () => {
    await connectDB();

    assert.equal(mongoose.connection.name, "prore_test_db");
});

after(async () => {
    await disconnectDB();
    await new Promise(resolve => io.close(resolve));
});

test("GET /api/providers/document returns statistics", async () => {
    const response = await request(app)
        .get("/api/providers/document");

    assert.equal(response.status, 200);
    assert.equal(response.body.ok, true);

    assert.equal(typeof response.body.providerCount, "number");
    assert.equal(typeof response.body.professionCount, "number");

    assert.ok(response.body.providerCount >= 0);
    assert.ok(response.body.professionCount >= 0);
});

test("GET /api/providers/document handles database errors", async () => {
    const countMock = mock.method(
        Provider,
        "countDocuments",
        async () => {
            throw new Error("Simulated database error");
        }
    );

    try {
        const response = await request(app)
            .get("/api/providers/document");

        assert.equal(response.status, 500);
        assert.equal(response.body.ok, false);

        assert.equal(
            response.body.message,
            "Failed to get provider statistics"
        );

        assert.equal(countMock.mock.callCount(), 1);
    } finally {
        countMock.mock.restore();
    }
});


test("GET /api/providers/document returns correct provider statistics", async () => {

    

    const createdProviderIds = [];
    

    try {
        const initialProviderCount = await Provider.countDocuments();

        const userId1 = new mongoose.Types.ObjectId();
        const userId2 = new mongoose.Types.ObjectId();

        

        // loome tokenid
        const token1 = jwt.sign(
            { id: userId1, username: "testuser" },
            process.env.SECRET,
            { expiresIn: "1h" }
        );

        const token2 = jwt.sign(
            { id: userId2, username: "testuser2" },
            process.env.SECRET,
            { expiresIn: "1h" }
        );

        // 1. Loome kaks testpakkujat
        const provider1 = await request(app)
            .post(`/api/providers/${userId1}`)
            .set("Authorization", `Bearer ${token1}`)
            .send({
                pName: "Test Electrician",
                personId: new mongoose.Types.ObjectId(),
                address: "Test Street 1",
                profession: ["Electrician"]
            });

        createdProviderIds.push(provider1.body.id);

        const provider2 = await request(app)
            .post(`/api/providers/${userId2}`)
            .set("Authorization", `Bearer ${token2}`)
            .send({
                pName: "Test Plumber",
                personId: new mongoose.Types.ObjectId(),
                address: "Test Street 2",
                profession: ["Plumber"]
            });

        createdProviderIds.push(provider2.body.id);

        console.log("PROVIDER 1:", provider1.status, provider1.body);
        console.log("PROVIDER 2:", provider2.status, provider2.body);

        // 2. Teeme API päringu
        const response = await request(app)
            .get("/api/providers/document");

        // 3. Kontrollime vastust
        assert.equal(response.status, 200);
        assert.equal(response.body.ok, true);

        assert.equal(
            response.body.providerCount,
            initialProviderCount + 2
        );

        assert.equal(response.body.professionCount, 2);

    } finally {
        // 4. Eemaldame ainult loodud testpakkujad
        await Provider.deleteMany({
            _id: {
                $in: createdProviderIds
            }
        });
    }
});