/**
 * App-wide token and chain address constants.
 * Use these for escrow deployment, funding, and any contract that needs USDC or POL.
 *
 * POL (native token on Polygon) has no contract address; use zero address or
 * WPOL when referring to wrapped POL in token fields.
 */

/** Polygon mainnet native USDC (Circle) */
const POLYGON_USDC_MAINNET =
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as const;

/** Polygon mainnet wrapped POL (WMATIC) */
const POLYGON_WPOL_MAINNET =
  "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270" as const;

/**
 * USDC token address on Polygon.
 * Set POLYGON_USDC_ADDRESS in .env to override (e.g. for Amoy testnet).
 */
export function getPolygonUsdcAddress(): `0x${string}` {
  const env = process.env.POLYGON_USDC_ADDRESS;
  if (env && env.startsWith("0x")) return env as `0x${string}`;
  return POLYGON_USDC_MAINNET as `0x${string}`;
}

/**
 * Wrapped POL (WMATIC) address on Polygon.
 * Set POLYGON_WPOL_ADDRESS in .env to override.
 */
export function getPolygonWpolAddress(): `0x${string}` {
  const env = process.env.POLYGON_WPOL_ADDRESS;
  if (env && env.startsWith("0x")) return env as `0x${string}`;
  return POLYGON_WPOL_MAINNET as `0x${string}`;
}

/** Zero address (e.g. for native POL in token fields). */
export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const;

/** Polygon USDC address (for use in components / non-async code). Prefer getPolygonUsdcAddress() in API routes. */
export const POLYGON_USDC = POLYGON_USDC_MAINNET;

/** Polygon wrapped POL address. */
export const POLYGON_WPOL = POLYGON_WPOL_MAINNET;
