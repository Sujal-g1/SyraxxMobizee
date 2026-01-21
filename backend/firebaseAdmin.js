// backend/firebaseAdmin.js
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.serviceAccountKey);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
