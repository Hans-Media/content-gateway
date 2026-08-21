import fs from "fs";
import FormData from "form-data";
import { Publisher } from "./types";
import { buildOAuth1Header } from "@/lib/oauth1";

/**
 * X (Twitter) API: media upload via v1.1 (still OAuth1.0a only), tweet
 * creation via v2. Requires a Free/Basic+ developer app with OAuth1.0a
 * "Read and Write" user Access Token & Secret generated for your own account.
 * Docs: https://developer.x.com/en/docs/x-api/v1/media/upload-media/overview
 *        https://developer.x.com/en/docs/x-api/tweets/manage-tweets/api-reference/post-tweets
 *
 * Media upload streams the file straight from disk instead of loading the
 * whole thing into memory first — important on small-RAM hosting (Railway)
 * so a large video doesn't OOM the container.
 */
export const publishX: Publisher = async ({ post, settings, mediaPath }) => {
  const { apiKey, apiSecret, accessToken, accessSecret } = settings.x ?? {};
  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return {
      success: false,
      message: "X belum dikonfigurasi. Isi API Key/Secret & Access Token/Secret di Settings.",
    };
  }

  try {
    let mediaId: string | undefined;

    if (post.mediaFile) {
      const uploadUrl = "https://upload.twitter.com/1.1/media/upload.json";
      const mediaCategory = post.mediaType === "video" ? "tweet_video" : "tweet_image";

      const header = buildOAuth1Header({
        method: "POST",
        url: uploadUrl,
        apiKey,
        apiSecret,
        accessToken,
        accessSecret,
      });

      const form = new FormData();
      form.append("media", fs.createReadStream(mediaPath));
      form.append("media_category", mediaCategory);

      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { Authorization: header, ...form.getHeaders() },
        // @ts-expect-error - Node's form-data stream is a valid fetch body (async iterable)
        body: form,
        duplex: "half",
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.media_id_string) {
        return {
          success: false,
          message: `Gagal upload media ke X: ${JSON.stringify(uploadJson)}`,
        };
      }
      mediaId = uploadJson.media_id_string;
    }

    const tweetUrl = "https://api.twitter.com/2/tweets";
    const header = buildOAuth1Header({
      method: "POST",
      url: tweetUrl,
      apiKey,
      apiSecret,
      accessToken,
      accessSecret,
    });

    const body: any = { text: post.caption ?? "" };
    if (mediaId) body.media = { media_ids: [mediaId] };

    const tweetRes = await fetch(tweetUrl, {
      method: "POST",
      headers: {
        Authorization: header,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const tweetJson = await tweetRes.json();
    if (!tweetRes.ok || !tweetJson.data?.id) {
      return {
        success: false,
        message: `Gagal posting ke X: ${JSON.stringify(tweetJson)}`,
      };
    }

    return {
      success: true,
      message: "Berhasil diposting ke X.",
      url: `https://x.com/i/web/status/${tweetJson.data.id}`,
    };
  } catch (err: any) {
    return { success: false, message: `Error: ${err.message ?? err}` };
  }
};
