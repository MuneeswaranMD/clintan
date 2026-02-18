require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
        
        const users = await User.find({});
        console.log(`Found ${users.length} users.`);
        
        users.forEach(u => {
            console.log(`User: ${u.email}, Role: ${u.role}, FirebaseUID: ${u.firebaseUid || 'NULL'}, ID: ${u._id}`);
        });

        const superAdmin = await User.findOne({ role: 'superadmin' });
        if (superAdmin) {
            console.log('\nSuper Admin Found:', superAdmin.email);
        } else {
            console.log('\nNo Super Admin Found!');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
