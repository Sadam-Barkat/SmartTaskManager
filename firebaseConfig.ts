import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBeiZs6_YHjmslv--GaT-JzKYXEcQYTOCk",
  authDomain: "smart-task-manager-78f98.firebaseapp.com",
  projectId: "smart-task-manager-78f98",
  storageBucket: "smart-task-manager-78f98.appspot.com",
  messagingSenderId: "759977827646",
  appId: "1:759977827646:web:dummyappid",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
