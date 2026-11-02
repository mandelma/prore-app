require("dotenv").config();

const mongoose = require("mongoose");

const {
    connectDB,
    disconnectDB
} = require("../utils/database");

const ProfessionCategory = require("../models/professionCategory.js");

const categories = require("../data/professionCategories.js");

const seedProfessionCategories = async () => {

    const isProduction = process.env.NODE_ENV === "production";

    try {

        // Kaitse tootmisandmebaasi jaoks
        if (
            isProduction &&
            process.env.ALLOW_PRODUCTION_SEED !== "true"
        ) {
            throw new Error(
                "Production seeding is blocked. " +
                "Set ALLOW_PRODUCTION_SEED=true to continue."
            );
        }

        // Ühendame õige andmebaasiga
        await connectDB();

        console.log(
            `Seeding profession categories (${process.env.NODE_ENV})`
        );

        // Lisame või uuendame kategooriad
        for (const category of categories) {

            await ProfessionCategory.findOneAndUpdate(
                {
                    code: category.code
                },
                {
                    $set: category
                },
                {
                    upsert: true,
                    new: true,
                    runValidators: true
                }
            );

            console.log(`Category saved: ${category.code}`);
        }

        console.log(
            "Profession categories seeded successfully."
        );

    } catch (error) {

        console.error(
            "Category seed failed:",
            error.message
        );

        process.exitCode = 1;

    } finally {

        if (mongoose.connection.readyState !== 0) {
            await disconnectDB();
        }
    }
};

seedProfessionCategories();