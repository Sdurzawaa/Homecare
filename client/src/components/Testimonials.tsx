import { useEffect, useMemo, useState, type FormEvent, type Ref } from "react";

interface Testimonial {
  id: number | string;
  text: string;
  author: string;
  role: string;
  initial: string;
}

interface TestimonialFormState {
  author: string;
  role: string;
  text: string;
  initial: string;
}

interface TestimonialsProps {
  testimonialsRef?: Ref<HTMLElement | null>;
  showForm?: boolean;
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
const MARQUEE_DURATION_SECONDS = 30;
const MARQUEE_ROW_OFFSETS = [0, 4];

function StarRow() {
  return (
    <div className="mb-4 flex items-center gap-1 text-[var(--honey-deep)]" aria-label="Rating 5 dari 5 bintang">
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
    <li className="group/card w-[min(calc(100vw-3rem),300px)] flex-shrink-0 select-none rounded-[20px] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_10px_30px_-18px_rgba(119,38,53,0.25)] transition-shadow duration-300 hover:shadow-[0_24px_48px_-20px_rgba(119,38,53,0.3)] sm:w-[min(45vw,340px)] sm:p-5 lg:w-[min(30vw,360px)]">
      <StarRow />

      <p className="m-0 mb-5 font-[family-name:var(--font-body)] text-[0.92rem] italic leading-[1.65] text-[var(--ink)]">
        {testimonial.text}
      </p>

      <div className="flex items-center gap-3 border-t border-[var(--line)] pt-4">
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

function TestimonialRow({
  items,
  duration,
  reverse = false,
  className = "",
}: {
  items: Testimonial[];
  duration: number;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={`group w-full overflow-hidden ${className}`}>
      <ul
        className={`testimonial-track m-0 flex w-max list-none gap-6 p-0 [will-change:transform] group-hover:[animation-play-state:paused] ${reverse ? "testimonial-track-reverse" : ""}`}
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

function splitIntoRows(items: Testimonial[], rowCount: number) {
  const rows: Testimonial[][] = Array.from({ length: rowCount }, () => []);
  items.forEach((item, i) => {
    rows[i % rowCount].push(item);
  });
  return rows;
}

export default function Testimonials({ testimonialsRef, showForm = false }: TestimonialsProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<TestimonialFormState>({
    author: "",
    role: "",
    text: "",
    initial: "",
  });

  const normalizeTestimonials = (data: Array<Record<string, unknown>>) =>
    data.map((item) => {
      const author = String(item.author ?? "").trim();
      const initial = String(item.initial ?? "").trim();
      return {
        id: typeof item.id_testi === "number" ? item.id_testi : (item.id as number | string),
        text: typeof item.teks === "string" ? item.teks : (item.text as string),
        author,
        role:
          typeof item.latarbelakang === "string"
            ? item.latarbelakang
            : ((item.role as string) ?? ""),
        initial: initial !== "" ? initial : (author !== "" ? author.charAt(0).toUpperCase() : "?"),
      };
    }) as Testimonial[];

  const fetchTestimonials = async (signal?: AbortSignal) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/public/testimoni`,
        { cache: "no-store", signal },
      );
      if (!response.ok) throw new Error("Gagal memuat testimoni");
      const data = (await response.json()) as Array<Record<string, unknown>>;
      const normalized = normalizeTestimonials(data);
      if (normalized.length > 0) setTestimonials(normalized);
    } catch (fetchError: unknown) {
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
        return;
      }
      console.error(fetchError);
      const message = fetchError instanceof Error ? fetchError.message : String(fetchError);
      setError(message || "Terjadi kesalahan saat memuat testimoni");
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchTestimonials(controller.signal);
    return () => controller.abort();
  }, []);

  const handleFormChange = (field: keyof TestimonialFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const trimmedText = form.text.trim();
    const trimmedAuthor = form.author.trim();
    const trimmedRole = form.role.trim();
    const trimmedInitial = form.initial.trim();

    if (!trimmedText || !trimmedAuthor || !trimmedRole || !trimmedInitial) {
      setSubmitError("Semua field harus diisi sebelum mengirim testimoni.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/public/testimoni`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teks: trimmedText,
          author: trimmedAuthor,
          latarBelakang: trimmedRole,
          initial: trimmedInitial,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Gagal mengirim testimoni");
      }

      setForm({ author: "", role: "", text: "", initial: "" });
      setSubmitSuccess("Terima kasih! Testimoni Anda berhasil terkirim dan akan ditinjau.");
      await fetchTestimonials();
      setError(null);
    } catch (submitErrorCaught: unknown) {
      const message = submitErrorCaught instanceof Error ? submitErrorCaught.message : String(submitErrorCaught);
      setSubmitError(message || "Terjadi kesalahan saat mengirim testimoni.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Marquee cuma masuk akal kalau kontennya cukup banyak buat 2 baris.
  // Kalau dikit, fallback ke grid statis biar ga awkward loop 1 kartu doang.
  const useMarquee = testimonials.length >= 6;

  const rows = useMemo(
    () => (useMarquee ? splitIntoRows(testimonials, 2) : []),
    [testimonials, useMarquee],
  );

  return (
    <section
      className="scroll-fade-up relative mx-auto max-w-[1240px] overflow-hidden px-[clamp(1.5rem,5vw,4rem)] py-[4.5rem]"
      id="testimonials"
      ref={testimonialsRef}
    >
      <style>{`
        @keyframes testimonial-marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-50% - 0.75rem)); }
        }
        @keyframes testimonial-marquee-right {
          from { transform: translateX(calc(-50% - 0.75rem)); }
          to { transform: translateX(0); }
        }
        .testimonial-track {
          animation-name: testimonial-marquee-left;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .testimonial-track-reverse {
          animation-name: testimonial-marquee-right;
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
        <h3 className="m-0 font-[family-name:var(--font-heading)] text-[clamp(1.55rem,2.4vw,2.05rem)] font-medium text-[var(--ink)]">
          Pelanggan merasa lebih tenang dan sehat
        </h3>
      </div>

      {showForm && (
        <div className="mb-12 rounded-[24px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_40px_-28px_rgba(119,38,53,0.35)] sm:p-7">
          <div className="mb-6 text-center sm:text-left">
            <p className="eyebrow mb-2">Bagikan pengalaman</p>
            <h4 className="m-0 text-[1.35rem] font-medium text-[var(--ink)]">Tulis testimoni Anda</h4>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink)]">
              Nama
              <input
                value={form.author}
                onChange={(event) => handleFormChange("author", event.target.value)}
                className="rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-[0.95rem] text-[var(--ink)] outline-none transition focus:border-[var(--pine)] focus:ring-2 focus:ring-[var(--pine)]/20"
                placeholder="Masukkan nama Anda"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink)]">
              Latar belakang / profesi
              <input
                value={form.role}
                onChange={(event) => handleFormChange("role", event.target.value)}
                className="rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-[0.95rem] text-[var(--ink)] outline-none transition focus:border-[var(--pine)] focus:ring-2 focus:ring-[var(--pine)]/20"
                placeholder="Contoh: Ibu rumah tangga"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink)] md:col-span-2">
              Testimoni
              <textarea
                value={form.text}
                onChange={(event) => handleFormChange("text", event.target.value)}
                rows={4}
                className="resize-none rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-[0.95rem] text-[var(--ink)] outline-none transition focus:border-[var(--pine)] focus:ring-2 focus:ring-[var(--pine)]/20"
                placeholder="Ceritakan pengalaman Anda menggunakan layanan kami..."
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink)]">
              Inisial
              <input
                value={form.initial}
                maxLength={2}
                onChange={(event) => handleFormChange("initial", event.target.value.toUpperCase())}
                className="rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-[0.95rem] text-[var(--ink)] uppercase outline-none transition focus:border-[var(--pine)] focus:ring-2 focus:ring-[var(--pine)]/20"
                placeholder="A"
              />
            </label>

            <div className="flex flex-col justify-end gap-3 md:col-span-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full bg-[var(--pine)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-[0.97] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Testimoni"}
              </button>
            </div>
          </form>

          {(submitError || submitSuccess) && (
            <div
              className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                submitError
                  ? "border border-[#f2c7c2] bg-[#fff1f0] text-[#b02a37]"
                  : "border border-[#cfe9dc] bg-[#ebfff4] text-[#0f7a3f]"
              }`}
            >
              {submitError || submitSuccess}
            </div>
          )}
        </div>
      )}

      {useMarquee ? (
        <div
          className="relative flex flex-col gap-6 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
          role="region"
          aria-label="Testimoni pelanggan"
        >
          <TestimonialRow
            items={rows[0]}
            duration={MARQUEE_DURATION_SECONDS + MARQUEE_ROW_OFFSETS[0]}
          />
          <TestimonialRow
            items={rows[1]}
            duration={MARQUEE_DURATION_SECONDS + MARQUEE_ROW_OFFSETS[1]}
            reverse
          />
        </div>
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </ul>
      )}

      {!showForm && (
        <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-[22px] border border-[var(--line)] bg-[var(--card)] px-5 py-5 text-center shadow-[0_18px_40px_-28px_rgba(119,38,53,0.35)] sm:px-7">
          <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--pine)]">
            Umpan balik pelanggan
          </p>
          <a
            href="/form/testimoni"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--pine)] px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:brightness-[0.97]"
          >
            Berikan tanggapan?
            <span aria-hidden="true">→</span>
          </a>
        </div>
      )}
    </section>
  );
}