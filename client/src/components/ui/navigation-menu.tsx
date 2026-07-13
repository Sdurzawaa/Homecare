"use client";

import * as React from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Navigation, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Beranda", href: "#home" },
  { name: "Kenapa Kami", href: "#about" },
  { name: "Kontak", href: "#contact" },
  { name: "Testimoni", href: "#testimonials" },
];

// Kategori layanan — ambil dari API pricing/categories agar selalu sinkron
// dengan data di database. Jika fetch gagal, pakai fallback statis.
type ServiceItem = { key: string; label: string; href: string };

const DEFAULT_SERVICE_ITEMS: ServiceItem[] = [
  { key: "Perawatan Kehamilan", label: "Perawatan Kehamilan", href: "#services" },
  { key: "Persalinan", label: "Persalinan", href: "#services" },
  { key: "Perawatan Nifas", label: "Perawatan Nifas", href: "#services" },
  { key: "Perawatan Bayi Baru Lahir", label: "Perawatan Bayi Baru Lahir", href: "#services" },
  { key: "Imunisasi", label: "Imunisasi", href: "#services" },
  { key: "Keluarga Berencana", label: "Keluarga Berencana", href: "#services" },
  { key: "Kesehatan Reproduksi", label: "Kesehatan Reproduksi", href: "#services" },
];

const COLLAPSE_SCROLL_THRESHOLD = 50;
const EXPAND_SCROLL_THRESHOLD = 40;

const NAVIGATION_SUPPRESS_MS = 150;
const SNAPPY_SPRING = { type: "spring", damping: 50, stiffness: 900, mass: 0.7 } as const;

const getContainerVariants = (expandedWidthPx: number | null) => ({
  expanded: {
    y: 0,
    opacity: 1,
    width: expandedWidthPx ? `${expandedWidthPx}px` : "auto",
    transition: {
      width: { type: "tween", duration: 0.14, ease: "easeOut" },
      opacity: { duration: 0.08 },
      ...SNAPPY_SPRING,
      staggerChildren: 0.015,
      delayChildren: 0,
      when: "beforeChildren",
    },
  },
  collapsed: {
    y: 0,
    opacity: 1,
    width: "3rem",
    transition: {
      width: { type: "tween", duration: 0.14, ease: "easeOut" },
      opacity: { duration: 0.08 },
      ...SNAPPY_SPRING,
      when: "beforeChildren",
      staggerChildren: 0.01,
      staggerDirection: -1,
    },
  },
});

const logoVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    rotate: 0,
    scale: 1,
    transition: { type: "spring", damping: 18, stiffness: 480 },
  },
  collapsed: {
    opacity: 0,
    x: 0,
    rotate: 0,
    scale: 0,
    transition: { type: "spring", damping: 18, stiffness: 480 },
  },
};

const itemVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", damping: 22, stiffness: 380 },
  },
  collapsed: { opacity: 0, x: -12, scale: 0.96, transition: { duration: 0.12 } },
};

const contentVariants = {
  expanded: {
    opacity: 1,
    transition: { duration: 0.12 },
  },
  collapsed: {
    opacity: 0,
    transition: { duration: 0.08 },
  },
};

const collapsedIconVariants = {
  expanded: { opacity: 0, scale: 0.8, transition: { duration: 0.12 } },
  collapsed: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", damping: 20, stiffness: 400, delay: 0.06 },
  },
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <ChevronDown
      className={cn(
        "h-3.5 w-3.5 transition-transform duration-200",
        open ? "rotate-180" : ""
      )}
    />
  );
}

export function AnimatedNavFramer() {
  // --- state nav desktop andtablet (pill + collapse hamburger) ---
  const [isExpanded, setExpanded] = React.useState(true);
  const [isServiceOpen, setServiceOpen] = React.useState(false);

  // --- state nav mobile (bar + drawer) ---
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isMobileServiceOpen, setMobileServiceOpen] = React.useState(false);
  const [isMobileScrolled, setMobileScrolled] = React.useState(false);

  const [activeHash, setActiveHash] = React.useState("#home");

  const rootRef = React.useRef<HTMLDivElement>(null);
  const serviceRef = React.useRef<HTMLDivElement>(null);
  const serviceDropdownRef = React.useRef<HTMLDivElement>(null);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const navContentRef = React.useRef<HTMLDivElement>(null);

  // serviceItems diambil dari API supaya labelnya persis sama dengan DB
  const [serviceItems, setServiceItems] = React.useState<ServiceItem[]>(
    DEFAULT_SERVICE_ITEMS,
  );

  React.useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/pricing/categories`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data) && data.length) {
          setServiceItems(
            data.map((c: any) => ({ key: String(c.category), label: String(c.title ?? c.category), href: "#services" })),
          );
        }
      } catch (err) {
        // fallback: keep DEFAULT_SERVICE_ITEMS
        // console.debug("Failed to fetch pricing categories", err);
      }
    };
    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  // Lebar asli konten nav pas expanded, diukur sekali (+ tiap resize) biar
  // animasi width gak pernah harus nebak-nebak lewat "auto".
  const [expandedWidth, setExpandedWidth] = React.useState<number | null>(null);
  const containerVariants = React.useMemo(
    () => getContainerVariants(expandedWidth),
    [expandedWidth]
  );

  const { scrollY } = useScroll();
  const lastScrollY = React.useRef(0);
  const accumulatedDown = React.useRef(0);
  const accumulatedUp = React.useRef(0);
  const isNavigatingRef = React.useRef(false);
  const navigatingTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>(1);
  const lastToggleAtRef = React.useRef(0);
  const TOGGLE_COOLDOWN_MS = 100;
  const COLLAPSE_SCROLL_DISTANCE = 80;
  const EXPAND_SCROLL_DISTANCE = 120;
  const SCROLL_JITTER = 6;

  useMotionValueEvent(scrollY, "change", (latest) => {
    setMobileScrolled(latest > 8);

    if (isNavigatingRef.current) {
      lastScrollY.current = latest;
      return;
    }

    const previous = lastScrollY.current;
    const delta = latest - previous;
    const canToggle = Date.now() - lastToggleAtRef.current > TOGGLE_COOLDOWN_MS;

    if (delta > SCROLL_JITTER) {
      accumulatedDown.current += delta;
      accumulatedUp.current = 0;
    } else if (delta < -SCROLL_JITTER) {
      accumulatedUp.current += -delta;
      accumulatedDown.current = 0;
    }

    if (isExpanded && canToggle && accumulatedDown.current > COLLAPSE_SCROLL_DISTANCE) {
      setExpanded(false);
      setServiceOpen(false);
      lastToggleAtRef.current = Date.now();
      accumulatedDown.current = 0;
      accumulatedUp.current = 0;
    } else if (!isExpanded && canToggle && accumulatedUp.current > EXPAND_SCROLL_DISTANCE) {
      setExpanded(true);
      lastToggleAtRef.current = Date.now();
      accumulatedDown.current = 0;
      accumulatedUp.current = 0;
    }

    lastScrollY.current = latest;
  });

  const suppressScrollCollapse = () => {
    isNavigatingRef.current = true;
    if (navigatingTimeoutRef.current) clearTimeout(navigatingTimeoutRef.current);
    navigatingTimeoutRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
    }, NAVIGATION_SUPPRESS_MS);
  };

  React.useEffect(() => {
    return () => {
      if (navigatingTimeoutRef.current) clearTimeout(navigatingTimeoutRef.current);
    };
  }, []);

  // Ukur lebar natural konten nav (logo + links + tombol Layanan) sekali
  // pas mount, dan tiap ukurannya berubah (misal font/lebar teks beda gara
  // resize window). Nilai ini yang dipakai sebagai target width "expanded"
  // -- gantiin "auto" yang rawan glitch.
  React.useEffect(() => {
    const el = navContentRef.current;
    if (!el) return;

    const measure = () => {
      // +1 buat jaga-jaga pembulatan subpixel biar teks gak kepotong.
      setExpandedWidth(Math.ceil(el.scrollWidth) + 1);
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  // Klik di luar dropdown Layanan (desktop) / drawer (mobile) -> tutup.
  React.useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideService =
        (serviceRef.current && serviceRef.current.contains(target)) ||
        (serviceDropdownRef.current &&
          serviceDropdownRef.current.contains(target));
      if (!clickedInsideService) {
        setServiceOpen(false);
      }
      if (
        isMobileMenuOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(target)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isMobileMenuOpen]);

  // Escape selalu bisa nutup, dropdown maupun drawer mobile.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setServiceOpen(false);
        setMobileMenuOpen(false);
        setMobileServiceOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Kunci scroll body pas drawer mobile kebuka.
  React.useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    if (!el) return;
    const headerH = 84;
    const top = el.getBoundingClientRect().top + window.scrollY - headerH - 12;
    window.scrollTo({ top, behavior: "smooth" });
    // Set posisi terakhir agar scroll listener tidak berpikir navigasi
    // sebelumnya masih terjadi dari posisi lama.
    lastScrollY.current = top;
  };

  // Sama seperti template asli: kalau nav lagi collapsed, klik di mana pun
  // pada nav cuma expand dulu, gak langsung navigasi.
  const handleNavClick = () => {
    if (!isExpanded) {
      setExpanded(true);
    }
  };

  const closeAllMenus = () => {
    setServiceOpen(false);
    setMobileMenuOpen(false);
    setMobileServiceOpen(false);
  };

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    suppressScrollCollapse();
    setActiveHash(href);
    closeAllMenus();
    setExpanded(false);
    scrollToSection(href);
  };

  // Klik item di dropdown "Layanan": scroll ke section Pricing DAN kirim
  // custom event yang didengar Pricing.jsx buat langsung ganti tab kategori.
  const handleServiceItemClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: { name: string; href: string }
  ) => {
    e.preventDefault();
    e.stopPropagation();
    suppressScrollCollapse();
    // Simpen juga ke sessionStorage sebagai fallback. CustomEvent cuma
    // nyampe kalau Pricing.jsx udah mount & listener-nya udah nempel di
    // momen yang sama — kalau section Pricing belom ke-render (lazy
    // section, atau re-render lain lagi jalan), event ini lewat gitu aja
    // dan gak ada yang nangkep. sessionStorage gak punya masalah timing
    // itu karena Pricing bisa baca kapan pun pas dia mount.
    sessionStorage.setItem("pendingServiceCategory", item.name);
    window.dispatchEvent(
      new CustomEvent("select-service-category", { detail: item.name })
    );
    setActiveHash(item.href);
    closeAllMenus();
    setExpanded(false);
    scrollToSection(item.href);
  };

  const handleServiceToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setServiceOpen((open) => !open);
  };

  return (
    <>
      {/* ================= DESKTOP / TABLET (md ke atas) ================= */}
      <div
        ref={rootRef}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 hidden md:block"
      >
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={isExpanded ? "expanded" : "collapsed"}
          variants={containerVariants}
          whileHover={!isExpanded ? { scale: 1.08 } : {}}
          whileTap={!isExpanded ? { scale: 0.95 } : {}}
          transition={{ ...SNAPPY_SPRING }}
          onClick={handleNavClick}
          className={cn(
            "flex h-12 items-center overflow-hidden rounded-full border border-[rgba(28,58,48,0.12)] backdrop-blur-xl",
            isExpanded
              ? "bg-white/95 shadow-[0_22px_50px_-24px_rgba(28,58,48,0.32)]"
              : "bg-white/20 shadow-[0_16px_30px_-24px_rgba(28,58,48,0.18)] cursor-pointer justify-center"
          )}
        >
          {/* navContentRef bungkus SEMUA konten expanded (logo + links)
              supaya scrollWidth-nya = lebar natural penuh nav, dipakai
              buat ngukur target width "expanded" secara pasti. flex-
              shrink-0 di kedua anak-nya nyegah teks/ikon ke-squeeze pas
              lebar parent lagi diinterpolasi di tengah animasi. */}
          <div ref={navContentRef} className="flex flex-shrink-0 items-center">
          <motion.a
            href="#home"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleLinkClick(e, "#home")}
            variants={logoVariants}
            className="flex flex-shrink-0 items-center gap-2 pl-4 pr-2 text-[var(--ink-soft)]"
          >
            <img src="/first-aid-kit-doctor-svgrepo-com.svg" alt="Homecare" className="h-5 w-5" />
            <span className="text-sm font-semibold">Homecare</span>
          </motion.a>

          <motion.div
            variants={contentVariants}
            initial={false}
            animate={isExpanded ? "expanded" : "collapsed"}
            className={cn(
              "flex flex-shrink-0 items-center gap-1 pr-4 sm:gap-4",
              !isExpanded && "pointer-events-none"
            )}
          >
            {NAV_LINKS.filter((item) => item.href !== "#home").map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                variants={itemVariants}
                onClick={(e) => handleLinkClick(e, item.href)}
                aria-current={activeHash === item.href ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap px-2 py-1 text-sm font-medium transition-colors duration-200",
                  activeHash === item.href
                    ? "text-[var(--pine)]"
                    : "text-[var(--ink-soft)] hover:text-[var(--pine)]"
                )}
              >
                {item.name}
              </motion.a>
            ))}

            <motion.div variants={itemVariants} className="relative" ref={serviceRef}>
              <button
                type="button"
                onClick={handleServiceToggle}
                aria-haspopup="true"
                aria-expanded={isServiceOpen}
                className={cn(
                  "inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-[rgba(28,58,48,0.16)] bg-white px-3 py-1 text-sm font-medium transition-colors duration-200",
                  isServiceOpen || activeHash === "#services"
                    ? "text-[var(--pine)]"
                    : "text-[var(--ink-soft)] hover:text-[var(--pine)]"
                )}
              >
                Layanan
                <ChevronIcon open={isServiceOpen} />
              </button>
            </motion.div>
          </motion.div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              variants={collapsedIconVariants}
              animate={isExpanded ? "expanded" : "collapsed"}
            >
              <Menu className="h-5 w-5 text-[var(--ink-soft)]" />
            </motion.div>
          </div>
        </motion.nav>

        {/* Dropdown Layanan dirender sebagai sibling di luar <nav> supaya
            gak ikut kepotong overflow-hidden nav saat collapse. */}
        {isExpanded && (
          <div
            ref={serviceDropdownRef}
            className={cn(
              "absolute right-0 top-[calc(100%+0.75rem)] z-20 w-72 overflow-hidden rounded-[1.5rem] border border-[rgba(28,58,48,0.08)] bg-white/90 backdrop-blur-sm text-left shadow-[0_18px_40px_-20px_rgba(28,58,48,0.5)] transition-all duration-150",
              isServiceOpen
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            )}
            role="menu"
          >
            <div className="grid grid-cols-1 gap-2 p-3">
              {serviceItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  role="menuitem"
                  onClick={(e) => handleServiceItemClick(e, { name: item.key, href: item.href })}
                  className="rounded-2xl px-3 py-2 text-sm text-[var(--ink-soft)] transition-colors duration-150 hover:bg-[var(--pine)] hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= MOBILE (di bawah md) ================= */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3 transition-all duration-200 md:hidden",
          isMobileScrolled
            ? "bg-white/95 shadow-[0_4px_20px_rgba(28,58,48,0.1)] backdrop-blur-xl"
            : "bg-white/70 backdrop-blur-md"
        )}
      >
        <a
          href="#home"
          onClick={(e) => handleLinkClick(e, "#home")}
          className="flex items-center gap-2 text-[var(--ink-soft)]"
        >
          <img src="/first-aid-kit-doctor-svgrepo-com.svg" alt="Homecare" className="h-5 w-5" />
          <span className="text-sm font-semibold">Homecare</span>
        </a>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isMobileMenuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--ink-soft)] transition-colors hover:text-[var(--pine)]"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </header>

      {/* Backdrop drawer mobile */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-[rgba(28,58,48,0.4)] backdrop-blur-[2px] transition-opacity duration-200 md:hidden",
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      />

      {/* Panel drawer mobile, slide dari kanan */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-[82vw] max-w-[340px] flex-col bg-white shadow-[-16px_0_40px_rgba(28,58,48,0.18)] transition-transform duration-250 ease-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ transitionDuration: isMobileMenuOpen ? "260ms" : "220ms" }}
      >
        <div className="flex items-center justify-between border-b border-[rgba(28,58,48,0.1)] px-5 py-4">
          <div className="flex items-center gap-2 text-[var(--ink-soft)]">
            <img src="/first-aid-kit-doctor-svgrepo-com.svg" alt="Homecare" className="h-5 w-5" />
            <span className="text-sm font-semibold">Homecare</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Tutup menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-soft)] transition-colors hover:text-[var(--pine)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
          {NAV_LINKS.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleLinkClick(e, item.href)}
              className={cn(
                "rounded-2xl px-4 py-3 text-[0.98rem] font-semibold transition-all duration-150 hover:translate-x-1",
                activeHash === item.href
                  ? "text-[var(--pine)]"
                  : "text-[var(--ink-soft)] hover:text-[var(--pine)]"
              )}
            >
              {item.name}
            </a>
          ))}

          <div className="rounded-2xl">
            <button
              type="button"
              onClick={() => setMobileServiceOpen((open) => !open)}
              aria-expanded={isMobileServiceOpen}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[0.98rem] font-semibold text-[var(--ink-soft)] transition-colors hover:text-[var(--pine)]"
            >
              Layanan
              <ChevronIcon open={isMobileServiceOpen} />
            </button>
            <div
              className={cn(
                "overflow-hidden transition-[max-height] duration-250 ease-out",
                isMobileServiceOpen ? "max-h-[20rem]" : "max-h-0"
              )}
            >
              <div className="flex flex-col gap-0.5 py-1 pl-3">
                {serviceItems.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    onClick={(e) => handleServiceItemClick(e, { name: item.key, href: item.href })}
                    className="rounded-xl px-4 py-2.5 text-[0.9rem] font-medium text-[var(--ink-soft)] transition-all duration-150 hover:translate-x-1 hover:text-[var(--pine)]"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}