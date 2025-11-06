
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCK2eiGxmCDijYq6y8BYY_cGQjGUSzRosc",
  authDomain: "jsknc-9ee95.firebaseapp.com",
  databaseURL: "https://jsknc-9ee95-default-rtdb.firebaseio.com",
  projectId: "jsknc-9ee95",
  storageBucket: "jsknc-9ee95.appspot.com",
  messagingSenderId: "646878931363",
  appId: "1:646878931363:web:9097f883c43a875e941216",
  measurementId: "G-BSHCSJQ2TD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure Google Provider with Drive access
const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/drive.file"); // Access only user-created files
provider.addScope("https://www.googleapis.com/auth/drive.metadata.readonly"); // Read metadata

// Sign in with Google and get Drive token
export async function connectGoogleDrive() {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken; // Google OAuth token

    console.log("Google Drive Access Token:", token);

    // Example: List Drive files
    const res = await fetch("https://www.googleapis.com/drive/v3/files", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const files = await res.json();
    console.log("User Drive Files:", files);
  } catch (error) {
    console.error("Error connecting to Google Drive:", error);
  }
}
