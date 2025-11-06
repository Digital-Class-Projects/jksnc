
'use client';

import {
  type FirebaseApp,
} from 'firebase/app';
import {
  type Auth,
} from 'firebase/auth';
import {
  type Database,
} from 'firebase/database';
import { createContext, useContext } from 'react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

type FirebaseContextValue = {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  database: Database | null;
};

const FirebaseContext = createContext<FirebaseContextValue>({
  firebaseApp: null,
  auth: null,
  database: null,
});

export function FirebaseProvider({
  children,
  firebaseApp,
  auth,
  database,
}: {
  children: React.ReactNode;
  firebaseApp: FirebaseApp;
  auth: Auth;
  database: Database;
}) {
  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth, database }}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebaseApp() {
  const { firebaseApp } = useContext(FirebaseContext);
  if (!firebaseApp) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return firebaseApp;
}

export function useAuth() {
  const { auth } = useContext(FirebaseContext);
  if (!auth) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return auth;
}

export function useDatabase() {
  const { database } = useContext(FirebaseContext);
  if (!database) {
    throw new Error('useDatabase must be used within a FirebaseProvider');
  }
  return database;
}

export function useFirebase() {
    const firebaseApp = useFirebaseApp();
    const auth = useAuth();
    const database = useDatabase();

    return { firebaseApp, auth, database };
}
