const admin = require("firebase-admin");
// Firebase Service Account 
// (Ensure backend/service-account.json is present)
process.env.FIREBASE_SERVICE_ACCOUNT_PATH = require('path').join(__dirname, '../service-account.json');

// Initialize Firebase Admin SDK
try {
  if (admin.apps.length === 0) {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (require('fs').existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin SDK initialized via service-account.json');
    } else {
        console.warn('⚠️ Service account file not found:', serviceAccountPath);
    }
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:', error.message);
}

module.exports = admin;
