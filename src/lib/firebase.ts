
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDMJfqwdO17KOL-4V0LrWb1_Zxh71zMO8I",
    authDomain: "clarityclinic-961eb.firebaseapp.com",
    projectId: "clarityclinic-961eb",
    storageBucket: "clarityclinic-961eb.appspot.com",
    messagingSenderId: "227618481237",
    appId: "1:227618481237:web:0302007bd007990ad760dc",
    measurementId: "G-0C3XEGX1T5"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Function to check if the default config is still being used
const isDefaultConfig = () => {
    return firebaseConfig.apiKey.startsWith("REPLACE_WITH");
}

// Conditionally export db. If the config is default, export null.
export const dbOrNull = isDefaultConfig() ? null : db;

export { app, db };
