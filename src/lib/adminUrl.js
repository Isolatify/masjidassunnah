// Shared admin API base URL.
//
// Dev calls the local admin server (localhost:3000). In a production build
// we prefer VITE_ADMIN_URL, but a device-local target (localhost / 127.x /
// LAN IPs) can never work on a visitor's phone and triggers Chrome's
// "wants to access other apps & services on this device" local-network
// permission prompt — so production falls back to the deployed admin
// origin instead, keeping live settings/donation/form updates working.

const DEPLOYED_ADMIN = "https://masjidassunnah-admin.vercel.app";

const raw = String(import.meta.env.VITE_ADMIN_URL || "").replace(/\/+$/, "");

function isDeviceLocal(url) {
  try {
    const host = new URL(url).hostname;
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host.endsWith(".local") ||
      /^192\.168\./.test(host) ||
      /^10\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    );
  } catch {
    return false;
  }
}

export const ADMIN_URL = import.meta.env.PROD
  ? raw && !isDeviceLocal(raw)
    ? raw
    : DEPLOYED_ADMIN
  : raw;
