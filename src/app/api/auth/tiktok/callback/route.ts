import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getBaseUrl } from "@/lib/baseUrl";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(
      `${await getBaseUrl()}/settings?error=tiktok_no_code`
    );
  }

  const db = await getDb();
  const { clientKey, clientSecret } = db.data.settings.tiktok ?? {};
  const baseUrl = await getBaseUrl();

  const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: clientKey ?? "",
      client_secret: clientSecret ?? "",
      code,
      grant_type: "authorization_code",
      redirect_uri: `${baseUrl}/api/auth/tiktok/callback`,
    }),
  });
  const tokenJson = await tokenRes.json();

  if (!tokenRes.ok || !tokenJson.access_token) {
    return NextResponse.redirect(
      `${baseUrl}/settings?error=${encodeURIComponent(JSON.stringify(tokenJson))}`
    );
  }

  db.data.settings.tiktok = {
    ...db.data.settings.tiktok,
    accessToken: tokenJson.access_token,
    refreshToken: tokenJson.refresh_token,
    openId: tokenJson.open_id,
  };
  await db.write();

  return NextResponse.redirect(`${baseUrl}/settings?connected=tiktok`);
}
