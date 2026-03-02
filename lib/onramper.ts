/**
 * Onramper widget URL for funding user SAFE with USDC on Polygon.
 * See https://docs.onramper.com/docs/supported-widget-parameters
 */

const ONRAMPER_BASE = "https://buy.onramper.com";

/** Onramper crypto ID for USDC on Polygon (onlyCryptos). */
export const ONRAMPER_USDC_POLYGON = "USDC_POLYGON";

/** Onramper network ID for Polygon (networkWallets). */
export const ONRAMPER_NETWORK_POLYGON = "POLYGON";

export type OnramperOptions = {
  /** Destination SAFE address (Polygon). */
  walletAddress: string;
  /** Success redirect URL (URL-encoded). Defaults to /funding on current origin. */
  successRedirectUrl?: string;
  /** Default fiat amount to show. */
  defaultAmount?: number;
};

/**
 * Builds the Onramper widget URL for buying USDC on Polygon and sending to the user's SAFE.
 * - Fiat: USD
 * - Crypto: USDC on Polygon only
 * - Destination: given wallet (SAFE) address
 * Opens in new tab so the widget acts as the "modal" experience.
 */
export function buildOnramperFundSafeUrl(options: OnramperOptions): string {
  const {
    walletAddress,
    successRedirectUrl,
    defaultAmount = 100,
  } = options;

  const params = new URLSearchParams();
  params.set("defaultFiat", "USD");
  params.set("defaultAmount", String(defaultAmount));
  params.set("onlyCryptos", ONRAMPER_USDC_POLYGON);
  params.set("mode", "buy");
  params.set("hideTopBar", "true");
  params.set("redirectAtCheckout", "true");
  params.set("defaultPaymentMethod", "creditcard");

  const redirect =
    successRedirectUrl ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/funding`
      : "");
  if (redirect) {
    params.set("successRedirectUrl", redirect);
  }

  params.set("networkWallets", `${ONRAMPER_NETWORK_POLYGON}:${walletAddress}`);

  return `${ONRAMPER_BASE}/?${params.toString()}`;
}
