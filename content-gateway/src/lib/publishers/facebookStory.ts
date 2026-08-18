import fs from "fs";
import { Publisher } from "./types";

const GRAPH = "https://graph.facebook.com/v20.0";
const GRAPH_VIDEO = "https://graph-video.facebook.com/v20.0";

/**
 * Facebook Page Stories.
 * Docs: https://developers.facebook.com/docs/page-stories-api
 * Flow: upload the media unpublished first (published=false) to get a
 * photo_id/video_id, then attach it to the page's story feed.
 */
export const publishFacebookStory: Publisher = async ({
  post,
  settings,
  mediaPath,
}) => {
  const token = settings.facebook?.pageAccessToken;
  const pageId = settings.facebook?.pageId;
  if (!token || !pageId) {
    return {
      success: false,
      message:
        "Facebook belum dikonfigurasi. Isi Page Access Token & Page ID di Settings.",
    };
  }
  if (!post.mediaFile) {
    return {
      success: false,
      message: "Story butuh foto/video, nggak bisa cuma teks.",
    };
  }

  try {
    const buffer = fs.readFileSync(mediaPath);

    if (post.mediaType === "video") {
      const form = new FormData();
      form.append("source", new Blob([buffer]), "video.mp4");
      form.append("published", "false");
      form.append("access_token", token);

      const uploadRes = await fetch(`${GRAPH_VIDEO}/${pageId}/videos`, {
        method: "POST",
        body: form,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.id) {
        return {
          success: false,
          message: `Gagal upload video story: ${JSON.stringify(uploadJson)}`,
        };
      }

      const storyRes = await fetch(`${GRAPH}/${pageId}/video_stories`, {
        method: "POST",
        body: new URLSearchParams({
          video_id: uploadJson.id,
          access_token: token,
        }),
      });
      const storyJson = await storyRes.json();
      if (!storyRes.ok || storyJson.success === false) {
        return {
          success: false,
          message: `Gagal publish video story: ${JSON.stringify(storyJson)}`,
        };
      }
      return {
        success: true,
        message: "Video berhasil diposting ke Facebook Story.",
      };
    } else {
      const form = new FormData();
      form.append("source", new Blob([buffer]), "photo.jpg");
      form.append("published", "false");
      form.append("access_token", token);

      const uploadRes = await fetch(`${GRAPH}/${pageId}/photos`, {
        method: "POST",
        body: form,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.id) {
        return {
          success: false,
          message: `Gagal upload foto story: ${JSON.stringify(uploadJson)}`,
        };
      }

      const storyRes = await fetch(`${GRAPH}/${pageId}/photo_stories`, {
        method: "POST",
        body: new URLSearchParams({
          photo_id: uploadJson.id,
          access_token: token,
        }),
      });
      const storyJson = await storyRes.json();
      if (!storyRes.ok || storyJson.success === false) {
        return {
          success: false,
          message: `Gagal publish foto story: ${JSON.stringify(storyJson)}`,
        };
      }
      return {
        success: true,
        message: "Foto berhasil diposting ke Facebook Story.",
      };
    }
  } catch (err: any) {
    return { success: false, message: `Error: ${err.message ?? err}` };
  }
};
