// Importa solo los módulos de Firebase que necesitas
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; // Para la base de datos (productos, carritos)
import { getAuth } from 'firebase/auth'; // Para autenticación (login, registro)
import { getStorage } from 'firebase/storage'; // Para subir imágenes (fotos de productos)
import { getAnalytics } from 'firebase/analytics'; // Opcional: para análisis

// Configuración de tu app de Firebase (esto lo copiaste de Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyCG_qXbdnlbUIa1QYkzkzto1L8SXFdLLN8",
  authDomain: "ecommerce-pc-parts.firebaseapp.com",
  projectId: "ecommerce-pc-parts",
  storageBucket: "ecommerce-pc-parts.firebasestorage.app",
  messagingSenderId: "153204523621",
  appId: "1:153204523621:web:4b1e4bde73cf058b6dfc8c",
  measurementId: "G-QJTMEYB4PD"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios que usarás en tu app
export const db = getFirestore(app); // Base de datos Firestore
export const auth = getAuth(app); // Autenticación
export const storage = getStorage(app); // Storage para imágenes
export const analytics = getAnalytics(app); // Analytics (opcional)