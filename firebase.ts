import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase configuration
// You can find this in your Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyDeMl_Os6bvF1wlDin_ON_2EmpUY6kTmJ0",
  authDomain: "dayprinter.firebaseapp.com",
  projectId: "dayprinter",
  storageBucket: "dayprinter.firebasestorage.app",
  messagingSenderId: "1019501416560",
  appId: "1:1019501416560:web:bce923ef823264842524b5",
  measurementId: "G-TN1XJKP7J1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);