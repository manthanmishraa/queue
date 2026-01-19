// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQAArtT7i1gWu3JI_MCMXyKaq-5tQZMlY",
  authDomain: "skipit-88950.firebaseapp.com",
  projectId: "skipit-88950",
  storageBucket: "skipit-88950.firebasestorage.app",
  messagingSenderId: "365717618360",
  appId: "1:365717618360:web:7cc24c121e309e07953e4d",
  measurementId: "G-WGRE7EVLDR"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Test Firebase connection
console.log('Firebase initialized successfully');
console.log('Project ID:', firebaseConfig.projectId);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Test Firestore connection
db.collection('test').add({ timestamp: new Date() })
  .then(() => console.log('Firestore connected successfully'))
  .catch(err => console.error('Firestore error:', err));

// Auth state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = {
      uid: user.uid,
      email: user.email,
      phone: user.phoneNumber,
      displayName: user.displayName
    };
    
    // Update UI for logged in user
    updateLoginButton();
    updateProfileInfo(user);
    
    console.log('User logged in:', user.email);
  } else {
    currentUser = null;
    
    // Reset UI for logged out user
    const loginBtn = document.querySelector('.nav-links .btn-primary');
    if (loginBtn) {
      loginBtn.textContent = 'Login';
      loginBtn.onclick = () => showAuthModal();
    }
    
    console.log('User logged out');
  }
});