import fs from "fs";
import FormData from "form-data";
import { Publisher } from "./types";

const GRAPH = "https://graph.facebook.com/v20.0";
const GRAPH_VIDEO = "https://graph-video.facebook.com/v20.0";

/**
 * Facebook Page Stories.
 * Docs: https://developers.facebook.com/docs/page-stories-api
 * Flow: upload the media unpublished first (published=false) to get a
 * photo_id/video_id, then attach it to the page's story feed.
 *
 * Uploads stream the file straight from disk instead of loading the whole
 * thing into memory first — important on small-RAM hosting (Railway) so a
 * large video doesn't OOM the container.
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
    if (post.mediaType === "video") {
      // Facebook Stories require the resumable upload protocol
      // (upload_phase=start/transfer/finish) instead of a plain source POST.
      const size = fs.statSync(mediaPath).size;

      const startRes = await fetch(`${GRAPH_VIDEO}/${pageId}/videos`, {
        method: "POST",
        body: new URLSearchParams({
          upload_phase: "start",
          file_size: String(size),
          access_token: token,
        }),
      });
      const startJson = await startRes.json();
      if (!startRes.ok || !startJson.upload_session_id || !startJson.video_id) {
        return {
          success: false,
          message: `Gagal mulai upload video story: ${JSON.stringify(startJson)}`,
        };
      }
      const uploadSessionId = startJson.upload_session_id;
      const videoId = startJson.video_id;

      const transferForm = new FormData();
      transferForm.append("upload_phase", "transfer");
      transferForm.append("upload_session_id", uploadSessionId);
      transferForm.append("start_offset", String(startJson.start_offset ?? 0));
      transferForm.append("video_file_chunk", fs.createReadStream(mediaPath), {
        filename: "video.mp4",
      });
      transferForm.append("access_token", token);

      const transferRes = await fetch(`${GRAPH_VIDEO}/${pageId}/videos`, {
        method: "POST",
        headers: transferForm.getHeaders(),
        // @ts-expect-error - Node's form-data stream is a valid fetch body (async iterable)
        body: transferForm,
        duplex: "half",
      });
      const transferJson = await transferRes.json();
      if (!transferRes.ok) {
        return {
          success: false,
          message: `Gagal transfer video story: ${JSON.stringify(transferJson)}`,
        };
      }

      const finishRes = await fetch(`${GRAPH_VIDEO}/${pageId}/videos`, {
        method: "POST",
        body: new URLSearchParams({
          upload_phase: "finish",
          upload_session_id: uploadSessionId,
          access_token: token,
        }),
      });
      const finishJson = await finishRes.json();
      if (!finishRes.ok || finishJson.success === false) {
        return {
          success: false,
          message: `Gagal selesaikan upload video story: ${JSON.stringify(finishJson)}`,
        };
      }

      const uploadJson = { id: videoId };

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
      form.append("source", fs.createReadStream(mediaPath), {
        filename: "photo.jpg",
      });
      form.append("published", "false");
      form.append("access_token", token);

      const uploadRes = await fetch(`${GRAPH}/${pageId}/photos`, {
        method: "POST",
        headers: form.getHeaders(),
        // @ts-expect-error - Node's form-data stream is a valid fetch body (async iterable)
        body: form,
        duplex: "half",
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
