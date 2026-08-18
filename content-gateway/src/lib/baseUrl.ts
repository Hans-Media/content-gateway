import { getDb } from "@/lib/db";
import { headers } from "next/headers";

/**
 * Resolves the public base URL of this deployment, needed so platforms
 * (Instagram, Threads, TikTok) can fetch uploaded media over HTTPS.
 * Priority: Settings.baseUrl override -> request Host header.
 */
export async function getBaseUrl() {
  const db = await getDb();
  if (db.data.settings.baseUrl) return db.data.settings.baseUrl.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}
