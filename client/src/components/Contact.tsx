import { useState, type Ref } from "react";

interface ContactProps {
  contactRef?: Ref<HTMLElement | null>;
  content?: {
    title?: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    button_label?: string;
    button_link?: string;
  };
}

interface Channel {
  href: string;
  external: boolean;
  label: string;
  value: string;
  icon: React.ReactNode;
}

function normalizeWhatsAppLink(value: string | undefined, fallback = "https://wa.me/6285892006905") {
  if (!value || !value.trim()) return fallback;

  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return fallback;

  if (digits.startsWith("62")) {
    return `https://wa.me/${digits}`;
  }

  if (digits.startsWith("0")) {
    return `https://wa.me/62${digits.slice(1)}`;
  }

  return `https://wa.me/62${digits}`;
}

function Contact({ contactRef, content }: ContactProps) {
  const [mapActive, setMapActive] = useState(false);
  const phone = content?.phone?.trim() || "";
  const address = content?.address?.trim() || "";
  const mapsQuery = encodeURIComponent(address);
  const defaultWhatsAppLink = content?.button_link || normalizeWhatsAppLink(phone, "#");

  const channels: Channel[] = [
    {
      href: defaultWhatsAppLink,
      external: true,
      label: "Telepon / WhatsApp",
      value: phone,
      icon: (
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      ),
    },
    {
      href: `mailto:${content?.email || ""}`,
      external: false,
      label: "Email",
      value: content?.email || "",
      icon: (
        <>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 6l-10 7L2 6" />
        </>
      ),
    },
    {
      href: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
      external: true,
      label: "Area Layanan",
      value: address,
      icon: (
        <>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </>
      ),
    },
  ];

  return (
    <section
      className="scroll-fade-up relative overflow-hidden px-[clamp(1.25rem,4vw,2rem)] py-[4rem]"
      id="contact"
      ref={contactRef}
    >
      <div className="relative z-10 mx-auto max-w-[1180px] rounded-[28px] border border-[var(--line)] bg-[#fdfffe] p-[clamp(1.2rem,3vw,1.8rem)] shadow-[0_16px_40px_-24px_rgba(119,38,53,0.2)]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:items-stretch">
          <div className="flex min-w-0 flex-col justify-center">
            <p className="eyebrow mb-2">Hubungi Kami</p>
            <h3 className="m-0 mb-3 font-[family-name:var(--font-heading)] text-[clamp(1.45rem,2.2vw,1.9rem)] font-medium leading-tight text-[var(--ink)]">
              {content?.title}
            </h3>
            <p className="m-0 mb-6 max-w-[32rem] text-[0.98rem] leading-relaxed text-[var(--ink-soft)]">
              {content?.description}
            </p>

            <div className="flex min-w-0 flex-col gap-2.5">
              {channels.map((channel) => (
                <a
                  key={channel.label}
                  href={channel.href}
                  target={channel.external ? "_blank" : undefined}
                  rel={channel.external ? "noreferrer noopener" : undefined}
                  className="group flex min-w-0 items-center gap-3 rounded-[16px] border border-[var(--line)] bg-[var(--bg-alt)] px-4 py-3.5 no-underline transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--pine)]/30 hover:bg-white"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] bg-white text-[var(--pine)] shadow-sm">
                    <svg
                      className="h-[18px] w-[18px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      {channel.icon}
                    </svg>
                  </span>

                  <span className="min-w-0">
                    <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[var(--ink-soft)]">
                      {channel.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.95rem] font-medium text-[var(--ink)] transition-colors group-hover:text-[var(--pine)]">
                      {channel.value}
                    </span>
                  </span>
                </a>
              ))}
            </div>

            <a
              href={defaultWhatsAppLink}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-6 inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full bg-[var(--pine)] px-6 py-3 text-[0.92rem] font-semibold text-white no-underline transition-all duration-300 hover:-translate-y-0.5 hover:brightness-[0.92]"
            >
              {content?.button_label}
              <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Card belakang (bg-alt + border + shadow) udah dihapus, map sekarang langsung nempel di section */}
          <div className="relative h-[440px] overflow-hidden rounded-[20px] sm:h-[520px] lg:h-auto lg:min-h-[620px]">


            <iframe
              title="Lokasi Homecare"
              src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
              width="100%"
              height="100%"
              style={{
                border: 0,
                height: "100%",
                display: "block",
                pointerEvents: "auto",
              }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {!mapActive && (
              <button
                type="button"
                onClick={() => setMapActive(true)}
                className="absolute inset-0 z-30 hidden flex-col items-center justify-center gap-3 bg-white/95 text-[var(--pine)] transition hover:bg-white lg:flex"
              >
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[var(--pine)]/30 bg-[var(--bg-alt)]">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em]">
                  Aktifkan Peta
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;