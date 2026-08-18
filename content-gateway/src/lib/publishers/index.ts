import { PlatformKey } from "@/lib/db";
import { Publisher } from "./types";
import { publishInstagram } from "./instagram";
import { publishFacebook } from "./facebook";
import { publishThreads } from "./threads";
import { publishTiktok } from "./tiktok";
import { publishYoutube } from "./youtube";
import { publishX } from "./x";
import { publishInstagramStory } from "./instagramStory";
import { publishFacebookStory } from "./facebookStory";

export const publishers: Record<PlatformKey, Publisher> = {
  instagram: publishInstagram,
  facebook: publishFacebook,
  threads: publishThreads,
  tiktok: publishTiktok,
  youtube: publishYoutube,
  x: publishX,
  instagram_story: publishInstagramStory,
  facebook_story: publishFacebookStory,
};

export const platformLabels: Record<PlatformKey, string> = {
  instagram: "Instagram",
  facebook: "Facebook Page",
  threads: "Threads",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X (Twitter)",
  instagram_story: "Instagram Story",
  facebook_story: "Facebook Story",
};
