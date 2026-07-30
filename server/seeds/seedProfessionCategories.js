require("dotenv").config();

const mongoose = require("mongoose");

// "seed:profession-categories": "node seeds/seedProfessionCategories.js",

const ProfessionCategory = require("../models/professionCategory.js");
const categories = require("../data/professionCategories.js");

const seedProfessionCategories = async () => {
    const isProduction = process.env.NODE_ENV === "production";

    const getMongoUrl = () => {
        const mongoUrl = isProduction
            ? process.env.MONGODB_URL_PUBLIC
            : process.env.MONGODB_URL_LOCAL;

        if (!mongoUrl) {
            throw new Error(
                isProduction
                    ? "MONGODB_URL_PUBLIC environment variable is missing."
                    : "MONGODB_URL_LOCAL environment variable is missing."
            );
        }

        return mongoUrl;
    };

    const checkProductionPermission = () => {
        if (
            isProduction &&
            process.env.ALLOW_PRODUCTION_SEED !== "true"
        ) {
            throw new Error(
                "Production seeding is blocked. " +
                "Set ALLOW_PRODUCTION_SEED=true to continue."
            );
        }
    };
    try {
        checkProductionPermission();

        const mongoUrl = getMongoUrl();

        console.log(
            `Running profession seed in ${isProduction ? "production" : "development"
            } mode.`
        );

        await mongoose.connect(mongoUrl);

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

        console.log("Profession categories seeded successfully.");
    } catch (error) {
        console.error("Category seed failed:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seedProfessionCategories();