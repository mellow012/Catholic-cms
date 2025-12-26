// scripts/set-super-admin-direct.js
const admin = require('firebase-admin');

// Load service account key
try {
  const serviceAccount = require('../service-account-key.json');
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error) {
  console.error('❌ Could not load service-account-key.json');
  console.error('📥 Download it from: Firebase Console > Project Settings > Service Accounts > Generate new private key');
  console.error('💾 Save it as: service-account-key.json in your project root');
  process.exit(1);
}

// !!! CHANGE THIS TO YOUR EMAIL !!!
const EMAIL = 'wiz116mlambia@gmail.com';

async function setSuperAdmin() {
  try {
    console.log(`\n🔍 Looking for user: ${EMAIL}\n`);
    
    // Get user by email
    const user = await admin.auth().getUserByEmail(EMAIL);
    console.log(`✅ Found user!`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Display Name: ${user.displayName || 'Not set'}\n`);
    
    // Set custom claims
    console.log(`⚙️  Setting custom claims...`);
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'ECM_SUPER_ADMIN',
      clearanceLevel: 'ecm',
    });
    
    console.log(`✅ Custom claims set successfully!\n`);
    
    // Update Firestore user document
    console.log(`⚙️  Updating Firestore user document...`);
    await admin.firestore().collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || EMAIL.split('@')[0],
      role: 'ECM_SUPER_ADMIN',
      clearanceLevel: 'ecm',
      approved: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    console.log(`✅ Firestore document updated!\n`);
    
    console.log(`🎉 SUCCESS! ${EMAIL} is now an ECM_SUPER_ADMIN\n`);
    console.log(`⚠️  NEXT STEPS:`);
    console.log(`   1. Sign out from your app`);
    console.log(`   2. Sign back in with ${EMAIL}`);
    console.log(`   3. Your token will now have ECM_SUPER_ADMIN role\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.error('\n💡 This user does not exist. Please:');
      console.error('   1. Sign up at: http://localhost:3000/auth/sign-up');
      console.error('   2. Then run this script again\n');
    }
    
    process.exit(1);
  }
}

setSuperAdmin();