import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getUploadsDir } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const safeName = path.basename(filename);
  const filePath = path.join(getUploadsDir(), safeName);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const ext = path.extname(safeName).toLowerCase();
  const contentType =
    ext === ".mp4"
      ? "video/mp4"
      : ext === ".mov"
      ? "video/quicktime"
      : ext === ".png"
      ? "image/png"
      : ext === ".webp"
      ? "image/webp"
      : "image/jpeg";

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000",
    },
  });
}
