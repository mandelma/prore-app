const router = require('express').Router()
const Provider = require('../models/providers')
//const Offer = require("../models/calendarOffer");
const Recipient = require("../models/recipients");
//const User = require('../models/users')

router.get('/', async(req, res) => {
    const providers = await Provider.find({}).populate('user').populate('timetable');
    res.send(providers)
})

router.get('/:id', async (req, res) => {
    const provider = await Provider.findOne({user: req.params.id})
        .populate('timetable')
        // .populate('reference')
        //.populate('proposal')
        .populate('user')
        .populate({path: 'proposal', populate: {path: 'user'}})


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
        //.populate('booking')
        .populate('user')
        .populate({path: 'proposal', populate: {path: 'user'}})
        .populate({timetable})
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
            proTime: new Date().getTime() + (86400000),
            credit: 30,
            rating: {
                positive: 0,
                negative: 0,
                count: 0
            },
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
// Set positive rating number for provider
router.put('/:id/rating-plus', async (req, res) => {
    const body = req.body;
    const params = req.params;
    try {
        const provider = await Provider.findById(params.id)
        //const rating = provider[0].rating
        //const positive = rating.positive + 1
        console.log("Positive.. " + provider.rating.positive)
        const update = {
            rating: {
                positive: provider.rating.positive += body.star,
                negative: provider.rating.negative,
                count: provider.rating.count += 1
            }
        }
        /*const update = {
            rating: {
                positive: 9
            }
        }*/
        const ratingPlus = await Provider.findByIdAndUpdate(
            params.id, update, {new: true}

        )
        // "rating.positive": 5
        res.status(200).json(ratingPlus)
    } catch (err) {
        res.send("Rating positive error!")
    }
})
// Set negative rating number for provider
router.put('/:id/rating-minus', async (req, res) => {
    const body = req.body;
    const params = req.params;
    try {
        const provider = await Provider.findById(params.id)
        //const rating = provider[0].rating
        //const positive = rating.positive + 1
        console.log("Negative.. " + provider.rating.negative)
        const update = {
            rating: {
                positive: provider.rating.positive,
                negative: provider.rating.negative + 1
            }
        }

        const ratingPlus = await Provider.findByIdAndUpdate(
            params.id, update, {new: true}

        )
        // "rating.positive": 5
        res.status(200).json(ratingPlus)
    } catch (err) {
        res.send("Rating positive error!")
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
router.post('/:id/addSlide', async (req, res) => {
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
})
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