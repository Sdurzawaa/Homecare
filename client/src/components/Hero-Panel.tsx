import type { RefObject } from "react";

interface HeroProps {
  heroRef?: RefObject<HTMLElement | null>;
  content?: {
    title?: string;
    description?: string;
    image?: string;
    badge?: string;
    cta_label?: string;
    cta_link?: string;
    secondary_cta_label?: string;
    secondary_cta_link?: string;
  };
}

function Hero({ heroRef, content }: HeroProps) {
  const heroContent = content || {};
  return (
    <section
      ref={heroRef}
      id="home"
      className="min-h-[90vh] flex items-center overflow-hidden
                 pt-[calc(var(--header-h,72px)+1rem)] pb-[4.5rem]
                 bg-[radial-gradient(circle_at_top_right,rgba(178,77,98,0.08),transparent),linear-gradient(to_bottom,var(--bg-alt,#f7e4e7),#ffffff)]"
    >
      <div className="max-w-[1240px] mx-auto px-[clamp(1.5rem,5vw,4rem)] w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column: Content */}
          <div className="order-2 lg:order-1 flex flex-col items-start gap-6">
            {/* Trust Badge */}
            <div
              style={{ animationDelay: "0.15s" }}
              className="inline-flex animate-fade-in-up items-center gap-2 rounded-full px-4 py-2 shadow-sm
                         bg-[#f7edf1] border border-[#d9c7d2] text-[#6d3a4d]"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#6d3a4d] text-white" aria-hidden="true">
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#6d3a4d]">
                {heroContent.badge || "Dipercaya 1000+ keluarga"}
              </span>
            </div>

            <h1
              style={{ animationDelay: "0.25s" }}
              className="animate-fade-in-up font-[family-name:var(--font-display,'Source_Serif_4',serif)]
                         text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1]
                         tracking-[-0.02em] text-[var(--pine-deep,#772635)] max-w-xl"
            >
              {heroContent.title || "Kenyamanan Perawatan Medis di Rumah Anda"}
            </h1>

            <p
              style={{ animationDelay: "0.35s" }}
              className="animate-fade-in-up text-[1.05rem] leading-[1.7] text-[var(--ink-soft,#634b4f)] max-w-lg"
            >
              {heroContent.description ||
                "Menghadirkan tenaga profesional medis berpengalaman untuk merawat orang terkasih dengan penuh kasih sayang dan kenyamanan maksimal."}
            </p>

            <div
              style={{ animationDelay: "0.45s" }}
              className="animate-fade-in-up flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4"
            >
              <a
                href={heroContent.cta_link || "#contact"}
                style={{ color: "#ffffff" }}
                className="w-full sm:w-auto whitespace-nowrap rounded-full px-9 py-4 text-[0.92rem]
                           font-semibold !text-white no-underline flex items-center justify-center gap-2
                           bg-[var(--pine,#b24d62)] shadow-[0_16px_30px_-22px_rgba(178,77,98,0.5)]
                           transition-all duration-300 hover:-translate-y-1 hover:brightness-[0.9]"
              >
                {heroContent.cta_label || "Konsultasi Gratis"}
                <span aria-hidden="true" style={{ color: "#ffffff" }}>
                </span>
              </a>
              <a
                href={heroContent.secondary_cta_link || "#services"}
                className="w-full sm:w-auto whitespace-nowrap rounded-full px-7 py-4 text-[0.92rem]
                           font-semibold no-underline flex items-center justify-center
                           border-2 border-[var(--pine,#b24d62)] text-[var(--pine,#b24d62)]
                           transition-colors hover:bg-[var(--bg-alt,#f7e4e7)]"
              >
                {heroContent.secondary_cta_label || "Lihat Layanan"}
              </a>
            </div>
            {/* Mini Stats */}
            <div
              style={{ animationDelay: "0.55s" }}
              className="animate-fade-in-up grid grid-cols-2 sm:grid-cols-3 gap-8 mt-8 border-t border-[var(--line,#ecd0d4)] pt-8 w-full"
            >
              <div>
                <div className="font-bold text-[1.5rem] text-[var(--pine-deep,#772635)]">
                  24/7
                </div>
                <div className="text-[0.9rem] text-[var(--ink-soft,#634b4f)]">
                  Siaga Medis
                </div>
              </div>
              <div>
                <div className="font-bold text-[1.5rem] text-[var(--pine-deep,#772635)]">
                  50+
                </div>
                <div className="text-[0.9rem] text-[var(--ink-soft,#634b4f)]">
                  Tenaga Ahli
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-[1.5rem] text-[var(--pine-deep,#772635)]">
                  100%
                </div>
                <div className="text-[0.9rem] text-[var(--ink-soft,#634b4f)]">
                  Home Visit
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-[var(--pine-deep,#772635)]/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[var(--pine-deep,#772635)]/10 rounded-full blur-3xl -z-10"></div>

            <div className="relative group mx-auto w-full max-w-[520px]">
              <div
                className="relative overflow-hidden rounded-2xl border border-[var(--line,#ecd0d4)]
                           shadow-[0_16px_30px_-22px_rgba(119,38,53,0.3)]"
              >
                <img
                  alt="Bidan Profesional Homecare"
                  width="911"
                  height="1024"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  className="aspect-[911/1024] h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={heroContent.image || "/Person.jpg"}
                />
              </div>

              {/* Floating Info Card */}
              <div
                className="absolute -bottom-4 left-3 z-20 w-[calc(100%-1.5rem)] max-w-[220px] rounded-[18px] bg-[#f8f5f4]/95 p-3 shadow-[0_18px_36px_-20px_rgba(74,51,60,0.35)] ring-1 ring-[#eadfe3] animate-bounce-subtle sm:-bottom-5 sm:left-4 sm:max-w-[230px] md:-bottom-7 md:-left-4 md:w-[250px]"
              >
                <div className="mb-2 flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e9d7e7] text-[#5f3d55] sm:h-10 sm:w-10">
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[0.7rem] font-bold leading-snug text-[#5a2d43] sm:text-[0.85rem]">
                      Bd. Risma, S.Keb., CBMT
                    </div>
                    <div className="mt-[2px] text-[0.5rem] font-semibold uppercase tracking-[0.14em] text-[#7e5b69] sm:text-[0.58rem]">
                      Midwife Specialist
                    </div>
                  </div>
                </div>
                <p className="m-0 text-[0.68rem] leading-relaxed italic text-[#6b4d5a] sm:text-[0.78rem]">
                  “Dari Pelukan Pertama, untuk Tumbuh Kembang Terbaik.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframes untuk animate-fade-in-up dan animate-bounce-subtle
         (animate-bounce-subtle dipakai di Floating Info Card supaya melayang halus) */}
      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out both;
          will-change: opacity, transform;
          backface-visibility: hidden;
          transform: translateZ(0);
        }
        .animate-bounce-subtle {
          animation: bounceSubtle 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

export default Hero;