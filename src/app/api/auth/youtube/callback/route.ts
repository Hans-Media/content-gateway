import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getDb } from "@/lib/db";
import { getBaseUrl } from "@/lib/baseUrl";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const baseUrl = await getBaseUrl();
  if (!code) {
    return NextResponse.redirect(`${baseUrl}/settings?error=youtube_no_code`);
  }

  const db = await getDb();
  const { clientId, clientSecret } = db.data.settings.youtube ?? {};
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${baseUrl}/api/auth/youtube/callback`
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    db.data.settings.youtube = {
      ...db.data.settings.youtube,
      refreshToken: tokens.refresh_token ?? db.data.settings.youtube?.refreshToken,
    };
    await db.write();
    return NextResponse.redirect(`${baseUrl}/settings?connected=youtube`);
  } catch (err: any) {
    return NextResponse.redirect(
      `${baseUrl}/settings?error=${encodeURIComponent(err.message ?? "youtube_token_error")}`
    );
  }
}
