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
      // TikTok requires the video to be uploaded in chunks of at most 64MB
      // each (a single chunk is only allowed when the whole video is <=
      // MIN_CHUNK_SIZE). Sending a big video as "1 chunk = whole file" (like
      // this used to) gets rejected with "chunk size is invalid".
      const MIN_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
      const MAX_CHUNK_SIZE = 64 * 1024 * 1024; // 64MB
      const CHUNK_SIZE = Math.min(size, 10 * 1024 * 1024); // 10MB, well under the 64MB cap

      let totalChunkCount = Math.max(1, Math.ceil(size / CHUNK_SIZE));
      // TikTok also requires the final chunk to be at least MIN_CHUNK_SIZE
      // (unless there's only one chunk) — fold a too-small remainder into
      // the previous chunk instead.
      if (totalChunkCount > 1) {
        const lastChunkSize = size - CHUNK_SIZE * (totalChunkCount - 1);
        if (lastChunkSize < MIN_CHUNK_SIZE) totalChunkCount -= 1;
      }

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
              chunk_size: totalChunkCount === 1 ? size : CHUNK_SIZE,
              total_chunk_count: totalChunkCount,
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

      // Upload each chunk in turn, streaming just that byte range from disk
      // so we never hold more than one chunk in memory at a time.
      for (let i = 0; i < totalChunkCount; i++) {
        const start = i * CHUNK_SIZE;
        const end = i === totalChunkCount - 1 ? size - 1 : start + CHUNK_SIZE - 1;
        const chunkLength = end - start + 1;

        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "video/mp4",
            "Content-Length": String(chunkLength),
            "Content-Range": `bytes ${start}-${end}/${size}`,
          },
          // @ts-expect-error - Node readable stream is a valid fetch body (async iterable)
          body: fs.createReadStream(mediaPath, { start, end }),
          duplex: "half",
        });
        if (!putRes.ok) {
          return {
            success: false,
            message: `Gagal upload chunk ${i + 1}/${totalChunkCount} video ke TikTok: ${putRes.status} ${await putRes.text()}`,
          };
        }
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
