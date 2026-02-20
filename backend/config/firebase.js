const admin = require("firebase-admin");
// Firebase Service Account 
// (Ensure backend/service-account.json is present)
process.env.FIREBASE_SERVICE_ACCOUNT_PATH = require('path').join(__dirname, '../service-account.json');

// Initialize Firebase Admin SDK
try {
  if (admin.apps.length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
        // Sanitize Private Key: Handle missing headers and literal newlines
        let formattedKey = privateKey;
        if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
            formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}`;
        }
        if (!formattedKey.includes('-----END PRIVATE KEY-----')) {
            formattedKey = `${formattedKey}\n-----END PRIVATE KEY-----\n`;
        }
        
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: formattedKey,
            }),
        });
        console.log('✅ Firebase Admin SDK initialized via environment variables');
    } else {
        const serviceAccountPath = require('path').join(__dirname, '../service-account.json');
        if (require('fs').existsSync(serviceAccountPath)) {
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('✅ Firebase Admin SDK initialized via service-account.json');
        } else {
            console.warn('⚠️ Firebase initialization skipped: No environment variables or service-account.json found');
        }
    }
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:', error.message);
}

module.exports = admin;
