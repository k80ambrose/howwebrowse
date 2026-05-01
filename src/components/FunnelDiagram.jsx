import { useEffect, useRef } from 'react'

const COLORS = [
  '#caf0f8', '#ade8f4', '#90e0ef', '#48cae4',
  '#00b4d8', '#0096c7', '#0077b6', '#023e8a', '#03045e',
]

export default function FunnelDiagram() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const stateRef = useRef({ echoes: [], mouseX: null, rafId: null })

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    const state = stateRef.current

    function resize() {
      const cw = container.clientWidth
      canvas.width = Math.min(cw, 800)
      canvas.height = 300
    }
    resize()
    window.addEventListener('resize', resize)

    function getMouseX(e) {
      const rect = canvas.getBoundingClientRect()
      if (e.touches) return e.touches[0].clientX - rect.left
      return e.clientX - rect.left
    }
    function onMove(e) {
      state.mouseX = getMouseX(e)
    }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('touchmove', onMove, { passive: true })
    canvas.addEventListener('mouseleave', () => { state.mouseX = null })

    function draw() {
      state.rafId = requestAnimationFrame(draw)
      const w = canvas.width
      const h = canvas.height

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)

      const funnelLength = w * 0.875
      const baseRY = h * 0.333
      const baseRX = baseRY * 0.2
      const baseCX = (w - funnelLength) / 2 + baseRX
      const tipX = (w + funnelLength) / 2 - baseRX

      // Draw funnel outline
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(baseCX, h / 2, baseRX, baseRY, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(baseCX, h / 2 - baseRY)
      ctx.lineTo(tipX, h / 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(baseCX, h / 2 + baseRY)
      ctx.lineTo(tipX, h / 2)
      ctx.stroke()

      // Active ellipse at mouse position
      const mxConstrained = state.mouseX !== null
        ? Math.max(baseCX, Math.min(tipX, state.mouseX))
        : baseCX
      const distance = ((mxConstrained - baseCX) / (tipX - baseCX)) * (funnelLength - 2 * baseRX)
      const maxDist = funnelLength - 2 * baseRX
      const ry = baseRY * (1 - distance / maxDist)
      const rx = ry * (baseRX / baseRY)

      const colorIdx = Math.min(
        Math.floor((distance / maxDist) * COLORS.length),
        COLORS.length - 1
      )
      const currentColor = COLORS[colorIdx]

      // Update echoes
      state.echoes.push({ x: mxConstrained, ry, rx, color: currentColor })
      if (state.echoes.length > 5) state.echoes.shift()

      // Draw echoes
      state.echoes.forEach((echo, i) => {
        const alpha = (i / (state.echoes.length - 1)) * 0.8 + 0.1
        ctx.globalAlpha = alpha
        ctx.strokeStyle = echo.color
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.ellipse(echo.x, h / 2, echo.rx, echo.ry, 0, 0, Math.PI * 2)
        ctx.stroke()
      })
      ctx.globalAlpha = 1

      // Draw active ellipse
      ctx.strokeStyle = currentColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.ellipse(mxConstrained, h / 2, rx, ry, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Redraw funnel outline on top
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(baseCX, h / 2, baseRX, baseRY, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(baseCX, h / 2 - baseRY)
      ctx.lineTo(tipX, h / 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(baseCX, h / 2 + baseRY)
      ctx.lineTo(tipX, h / 2)
      ctx.stroke()
    }

    draw()

    return () => {
      cancelAnimationFrame(state.rafId)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('touchmove', onMove)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div ref={containerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', touchAction: 'none' }}
      />
    </div>
  )
}
