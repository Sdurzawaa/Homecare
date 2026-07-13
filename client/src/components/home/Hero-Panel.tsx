import type { ReactElement, RefObject } from "react";

interface HeroProps {
  heroRef?: RefObject<HTMLElement>;
}

function Hero({ heroRef }: HeroProps): ReactElement {
  return (
    <section
      ref={heroRef}
      id="home"
      className="min-h-[90vh] flex items-center overflow-hidden
                 pt-[calc(var(--header-h,72px)+1rem)] pb-[4.5rem]
                 bg-[radial-gradient(circle_at_top_right,rgba(28,58,48,0.08),transparent),linear-gradient(to_bottom,var(--bg-alt,#FAF7F0),#ffffff)]"
    >
      <div className="max-w-[1240px] mx-auto px-[clamp(1.5rem,5vw,4rem)] w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column: Content */}
          <div className="order-2 lg:order-1 flex flex-col items-start gap-6 animate-fade-in-up">
            {/* Trust Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 shadow-sm
                         bg-[var(--bg-alt,#FAF7F0)] border border-[var(--line,#E2E8E6)]
                         text-[var(--pine,#1c3a30)]"
            >
              <span className="text-[18px] leading-none">✓</span>
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.1em]">
                Dipercaya 1000+ keluarga
              </span>
            </div>

            <h1
              className="font-[family-name:var(--font-display,'Source_Serif_4',serif)]
                         text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1]
                         tracking-[-0.02em] text-[var(--pine,#1c3a30)] max-w-xl"
            >
              Kenyamanan Perawatan Medis di Rumah Anda
            </h1>

            <p className="text-[1.05rem] leading-[1.7] text-[var(--ink-soft,#4A5551)] max-w-lg">
              Menghadirkan tenaga profesional medis berpengalaman untuk merawat
              orang terkasih dengan penuh kasih sayang dan kenyamanan maksimal.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4">
              <a
                href="#contact"
                style={{ color: "#ffffff" }}
                className="w-full sm:w-auto whitespace-nowrap rounded-full px-8 py-4 text-[0.92rem]
                           font-semibold !text-white no-underline flex items-center justify-center gap-2
                           bg-[#36735D] shadow-[0_16px_30px_-22px_rgba(28,58,48,0.5)]
                           transition-all duration-300 hover:-translate-y-1 hover:brightness-[0.9]"
              >
                Konsultasi Gratis
                <span aria-hidden="true" style={{ color: "#ffffff" }}>
                  →
                </span>
              </a>
              <a
                href="#services"
                className="w-full sm:w-auto whitespace-nowrap rounded-full px-8 py-4 text-[0.92rem]
                           font-semibold no-underline flex items-center justify-center
                           border-2 border-[var(--pine,#1c3a30)] text-[var(--pine,#1c3a30)]
                           transition-colors hover:bg-[var(--bg-alt,#FAF7F0)]"
              >
                Lihat Layanan
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[var(--ink-soft,#4A5551)]">
              <span className="rounded-full bg-[var(--bg-alt,#FAF7F0)] px-3 py-2 font-medium text-[var(--pine,#1c3a30)]">
                Layanan cepat:
              </span>
              <a
                href="#services"
                className="rounded-full border border-[rgba(28,58,48,0.16)] bg-white px-3 py-2 text-[var(--ink-soft,#4A5551)] transition hover:bg-[var(--pine)] hover:text-white"
              >
                Perawatan Kehamilan
              </a>
              <a
                href="#services"
                className="rounded-full border border-[rgba(28,58,48,0.16)] bg-white px-3 py-2 text-[var(--ink-soft,#4A5551)] transition hover:bg-[var(--pine)] hover:text-white"
              >
                Persalinan
              </a>
              <a
                href="#services"
                className="rounded-full border border-[rgba(28,58,48,0.16)] bg-white px-3 py-2 text-[var(--ink-soft,#4A5551)] transition hover:bg-[var(--pine)] hover:text-white"
              >
                Perawatan Nifas
              </a>
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mt-8 border-t border-[var(--line,#E2E8E6)] pt-8 w-full">
              <div>
                <div className="font-bold text-[1.5rem] text-[var(--pine,#1c3a30)]">
                  24/7
                </div>
                <div className="text-[0.9rem] text-[var(--ink-soft,#4A5551)]">
                  Siaga Medis
                </div>
              </div>
              <div>
                <div className="font-bold text-[1.5rem] text-[var(--pine,#1c3a30)]">
                  50+
                </div>
                <div className="text-[0.9rem] text-[var(--ink-soft,#4A5551)]">
                  Tenaga Ahli
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-[1.5rem] text-[var(--pine,#1c3a30)]">
                  100%
                </div>
                <div className="text-[0.9rem] text-[var(--ink-soft,#4A5551)]">
                  Home Visit
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="order-1 lg:order-2 relative animate-fade-in-scale">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-[var(--pine,#1c3a30)]/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[var(--pine,#1c3a30)]/10 rounded-full blur-3xl -z-10"></div>

            <div className="relative group">
              <div
                className="rounded-2xl overflow-hidden aspect-[1.79] lg:aspect-auto
                           border border-[var(--line,#E2E8E6)]
                           shadow-[0_16px_30px_-22px_rgba(28,58,48,0.3)]"
              >
                <img
                  alt="Bidan Profesional Homecare"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBz81uB9lgsoWalmu5vT7pO9J7GNX5Cqr5LPX7GcA-tinFcNGHAgchIOImKmn5qVnx2LspE-Jkl5Ki_sT134lQSzvOBEnPCZUSsst1RvnXYozg-4s0aopik56yO7s44jUQx_2-EXj4RX1uPOblp40O_-4AfhDCgzFbFxFwdSKMpbxtKmMArZWDEJ5q9WV6CwoQZpty42uiMBVQD7lDPV6_G_hvJ7p4seiLc8qoRPyr4MAmWhu1myk_t"
                />
              </div>

              {/* Floating Info Card */}
              <div
                className="absolute -bottom-6 -left-6 p-5 rounded-2xl max-w-[240px] hidden md:block
                           bg-[rgb(252,255,250)] border border-[var(--line,#E2E8E6)]
                           shadow-[0_16px_30px_-22px_rgba(28,58,48,0.3)] animate-bounce-subtle"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-alt,#FAF7F0)]">
                    <span className="text-[var(--pine,#1c3a30)]">✚</span>
                  </div>
                  <div>
                    <div className="font-bold text-[var(--pine,#1c3a30)]">
                      Sari Maharani
                    </div>
                    <div className="text-[0.7rem] text-[var(--ink-soft,#4A5551)] uppercase tracking-wider font-bold">
                      Midwife Specialist
                    </div>
                  </div>
                </div>
                <p className="text-[0.9rem] leading-relaxed text-[var(--ink-soft,#4A5551)]">
                  "Kami merawat pasien layaknya keluarga sendiri."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframes untuk animate-fade-in-up, animate-fade-in-scale, dan animate-bounce-subtle
         (animate-bounce-subtle dipakai di Floating Info Card supaya melayang halus) */}
      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.8s ease-out forwards;
        }
        .animate-bounce-subtle {
          animation: bounceSubtle 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

export default Hero;
