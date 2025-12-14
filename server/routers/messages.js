const router = require('express').Router();
//import express_router from 'express';
//const router = express_router.Router();

const Message = require('../models/messages')
//const Provider = require("../models/providers");

router.get('/', async (req, res) => {
    const messages = await Message.find({});
    res.send(messages)
})

router.get('/:room', async (req, res) => {
    const roomMessages = await Message.find({room: req.params.room});
    res.send(roomMessages);
})

router.put('/:id', async (req, res) => {
    const body = req.body
    const params = req.params;

    try {
        const updated = await Message.findByIdAndUpdate(
            params.id, body, { new: true }
        )

        //res.status(200).json(updated.toJSON())
        res.send(updated);
    } catch (err) {
        console.log('Error: ', err)
    }
})
router.delete('/:room', async (req, res) => {
    const { room } = req.params;
    console.log("Room in conversation " + room);
    try {
        await Message.deleteMany({room: room});
        res.status(204).end()
    } catch (err) {
        console.log('Error:', err)
        res.send("Error to delete chat messages!")
    }
})

module.exports = router;