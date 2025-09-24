import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin only if service account file exists
const serviceAccountPath = join(__dirname, "serviceAccount.json");

if (!existsSync(serviceAccountPath)) {
  console.error(
    "❌ Firebase service account file not found. Backend auth will not work."
  );
} else {
  try {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

    // Initialize only if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
      console.log("✅ Firebase Admin initialized successfully");
    }
  } catch (err) {
    console.error("❌ Failed to initialize Firebase Admin:", err.message);
  }
}

// Export Admin for token verification
export default admin;
