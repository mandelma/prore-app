const mongoose = require('mongoose');
//import mongoose from "mongoose";

const translationSchema = new mongoose.Schema(
    {
        fi: {
            type: String,
            trim: true,
            default: ""
        },

        en: {
            type: String,
            trim: true,
            default: ""
        },

        sv: {
            type: String,
            trim: true,
            default: ""
        },

        et: {
            type: String,
            trim: true,
            default: ""
        },

        ru: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        _id: false
    }
);

module.exports = translationSchema;