const router = require('express').Router();
const Offer = require('../models/timetable')
const Provider = require('../models/providers')

router.get('/', async (req, res) => {
    const timeRanges = await Offer.find({});
    res.send(timeRanges);
})

router.post('/', async (req, res) => {
    try {
        const body = req.body;
        const timeRange = new Offer({
            timerange: {
                state: body.state,
                start: body.start,
                end: body.end
            }
        });
        const offered = await timeRange.save();
        res.json(offered);
    } catch (err) {
        console.log("Error: " + err.message);
    }
})

router.post('/:providerId', async (req,res) => {
    try {
        const { state, allDay, title, content, start, end } = req.body;

        console.log("Title - " + title);
        console.log("allDay - " + allDay);

        const provider = await Provider.findById(req.params.providerId);
        const additionalTimeRange = new Offer({
            /* timerange: {
                state: state,
                title: title,
                content: content,
                start: new Date(start),
                end: new Date(end)
            } */

            state: state,
            isAllDay: allDay,
            title: title,
            content: content,
            start: new Date(start),
            end: new Date(end)
        });
        const savedTimerange = await additionalTimeRange.save();

        provider.timetable = provider.timetable.concat(savedTimerange.id);
        provider.save();
        res.json(savedTimerange);

    } catch (err) {
        console.log("Error: " + err.message);
    }
})


router.delete('/:id/timeoffer/:timeId', async (req, res) => {
    try {
        await Provider.findOneAndUpdate(
            { _id: req.params.id },
            { $pull: { timetable: req.params.timeId } }
        )
        await Offer.findByIdAndDelete(req.params.timeId)

        res.status(204).end()
    } catch (err) {
        console.log('Error:', err)
    }
})

router.put('/:id', async (req, res) => {
    const body = req.body
    //const params = req.params;
    console.log("---- " + body.start)
    try {
        const updated = await Offer.findByIdAndUpdate(
            req.params.id, body, { new: true }
        )

        res.status(200).json(updated.toJSON())
    } catch (err) {
        console.log('Error: ', err)
    }
})

module.exports = router;