import fs from "fs";
import path from "path";

export interface GoogleServiceAccountConfig {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain?: string;
}

let cachedServiceAccount: GoogleServiceAccountConfig | null = null;

/**
 * Returns Google Service Account credentials.
 * Loads from google-service-account.json or environment variables.
 */
export function getGoogleServiceAccount(): GoogleServiceAccountConfig | null {
  if (cachedServiceAccount) {
    return cachedServiceAccount;
  }

  // 1. Try loading from google-service-account.json
  try {
    const filePath = path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS || "google-service-account.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      cachedServiceAccount = JSON.parse(raw);
      return cachedServiceAccount;
    }
  } catch (err) {
    console.warn("Could not read google-service-account.json file:", err);
  }

  // 2. Fallback to individual env vars if available
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PROJECT_ID) {
    cachedServiceAccount = {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: "",
      private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_CLIENT_EMAIL)}`,
    };
    return cachedServiceAccount;
  }

  return null;
}
