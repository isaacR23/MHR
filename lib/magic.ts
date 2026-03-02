import { Magic } from "magic-sdk";
import { polygon } from "viem/chains";

const POLYGON_CHAIN_ID = polygon.id; // 137

let magicInstance: Magic | null = null;

/**
 * Browser-only Magic SDK singleton. Use for auth (loginWithEmailOTP).
 * Configured with Polygon so the provisioned EOA can sign on that chain.
 */
export function getMagic(): Magic {
  if (typeof window === "undefined") {
    throw new Error("getMagic() can only be called in the browser");
  }
  if (!magicInstance) {
    const key = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error("NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY is not set");
    }
    const rpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC_URL;
    magicInstance = new Magic(key, {
      network: rpcUrl
        ? { rpcUrl, chainId: POLYGON_CHAIN_ID }
        : undefined,
    });
  }
  return magicInstance;
}

export { POLYGON_CHAIN_ID };
