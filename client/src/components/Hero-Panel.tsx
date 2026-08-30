import type { RefObject } from "react";
import { optimizeCloudinaryUrl } from "../lib/image";

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
  const heroImage = heroContent.image || "/Person.jpg";
  const isCloudinaryImage = heroImage.includes("res.cloudinary.com");
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
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 shadow-sm
                         bg-[#f7edf1] border border-[#d9c7d2] text-[#6d3a4d]"
            >
              <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-[#f4dde5]" aria-hidden="true">
                <svg
                  className="h-[18px] w-[18px]"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <g>
                    <path style={{ fill: "#E45D73" }} d="M398.231,142.224c0,78.545-63.68,142.218-142.231,142.218c-78.545,0-142.221-63.673-142.221-142.218S177.455,0,256,0C334.551,0,398.231,63.68,398.231,142.224z" />
                    <path style={{ fill: "#EC707F" }} d="M398.231,369.77C398.231,448.321,334.551,512,256,512c-78.545,0-142.221-63.679-142.221-142.23c0-78.539,63.676-142.212,142.221-142.212C334.551,227.558,398.231,291.231,398.231,369.77z" />
                    <path style={{ fill: "#E45D73" }} d="M142.221,113.77c78.548,0,142.221,63.673,142.221,142.224c0,78.545-63.673,142.224-142.221,142.224C63.68,398.219,0,334.539,0,255.994C0,177.443,63.68,113.77,142.221,113.77z" />
                    <path style={{ fill: "#EC707F" }} d="M369.769,113.77C448.32,113.77,512,177.443,512,255.994c0,78.545-63.68,142.224-142.231,142.224c-78.538,0-142.211-63.68-142.211-142.224C227.558,177.443,291.231,113.77,369.769,113.77z" />
                    <path style={{ fill: "#D5637B" }} d="M410.103,392.397c2.263-13.154,2.609-26.852,0.904-40.808c-9.488-77.404-79.462-132.57-156.763-123.987c0.596,0,1.154-0.045,1.757-0.045c78.564,0,142.205,63.699,142.205,142.205c0,8.878-0.801,17.564-2.359,26L410.103,392.397z" />
                    <path style={{ fill: "#C85A71" }} d="M395.744,116.116c-8.378-1.551-17.064-2.353-25.949-2.353c-78.564,0-142.256,63.692-142.256,142.257c0,0.545,0.051,1.147,0.051,1.75c-8.539-77.302,46.635-147.327,123.981-156.808c13.961-1.705,27.66-1.359,40.808,0.904L395.744,116.116z" />
                    <path style={{ fill: "#C85A71" }} d="M116.15,116.225c-1.554,8.423-2.356,17.115-2.356,26c0,78.551,63.642,142.205,142.205,142.205c0.603,0,1.16,0,1.757,0c-77.302,8.532-147.276-46.635-156.763-124.039c-1.708-13.955-1.355-27.654,0.901-40.808L116.15,116.225z" />
                    <path style={{ fill: "#D5637B" }} d="M119.618,410.116c13.155,2.263,26.85,2.609,40.805,0.903c77.352-9.487,132.525-79.512,123.987-156.763c0,0.551,0.051,1.154,0.051,1.763c0,78.499-63.692,142.205-142.256,142.205c-8.891,0-17.568-0.807-25.949-2.358L119.618,410.116z" />
                    <path style={{ fill: "#F3E39C" }} d="M329.622,256.007c0,40.654-32.968,73.616-73.622,73.616c-40.66,0-73.622-32.962-73.622-73.616c0-40.66,32.962-73.628,73.622-73.628C296.654,182.378,329.622,215.346,329.622,256.007z" />
                    <path style={{ fill: "#E8D276" }} d="M303.673,199.962c10.942,12.847,17.577,29.475,17.577,47.68c0,40.654-32.962,73.615-73.615,73.615c-18.199,0-34.834-6.634-47.68-17.577c13.506,15.852,33.583,25.943,56.045,25.943c40.654,0,73.622-32.962,73.622-73.616C329.622,233.545,319.532,213.468,303.673,199.962z" />
                  </g>
                </svg>
              </span>
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#6d3a4d]">
                {heroContent.badge || "Dipercaya 500+ keluarga"}
              </span>
            </div>

            <h1
              className="font-[family-name:var(--font-heading,'Lora',Georgia,serif)]
                         text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1]
                         tracking-[-0.02em] text-[var(--pine-deep,#772635)] max-w-xl"
            >
              {heroContent.title || "Kenyamanan Perawatan Medis di Rumah Anda"}
            </h1>

            <p
              className="text-[1.05rem] leading-[1.7] text-[var(--ink-soft,#634b4f)] max-w-lg"
            >
              {heroContent.description ||
                "Menghadirkan tenaga profesional medis berpengalaman untuk merawat orang terkasih dengan penuh kasih sayang dan kenyamanan maksimal."}
            </p>

            <div
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4"
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
              className="grid grid-cols-2 sm:grid-cols-3 gap-8 mt-8 border-t border-[var(--line,#ecd0d4)] pt-8 w-full"
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
                  5+ Thn
                </div>
                <div className="text-[0.9rem] text-[var(--ink-soft,#634b4f)]">
                  Pengalaman Medis
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-[1.5rem] text-[var(--pine-deep,#772635)]">
                  100%
                </div>
                <div className="text-[0.9rem] text-[var(--ink-soft,#634b4f)]">
                  Bidan Tersertifikasi 
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
                  sizes="(max-width: 1023px) 100vw, 520px"
                  srcSet={
                    isCloudinaryImage
                      ? `${optimizeCloudinaryUrl(heroImage, 480)} 480w, ${optimizeCloudinaryUrl(heroImage, 800)} 800w`
                      : undefined
                  }
                  className="aspect-[911/1024] h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={optimizeCloudinaryUrl(heroImage, 800)}
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

      {/* Floating info card keeps its subtle motion; hero content remains visible immediately. */}
      <style>{`
        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounceSubtle 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

export default Hero;