import { useEffect, useRef, useState } from 'react'
import { createNoise2D } from 'simplex-noise'

const THUMBNAIL_COUNT = 300
const THUMBNAIL_COLORS = [
  [1, 42, 74], [1, 57, 100], [2, 78, 137], [4, 101, 168],
  [12, 126, 184], [24, 158, 202], [80, 186, 221], [144, 213, 233], [169, 214, 229]
]
const THUMBNAIL_WIDTH = 180
const THUMBNAIL_HEIGHT = 96
const FINAL_BLUE = [24, 158, 202]
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

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
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    const noise2D = createNoise2D()
    let w = container.clientWidth
    let h = container.clientHeight

    function sizeCanvas() {
      const dpr = window.devicePixelRatio || 1
      w = container.clientWidth
      h = container.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    sizeCanvas()

    // --- Build thumbnails ---
    const drawOrder = Array.from({ length: THUMBNAIL_COUNT }, (_, i) => i).sort(() => Math.random() - 0.5)
    const finalOffset = [
      { x: 0.36, y: 0.32 },
      { x: 0.64, y: 0.34 },
      { x: 0.35, y: 0.68 },
      { x: 0.65, y: 0.66 },
    ][Math.floor(Math.random() * 4)]
    const thumbnails = Array.from({ length: THUMBNAIL_COUNT }, (_, i) => {
      const cIdx = Math.floor(Math.random() * THUMBNAIL_COLORS.length)
      const order = drawOrder[i]
      const isFinalThumbnail = order === 0
      return {
        x: isFinalThumbnail ? w * finalOffset.x : Math.random() * w,
        y: isFinalThumbnail ? h * finalOffset.y : Math.random() * h,
        order,
        w: THUMBNAIL_WIDTH,
        h: THUMBNAIL_HEIGHT,
        nOffX: Math.random() * 1000,
        nOffY: Math.random() * 1000,
        nOffA: Math.random() * 1000,
        driftX: isFinalThumbnail ? randBetween(4, 8) : randBetween(8, 30),
        driftY: isFinalThumbnail ? randBetween(3, 7) : randBetween(6, 24),
        speed: isFinalThumbnail ? randBetween(0.1, 0.18) : randBetween(0.16, 0.34),
        color: isFinalThumbnail ? FINAL_BLUE : THUMBNAIL_COLORS[cIdx],
        dragging: false,
        dragOffX: 0,
        dragOffY: 0,
      }
    })

    // --- State ---
    const state = {
      frame: 0,
      scrollAmount: 0,
      allowNormalScroll: false,
      thumbnailsVisible: true,
      bgT: 0,          // 0 = dark blue, 1 = light gray
      titleAlpha: 0,
      titleFrames: 0,
      draggedThumb: null,
      done: false,
    }
    stateRef.current = state

    // --- Scroll / touch handling ---
    const SCROLL_TOTAL = 800
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
        const visibleCount = Math.ceil(THUMBNAIL_COUNT * (1 - easeOutCubic(progress)))
        if (t.order >= visibleCount) continue
        if (x > t.x - t.w / 2 && x < t.x + t.w / 2 && y > t.y - t.h / 2 && y < t.y + t.h / 2) return i
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
      const ti = thumbAt(x, y)
      if (ti !== -1) {
        state.draggedThumb = ti
        const t = thumbnails[ti]
        t.dragging = true
        t.dragOffX = x - t.x
        t.dragOffY = y - t.y
      }
    }
    function onPointerMove(e) {
      if (state.draggedThumb === null) return
      const { x, y } = getXY(e)
      const t = thumbnails[state.draggedThumb]
      t.x = x - t.dragOffX
      t.y = y - t.dragOffY
    }
    function onPointerUp() {
      if (state.draggedThumb !== null) {
        thumbnails[state.draggedThumb].dragging = false
      }
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
      sizeCanvas()
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

    function drawChevron(ctx, x, y, size) {
      ctx.beginPath()
      ctx.moveTo(x - size, y - size * 0.3)
      ctx.lineTo(x, y + size * 0.55)
      ctx.lineTo(x + size, y - size * 0.3)
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#ffffff'
      ctx.stroke()
    }

    function drawTitle(ctx, alpha) {
      const maxWidth = Math.min(w - 40, 760)
      const lines = ['The Choreography of Choice:', 'Browsing Netflix as a Cultural Exercise']
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#111111'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = '900 30px "articulat-cf", sans-serif'

      if (w < 620) {
        ctx.font = '900 22px "articulat-cf", sans-serif'
      }

      lines.forEach((line, i) => {
        ctx.fillText(line, w / 2, h / 2 - 20 + i * 42, maxWidth)
      })
      ctx.globalAlpha = 1
    }

    // --- Main draw loop ---
    function draw() {
      rafRef.current = requestAnimationFrame(draw)
      state.frame++
      const t = state.frame * 0.01

      const progress = Math.min(state.scrollAmount / SCROLL_TOTAL, 1)
      state.bgT = progress

      // Background
      const darkBg = [1, 42, 74]
      const lightBg = [235, 235, 235]
      const bg = lerpColor(darkBg, lightBg, progress)
      ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`
      ctx.fillRect(0, 0, w, h)

      // Thumbnails
      const visibleCount = Math.ceil(THUMBNAIL_COUNT * (1 - easeOutCubic(progress)))
      thumbnails.forEach((thumb, i) => {
        if (thumb.order >= visibleCount) return

        const nx = noise2D(thumb.nOffX + t * thumb.speed, thumb.nOffA)
        const ny = noise2D(thumb.nOffY, thumb.nOffA + t * thumb.speed)
        if (!thumb.dragging) {
          thumb.x += nx * 0.16
          thumb.y += ny * 0.16

          if (thumb.x < -thumb.w) thumb.x = w + thumb.w
          if (thumb.x > w + thumb.w) thumb.x = -thumb.w
          if (thumb.y < -thumb.h) thumb.y = h + thumb.h
          if (thumb.y > h + thumb.h) thumb.y = -thumb.h
        }

        const floatX = noise2D(thumb.nOffX, t * thumb.speed) * thumb.driftX
        const floatY = noise2D(t * thumb.speed, thumb.nOffY) * thumb.driftY
        const edgeFade = clamp(visibleCount - thumb.order, 0, 1)
        const alpha = (0.66 + 0.22 * Math.abs(noise2D(thumb.nOffA, t * 0.12))) * edgeFade
        const cx = thumb.x + floatX
        const cy = thumb.y + floatY
        const [r, g, b] = visibleCount <= 1 ? FINAL_BLUE : thumb.color

        ctx.globalAlpha = alpha
        ctx.fillStyle = `rgb(${r},${g},${b})`
        drawRoundedRect(ctx, cx - thumb.w / 2, cy - thumb.h / 2, thumb.w, thumb.h, 14)
        ctx.fill()
        ctx.globalAlpha = 1
      })

      if (state.scrollAmount < 3) {
        const cueAlpha = 0.28 + 0.38 * Math.abs(Math.sin(state.frame * 0.045))
        const cueY = h - 54 + Math.sin(state.frame * 0.035) * 5
        ctx.globalAlpha = cueAlpha
        drawChevron(ctx, w / 2, cueY, 15)
        ctx.globalAlpha = cueAlpha * 0.55
        drawChevron(ctx, w / 2, cueY + 16, 15)
        ctx.globalAlpha = 1
      }

      if (visibleCount <= 1) {
        state.titleFrames++
        state.titleAlpha = Math.min(1, state.titleAlpha + 0.025)
        drawTitle(ctx, state.titleAlpha)
      }

      if (progress >= 1 && state.titleFrames > 90 && !state.allowNormalScroll) {
        state.allowNormalScroll = true
        setComplete(true)
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
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        zIndex: 1,
        cursor: complete ? 'default' : 'grab',
        touchAction: complete ? 'auto' : 'none',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}
