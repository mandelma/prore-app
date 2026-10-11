/* const { test, before, after, mock } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const mongoose = require("mongoose");

const Provider = require("../../models/providers.js");

require("dotenv").config();

if (process.env.NODE_ENV !== "test") {
    throw new Error("Tests must run with NODE_ENV=test");
}

const { app, io } = require("../../app.js");
const { connectDB, disconnectDB } = require("../../utils/database.js");

before(async () => {
    await connectDB();

    assert.equal(mongoose.connection.name, "prore_test_db");
});

after(async () => {
    await disconnectDB();
    await new Promise((resolve) => io.close(resolve));
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
}); */