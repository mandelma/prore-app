const router = require('express').Router();
const mongoose = require('mongoose');
const Offer = require('../models/offers');
const Recipient = require('../models/recipients');
const Provider = require("../models/providers");


router.get('/:id', async(req, res) => {
    const offers = await Offer.find({});
    res.send(offers);
})

// Final
router.post("/", async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { offer } = req.body;

        console.log("OFFER - ", offer);

        console.log("REQ BODY:", req.body);
        console.log("OFFER:", req.body?.offer);

        if (!offer?.bookingID) {
            return res.status(400).json({
                success: false,
                code: "BOOKING_ID_REQUIRED",
                message: "Booking ID is required."
            });
        }

        if (!offer?.sender || !offer?.provider) {
            return res.status(400).json({
                success: false,
                code: "PROVIDER_REQUIRED",
                message: "Provider information is required."
            });
        }

        const price = Number(offer.price);

        if (!Number.isFinite(price) || price <= 0) {
            return res.status(400).json({
                success: false,
                code: "INVALID_OFFER_PRICE",
                message: "The offer price is invalid."
            });
        }

        let savedOffer;
        let updatedBooking;

        await session.withTransaction(async () => {
            const createdOffers = await Offer.create(
                [
                    {
                        bookingID: offer.bookingID,
                        sender: offer.sender,
                        isNewOffer: true,
                        name: offer.name,
                        area: offer.area,
                        cAddress: offer.cAddress,
                        pAddress: offer.pAddress,
                        placeOrGo: offer.placeOrGo,
                        distance: offer.distance,
                        duration: offer.duration,
                        price,
                        description: offer.description,
                        place: offer.place,
                        provider: offer.provider
                    }
                ],
                { session }
            );

            savedOffer = createdOffers[0];

            updatedBooking = await Recipient.findOneAndUpdate(
                {
                    _id: offer.bookingID,
                    status: "active",

                    // Maksimaalselt 10 pakkumist
                    "offers.0": { $exists: false }
                },
                {
                    $push: {
                        offers: savedOffer._id
                    }
                },
                {
                    new: true,
                    session,
                    runValidators: true
                }
            );

            if (!updatedBooking) {
                const booking = await Recipient.findById(
                    offer.bookingID
                )
                    .select("status offers")
                    .session(session);

                if (!booking) {
                    const error = new Error("Booking not found.");
                    error.code = "BOOKING_NOT_FOUND";
                    error.status = 404;
                    throw error;
                }

                if (booking.status !== "active") {
                    const error = new Error(
                        "The booking is no longer active."
                    );
                    error.code = "BOOKING_NOT_ACTIVE";
                    error.status = 409;
                    throw error;
                }

                const error = new Error(
                    "The maximum number of offers has been reached."
                );
                error.code = "MAX_OFFERS_REACHED";
                error.status = 409;
                throw error;
            }
        });

        return res.status(201).json({
            success: true,
            offer: savedOffer,
            bookingId: updatedBooking._id
        });
    } catch (error) {
        console.error("Offer sending failed:", error);

        if (error.code === "BOOKING_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                code: error.code,
                message: error.message
            });
        }

        if (
            error.code === "MAX_OFFERS_REACHED" ||
            error.code === "BOOKING_NOT_ACTIVE"
        ) {
            return res.status(409).json({
                success: false,
                code: error.code,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            code: "OFFER_CREATION_FAILED",
            message: "Offer sending failed."
        });
    } finally {
        await session.endSession();
    }
});

// Update offer status
router.put('/:id', async (req, res) => {
    try {
        console.log("body in offers: " + req.body)
        const offerToUpdateStatus = await Offer.findByIdAndUpdate(
            req.params.id, req.body, {new: true}
        );
        res.status(200).send(offerToUpdateStatus);
    } catch (error) {
        console.log("Error: " + error.message);
    }
})

// Remove offer and offer id from recipient
router.delete('/:offer_id/remove_by_offerID/:booking_id', async (req, res) => {
    try {
        await Offer.findByIdAndDelete(req.params.offer_id);

        await Recipient.findByIdAndUpdate(
            {_id: req.params.booking_id},
            {$pull: {offers: req.params.offer_id}}
        )
        res.status(204).end();
    } catch (error) {
        console.log("Error: " + error.message);
    }
})



router.delete('/:booking_id', async (req, res) => {
    try {
        console.log("params for delete offer " + req.params.booking_id);

        await Offer.deleteMany({bookingID: req.params.booking_id});
        res.status(204).end();
    } catch (error) {
        console.log("Error: " + error.message);
        res.send("Error to delete offer!")
    }
})

module.exports = router;