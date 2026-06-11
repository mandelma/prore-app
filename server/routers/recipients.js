//const recipientRouter = require('express').Router();
const express = require("express");
const Recipient = require('../models/recipients');
const Provider = require("../models/providers");
const User = require("../models/users");
//const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const Upload = require("../models/awsUploads");
const Offer = require("../models/offers");
const { Conversation, Message } = require("../models/chat");
//const Provider = require("../models/providers");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    // endpoint: `https://s3.${process.env.AWS_REGION}.amazonaws.com`,  // Explicitly set the endpoint
    forcePathStyle: true, // Ensures requests go to the correct endpoint
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

module.exports = (io) => {
    const recipientRouter = express.Router();

    recipientRouter.get('/', async (req, res) => {
        try {
            const recipients = await Recipient.find({})
            res.send(recipients);
        } catch (err) {
            console.log("Error: " + err.message);
        }
    })

    recipientRouter.get('/user/:id', async (req, res) => {
        const recipients = await Recipient.find({ user: req.params.id })
            .populate('user')
            .populate('ordered')
            .populate({ path: 'ordered', populate: { path: 'user' } })
            .populate({path: 'ordered', populate: {path: 'reference.imageId'}})
            .populate('photos.imageId')
            .populate('offers')
            .populate({ path: 'offers', populate: { path: 'provider', populate: { path: 'user' } } })
            .populate({ path: 'offers', populate: { path: 'provider', populate: { path: 'reference.imageId' } } }).exec();
        // .populate({path: 'offers', populate: {path: 'provider', populate: {path: 'reference'}}}).exec();

        res.send(recipients)
    })

    recipientRouter.get('/booking/:id', async (req, res) => {
        const booking = await Recipient.findOne({ _id: req.params.id })
            .populate('user')
            .populate('ordered')

            .populate('photos.imageId')
            .populate({ path: 'ordered', populate: { path: 'user' } })
            .populate('offers')
            .populate({ path: 'offers', populate: { path: 'provider', populate: { path: 'user' } } })
            .populate({ path: 'offers', populate: { path: 'provider', populate: { path: 'reference.imageId' } } }).exec();

        res.send(booking);
    })


    // Add recipient
    recipientRouter.post('/:id', async (req, res, next) => {
        try {
            const body = req.body;
            const date = new Date(body.created)              // current date
            const formatted = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })
            console.log("Photos", body.photos);
            console.log("BODY - ", body);               // → 09/26/2025
            console.log("DateObj " + body.created)
            const recipient = new Recipient({
                author_id: body.author_id,
                started: new Date(),
                created: body.created,
                created_ms: body.created_ms,
                header: body.header,
                isContactAgreement: body.agreement,
                address: body.address,
                latitude: body.latitude,
                longitude: body.longitude,
                chat_provider_user_ids: [],
                zone: body.zone,
                professional: body.professional,
                isIncludeOffers: body.isIncludeOffers,

                budget: body.budget,

                date: body.dateStr,
                //bookings: body.booking,
                description: body.description,
                photos: body.photos,
                status: body.status,
                image: body.imageId,
                user: req.params.id
            })

            const savedRecipient = await recipient.save();

            await savedRecipient.populate({ path: 'user', select: '_id name avatar email' });

            res.json(savedRecipient.toObject({ getters: true, virtuals: true }));
            //res.json(savedRecipient)
        } catch (err) {
            console.log("Error: " + err.message);
        }
    })

    // Update main - description, date, photos
    recipientRouter.put("/update-client-main/:clientId", async (req, res) => {
        try {
            const {
                description,
                date,                 // preferably ISO string
                photos,               // final photos list (ids or objects)
                removedPhotoIds, // ids to delete from Upload + S3
            } = req.body;



            console.log("Removed photo ids - ", removedPhotoIds);

            // 1) Normalize final photo ids (the ones to keep)
            const photoIds = Array.isArray(photos)
                ? photos
                    .map(p => (typeof p === "string" ? p : (p.id ?? p.imageId)))
                    .filter(Boolean)
                : [];

            // 2) Update recipient first (remove references by overwriting final list)
            const update = {
                description,
                date,
                photos: photoIds,
            };

            const main = await Recipient.findByIdAndUpdate(
                req.params.clientId,
                { $set: update },
                { new: true, runValidators: true }
            );

            if (!main) {
                return res.status(404).json({ error: "Recipient not found" });
            }

            // 3) Delete removed uploads (S3 + Upload collection)
            const idsToDelete = Array.isArray(removedPhotoIds)
                ? removedPhotoIds.filter(Boolean)
                : [];

            console.log("idsToDelete normalized:", idsToDelete);

            if (idsToDelete.length) {
                // find keys from DB
                const docs = await Upload.find(
                    { _id: { $in: idsToDelete } },
                    { key: 1 }
                ).lean();

                console.log("Upload docs found for deletion:", docs.length, docs);

                // delete from S3
                await Promise.all(
                    docs.map(doc =>
                        s3.send(
                            new DeleteObjectCommand({
                                Bucket: process.env.AWS_S3_BUCKET_NAME,
                                Key: doc.key,
                            })
                        )
                    )
                );

                // delete Upload documents
                await Upload.deleteMany({ _id: { $in: idsToDelete } });
            }

            return res.status(200).json(main);
        } catch (err) {
            console.log("Error to update client main!", err);
            return res.status(500).json({ error: err.message });
        }
    });

    // Update date and time
    recipientRouter.put('/:id/updateDate', async (req, res) => {
        //const dateID = req.params.dateId;
        try {
            const dateUpdate = {
                year: req.body.year,
                month: req.body.month,
                day: req.body.day,
                hours: req.body.hours,
                minutes: req.body.minutes
            }
            // supposed that in date array is only one object
            const data = await Recipient.updateOne({ _id: req.params.id },
                { $set: { [`onTime.${0}`]: dateUpdate } });

            await Recipient.findByIdAndUpdate(
                req.params.id,
                {
                    created: new Date(req.body.year, req.body.month, req.body.day, req.body.hours, req.body.minutes),
                    date: (req.body.month + 1) + "/" + req.body.day + "/" + req.body.year,
                    created_ms: req.body.date_ms
                },
                { new: true }
            )

            res.status(200).json(data)
        } catch (err) {
            console.log("Error: " + err.message);
        }
    })

    // Add ordered provider id to ordered array
    recipientRouter.post('/:recipientId/addOrdered/:id', async (req, res) => {
        try {
            const recipient = await Recipient.findById(req.params.recipientId);
            if (!recipient.ordered.includes(req.params.id)) {
                recipient.ordered = recipient.ordered.concat(req.params.id);
                await recipient.save();
                res.send("pro is added!")
            } else {
                res.send("pro is already added!")
            }


        } catch (err) {
            console.log("Error: " + err.message)
            res.send("Error to add order!")
        }
    })


    // Remove ordered provider id from ordered array
    recipientRouter.put('/:id/pro/:proID', async (req, res) => {
        try {
            await Recipient.findOneAndUpdate(
                { _id: req.params.id },
                { $pull: { ordered: req.params.proID } }
            )
            res.send("Pro is removed!")
        } catch (err) {
            res.send("No pro is removed!").end()
        }
    })

    // Add providers made offer to booking
    recipientRouter.post('/:bookingID/offer/:id', async (req, res) => {
        const { bookingID, id } = req.params;
        try {
            const booking = await Recipient.findById(bookingID);
            if (!booking.offers.includes(bookingID)) {
                booking.offers = booking.offers.concat(id);
                await booking.save();

                res.send(booking);
            }
        } catch (error) {
            res.status(500).send("Error happens to add offer!")
        }
    })

    // Add confirmed offer
    recipientRouter.post('/:bookingId/confirmed', async (req, res) => {
        const { bookingId } = req.params;
        const body = req.body;
        try {
            /* const booking = await Recipient.findById(bookingId);
            booking.offer = body;
            await booking.save();
            res.send(booking); */
            const confirmed = await Recipient.findByIdAndUpdate(
                bookingId,
                body,
                {new: true}
            )
        } catch (e) {
            console.log("Error - " + e.message);
        }
    })

    // Add provider id to recipient
    recipientRouter.put('/:id', async (req, res) => {
        try {
            const provider = await Recipient.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );

            res.status(200).json(provider)
        } catch (error) {
            res.send("Error to add provider!")
        }
    })
    // Add visitor
    recipientRouter.put('/:id/visitor', async (req, res) => {
        try {
            console.log("visitor " + req.body.visitor)
            const booking = await Recipient.findById(req.params.id);
            if (!booking.visitors.includes(req.body.visitor)) {
                booking.visitors = booking.visitors.concat(req.body.visitor);
            }

            await booking.save();

            res.send(booking);
        } catch (error) {
            console.log("Error: " + error.message);
        }

    })

    // Update offer in booking
    recipientRouter.put('/:id/offer', async (req, res) => {
        try {
            const { price, placeOrGo } = req.body;

            const updated = await Recipient.findByIdAndUpdate(
                req.params.id,
                {
                    $set: {
                        'offer.price': price,
                        'offer.placeOrGo': placeOrGo,
                    }
                },
                { new: true }
            );

            if (!updated) {
                return res.status(404).json({ message: 'Booking not found' });
            }

            res.json(updated);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Update failed' });
        }
    });

    // Add images id to array
    recipientRouter.post('/:recipientId/addImage/:id', async (req, res) => {
        try {
            const recipient = await Recipient.findById(req.params.recipientId);
            if (recipient.photos !== null) {
                if (!recipient?.photos.includes(req.params.id)) {
                    recipient.photos = recipient.photos.concat(req.params.id);
                    await recipient.save();
                    res.send("Image is added!")
                } else {
                    res.send("Image not added!")
                }
            } else {
                recipient.photos = req.params.id;
                await recipient.save();
                res.send("Image is added!")
            }



        } catch (err) {
            console.log("Error: " + err.message)
        }
    })
    
    // Add feedBack given
    recipientRouter.put('/client/:id', async (req, res) => {
        try {
            const client = await Recipient.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            )
            res.status(200).json(client);
        } catch (err) {
            res.send({ error: err });
        }
    })

    // Edit description
    recipientRouter.put('/:id/description', async (req, res) => {
        try {
            const body = req.body;
            const updatedDescription = await Recipient.findByIdAndUpdate(
                req.params.id, body, { new: true }
            )

            res.status(200).json(updatedDescription.toJSON())
        } catch (err) {
            res.send({ error: err })
        }
    })

    // Remove image id from array after image is deleted
    recipientRouter.delete('/:id/image/:imageId', async (req, res) => {
        try {
            await Recipient.findOneAndUpdate(
                { _id: req.params.id },
                { $pull: { image: req.params.imageId } }
            )
            res.send("Image is removed!")
        } catch (err) {
            res.send("No image is removed!").end()
        }
    })

    // Edit booking address
    recipientRouter.put('/:id/editBookingAddress', async (req, res) => {
        const body = req.body
        const params = req.params;

        try {
            const updated = await Recipient.findByIdAndUpdate(
                params.id, body, { new: true }
            )

            res.status(200).json(updated.toJSON())
        } catch (err) {
            console.log('Error: ', err)
            res.status({ error: err })
        }
    })

    // Edit booking status

    recipientRouter.put('/:id', async (req, res) => {
        try {
            console.log("PUT /recipients/:id", req.params.id, req.body);

            const updated = await Recipient.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },
                { new: true, runValidators: true }
            );

            if (!updated) return res.status(404).json({ error: "Recipient not found" });

            return res.status(200).json(updated);
        } catch (err) {
            console.log("Error:", err);
            return res.status(500).json({ error: err.message });
        }
    });


    async function deleteBookingUploadsByIds(ids = []) {
        if (!ids.length) return 0;

        const docs = await Upload.find({ _id: { $in: ids } });

        await Promise.all(
            docs.map((doc) =>
                s3.send(
                    new DeleteObjectCommand({
                        Bucket: process.env.AWS_S3_BUCKET_NAME,
                        Key: doc.key,
                    })
                )
            )
        );

        await Upload.deleteMany({ _id: { $in: ids } });

        return docs.length;
    }

    async function deleteConversationBetweenUsers(userA, userB) {
        const participantKey = [userA, userB]
            .map(String)
            .sort()
            .join("_");

        const conversation = await Conversation.findOne({ participantKey });

        if (!conversation) {
            return { deleted: false, reason: "Conversation not found" };
        }

        await Message.deleteMany({ conversationId: conversation._id });

        await Conversation.deleteOne({ _id: conversation._id });

        return {
            deleted: true,
            conversationId: conversation._id,
        };
    }

    // Delete booking with all included
    recipientRouter.delete("/:id", async (req, res) => {
        try {
            const recipientId = req.params.id;

            const recipient = await Recipient.findById(recipientId);
            if (!recipient) {
                return res.status(404).json({
                    ok: false,
                    deleted: false,
                    error: "Recipient not found",
                });
            }

            const uploadIds = (recipient.photos || [])
                .map((photo) => photo.imageId)
                .filter(Boolean);

            await deleteBookingUploadsByIds(uploadIds);
            await Offer.deleteMany({ bookingID: recipientId });

            const clientId = String(recipient.author_id);

            const providerIds = [
                ...new Set((recipient.chat_provider_user_ids || []).map(String))
            ];
            const deletedBooking = await Recipient.deleteOne({ _id: recipientId });
            const deletedConversationProviderIds = [];




            for (const providerId of providerIds) {
                const stillExists = await Recipient.exists({
                    author_id: clientId,
                    chat_provider_user_ids: providerId
                });

                if (!stillExists) {
                    await deleteConversationBetweenUsers(clientId, providerId);
                    deletedConversationProviderIds.push(providerId);
                }
            }

            io.to(clientId).emit("conversation:list:refresh");

            for (const providerId of providerIds) {
                io.to(providerId).emit("conversation:list:refresh");
            }

            return res.json({
                ok: true,
                deleted: deletedBooking.deletedCount === 1,
                bookingId: recipientId,
                deletedConversationProviderIds,
            });
        } catch (err) {
            console.error("DELETE RECIPIENT ERROR:", err);
            return res.status(500).json({
                ok: false,
                deleted: false,
                error: err.message,
            });
        }
    });

    return recipientRouter;
}