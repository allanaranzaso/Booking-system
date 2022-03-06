import {FirebaseOptions, initializeApp } from 'firebase/app';
// import firebase from 'firebase-admin'
import {getAnalytics} from 'firebase/analytics';
import dotenv from 'dotenv';

dotenv.config();

const { FIREBASE_APIKEY, FIREBASE_AUTHDOMAIN,
        FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID,
        FIREBASE_MEASUREMENT_ID } = process.env;

const firebaseConfig: FirebaseOptions = {
    apiKey: FIREBASE_APIKEY as string,
    authDomain: FIREBASE_AUTHDOMAIN as string,
    projectId: FIREBASE_PROJECT_ID as string,
    storageBucket: FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID as string,
    appId: FIREBASE_APP_ID as string,
    measurementId: FIREBASE_MEASUREMENT_ID as string
}

// firebase.initializeApp(firebaseConfig);

const app = initializeApp(firebaseConfig);
getAnalytics();

export default app;