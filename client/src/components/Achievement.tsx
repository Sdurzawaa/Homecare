import type { ReactNode, RefObject } from "react";
import { optimizeCloudinaryUrl } from "../lib/image";

interface AchievementContent {
  title?: string;
  description?: string;
  image?: string;
  image_2?: string;
  image_3?: string;
}

interface AchievementsProps {
  achievementsRef?: RefObject<HTMLElement | null>;
  achievementsCard1?: RefObject<HTMLDivElement | null>;
  achievementsCard2?: RefObject<HTMLDivElement | null>;
  achievementsCard3?: RefObject<HTMLDivElement | null>;
  content?: AchievementContent;
}

// Static fallbacks live outside the component so they aren't re-created on every render.
const DEFAULT_IMAGES = {
  image:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDmUjmMxizXF02mWPoncUAQ6uxWYBZb7YMVlJv9kZ8gTN1sghTRr5IemG5-Pih13TPi4Hc3wQsIDresCXKeGY_xkciEp0sWS_CLDUvDomFRDtshdQZKtuvzxo4qBpFMvUWKHajP9npVLYQzd7J40iLA3RtHiUGOD4mBJ1-xrqqwrB-Hjxk0WFzKAAn07n8Oz4fJR1lXc7lAo_zuyggdPQ6qfM5XsNwrh0Uq-yUj1RPsXhcbOGWEIW7P_w",
  image_2:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDRaWb14VsQvZNL356-cp3yLk_7zMnGCERhSjQk9IdSvAU_1BcJwm8F37KnaWfSDyNn4ZNuGnpbMZTDnWt-xknYOr6sTTlQ2wdhZO-f5iw8mYN2b3gzaWb_pgc_1Sdvy4aPQS1mfETUCzC_JuYwGG5t89toawmmL0gDn6-0N4Hbga8pC5VL_VaiiMZoBjYDZEwnNCzwsMS3wG3qfOQVrC7lRVnZoVXbv_9PpoRDiqBgEeHEnxTT0JUdlg",
  image_3:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuClz7KaBBUmaxbwURQ07RcddQ0oPFIlB7MzyKhrxk3rkmiK1PSq_8cnwUi2-qH70ICZgpl_AClFJceJVvE8tjILhabxYP61F3c7xfQzYlATCqZEnJEftbz5p4T4NOutPpb9JLiDobUpNBTqdjZvWEChCINfgn_zzeL51AMl2wfRc_ua-BPOasUSSGmorEw7wbvBPxFDULpaSr96MzRES_RRuwmJJ9ow-8vnwX8mypIRL0yKHXVzCDIGZw",
} as const;

const CHECK_PATH =
  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z";

const CERTIFICATION_POINTS = [
  "Lulus sertifikasi & SOP ketat",
  "Lulus uji pelatihan berkala",
  "Amanah dan bertanggung jawab",
];

// --- Small reusable pieces -------------------------------------------------

function CheckBullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[0.95rem] leading-[1.6] text-[var(--ink-soft)]">
      <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--pine)] text-white">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d={CHECK_PATH} />
        </svg>
      </span>
      {children}
    </li>
  );
}

interface FloatingBadgeProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  position: "left" | "right";
}

function FloatingBadge({ icon, title, subtitle, position }: FloatingBadgeProps) {
  return (
    <div
      className={`absolute -bottom-6 z-20 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-[0_10px_22px_-8px_rgba(119,38,53,0.35)] ring-1 ring-black/5 ${
        position === "left" ? "left-5" : "right-5"
      }`}
    >
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--pine)] text-white">
        {icon}
      </span>
      <div className="leading-tight">
        <p className="m-0 text-[0.8rem] font-semibold text-[var(--ink)]">{title}</p>
        <p className="m-0 text-[0.72rem] text-[var(--ink-soft)]">{subtitle}</p>
      </div>
    </div>
  );
}

interface AchievementImageProps {
  src: string;
  alt: string;
  rotate: "left" | "right";
  accent: "pine" | "honey";
  badge: ReactNode;
  /** Only the first, above-the-fold image should skip lazy loading. */
  eager?: boolean;
}

function AchievementImage({ src, alt, rotate, accent, badge, eager }: AchievementImageProps) {
  return (
    <div className="relative">
      <div
        className={`absolute -inset-3 -z-10 rounded-[30px] bg-[var(--pine)]/[0.07] sm:-inset-4 ${
          rotate === "left" ? "rotate-[-2.5deg]" : "rotate-[2.5deg]"
        }`}
      />
      <div
        className={`group relative z-10 overflow-hidden rounded-[24px] shadow-[0_16px_32px_-14px_rgba(119,38,53,0.28)] transition-transform duration-700 will-change-transform hover:scale-[1.015] ${
          accent === "honey" ? "ring-2 ring-[var(--honey)]/50" : "ring-1 ring-black/5"
        }`}
      >
        <img
          alt={alt}
          src={optimizeCloudinaryUrl(src, 600)}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="h-[360px] w-full object-cover transition-transform duration-1000 group-hover:scale-105 sm:h-[440px]"
        />
        {accent === "honey" ? (
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(204,168,122,0.18),transparent_55%)]" />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(119,38,53,0.18),transparent_55%)]" />
        )}
      </div>
      {badge}
    </div>
  );
}

// Inline icon markup kept local to the section since each is used exactly once.
const HeartIcon = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21s-7.5-4.6-10-9.3C.5 8.8 2 5 5.5 5c2 0 3.6 1.2 4.5 2.7C10.9 6.2 12.5 5 14.5 5 18 5 19.5 8.8 22 11.7 19.5 16.4 12 21 12 21z" />
  </svg>
);

const ShieldIcon = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l7 3v6c0 4.6-3 8.7-7 10-4-1.3-7-5.4-7-10V5l7-3z" />
    <path d="M9 12.3l2 2 4-4.5" />
  </svg>
);

const UsersIcon = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
    <circle cx="17" cy="9" r="2.2" />
    <path d="M15.8 20c.2-2.4 1.6-4.3 3.5-5.2" />
  </svg>
);

// --- Main component ---------------------------------------------------------

function Achievements({
  achievementsRef,
  achievementsCard1,
  achievementsCard2,
  achievementsCard3,
  content,
}: AchievementsProps) {
  return (
    <section
      className="scroll-fade-up relative overflow-hidden bg-[linear-gradient(to_right,var(--bg-alt)_0%,#ffffff_60%,var(--bg)_100%)] px-5 py-20 sm:px-6 md:px-8 lg:px-12"
      id="about"
      ref={achievementsRef}
    >
      {/* Layer z-0 — dekoratif, statis, isolated paint */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.04] [contain:strict] [background-image:radial-gradient(circle,var(--pine)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="pointer-events-none absolute -top-[20%] -right-[10%] z-0 h-[600px] w-[600px] rounded-full [contain:strict] bg-[radial-gradient(circle,rgba(178,77,98,0.05)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-[10%] -left-[5%] z-0 h-[500px] w-[500px] rounded-full [contain:strict] bg-[radial-gradient(circle,rgba(204,168,122,0.06)_0%,transparent_70%)]" />

      {/* Layer z-10 — konten utama */}
      <div className="relative z-10 mb-[60px] text-center max-[768px]:mb-10">
        <p className="eyebrow m-0 mb-3">Mengapa Kami</p>
        <h2 className="mx-auto m-0 max-w-2xl font-[family-name:var(--font-heading)] text-[clamp(1.55rem,2.4vw,2.05rem)] font-medium leading-[1.3] text-[var(--ink)]">
          {content?.title || "Homecare modern untuk kebutuhan kesehatan keluarga"}
        </h2>
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-[100px] max-[768px]:space-y-[70px]">
        {/* Achievement 1: Perawatan dengan Hati — Image Left */}
        <div
          className="scroll-stagger flex flex-col items-center gap-10 lg:flex-row lg:gap-16"
          style={{ animationDelay: "0.15s" }}
          ref={achievementsCard1}
        >
          <div className="w-full lg:w-1/2">
            <AchievementImage
              src={content?.image || DEFAULT_IMAGES.image}
              alt="Perawatan dengan Hati"
              rotate="left"
              accent="pine"
              eager
              badge={
                <FloatingBadge
                  icon={HeartIcon}
                  title="Sentuhan Personal"
                  subtitle="Setiap pasien, cerita berbeda"
                  position="right"
                />
              }
            />
          </div>

          <div className="w-full pt-2 lg:w-1/2 lg:pt-0">
            <p className="m-0 mb-3 inline-flex items-center text-[0.68rem] font-[family-name:var(--font-body)] font-semibold uppercase tracking-[0.12em] text-[#8d5a6d]">
              Kepercayaan Keluarga
            </p>
            <h3 className="m-0 mb-5 font-[family-name:var(--font-heading)] text-[1.5rem] font-medium leading-[1.3] text-[var(--ink)]">
              Perawatan dengan Hati
            </h3>
            <p className="m-0 mb-6 text-[1rem] leading-[1.75] text-[var(--ink-soft)]">
              Tim kami terlatih dan berpengalaman dalam memberikan perawatan
              terbaik untuk lansia, ibu hamil, dan pasien pemulihan dengan
              sentuhan personal. Kami memahami bahwa setiap pasien unik dan
              membutuhkan pendekatan yang penuh kasih sayang.
            </p>
          </div>
        </div>

        {/* Achievement 2: Tenaga Terlatih & Bersertifikat — Image Right */}
        <div
          className="scroll-stagger flex flex-col items-center gap-10 lg:flex-row-reverse lg:gap-16"
          style={{ animationDelay: "0.35s" }}
          ref={achievementsCard2}
        >
          <div className="w-full lg:w-1/2">
            <AchievementImage
              src={content?.image_2 || DEFAULT_IMAGES.image_2}
              alt="Standar Profesional"
              rotate="right"
              accent="honey"
              badge={
                <FloatingBadge
                  icon={ShieldIcon}
                  title="100% Tersertifikasi"
                  subtitle="Diperbarui berkala"
                  position="left"
                />
              }
            />
          </div>

          <div className="w-full pt-8 lg:w-1/2 lg:pt-0">
            <p className="m-0 mb-3 inline-flex items-center text-[0.68rem] font-[family-name:var(--font-body)] font-semibold uppercase tracking-[0.12em] text-[#6476b8]">
              Standar Profesional
            </p>
            <h3 className="m-0 mb-5 font-[family-name:var(--font-heading)] text-[1.5rem] font-medium leading-[1.3] text-[var(--ink)]">
              Tenaga Terlatih &amp; Bersertifikat
            </h3>
            <p className="m-0 mb-6 text-[1rem] leading-[1.75] text-[var(--ink-soft)]">
              Semua perawat dan tenaga kesehatan kami memiliki sertifikasi resmi
              dan pengalaman bertahun-tahun untuk memastikan kualitas pelayanan
              medis di rumah.
            </p>
            <ul className="m-0 list-none space-y-[14px] border-t border-[var(--line)] pt-5">
              {CERTIFICATION_POINTS.map((point) => (
                <CheckBullet key={point}>{point}</CheckBullet>
              ))}
            </ul>
          </div>
        </div>

        {/* Achievement 3: Dipercaya Ribuan Keluarga — Image Left */}
        <div
          className="scroll-stagger flex flex-col items-center gap-10 lg:flex-row lg:gap-16"
          style={{ animationDelay: "0.55s" }}
          ref={achievementsCard3}
        >
          <div className="w-full lg:w-1/2">
            <AchievementImage
              src={content?.image_3 || DEFAULT_IMAGES.image_3}
              alt="Kepuasan Pelanggan"
              rotate="left"
              accent="pine"
              badge={
                <FloatingBadge
                  icon={UsersIcon}
                  title="10+ Tahun Melayani"
                  subtitle="Ribuan keluarga terlayani"
                  position="right"
                />
              }
            />
          </div>

          <div className="w-full pt-8 lg:w-1/2 lg:pt-0">
            <p className="m-0 mb-3 inline-flex items-center text-[0.68rem] font-[family-name:var(--font-body)] font-semibold uppercase tracking-[0.12em] text-[#9C5C73]">
              Kepuasan Pelanggan
            </p>
            <h3 className="m-0 mb-5 font-[family-name:var(--font-heading)] text-[1.5rem] font-medium leading-[1.3] text-[var(--ink)]">
              Dipercaya Ribuan Keluarga
            </h3>
            <p className="m-0 text-[1rem] leading-[1.75] text-[var(--ink-soft)]">
              Lebih dari 10 tahun melayani keluarga Indonesia dengan dedikasi
              penuh, responsif 24/7, dan harga yang terjangkau untuk semua
              kalangan. Kami bangga menjadi bagian dari perjalanan kesehatan
              keluarga Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Quote block */}
      <div className="relative z-10 mt-[80px]">
        <blockquote className="relative mx-auto max-w-3xl rounded-[28px] bg-white px-8 py-12 text-center shadow-[0_14px_32px_-18px_rgba(119,38,53,0.25)] ring-1 ring-[var(--line)] sm:px-14">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-6 top-3 font-[family-name:var(--font-heading)] text-[5rem] leading-none text-[var(--honey)]/20 sm:text-[6rem]"
          >
            "
          </span>
            <p className="relative m-0 font-[family-name:var(--font-body)] text-[1.15rem] italic leading-[1.7] text-[var(--ink-soft)] md:text-[1.3rem]">
            Kesehatan keluarga adalah prioritas kami. Kami berkomitmen
            memberikan layanan homecare terbaik dengan standar profesional dan
            harga terjangkau.
          </p>
          <div className="relative mt-6 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-[var(--pine)]/40" />
            <p className="m-0 text-[0.8rem] font-semibold uppercase tracking-[1.5px] text-[var(--pine)]">
              Tim Kami
            </p>
            <span className="h-px w-8 bg-[var(--pine)]/40" />
          </div>
        </blockquote>
      </div>
    </section>
  );
}

export default Achievements;