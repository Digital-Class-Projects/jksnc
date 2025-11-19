
'use client';

import React, { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

// This is a client component that will listen for permission errors
// and display them in a toast. In a real app, you might want to
// log these to a service like Sentry or display them in a more
// prominent way during development.
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error(error); // Also log to console for dev
      if (process.env.NODE_ENV === 'development') {
        toast({
          variant: 'destructive',
          title: 'Firestore Permission Error',
          description: error.message,
          duration: 20000, // Keep it open longer for debugging
        });
        // In development, you might want to throw the error to see it in the Next.js overlay
        // Be careful with this in production
        throw error;
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null; // This component does not render anything
}
