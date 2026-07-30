const mongoose = require('mongoose');

const translationSchema = require('./schemas/translationSchema.js');
const customFieldSchema = require('./schemas/customFieldSchema.js');

const professionSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },

        categoryCode: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true
        },

        name: {
            type: translationSchema,
            required: true
        },

        description: {
            type: translationSchema,
            default: () => ({})
        },

        icon: {
            type: String,
            default: ""
        },

        customFields: {
            type: [customFieldSchema],
            default: []
        },

        enabled: {
            type: Boolean,
            default: true
        },

        sortOrder: {
            type: Number,
            default: 0
        },

        countries: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Profession = mongoose.model(
    "Profession",
    professionSchema
);

module.exports = Profession;