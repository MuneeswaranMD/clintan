const admin = require("firebase-admin");
// const serviceAccount = require("../firebase-service-account.json"); // Commented out to prevent crash if file is missing

// Initialize Firebase Admin SDK
try {
  // Check if service account file exists or use environment variables
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else if (process.env.FIREBASE_PRIVATE_KEY) {
     admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        })
      });
  } else {
     // Fallback for local development if file is present at root
     try {
       const serviceAccount = require("../firebase-service-account.json");
       admin.initializeApp({
         credential: admin.credential.cert(serviceAccount),
       });
     } catch (e) {
       console.warn("⚠️ Firebase service account file not found and env vars not set.");
     }
  }

  console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:', error.message);
}

module.exports = admin;
