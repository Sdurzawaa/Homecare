import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

interface ApiTestimonialItem {
  id_testi?: number;
  teks?: string;
  text?: string;
  author: string;
  latarBelakang?: string;
  role?: string;
  initial?: string;
}

const testimonialImages = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150",
];

const defaultTestimonials: Testimonial[] = [
  {
    text: "Layanan homecare ini membuat karyawan kami dapat pulih tanpa harus kehilangan waktu bersama keluarga.",
    image: testimonialImages[0],
    name: "Briana Patton",
    role: "Operations Manager",
  },
  {
    text: "Konsultasi dokter di rumah membuat keluarga kami lebih nyaman dan percaya diri menjalani perawatan.",
    image: testimonialImages[1],
    name: "Bilal Ahmed",
    role: "IT Manager",
  },
  {
    text: "Tim perawat profesional, ramah, dan sangat berpengalaman. Ibu saya sekarang jauh lebih tenang.",
    image: testimonialImages[2],
    name: "Saman Malik",
    role: "Customer Support Lead",
  },
  {
    text: "Integrasi layanan yang mulus membuat proses perawatan keluarga kami jadi jauh lebih efisien.",
    image: testimonialImages[3],
    name: "Omar Raza",
    role: "CEO",
  },
  {
    text: "Fitur dan respons tim yang cepat benar-benar mengubah cara kami mengurus perawatan di rumah.",
    image: testimonialImages[4],
    name: "Zainab Hussain",
    role: "Project Manager",
  },
  {
    text: "Proses pendaftaran yang lancar melebihi ekspektasi kami, semua jadi lebih mudah dan cepat.",
    image: testimonialImages[5],
    name: "Aliza Khan",
    role: "Business Analyst",
  },
  {
    text: "Desain layanan yang ramah pengguna membuat keluarga kami merasa terbantu sejak hari pertama.",
    image: testimonialImages[6],
    name: "Farhan Siddiqui",
    role: "Marketing Director",
  },
  {
    text: "Mereka memahami kebutuhan kami dan memberikan solusi yang melebihi ekspektasi.",
    image: testimonialImages[7],
    name: "Sana Sheikh",
    role: "Sales Manager",
  },
  {
    text: "Kepercayaan diri kami meningkat drastis sejak menggunakan layanan homecare ini.",
    image: testimonialImages[8],
    name: "Hassan Ali",
    role: "E-commerce Manager",
  },
];

const API_URL = import.meta.env.VITE_API_URL || "";

const mapApiTestimonial = (item: ApiTestimonialItem, index: number): Testimonial => ({
  text: item.teks ?? item.text ?? "",
  image: testimonialImages[index % testimonialImages.length],
  name: item.author,
  role: item.latarBelakang ?? item.role ?? "",
});

const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.ul
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-transparent transition-colors duration-300 list-none m-0 p-0"
      >
        {[...new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, image, name, role }, i) => (
              <motion.li
                key={`${index}-${i}`}
                aria-hidden={index === 1 ? "true" : "false"}
                tabIndex={index === 1 ? -1 : 0}
                whileHover={{
                  scale: 1.03,
                  y: -8,
                  boxShadow: "0 24px 48px -20px rgba(28,58,48,0.25)",
                  transition: { type: "spring", stiffness: 400, damping: 17 },
                }}
                whileFocus={{
                  scale: 1.03,
                  y: -8,
                  boxShadow: "0 24px 48px -20px rgba(28,58,48,0.25)",
                  transition: { type: "spring", stiffness: 400, damping: 17 },
                }}
                className="p-10 rounded-3xl border border-[var(--line,#E2E8E6)] shadow-[0_16px_30px_-22px_rgba(28,58,48,0.15)] max-w-xs w-full bg-white transition-all duration-300 cursor-default select-none group focus:outline-none focus:ring-2 focus:ring-[var(--pine,#1c3a30)]/30"
              >
                <blockquote className="m-0 p-0">
                  <p className="text-[var(--ink-soft,#4A5551)] leading-relaxed font-normal m-0 transition-colors duration-300">
                    {text}
                  </p>
                  <footer className="flex items-center gap-3 mt-6">
                    <img
                      width={40}
                      height={40}
                      src={image}
                      alt={`Avatar of ${name}`}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-[var(--bg-alt,#FAF7F0)] group-hover:ring-[var(--pine,#1c3a30)]/30 transition-all duration-300 ease-in-out"
                    />
                    <div className="flex flex-col">
                      <cite className="font-semibold not-italic tracking-tight leading-5 text-[var(--pine-deep,#1c3a30)] transition-colors duration-300">
                        {name}
                      </cite>
                      <span className="text-sm leading-5 tracking-tight text-[var(--ink-soft,#4A5551)] mt-0.5 transition-colors duration-300">
                        {role}
                      </span>
                    </div>
                  </footer>
                </blockquote>
              </motion.li>
            ))}
          </React.Fragment>
        ))]}
      </motion.ul>
    </div>
  );
};

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(`${API_URL}/api/testimoni`);
        if (!response.ok) throw new Error("Gagal memuat testimoni");

        const data: ApiTestimonialItem[] = await response.json();
        const normalized = data.map((item, index) => mapApiTestimonial(item, index));
        if (normalized.length > 0) {
          setTestimonials(normalized);
        }
      } catch (fetchError) {
        console.error(fetchError);
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : String(fetchError ?? "Terjadi kesalahan saat memuat testimoni");
        setError(message);
      }
    };

    fetchTestimonials();
  }, []);

  const columns = useMemo(() => {
    return [
      testimonials.slice(0, 3),
      testimonials.slice(3, 6),
      testimonials.slice(6, 9),
    ];
  }, [testimonials]);

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="bg-transparent py-24 relative overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 50, rotate: -2 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.8 },
        }}
        className="container px-4 z-10 mx-auto"
      >
        <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-16">
          <div className="flex justify-center">
            <div className="border border-[var(--line,#E2E8E6)] py-1 px-4 rounded-full text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--pine,#1c3a30)] bg-[var(--bg-alt,#FAF7F0)] transition-colors">
              Testimoni
            </div>
          </div>

          <h2
            id="testimonials-heading"
            className="font-[family-name:var(--font-display,'Source_Serif_4',serif)] text-[clamp(1.9rem,3.6vw,3rem)] font-semibold tracking-tight mt-6 text-center text-[var(--pine-deep,#1c3a30)] leading-tight transition-colors"
          >
            Apa Kata Mereka
          </h2>
          <p className="text-center mt-5 text-[var(--ink-soft,#4A5551)] text-[1.05rem] leading-relaxed max-w-sm transition-colors">
            Ribuan keluarga sudah merasakan kenyamanan perawatan medis langsung di rumah bersama kami.
          </p>
        </div>

        <div
          className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[740px] overflow-hidden"
          role="region"
          aria-label="Scrolling Testimonials"
        >
          <TestimonialsColumn testimonials={columns[0]} duration={15} />
          <TestimonialsColumn testimonials={columns[1]} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={columns[2]} className="hidden lg:block" duration={17} />
        </div>

        {error && (
          <div className="mt-8 rounded-[14px] border border-[#f3c6d4] bg-[#fdf1f4] px-5 py-4 text-sm text-[#b10f4c]">
            ⚠️ {error}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default function TestimonialV2() {
  return (
    <div className="w-screen min-h-screen bg-white transition-colors duration-300 flex flex-col justify-center relative selection:bg-[var(--pine,#1c3a30)] selection:text-white">
      <TestimonialsSection />
    </div>
  );
}