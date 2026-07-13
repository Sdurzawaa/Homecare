import { useEffect, useState, useRef, useCallback } from "react";
import type { ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";

const ANIMATION_DURATION = 280; // ms — harus sama dengan duration di className

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  title?: string | null;
};

function Modal({ isOpen, onClose, children, title = null }: ModalProps): ReactElement | null {
  // `visible` = apakah DOM-nya ada (termasuk saat exit animation)
  // `entered` = apakah sudah fully entered (trigger class animasi)
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const exitTimerRef = useRef<number | undefined>(undefined);

  // Stable close handler: jalankan exit animation dulu, baru unmount
  const handleClose = useCallback(() => {
    setEntered(false); // trigger exit animation
    exitTimerRef.current = setTimeout(() => {
      setVisible(false);
      onClose();
    }, ANIMATION_DURATION);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      // Batalkan exit timer kalau modal dibuka lagi sebelum selesai
      clearTimeout(exitTimerRef.current);
      setVisible(true);

      // Double-RAF: pastikan browser sudah commit paint pertama
      // sebelum kita set `entered = true` yang trigger animasi masuk.
      // Satu RAF saja kadang masih di frame yang sama → patah-patah.
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setEntered(true);
        });
        return () => cancelAnimationFrame(raf2);
      });

      return () => cancelAnimationFrame(raf1);
    } else {
      // Kalau parent paksa tutup dari luar (bukan lewat handleClose)
      setEntered(false);
      exitTimerRef.current = setTimeout(
        () => setVisible(false),
        ANIMATION_DURATION,
      );
    }

    return () => clearTimeout(exitTimerRef.current);
  }, [isOpen]);

  // Keyboard handler terpisah dari effect mount/unmount
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
        return;
      }

      // Tab trap
      if (e.key === "Tab") {
        const focusable = modalContentRef.current?.querySelectorAll<HTMLElement>(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (e.shiftKey && active === first) {
          last?.focus();
          e.preventDefault();
        } else if (!e.shiftKey && active === last) {
          first?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    // Auto-focus tombol close
    const focusTimer = setTimeout(() => {
      modalContentRef.current
        ?.querySelector<HTMLElement>("[data-modal-close]")
        ?.focus();
    }, ANIMATION_DURATION);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      clearTimeout(focusTimer);
    };
  }, [visible, handleClose]);

  if (!visible) return null;

  return createPortal(
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6"
      style={{
        // Backdrop: transisi warna aja yang di-animate. backdrop-filter (blur)
        // sengaja TIDAK ikut di-transisi — nge-interpolasi nilai blur tiap
        // frame itu mahal banget buat browser (harus render ulang semua
        // konten di belakangnya setiap tick), makanya animasinya kerasa
        // patah-patah. Blur dipasang langsung konstan, cuma warnanya yang
        // fade in/out, jauh lebih ringan tapi visualnya tetap mulus.
        backgroundColor: entered ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        transition: "background-color " + ANIMATION_DURATION + "ms ease",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Modal content container */}
      <div
        ref={modalContentRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          // GPU-accelerated: akan-change supaya browser reservasi layer compositor
          willChange: "transform, opacity",
          transform: entered
            ? "translateY(0) scale(1)"
            : "translateY(24px) scale(0.96)",
          opacity: entered ? 1 : 0,
          transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.34, 1.2, 0.64, 1), opacity ${ANIMATION_DURATION}ms ease`,
        }}
        className="relative w-full max-w-4xl"
      >
        {/* Tombol close */}
        <button
          onClick={handleClose}
          data-modal-close
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#5b2333] backdrop-blur-md transition-all duration-300 hover:bg-white hover:rotate-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pine)]"
          aria-label="Tutup"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Main content */}
        <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_20px_60px_rgba(28,58,48,0.3)]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
