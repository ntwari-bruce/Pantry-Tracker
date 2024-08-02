// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDayDferJLiJRB44KXTfy2rdI0qj_NeHPs",
  authDomain: "pantry-tracker-d54ef.firebaseapp.com",
  projectId: "pantry-tracker-d54ef",
  storageBucket: "pantry-tracker-d54ef.appspot.com",
  messagingSenderId: "437539259954",
  appId: "1:437539259954:web:5c7d5de328e60b4f725e2b",
  measurementId: "G-2F5MHC6M2Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
export {firestore}
let analytics;
if (typeof window !== 'undefined') {
  // Only initialize analytics in a client-side environment
  analytics = getAnalytics(app);
}
