import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHkerxgf1eoeAngeQpUnQ5bQSowOlhu34",
  authDomain: "revise-28ce3.firebaseapp.com",
  projectId: "revise-28ce3",
  storageBucket: "revise-28ce3.firebasestorage.app",
  messagingSenderId: "689481888988",
  appId: "1:689481888988:web:9a8e42288c4d82cd67f019",
  measurementId: "G-MENS22L4RN"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
