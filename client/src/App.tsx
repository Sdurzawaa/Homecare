import "./App.css";
import { AnimatedNavFramer } from "@/components/ui/navigation-menu";
import Hero from "./components/home/Hero-Panel";
import Achievements from "./components/home/Achievement";
import TestimonialV2 from "@/components/ui/testimonial-v2";
import Pricing from "./components/home/Pricing";

import Contact from "./components/home/Contact";
import Footer from "./components/home/Footer";
import { useScrollAnimation } from "./hooks/useScrollAnimation";

function App() {
  // Scroll animation refs untuk setiap section
  const heroRef = useScrollAnimation({ threshold: 0.3 });
  const achievementsRef = useScrollAnimation({ threshold: 0.1 });
  const contactRef = useScrollAnimation({ threshold: 0.3 });
  const pricingRef = useScrollAnimation({ threshold: 0.1 });
  const achievementsCard1 = useScrollAnimation({ threshold: 0.2 });
  const achievementsCard2 = useScrollAnimation({ threshold: 0.6 });
  const achievementsCard3 = useScrollAnimation({ threshold: 1 });

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

        {/* Contact Section */}
        <Contact contactRef={contactRef} />

        {/* Testimonials Section */}
        <TestimonialV2 />
      </main>

      <Footer />
    </div>
  );
}

export default App;
