"use client";

import { useEffect, useState } from "react";

type Settings = {
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
  baseUrl?: string;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-neutral-400">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 outline-none focus:border-neutral-600"
      />
    </label>
  );
}

function Card({
  title,
  subtitle,
  children,
  connected,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  connected?: boolean;
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-xs text-neutral-500">{subtitle}</p>
        </div>
        {connected !== undefined && (
          <span
            className={`text-xs px-2.5 py-1 rounded-full border ${
              connected
                ? "bg-emerald-600/20 text-emerald-300 border-emerald-800"
                : "bg-neutral-800 text-neutral-400 border-neutral-700"
            }`}
          >
            {connected ? "Terhubung" : "Belum terhubung"}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((json) => setSettings(json.settings ?? {}));
  }, []);

  function set<K extends keyof Settings>(key: K, val: Settings[K]) {
    setSettings((s) => ({ ...s, [key]: val }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      setSettings(json.settings);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Simpan kredensial API tiap platform di sini. Data disimpan lokal di
          server ini (data/db.json), tidak dikirim ke mana-mana selain
          platform terkait.
        </p>
      </div>

      <Card
        title="Base URL deployment"
        subtitle="Wajib diisi kalau Instagram/Threads/TikTok gagal fetch media — isi dengan URL publik tempat app ini di-hosting."
      >
        <Field
          label="Base URL"
          value={settings.baseUrl ?? ""}
          onChange={(v) => set("baseUrl", v)}
          placeholder="https://content-gateway-xxxx.onrender.com"
        />
      </Card>

      <Card
        title="📸 Instagram"
        subtitle="Butuh IG Business/Creator account yang terhubung ke Facebook Page, dan Page Access Token dengan izin instagram_content_publish (ambil dari Meta Graph API Explorer / Meta for Developers)."
        connected={!!settings.instagram?.pageAccessToken}
      >
        <Field
          label="Page Access Token"
          value={settings.instagram?.pageAccessToken ?? ""}
          onChange={(v) =>
            set("instagram", { ...settings.instagram, pageAccessToken: v })
          }
        />
        <Field
          label="Instagram User ID (IG Business Account ID)"
          value={settings.instagram?.igUserId ?? ""}
          onChange={(v) => set("instagram", { ...settings.instagram, igUserId: v })}
        />
      </Card>

      <Card
        title="📘 Facebook Page"
        subtitle="Posting ke feed halaman Facebook (bukan Marketplace). Butuh Page Access Token dengan izin pages_manage_posts."
        connected={!!settings.facebook?.pageAccessToken}
      >
        <Field
          label="Page Access Token"
          value={settings.facebook?.pageAccessToken ?? ""}
          onChange={(v) => set("facebook", { ...settings.facebook, pageAccessToken: v })}
        />
        <Field
          label="Page ID"
          value={settings.facebook?.pageId ?? ""}
          onChange={(v) => set("facebook", { ...settings.facebook, pageId: v })}
        />
      </Card>

      <Card
        title="🧵 Threads"
        subtitle="Butuh Threads User Access Token dengan izin threads_content_publish (Meta for Developers → Threads API)."
        connected={!!settings.threads?.accessToken}
      >
        <Field
          label="Access Token"
          value={settings.threads?.accessToken ?? ""}
          onChange={(v) => set("threads", { ...settings.threads, accessToken: v })}
        />
        <Field
          label="Threads User ID"
          value={settings.threads?.userId ?? ""}
          onChange={(v) => set("threads", { ...settings.threads, userId: v })}
        />
      </Card>

      <Card
        title="✖️ X (Twitter)"
        subtitle="Buat app di developer.x.com, generate OAuth1.0a Access Token & Secret dengan izin Read & Write untuk akunmu sendiri."
        connected={!!settings.x?.accessToken}
      >
        <Field
          label="API Key"
          value={settings.x?.apiKey ?? ""}
          onChange={(v) => set("x", { ...settings.x, apiKey: v })}
        />
        <Field
          label="API Secret"
          value={settings.x?.apiSecret ?? ""}
          onChange={(v) => set("x", { ...settings.x, apiSecret: v })}
        />
        <Field
          label="Access Token"
          value={settings.x?.accessToken ?? ""}
          onChange={(v) => set("x", { ...settings.x, accessToken: v })}
        />
        <Field
          label="Access Token Secret"
          value={settings.x?.accessSecret ?? ""}
          onChange={(v) => set("x", { ...settings.x, accessSecret: v })}
        />
      </Card>

      <Card
        title="🎵 TikTok"
        subtitle="Buat app di developers.tiktok.com dengan Content Posting API. Isi Client Key/Secret lalu klik Connect. App yang belum di-audit hanya bisa posting ke akun testmu sendiri (private)."
        connected={!!settings.tiktok?.accessToken}
      >
        <Field
          label="Client Key"
          value={settings.tiktok?.clientKey ?? ""}
          onChange={(v) => set("tiktok", { ...settings.tiktok, clientKey: v })}
        />
        <Field
          label="Client Secret"
          value={settings.tiktok?.clientSecret ?? ""}
          onChange={(v) => set("tiktok", { ...settings.tiktok, clientSecret: v })}
        />
        <a
          href="/api/auth/tiktok"
          className="self-start text-sm bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-lg"
        >
          Connect TikTok
        </a>
      </Card>

      <Card
        title="▶️ YouTube"
        subtitle="Buat OAuth Client (Web application) di Google Cloud Console dengan YouTube Data API v3 diaktifkan, izinkan redirect URI: <base-url>/api/auth/youtube/callback."
        connected={!!settings.youtube?.refreshToken}
      >
        <Field
          label="Google Client ID"
          value={settings.youtube?.clientId ?? ""}
          onChange={(v) => set("youtube", { ...settings.youtube, clientId: v })}
        />
        <Field
          label="Google Client Secret"
          value={settings.youtube?.clientSecret ?? ""}
          onChange={(v) => set("youtube", { ...settings.youtube, clientSecret: v })}
        />
        <a
          href="/api/auth/youtube"
          className="self-start text-sm bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-lg"
        >
          Connect YouTube
        </a>
      </Card>

      <div className="flex items-center gap-3 sticky bottom-4">
        <button
          onClick={save}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg text-sm"
        >
          {saving ? "Menyimpan..." : "Simpan Settings"}
        </button>
        {savedAt && (
          <span className="text-xs text-neutral-500">Tersimpan.</span>
        )}
      </div>
    </div>
  );
}
