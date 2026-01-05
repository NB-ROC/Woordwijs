const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = "7hcrhaG0mTcbYoBgKf1aKjlFu632"; 

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log("Admin rol ingesteld!");
    process.exit();
  })
  .catch(console.error);
