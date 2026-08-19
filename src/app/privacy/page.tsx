export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-4 text-sm text-neutral-300">
      <h1 className="text-xl font-semibold text-white">Privacy Policy</h1>
      <p>
        Content Gateway adalah aplikasi internal untuk mempublikasikan konten
        (foto/video) ke akun media sosial milik pengguna sendiri (Instagram,
        Facebook, TikTok, YouTube, X).
      </p>
      <p>
        Aplikasi ini tidak mengumpulkan atau membagikan data pribadi pengguna
        kepada pihak ketiga mana pun, selain platform media sosial tujuan
        publikasi yang dipilih langsung oleh pengguna itu sendiri.
      </p>
      <p>
        Kredensial API (access token, client secret, dsb.) yang dimasukkan
        pengguna disimpan secara lokal di server aplikasi ini dan hanya
        digunakan untuk memproses permintaan publikasi konten atas nama
        pengguna itu sendiri.
      </p>
      <p>
        File media yang diunggah (foto/video) disimpan sementara di server
        aplikasi ini untuk keperluan publikasi ke platform tujuan, dan tidak
        digunakan untuk tujuan lain.
      </p>
      <p>
        Pertanyaan seputar privasi dapat diarahkan ke pemilik aplikasi ini.
      </p>
    </div>
  );
}
