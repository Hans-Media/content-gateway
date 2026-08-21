import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import formidable from "formidable";
import { getDb, getUploadsDir, Post, PlatformKey } from "@/lib/db";
import { publishers } from "@/lib/publishers";
import { getBaseUrl } from "@/lib/baseUrl";

export const runtime = "nodejs";

// Hard cap so one giant upload can't take down the whole container on
// small-RAM hosting (Railway). Ask the user to compress bigger files.
const MAX_UPLOAD_BYTES = 300 * 1024 * 1024; // 300MB

export async function GET() {
  const db = await getDb();
  const posts = [...db.data.posts].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  );
  return NextResponse.json({ posts });
}

/**
 * Next's own `request.formData()` reads the ENTIRE multipart body into
 * memory before handing back a File — for a big video that alone can OOM a
 * small-RAM container even if everything downstream streams properly. So we
 * parse the raw request stream ourselves with formidable, which writes the
 * uploaded file to disk as bytes arrive instead of buffering it all first.
 */
async function parseUploadStreaming(req: NextRequest) {
  const nodeReq = Readable.fromWeb(req.body as any) as any;
  nodeReq.headers = Object.fromEntries(req.headers.entries());
  nodeReq.method = req.method;

  const form = formidable({
    uploadDir: getUploadsDir(),
    keepExtensions: true,
    maxFileSize: MAX_UPLOAD_BYTES,
    multiples: false,
  });

  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (resolve, reject) => {
      form.parse(nodeReq, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    }
  );
}

function firstValue(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

export async function POST(req: NextRequest) {
  let fields: formidable.Fields;
  let files: formidable.Files;
  try {
    ({ fields, files } = await parseUploadStreaming(req));
  } catch (err: any) {
    const message = String(err?.message ?? err);
    if (message.toLowerCase().includes("maxfilesize")) {
      return NextResponse.json(
        {
          error: `File terlalu besar. Maksimal ${MAX_UPLOAD_BYTES / 1024 / 1024}MB — kompres dulu videonya ya.`,
        },
        { status: 413 }
      );
    }
    return NextResponse.json(
      { error: `Gagal upload file: ${message}` },
      { status: 400 }
    );
  }

  const caption = firstValue(fields.caption);
  const platformsRaw = firstValue(fields.platforms); // JSON array
  const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

  let platforms: PlatformKey[] = [];
  try {
    platforms = JSON.parse(platformsRaw);
  } catch {
    return NextResponse.json({ error: "platforms invalid" }, { status: 400 });
  }

  if (!platforms.length) {
    return NextResponse.json(
      { error: "Pilih minimal 1 platform." },
      { status: 400 }
    );
  }

  let mediaFile = "";
  let mediaType: "image" | "video" = "image";

  if (uploadedFile) {
    // formidable already streamed the file straight to getUploadsDir() —
    // just rename it to our own uuid-based filename.
    const ext =
      path.extname(uploadedFile.originalFilename ?? "") ||
      path.extname(uploadedFile.filepath) ||
      ".jpg";
    mediaFile = `${uuidv4()}${ext}`;
    const finalPath = path.join(getUploadsDir(), mediaFile);
    if (path.resolve(uploadedFile.filepath) !== path.resolve(finalPath)) {
      fs.renameSync(uploadedFile.filepath, finalPath);
    }
    mediaType = [".mp4", ".mov", ".m4v"].includes(ext.toLowerCase())
      ? "video"
      : "image";
  } else if (!platforms.every((p) => p === "threads" || p === "x")) {
    // only threads/x support text-only posts in this app
    return NextResponse.json(
      { error: "Wajib upload foto/video kecuali hanya posting ke Threads/X." },
      { status: 400 }
    );
  }

  const db = await getDb();
  const post: Post = {
    id: uuidv4(),
    caption,
    mediaFile,
    mediaType,
    platforms,
    status: Object.fromEntries(
      platforms.map((p) => [p, { state: "pending" as const }])
    ),
    createdAt: new Date().toISOString(),
  };
  db.data.posts.push(post);
  await db.write();

  // fire-and-forget publishing so the UI gets an immediate response
  publishAllPlatforms(post.id).catch((err) =>
    console.error("publish error", err)
  );

  return NextResponse.json({ post });
}

async function publishAllPlatforms(postId: string) {
  const db = await getDb();
  const baseUrl = await getBaseUrl();
  const post = db.data.posts.find((p) => p.id === postId);
  if (!post) return;

  const mediaUrl = post.mediaFile
    ? `${baseUrl}/api/media/${post.mediaFile}`
    : "";
  const mediaPath = post.mediaFile
    ? path.join(getUploadsDir(), post.mediaFile)
    : "";

  for (const platform of post.platforms) {
    post.status[platform] = { state: "publishing" };
    await db.write();

    try {
      const result = await publishers[platform]({
        post,
        settings: db.data.settings,
        mediaUrl,
        mediaPath,
      });
      post.status[platform] = {
        state: result.success ? "success" : "error",
        message: result.message,
        url: result.url,
        updatedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      post.status[platform] = {
        state: "error",
        message: err.message ?? String(err),
        updatedAt: new Date().toISOString(),
      };
    }
    await db.write();
  }
}