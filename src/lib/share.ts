/** Public, shareable base URL for buyer-facing links. */
export const SITE_URL = "https://id-preview--b0f4092c-e806-47dc-b065-9cd6d471feb0.lovable.app";

function isPublicHost(host: string) {
  if (!host) return false;
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) return false;
  if (host.startsWith("192.168.") || host.startsWith("10.")) return false;
  return true;
}

/** Origin buyers can actually open — never localhost or a sandbox host. */
export function shareOrigin() {
  if (typeof window === "undefined") return SITE_URL;
  const { hostname, origin } = window.location;
  return isPublicHost(hostname) ? origin : SITE_URL;
}

export function productUrl(id: string) {
  return `${shareOrigin()}/product/${id}`;
}

/** Compact display form, e.g. shilpsetu.lovable.app/product/p123 */
export function prettyUrl(url: string) {
  return url.replace(/^https?:\/\//, "");
}

export function qrUrl(url: string, size = 220) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
}
