// Shared admin API base URL.
//
// In dev we happily call the local admin server (localhost:3000). In a
// production build, a device-local target (localhost / 127.x / LAN IPs)
// can never work on a visitor's phone and triggers Chrome's
// "wants to access other apps & services on this device" local-network
// permission prompt — so we blank it and let callers fall back to their
// built-in defaults.

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

export const ADMIN_URL = import.meta.env.PROD && raw && isDeviceLocal(raw) ? "" : raw;
