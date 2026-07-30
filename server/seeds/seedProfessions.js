const fs = require("node:fs/promises");
const path = require("node:path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Profession = require("../models/professions");

dotenv.config();

// npm run seed:professions

// **Powershell**
// $env: NODE_ENV = "production"
// $env: ALLOW_PRODUCTION_SEED = "true"
// npm run seed:professions

// Remove - Item Env: ALLOW_PRODUCTION_SEED
// Remove - Item Env: NODE_ENV

const professionsDirectory = path.resolve(
    __dirname,
    "../data/professions"
);

const fieldSetsDirectory = path.resolve(
    __dirname,
    "../data/fieldsets"
);

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

const readJsonFile = async (filePath) => {
    try {
        const fileContent = await fs.readFile(filePath, "utf8");

        return JSON.parse(fileContent);
    } catch (error) {
        throw new Error(
            `Failed to read JSON file "${filePath}": ${error.message}`
        );
    }
};

const getJsonFilesRecursively = async (directoryPath) => {
    const directoryEntries = await fs.readdir(directoryPath, {
        withFileTypes: true
    });

    const files = [];

    for (const entry of directoryEntries) {
        const entryPath = path.join(directoryPath, entry.name);

        if (entry.isDirectory()) {
            const nestedFiles =
                await getJsonFilesRecursively(entryPath);

            files.push(...nestedFiles);
            continue;
        }

        if (
            entry.isFile() &&
            path.extname(entry.name).toLowerCase() === ".json"
        ) {
            files.push(entryPath);
        }
    }

    return files;
};

const validateCustomField = (
    field,
    sourceName = "unknown source"
) => {
    if (!field || typeof field !== "object") {
        throw new Error(
            `Invalid custom field in ${sourceName}.`
        );
    }

    if (!field.key || typeof field.key !== "string") {
        throw new Error(
            `Custom field is missing a valid "key" in ${sourceName}.`
        );
    }

    if (!field.type || typeof field.type !== "string") {
        throw new Error(
            `Custom field "${field.key}" is missing a valid "type" in ${sourceName}.`
        );
    }

    if (!field.label || typeof field.label !== "object") {
        throw new Error(
            `Custom field "${field.key}" is missing "label" translations in ${sourceName}.`
        );
    }
};

const validateProfession = (
    profession,
    sourceName = "unknown profession"
) => {
    if (!profession || typeof profession !== "object") {
        throw new Error(
            `Invalid profession data in ${sourceName}.`
        );
    }

    if (
        !profession.code ||
        typeof profession.code !== "string"
    ) {
        throw new Error(
            `Profession is missing a valid "code" in ${sourceName}.`
        );
    }

    if (
        !profession.categoryCode ||
        typeof profession.categoryCode !== "string"
    ) {
        throw new Error(
            `Profession "${profession.code}" is missing "categoryCode".`
        );
    }

    if (
        !profession.name ||
        typeof profession.name !== "object"
    ) {
        throw new Error(
            `Profession "${profession.code}" is missing name translations.`
        );
    }

    if (
        profession.fieldSets !== undefined &&
        !Array.isArray(profession.fieldSets)
    ) {
        throw new Error(
            `Profession "${profession.code}" fieldSets must be an array.`
        );
    }

    if (
        profession.customFields !== undefined &&
        !Array.isArray(profession.customFields)
    ) {
        throw new Error(
            `Profession "${profession.code}" customFields must be an array.`
        );
    }
};

const loadFieldSet = async (fieldSetCode) => {
    const fieldSetFilePath = path.join(
        fieldSetsDirectory,
        `${fieldSetCode}.json`
    );

    const fieldSet = await readJsonFile(fieldSetFilePath);

    if (!fieldSet.code) {
        throw new Error(
            `Fieldset "${fieldSetCode}" is missing its "code".`
        );
    }

    if (fieldSet.code !== fieldSetCode) {
        throw new Error(
            `Fieldset filename "${fieldSetCode}.json" does not match code "${fieldSet.code}".`
        );
    }

    if (!Array.isArray(fieldSet.customFields)) {
        throw new Error(
            `Fieldset "${fieldSetCode}" must contain a customFields array.`
        );
    }

    for (const field of fieldSet.customFields) {
        validateCustomField(
            field,
            `fieldset "${fieldSetCode}"`
        );
    }

    return fieldSet;
};

const mergeCustomFields = (
    fieldSetFields,
    professionFields,
    professionCode
) => {
    const fieldsByKey = new Map();

    /*
     * Fieldset fields are added first.
     */
    for (const field of fieldSetFields) {
        fieldsByKey.set(field.key, field);
    }

    /*
     * Profession-specific fields are added afterwards.
     *
     * If the profession contains the same key as a fieldset,
     * the profession-specific definition overrides the fieldset.
     */
    for (const field of professionFields) {
        validateCustomField(
            field,
            `profession "${professionCode}"`
        );

        const existingField = fieldsByKey.get(field.key);

        fieldsByKey.set(
            field.key,
            existingField
                ? {
                    ...existingField,
                    ...field,
                    validation: {
                        ...(existingField.validation || {}),
                        ...(field.validation || {})
                    }
                }
                : field
        );
    }

    return [...fieldsByKey.values()].sort(
        (firstField, secondField) =>
            (firstField.order ?? 0) -
            (secondField.order ?? 0)
    );
};

const buildProfessionDocument = async (
    professionData,
    professionFilePath
) => {
    validateProfession(
        professionData,
        professionFilePath
    );

    const fieldSetCodes = professionData.fieldSets || [];
    const fieldSetFields = [];

    for (const fieldSetCode of fieldSetCodes) {
        const fieldSet = await loadFieldSet(fieldSetCode);

        fieldSetFields.push(...fieldSet.customFields);
    }

    const customFields = mergeCustomFields(
        fieldSetFields,
        professionData.customFields || [],
        professionData.code
    );

    /*
     * fieldSets can be retained in MongoDB for reference.
     * They are not required for rendering the form because
     * customFields already contains the merged result.
     */
    return {
        ...professionData,
        fieldSets: fieldSetCodes,
        customFields
    };
};

const seedProfession = async (professionFilePath) => {
    const professionData =
        await readJsonFile(professionFilePath);

    const professionDocument =
        await buildProfessionDocument(
            professionData,
            professionFilePath
        );

    const savedProfession =
        await Profession.findOneAndUpdate(
            {
                code: professionDocument.code
            },
            {
                $set: professionDocument
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

    console.log(
        `Saved profession: ${savedProfession.code} ` +
        `(${savedProfession.customFields.length} custom fields)`
    );

    return savedProfession;
};

const seedProfessions = async () => {
    try {
        checkProductionPermission();

        const mongoUrl = getMongoUrl();

        console.log(
            `Running profession seed in ${isProduction ? "production" : "development"
            } mode.`
        );

        await mongoose.connect(mongoUrl);

        console.log("MongoDB connected.");

        const professionFiles =
            await getJsonFilesRecursively(
                professionsDirectory
            );

        if (!professionFiles.length) {
            console.log(
                "No profession JSON files were found."
            );

            return;
        }

        let savedCount = 0;
        let failedCount = 0;

        for (const professionFile of professionFiles) {
            try {
                await seedProfession(professionFile);
                savedCount += 1;
            } catch (error) {
                failedCount += 1;

                console.error(
                    `Failed to seed "${professionFile}":`,
                    error.message
                );
            }
        }

        console.log("--------------------------------");
        console.log(`Profession files found: ${professionFiles.length}`);
        console.log(`Successfully saved: ${savedCount}`);
        console.log(`Failed: ${failedCount}`);

        if (failedCount > 0) {
            process.exitCode = 1;
        }
    } catch (error) {
        console.error(
            "Profession seed failed:",
            error.message
        );

        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log("MongoDB disconnected.");
        }
    }
};

seedProfessions();