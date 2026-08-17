import fs from "fs";
import { Publisher } from "./types";

const GRAPH = "https://graph.facebook.com/v20.0";
const GRAPH_VIDEO = "https://graph-video.facebook.com/v20.0";

/**
 * Posts to a Facebook Page's feed (not Marketplace).
 * Requires a Page access token with pages_manage_posts permission.
 * Docs: https://developers.facebook.com/docs/pages-api/posts
 */
export const publishFacebook: Publisher = async ({
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

  try {
    const form = new FormData();
    const buffer = fs.readFileSync(mediaPath);
    const blob = new Blob([buffer]);

    if (post.mediaType === "video") {
      form.append("description", post.caption ?? "");
      form.append("source", blob, "video.mp4");
      form.append("access_token", token);
      const res = await fetch(`${GRAPH_VIDEO}/${pageId}/videos`, {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok || !json.id) {
        return {
          success: false,
          message: `Gagal upload video: ${JSON.stringify(json)}`,
        };
      }
      return {
        success: true,
        message: "Video berhasil diposting ke Facebook Page.",
        url: `https://www.facebook.com/${json.id}`,
      };
    } else {
      form.append("caption", post.caption ?? "");
      form.append("source", blob, "photo.jpg");
      form.append("access_token", token);
      const res = await fetch(`${GRAPH}/${pageId}/photos`, {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok || !json.post_id) {
        return {
          success: false,
          message: `Gagal upload foto: ${JSON.stringify(json)}`,
        };
      }
      return {
        success: true,
        message: "Foto berhasil diposting ke Facebook Page.",
        url: `https://www.facebook.com/${json.post_id}`,
      };
    }
  } catch (err: any) {
    return { success: false, message: `Error: ${err.message ?? err}` };
  }
};
