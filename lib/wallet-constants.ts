/**
 * Chain and relayer constants for wallet infrastructure.
 * Client-safe: use NEXT_PUBLIC_* env vars only for URLs used in the browser.
 */

export const POLYGON_CHAIN_ID = 137;

export function getPolymarketRelayerUrl(): string {
  const url = process.env.NEXT_PUBLIC_POLYMARKET_RELAYER_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_POLYMARKET_RELAYER_URL is not set");
  }
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getRemoteSigningUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/polymarket/sign`;
  }
  return process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/polymarket/sign`
    : "/api/polymarket/sign";
}
