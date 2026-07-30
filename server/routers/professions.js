const express = require('express');
const professionRouter = express.Router();
const Profession = require('../models/professions');
const ProfessionCategory = require('../models/professionCategory');

professionRouter.get('/', async (req, res) => {
    const professions = await Profession.find({});
    const professionCategories = await ProfessionCategory.find({});

    res.send(
        {
            professionList: professions,
            categoryList: professionCategories
        }
    );
})

professionRouter.get('/:code', async (req, res) => {
    const profession = await Profession.find({code: req.params.code});
    
    res.send(profession);
})

module.exports = professionRouter;