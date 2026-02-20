const admin = require('../config/firebase');

async function listUsers() {
    try {
        const listUsersResult = await admin.auth().listUsers(1000);
        console.log('--- USER LIST ---');
        listUsersResult.users.forEach((userRecord) => {
            console.log(`UID: ${userRecord.uid} | Email: ${userRecord.email} | Name: ${userRecord.displayName}`);
        });
        console.log('-----------------');
        process.exit(0);
    } catch (error) {
        console.log('Error listing users:', error);
        process.exit(1);
    }
}

listUsers();
