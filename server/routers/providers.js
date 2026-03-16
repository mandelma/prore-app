const router = require('express').Router()
const Provider = require('../models/providers')
//const Offer = require("../models/calendarOffer");
const Recipient = require("../models/recipients");
//const User = require('../models/users')

const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const Upload = require("../models/awsUploads");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    // endpoint: `https://s3.${process.env.AWS_REGION}.amazonaws.com`,  // Explicitly set the endpoint
    forcePathStyle: true, // Ensures requests go to the correct endpoint
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

router.get('/', async(req, res) => {
    const providers = await Provider.find({})
    .populate('user')
    .populate('timetable')
    .populate('reference');
    res.send(providers)
})

router.get('/:id', async (req, res) => {
    const provider = await Provider.findOne({user: req.params.id})
        .populate('timetable')
        .populate('reference')
        //.populate('proposal')
        .populate('user')
        .populate({path: 'proposal', populate: {path: 'user'}})

        .populate({path: 'proposal', populate: {path: 'photos'}})
        .populate({path: 'proposal', populate: {path: 'offers', populate: {path: 'provider'}}})
        .populate({path: 'proposal', populate: {path: 'ordered'}})
        //
        // .populate({path: 'booking', populate: {path: 'image'}}).exec();


    //const provider = await Provider.findById(req.params.id)
    res.send(provider);
})

router.get('/:id/by-provider-id', async (req, res) => {
    const provider = await Provider.findOne({_id: req.params.id})
        //.populate('timeoffer')
        .populate('reference')
        .populate('user')
        .populate({path: 'proposal', populate: {path: 'user'}})
        .populate('timetable')
        //.populate({path: 'booking', populate: {path: 'image'}}).exec()

    //const provider = await Provider.findById(req.params.id)
    res.send(provider);
})
// Get providers matching by client decired profession
router.post('/profession',async (req, res) => {
    //const result = req.params.profession;
    try {
        console.log("In req.body " + req.body.result )

        const providers = await Provider.find({profession:{$in: req.body.result}})
            // .populate('reference')
            // .populate('timeoffer')
            .populate('user').exec();

            //.populate({path: 'timeoffer', populate: {path: 'user'}}).exec()

        res.send(providers)
    } catch (err) {
        res.send("Error!!!")
    }

})

router.post('/:id', async(req, res) =>{
    try {
        const body = req.body;
        //const user = await User.findById(req.params.id)
        // proTime: new Date().getTime() + (30 * 86400000),
        const provider = new Provider({
            pName: body.pName,
            created: new Date(),
            ide: body.ide,
            description: body.description,
            address: body.address,
            latitude: body.latitude,
            longitude: body.longitude,
            profession: body.profession,
            priceByHour: body.priceByHour,
            isAvailable24_7: body.isAvailable24_7,
            pro_link: body.proLink,
            //timeoffer: body.timeId,
            proTime: new Date().getTime() + (3 * 86400000),
            credit: 30,
            /* rating: {
                positive: 0,
                negative: 0,
                count: 0
            }, */
            range: body.range,
            user: req.params.id
        })
        const savedProvider = await provider.save()
        savedProvider.populate('user');
        res.json(savedProvider)
    } catch (exception) {
        console.log("Error in providers post: " + exception)
    }
})

router.post('/:id/booking', async(req, res) =>{
    try {
        const body = req.body;
        //const user = await User.findById(req.params.id)
        //const provider =
        const provider = new Provider({
            yritys: body.yritys,
            ytunnus: body.ytunnus,
            address: body.address,
            latitude: body.latitude,
            longitude: body.longitude,
            profession: body.profession,
            priceByHour: body.priceByHour,
            isAvailable24_7: body.isAvailable24_7,
            timeoffer: body.timeId,
            range: body.range,
            room: body.room,
            user: req.params.id
        })
        const savedProvider = await provider.save()
        res.json(savedProvider)
    } catch (exception) {
        console.log("Error in providers post: " + exception)
    }
})

// Update pro main from pro page
router.put('/:id/main-update', async(req, res) => {
    try {
        const updatedAt = await Provider.findByIdAndUpdate(
            req.params.id, req.body, {new: true}
        )

        res.send(updatedAt);
    } catch (err) {
        console.log("No pro updated date!")
        res.send({error: err.message})
    }
})

// Updating pro reference
router.put("/update-reference/:proId", async (req, res) => {
    try {
        const {
            reference,               // final photos list (ids or objects)
            removedPhotoIds, // ids to delete from Upload + S3
        } = req.body;


        console.log("Reference -- ", reference)
        console.log("Removed photo ids - ", removedPhotoIds);

        // 1) Normalize final photo ids (the ones to keep)
        const photoIds = Array.isArray(reference)
            ? reference
                .map(p => (typeof p === "string" ? p : (p.id ?? p.imageId)))
                .filter(Boolean)
            : [];

        // 2) Update provider first (remove references by overwriting final list)
        const update = {
            reference: photoIds,
        };

        const main = await Provider.findByIdAndUpdate(
            req.params.proId,
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!main) {
            return res.status(404).json({ error: "Provider not found" });
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


// Adding recipient to providers booking array
router.post('/:providerId/addRecipient/:id', async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.providerId);
        if (!provider.proposal.includes(req.params.id)) {
            provider.proposal = provider.proposal.concat(req.params.id);
            await provider.save();
            res.send("Recipient is added!")
        } else {
            res.send("Recipient not added!")
        }


    } catch (err) {
        console.log("Error: " + err.message)
    }
})

// Edit pro description
router.put('/:id/edit-portfolio', async (req, res) => {
    try {
        const editedPortfolio = await Provider.findByIdAndUpdate(
            req.params.id, req.body, {new: true}
        );
        res.send(editedPortfolio);
    } catch (err) {
        console.log("Error: " + err.message);
        res.status(500).send("No description is updated!")
    }

})

// Switch between available and not
router.put('/set-availability/:id', async (req, res) => {
    const body = req.body
    const params = req.params;

    try {
        const updated = await Provider.findByIdAndUpdate(
            params.id, body, { new: true }
        )

        res.status(200).json(updated.toJSON())
    } catch (err) {
        console.log('Error: ', err)
    }
})


router.put('/:id/feedback', async (req, res) => {
    const { star, content } = req.body
    const { id } = req.params

    const s = Number(star)
    if (!Number.isFinite(s) || s < 1 || s > 5) {
        return res.status(400).json({ error: 'star must be 1..5' })
    }

    const hasText =
        typeof content?.text === 'string' &&
        content.text.trim().length > 0

    try {
        const updatePipeline = [
            {
                $set: {
                    ratersCount: { $add: ['$ratersCount', 1] },
                    rating: {
                        $round: [
                            {
                                $divide: [
                                    { $add: [{ $multiply: ['$rating', '$ratersCount'] }, s] },
                                    { $add: ['$ratersCount', 1] }
                                ]
                            },
                            2
                        ]
                    },

                    // ONLY add feedback if text exists
                    ...(hasText && {
                        feedback: {
                            $concatArrays: [
                                { $ifNull: ['$feedback', []] },
                                [{
                                    date: content?.date
                                        ? new Date(content.date)
                                        : new Date(),
                                    sender: content?.sender ?? null,
                                    text: content.text.trim()
                                }]
                            ]
                        }
                    })
                }
            }
        ]

        const updated = await Provider.findByIdAndUpdate(
            id,
            updatePipeline,
            { new: true }
        )

        if (!updated)
            return res.status(404).json({ error: 'Provider not found' })

        res.json(updated)
    } catch {
        res.status(500).json({ error: 'Rating/feedback update failed' })
    }
})

// Add positive rating text to provider
router.put('/:id/rating-pos', async (req, res) => {
    const body = req.body;
    const params =req.params;

    try {
        const ratingUpdated = await Provider.findByIdAndUpdate(
            params.id,
            {
                $push: {
                    feedback: {

                        pos: body.pos


                    }
                }
            },
            { new: true }
        )

        res.status(200).json(ratingUpdated)      //.json(ratingUpdated)
    }catch (err) {
        console.log(err.message)
        res.send("Some error happened to make rating")
    }
})
router.put('/:id/rating-neg', async (req, res) => {
    const body = req.body;
    const params = req.params;

    try {
        const ratingUpdated = await Provider.findByIdAndUpdate(
            params.id,
            {
                $push: {
                    feedback: {

                        neg: body.neg


                    }
                }
            },
            { new: true }
        )

        res.status(200).json(ratingUpdated)      //.json(ratingUpdated)
    }catch (err) {
        console.log(err.message)
        res.send("Some error happened to make rating")
    }
})
// increase raters count
router.put('/:id/raters-count', async (req, res) => {
    try {
        const pro = await Provider.findById(req.params.id);
        const count = pro.ratersCount;
        const newRatersCount = {
            ratersCount: count + req.body.count
        }
        const editRatersCount = await Provider.findByIdAndUpdate(
            req.params.id, newRatersCount, {new: true}
        )
        res.send(editRatersCount);
    } catch (err) {
        console.log("Error: " + err.message);
        res.status(500).json({Error: "No raters count is increased!"})
    }
})
// Profession
// Add profession to providers array
router.post('/:id/addProfession', async (req, res) => {
    const params = req.params;
    const body = req.body;
    try {
        const provider = await Provider.findById(params.id)
        if (!provider.profession.includes(body.profession)) {
            provider.profession = provider.profession.concat(body.profession);
            await provider.save();
            res.send("Profession is added successfully!")
        } else {
            res.send("Profession already existing!")
        }
    } catch (err) {
        console.log("Error " + err.message)
        res.send("There is error to add profession!")
    }
})
// Edit profession in providers array
router.put('/:id/editProfession', async (req, res) => {
    const body = req.body;
    try {
        console.log("Index " + body.index)
        const { index } = req.body;
        const { pro } = req.body;

        const { id } = req.params;
        const data = await Provider.updateOne({ _id:id },
        {  $set: {[`profession.${index}`]: pro}});
        res.send(data);
    } catch (error) {
        res.send({error: error})
    }
})
// Update range
router.put('/:id/updateRange', async (req, res) => {
    try {
        const updatedRange = await Provider.findByIdAndUpdate(
            req.params.id, req.body, { new: true }
        )
        res.status(200).send(updatedRange);
    } catch (err) {
        console.log("Error " + err.message);
    }
})
// Update credit (days to use pro side)
router.put('/:id/renewCredit', async (req, res) => {
    try {
        console.log("Req body credit " + req.body)
        const creditRenew = await Provider.findByIdAndUpdate(
            req.params.id, req.body, { new: true }
        )
        res.status(200).send(creditRenew);
    } catch (err) {
        res.send({error: "No renewing succeeded!"})
    }
})
// Edit address
router.put('/:id/editAddress', async (req, res) => {
    const body = req.body
    const params = req.params;

    try {
        const updated = await Provider.findByIdAndUpdate(
            params.id, body, { new: true }
        )

        res.status(200).json(updated.toJSON())
    } catch (err) {
        console.log('Error: ', err)
        res.status({error: err})
    }
})
// Delete profession in providers's array
router.put('/:id/removeProfession', async (req, res) => {
    try {
        await Provider.findByIdAndUpdate(
            { _id:req.params.id },
            { $pull: {profession: req.body.profession }}
        )
        res.send("Profession is removed!")
    } catch (err) {
        res.send("No profession is deleted!").end()
    }
})

// Add a dialog room to provider room array
router.post('/:id/addRoom', async (req, res) => {
    const params = req.params;
    const body = req.body;
    try {
        // !provider.room.includes(body.room)
        const provider = await Provider.findById(params.id)
        if (!provider.room.some(pr => pr.client === body.client)) {
            provider.room = provider.room.concat({userID: body.userID, client: body.client, room: body.room});
            await provider.save();
            res.send("Room is added successfully!")
        } else {
            res.send("Room already existing!")
        }
    } catch (err) {
        console.log("Error " + err.message)
        res.send("There is error to add room!")
    }
})
// Add pro reference image id
/* router.post('/:id/addSlide', async (req, res) => {
    const params = req.params;
    const body = req.body;
    try {
        const provider = await Provider.findById(params.id)
        console.log("iodfoia " + params.id)
        console.log("TTTTTT " + body.slideID)
        provider.reference.push(body.slideID)
        //provider.reference = provider.reference.concat(body.slideID);
        await provider.save();
        res.send("Slide is added successfully!")

    } catch (err) {
        console.log("Error " + err.message)
        res.send("There is error to add slide!")
    }
}) */
// Remove room from provider
router.delete('/:id/remove-room', async (req,res) => {
    try {
        await Provider.findByIdAndUpdate(
            { _id:req.params.id },
            { $pull: {room: {userID: req.body.userID} }}
        )
        res.send("The room " + req.body.userID + " is removed")
    } catch (error) {
        res.send("There is error to remove room!")
    }
})
// Removes booking object id from array
router.put('/:id/recipient/:recipientId', async (req, res) => {
    try {
        await Provider.findOneAndUpdate(
            { _id: req.params.id },
            { $pull: {proposal: req.params.recipientId}}
        )
        res.send("Booking is removed!")
    } catch (err) {
        res.send("No booking is deleted!").end()
    }
})



module.exports = router