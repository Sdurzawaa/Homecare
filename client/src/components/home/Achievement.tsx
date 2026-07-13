import type { ReactElement, RefObject } from "react";

type AchievementsProps = {
  achievementsRef?: RefObject<HTMLElement>;
  achievementsCard1?: RefObject<HTMLDivElement>;
  achievementsCard2?: RefObject<HTMLDivElement>;
  achievementsCard3?: RefObject<HTMLDivElement>;
};

function Achievements({
  achievementsRef,
  achievementsCard1,
  achievementsCard2,
  achievementsCard3,
}: AchievementsProps): ReactElement {
  return (
    <section
      className="scroll-fade-up relative overflow-hidden bg-[linear-gradient(to_right,#f5fbf9_0%,#ffffff_60%,#fffbf7_100%)] px-5 py-20 sm:px-6 md:px-8 lg:px-12"
      id="about"
      ref={achievementsRef}
    >
      {/* Decorative background — tekstur dot pattern halus */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.04] [background-image:radial-gradient(circle,var(--pine)_1px,transparent_1px)] [background-size:28px_28px]"></div>

      {/* Decorative background — blob warna lembut di sudut, mengikuti referensi terbaru */}
      <div className="pointer-events-none absolute -top-[20%] -right-[10%] z-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(47,93,79,0.05)_0%,transparent_70%)]"></div>
      <div className="pointer-events-none absolute -bottom-[10%] -left-[5%] z-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(226,162,59,0.06)_0%,transparent_70%)]"></div>

      <div className="relative z-10 mb-[60px] text-center max-[768px]:mb-10">
        <p className="eyebrow m-0 mb-3">Mengapa Kami</p>

        <h2 className="mx-auto m-0 max-w-2xl font-[family-name:var(--font-display)] text-[clamp(1.55rem,2.4vw,2.05rem)] font-medium leading-[1.3] text-[var(--ink)]">
          Homecare modern untuk kebutuhan kesehatan keluarga
        </h2>
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-[90px] max-[768px]:space-y-[60px]">
        {/* Achievement 1: Perawatan dengan Hati — Image Left */}
        <div
          className="scroll-stagger flex flex-col items-center gap-10 opacity-0 lg:flex-row lg:gap-16"
          ref={achievementsCard1}
        >
          <div className="w-full lg:w-1/2">
            <div className="group relative overflow-hidden rounded-[24px] shadow-[0_16px_40px_rgba(28,58,48,0.15)] transition-transform duration-700 hover:scale-[1.02]">
              <img
                alt="Perawatan dengan Hati"
                className="h-[360px] w-full object-cover transition-transform duration-1000 group-hover:scale-105 sm:h-[440px]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmUjmMxizXF02mWPoncUAQ6uxWYBZb7YMVlJv9kZ8gTN1sghTRr5IemG5-Pih13TPi4Hc3wQsIDresCXKeGY_xkciEp0sWS_CLDUvDomFRDtshdQZKtuvzxo4qBpFMvUWKHajP9npVLYQzd7J40iLA3RtHiUGOD4mBJ1-xrqqwrB-Hjxk0WFzKAAn07n8Oz4fJR1lXc7lAo_zuyggdPQ6qfM5XsNwrh0Uq-yUj1RPsXhcbOGWEIW7P_w"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(28,58,48,0.15),transparent_50%)]"></div>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <p className="m-0 mb-3 text-[0.75rem] font-[family-name:var(--font-display)] font-bold uppercase tracking-[1px] text-[var(--honey)]">
              Kepercayaan Keluarga
            </p>
            <h3 className="m-0 mb-5 font-[family-name:var(--font-display)] text-[1.5rem] font-medium leading-[1.3] text-[var(--ink)]">
              Perawatan dengan Hati
            </h3>
            <p className="m-0 text-[1rem] leading-[1.75] text-[var(--ink-soft)]">
              Tim kami terlatih dan berpengalaman dalam memberikan perawatan
              terbaik untuk lansia, ibu hamil, dan pasien pemulihan dengan
              sentuhan personal. Kami memahami bahwa setiap pasien unik dan
              membutuhkan pendekatan yang penuh kasih sayang.
            </p>
          </div>
        </div>

        {/* Achievement 2: Tenaga Terlatih & Bersertifikat — Image Right */}
        <div
          className="scroll-stagger flex flex-col items-center gap-10 opacity-0 lg:flex-row-reverse lg:gap-16"
          ref={achievementsCard2}
        >
          <div className="w-full lg:w-1/2">
            <div className="group relative overflow-hidden rounded-[24px] border-2 border-[var(--honey)] shadow-[0_16px_40px_rgba(28,58,48,0.15)] transition-transform duration-700 hover:scale-[1.02]">
              <img
                alt="Standar Profesional"
                className="h-[360px] w-full object-cover transition-transform duration-1000 group-hover:scale-105 sm:h-[440px]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRaWb14VsQvZNL356-cp3yLk_7zMnGCERhSjQk9IdSvAU_1BcJwm8F37KnaWfSDyNn4ZNuGnpbMZTDnWt-xknYOr6sTTlQ2wdhZO-f5iw8mYN2b3gzaWb_pgc_1Sdvy4aPQS1mfETUCzC_JuYwGG5t89toawmmL0gDn6-0N4Hbga8pC5VL_VaiiMZoBjYDZEwnNCzwsMS3wG3qfOQVrC7lRVnZoVXbv_9PpoRDiqBgEeHEnxTT0JUdlg"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(226,162,59,0.15),transparent_50%)]"></div>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <p className="m-0 mb-3 text-[0.75rem] font-[family-name:var(--font-display)] font-bold uppercase tracking-[1px] text-[var(--honey)]">
              Standar Profesional
            </p>
            <h3 className="m-0 mb-5 font-[family-name:var(--font-display)] text-[1.5rem] font-medium leading-[1.3] text-[var(--ink)]">
              Tenaga Terlatih &amp; Bersertifikat
            </h3>
            <p className="m-0 mb-6 text-[1rem] leading-[1.75] text-[var(--ink-soft)]">
              Semua perawat dan tenaga kesehatan kami memiliki sertifikasi resmi
              dan pengalaman bertahun-tahun untuk memastikan kualitas pelayanan
              medis di rumah.
            </p>
            <ul className="m-0 list-none space-y-[14px] border-t border-[var(--line)] pt-5">
              <li className="flex items-start gap-3 text-[0.95rem] leading-[1.6] text-[var(--ink-soft)]">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--pine)] text-white">
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </span>
                Lulus sertifikasi &amp; SOP ketat
              </li>
              <li className="flex items-start gap-3 text-[0.95rem] leading-[1.6] text-[var(--ink-soft)]">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--pine)] text-white">
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </span>
                Lulus uji pelatihan berkala
              </li>
              <li className="flex items-start gap-3 text-[0.95rem] leading-[1.6] text-[var(--ink-soft)]">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--pine)] text-white">
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </span>
                Amanah dan bertanggung jawab
              </li>
            </ul>
          </div>
        </div>

        {/* Achievement 3: Dipercaya Ribuan Keluarga — Image Left */}
        <div
          className="scroll-stagger flex flex-col items-center gap-10 opacity-0 lg:flex-row lg:gap-16"
          ref={achievementsCard3}
        >
          <div className="w-full lg:w-1/2">
            <div className="group relative overflow-hidden rounded-[24px] shadow-[0_16px_40px_rgba(28,58,48,0.15)] transition-transform duration-700 hover:scale-[1.02]">
              <img
                alt="Kepuasan Pelanggan"
                className="h-[360px] w-full object-cover transition-transform duration-1000 group-hover:scale-105 sm:h-[440px]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuClz7KaBBUmaxbwURQ07RcddQ0oPFIlB7MzyKhrxk3rkmiK1PSq_8cnwUi2-qH70ICZgpl_AClFJceJVvE8tjILhabxYP61F3c7xfQzYlATCqZEnJEftbz5p4T4NOutPpb9JLiDobUpNBTqdjZvWEChCINfgn_zzeL51AMl2wfRc_ua-BPOasUSSGmorEw7wbvBPxFDULpaSr96MzRES_RRuwmJJ9ow-8vnwX8mypIRL0yKHXVzCDIGZw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(28,58,48,0.15),transparent_50%)]"></div>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <p className="m-0 mb-3 text-[0.75rem] font-[family-name:var(--font-display)] font-bold uppercase tracking-[1px] text-[var(--honey)]">
              Kepuasan Pelanggan
            </p>
            <h3 className="m-0 mb-5 font-[family-name:var(--font-display)] text-[1.5rem] font-medium leading-[1.3] text-[var(--ink)]">
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

      <div className="relative z-10 mt-[70px] border-t border-[var(--line)] pt-12 text-center">
        <blockquote className="mx-auto m-0 max-w-3xl">
          <p className="m-0 font-[family-name:var(--font-display)] text-[1.15rem] italic leading-[1.7] text-[var(--ink-soft)] md:text-[1.3rem]">
            "Kesehatan keluarga adalah prioritas kami. Kami berkomitmen
            memberikan layanan homecare terbaik dengan standar profesional dan
            harga terjangkau."
          </p>
        </blockquote>
      </div>
    </section>
  );
}

export default Achievements;
