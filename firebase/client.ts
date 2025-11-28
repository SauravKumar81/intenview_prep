// Import the functions you need from the SDKs you need
import { getFirestore } from "firebase/firestore";
import { initializeApp,getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAcXlRCG2L4f747qeFO-NhUyt1qZ1pYWwg",
  authDomain: "inter-prep-b00d3.firebaseapp.com",
  projectId: "inter-prep-b00d3",
  storageBucket: "inter-prep-b00d3.firebasestorage.app",
  messagingSenderId: "127798290662",
  appId: "1:127798290662:web:6108d0a7bee620e602b327",
  measurementId: "G-F0LFVFF0WS"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig): getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);