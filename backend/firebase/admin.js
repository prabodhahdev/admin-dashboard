import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Correctly define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin only if service account file exists
let isInitialized = false;

try {
  const serviceAccountPath = join(__dirname, "serviceAccount.json");

  if (existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(
      readFileSync(serviceAccountPath, "utf8")
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    isInitialized = true;
    console.log("Firebase Admin initialized successfully");
  } else {
    console.log(
      "Warning: Firebase service account file not found. Firebase features will be disabled."
    );
  }
} catch (error) {
  console.log("Warning: Failed to initialize Firebase Admin:", error.message);
}

export default admin;
export { isInitialized };
