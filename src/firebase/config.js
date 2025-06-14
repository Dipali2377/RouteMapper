import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  databaseURL: "https://masai-c67d3-default-rtdb.firebaseio.com",
  apiKey: "AIzaSyC0tQrRwqiAwTjCLsYCyxOgOAXqDhnSPQI",
  authDomain: "masai-c67d3.firebaseapp.com",
  projectId: "masai-c67d3",
  storageBucket: "masai-c67d3.firebasestorage.app",
  messagingSenderId: "1083667341599",
  appId: "1:1083667341599:web:fbeba85c54e82a0405d02a",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;
