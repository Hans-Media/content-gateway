import { Publisher } from "./types";

const GRAPH = "https://graph.threads.net/v1.0";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Threads Content Publishing API (Meta).
 * Docs: https://developers.facebook.com/docs/threads/posts
 * Requires a Threads user access token with threads_content_publish permission.
 */
export const publishThreads: Publisher = async ({
  post,
  settings,
  mediaUrl,
}) => {
  const token = settings.threads?.accessToken;
  const userId = settings.threads?.userId;
  if (!token || !userId) {
    return {
      success: false,
      message:
        "Threads belum dikonfigurasi. Isi Access Token & User ID di Settings.",
    };
  }

  try {
    const params = new URLSearchParams({
      text: post.caption ?? "",
      access_token: token,
    });

    if (!post.mediaFile) {
      params.set("media_type", "TEXT");
    } else if (post.mediaType === "video") {
      params.set("media_type", "VIDEO");
      params.set("video_url", mediaUrl);
    } else {
      params.set("media_type", "IMAGE");
      params.set("image_url", mediaUrl);
    }

    const createRes = await fetch(`${GRAPH}/${userId}/threads`, {
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

    // give Threads a moment to process media before publishing
    if (post.mediaFile) await sleep(8000);

    const pubRes = await fetch(`${GRAPH}/${userId}/threads_publish`, {
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
        message: `Gagal publish: ${JSON.stringify(pubJson)}`,
      };
    }

    return {
      success: true,
      message: "Berhasil diposting ke Threads.",
      url: `https://www.threads.net/t/${pubJson.id}`,
    };
  } catch (err: any) {
    return { success: false, message: `Error: ${err.message ?? err}` };
  }
};
