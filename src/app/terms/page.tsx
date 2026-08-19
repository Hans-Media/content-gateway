export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-4 text-sm text-neutral-300">
      <h1 className="text-xl font-semibold text-white">Terms of Service</h1>
      <p>
        Content Gateway adalah aplikasi internal yang digunakan untuk
        mempublikasikan konten ke akun media sosial milik pengguna sendiri.
        Aplikasi ini tidak digunakan untuk publik dan hanya digunakan oleh
        pemilik akun yang telah mendaftarkan kredensialnya sendiri.
      </p>
      <p>
        Pengguna bertanggung jawab penuh atas konten yang dipublikasikan
        melalui aplikasi ini ke platform media sosial masing-masing.
      </p>
      <p>
        Aplikasi ini disediakan tanpa jaminan apa pun. Ketersediaan layanan
        bergantung pada API resmi masing-masing platform media sosial
        (Instagram, Facebook, TikTok, YouTube, X) dan dapat berubah
        sewaktu-waktu mengikuti kebijakan platform tersebut.
      </p>
    </div>
  );
}
