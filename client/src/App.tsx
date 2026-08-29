import "./App.css";
import { Suspense, lazy, useEffect, useState } from "react";
import { AnimatedNavFramer } from "@/components/ui/navigation-menu";
import Footer from "@/components/ui/Footer";
import Hero from "./components/Hero-Panel";
import Achievements from "./components/Achievement";
import Admin from "./components/admin/Admin";
import { useScrollAnimation } from "./hooks/useScrollAnimation";

const Pricing = lazy(() => import("./components/Pricing"));
const Testimonials = lazy(() => import("./components/Testimonials"));
const Contact = lazy(() => import("./components/Contact"));

const defaultSections = {
  hero: {
    title: "Kenyamanan Perawatan Medis di Rumah Anda",
    description:
      "Menghadirkan tenaga profesional medis berpengalaman untuk merawat orang terkasih dengan penuh kasih sayang dan kenyamanan maksimal.",
    image: "/Person.jpg",
    badge: "Dipercaya 1000+ keluarga",
    cta_label: "Konsultasi Gratis",
    cta_link: "#contact",
    secondary_cta_label: "Lihat Layanan",
    secondary_cta_link: "#services",
  },
  about: {
    title: "Homecare modern untuk kebutuhan kesehatan keluarga",
    description:
      "Tim kami terlatih dan berpengalaman dalam memberikan perawatan terbaik untuk lansia, ibu hamil, dan pasien pemulihan dengan sentuhan personal.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDmUjmMxizXF02mWPoncUAQ6uxWYBZb7YMVlJv9kZ8gTN1sghTRr5IemG5-Pih13TPi4Hc3wQsIDresCXKeGY_xkciEp0sWS_CLDUvDomFRDtshdQZKtuvzxo4qBpFMvUWKHajP9npVLYQzd7J40iLA3RtHiUGOD4mBJ1-xrqqwrB-Hjxk0WFzKAAn07n8Oz4fJR1lXc7lAo_zuyggdPQ6qfM5XsNwrh0Uq-yUj1RPsXhcbOGWEIW7P_w",
    image_2:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDRaWb14VsQvZNL356-cp3yLk_7zMnGCERhSjQk9IdSvAU_1BcJwm8F37KnaWfSDyNn4ZNuGnpbMZTDnWt-xknYOr6sTTlQ2wdhZO-f5iw8mYN2b3gzaWb_pgc_1Sdvy4aPQS1mfETUCzC_JuYwGG5t89toawmmL0gDn6-0N4Hbga8pC5VL_VaiiMZoBjYDZEwnNCzwsMS3wG3qfOQVrC7lRVnZoVXbv_9PpoRDiqBgEeHEnxTT0JUdlg",
    image_3:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuClz7KaBBUmaxbwURQ07RcddQ0oPFIlB7MzyKhrxk3rkmiK1PSq_8cnwUi2-qH70ICZgpl_AClFJceJVvE8tjILhabxYP61F3c7xfQzYlATCqZEnJEftbz5p4T4NOutPpb9JLiDobUpNBTqdjZvWEChCINfgn_zzeL51AMl2wfRc_ua-BPOasUSSGmorEw7wbvBPxFDULpaSr96MzRES_RRuwmJJ9ow-8vnwX8mypIRL0yKHXVzCDIGZw",
  },
  contact: {},
  footer: {
    brand: "Homecare",
    description:
      "Solusi perawatan kesehatan profesional di kenyamanan rumah Anda. Berkualitas, tepercaya, dan penuh kasih sayang.",
    phone: "+62 858-9200-6905",
    address: "Jl. Kebon Mangga 1 No. 1 Rt 006/007 Cipulir, Kebayoran lama",
  },
};

const mergeSiteSections = (data: Record<string, any> = {}) => ({
  hero: { ...defaultSections.hero, ...(data.hero ?? {}) },
  about: { ...defaultSections.about, ...(data.about ?? {}) },
  contact: { ...defaultSections.contact, ...(data.contact ?? {}) },
  footer: { ...defaultSections.footer, ...(data.footer ?? {}) },
});

function App() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const isAdminPath = pathname === "/admin" || pathname === "/admin/";
  const isValidPath = pathname === "/" || pathname === "/index.html" || isAdminPath;
  const [siteSections, setSiteSections] = useState(defaultSections);
  const [siteSectionsReady, setSiteSectionsReady] = useState(false);
  const heroRef = useScrollAnimation({ threshold: 0.3 });
  const achievementsRef = useScrollAnimation({ threshold: 0.1 });
  const testimonialsRef = useScrollAnimation({ threshold: 0.1 });
  const contactRef = useScrollAnimation({ threshold: 0.3 });
  const pricingRef = useScrollAnimation({ threshold: 0, rootMargin: "0px 0px 10% 0px" });
  const achievementsCard1 = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const achievementsCard2 = useScrollAnimation<HTMLDivElement>({ threshold: 0.6 });
  const achievementsCard3 = useScrollAnimation<HTMLDivElement>({ threshold: 1 });

  useEffect(() => {
    if (typeof window === "undefined" || isAdminPath) return;

    const controller = new AbortController();

    const loadSiteSections = () => {
      fetch("/api/public/site-sections", { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (!data) return;
          const nextSections = mergeSiteSections(data);
          setSiteSections((currentSections) =>
            JSON.stringify(currentSections) === JSON.stringify(nextSections)
              ? currentSections
              : nextSections,
          );
        })
        .catch((error) => {
          if (error.name !== "AbortError") return undefined;
          return undefined;
        })
        .finally(() => {
          if (!controller.signal.aborted) setSiteSectionsReady(true);
        });
    };

    loadSiteSections();
    const handleFocus = () => loadSiteSections();
    window.addEventListener("focus", handleFocus);

    return () => {
      controller.abort();
      window.removeEventListener("focus", handleFocus);
    };
  }, [isAdminPath]);

  if (isAdminPath) {
    return <Admin />;
  }

  if (!isValidPath) {
    return (
      <div className="page-shell">
        <main className="min-h-screen flex items-center justify-center p-6">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-10 text-center shadow-xl shadow-slate-200/40">
            <h1 className="mb-4 text-5xl font-bold">404</h1>
            <p className="mb-6 text-lg text-slate-700">Halaman tidak ditemukan.</p>
            <a
              href="/"
              className="inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Kembali ke beranda
            </a>
          </div>
        </main>
      </div>
    );
  }

  if (!siteSectionsReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--line)] border-t-[var(--pine)]"
          role="status"
          aria-label="Memuat halaman"
        />
      </div>
    );
  }

  return (
    <div className="page-shell">
      {/* Navbar Section */}
      <AnimatedNavFramer />
      {/* Main Content Section */}
      <main>
        {/* Hero Section */}
        <Hero heroRef={heroRef} content={siteSections.hero} />
        {/* Pricing Section */}
        <Suspense fallback={<div className="h-[28rem] w-full" aria-hidden="true" />}>
          <Pricing pricingRef={pricingRef} />
        </Suspense>
        {/* Achievements Section */}
        <Achievements
          achievementsRef={achievementsRef}
          achievementsCard1={achievementsCard1}
          achievementsCard2={achievementsCard2}
          achievementsCard3={achievementsCard3}
          content={siteSections.about}
        />
        {/* Testimonials Section */}
        <Suspense fallback={<div className="h-[24rem] w-full" aria-hidden="true" />}>
          <Testimonials testimonialsRef={testimonialsRef} />
        </Suspense>

        {/* Contact Section */}
        <Suspense fallback={<div className="h-[28rem] w-full" aria-hidden="true" />}>
          <Contact contactRef={contactRef} content={siteSections.contact} />
        </Suspense>
      </main>

      <Footer content={siteSections.footer} />
    </div>
  );
}

export default App;
