// // backend/firebaseAdmin.js
// const admin = require("firebase-admin");
// let serviceAccount;

// if (process.env.serviceAccountKey) {
//   // Production (Render) - read from env
//   serviceAccount = JSON.parse(process.env.serviceAccountKey);
// } else {
//   // Local development - read from file
//   serviceAccount = require("./serviceAccountKey.json");
// }

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// module.exports = admin;


// backend/firebaseAdmin.js
const admin = require("firebase-admin");

let serviceAccount;

if (process.env.SERVICE_ACCOUNT_BASE64) {
  try {
    const decoded = Buffer.from(
      process.env.SERVICE_ACCOUNT_BASE64,
      "base64"
    ).toString("utf8");

    serviceAccount = JSON.parse(decoded);
    console.log("🔥 Service account loaded from BASE64 env");

  } catch (err) {
    console.error("❌ Failed to decode SERVICE_ACCOUNT_BASE64:", err.message);
    throw err;
  }
} else {
  // Local development fallback
  serviceAccount = require("./serviceAccountKey.json");
  console.log("🔥 Service account loaded from local file");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
