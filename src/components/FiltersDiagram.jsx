import { useState, useRef, useEffect, useCallback } from 'react'

const GROUPS = {
  tropes: {
    label: 'Tropes',
    color: '#fb6107',
    cx: 179.1, cy: 99.51, r: 99,
    title: 'Tropes',
    subtitle: 'What is this about?',
    description: 'Participant identified themes, motifs, and clichés embedded in a title\'s plot.',
  },
  associations: {
    label: 'Associations',
    color: '#2196f3',
    cx: 262.38, cy: 145.78, r: 99,
    title: 'Associations',
    subtitle: 'What does this remind me of?',
    description: 'Participant directly linked a title with other content due to perceived similarities.',
  },
  audience: {
    label: 'Audience',
    color: '#7161ef',
    cx: 243.84, cy: 218.61, r: 99,
    title: 'Perceived Audience',
    subtitle: 'Is this for me?',
    description: 'Participant ascribed content to particular social categories based on who they thought would watch it.',
  },
  situation: {
    label: 'Situation',
    color: '#FFC857',
    cx: 115.93, cy: 218.65, r: 99,
    title: 'Situational Suitability',
    subtitle: 'Is this the right time?',
    description: 'Participant classified title based on where or when they deemed it appropriate to watch.',
  },
  acceptability: {
    label: 'Acceptability',
    color: '#55a630',
    cx: 99.53, cy: 142.46, r: 99,
    title: 'Social & Moral Acceptability',
    subtitle: 'Is it okay to watch this?',
    description: 'Participant classified title based on its social or moral acceptability.',
  },
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

export default function FiltersDiagram() {
  const [active, setActive] = useState(null)
  const svgRef = useRef(null)

  const handleSvgInteraction = useCallback((clientX, clientY) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const scaleX = 361.91 / rect.width
    const scaleY = 318.16 / rect.height
    const mx = (clientX - rect.left) * scaleX
    const my = (clientY - rect.top) * scaleY

    let closest = null
    let minD = Infinity
    for (const [key, g] of Object.entries(GROUPS)) {
      const d = dist(mx, my, g.cx, g.cy)
      if (d < g.r && d < minD) {
        closest = key
        minD = d
      }
    }
    setActive(closest)
  }, [])

  const onMouseMove = useCallback((e) => {
    handleSvgInteraction(e.clientX, e.clientY)
  }, [handleSvgInteraction])

  const onMouseLeave = useCallback(() => setActive(null), [])

  const onTap = useCallback((e) => {
    e.preventDefault()
    const touch = e.changedTouches[0]
    handleSvgInteraction(touch.clientX, touch.clientY)
  }, [handleSvgInteraction])

  const info = active ? GROUPS[active] : null

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
      <div style={{ flex: '0 0 auto', maxWidth: '360px', width: '100%' }}>
        <svg
          ref={svgRef}
          viewBox="0 0 361.91 318.16"
          style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          onTouchEnd={onTap}
        >
          {Object.entries(GROUPS).map(([key, g]) => {
            const isActive = active === key
            const stroke = isActive ? g.color : '#cccccc'
            return (
              <g key={key} id={`${key}-group`}>
                <circle
                  cx={g.cx} cy={g.cy} r={g.r}
                  fill="none"
                  stroke={stroke}
                  strokeWidth="1.2"
                  style={{ transition: 'stroke 0.2s' }}
                />
                <text
                  x={g.cx} y={g.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={stroke}
                  fontSize="11"
                  fontFamily="articulat-cf, sans-serif"
                  fontWeight="700"
                  style={{ transition: 'fill 0.2s', pointerEvents: 'none' }}
                >
                  {g.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div
        style={{
          flex: '1 1 200px',
          minHeight: '120px',
          padding: '16px',
          borderRadius: '8px',
          background: info ? `${info.color}15` : 'transparent',
          border: info ? `1.5px solid ${info.color}` : '1.5px solid transparent',
          transition: 'all 0.25s',
          fontFamily: '"articulat-cf", sans-serif',
        }}
      >
        {info ? (
          <>
            <div style={{ fontWeight: 800, fontSize: '20px', color: info.color, marginBottom: '4px' }}>
              {info.title}
            </div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: info.color, marginBottom: '8px', fontStyle: 'italic' }}>
              {info.subtitle}
            </div>
            <div style={{ fontWeight: 400, fontSize: '14px', color: '#333', lineHeight: '1.5' }}>
              {info.description}
            </div>
          </>
        ) : (
          <div style={{ color: '#aaa', fontSize: '14px', marginTop: '8px' }}>
            Hover or tap a circle to explore.
          </div>
        )}
      </div>
    </div>
  )
}
