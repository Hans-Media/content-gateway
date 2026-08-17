"use client";

import { useEffect, useRef, useState } from "react";

type PlatformKey = "instagram" | "facebook" | "threads" | "tiktok" | "youtube" | "x";

const PLATFORMS: { key: PlatformKey; label: string; emoji: string }[] = [
  { key: "instagram", label: "Instagram", emoji: "📸" },
  { key: "facebook", label: "Facebook Page", emoji: "📘" },
  { key: "tiktok", label: "TikTok", emoji: "🎵" },
  { key: "youtube", label: "YouTube", emoji: "▶️" },
  { key: "threads", label: "Threads", emoji: "🧵" },
  { key: "x", label: "X (Twitter)", emoji: "✖️" },
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
                className={`px-3 py-2 rounded-lg text-sm border transition ${
                  selected.includes(p.key)
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                    : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-600"
                }`}
              >
                {p.emoji} {p.label}
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
