import { useEffect, useRef, useCallback } from 'react'
import { createNoise2D } from 'simplex-noise'

const THUMBNAIL_COUNT = 300
const THUMBNAIL_COLORS = [
  [1, 42, 74], [1, 57, 100], [2, 78, 137], [4, 101, 168],
  [12, 126, 184], [24, 158, 202], [80, 186, 221], [144, 213, 233], [169, 214, 229]
]
const NAV_ITEMS = [
  { label: 'Introduction', id: 'introduction' },
  { label: 'Background', id: 'background' },
  { label: 'Literature Review', id: 'litreview' },
  { label: 'Data & Methods', id: 'methods' },
  { label: 'Results', id: 'results' },
  { label: 'Discussion', id: 'discussion' },
  { label: 'Bibliography', id: 'bibliography' },
  { label: 'Acknowledgments', id: 'acknowledgments' },
]
const POPUPS = [
  { text: 'Browsing has arisen as a necessary means...', start: 0, duration: 120 },
  { text: "There's so much out there,", start: 130, duration: 100 },
  { text: 'yet so little feels right.', start: 240, duration: 100 },
  { text: 'When Netflix users encounter their homepage...', start: 350, duration: 120 },
  { text: 'how they use culture to make sense of it all\nwas the subject of this study.', start: 480, duration: 150 },
]

function randBetween(a, b) {
  return a + Math.random() * (b - a)
}

function lerpColor(c1, c2, t) {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
  ]
}

export default function OceanAnimation({ onComplete }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const rafRef = useRef(null)
  const containerRef = useRef(null)

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    const noise2D = createNoise2D()
    let w = container.clientWidth
    let h = container.clientHeight

    canvas.width = w
    canvas.height = h

    // --- Build thumbnails ---
    const thumbnails = Array.from({ length: THUMBNAIL_COUNT }, (_, i) => {
      const cIdx = Math.floor(Math.random() * THUMBNAIL_COLORS.length)
      const tw = randBetween(120, 150)
      const th = randBetween(80, 110)
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        w: tw,
        h: th,
        nOffX: Math.random() * 1000,
        nOffY: Math.random() * 1000,
        nOffA: Math.random() * 1000,
        speed: randBetween(0.3, 0.8),
        color: THUMBNAIL_COLORS[cIdx],
        dragging: false,
        dragOffX: 0,
        dragOffY: 0,
      }
    })

    // --- Build nav menu items ---
    const cols = 4
    const rows = 2
    const cardW = 150
    const cardH = 70
    const gapX = 20
    const gapY = 20
    const gridW = cols * cardW + (cols - 1) * gapX
    const gridH = rows * cardH + (rows - 1) * gapY
    const startX = (w - gridW) / 2
    const startY = (h - gridH) / 2

    const menuItems = NAV_ITEMS.map((item, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      return {
        label: item.label,
        id: item.id,
        x: startX + col * (cardW + gapX),
        y: startY + row * (cardH + gapY),
        w: cardW,
        h: cardH,
        nOff: Math.random() * 1000,
        alpha: 0,
      }
    })

    // --- State ---
    const state = {
      frame: 0,
      scrollAmount: 0,
      allowNormalScroll: false,
      thumbnailsVisible: true,
      bgT: 0,          // 0 = dark blue, 1 = light gray
      menuAlpha: 0,
      titleAlpha: 0,
      draggedThumb: null,
      popupFrame: 0,
      popupActive: false,
      done: false,
    }
    stateRef.current = state

    // --- Scroll / touch handling ---
    const SCROLL_TOTAL = 800
    const MENU_THRESHOLD = 700

    function onWheel(e) {
      if (state.allowNormalScroll) return
      e.preventDefault()
      state.scrollAmount = Math.min(state.scrollAmount + Math.abs(e.deltaY) * 0.6, SCROLL_TOTAL)
    }

    let touchStartY = 0
    function onTouchStart(e) {
      if (state.allowNormalScroll) return
      touchStartY = e.touches[0].clientY
    }
    function onTouchMove(e) {
      if (state.allowNormalScroll) return
      e.preventDefault()
      const dy = touchStartY - e.touches[0].clientY
      touchStartY = e.touches[0].clientY
      state.scrollAmount = Math.min(state.scrollAmount + Math.abs(dy) * 1.2, SCROLL_TOTAL)
    }

    // --- Drag handling for thumbnails ---
    function thumbAt(x, y) {
      for (let i = thumbnails.length - 1; i >= 0; i--) {
        const t = thumbnails[i]
        const progress = state.scrollAmount / SCROLL_TOTAL
        const scale = Math.max(0, 1 - progress * 1.5)
        const cx = w / 2 + (t.x - w / 2) * scale
        const cy = h / 2 + (t.y - h / 2) * scale
        if (x > cx - t.w / 2 && x < cx + t.w / 2 && y > cy - t.h / 2 && y < cy + t.h / 2) return i
      }
      return -1
    }

    function navAt(x, y) {
      if (state.menuAlpha < 0.5) return -1
      for (let i = 0; i < menuItems.length; i++) {
        const m = menuItems[i]
        if (x > m.x && x < m.x + m.w && y > m.y && y < m.y + m.h) return i
      }
      return -1
    }

    function getXY(e) {
      const rect = canvas.getBoundingClientRect()
      if (e.touches) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    function onPointerDown(e) {
      const { x, y } = getXY(e)
      const ni = navAt(x, y)
      if (ni !== -1) {
        scrollTo(menuItems[ni].id)
        return
      }
      const ti = thumbAt(x, y)
      if (ti !== -1) {
        state.draggedThumb = ti
        const t = thumbnails[ti]
        const progress = state.scrollAmount / SCROLL_TOTAL
        const scale = Math.max(0, 1 - progress * 1.5)
        const cx = w / 2 + (t.x - w / 2) * scale
        const cy = h / 2 + (t.y - h / 2) * scale
        t.dragOffX = x - cx
        t.dragOffY = y - cy
      }
    }
    function onPointerMove(e) {
      if (state.draggedThumb === null) return
      const { x, y } = getXY(e)
      const t = thumbnails[state.draggedThumb]
      const progress = state.scrollAmount / SCROLL_TOTAL
      const scale = Math.max(0, 1 - progress * 1.5)
      if (scale > 0) {
        const cx = x - t.dragOffX
        const cy = y - t.dragOffY
        t.x = w / 2 + (cx - w / 2) / scale
        t.y = h / 2 + (cy - h / 2) / scale
      }
    }
    function onPointerUp() {
      state.draggedThumb = null
    }

    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('mousedown', onPointerDown)
    canvas.addEventListener('mousemove', onPointerMove)
    canvas.addEventListener('mouseup', onPointerUp)
    canvas.addEventListener('touchstart', onPointerDown, { passive: false })
    canvas.addEventListener('touchmove', onPointerMove, { passive: false })
    canvas.addEventListener('touchend', onPointerUp)

    // --- Resize ---
    function onResize() {
      w = container.clientWidth
      h = container.clientHeight
      canvas.width = w
      canvas.height = h
    }
    window.addEventListener('resize', onResize)

    // --- Draw helpers ---
    function drawRoundedRect(ctx, x, y, width, height, r) {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + width - r, y)
      ctx.quadraticCurveTo(x + width, y, x + width, y + r)
      ctx.lineTo(x + width, y + height - r)
      ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
      ctx.lineTo(x + r, y + height)
      ctx.quadraticCurveTo(x, y + height, x, y + height - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
    }

    // --- Main draw loop ---
    function draw() {
      rafRef.current = requestAnimationFrame(draw)
      state.frame++
      const t = state.frame * 0.005

      const progress = Math.min(state.scrollAmount / SCROLL_TOTAL, 1)
      state.bgT = progress

      // Background
      const darkBg = [1, 42, 74]
      const lightBg = [235, 235, 235]
      const bg = lerpColor(darkBg, lightBg, progress)
      ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`
      ctx.fillRect(0, 0, w, h)

      // Thumbnails
      const scale = Math.max(0, 1 - progress * 1.5)
      if (scale > 0) {
        thumbnails.forEach((thumb, i) => {
          if (i === state.draggedThumb) return
          const nx = noise2D(thumb.nOffX + t * thumb.speed, 0)
          const ny = noise2D(0, thumb.nOffY + t * thumb.speed)
          thumb.x += nx * 0.5
          thumb.y += ny * 0.5

          const alpha = 0.6 + 0.4 * Math.abs(noise2D(thumb.nOffA, t * 0.3))
          const cx = w / 2 + (thumb.x - w / 2) * scale
          const cy = h / 2 + (thumb.y - h / 2) * scale
          const [r, g, b] = thumb.color

          ctx.globalAlpha = alpha * scale
          ctx.fillStyle = `rgb(${r},${g},${b})`
          ctx.fillRect(cx - thumb.w / 2, cy - thumb.h / 2, thumb.w * scale, thumb.h * scale)
          ctx.globalAlpha = 1
        })
      }

      // Popup text
      if (progress < 0.5 && !state.popupActive) {
        state.popupActive = true
      }
      if (state.popupActive && progress < 0.7) {
        state.popupFrame++
        const pf = state.popupFrame
        const activePopup = POPUPS.find(p => pf >= p.start && pf < p.start + p.duration)
        if (activePopup) {
          const elapsed = pf - activePopup.start
          const visibleChars = Math.min(elapsed * 2, activePopup.text.length)
          const visible = activePopup.text.slice(0, visibleChars)
          ctx.globalAlpha = Math.min(1, (activePopup.duration - elapsed) / 30)
          ctx.fillStyle = '#ffffff'
          ctx.font = '700 18px "articulat-cf", sans-serif'
          ctx.textAlign = 'center'
          const lines = visible.split('\n')
          lines.forEach((line, li) => {
            ctx.fillText(line, w / 2, h / 2 - 40 + li * 28)
          })
          ctx.globalAlpha = 1
        }
      }

      // Menu items appear
      if (progress > 0.8) {
        state.menuAlpha = Math.min(1, (progress - 0.8) / 0.2)
        menuItems.forEach((item) => {
          item.alpha = state.menuAlpha
          const jitterX = noise2D(item.nOff, t) * 3
          const jitterY = noise2D(item.nOff + 100, t) * 3
          const x = item.x + jitterX
          const y = item.y + jitterY

          ctx.globalAlpha = item.alpha
          ctx.fillStyle = 'rgba(255,255,255,0.15)'
          drawRoundedRect(ctx, x, y, item.w, item.h, 12)
          ctx.fill()
          ctx.strokeStyle = 'rgba(255,255,255,0.4)'
          ctx.lineWidth = 1
          ctx.stroke()

          ctx.fillStyle = '#ffffff'
          ctx.font = '600 13px "articulat-cf", sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(item.label, x + item.w / 2, y + item.h / 2)
          ctx.globalAlpha = 1
        })
      }

      // Title
      if (progress >= 1) {
        state.titleAlpha = Math.min(1, state.titleAlpha + 0.02)
        ctx.globalAlpha = state.titleAlpha
        ctx.fillStyle = '#1a1a1a'
        ctx.font = '900 clamp(14px, 2.5vw, 28px) "articulat-cf", sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('The Choreography of Choice:', w / 2, h / 2 - 24)
        ctx.fillText('Browsing Netflix as a Cultural Exercise', w / 2, h / 2 + 10)
        ctx.font = '400 clamp(11px, 1.4vw, 15px) "articulat-cf", sans-serif'
        ctx.fillText('Katie Ambrose · UChicago Sociology · May 2024', w / 2, h / 2 + 44)
        ctx.globalAlpha = 1

        // Scroll hint arrow
        const arrowAlpha = 0.5 + 0.5 * Math.sin(state.frame * 0.05)
        ctx.globalAlpha = arrowAlpha * state.titleAlpha
        ctx.fillStyle = '#555'
        ctx.font = '20px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('↓', w / 2, h - 40)
        ctx.globalAlpha = 1
      }

      // Allow normal scroll once menu fully visible and user has scrolled enough
      if (progress >= 1 && state.titleAlpha >= 0.8 && !state.allowNormalScroll) {
        state.allowNormalScroll = true
        if (onComplete) onComplete()
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('mousedown', onPointerDown)
      canvas.removeEventListener('mousemove', onPointerMove)
      canvas.removeEventListener('mouseup', onPointerUp)
      canvas.removeEventListener('touchstart', onPointerDown)
      canvas.removeEventListener('touchmove', onPointerMove)
      canvas.removeEventListener('touchend', onPointerUp)
      window.removeEventListener('resize', onResize)
    }
  }, [onComplete, scrollTo])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 100,
        cursor: 'grab',
        touchAction: 'none',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}
