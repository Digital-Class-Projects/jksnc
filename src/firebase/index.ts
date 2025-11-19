
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';
import { firebaseConfig } from './config';

import {
    useAuth,
    useFirebase,
    useFirebaseApp,
    useDatabase,
    FirebaseProvider,
} from './provider';

import { FirebaseClientProvider } from './client-provider';

let firebaseApp: FirebaseApp;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

function initializeFirebase() {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const database = getDatabase(app);
    return { firebaseApp: app, auth, database };
}

export {
    initializeFirebase,
    FirebaseProvider,
    FirebaseClientProvider,
    useFirebase,
    useFirebaseApp,
    useDatabase,
    useAuth
};
