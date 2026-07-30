const mongoose = require("mongoose");

const translationSchema = require("./schemas/translationSchema.js");

const professionCategorySchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
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

const ProfessionCategory = mongoose.model(
    "ProfessionCategory",
    professionCategorySchema
);

module.exports = ProfessionCategory;