// backend/firebaseAdmin.js
const admin = require("firebase-admin");
let serviceAccount;

if (process.env.serviceAccountKey) {
  // Production (Render) - read from env
  serviceAccount = JSON.parse(process.env.serviceAccountKey);
} else {
  // Local development - read from file
  serviceAccount = require("./serviceAccountKey.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
