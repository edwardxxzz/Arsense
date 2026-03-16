import { initializeApp, getApps, getApp } from "firebase/app"; // Adicionei getApps e getApp
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAguzA0YUsAGUnx86Kx-V1mgmtaVrjDUqE",
  authDomain: "arsense-9f3a4.firebaseapp.com",
  databaseURL: "https://arsense-9f3a4-default-rtdb.firebaseio.com",
  projectId: "arsense-9f3a4",
  storageBucket: "arsense-9f3a4.firebasestorage.app",
  messagingSenderId: "211530848431",
  appId: "1:211530848431:web:48ac70f2b6abb86a199c5a",
  measurementId: "G-JTLZP99FW9"
};

// --- AJUSTE AQUI ---
// Se já existir um app inicializado, usa ele. Se não, inicializa com as novas configs.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);