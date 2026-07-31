const mongoose = require('mongoose');
const translationSchema = require('./translationSchema.js');

const customFieldOptionSchema = new mongoose.Schema(
    {
        value: {
            type: String,
            required: true,
            trim: true
        },

        label: {
            type: translationSchema,
            required: true
        }
    },
    {
        _id: false
    }
);

const customFieldSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            required: true,
            enum: [
                "text",
                "textarea",
                "number",
                "boolean",
                "select",
                "multiselect",
                "checkbox",
                "date"
            ]
        },

        label: {
            type: translationSchema,
            required: true
        },

        placeholder: {
            type: translationSchema,
            default: () => ({})
        },

        required: {
            type: Boolean,
            default: false
        },

        order: {
            type: Number,
            default: 0
        },

        options: {
            type: [customFieldOptionSchema],
            default: []
        },

        validation: {
            min: {
                type: Number
            },

            max: {
                type: Number
            },

            minLength: {
                type: Number
            },

            maxLength: {
                type: Number
            },

            regex: {
                type: String
            }
        },

        helpText: {
            type: translationSchema,
            default: () => ({})
        },

        enabled: {
            type: Boolean,
            default: true
        }
    },
    {
        _id: false
    }
);


module.exports = customFieldSchema;