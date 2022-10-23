import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAn94Cjrxa3SFIFLjkwPWLWnagkH02SJRU",
  authDomain: "bars-test-de972.firebaseapp.com",
  projectId: "bars-test-de972",
  storageBucket: "bars-test-de972.appspot.com",
  messagingSenderId: "1071230896866",
  appId: "1:1071230896866:web:9fd2088a7d9e5b7dceacbb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);