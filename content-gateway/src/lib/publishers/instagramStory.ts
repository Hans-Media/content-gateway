import { Publisher } from "./types";

const GRAPH = "https://graph.facebook.com/v20.0";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Instagram Stories via the Content Publishing API.
 * Same credentials as the feed publisher (Page Access Token + IG User ID).
 * Docs: https://developers.facebook.com/docs/instagram-platform/content-publishing#creating-a-story
 * Note: Stories do not support captions via the API.
 */
export const publishInstagramStory: Publisher = async ({
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
  if (!post.mediaFile) {
    return {
      success: false,
      message: "Story butuh foto/video, nggak bisa cuma teks.",
    };
  }

  try {
    const params = new URLSearchParams({
      media_type: "STORIES",
      access_token: token,
    });
    if (post.mediaType === "video") {
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
        message: `Gagal buat container story: ${JSON.stringify(createJson)}`,
      };
    }
    const creationId = createJson.id as string;

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
            message: `Video story gagal diproses: ${JSON.stringify(statusJson)}`,
          };
        }
      }
      if (status !== "FINISHED") {
        return {
          success: false,
          message: "Timeout menunggu video story selesai diproses.",
        };
      }
    }

    const pubRes = await fetch(`${GRAPH}/${igUserId}/media_publish`, {
      method: "POST",
      body: new URLSearchParams({
        creation_id: creationId,
        access_token: token,
      }),
    });
    const pubJson = await pubRes.json();
    if (!pubRes.ok || !pubJson.id) {
      return {
        success: false,
        message: `Gagal publish story: ${JSON.stringify(pubJson)}`,
      };
    }

    return {
      success: true,
      message: "Berhasil diposting ke Instagram Story.",
    };
  } catch (err: any) {
    return { success: false, message: `Error: ${err.message ?? err}` };
  }
};
