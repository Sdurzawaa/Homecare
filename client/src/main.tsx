import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import Lenis from 'lenis'

// Lenis cuma dibutuhin buat "membobotkan" scroll wheel di desktop. Di touch
// device, native scroll udah smooth, dan listener touchstart/touchmove
// non-passive yang dipasang Lenis (untuk baca posisi scroll saat lerp)
// justru nge-block main thread dan bikin tap/scroll pertama delay ratusan
// ms — itu yang muncul sebagai INP jelek di semua interaksi, termasuk klik
// tombol card di Achievements.
const isTouchDevice =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

let lenis: Lenis | null = null

if (!isTouchDevice) {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    wheelMultiplier: 1,
    syncTouch: false,
    touchMultiplier: 2,
    autoRaf: false,
  })

  function raf(time: number) {
    lenis!.raf(time)
    requestAnimationFrame(raf)
  }

  requestAnimationFrame(raf)
}

// Expose lenis globally to allow components (like navigation drawer and modals) to pause scroll
if (typeof window !== 'undefined') {
  ;(window as any).lenis = lenis
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)