import { useEffect, useMemo, useState, type Ref } from "react";

interface Testimonial {
  id: number | string;
  text: string;
  author: string;
  role: string;
  initial: string;
}

interface TestimonialsProps {
  testimonialsRef?: Ref<HTMLElement | null>;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    text: "Layanan homecare ini membuat karyawan kami dapat pulih tanpa harus keluar kantor. Sangat membantu untuk dengan waktu terbatas.",
    author: "Siti",
    role: "Pemilik Café",
    initial: "S",
  },
  {
    id: 2,
    text: "Konsultasi dokter di rumah membuat keluarga kami lebih nyaman dan percaya diri. Respon cepat dan personal.",
    author: "Budi",
    role: "Mitra Usaha",
    initial: "B",
  },
  {
    id: 3,
    text: "Tim perawat profesional, ramah, dan sangat berpengalaman. Ibu saya sekarang lebih tenang dan keluarga juga merasa lega.",
    author: "Ani",
    role: "Staff Perusahaan",
    initial: "A",
  },
];

// Semakin kecil angkanya, semakin cepat marquee berjalan.
const MARQUEE_DURATION_SECONDS = 10;
const MARQUEE_COLUMN_OFFSETS = [0, 4, 2];

function StarRow() {
  return (
    <div className="mb-4 flex items-center gap-1 text-[var(--honey)]" aria-label="Rating 5 dari 5 bintang">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.5l2.9 6.4 7 .7-5.3 4.7 1.6 6.9-6.2-3.6-6.2 3.6 1.6-6.9-5.3-4.7 7-.7z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <li className="group/card w-full max-w-xs flex-shrink-0 select-none rounded-[20px] border border-[var(--line)] bg-[var(--card)] p-8 shadow-[0_10px_30px_-18px_rgba(28,58,48,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-20px_rgba(28,58,48,0.3)] focus-within:-translate-y-1.5">
      <span
        aria-hidden="true"
        className="mb-3 block font-[family-name:var(--font-display)] text-[2.25rem] leading-none text-[var(--honey)]/25"
      >
        "
      </span>

      <StarRow />

      <p className="m-0 mb-6 font-[family-name:var(--font-display)] text-[0.92rem] italic leading-[1.65] text-[var(--ink)]">
        {testimonial.text}
      </p>

      <div className="flex items-center gap-3 border-t border-[var(--line)] pt-5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--pine)]/10 text-[0.85rem] font-semibold text-[var(--pine)] ring-2 ring-transparent transition-colors duration-300 group-hover/card:ring-[var(--pine)]/25">
          {testimonial.initial}
        </div>
        <div>
          <p className="m-0 text-[0.88rem] font-semibold text-[var(--ink)]">{testimonial.author}</p>
          <p className="m-0 text-[0.75rem] text-[var(--ink-soft)]">{testimonial.role}</p>
        </div>
      </div>
    </li>
  );
}

function TestimonialColumn({
  items,
  duration,
  className = "",
}: {
  items: Testimonial[];
  duration: number;
  className?: string;
}) {
  return (
    <div className={`group h-full overflow-hidden ${className}`}>
      <ul
        className="testimonial-track m-0 flex list-none flex-col gap-6 p-0 pb-6 group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s` }}
      >
        {[0, 1].map((dup) =>
          items.map((t, i) => (
            <TestimonialCard key={`${dup}-${t.id}-${i}`} testimonial={t} />
          )),
        )}
      </ul>
    </div>
  );
}

function splitIntoColumns(items: Testimonial[], columnCount: number) {
  const columns: Testimonial[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, i) => {
    columns[i % columnCount].push(item);
  });
  return columns;
}

export default function Testimonials({ testimonialsRef }: TestimonialsProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || ""}/api/public/testimoni`,
        );
        if (!response.ok) throw new Error("Gagal memuat testimoni");
        const data = (await response.json()) as Array<Record<string, unknown>>;
        const normalized = data.map((item) => {
          const author = String(item.author ?? "").trim();
          const initial = String(item.initial ?? "").trim();
          return {
            id: typeof item.id_testi === "number" ? item.id_testi : (item.id as number | string),
            text: typeof item.teks === "string" ? item.teks : (item.text as string),
            author,
            role:
              typeof item.latarBelakang === "string"
                ? item.latarBelakang
                : ((item.role as string) ?? ""),
            initial: initial !== "" ? initial : (author !== "" ? author.charAt(0).toUpperCase() : "?"),
          };
        }) as Testimonial[];
        if (normalized.length > 0) setTestimonials(normalized);
      } catch (fetchError: unknown) {
        console.error(fetchError);
        const message = fetchError instanceof Error ? fetchError.message : String(fetchError);
        setError(message || "Terjadi kesalahan saat memuat testimoni");
      }
    }

    fetchTestimonials();
  }, []);

  // Marquee cuma masuk akal kalau kontennya cukup banyak buat 3 kolom.
  // Kalau dikit, fallback ke grid statis biar ga awkward loop 1 kartu doang.
  const useMarquee = testimonials.length >= 6;

  const columns = useMemo(
    () => (useMarquee ? splitIntoColumns(testimonials, 3) : []),
    [testimonials, useMarquee],
  );

  return (
    <section
      className="scroll-fade-up relative mx-auto max-w-[1240px] overflow-hidden px-[clamp(1.5rem,5vw,4rem)] py-[4.5rem]"
      id="testimonials"
      ref={testimonialsRef}
    >
      <style>{`
        @keyframes testimonial-marquee {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
        .testimonial-track {
          animation-name: testimonial-marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .testimonial-track {
            animation: none !important;
          }
        }
      `}</style>

      {error && (
        <div className="mb-6 rounded-[14px] border border-[#f2c7c2] bg-[#fff1f0] px-5 py-4 text-sm text-[#b02a37]">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="8" x2="12" y2="13" />
              <circle cx="12" cy="17" r="1" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto mb-14 max-w-[42rem] text-center">
        <p className="eyebrow">Testimoni</p>
        <h3 className="m-0 font-[family-name:var(--font-display)] text-[clamp(1.55rem,2.4vw,2.05rem)] font-medium text-[var(--ink)]">
          Pelanggan merasa lebih tenang dan sehat
        </h3>
      </div>

      {useMarquee ? (
        <div
          className="relative flex h-[640px] justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]"
          role="region"
          aria-label="Testimoni pelanggan"
        >
          <TestimonialColumn
            items={columns[0]}
            duration={MARQUEE_DURATION_SECONDS + MARQUEE_COLUMN_OFFSETS[0]}
          />
          <TestimonialColumn
            items={columns[1]}
            duration={MARQUEE_DURATION_SECONDS + MARQUEE_COLUMN_OFFSETS[1]}
            className="hidden md:block"
          />
          <TestimonialColumn
            items={columns[2]}
            duration={MARQUEE_DURATION_SECONDS + MARQUEE_COLUMN_OFFSETS[2]}
            className="hidden lg:block"
          />
        </div>
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </ul>
      )}
    </section>
  );
}