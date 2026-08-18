import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import os from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
const execFileAsync = promisify(execFile);

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function mimeFromExt(ext: string) {
  const e = ext.toLowerCase();
  if (e === ".png") return "image/png";
  if (e === ".webp") return "image/webp";
  return "image/jpeg";
}

/** Tries to grab a representative frame from a video with ffmpeg. Returns null if unavailable. */
async function extractVideoFrame(videoPath: string): Promise<Buffer | null> {
  const outPath = path.join(os.tmpdir(), `${uuidv4()}.jpg`);
  try {
    await execFileAsync("ffmpeg", [
      "-y",
      "-ss",
      "00:00:01",
      "-i",
      videoPath,
      "-frames:v",
      "1",
      "-q:v",
      "3",
      outPath,
    ]);
    const buf = fs.readFileSync(outPath);
    fs.unlinkSync(outPath);
    return buf;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const apiKey = db.data.settings.gemini?.apiKey;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Isi Gemini API Key di Settings dulu (bagian AI Caption)." },
      { status: 400 }
    );
  }

  const form = await req.formData();
  const theme = (form.get("theme") as string) ?? "";
  const platformsRaw = (form.get("platforms") as string) ?? "[]";
  const file = form.get("file") as File | null;

  let platforms: string[] = [];
  try {
    platforms = JSON.parse(platformsRaw);
  } catch {
    platforms = [];
  }

  let imageBase64: string | null = null;
  let imageMime = "image/jpeg";

  if (file) {
    const ext = path.extname(file.name || "").toLowerCase();
    const isVideo = [".mp4", ".mov", ".m4v"].includes(ext);
    const bytes = Buffer.from(await file.arrayBuffer());

    if (isVideo) {
      // write to a temp file so ffmpeg can read it, then grab a frame
      const tmpVideo = path.join(
        /* turbopackIgnore: true */ os.tmpdir(),
        `${uuidv4()}${ext || ".mp4"}`
      );
      fs.writeFileSync(tmpVideo, bytes);
      const frame = await extractVideoFrame(tmpVideo);
      fs.unlinkSync(tmpVideo);
      if (frame) {
        imageBase64 = frame.toString("base64");
        imageMime = "image/jpeg";
      }
    } else {
      imageBase64 = bytes.toString("base64");
      imageMime = mimeFromExt(ext);
    }
  }

  const platformNote = platforms.length
    ? `Caption ini akan dipakai bersamaan di: ${platforms.join(", ")}. Buat satu caption yang cocok dipakai di semua platform itu (jangan sebut nama platform di dalam caption).`
    : "";

  const instructions = `Kamu adalah social media copywriter. Tulis SATU caption untuk konten yang mau diposting.

${theme ? `Konteks/tema dari user: "${theme}"` : "Tidak ada konteks tambahan dari user — tebak dari gambar/konten."}
${platformNote}

Aturan:
- Bahasa Indonesia, gaya santai dan natural, bukan kaku/formal.
- Panjang caption medium-long: sekitar 5-9 kalimat/baris pendek (bukan cuma 1-2 kalimat), dengan alur seperti ini:
  1. Hook pembuka yang narik perhatian & menyentuh sisi emosional (bayangin hidup/keluarga yang lebih baik, rasa tenang, kebanggaan, dsb — bukan cuma jualan fitur).
  2. 1-2 kalimat yang bangun cerita/manfaat emosionalnya lebih dalam.
  3. Sentuhan scarcity/urgensi yang terasa natural, bukan maksa (misal: unit terbatas, harga akan naik, promo/kuota terbatas, banyak yang udah nanya/booking) — jangan mengada-ada kalau nggak ada info spesifik dari user, cukup pakai frasa umum yang masuk akal.
  4. Call-to-action singkat yang jelas di akhir (ajak DM/hubungi/cek info lebih lanjut).
- Boleh ada emoji secukupnya buat mempercantik (jangan berlebihan, jangan tiap baris).
- Sertakan 3-6 hashtag relevan di baris terakhir.
- Jangan pakai tanda kutip di awal/akhir. Jangan beri penjelasan lain, output HANYA caption-nya langsung.`;

  try {
    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inline_data: { mime_type: imageMime, data: imageBase64 },
      });
    }
    parts.push({ text: instructions });

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          maxOutputTokens: 2048,
        },
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        {
          error: `Gagal generate caption: ${
            json?.error?.message ?? JSON.stringify(json)
          }`,
        },
        { status: 500 }
      );
    }

    const caption: string =
      json?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text ?? "")
        .join("")
        .trim() ?? "";

    if (!caption) {
      return NextResponse.json(
        { error: "AI tidak mengembalikan caption. Coba lagi." },
        { status: 500 }
      );
    }

    return NextResponse.json({ caption });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Gagal generate caption: ${err.message ?? err}` },
      { status: 500 }
    );
  }
}
