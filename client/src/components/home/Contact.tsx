import { useState, type Ref } from "react";

interface ContactProps {
  contactRef?: Ref<HTMLElement | null>;
}

function Contact({ contactRef }: ContactProps) {
  const [mapActive, setMapActive] = useState(false);
  const address =
    "AKR Tower Jl. Panjang No.5 Level M, RT.11/RW.10, Kb. Jeruk, Kec. Kb. Jeruk, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11530";
  const mapsQuery = encodeURIComponent(address);

  return (
    <section
      className="scroll-fade-up mx-auto max-w-[1240px] px-[clamp(1.5rem,5vw,4rem)] py-[4.5rem]"
      id="contact"
      ref={contactRef}
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        {/* Kolom kiri: teks + info kontak sebagai list, bukan kartu identik */}
        <div className="flex flex-col justify-center">
          <p className="eyebrow">Hubungi Kami</p>
          <h3 className="m-0 mb-4 font-[family-name:var(--font-display)] text-[clamp(1.55rem,2.4vw,2.05rem)] font-medium leading-tight text-[var(--ink)]">
            Siap membantu kebutuhan kesehatan keluarga Anda
          </h3>
          <p className="m-0 mb-8 max-w-[32rem] text-[1.02rem] leading-relaxed text-[var(--ink-soft)]">
            Layanan homecare profesional kami siap menjawab kebutuhan medis
            dengan cepat, aman, dan penuh empati. Hubungi lewat cara yang paling
            nyaman buat Anda.
          </p>

          <div className="flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
            <a
              href="tel:+6285773780406"
              className="group flex items-center gap-4 py-4 no-underline"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-alt)] text-[var(--pine)]">
                <svg
                  className="h-[18px] w-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </span>
              <span>
                <span className="block text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[var(--ink-soft)]">
                  Telepon / WhatsApp
                </span>
                <span className="block font-[family-name:var(--font-display)] text-[1.02rem] font-medium text-[var(--ink)] transition-colors group-hover:text-[var(--pine)]">
                  +62 857-7378-0406
                </span>
              </span>
            </a>

            <a
              href="mailto:homecare@gmail.com"
              className="group flex items-center gap-4 py-4 no-underline"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-alt)] text-[var(--pine)]">
                <svg
                  className="h-[18px] w-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
              </span>
              <span>
                <span className="block text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[var(--ink-soft)]">
                  Email
                </span>
                <span className="block font-[family-name:var(--font-display)] text-[1.02rem] font-medium text-[var(--ink)] transition-colors group-hover:text-[var(--pine)]">
                  homecare@gmail.com
                </span>
              </span>
            </a>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex items-center gap-4 py-4 no-underline"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-alt)] text-[var(--pine)]">
                <svg
                  className="h-[18px] w-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <span>
                <span className="block text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[var(--ink-soft)]">
                  Area Layanan
                </span>
                <span className="block font-[family-name:var(--font-display)] text-[1.02rem] font-medium text-[var(--ink)] transition-colors group-hover:text-[var(--pine)]">
                  {address}
                </span>
              </span>
            </a>
          </div>

          <a
            href="https://wa.me/6285773780406"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-8 inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full
                       bg-[var(--pine)] px-7 py-3.5 text-[0.95rem] font-semibold text-white
                       no-underline transition-all duration-300 hover:-translate-y-0.5
                       hover:brightness-[0.92] hover:shadow-[0_16px_32px_-16px_rgba(28,58,48,0.5)]"
          >
            Chat via WhatsApp
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* Kolom kanan: peta lokasi asli, bukan panel CTA generik */}
        <div className="relative overflow-hidden rounded-[20px] border border-[var(--line)] shadow-[0_16px_40px_-24px_rgba(28,58,48,0.35)] min-h-[320px] lg:min-h-full">
          <iframe
            title="Lokasi Homecare"
            src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
            width="100%"
            height="100%"
            style={{
              border: 0,
              minHeight: "320px",
              display: "block",
              pointerEvents: mapActive ? "auto" : "none",
            }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          {!mapActive && (
            <button
              type="button"
              onClick={() => setMapActive(true)}
              className="absolute inset-0 flex items-center justify-center bg-[rgba(255,255,255,0.88)] text-[var(--pine)] transition hover:bg-[rgba(255,255,255,0.95)]"
            >
              Klik untuk mengaktifkan peta
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default Contact;