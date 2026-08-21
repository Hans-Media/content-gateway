import fs from "fs";
import FormData from "form-data";
import { Publisher } from "./types";

const GRAPH = "https://graph.facebook.com/v20.0";
const GRAPH_VIDEO = "https://graph-video.facebook.com/v20.0";

/**
 * Posts to a Facebook Page's feed (not Marketplace).
 * Requires a Page access token with pages_manage_posts permission.
 * Docs: https://developers.facebook.com/docs/pages-api/posts
 *
 * Uploads stream the file straight from disk instead of loading the whole
 * thing into memory first — important on small-RAM hosting (Railway) so a
 * large video doesn't OOM the container.
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
    if (post.mediaType === "video") {
      const form = new FormData();
      form.append("description", post.caption ?? "");
      form.append("source", fs.createReadStream(mediaPath), {
        filename: "video.mp4",
      });
      form.append("access_token", token);

      const res = await fetch(`${GRAPH_VIDEO}/${pageId}/videos`, {
        method: "POST",
        headers: form.getHeaders(),
        // @ts-expect-error - Node's form-data stream is a valid fetch body (async iterable)
        body: form,
        duplex: "half",
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
      const form = new FormData();
      form.append("caption", post.caption ?? "");
      form.append("source", fs.createReadStream(mediaPath), {
        filename: "photo.jpg",
      });
      form.append("access_token", token);

      const res = await fetch(`${GRAPH}/${pageId}/photos`, {
        method: "POST",
        headers: form.getHeaders(),
        // @ts-expect-error - Node's form-data stream is a valid fetch body (async iterable)
        body: form,
        duplex: "half",
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
