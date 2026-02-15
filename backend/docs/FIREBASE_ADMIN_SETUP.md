# 🔥 How to Get Firebase Admin SDK Credentials

## ⚠️ Important Note

The Firebase config you shared is for the **web app** (frontend). 
For the **backend**, we need **Firebase Admin SDK** credentials (service account).

---

## 📋 Step-by-Step Instructions

### Step 1: Go to Firebase Console
Visit: https://console.firebase.google.com/project/clintan/settings/serviceaccounts/adminsdk

### Step 2: Generate Private Key
1. You'll see "Firebase Admin SDK" section
2. Click the **"Generate new private key"** button
3. A popup will warn you to keep it secure
4. Click **"Generate key"**
5. A JSON file will download (e.g., `clintan-firebase-adminsdk-xxxxx.json`)

### Step 3: Open the Downloaded JSON File
It will look like this:

```json
{
  "type": "service_account",
  "project_id": "clintan",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@clintan.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

### Step 4: Copy These 3 Values to `.env`

From the JSON file, copy:

1. **project_id** → `FIREBASE_PROJECT_ID`
2. **private_key** → `FIREBASE_PRIVATE_KEY` (keep the \n characters!)
3. **client_email** → `FIREBASE_CLIENT_EMAIL`

Example:
```env
FIREBASE_PROJECT_ID=clintan
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@clintan.iam.gserviceaccount.com
```

---

## ⚡ Quick Alternative (If You Can't Find It)

If you have trouble finding the service account page, I can create the backend files to work with just the web config for now, but you'll need the Admin SDK eventually for production.

---

## 🔒 Security Warning

**NEVER commit the service account JSON file or private key to GitHub!**

The `.env` file is already in `.gitignore`, so it's safe.

---

Once you have these credentials, update the `.env` file and we can proceed with creating all the service files!
