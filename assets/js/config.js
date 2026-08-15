// Firebase Web SDK configuration (client-side config values are safe to expose publicly;
// access is controlled via Firestore security rules, same as in the original app).
export const firebaseConfig = {
  apiKey: "AIzaSyBhojEdLH77CS7WwsKjmeQlW_pxcwgq9m4",
  authDomain: "cuttingforge-fde16.firebaseapp.com",
  projectId: "cuttingforge-fde16",
  storageBucket: "cuttingforge-fde16.firebasestorage.app",
  messagingSenderId: "199688593142",
  appId: "1:199688593142:web:8655117bbce1e6e32b16d7",
  measurementId: "G-ZH9NGYDR12",
};

console.log("Firebase config:", firebaseConfig);

// Unsigned Cloudinary upload preset (safe to expose publicly for client-side uploads).
export const cloudinaryConfig = {
  cloudName: "y8hacgwv",
  uploadPreset: "laser_cutting",
};
