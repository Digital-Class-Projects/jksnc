
'use client';

import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Database } from 'firebase/database';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from '.';
import React, { Suspense } from 'react';

const { firebaseApp, auth, database } = initializeFirebase();

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  if (!firebaseApp) {
    // This should not happen in the client
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      database={database}
    >
      <Suspense fallback={<div>Loading...</div>}>
        {children}
      </Suspense>
    </FirebaseProvider>
  );
}
