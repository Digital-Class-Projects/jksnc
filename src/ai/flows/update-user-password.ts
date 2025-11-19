
'use server';
/**
 * @fileOverview A secure backend flow to update user passwords.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';

function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getApps()[0]!;
    }

    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error('Missing Firebase Admin SDK credentials in environment variables.');
    }

    return initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
}


const UpdateUserPasswordInputSchema = z.object({
  email: z.string().email().describe('The email of the user to update.'),
  newPassword: z.string().min(6).describe('The new password for the user.'),
  role: z.enum(['branch', 'staff', 'student']).describe('The role of the user.'),
  id: z.string().optional().describe('The database ID of the user record.'),
  isNewUser: z.boolean().optional().describe('Flag if creating a new user.'),
});

const UpdateUserPasswordOutputSchema = z.object({
  uid: z.string(),
  message: z.string(),
});

export const updateUserPassword = ai.defineFlow(
  {
    name: 'updateUserPasswordFlow',
    inputSchema: UpdateUserPasswordInputSchema,
    outputSchema: UpdateUserPasswordOutputSchema,
  },
  async (input) => {
    const app = getFirebaseAdminApp();
    const { email, newPassword, role, id, isNewUser } = input;
    const auth = getAuth(app);
    const db = getDatabase(app);

    let user;

    if (isNewUser) {
      try {
        user = await auth.createUser({
          email,
          password: newPassword,
        });
      } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
           // If user exists, update their password instead
           user = await auth.getUserByEmail(email);
           await auth.updateUser(user.uid, { password: newPassword });
        } else {
            throw new Error(`Failed to create user: ${error.message}`);
        }
      }
    } else {
        try {
            user = await auth.getUserByEmail(email);
            await auth.updateUser(user.uid, { password: newPassword });
        } catch (error: any) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    if (id) { // Always update the timestamp if an ID is provided
      const dbRef = db.ref(`${role}s/${id}`);
      await dbRef.update({
        passwordUpdatedAt: new Date().toISOString(),
      });
    }

    return {
      uid: user.uid,
      message: `Successfully ${isNewUser ? 'created user and set password' : 'updated password'}.`,
    };
  }
);
