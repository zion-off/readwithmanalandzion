import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDgMoQ5YgQlASidvtqQ4G9eY5l2lIPWciI",
  authDomain: "essays-b32fd.firebaseapp.com",
  projectId: "essays-b32fd",
  storageBucket: "essays-b32fd.appspot.com",
  messagingSenderId: "366152957639",
  appId: "1:366152957639:web:7cb1918d4d89a56edd48e2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };