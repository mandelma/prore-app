require('dotenv').config();

const mongoose = require('mongoose');

const Provider = require('../models/providers');
const User = require('../models/users');

const {
    connectDB,
    disconnectDB
} = require('../utils/database');

const deleteTestProvider = async () => {

    if (process.env.NODE_ENV !== 'test') {
        throw new Error(
            'Provider cleanup allowed only in test environment'
        );
    }

    const providerId = process.argv[2];
    const expectedUserId = process.argv[3];

    if (
        !mongoose.isValidObjectId(providerId) ||
        !mongoose.isValidObjectId(expectedUserId)
    ) {
        throw new Error('Invalid provider or user ID');
    }

    try {
        await connectDB();

        // Kontrollime testandmebaasi
        if (mongoose.connection.name !== 'prore_test_db') {
            throw new Error('Unsafe database');
        }

        // Leiame ajutise testkasutaja
        const user = await User.findById(expectedUserId);

        if (!user) {
            throw new Error('Test user not found');
        }

        // Kontrollime, et kasutaja vastab meie
        // ajutiste Playwrighti kasutajate mustrile
        if (
            !/^pw[a-f0-9]{32}$/.test(user.username) ||
            !/^pw[a-f0-9]{32}@example\.com$/.test(user.email)
        ) {
            throw new Error(
                'Not an allowed temporary test user'
            );
        }

        // Leiame ainult sellele kasutajale kuuluva profiili
        const provider = await Provider.findOne({
            _id: providerId,
            personId: user._id,
            user: user._id
        });

        if (!provider) {
            throw new Error(
                'Matching test provider not found'
            );
        }

        // Väldime seotud dokumentidega profiili kustutamist
        if (
            provider.timetable?.length ||
            provider.proposal?.length ||
            provider.reference?.length ||
            provider.room?.length
        ) {
            throw new Error(
                'Provider has related data; cleanup aborted'
            );
        }

        const result = await Provider.deleteOne({
            _id: provider._id,
            personId: user._id,
            user: user._id
        });

        if (result.deletedCount !== 1) {
            throw new Error(
                'Test provider was not deleted'
            );
        }

        console.log(
            'Test provider deleted:',
            provider.pName
        );

    } finally {
        await disconnectDB();
    }
};

deleteTestProvider().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});