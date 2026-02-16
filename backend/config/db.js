const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGODB_DB_NAME || 'averqon',
        });

        console.log(`\n🍃 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`\n❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
