const router = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/users');

router.get('/', async (req, res) => {
    const users = await User.find({})
    console.log("Users ", users)
    res.send(users)
})

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findOne({_id: req.params.id})
            .populate('messages');
        res.json(user);
    } catch (err) {
        res.send({error: err.message});
        console.log("Error: " + err.message);

    }
})

router.post('/', async (req, res) => {
    try {
        const body = req.body
        const saltRounds = 10
        if(body.password === undefined || body.password === ''){
            return res.status(400).json({Error: 'Password field should not to be empty!'}).end()
        }
        const passwordHash = await bcrypt.hash(body.password, saltRounds)

        const user = new User({
            // yritys: body.yritys,
            // ytunnus: body.ytunnus,
            // isAgreementAsClient: false,
            // isAgreementAsPro: false,
            created: new Date(),
            username: body.username,
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            avatar: {
                isImage: false,
                name: "avatar.png"
            },
            passwordHash
        })

        const existingUser = await User.findOne({username: body.username})
        const existingUserEmail = await User.findOne({email: body.email})

        if (existingUser) {
            res.json({error: "username existing"})
            console.log("Is user existing? " + existingUser)
        } else if (existingUserEmail) {
            res.json({error: "email existing"})
        }
        else {
            const savedUser = await user.save()
            console.log('saveduser: ', savedUser)
            res.json(savedUser)
        }

    }catch (exception) {
        console.log('Error: ', exception)
    }

});

module.exports = router;