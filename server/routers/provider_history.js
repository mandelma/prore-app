const historyRouter = require('express').Router();
const pHistory = require('../models/provider_history');
const httpAuth = require('../middleware/httpAuth')

historyRouter.get('/', httpAuth, async (req, res) => {
    console.log("PRO ID ", req.user.id);
    const proHistory = await pHistory.find({user: req.user.id});
    res.send(proHistory);
});

historyRouter.post('/', async (req, res) => {
    const body = req.body;
    try {
        const proHistoryData = new pHistory({
            name: body.name,
            header: body.header,
            content: body.content,
            address: body.address,
            distance: body.distance,
            date: body.date,
            user: body.userID
        })
        await proHistoryData.save();
        res.status(200).send(proHistoryData);
    } catch (err) {
        console.log("Error: " + err.message);
    }
})

historyRouter.delete('/:id', async (req, res) => {
    try {
        console.log("Is deleting archive row?? " + req.params.id);
        await pHistory.findByIdAndDelete(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(500).send({error: err.message});
    }
})

module.exports = historyRouter;