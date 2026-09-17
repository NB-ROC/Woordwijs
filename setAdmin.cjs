// Geeft een gebruiker de admin-rol.
// Gebruik: node setAdmin.cjs <email>
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const email = process.argv[2];
if (!email) {
  console.error("Gebruik: node setAdmin.cjs <email>");
  process.exit(1);
}

admin
  .auth()
  .getUserByEmail(email)
  .then(async (user) => {
    await admin.auth().setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
    console.log(`Admin rol ingesteld voor ${email} (${user.uid})`);
    process.exit();
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
