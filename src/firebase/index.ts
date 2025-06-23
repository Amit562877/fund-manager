import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCmgQaT9He3rgzWsi98PBkOpKnETxqwrMY",
    authDomain: "fund-collector.firebaseapp.com",
    projectId: "fund-collector",
    storageBucket: "fund-collector.firebasestorage.app",
    messagingSenderId: "889153915092",
    appId: "1:889153915092:web:8cd57ccd8767614e129341",
    measurementId: "G-2KLR01TRMJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);