function normalizeWhatsAppLink(value?: string, fallback = "https://wa.me/6285892006905") {
  if (!value || !value.trim()) return fallback;

  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return fallback;

  if (digits.startsWith("62")) return `https://wa.me/${digits}`;
  if (digits.startsWith("0")) return `https://wa.me/62${digits.slice(1)}`;

  return `https://wa.me/62${digits}`;
}

function Footer({
  content,
}: {
  content?: { brand?: string; description?: string; phone?: string; email?: string; address?: string; button_link?: string };
}) {
  const waHref = content?.button_link || normalizeWhatsAppLink(content?.phone, "https://wa.me/6285892006905");

  return (
    <footer className="w-full bg-[var(--pine-deep,#1c3a30)] px-5 pb-6 pt-10 sm:px-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1240px] md:pl-4 lg:pl-8">
        <div className="grid grid-cols-1 gap-x-[1.6rem] gap-y-8 md:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/Logo.svg"
                alt={content?.brand || "Homecare"}
                className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
              />
              <span className="font-[family-name:var(--font-heading)] text-[1.1rem] font-medium text-white">
                {content?.brand || "Homecare"}
              </span>
            </div>
            <p className="m-0 max-w-xs text-[0.88rem] leading-relaxed text-white/55">
              {content?.description ||
                "Solusi perawatan kesehatan profesional di kenyamanan rumah Anda. Berkualitas, tepercaya, dan penuh kasih sayang."}
            </p>
            <div className="mt-1 flex items-center gap-3">
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="WhatsApp"
                className="text-white/50 transition-colors hover:text-white"
              >
                <svg
                  className="h-[18px] w-[18px]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.071 0C5.717 0 .429 5.287.429 11.643c0 2.259.584 4.43 1.697 6.29L0 24l6.514-1.708C9.03 23.41 10.82 24 12.071 24c6.355 0 11.643-5.288 11.643-11.643 0-3.128-1.286-6.082-3.623-8.418C18.154 1.286 15.199 0 12.071 0z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-white/50 transition-colors hover:text-white"
              >
                <svg
                  className="h-[18px] w-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="3.6" />
                  <circle
                    cx="17.2"
                    cy="6.8"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="text-white/50 transition-colors hover:text-white"
              >
                <svg
                  className="h-[18px] w-[18px]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M13.5 22v-8.5H16l.5-3.5h-3V7.7c0-.97.3-1.7 1.7-1.7H16.6V2.14C16.3 2.1 15.3 2 14.1 2c-2.5 0-4.2 1.5-4.2 4.4v2.6H7.4V12.5H9.9V22h3.6z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Tautan Cepat */}
          <div className="flex flex-col gap-3">
            <h4 className="m-0 text-[0.85rem] font-semibold uppercase tracking-wide text-white/40">
              Tautan Cepat
            </h4>
            <div className="flex flex-col gap-2.5 text-[0.9rem]">
              <a
                href="#about"
                className="w-fit text-white/70 no-underline transition-colors hover:text-white"
              >
                Tentang Kami
              </a>
              <a
                href="#"
                className="w-fit text-white/70 no-underline transition-colors hover:text-white"
              >
                Karir
              </a>
              <a
                href="#services"
                className="w-fit text-white/70 no-underline transition-colors hover:text-white"
              >
                Layanan Utama
              </a>
            </div>
          </div>

          {/* Kontak */}
          <div className="flex flex-col gap-3">
            <h4 className="m-0 text-[0.85rem] font-semibold uppercase tracking-wide text-white/40">
              Kontak
            </h4>
            <div className="flex flex-col gap-3.5 text-[0.95rem] text-white/70">
              <div className="flex items-start gap-2.5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="mt-0.5 h-4 w-4 shrink-0 text-white/60"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p className="m-0 leading-relaxed">
                  {content?.address || "Jl. Kebon Mangga 1 No. 1 Rt 006/007 Cipulir, Kebayoran Lama"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0 text-white/60">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.09 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.12.9.34 1.77.66 2.61a2 2 0 0 1-.45 2.11L9 10.91a16 16 0 0 0 4.09 4.09l1.47-1.29a2 2 0 0 1 2.11-.45c.84.32 1.71.54 2.61.66A2 2 0 0 1 22 16.92Z"/>
                </svg>
                <p className="m-0">{content?.phone || "+62 858-9200-6905"}</p>
              </div>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0 text-white/60">
                  <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z"/>
                  <path d="m5 7 7 5 7-5"/>
                </svg>
                <p className="m-0">{content?.email || "bidanrismacare@gmail.com"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-[0.82rem] text-white/40">
            © 2024 Homecare. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
