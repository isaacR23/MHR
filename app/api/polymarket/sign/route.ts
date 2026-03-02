import { NextRequest, NextResponse } from "next/server";
import { BuilderSigner } from "@polymarket/builder-signing-sdk";

const BUILDER_CREDENTIALS = {
  key: process.env.POLYMARKET_BUILDER_API_KEY ?? "",
  secret: process.env.POLYMARKET_BUILDER_SECRET ?? "",
  passphrase: process.env.POLYMARKET_BUILDER_PASSPHRASE ?? "",
};

export async function POST(request: NextRequest) {
  try {
    if (
      !BUILDER_CREDENTIALS.key ||
      !BUILDER_CREDENTIALS.secret ||
      !BUILDER_CREDENTIALS.passphrase
    ) {
      return NextResponse.json(
        { error: "Builder credentials not configured" },
        { status: 500 }
      );
    }
    const body = await request.json();
    const { method, path, body: requestBody, timestamp } = body as {
      method?: string;
      path?: string;
      body?: string;
      timestamp?: number;
    };
    if (typeof method !== "string" || typeof path !== "string") {
      return NextResponse.json(
        { error: "method and path are required" },
        { status: 400 }
      );
    }
    const signer = new BuilderSigner(BUILDER_CREDENTIALS);
    const payload = signer.createBuilderHeaderPayload(
      method,
      path,
      typeof requestBody === "string" ? requestBody : undefined,
      typeof timestamp === "number" ? timestamp : undefined
    );
    return NextResponse.json(payload);
  } catch (e) {
    console.error("[api/polymarket/sign] Error:", e);
    return NextResponse.json(
      { error: "Failed to generate builder signature" },
      { status: 500 }
    );
  }
}
