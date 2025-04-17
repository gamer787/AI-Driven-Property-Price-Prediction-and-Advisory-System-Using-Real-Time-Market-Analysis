import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLGOaygi9Dm6rn8q6dFG01Qo_Oz0VMjJw",
  authDomain: "real-ai-app.firebaseapp.com",
  projectId: "real-ai-app",
  storageBucket: "real-ai-app.firebasestorage.app",
  messagingSenderId: "43755461605",
  appId: "1:43755461605:web:cf5d09eb690f903ea86d0c",
  measurementId: "G-9QHZ1XHC1Y"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);