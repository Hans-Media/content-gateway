import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getBaseUrl } from "@/lib/baseUrl";

export async function GET(req: NextRequest) {
  const db = await getDb();
  const clientKey = db.data.settings.tiktok?.clientKey;
  if (!clientKey) {
    return NextResponse.json(
      { error: "Isi TikTok Client Key & Secret di Settings dulu." },
      { status: 400 }
    );
  }
  const baseUrl = await getBaseUrl();
  const redirectUri = `${baseUrl}/api/auth/tiktok/callback`;
  const state = Math.random().toString(36).slice(2);

  const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  authUrl.searchParams.set("client_key", clientKey);
  authUrl.searchParams.set("scope", "user.info.basic,video.publish,video.upload");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
