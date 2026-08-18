import { Publisher } from "./types";

const GRAPH = "https://graph.facebook.com/v20.0";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Instagram Content Publishing via the Facebook Graph API.
 * Requires: an Instagram Business/Creator account linked to a Facebook Page,
 * and a Page access token with instagram_content_publish permission.
 * Docs: https://developers.facebook.com/docs/instagram-platform/content-publishing
 *
 * Media must be reachable at a public HTTPS URL (mediaUrl) — Instagram fetches it,
 * it is not uploaded as multipart form data.
 */
export const publishInstagram: Publisher = async ({
  post,
  settings,
  mediaUrl,
}) => {
  const token = settings.instagram?.pageAccessToken;
  const igUserId = settings.instagram?.igUserId;
  if (!token || !igUserId) {
    return {
      success: false,
      message:
        "Instagram belum dikonfigurasi. Isi Page Access Token & IG User ID di Settings.",
    };
  }

  try {
    // Step 1: create media container
    const params = new URLSearchParams({
      caption: post.caption ?? "",
      access_token: token,
    });
    if (post.mediaType === "video") {
      params.set("media_type", "REELS");
      params.set("video_url", mediaUrl);
    } else {
      params.set("image_url", mediaUrl);
    }

    const createRes = await fetch(`${GRAPH}/${igUserId}/media`, {
      method: "POST",
      body: params,
    });
    const createJson = await createRes.json();
    if (!createRes.ok || !createJson.id) {
      return {
        success: false,
        message: `Gagal buat container: ${JSON.stringify(createJson)}`,
      };
    }
    const creationId = createJson.id as string;

    // Step 2: for video, poll until container is ready
    if (post.mediaType === "video") {
      let status = "IN_PROGRESS";
      for (let i = 0; i < 20 && status === "IN_PROGRESS"; i++) {
        await sleep(5000);
        const statusRes = await fetch(
          `${GRAPH}/${creationId}?fields=status_code&access_token=${token}`
        );
        const statusJson = await statusRes.json();
        status = statusJson.status_code;
        if (status === "ERROR") {
          return {
            success: false,
            message: `Video processing gagal: ${JSON.stringify(statusJson)}`,
          };
        }
      }
      if (status !== "FINISHED") {
        return {
          success: false,
          message: "Timeout menunggu video selesai diproses Instagram.",
        };
      }
    }

    // Step 3: publish
    const pubParams = new URLSearchParams({
      creation_id: creationId,
      access_token: token,
    });
    const pubRes = await fetch(`${GRAPH}/${igUserId}/media_publish`, {
      method: "POST",
      body: pubParams,
    });
    const pubJson = await pubRes.json();
    if (!pubRes.ok || !pubJson.id) {
      return {
        success: false,
        message: `Gagal publish: ${JSON.stringify(pubJson)}`,
      };
    }

    return {
      success: true,
      message: "Berhasil diposting ke Instagram.",
      url: `https://www.instagram.com/p/${pubJson.id}/`,
    };
  } catch (err: any) {
    return { success: false, message: `Error: ${err.message ?? err}` };
  }
};
