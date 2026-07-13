import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Modal from "./Modal";

const WHATSAPP_NUMBER = "6285773780406";
const API_URL = import.meta.env.VITE_API_URL || "";

const categoryInfo = {
  Semua: {
    title: "Paket Layanan Pilihan",
    description:
      "Temukan perawatan ibu dan bayi yang tersedia untuk kehamilan, persalinan, nifas, bayi baru lahir, imunisasi, dan keluarga berencana. Semua layanan ditangani langsung oleh bidan berpengalaman dan bisa dipesan kapan saja sesuai kebutuhan Anda.",
  },
  "Perawatan Kehamilan": {
    title: "Perawatan Kehamilan",
    description:
      "Layanan pemeriksaan dan dukungan kehamilan, termasuk monitoring janin, gizi, dan penanganan keluhan agar ibu tetap nyaman selama masa hamil. Cocok untuk pemeriksaan rutin bulanan maupun konsultasi keluhan mendadak.",
  },
  Persalinan: {
    title: "Pendampingan Persalinan",
    description:
      "Layanan support penuh pada proses persalinan normal, IMD, dan perawatan luka jalan lahir untuk kelahiran yang aman dan nyaman. Bidan mendampingi dari awal proses hingga bayi lahir dengan selamat, di rumah maupun fasilitas kesehatan.",
  },
  "Perawatan Nifas": {
    title: "Perawatan Nifas",
    description:
      "Perawatan pasca melahirkan untuk memulihkan tubuh ibu, mendukung produksi ASI, dan mendeteksi tanda bahaya nifas sejak dini. Meliputi kunjungan rutin, pijat oksitosin, hingga konsultasi menyusui.",
  },
  "Perawatan Bayi Baru Lahir": {
    title: "Perawatan Bayi Baru Lahir",
    description:
      "Layanan neonatus, perawatan tali pusat, pijat bayi, dan pemeriksaan tumbuh kembang untuk menjaga kesehatan si kecil sejak awal. Membantu orang tua baru merasa lebih tenang dalam merawat bayi di rumah.",
  },
  Imunisasi: {
    title: "Layanan Imunisasi",
    description:
      "Pemberian vaksin dasar, booster, dan suntik awal untuk menjaga kekebalan tubuh bayi dan anak sesuai jadwal nasional. Jadwal imunisasi dipantau agar tidak ada yang terlewat.",
  },
  "Keluarga Berencana": {
    title: "Keluarga Berencana",
    description:
      "Konsultasi dan prosedur KB untuk rencana keluarga yang sehat dengan pilihan metode kontrasepsi yang tepat dan aman. Termasuk pemasangan, pelepasan, hingga penggantian metode sesuai kondisi tubuh.",
  },
  "Kesehatan Reproduksi": {
    title: "Kesehatan Reproduksi",
    description:
      "Layanan pemeriksaan dan konsultasi reproduksi untuk deteksi dini, skrining pra-nikah, dan edukasi kesehatan wanita. Membantu menjaga kesehatan reproduksi di setiap fase kehidupan.",
  },
};

// Urutan kategori tetap & konsisten, gak tergantung urutan data dari API
const CATEGORY_ORDER = Object.keys(categoryInfo);

function formatDuration(minutes: number) {
  if (minutes >= 1440) {
    const days = Math.floor(minutes / 1440);
    return days === 1 ? "24 jam" : `${days} hari`;
  }
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest > 0 ? `${hours} jam ${rest} menit` : `${hours} jam`;
  }
  return `${minutes} menit`;
}

function buildWhatsAppLink(title: string, price: number) {
  const message = `Halo, saya tertarik dengan layanan "${title}" (Rp${price.toLocaleString("id-ID")}). Apakah bisa dibantu info lebih lanjut?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[16px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="aspect-[4/3] w-full bg-[var(--bg-alt)]" />
      <div className="space-y-3 p-[1.8rem]">
        <div className="h-3 w-1/3 rounded bg-[var(--bg-alt)]" />
        <div className="h-4 w-3/4 rounded bg-[var(--bg-alt)]" />
        <div className="mt-4 flex items-center justify-between">
          <div className="h-5 w-20 rounded bg-[var(--bg-alt)]" />
          <div className="h-11 w-11 rounded-full bg-[var(--bg-alt)]" />
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// TreatmentCard diekstrak jadi komponen sendiri + dibungkus memo().
// Alasan performa:
// - Sebelumnya card di-render inline di dalam .map() pada komponen induk,
//   jadi setiap kali Pricing re-render (misal gara-gara state imageError
//   berubah untuk SATU gambar), SEMUA card ikut re-render walau propsnya
//   sama persis. Dengan memo(), React membandingkan props dulu dan skip
//   re-render kalau tidak ada yang berubah.
// - hasError dikirim sebagai boolean tunggal (bukan seluruh object
//   imageError), supaya card lain tidak dianggap "berubah" saat error
//   terjadi di card lain.
// -----------------------------------------------------------------------
const TreatmentCard = memo(function TreatmentCard({
  treatment,
  index,
  hasError,
  onClick,
  onImageError,
}: {
  treatment: any;
  index: number;
  hasError: boolean;
  onClick: () => void;
  onImageError: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className="scroll-stagger group relative flex cursor-pointer flex-col overflow-hidden rounded-[16px] border border-[var(--line)] bg-white [content-visibility:auto] [contain-intrinsic-size:340px] transition-transform duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(28,58,48,0.15)] focus-within:ring-2 focus-within:ring-[var(--pine)] focus-within:ring-offset-2"
      style={{ animationDelay: `${index * 80}ms` }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[var(--bg-alt)] to-white">
        {treatment.recommended && (
          <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-[var(--pine)] shadow-sm backdrop-blur-sm">
            ⭐ Rekomendasi
          </span>
        )}
        {!hasError ? (
          <img
            src={treatment.image}
            alt={treatment.title}
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            onError={onImageError}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--bg-alt)]">
            <svg
              className="h-12 w-12 text-[var(--line)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* Content Container */}
      <div className="flex flex-1 flex-col p-[1.6rem]">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[0.7rem] font-bold uppercase tracking-widest text-[var(--pine)]/70">
            {treatment.category}
          </span>
          <div className="flex flex-shrink-0 items-center gap-1 text-[var(--pine)]">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[0.8rem] font-semibold">
              {formatDuration(treatment.duration)}
            </span>
          </div>
        </div>

        <h4 className="m-0 mb-4 line-clamp-2 font-[family-name:var(--font-display)] text-[1.15rem] font-semibold text-[var(--pine-deep)] transition-colors duration-500 group-hover:text-[var(--pine)]">
          {treatment.title}
        </h4>

        <div className="mt-auto flex items-end justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[0.65rem] font-bold uppercase tracking-tight text-[var(--ink-soft)]">
              Mulai dari
            </span>
            <p className="m-0 font-[family-name:var(--font-display)] text-[1.3rem] font-bold text-[var(--pine-deep)] transition-colors duration-500 group-hover:text-[var(--pine)]">
              Rp{treatment.price.toLocaleString("id-ID")}
            </p>
          </div>

          <a
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#25d366] transition-transform duration-300 ease-out hover:scale-110 hover:shadow-[0_8px_20px_rgba(37,211,102,0.4)] focus-visible:outline-2 focus-visible:outline-[#25d366] focus-visible:outline-offset-2"
            href={buildWhatsAppLink(treatment.title, treatment.price)}
            target="_blank"
            rel="noreferrer noopener"
            title="Pesan via WhatsApp"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Pesan ${treatment.title} via WhatsApp`}
          >
            <svg
              className="h-5 w-5 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a8.06 8.06 0 00-8.052 8.05 8.056 8.056 0 002.064 5.476l-.323 1.179 1.213-.323a8.035 8.035 0 003.86.962h.005a8.074 8.074 0 008.064-8.053 8.047 8.047 0 00-2.357-5.671 8.047 8.047 0 00-5.707-2.36zM12.071 0C5.717 0 .429 5.287.429 11.643c0 2.259.584 4.43 1.697 6.29L0 24l6.514-1.708C9.03 23.41 10.82 24 12.071 24c6.355 0 11.643-5.288 11.643-11.643 0-3.128-1.286-6.082-3.623-8.418C18.154 1.286 15.199 0 12.071 0z" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
});

function Pricing({ pricingRef }: { pricingRef?: React.RefObject<HTMLElement> }) {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTreatment, setSelectedTreatment] = useState(null);

  // `selectedCategory` = state "cepat", dipakai untuk highlight tab & judul.
  // Update ini SELALU sinkron & murah, jadi tab langsung terasa responsif
  // begitu diklik meski grid di bawahnya berat.
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // `deferredCategory` = versi "tertunda" dari selectedCategory, khusus
  // dipakai untuk memfilter & me-render grid card yang berat (banyak
  // gambar, SVG, animasi). React akan menunda render ulang grid ini di
  // background dengan prioritas rendah, jadi klik tab tidak lagi memblok
  // main thread sampai ratusan ms (ini akar masalah INP 968ms di profiler).
  const deferredCategory = useDeferredValue(selectedCategory);
  const isPendingCategory = selectedCategory !== deferredCategory;

  const [imageError, setImageError] = useState({});
  const tabsScrollRef = useRef(null);

  useEffect(() => {
    const el = tabsScrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY, behavior: "smooth" });
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [loading, error]);

  const fetchPricing = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/pricing`);
      if (!response.ok) {
        throw new Error("Gagal memuat data pricing");
      }
      const data = await response.json();
      setTreatments(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const categories = useMemo(() => {
    const available = new Set(treatments.map((t) => t.category));
    return ["Semua", ...CATEGORY_ORDER.filter((c) => available.has(c))];
  }, [treatments]);

  useEffect(() => {
    console.log("[PRICING] listener ke-mount"); // <-- DEBUG 3, harus muncul SEKALI pas Pricing pertama kali render

    const onSelectCategory = (e) => {
      console.log("[PRICING] event ketangkep, detail:", e.detail); // <-- DEBUG 4
      const category = e.detail;
      if (category && categoryInfo[category]) {
        console.log("[PRICING] setSelectedCategory ->", category); // <-- DEBUG 5
        setSelectedCategory(category);
      } else {
        console.log("[PRICING] category gak match categoryInfo:", category); // <-- DEBUG 6
      }
    };

    const pendingCategory = sessionStorage.getItem("pendingServiceCategory");
    if (pendingCategory && categoryInfo[pendingCategory]) {
      console.log(
        "[PRICING] pakai pendingCategory dari sessionStorage:",
        pendingCategory,
      ); // <-- DEBUG 7
      setSelectedCategory(pendingCategory);
      sessionStorage.removeItem("pendingServiceCategory");
    }

    window.addEventListener("select-service-category", onSelectCategory);
    return () => {
      console.log("[PRICING] listener di-cleanup"); // <-- DEBUG 8, kalo ini muncul PAS lu klik navbar, berarti Pricing lagi re-mount di waktu yang salah
      window.removeEventListener("select-service-category", onSelectCategory);
    };
  }, []);

  useEffect(() => {
    const container = tabsScrollRef.current;
    if (!container) return;
    const activeButton = container.querySelector(
      `[data-category="${CSS.escape(selectedCategory)}"]`,
    );
    if (!activeButton) return;
    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    const offset =
      buttonRect.left -
      containerRect.left -
      containerRect.width / 2 +
      buttonRect.width / 2;
    container.scrollBy({ left: offset, behavior: "smooth" });
  }, [selectedCategory]);

  // Filtering pakai deferredCategory, BUKAN selectedCategory — inilah yang
  // membuat pekerjaan berat ini tidak lagi ikut nebeng di update sinkron
  // saat tombol tab diklik.
  const filteredTreatments = useMemo(() => {
    const list =
      deferredCategory === "Semua"
        ? treatments
        : treatments.filter((t) => t.category === deferredCategory);

    return [...list].sort(
      (a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0),
    );
  }, [treatments, deferredCategory]);

  const handleCardClick = useCallback((treatment) => {
    setSelectedTreatment(treatment);
  }, []);
  const handleCloseModal = useCallback(() => setSelectedTreatment(null), []);
  const handleImageError = useCallback(
    (id) => setImageError((prev) => ({ ...prev, [id]: true })),
    [],
  );

  return (
    <section
      className="scroll-fade-up mx-auto max-w-[1240px] px-[clamp(1.5rem,5vw,4rem)] py-[4.5rem]"
      id="services"
      ref={pricingRef}
    >
      {/* Section Header */}
      <div className="mb-12 max-w-3xl">
        <span className="mb-4 inline-block text-[0.75rem] font-bold uppercase tracking-[0.15em] text-[var(--pine)]">
          Layanan &amp; Tarif
        </span>
        <h3 className="m-0 mb-4 font-[family-name:var(--font-display)] text-[clamp(1.9rem,3.6vw,3rem)] font-semibold leading-tight text-[var(--pine-deep)]">
          Pilihan Perawatan Terbaik Untuk Ibu &amp; Buah Hati
        </h3>
        <p className="m-0 text-[1.05rem] leading-relaxed font-[family-name:var(--font-body)] text-[var(--ink-soft)]">
          Perawatan individual yang dirancang khusus untuk kenyamanan dan
          pemulihan, memberikan relaksasi maksimal untuk Anda dan buah hati.
          Setiap layanan ditangani langsung oleh bidan berpengalaman dengan
          pendekatan yang hangat, aman, dan penuh perhatian di setiap tahap
          perawatan.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-10 flex flex-col items-start gap-3 rounded-[12px] border border-[#f3c6d4] bg-[#fdf1f4] px-5 py-4">
          <p className="m-0 text-[0.9rem] text-[#b10f4c]">
            ⚠️ {error}. Coba muat ulang data layanan.
          </p>
          <button
            type="button"
            onClick={fetchPricing}
            className="rounded-full bg-[var(--pine)] px-4 py-2 text-[0.8rem] font-semibold text-white transition-transform duration-300 hover:scale-105"
          >
            Muat Ulang
          </button>
        </div>
      )}

      {/* Category tabs and info */}
      {!loading && !error && (
        <div className="mb-12">
          <div className="mb-10 border-b border-[var(--line)]">
            <div
              ref={tabsScrollRef}
              className="flex gap-8 overflow-x-auto pb-3 [scrollbar-width:thin] [scrollbar-color:var(--line,#E2E8E6)_transparent] [&::-webkit-scrollbar]:h-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--line,#E2E8E6)]"
            >
              {categories.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    data-category={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`relative min-w-max flex-shrink-0 pb-4 text-[0.95rem] font-semibold transition-colors ${
                      isActive
                        ? "font-bold text-[var(--pine)] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[var(--pine)]"
                        : "text-[var(--ink-soft)] hover:text-[var(--pine)]"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="m-0 mb-3 font-[family-name:var(--font-display)] text-[1.6rem] font-semibold text-[var(--pine-deep)] sm:text-[1.95rem]">
              {categoryInfo[selectedCategory]?.title || selectedCategory}
            </h2>
            <p className="m-0 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
              {categoryInfo[selectedCategory]?.description ||
                "Pilih kategori untuk melihat layanan yang tersedia."}
            </p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 gap-[1.6rem] sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredTreatments.length === 0 && (
        <div className="rounded-[12px] border border-[var(--line)] bg-[var(--bg-alt)] px-6 py-12 text-center">
          <p className="m-0 text-[0.95rem] text-[var(--ink-soft)]">
            Belum ada layanan di kategori ini.
          </p>
        </div>
      )}

      {/* Cards Grid — opacity turun sedikit saat kategori baru masih
          "pending" (deferredCategory belum menyusul selectedCategory),
          supaya user tetap dapat feedback visual walau grid belum update. */}
      {!loading && !error && filteredTreatments.length > 0 && (
        <div
          className={`grid grid-cols-1 gap-[1.6rem] transition-opacity duration-150 sm:grid-cols-2 lg:grid-cols-4 ${
            isPendingCategory ? "opacity-60" : "opacity-100"
          }`}
        >
          {filteredTreatments.map((treatment, index) => (
            <TreatmentCard
              key={treatment.id}
              treatment={treatment}
              index={index}
              hasError={!!imageError[treatment.id]}
              onClick={() => handleCardClick(treatment)}
              onImageError={() => handleImageError(treatment.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={!!selectedTreatment}
        onClose={handleCloseModal}
        title={selectedTreatment?.title}
      >
        {selectedTreatment && (
          <div className="max-h-[85vh] w-full overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="relative min-h-[260px] flex-shrink-0 overflow-hidden bg-[var(--bg-alt)] md:min-h-full md:w-5/12">
                {!imageError[`modal-${selectedTreatment.id}`] ? (
                  <img
                    src={selectedTreatment.image}
                    alt={selectedTreatment.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={() =>
                      handleImageError(`modal-${selectedTreatment.id}`)
                    }
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[var(--bg-alt)]">
                    <svg
                      className="h-12 w-12 text-[var(--line)]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--pine-deep)]/40 to-transparent" />

                <div className="absolute bottom-5 left-5">
                  <span className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[var(--pine)] shadow-sm backdrop-blur-sm">
                    {selectedTreatment.category}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-8 sm:p-10">
                <div>
                  {selectedTreatment.recommended && (
                    <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#d7eddd] px-3.5 py-1.5">
                      <svg
                        className="h-4 w-4 text-[var(--pine)]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <span className="text-[0.78rem] font-bold text-[var(--pine-deep)]">
                        Rekomendasi Kami
                      </span>
                    </div>
                  )}

                  <h3
                    id="modal-title"
                    className="m-0 mb-6 font-[family-name:var(--font-display)] text-[1.8rem] font-bold leading-tight text-[var(--pine-deep)] sm:text-[2.1rem]"
                  >
                    {selectedTreatment.title}
                  </h3>

                  <div className="mb-8 flex flex-wrap gap-6 text-[var(--ink-soft)]">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-[var(--pine)]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="text-[0.9rem] font-semibold">
                        {formatDuration(selectedTreatment.duration)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-[var(--pine)]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="2" y="6" width="20" height="12" rx="2" />
                        <path d="M2 10h20" />
                        <path d="M6 15h4" />
                      </svg>
                      <span className="text-[0.9rem] font-bold text-[var(--pine-deep)]">
                        Rp{selectedTreatment.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <p className="m-0 mb-8 text-[1rem] leading-8 text-[var(--ink-soft)]">
                    {selectedTreatment.description}
                  </p>

                  {Array.isArray(selectedTreatment.benefits) &&
                    selectedTreatment.benefits.length > 0 && (
                      <ul className="mb-8 space-y-3">
                        {selectedTreatment.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <svg
                              className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--pine)]"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.5l-4.3-4.3 1.4-1.4 2.9 2.9 6.3-6.3 1.4 1.4-7.7 7.7z" />
                            </svg>
                            <span className="text-[0.92rem] leading-relaxed text-[var(--ink-soft)]">
                              {benefit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>

                <div className="flex justify-end border-t border-[var(--line)] pt-6">
                  <a
                    className="inline-flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-full bg-[var(--pine)] px-8 py-4 text-[0.95rem] font-bold text-white transition-transform duration-300 hover:scale-105 hover:shadow-[0_16px_32px_rgba(47,93,79,0.35)] focus-visible:outline-2 focus-visible:outline-[var(--pine)] focus-visible:outline-offset-2 sm:w-auto"
                    href={buildWhatsAppLink(
                      selectedTreatment.title,
                      selectedTreatment.price,
                    )}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a8.06 8.06 0 00-8.052 8.05 8.056 8.056 0 002.064 5.476l-.323 1.179 1.213-.323a8.035 8.035 0 003.86.962h.005a8.074 8.074 0 008.064-8.053 8.047 8.047 0 00-2.357-5.671 8.047 8.047 0 00-5.707-2.36zM12.071 0C5.717 0 .429 5.287.429 11.643c0 2.259.584 4.43 1.697 6.29L0 24l6.514-1.708C9.03 23.41 10.82 24 12.071 24c6.355 0 11.643-5.288 11.643-11.643 0-3.128-1.286-6.082-3.623-8.418C18.154 1.286 15.199 0 12.071 0z" />
                    </svg>
                    Pesan via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

export default Pricing;
