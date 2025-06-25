
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClH1bax8tkuM7o5qF5LPAEkkRpRb7BueY",
  authDomain: "fund-manager-46bba.firebaseapp.com",
  projectId: "fund-manager-46bba",
  storageBucket: "fund-manager-46bba.firebasestorage.app",
  messagingSenderId: "472137422483",
  appId: "1:472137422483:web:596a47c81a3d6db4315f66",
  measurementId: "G-FFZ81Z7YZ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);