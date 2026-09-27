import appletConfig from '@/../firebase-applet-config.json';

export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || appletConfig.projectId || "virasya-marketplace",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || appletConfig.appId || "1:761158011637:web:3b0ce3769bd7b33dc2d3bc",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || appletConfig.apiKey || "AIzaSyDyShIPE9ZMAnhav2kZHDL3t7AkmEBnu4w",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || "virasya-marketplace.firebaseapp.com",
  firestoreDatabaseId: (appletConfig as any).firestoreDatabaseId || "(default)",
  storageBucket: (appletConfig as any).storageBucket || "virasya-marketplace.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || "761158011637",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || appletConfig.measurementId || "G-EMFKVE1RQW",
};
