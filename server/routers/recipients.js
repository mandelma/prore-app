const router = require('express').Router();

const Recipient = require('../models/recipients');
const Provider = require("../models/providers");
const User = require("../models/users");
//const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const Upload = require("../models/awsUploads");
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

router.get('/', async (req, res) => {
    try {
        const recipients = await Recipient.find({})
        res.send(recipients);
    } catch (err) {
        console.log("Error: " + err.message);
    }
})

router.get('/user/:id', async (req, res) => {
    const recipients = await Recipient.find({user: req.params.id})
        .populate('user')
        .populate('ordered')
        .populate({path: 'ordered', populate: {path: 'user'}} )
        // .populate({path: 'ordered', populate: {path: 'reference'}})
        .populate('photos')
        .populate('offers')
        .populate({path: 'offers', populate: {path: 'provider', populate: {path: 'user'}}})
        // .populate({path: 'offers', populate: {path: 'provider', populate: {path: 'reference'}}}).exec();


    //const provider = await Provider.findById(req.params.id)
    res.send(recipients)
})

router.get('/booking/:id', async (req, res) => {
    const booking = await Recipient.findOne({_id: req.params.id})
        //.populate('image')
        .populate('user')
        .populate('ordered')
        .populate('photos')
        .populate({path: 'ordered', populate: {path: 'user'}})
        .populate('offers')
        .populate({path: 'offers', populate: {path: 'provider', populate: {path: 'user'}}}).exec();
    res.send(booking);
})



router.post('/:id', async (req, res, next) => {
    try {
        const body = req.body;
        const date = new Date(body.created)              // current date
        const formatted = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
        //console.log(formatted)               // → 09/26/2025
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
            zone: body.zone,
            professional: body.professional,
            isIncludeOffers: body.isIncludeOffers,

            date: body.dateStr,
            //bookings: body.booking,
            description: body.description,
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
router.put("/update-client-main/:clientId", async (req, res) => {
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


/* router.put("/update-client-main/:clientId", async (req, res) => {
    try {
        const { description, date, photos } = req.body;

        
        const photoIds = Array.isArray(photos)
            ? photos.map(p => (typeof p === "string" ? p : p.id)).filter(Boolean)
            : [];

        const update = {
            description,
            date: date,
            created: new Date(date),
            photos: photoIds,
        };

        const main = await Recipient.findByIdAndUpdate(
            req.params.clientId,
            { $set: update },
            { new: true, runValidators: true }
        );

        res.status(200).json(main);
    } catch (err) {
        console.log("Error to update client main!", err);
        res.status(500).json({ error: err.message });
    }
}); */
// Update date and time
router.put('/:id/updateDate', async (req, res) => {
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
            {  $set: {[`onTime.${0}`]: dateUpdate}});

        await Recipient.findByIdAndUpdate(
            req.params.id,
            {
                created: new Date(req.body.year, req.body.month, req.body.day, req.body.hours, req.body.minutes),
                date: (req.body.month + 1) + "/" + req.body.day + "/" + req.body.year,
                created_ms: req.body.date_ms
            },
            { new: true}
        )

        res.status(200).json(data)
    } catch (err) {
        console.log("Error: " + err.message);
    }
})
// Add ordered provider id to ordered array
router.post('/:recipientId/addOrdered/:id', async (req, res) => {
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
router.put('/:id/pro/:proID', async (req, res) => {
    try {
        await Recipient.findOneAndUpdate(
            { _id: req.params.id },
            { $pull: {ordered: req.params.proID}}
        )
        res.send("Pro is removed!")
    } catch (err) {
        res.send("No pro is removed!").end()
    }
})
// Add offer
router.post('/:bookingID/offer/:id', async (req, res) => {
    const {bookingID, id} = req.params;
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
router.post('/:bookingId/confirmed', async (req, res) => {
    const { bookingId } = req.params;
    const body = req.body;
    try {
        const booking = await Recipient.findById(bookingId);
        booking.offer = body;
        await booking.save();
        res.send(booking);
    } catch (e) {
        console.log("Error - " + e.message);
    }
})
// Add provider id to recipient
router.put('/:id', async (req, res) => {
    try {
        const provider = await Recipient.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true}
        );

        res.status(200).json(provider)
    } catch (error) {
        res.send("Error to add provider!")
    }
})
// Add visitor
router.put('/:id/visitor', async (req, res) => {
    try {
        console.log("visitor " + req.body.visitor)
        const booking = await Recipient.findById(req.params.id);
        if(!booking.visitors.includes(req.body.visitor)) {
            booking.visitors = booking.visitors.concat(req.body.visitor);
        }

        await booking.save();

        res.send(booking);
    } catch (error) {
        console.log("Error: " + error.message);
    }

})
// Add images id to array
router.post('/:recipientId/addImage/:id', async (req, res) => {
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
// Add provider name
// router.put('/:id', async (req, res) => {
//     try {
//         const
//     }
// })

// Add feedBack given
router.put('/client/:id', async (req, res) => {
    try {
        const client = await Recipient.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true}
        )
        res.status(200).json(client);
    } catch (err) {
        res.send({error: err});
    }
})

// Edit description
router.put('/:id/description', async (req, res) => {
    try {
        const body = req.body;
        const updatedDescription = await Recipient.findByIdAndUpdate(
            req.params.id, body, { new: true }
        )

        res.status(200).json(updatedDescription.toJSON())
    } catch (err) {
        res.send({error: err})
    }
})

// Remove image id from array after image is deleted
router.delete('/:id/image/:imageId', async (req, res) => {
    try {
        await Recipient.findOneAndUpdate(
            { _id: req.params.id },
            { $pull: {image: req.params.imageId}}
        )
        res.send("Image is removed!")
    } catch (err) {
        res.send("No image is removed!").end()
    }
})
// Edit booking address
router.put('/:id/editBookingAddress', async (req, res) => {
    const body = req.body
    const params = req.params;

    try {
        const updated = await Recipient.findByIdAndUpdate(
            params.id, body, { new: true }
        )

        res.status(200).json(updated.toJSON())
    } catch (err) {
        console.log('Error: ', err)
        res.status({error: err})
    }
})
// Edit booking status
router.put('/:id', async (req, res) => {
    const body = req.body
    const params = req.params;

    try {
        const updated = await Recipient.findByIdAndUpdate(
            params.id, body, { new: true }
        )

        res.status(200).send(updated)     //.json(updated.toJSON())
    } catch (err) {
        console.log('Error: ', err)
    }
})

// Delete booking
router.delete('/:id', async (req, res) => {
    try {
        // const client = await Recipient.findById(req.params.id);
        
        await Recipient.findByIdAndDelete(req.params.id);
        res.send("Booking deleted!")
    } catch (err) {
        res.send({error: err.message})
    }
})

module.exports = router;