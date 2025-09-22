import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANFSpkaI8ESTluVrs93nxTzGm35p1t2sk",
  authDomain: "sphiria-auth.firebaseapp.com",
  projectId: "sphiria-auth",
  storageBucket: "sphiria-auth.firebasestorage.app",
  messagingSenderId: "847006696239",
  appId: "1:847006696239:web:eb880046cf87b0fd00d7da",
  measurementId: "G-L9TCDF8QGB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;