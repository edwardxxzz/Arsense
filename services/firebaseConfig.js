import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA0BaBTJFRgX8dyn_1JMdEmmCodU6FxM6s",
  authDomain: "arsense-70f5b.firebaseapp.com",
  databaseURL: "https://arsense-70f5b-default-rtdb.firebaseio.com",
  projectId: "arsense-70f5b",
  storageBucket: "arsense-70f5b.firebasestorage.app",
  messagingSenderId: "614479752999",
  appId: "1:614479752999:web:ee73ced8c80da7290b0302",
  measurementId: "G-6082DGN2P9"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// EXPORTAÇÕES OBRIGATÓRIAS para o seu index reconhecer
export const auth = getAuth(app);
export const database = getDatabase(app);