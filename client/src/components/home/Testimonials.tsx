import { useState, useRef, useCallback, useEffect } from "react";

const DRAG_THRESHOLD = 60;
const TRANSITION = "transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)";
const GAP = 22; // 1.4rem ≈ 22px

import React from "react";

type TestimonialsProps = {
  testimonialsRef?: React.RefObject<HTMLElement>;
};

export default function Testimonials({ testimonialsRef }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [testimonials, setTestimonials] = useState([
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
  ]);
  const [error, setError] = useState(null);

  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const dragStartX = useRef(0);
  const isDragging = useRef(false);

  const total = testimonials.length;

  // Responsive: 1 card di mobile (<768), 2 card di desktop
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      const mobile = window.innerWidth < 768; // pakai viewport width buat breakpoint
      setIsMobile(mobile);
      if (mobile) {
        // 1 card = full container width
        setCardWidth(w);
      } else {
        // 2 card + 1 gap
        setCardWidth(Math.floor((w - GAP) / 2));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Clamp currentIndex kalau isMobile berubah
  const cardsVisible = isMobile ? 1 : 2;
  const maxIndex = Math.max(0, total - cardsVisible);
  const canMove = total > cardsVisible;
  const canPrev = canMove;
  const canNext = canMove;

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || ""}/api/testimoni`,
        );
        if (!response.ok) throw new Error("Gagal memuat testimoni");
        const data = await response.json();
        const normalized = data.map((item) => ({
          id: item.id_testi ?? item.id,
          text: item.teks ?? item.text,
          author: item.author,
          role: item.latarBelakang ?? item.role ?? "",
          initial: item.initial,
        }));
        setTestimonials(normalized);
      } catch (fetchError) {
        console.error(fetchError);
        setError(
          fetchError.message || "Terjadi kesalahan saat memuat testimoni",
        );
      }
    }

    fetchTestimonials();
  }, []);

  const goNext = useCallback(() => {
    if (!canMove) return;
    setCurrentIndex((i) => (i + 1) % (maxIndex + 1));
  }, [canMove, maxIndex]);

  const goPrev = useCallback(() => {
    if (!canMove) return;
    setCurrentIndex((i) => (i - 1 + maxIndex + 1) % (maxIndex + 1));
  }, [canMove, maxIndex]);

  // Clamp index saat resize ubah mode
  useEffect(() => {
    setCurrentIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  // Pointer/touch drag
  const onPointerDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.clientX ?? e.touches?.[0]?.clientX;
    setDragging(true);
    setDragOffset(0);
  };

  const onPointerMove = useCallback(
    (e) => {
      if (!isDragging.current) return;
      const x = e.clientX ?? e.touches?.[0]?.clientX;
      if (x == null) return;
      const delta = x - dragStartX.current;
      if (!canMove) {
        setDragOffset(delta * 0.2);
        return;
      }
      setDragOffset(delta);
    },
    [canMove],
  );

  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setDragging(false);
    if (!canMove) {
      setDragOffset(0);
      return;
    }

    if (dragOffset < -DRAG_THRESHOLD) goNext();
    else if (dragOffset > DRAG_THRESHOLD) goPrev();
    setDragOffset(0);
  }, [dragOffset, canMove, goNext, goPrev]);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  // Dots: satu dot per "posisi" yang bisa di-navigate
  // maxIndex + 1 = jumlah posisi unik
  const dotCount = maxIndex + 1;

  return (
    <section
      className="scroll-fade-up mx-auto max-w-[1240px] px-[clamp(1.5rem,5vw,4rem)] py-[4.5rem]"
      id="testimonials"
      ref={testimonialsRef}
    >
      {error && (
        <div className="mb-6 rounded-[14px] border border-[#f2c7c2] bg-[#fff1f0] px-5 py-4 text-sm text-[#b02a37]">
          ⚠️ {error}
        </div>
      )}
      {/* Header */}
      <div className="mx-auto mt-0 mb-12 max-w-[42rem] text-center">
        <p className="eyebrow">Testimoni</p>
        <h3 className="m-0 font-[family-name:var(--font-display)] text-[clamp(1.55rem,2.4vw,2.05rem)] font-medium text-[var(--ink)]">
          Pelanggan merasa lebih tenang dan sehat
        </h3>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div
          className="overflow-hidden"
          ref={containerRef}
          style={{ touchAction: "pan-y" }}
        >
          <div
            ref={trackRef}
            className="flex"
            style={{
              gap: `${GAP}px`,
              transform: cardWidth
                ? `translateX(${-(currentIndex * (cardWidth + GAP)) + dragOffset}px)`
                : "none",
              transition: dragging ? "none" : TRANSITION,
              cursor: dragging ? "grabbing" : "grab",
              userSelect: "none",
            }}
            onPointerDown={onPointerDown}
            onTouchStart={(e) => {
              dragStartX.current = e.touches[0].clientX;
              isDragging.current = true;
              setDragging(true);
            }}
          >
            {testimonials.map((t, i) => {
              // Card visible = dalam rentang currentIndex sampai currentIndex + cardsVisible - 1
              const isVisible =
                i >= currentIndex && i < currentIndex + cardsVisible;

              return (
                <div
                  key={t.id}
                  className="flex-shrink-0 rounded-[18px] border border-[var(--line)] bg-[var(--card)] p-[1.8rem] transition-opacity duration-300"
                  style={{
                    width: cardWidth
                      ? `${cardWidth}px`
                      : isMobile
                        ? "100%"
                        : "calc(50% - 0.7rem)",
                    opacity: isVisible ? 1 : 0.35,
                    pointerEvents: isVisible ? "auto" : "none",
                  }}
                >
                  <div
                    className="mb-4 font-[family-name:var(--font-display)] text-[2.5rem] leading-none text-[#5b2333]/20 select-none"
                    aria-hidden="true"
                  >
                    "
                  </div>

                  <p className="m-0 mb-6 font-[family-name:var(--font-display)] text-[0.95rem] italic leading-[1.6] text-[var(--ink)]">
                    {t.text}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#5b2333]/10 text-[0.8rem] font-semibold text-[#5b2333]">
                      {t.initial}
                    </div>
                    <div>
                      <p className="m-0 text-[0.85rem] font-semibold text-[var(--ink)]">
                        {t.author}
                      </p>
                      <p className="m-0 text-[0.75rem] text-[var(--ink-soft)]">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nav + dots */}
        <div className="mt-6 flex items-center justify-between">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-transparent text-[var(--ink)] transition-[transform,border-color,background,opacity] duration-200 hover:-translate-y-1 hover:border-[var(--honey)] hover:bg-[var(--bg-alt)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0"
            onClick={goPrev}
            disabled={!canMove}
            aria-label="Testimonial sebelumnya"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="flex gap-2">
            {Array.from({ length: dotCount }).map((_, i) => (
              <button
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-6 bg-[#5b2333]"
                    : "w-2 bg-[var(--line)]"
                }`}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Pergi ke testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-transparent text-[var(--ink)] transition-[transform,border-color,background,opacity] duration-200 hover:-translate-y-1 hover:border-[var(--honey)] hover:bg-[var(--bg-alt)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0"
            onClick={goNext}
            disabled={!canMove}
            aria-label="Testimonial berikutnya"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
