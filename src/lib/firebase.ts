import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAXr0DerMBptWo754Q5ZUNx7gaS1l6whkY",
  authDomain: "chrome-anvil-w40ks.firebaseapp.com",
  projectId: "chrome-anvil-w40ks",
  storageBucket: "chrome-anvil-w40ks.firebasestorage.app",
  messagingSenderId: "30607474566",
  appId: "1:30607474566:web:ab63517ab7cb84dbdeb607"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
