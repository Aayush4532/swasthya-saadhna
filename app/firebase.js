import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyA8MxkmhSnJM7eJTY72IaigyKDy3FSN_ak",
  authDomain: "swasthyasaadhna.firebaseapp.com",
  projectId: "swasthyasaadhna",
  storageBucket: "swasthyasaadhna.firebasestorage.app",
  messagingSenderId: "854134399883",
  appId: "1:854134399883:web:4d074ab1b57968af78458e",
  measurementId: "G-51D7Z9M9EV"
};



const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export { app, analytics };