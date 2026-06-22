import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAHcBLpG_b-zdkT7wacZfD4Dfde62m8IXU",
    authDomain: "ketnoifirebase-3a966.firebaseapp.com",
    projectId: "ketnoifirebase-3a966",
    storageBucket: "ketnoifirebase-3a966.firebasestorage.app",
    messagingSenderId: "851559898761",
    appId: "1:851559898761:web:0d0d79b1e0ce8f0d3e2fe0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
