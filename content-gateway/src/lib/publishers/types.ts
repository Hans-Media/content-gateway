import { Post, Settings } from "@/lib/db";

export type PublishInput = {
  post: Post;
  settings: Settings;
  mediaUrl: string; // fully qualified public URL to the media file
  mediaPath: string; // absolute local filesystem path to the media file
};

export type PublishResult = {
  success: boolean;
  message: string;
  url?: string;
};

export type Publisher = (input: PublishInput) => Promise<PublishResult>;
