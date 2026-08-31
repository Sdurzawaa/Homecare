import { useState, useMemo, useCallback, useRef, useLayoutEffect, type ReactNode, type RefObject } from "react";
import { motion } from "framer-motion";
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

const CARE_WITH_HEART_POINTS = [
  "Perawatan nifas, breastcare, & pijat bayi yang lembut",
  "Edukasi menyusui & pemulihan pasca melahirkan secara holistik",
  "Pendampingan empatik agar ibu merasa tenang & didukung penuh",
];

const TRUSTED_FAMILY_POINTS = [
  "Ratusan ibu nifas & bayi baru lahir tertangani dengan aman",
  "Pendampingan & konsultasi laktasi siaga 24/7",
  "Ulasan positif & direkomendasikan oleh para ibu",
];

function FlowerIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g>
        <path fill="#E45D73" d="M398.231 142.224c0 78.545-63.68 142.218-142.231 142.218S113.779 220.769 113.779 142.224 177.455 0 256 0s142.231 63.68 142.231 142.224z" />
        <path fill="#EC707F" d="M398.231 369.77C398.231 448.321 334.551 512 256 512s-142.221-63.679-142.221-142.23S177.455 227.558 256 227.558s142.231 63.673 142.231 142.212z" />
        <path fill="#E45D73" d="M142.221 113.77c78.548 0 142.221 63.673 142.221 142.224s-63.673 142.224-142.221 142.224S0 334.539 0 255.994 63.68 113.77 142.221 113.77z" />
        <path fill="#EC707F" d="M369.769 113.77C448.32 113.77 512 177.443 512 255.994s-63.68 142.224-142.231 142.224-142.211-63.68-142.211-142.224 63.673-142.224 142.211-142.224z" />
        <path fill="#D5637B" d="M410.103 392.397c2.263-13.154 2.609-26.852.904-40.808-9.488-77.404-79.462-132.57-156.763-123.987.596 0 1.154-.045 1.757-.045 78.564 0 142.205 63.699 142.205 142.205 0 8.878-.801 17.564-2.359 26l14.256-3.365z" />
        <path fill="#C85A71" d="M395.744 116.116c-8.378-1.551-17.064-2.353-25.949-2.353-78.564 0-142.256 63.692-142.256 142.257 0 .545.051 1.147.051 1.75-8.539-77.302 46.635-147.327 123.981-156.808 13.961-1.705 27.66-1.359 40.808.904l3.365 14.25z" />
        <path fill="#C85A71" d="M116.15 116.225c-1.554 8.423-2.356 17.115-2.356 26 0 78.551 63.642 142.205 142.205 142.205h1.757c-77.302 8.532-147.276-46.635-156.763-124.039-1.708-13.955-1.355-27.654.901-40.808l14.256-3.358z" />
        <path fill="#D5637B" d="M119.618 410.116c13.155 2.263 26.85 2.609 40.805.903 77.352-9.487 132.525-79.512 123.987-156.763 0 .551.051 1.154.051 1.763 0 78.499-63.692 142.205-142.256 142.205-8.891 0-17.568-.807-25.949-2.358l3.362 14.25z" />
        <path fill="#F3E39C" d="M329.622 256.007c0 40.654-32.968 73.616-73.622 73.616s-73.622-32.962-73.622-73.616 32.962-73.628 73.622-73.628 73.622 32.968 73.622 73.628z" />
        <path fill="#E8D276" d="M303.673 199.962c10.942 12.847 17.577 29.475 17.577 47.68 0 40.654-32.962 73.615-73.615 73.615-18.199 0-34.834-6.634-47.68-17.577 13.506 15.852 33.583 25.943 56.045 25.943 40.654 0 73.622-32.962 73.622-73.616 0-22.462-10.09-42.539-25.949-56.045z" />
      </g>
    </svg>
  );
}

function CheckBullet({ children, flower = false }: { children: ReactNode; flower?: boolean }) {
  return (
    <li className="flex items-start gap-3 text-[0.95rem] leading-[1.6] text-[var(--ink-soft)]">
      <span className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center overflow-hidden rounded-full ${flower ? "bg-[#f4dde5]" : "bg-[var(--pine)]"}`}>
        {flower ? <FlowerIcon /> : (
          <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d={CHECK_PATH} />
          </svg>
        )}
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
      className={`absolute -bottom-4 z-30 flex w-[calc(100%-2.5rem)] max-w-[230px] items-center gap-2.5 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-[0_10px_18px_-10px_rgba(44,25,24,0.3)] ${
        position === "left" ? "left-5" : "right-5"
      }`}
    >
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--pine)] text-white shadow-[0_10px_18px_-10px_rgba(119,38,53,0.7)]">
        {icon}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="m-0 truncate text-[0.8rem] font-semibold text-[var(--ink)]">{title}</p>
        <p className="m-0 truncate text-[0.72rem] text-[var(--ink-soft)]">{subtitle}</p>
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
  eager?: boolean;
}

function AchievementImage({ src, alt, rotate, accent, badge, eager }: AchievementImageProps) {
  return (
    <div className="relative">
      {/* Panel dekoratif + foto ada di satu clip context sendiri, jadi
          panel yang di-rotate gak nongol lewat batas foto. */}
      <div className="relative overflow-hidden rounded-[12px]">
        <div
          className={`absolute -inset-3 -z-10 rounded-[12px] bg-[var(--pine)]/[0.07] sm:-inset-4 ${
            rotate === "left" ? "rotate-[-2.5deg]" : "rotate-[2.5deg]"
          }`}
        />
        <div
          className={`relative z-10 overflow-hidden rounded-[12px] shadow-[0_16px_32px_-14px_rgba(119,38,53,0.28)] transition-transform duration-700 will-change-transform ${
            accent === "honey" ? "ring-2 ring-[var(--honey)]/50" : "ring-1 ring-black/5"
          }`}
        >
          <img
            alt={alt}
            src={optimizeCloudinaryUrl(src, 600)}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="h-[360px] w-full object-cover transition-transform duration-1000 sm:h-[440px]"
          />
          {accent === "honey" ? (
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(204,168,122,0.18),transparent_55%)]" />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(119,38,53,0.18),transparent_55%)]" />
          )}
        </div>
      </div>
      {/* Badge tetap di luar clip context di atas, jadi bebas nongol
          keluar tepi foto tanpa ke-crop. */}
      {badge}
    </div>
  );
}

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

// Jarak sirkular idx terhadap activeIndex, dinormalkan ke rentang terdekat
// (mis. untuk 3 card: -1, 0, 1). Ini yang dipakai buat offset posisi,
// bukan reorder array — jadi DOM order card selalu tetap sama dan cuma
// transform-nya yang di-animate oleh Framer.
function getDiff(idx: number, activeIndex: number, length: number) {
  let diff = idx - activeIndex;
  if (diff > length / 2) diff -= length;
  if (diff < -length / 2) diff += length;
  return diff;
}

function Achievements({
  achievementsRef,
  achievementsCard1,
  achievementsCard2,
  achievementsCard3,
  content,
}: AchievementsProps) {
  const [activeIndex, setActiveIndex] = useState(1);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const mobileItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const cards = useMemo(
    () => [
    {
      label: "Kepercayaan Keluarga",
      title: "Perawatan dengan Hati",
      description:
        "Fokus pada sentuhan personal, kenyamanan pemulihan ibu, & kelembutan perawatan.",
      image: content?.image || DEFAULT_IMAGES.image,
      alt: "Perawatan dengan Hati",
      accent: "pine" as const,
      rotate: "left" as const,
      badge: {
        icon: HeartIcon,
        title: "Sentuhan Personal",
        subtitle: "Setiap pasien, cerita berbeda",
        position: "right" as const,
      },
      tagClass: "text-[#8d5a6d]",
      checklist: CARE_WITH_HEART_POINTS as string[],
    },
    {
      label: "Standar Profesional",
      title: "Tenaga Terlatih & Bersertifikat",
      description:
        "Ditangani langsung oleh bidan profesional bersertifikasi yang ahli dalam pendampingan kehamilan, perawatan nifas, laktasi, hingga perawatan bayi baru lahir secara nyaman.",
      image: content?.image_2 || DEFAULT_IMAGES.image_2,
      alt: "Standar Profesional",
      accent: "honey" as const,
      rotate: "right" as const,
      badge: {
        icon: ShieldIcon,
        title: "100% Tersertifikasi",
        subtitle: "Diperbarui berkala",
        position: "right" as const,
      },
      tagClass: "text-[#6476b8]",
      checklist: CERTIFICATION_POINTS as string[] | undefined,
    },
    {
      label: "Kepuasan Pelanggan",
      title: "Dipercaya Ratusan Keluarga",
      description:
        "Fokus pada rekam jejak, keahlian penanganan ibu & bayi, serta responsivitas.",
      image: content?.image_3 || DEFAULT_IMAGES.image_3,
      alt: "Kepuasan Pelanggan",
      accent: "pine" as const,
      rotate: "left" as const,
      badge: {
        icon: UsersIcon,
        title: "5+ Tahun Melayani",
        subtitle: "Ratusan keluarga terlayani",
        position: "right" as const,
      },
      tagClass: "text-[#9C5C73]",
      checklist: TRUSTED_FAMILY_POINTS as string[],
    },
  ],
    [content?.image, content?.image_2, content?.image_3],
  );

  const cardRefs = [achievementsCard1, achievementsCard2, achievementsCard3];

  const goToCard = useCallback((direction: number) => {
    setActiveIndex((current) => (current + direction + cards.length) % cards.length);
  }, [cards.length]);

  const scrollToCard = useCallback((index: number) => {
    mobileItemRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, []);

  const handleMobileScroll = useCallback(() => {
    const track = mobileTrackRef.current;
    if (!track) return;
    let closest = 0;
    let closestDist = Infinity;

    Array.from(track.children).forEach((child, idx) => {
      const dist = Math.abs((child as HTMLElement).offsetLeft - track.scrollLeft);
      if (dist < closestDist) {
        closestDist = dist;
        closest = idx;
      }
    });

    setActiveIndex(closest);
  }, []);

  useLayoutEffect(() => {
    const track = mobileTrackRef.current;
    if (!track) return;

    mobileItemRefs.current[activeIndex]?.scrollIntoView({
      behavior: "auto",
      inline: "center",
      block: "nearest",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cardBody = (card: (typeof cards)[number], isActive: boolean, cardIndex: number) => (
    <div className="flex h-full flex-col">
      <AchievementImage
        src={card.image}
        alt={card.alt}
        rotate={card.rotate}
        accent={card.accent}
        eager={cardIndex === 0}
        badge={
          <FloatingBadge
            icon={card.badge.icon}
            title={card.badge.title}
            subtitle={card.badge.subtitle}
            position={card.badge.position}
          />
        }
      />
      <div className="flex flex-1 flex-col px-2 pb-2 pt-4 text-left">
        <p className={`m-0 mb-3 inline-flex items-center text-[0.68rem] font-[family-name:var(--font-body)] font-semibold uppercase tracking-[0.12em] ${card.tagClass}`}>
          {card.label}
        </p>
        <h3 className="m-0 mb-3 font-[family-name:var(--font-heading)] text-[1.4rem] font-medium leading-[1.3] text-[var(--ink)]">
          {card.title}
        </h3>

        <div className="min-h-[4.5rem]">
          <p
            className={`m-0  text-[0.98rem] leading-[1.7] text-[var(--ink-soft)] transition-opacity duration-300 ${
              isActive ? "opacity-100" : "opacity-80"
            }`}
          >
            {card.description}
          </p>
        </div>

        <div className="mt-3 min-h-[7.5rem]">
          {card.checklist ? (
            <ul
              className={`m-0 list-none space-y-2.5 border-t border-[var(--line)] pt-3 transition-opacity duration-300 ${
                isActive ? "opacity-100" : "opacity-70"
              }`}
            >
              {card.checklist.map((point) => (
                <CheckBullet key={point} flower={cardIndex !== 1}>{point}</CheckBullet>
              ))}
            </ul>
          ) : (
            <div className="border-t border-[var(--line)] pt-4 opacity-0">
              <ul className="m-0 list-none space-y-[10px]">
                {CERTIFICATION_POINTS.map((point) => (
                  <CheckBullet key={point}>{point}</CheckBullet>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section
      className="scroll-fade-up relative overflow-hidden bg-[linear-gradient(to_right,var(--bg-alt)_0%,#ffffff_60%,var(--bg)_100%)] px-5 py-20 sm:px-6 md:px-8 lg:px-12"
      id="about"
      ref={achievementsRef}
    >
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.04] [contain:strict] [background-image:radial-gradient(circle,var(--pine)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="pointer-events-none absolute -top-[20%] -right-[10%] z-0 h-[600px] w-[600px] rounded-full [contain:strict] bg-[radial-gradient(circle,rgba(178,77,98,0.05)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-[10%] -left-[5%] z-0 h-[500px] w-[500px] rounded-full [contain:strict] bg-[radial-gradient(circle,rgba(204,168,122,0.06)_0%,transparent_70%)]" />

      <div className="relative z-10 mb-[56px] text-center max-[768px]:mb-10">
        <p className="eyebrow m-0 mb-3">Mengapa Kami</p>
        <h2 className="mx-auto m-0 max-w-2xl font-[family-name:var(--font-heading)] text-[clamp(1.55rem,2.4vw,2.05rem)] font-medium leading-[1.3] text-[var(--ink)]">
          {content?.title || "Homecare modern untuk kebutuhan kesehatan keluarga"}
        </h2>
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px]">
        <div className="relative mx-auto hidden items-center justify-center gap-3 md:flex md:gap-5">
          <button
            type="button"
            aria-label="Achievement previous"
            onClick={() => goToCard(-1)}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-[rgba(72,38,45,0.08)] bg-white/90 text-xl text-[var(--ink-soft)] shadow-[0_12px_28px_-18px_rgba(19,18,18,0.38)] backdrop-blur-sm transition-all duration-200 hover:-translate-x-0.5 hover:border-[rgba(116,63,76,0.18)] hover:text-[var(--pine)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pine)]/40"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="grid w-full items-start justify-items-center">
            {cards.map((card, idx) => {
              const diff = getDiff(idx, activeIndex, cards.length);
              const isCenter = diff === 0;

              return (
                <motion.article
                  key={card.title}
                  ref={cardRefs[idx]}
                  initial={false}
                  animate={{
                    x: diff * 380,
                    y: isCenter ? 0 : 16,
                    scale: isCenter ? 1 : 0.63,
                    opacity: isCenter ? 1 : 0.75,
                    zIndex: isCenter ? 20 : 10,
                  }}
                  transition={{ type: "spring", stiffness: 240, damping: 26, mass: 0.8 }}
                  onFocus={() => setActiveIndex(idx)}
                  onClick={() => setActiveIndex(idx)}
                  tabIndex={0}
                  style={{ gridArea: "1 / 1" }}
                  className="group relative flex h-full w-[430px] cursor-pointer overflow-hidden rounded-[18px] bg-white shadow-[0_2px_4px_-2px_rgba(67,51,64,0.08),0_18px_48px_-24px_rgba(67,51,64,0.4)] ring-1 ring-black/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pine)]"
                >
                  {isCenter && (
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-[18px] bg-[linear-gradient(90deg,var(--pine),var(--honey))]" />
                  )}
                  {cardBody(card, isCenter, idx)}
                </motion.article>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="Achievement next"
            onClick={() => goToCard(1)}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-[rgba(72,38,45,0.08)] bg-white/90 text-xl text-[var(--ink-soft)] shadow-[0_12px_28px_-18px_rgba(19,18,18,0.38)] backdrop-blur-sm transition-all duration-200 hover:translate-x-0.5 hover:border-[rgba(116,63,76,0.18)] hover:text-[var(--pine)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pine)]/40"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <div
          ref={mobileTrackRef}
          onScroll={handleMobileScroll}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-2 md:hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {cards.map((card, idx) => {
            const isCenterMobile = idx === activeIndex;

            return (
              <article
                key={card.title}
                ref={(el: HTMLDivElement | null) => {
                  mobileItemRefs.current[idx] = el;
                  const targetRef = cardRefs[idx];
                  if (targetRef) {
                    targetRef.current = el;
                  }
                }}
                style={{
                  transform: isCenterMobile ? "scale(1)" : "scale(0.9)",
                  opacity: isCenterMobile ? 1 : 0.8,
                }}
                className={`relative isolate flex h-full w-[85%] max-w-[380px] shrink-0 snap-center overflow-hidden rounded-[12px] bg-white shadow-[0_2px_4px_-2px_rgba(67,51,64,0.08),0_18px_48px_-24px_rgba(67,51,64,0.4)] ring-1 ring-black/[0.06] transition-all duration-300 ease-out ${
                  isCenterMobile ? "z-20" : "z-10"
                }`}
              >
                {isCenterMobile && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-1 rounded-t-[12px] bg-[linear-gradient(90deg,var(--pine),var(--honey))]" />
                )}

                <div className="relative z-30 w-full">{cardBody(card, isCenterMobile, idx)}</div>

                {!isCenterMobile && (
                  <div className="pointer-events-none absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] transition-opacity duration-300 ease-out" />
                )}
              </article>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 md:hidden">
          {cards.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to achievement ${index + 1}`}
              onClick={() => scrollToCard(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === activeIndex ? "w-8 bg-[var(--pine)]" : "w-2.5 bg-[var(--pine)]/30"
              }`}
            />
          ))}
        </div>
      </div>

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