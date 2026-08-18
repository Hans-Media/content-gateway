import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getDb } from "@/lib/db";
import { getBaseUrl } from "@/lib/baseUrl";

export async function GET(req: NextRequest) {
  const db = await getDb();
  const { clientId, clientSecret } = db.data.settings.youtube ?? {};
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Isi YouTube/Google Client ID & Secret di Settings dulu." },
      { status: 400 }
    );
  }
  const baseUrl = await getBaseUrl();
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${baseUrl}/api/auth/youtube/callback`
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/youtube.upload"],
  });

  return NextResponse.redirect(authUrl);
}
