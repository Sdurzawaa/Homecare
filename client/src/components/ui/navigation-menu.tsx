"use client";

import * as React from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Navigation, Menu, X, ChevronDown, Home, Info, MessageSquareQuote, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Beranda", href: "#home", icon: Home },
  { name: "Kenapa Kami", href: "#about", icon: Info },
  { name: "Testimoni", href: "#testimonials", icon: MessageSquareQuote },
  { name: "Kontak", href: "#contact", icon: Phone },
];

// Kategori ini harus persis sama dengan key di `categoryInfo` pada Pricing.jsx,
// karena label ini yang dikirim lewat custom event "select-service-category"
// dan dipakai Pricing.jsx buat `setSelectedCategory(category)`.
const SERVICE_ITEMS = [
  { name: "Perawatan Kehamilan", href: "#services" },
  { name: "Persalinan", href: "#services" },
  { name: "Perawatan Nifas", href: "#services" },
  { name: "Perawatan Bayi Baru Lahir", href: "#services" },
  { name: "Imunisasi", href: "#services" },
  { name: "Keluarga Berencana", href: "#services" },
  { name: "Kesehatan Reproduksi", href: "#services" },
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
  // --- state nav desktop and tablet (pill + collapse hamburger) ---
  const [isExpanded, setExpanded] = React.useState(true);
  const [isServiceOpen, setServiceOpen] = React.useState(false);

  // --- state nav mobile (bar + drawer) ---
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isMobileServiceOpen, setMobileServiceOpen] = React.useState(false);
  const [isMobileScrolled, setMobileScrolled] = React.useState(false);
  const [isMobileHeaderVisible, setMobileHeaderVisible] = React.useState(true);

  const [activeHash, setActiveHash] = React.useState("#home");

  const rootRef = React.useRef<HTMLDivElement>(null);
  const serviceRef = React.useRef<HTMLDivElement>(null);
  const serviceDropdownRef = React.useRef<HTMLDivElement>(null);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const navContentRef = React.useRef<HTMLDivElement>(null);

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
  const COLLAPSE_SCROLL_DISTANCE = 120;
  const EXPAND_SCROLL_DISTANCE = 120;
  const SCROLL_JITTER = 6;

  useMotionValueEvent(scrollY, "change", (latest) => {
    const isScrolled = latest > 8;
    setMobileScrolled(isScrolled);

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

    // Desktop/Tablet collapse/expand logic
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

    // Mobile headroom hide/show logic
    if (latest > 80) {
      if (delta > 6 && isMobileHeaderVisible) {
        setMobileHeaderVisible(false);
      } else if (delta < -6 && !isMobileHeaderVisible) {
        setMobileHeaderVisible(true);
      }
    } else {
      setMobileHeaderVisible(true);
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

  // Kunci scroll body dan pause Lenis pas drawer mobile kebuka.
  React.useEffect(() => {
    const lenis = (window as any).lenis;
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      if (lenis) lenis.stop();
    } else {
      document.body.style.overflow = "";
      if (lenis) lenis.start();
    }
    return () => {
      document.body.style.overflow = "";
      if (lenis) lenis.start();
    };
  }, [isMobileMenuOpen]);

  // Pantau posisi scroll untuk mengubah link aktif secara otomatis (hanya untuk mobile)
  React.useEffect(() => {
    const hashList = [...NAV_LINKS.map((link) => link.href), "#services"];
    const sections = hashList.map((href) => document.querySelector(href));

    const observerOptions = {
      root: null,
      rootMargin: "-35% 0px -45% 0px", // Memicu pergantian saat section berada di area tengah viewport
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      // Abaikan pencatatan scroll aktif di layar desktop (lebar >= 768px)
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        return;
      }

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          if (id) {
            setActiveHash(`#${id}`);
          }
        }
      });
    }, observerOptions);

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    if (!el) return;
    const headerH = 76;
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

    // Membuka kunci body scroll butuh sedikit waktu sebelum browser memproses smooth scroll
    setTimeout(() => {
      scrollToSection(href);
    }, 180);
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

    // Membuka kunci body scroll dan Lenis butuh sedikit waktu sebelum browser memproses smooth scroll
    setTimeout(() => {
      scrollToSection(item.href);
    }, 180);
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
          <div
            ref={navContentRef}
            className={cn(
              "flex flex-shrink-0 items-center",
              !isExpanded && "pointer-events-none"
            )}
          >
            <motion.a
              href="#home"
              variants={logoVariants}
              onClick={(e) => handleLinkClick(e, "#home")}
              className="flex flex-shrink-0 items-center gap-2 pl-4 pr-3 text-[var(--ink-soft)] transition-colors duration-200 hover:text-[var(--pine)]"
            >
              <img src="/first-aid-kit-doctor-svgrepo-com.svg" alt="Homecare" className="h-5 w-5" />
              <span className="text-sm font-semibold">Homecare</span>
            </motion.a>

            <motion.div
              variants={contentVariants}
              initial={false}
              animate={isExpanded ? "expanded" : "collapsed"}
              className={cn(
                "flex flex-shrink-0 items-center gap-1.5 pr-4 sm:gap-2",
                !isExpanded && "pointer-events-none"
              )}
            >
              {NAV_LINKS.filter((item) => item.href !== "#home").map((item) => {
                const isActive = activeHash === item.href;
                return (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    variants={itemVariants}
                    onClick={(e) => handleLinkClick(e, item.href)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative whitespace-nowrap px-3.5 py-1 text-sm font-medium transition-colors duration-200 rounded-full",
                      isActive
                        ? "text-[var(--pine)] font-semibold"
                        : "text-[var(--ink-soft)] hover:text-[var(--pine)]"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="desktop-nav-active-pill"
                        className="absolute inset-0 bg-[var(--pine)]/[0.08] rounded-full -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {item.name}
                  </motion.a>
                );
              })}

              <motion.div variants={itemVariants} className="relative" ref={serviceRef}>
                <button
                  type="button"
                  onClick={handleServiceToggle}
                  aria-haspopup="true"
                  aria-expanded={isServiceOpen}
                  className={cn(
                    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[rgba(28,58,48,0.16)] bg-white px-3.5 py-1 text-sm font-medium transition-colors duration-200",
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
              "absolute right-0 top-[calc(100%+0.75rem)] z-20 w-72 overflow-hidden rounded-[1.5rem] border border-[rgba(28,58,48,0.08)] bg-white/95 backdrop-blur-sm text-left shadow-[0_18px_40px_-20px_rgba(28,58,48,0.5)] transition-all duration-150",
              isServiceOpen
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            )}
            role="menu"
          >
            <div className="grid grid-cols-1 gap-1 p-2">
              {SERVICE_ITEMS.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  role="menuitem"
                  onClick={(e) => handleServiceItemClick(e, item)}
                  className="rounded-xl px-3.5 py-2 text-sm text-[var(--ink-soft)] transition-all duration-150 hover:bg-[var(--pine)]/[0.06] hover:text-[var(--pine)] font-medium"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= MOBILE (di bawah md) ================= */}
      <header
        className={cn(
          "fixed left-4 right-4 z-50 flex items-center justify-between px-5 py-2.5 rounded-full border transition-all duration-300 md:hidden",
          isMobileScrolled
            ? "bg-white/95 border-[var(--line)] shadow-[0_8px_30px_rgba(28,58,48,0.12)] backdrop-blur-xl"
            : "bg-white/80 border-[rgba(28,58,48,0.12)] backdrop-blur-md",
          isMobileHeaderVisible || isMobileMenuOpen
            ? "top-4 opacity-100 translate-y-0"
            : "-translate-y-24 opacity-0 pointer-events-none"
        )}
        style={{ transitionProperty: "transform, opacity, top, background-color, border-color, box-shadow" }}
      >
        <a
          href="#home"
          onClick={(e) => handleLinkClick(e, "#home")}
          className="flex items-center gap-2 text-[var(--pine-deep)]"
        >
          <img src="/first-aid-kit-doctor-svgrepo-com.svg" alt="Homecare" className="h-5 w-5" />
          <span className="text-sm font-bold tracking-wide">Homecare</span>
        </a>

        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Buka menu"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--pine)] text-white shadow-sm transition-colors hover:bg-[var(--pine-deep)]"
        >
          <Menu className="h-4.5 w-4.5" />
        </motion.button>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 220 }}
            className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[rgba(28,58,48,0.95)] backdrop-blur-[32px] text-white md:hidden"
          >
            {/* Signature ambient glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-[22rem] w-[22rem] rounded-full bg-[var(--honey)]/20 blur-[100px]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-[var(--pine)]/30 blur-[90px]"
            />

            {/* Header row inside fullscreen overlay */}
            <div className="relative flex items-center justify-between px-6 py-5 border-b border-white/10">
              <a
                href="#home"
                onClick={(e) => handleLinkClick(e, "#home")}
                className="flex items-center gap-2 text-white"
              >
                <img src="/first-aid-kit-doctor-svgrepo-com.svg" alt="Homecare" className="h-5 w-5 brightness-0 invert" />
                <span className="text-sm font-bold tracking-wider uppercase text-white">Homecare</span>
              </a>

              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Tutup menu"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X className="h-4.5 w-4.5" />
              </motion.button>
            </div>

            {/* Main overlay scrollable content container */}
            <div className="relative flex-1 flex flex-col justify-between overflow-y-auto px-8 py-8" ref={drawerRef}>
              {/* Navigation Menu List */}
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((item, i) => {
                  const ItemIcon = item.icon;
                  const isActive = activeHash === item.href;
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 260, damping: 22 }}
                      className={cn(
                        "border-b border-white/5",
                        i === 0 && "border-t"
                      )}
                    >
                      <a
                        href={item.href}
                        onClick={(e) => handleLinkClick(e, item.href)}
                        className="relative flex items-center justify-between py-4.5 font-[family-name:var(--font-display)] text-[1.4rem] font-medium tracking-tight group"
                      >
                        <span className={cn(
                          "transition-all duration-300",
                          isActive ? "text-[var(--honey)] font-bold pl-2" : "text-white/80 group-hover:text-white group-hover:pl-2"
                        )}>
                          {item.name}
                        </span>
                        <ItemIcon
                          className={cn(
                            "h-4.5 w-4.5 transition-transform duration-300",
                            isActive ? "text-[var(--honey)] scale-110" : "text-white/30 group-hover:text-white/60"
                          )}
                        />
                      </a>
                    </motion.div>
                  );
                })}

                {/* Layanan Accordion */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: NAV_LINKS.length * 0.05, type: "spring", stiffness: 260, damping: 22 }}
                  className="border-b border-white/5"
                >
                  <button
                    type="button"
                    onClick={() => setMobileServiceOpen((open) => !open)}
                    className="flex w-full items-center justify-between py-4.5 text-left font-[family-name:var(--font-display)] text-[1.4rem] font-medium tracking-tight text-white/80 hover:text-white group"
                  >
                    <span className={cn(
                      "transition-all duration-300",
                      isMobileServiceOpen || activeHash === "#services" ? "text-[var(--honey)] font-bold pl-2" : "text-white/80 group-hover:pl-2"
                    )}>
                      Layanan
                    </span>
                    <ChevronIcon open={isMobileServiceOpen} />
                  </button>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isMobileServiceOpen ? "max-h-[32rem] pb-4 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="flex flex-col divide-y divide-white/5 border-t border-white/5 bg-white/5 rounded-2xl p-2.5 mt-2 gap-0.5">
                      {SERVICE_ITEMS.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          onClick={(e) => handleServiceItemClick(e, item)}
                          className="py-3 px-4 text-[0.88rem] font-medium text-white/70 rounded-xl transition-all duration-200 hover:bg-white/10 hover:text-[var(--honey)]"
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom contact block */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (NAV_LINKS.length + 1) * 0.05 }}
                className="mt-8 flex flex-col gap-3"
              >
                <a
                  href="https://wa.me/6285773780406"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-center gap-3 w-full rounded-full bg-[var(--honey)] hover:bg-[var(--honey-deep)] text-[var(--pine-deep)] py-4 font-bold text-sm shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a8.06 8.06 0 00-8.052 8.05 8.056 8.056 0 002.064 5.476l-.323 1.179 1.213-.323a8.035 8.035 0 003.86.962h.005a8.074 8.074 0 008.064-8.053 8.047 8.047 0 00-2.357-5.671 8.047 8.047 0 00-5.707-2.36zM12.071 0C5.717 0 .429 5.287.429 11.643c0 2.259.584 4.43 1.697 6.29L0 24l6.514-1.708C9.03 23.41 10.82 24 12.071 24c6.355 0 11.643-5.288 11.643-11.643 0-3.128-1.286-6.082-3.623-8.418C18.154 1.286 15.199 0 12.071 0z" />
                  </svg>
                  Hubungi via WhatsApp
                </a>

                <div className="flex items-center justify-center gap-6 mt-3 border-t border-white/10 pt-4">
                  <a
                    href="tel:+6285773780406"
                    className="flex items-center gap-2 text-xs font-semibold text-white/60 transition-colors hover:text-white"
                  >
                    <Phone className="h-3.5 w-3.5 text-[var(--honey)]" />
                    +62 857-7378-0406
                  </a>
                  <span className="text-white/20">|</span>
                  <span className="text-xs text-white/50">Siaga 24 Jam</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}