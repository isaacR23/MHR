/**
 * Chain and relayer constants for wallet infrastructure.
 * Client-safe: use NEXT_PUBLIC_* env vars only for URLs used in the browser.
 */

export const POLYGON_CHAIN_ID = 137;

/** Host patterns that indicate an RPC endpoint, not the Polymarket relayer */
const RPC_HOST_PATTERNS = [
  "alchemy.com",
  "infura.io",
  "infura.com",
  "quicknode",
  "rpc.",
  ".rpc.",
  "chainstack",
  "ankr.com",
  "getblock",
];

export function getPolymarketRelayerUrl(): string {
  const url = process.env.NEXT_PUBLIC_POLYMARKET_RELAYER_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_POLYMARKET_RELAYER_URL is not set");
  }
  const normalized = url.endsWith("/") ? url.slice(0, -1) : url;
  let host: string;
  try {
    host = new URL(normalized).host.toLowerCase();
  } catch {
    return normalized;
  }
  const isRpcUrl = RPC_HOST_PATTERNS.some((p) => host.includes(p));
  if (isRpcUrl) {
    throw new Error(
      "NEXT_PUBLIC_POLYMARKET_RELAYER_URL is set to an RPC endpoint (e.g. Alchemy/Infura). Use the Polymarket builder relayer URL instead—see Polymarket builder docs or .env.example."
    );
  }
  return normalized;
}

export function getRemoteSigningUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/polymarket/sign`;
  }
  return process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/polymarket/sign`
    : "/api/polymarket/sign";
}
