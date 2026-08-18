import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { getDb, getUploadsDir, Post, PlatformKey } from "@/lib/db";
import { publishers } from "@/lib/publishers";
import { getBaseUrl } from "@/lib/baseUrl";

export const runtime = "nodejs";

export async function GET() {
  const db = await getDb();
  const posts = [...db.data.posts].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  );
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const caption = (form.get("caption") as string) ?? "";
  const platformsRaw = form.get("platforms") as string; // JSON array
  const file = form.get("file") as File | null;

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

  if (file) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || ".jpg";
    mediaFile = `${uuidv4()}${ext}`;
    fs.writeFileSync(path.join(getUploadsDir(), mediaFile), bytes);
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
