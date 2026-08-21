import fs from "fs";
import { Publisher } from "./types";

/**
 * TikTok Content Posting API v2 — FILE_UPLOAD variant.
 * Docs: https://developers.tiktok.com/doc/content-posting-api-reference-direct-post
 *
 * We use FILE_UPLOAD (upload the file bytes directly to TikTok) instead of
 * PULL_FROM_URL, because PULL_FROM_URL requires verifying ownership of the
 * domain hosting the media (a separate, slower setup step). FILE_UPLOAD
 * works immediately for sandboxed/self-only apps.
 *
 * NOTE: unaudited TikTok apps can only post to the developer's own sandboxed
 * test account ("self-only" / private). Submit your app for audit to unlock
 * public posting to a real account.
 *
 * The file is streamed straight from disk instead of loaded fully into
 * memory first — important on small-RAM hosting (Railway) so a large video
 * doesn't OOM the container.
 */
export const publishTiktok: Publisher = async ({ post, settings, mediaPath }) => {
  const token = settings.tiktok?.accessToken;
  if (!token) {
    return {
      success: false,
      message: "TikTok belum terhubung. Klik 'Connect TikTok' di Settings dulu.",
    };
  }

  try {
    const size = fs.statSync(mediaPath).size;

    if (post.mediaType === "video") {
      const initRes = await fetch(
        "https://open.tiktokapis.com/v2/post/publish/video/init/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({
            post_info: {
              title: post.caption ?? "",
              privacy_level: "SELF_ONLY",
              disable_duet: false,
              disable_comment: false,
              disable_stitch: false,
            },
            source_info: {
              source: "FILE_UPLOAD",
              video_size: size,
              chunk_size: size,
              total_chunk_count: 1,
            },
          }),
        }
      );
      const initJson = await initRes.json();
      const uploadUrl = initJson?.data?.upload_url;
      if (!initRes.ok || !uploadUrl) {
        return {
          success: false,
          message: `Gagal init upload TikTok: ${JSON.stringify(initJson)}`,
        };
      }

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "video/mp4",
          "Content-Length": String(size),
          "Content-Range": `bytes 0-${size - 1}/${size}`,
        },
        // @ts-expect-error - Node readable stream is a valid fetch body (async iterable)
        body: fs.createReadStream(mediaPath),
        duplex: "half",
      });
      if (!putRes.ok) {
        return {
          success: false,
          message: `Gagal upload file video ke TikTok: ${putRes.status} ${await putRes.text()}`,
        };
      }

      return {
        success: true,
        message:
          "Video dikirim ke TikTok (publish_id " +
          initJson.data?.publish_id +
          "). Cek status publish via TikTok inbox/app.",
      };
    } else {
      const initRes = await fetch(
        "https://open.tiktokapis.com/v2/post/publish/content/init/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({
            post_info: {
              title: post.caption ?? "",
              privacy_level: "SELF_ONLY",
            },
            source_info: {
              source: "FILE_UPLOAD",
              photo_cover_index: 0,
              photo_images: [{ image_size: size }],
            },
            post_mode: "DIRECT_POST",
            media_type: "PHOTO",
          }),
        }
      );
      const initJson = await initRes.json();
      const uploadUrl =
        initJson?.data?.upload_url ?? initJson?.data?.upload_urls?.[0];
      if (!initRes.ok || !uploadUrl) {
        return {
          success: false,
          message: `Gagal init upload TikTok: ${JSON.stringify(initJson)}`,
        };
      }

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Length": String(size),
          "Content-Range": `bytes 0-${size - 1}/${size}`,
        },
        // @ts-expect-error - Node readable stream is a valid fetch body (async iterable)
        body: fs.createReadStream(mediaPath),
        duplex: "half",
      });
      if (!putRes.ok) {
        return {
          success: false,
          message: `Gagal upload file foto ke TikTok: ${putRes.status} ${await putRes.text()}`,
        };
      }

      return {
        success: true,
        message:
          "Foto dikirim ke TikTok (publish_id " + initJson.data?.publish_id + ").",
      };
    }
  } catch (err: any) {
    return { success: false, message: `Error: ${err.message ?? err}` };
  }
};
