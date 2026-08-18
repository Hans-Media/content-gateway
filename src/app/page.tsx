"use client";

import { useEffect, useRef, useState } from "react";

type PlatformKey =
  | "instagram"
  | "facebook"
  | "threads"
  | "tiktok"
  | "youtube"
  | "x"
  | "instagram_story"
  | "facebook_story";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2c-2.717 0-3.056.012-4.123.06-1.065.049-1.793.218-2.428.465a4.902 4.902 0 0 0-1.772 1.153A4.902 4.902 0 0 0 2.525 5.45c-.247.635-.416 1.363-.465 2.428C2.012 8.944 2 9.283 2 12s.012 3.056.06 4.123c.049 1.065.218 1.793.465 2.428a4.902 4.902 0 0 0 1.153 1.772 4.902 4.902 0 0 0 1.772 1.153c.635.247 1.363.416 2.428.465C8.944 21.988 9.283 22 12 22s3.056-.012 4.123-.06c1.065-.049 1.793-.218 2.428-.465a4.902 4.902 0 0 0 1.772-1.153 4.902 4.902 0 0 0 1.153-1.772c.247-.635.416-1.363.465-2.428.048-1.067.06-1.406.06-4.123s-.012-3.056-.06-4.123c-.049-1.065-.218-1.793-.465-2.428a4.902 4.902 0 0 0-1.153-1.772A4.902 4.902 0 0 0 18.551 2.525c-.635-.247-1.363-.416-2.428-.465C15.056 2.012 14.717 2 12 2Zm0 1.802c2.67 0 2.987.01 4.042.059.976.045 1.505.207 1.858.344.467.182.8.399 1.15.748.35.35.566.683.748 1.15.137.353.3.882.344 1.858.048 1.055.058 1.372.058 4.042s-.01 2.987-.058 4.042c-.045.976-.207 1.505-.344 1.858a3.1 3.1 0 0 1-.748 1.15 3.1 3.1 0 0 1-1.15.748c-.353.137-.882.3-1.858.344-1.055.048-1.372.058-4.042.058s-2.987-.01-4.042-.058c-.976-.045-1.505-.207-1.858-.344a3.1 3.1 0 0 1-1.15-.748 3.1 3.1 0 0 1-.748-1.15c-.137-.353-.3-.882-.344-1.858-.048-1.055-.058-1.372-.058-4.042s.01-2.987.058-4.042c.045-.976.207-1.505.344-1.858.182-.467.399-.8.748-1.15.35-.35.683-.566 1.15-.748.353-.137.882-.3 1.858-.344C9.013 3.812 9.33 3.802 12 3.802Zm0 3.064a5.134 5.134 0 1 0 0 10.268 5.134 5.134 0 0 0 0-10.268Zm0 8.468a3.334 3.334 0 1 1 0-6.668 3.334 3.334 0 0 1 0 6.668Zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.459h-1.26c-1.243 0-1.63.771-1.63 1.562v1.878h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94Z" />
    </svg>
  );
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.6 2h-3.2v13.3a2.9 2.9 0 1 1-2.05-2.77V9.24a6.1 6.1 0 1 0 5.25 6.05V8.3a7.68 7.68 0 0 0 4.4 1.39V6.5a4.5 4.5 0 0 1-4.4-4.5Z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.582 7.186a2.51 2.51 0 0 0-1.767-1.78C18.254 5 12 5 12 5s-6.254 0-7.815.406a2.51 2.51 0 0 0-1.767 1.78C2 8.756 2 12 2 12s0 3.244.418 4.814a2.51 2.51 0 0 0 1.767 1.78C5.746 19 12 19 12 19s6.254 0 7.815-.406a2.51 2.51 0 0 0 1.767-1.78C22 15.244 22 12 22 12s0-3.244-.418-4.814ZM9.955 15.02V8.98L15.818 12l-5.863 3.02Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.68 10.62 20.28 3h-1.56l-5.73 6.62L8.4 3H3l6.92 9.98L3 21h1.56l6.05-6.99L15.6 21H21l-7.32-10.38Zm-2.14 2.47-.7-1-5.58-7.98h2.4l4.5 6.44.7 1 5.86 8.38h-2.4l-4.78-6.84Z" />
    </svg>
  );
}

function StoryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2 9.2 8.6 2 9.3l5.5 4.7L5.8 21 12 17.3 18.2 21l-1.7-7 5.5-4.7-7.2-.7L12 2Z" />
    </svg>
  );
}

const PLATFORMS: {
  key: PlatformKey;
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
}[] = [
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "facebook", label: "Facebook Page", Icon: FacebookIcon },
  { key: "tiktok", label: "TikTok", Icon: TiktokIcon },
  { key: "youtube", label: "YouTube", Icon: YoutubeIcon },
  { key: "x", label: "X (Twitter)", Icon: XIcon },
  { key: "instagram_story", label: "Instagram Story", Icon: StoryIcon },
  { key: "facebook_story", label: "Facebook Story", Icon: StoryIcon },
];

type PostStatus = {
  state: "pending" | "publishing" | "success" | "error" | "skipped";
  message?: string;
  url?: string;
};

type Post = {
  id: string;
  caption: string;
  mediaFile: string;
  mediaType: "image" | "video";
  platforms: PlatformKey[];
  status: Partial<Record<PlatformKey, PostStatus>>;
  createdAt: string;
};

export default function Home() {
  const [caption, setCaption] = useState("");
  const [theme, setTheme] = useState("");
  const [selected, setSelected] = useState<PlatformKey[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  async function loadPosts() {
    const res = await fetch("/api/posts");
    const json = await res.json();
    setPosts(json.posts ?? []);
  }

  useEffect(() => {
    loadPosts();
    const interval = setInterval(loadPosts, 4000);
    return () => clearInterval(interval);
  }, []);

  function togglePlatform(key: PlatformKey) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function generateCaption() {
    setError(null);
    setGenerating(true);
    try {
      const form = new FormData();
      form.set("theme", theme);
      form.set("platforms", JSON.stringify(selected));
      if (file) form.set("file", file);

      const res = await fetch("/api/caption", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Gagal generate caption.");
      } else {
        setCaption(json.caption);
      }
    } finally {
      setGenerating(false);
    }
  }

  async function submit() {
    setError(null);
    if (!selected.length) {
      setError("Pilih minimal satu platform.");
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.set("caption", caption);
      form.set("platforms", JSON.stringify(selected));
      if (file) form.set("file", file);

      const res = await fetch("/api/posts", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Gagal upload.");
      } else {
        setCaption("");
        setTheme("");
        setSelected([]);
        setFile(null);
        setPreview(null);
        if (fileInput.current) fileInput.current.value = "";
        loadPosts();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-10">
      <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-5">
        <h1 className="text-xl font-semibold">Upload konten</h1>

        <div>
          <label className="text-sm text-neutral-400 block mb-2">
            Foto / Video
          </label>
          <input
            ref={fileInput}
            type="file"
            accept="image/*,video/*"
            onChange={onFileChange}
            className="text-sm text-neutral-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-neutral-800 file:text-neutral-100 file:cursor-pointer"
          />
          {preview && file && (
            <div className="mt-3">
              {file.type.startsWith("video") ? (
                <video src={preview} controls className="max-h-64 rounded-lg" />
              ) : (
                <img src={preview} className="max-h-64 rounded-lg" alt="preview" />
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-neutral-400 block mb-2">
            Tema / konteks (opsional)
          </label>
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="misal: promo cashback rumah subsidi, tone santai"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm outline-none focus:border-neutral-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-neutral-400">Caption</label>
            <button
              type="button"
              onClick={generateCaption}
              disabled={generating || !file}
              title={!file ? "Upload foto/video dulu" : undefined}
              className="text-xs bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 px-3 py-1.5 rounded-lg"
            >
              {generating ? "Membuat caption..." : "✨ Generate Caption (AI)"}
            </button>
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            placeholder="Tulis caption, atau klik Generate Caption (AI) di atas..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm outline-none focus:border-neutral-600"
          />
        </div>

        <div>
          <label className="text-sm text-neutral-400 block mb-2">
            Publish ke
          </label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                type="button"
                key={p.key}
                onClick={() => togglePlatform(p.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition ${
                  selected.includes(p.key)
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                    : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-600"
                }`}
              >
                <p.Icon className="w-4 h-4 shrink-0" />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={submitting}
          className="self-start bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg text-sm"
        >
          {submitting ? "Mengirim..." : "Publish"}
        </button>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Riwayat</h2>
        {posts.length === 0 && (
          <p className="text-sm text-neutral-500">Belum ada post.</p>
        )}
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3"
          >
            <div className="flex justify-between items-start gap-4">
              <p className="text-sm text-neutral-200 whitespace-pre-wrap flex-1">
                {post.caption || <span className="text-neutral-500">(tanpa caption)</span>}
              </p>
              <span className="text-xs text-neutral-500 shrink-0">
                {new Date(post.createdAt).toLocaleString("id-ID")}
              </span>
            </div>
            {post.mediaFile && (
              <div>
                {post.mediaType === "video" ? (
                  <video
                    src={`/api/media/${post.mediaFile}`}
                    controls
                    className="max-h-40 rounded-lg"
                  />
                ) : (
                  <img
                    src={`/api/media/${post.mediaFile}`}
                    className="max-h-40 rounded-lg"
                    alt=""
                  />
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {post.platforms.map((pk) => {
                const st = post.status[pk];
                const label = PLATFORMS.find((p) => p.key === pk)?.label ?? pk;
                const color =
                  st?.state === "success"
                    ? "bg-emerald-600/20 text-emerald-300 border-emerald-800"
                    : st?.state === "error"
                    ? "bg-red-600/20 text-red-300 border-red-900"
                    : "bg-neutral-800 text-neutral-300 border-neutral-700";
                return (
                  <a
                    key={pk}
                    href={st?.url ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-xs px-2.5 py-1 rounded-full border ${color}`}
                    title={st?.message}
                  >
                    {label}: {st?.state ?? "pending"}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
