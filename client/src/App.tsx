import "./App.css";
import { AnimatedNavFramer } from "@/components/ui/navigation-menu";
import Footer from "@/components/ui/Footer";
import Hero from "./components/Hero-Panel";
import Achievements from "./components/Achievement";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";

import Contact from "./components/Contact";
import { useScrollAnimation } from "./hooks/useScrollAnimation";

function App() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const isValidPath = pathname === "/" || pathname === "/index.html";

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

  // Scroll animation refs untuk setiap section
  const heroRef = useScrollAnimation({ threshold: 0.3 });
  const achievementsRef = useScrollAnimation({ threshold: 0.1 });
  const testimonialsRef = useScrollAnimation({ threshold: 0.1 });
  const contactRef = useScrollAnimation({ threshold: 0.3 });
  const pricingRef = useScrollAnimation({ threshold: 0.1 });
  const achievementsCard1 = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const achievementsCard2 = useScrollAnimation<HTMLDivElement>({ threshold: 0.6 });
  const achievementsCard3 = useScrollAnimation<HTMLDivElement>({ threshold: 1 });

  return (
    <div className="page-shell">
      {/* Navbar Section */}
      <AnimatedNavFramer />
      {/* Main Content Section */}
      <main>
        {/* Hero Section */}
        <Hero heroRef={heroRef} />
        {/* Pricing Section */}
        <Pricing pricingRef={pricingRef} />
        {/* Achievements Section */}
        <Achievements
          achievementsRef={achievementsRef}
          achievementsCard1={achievementsCard1}
          achievementsCard2={achievementsCard2}
          achievementsCard3={achievementsCard3}
        />
        {/* Testimonials Section */}
        <Testimonials testimonialsRef={testimonialsRef} />

        {/* Contact Section */}
        <Contact contactRef={contactRef} />
      </main>

      <Footer />
    </div>
  );
}

export default App;
