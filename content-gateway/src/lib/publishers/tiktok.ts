import { Publisher } from "./types";

/**
 * TikTok Content Posting API v2 (PULL_FROM_URL variant — simplest to operate,
 * requires your media to be reachable at a public HTTPS URL).
 * Docs: https://developers.tiktok.com/doc/content-posting-api-reference-direct-post
 *
 * NOTE: unaudited TikTok apps can only post to the developer's own sandboxed
 * test account ("self-only" / private). Submit your app for audit to unlock
 * public posting to a real account.
 */
export const publishTiktok: Publisher = async ({
  post,
  settings,
  mediaUrl,
}) => {
  const token = settings.tiktok?.accessToken;
  if (!token) {
    return {
      success: false,
      message:
        "TikTok belum terhubung. Klik 'Connect TikTok' di Settings dulu.",
    };
  }

  try {
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
              source: "PULL_FROM_URL",
              video_url: mediaUrl,
            },
          }),
        }
      );
      const initJson = await initRes.json();
      if (!initRes.ok || initJson.error?.code !== "ok") {
        return {
          success: false,
          message: `Gagal init upload TikTok: ${JSON.stringify(initJson)}`,
        };
      }
      return {
        success: true,
        message:
          "Video dikirim ke TikTok (status: publish_id " +
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
              source: "PULL_FROM_URL",
              photo_images: [mediaUrl],
              photo_cover_index: 0,
            },
            post_mode: "DIRECT_POST",
            media_type: "PHOTO",
          }),
        }
      );
      const initJson = await initRes.json();
      if (!initRes.ok || initJson.error?.code !== "ok") {
        return {
          success: false,
          message: `Gagal init upload TikTok: ${JSON.stringify(initJson)}`,
        };
      }
      return {
        success: true,
        message:
          "Foto dikirim ke TikTok (status: publish_id " +
          initJson.data?.publish_id +
          ").",
      };
    }
  } catch (err: any) {
    return { success: false, message: `Error: ${err.message ?? err}` };
  }
};
