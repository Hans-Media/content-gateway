import fs from "fs";
import { google } from "googleapis";
import { Publisher } from "./types";

/**
 * YouTube Data API v3 — uploads a video (YouTube Shorts if <= 60s & vertical,
 * otherwise a regular video). Photos are not supported by YouTube uploads;
 * image posts are skipped for this platform.
 * Docs: https://developers.google.com/youtube/v3/guides/uploading_a_video
 */
export const publishYoutube: Publisher = async ({
  post,
  settings,
  mediaPath,
}) => {
  const { clientId, clientSecret, refreshToken, channelId } =
    settings.youtube ?? {};
  if (!clientId || !clientSecret || !refreshToken) {
    return {
      success: false,
      message:
        "YouTube belum terhubung. Klik 'Connect YouTube' di Settings dulu.",
    };
  }
  if (post.mediaType !== "video") {
    return {
      success: false,
      message: "YouTube hanya menerima video, foto dilewati.",
    };
  }

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const title = (post.caption || "Untitled").slice(0, 95) || "Untitled";
    const description = post.caption ?? "";

    const res = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title,
          description,
          channelId: channelId || undefined,
        },
        status: {
          privacyStatus: "public",
        },
      },
      media: {
        body: fs.createReadStream(mediaPath),
      },
    });

    const videoId = res.data.id;
    return {
      success: true,
      message: "Video berhasil diupload ke YouTube.",
      url: `https://youtu.be/${videoId}`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error: ${err.message ?? err}`,
    };
  }
};
