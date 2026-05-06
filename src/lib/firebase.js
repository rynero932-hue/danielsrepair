import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA8M824ef-YxYQhWTXhonBw4Cx2ILC5O0o",
  authDomain: "daniels--repair-center.firebaseapp.com",
  projectId: "daniels--repair-center",
  storageBucket: "daniels--repair-center.firebasestorage.app",
  messagingSenderId: "962096001168",
  appId: "1:962096001168:web:c37e6c3181c7ebcadba815",
  measurementId: "G-93J9WQGJF0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
