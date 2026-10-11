const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

require("dotenv").config();

if (process.env.NODE_ENV !== "test") {
    throw new Error("Tests must run with NODE_ENV=test");
}

const { app, io } = require("../../app");

const {
    connectDB,
    disconnectDB
} = require("../../utils/database");

const User = require("../../models/users");
const Provider = require("../../models/providers");
const Recipient = require("../../models/recipients");

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

test("POST /api/recipients/:id/add-ordered - tellimus seotakse pakkujaga", async () => {

    const unique = new mongoose.Types.ObjectId().toString();

    let clientUser;
    let providerUser;
    let provider;
    let booking;

    try {
        // 1. Loome testkliendi
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

        // 4. Loome tellimuse
        booking = await Recipient.create({
            author_id: clientUser._id.toString(),
            user: clientUser._id,

            header: "Test electrical installation",
            address: "Test address",

            professionCode: "electrician",
            professional: ["electrician"],

            description: "Test booking",

            status: "active",
            created: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            ),
            created_ms:
                Date.now() + 7 * 24 * 60 * 60 * 1000,

            zone: 100,
            ordered: []
        });

        // 5. Loome kliendi JWT tokeni
        const token = jwt.sign(
            {
                id: clientUser._id.toString(),
                username: clientUser.username
            },
            process.env.SECRET,
            { expiresIn: "1h" }
        );

        // 6. Saadame API päringu
        const response = await request(app)
            .post(`/api/recipients/${booking._id}/add-ordered`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                providerId: provider._id.toString()
            });

        // 7. Kontrollime vastust
        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);

        // 8. Laeme dokumendid uuesti andmebaasist
        const updatedBooking =
            await Recipient.findById(booking._id);

        const updatedProvider =
            await Provider.findById(provider._id);

        // 9. Kontrollime Recipient.ordered
        assert.ok(
            updatedBooking.ordered.some(
                id => String(id) === String(provider._id)
            )
        );

        // 10. Kontrollime Provider.proposal
        assert.ok(
            updatedProvider.proposal.some(
                id => String(id) === String(booking._id)
            )
        );

        // Saadame sama tellimuse samale pakkujale uuesti
        const secondResponse = await request(app)
            .post(`/api/recipients/${booking._id}/add-ordered`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                providerId: provider._id.toString()
            });

        assert.equal(secondResponse.status, 200);

        // Loeme dokumendid uuesti andmebaasist
        const bookingAfterSecondRequest =
            await Recipient.findById(booking._id);

        const providerAfterSecondRequest =
            await Provider.findById(provider._id);

        // Kontrollime, et sama seos esineb ainult ühe korra
        const orderedCount = bookingAfterSecondRequest.ordered.filter(
            id => String(id) === String(provider._id)
        ).length;

        const proposalCount = providerAfterSecondRequest.proposal.filter(
            id => String(id) === String(booking._id)
        ).length;

        assert.equal(orderedCount, 1);
        assert.equal(proposalCount, 1);

        // Loome teise kasutaja JWT tokeni
        const otherUserId = new mongoose.Types.ObjectId();

        const otherToken = jwt.sign(
            {
                id: otherUserId.toString(),
                username: "otheruser"
            },
            process.env.SECRET,
            { expiresIn: "1h" }
        );

        // Võõras kasutaja proovib tellimust muuta
        const forbiddenResponse = await request(app)
            .post(`/api/recipients/${booking._id}/add-ordered`)
            .set("Authorization", `Bearer ${otherToken}`)
            .send({
                providerId: provider._id.toString()
            });

        // Server peab keelama tegevuse
        assert.equal(forbiddenResponse.status, 403);

        assert.equal(
            forbiddenResponse.body.error,
            "Not authorized to modify this booking"
        );

        // Genereerime ID, millele ei vasta ühtegi pakkujat
        const missingProviderId = new mongoose.Types.ObjectId();

        // Saadame päringu olematu pakkuja ID-ga
        const notFoundResponse = await request(app)
            .post(`/api/recipients/${booking._id}/add-ordered`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                providerId: missingProviderId.toString()
            });

        // Kontrollime HTTP staatust
        assert.equal(notFoundResponse.status, 404);

        // Kontrollime veateadet
        assert.equal(
            notFoundResponse.body.message,
            "Provider not found"
        );

    } finally {
        // Kustutame ainult testi loodud dokumendid
        if (booking?._id) {
            await Recipient.deleteOne({
                _id: booking._id
            });
        }

        if (provider?._id) {
            await Provider.deleteOne({
                _id: provider._id
            });
        }

        if (providerUser?._id) {
            await User.deleteOne({
                _id: providerUser._id
            });
        }

        if (clientUser?._id) {
            await User.deleteOne({
                _id: clientUser._id
            });
        }
    }
});