import { JSONFilePreset } from "lowdb/node";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

export type PlatformKey =
  | "instagram"
  | "facebook"
  | "threads"
  | "tiktok"
  | "youtube"
  | "x";

export type PlatformStatus = {
  state: "pending" | "publishing" | "success" | "error" | "skipped";
  message?: string;
  url?: string;
  updatedAt?: string;
};

export type Post = {
  id: string;
  caption: string;
  mediaFile: string; // filename under data/uploads
  mediaType: "image" | "video";
  platforms: PlatformKey[];
  status: Partial<Record<PlatformKey, PlatformStatus>>;
  createdAt: string;
};

export type Settings = {
  instagram?: { pageAccessToken?: string; igUserId?: string };
  facebook?: { pageAccessToken?: string; pageId?: string };
  threads?: { accessToken?: string; userId?: string };
  x?: {
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    accessSecret?: string;
  };
  tiktok?: {
    clientKey?: string;
    clientSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    openId?: string;
  };
  youtube?: {
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    channelId?: string;
  };
  baseUrl?: string; // public URL this app is deployed at, needed for IG/Threads media fetch
  anthropic?: { apiKey?: string };
};

type DbSchema = {
  posts: Post[];
  settings: Settings;
};

const defaultData: DbSchema = { posts: [], settings: {} };

let dbPromise: ReturnType<typeof JSONFilePreset<DbSchema>> | null = null;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = JSONFilePreset<DbSchema>(
      path.join(DATA_DIR, "db.json"),
      defaultData
    );
  }
  return dbPromise;
}

export function getUploadsDir() {
  return UPLOADS_DIR;
}
