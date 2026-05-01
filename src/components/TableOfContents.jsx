import { useState, useEffect, useRef } from 'react'

const SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'background', label: 'The Netflix Recommendation System' },
  { id: 'litreview', label: 'Literature Review' },
  { id: 'methods', label: 'Methods & Data' },
  { id: 'results', label: 'Results' },
  { id: 'discussion', label: 'Discussion' },
  { id: 'bibliography', label: 'Bibliography' },
  { id: 'acknowledgments', label: 'Acknowledgments' },
]

export default function TableOfContents() {
  const [activeId, setActiveId] = useState(null)
  const [open, setOpen] = useState(false)
  const observerRef = useRef(null)

  useEffect(() => {
    const options = { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveId(entry.target.id)
      })
    }, options)

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [])

  function scrollTo(id) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  const linkStyle = (id) => ({
    display: 'block',
    padding: '6px 12px',
    fontSize: '13px',
    fontFamily: '"articulat-cf", sans-serif',
    fontWeight: activeId === id ? 700 : 400,
    color: activeId === id ? '#023e8a' : '#444',
    background: activeId === id ? 'rgba(2, 62, 138, 0.08)' : 'transparent',
    borderLeft: `3px solid ${activeId === id ? '#023e8a' : 'transparent'}`,
    cursor: 'pointer',
    borderRadius: '0 4px 4px 0',
    transition: 'all 0.2s',
    textDecoration: 'none',
    lineHeight: '1.4',
    marginBottom: '2px',
  })

  const links = SECTIONS.map(({ id, label }) => (
    <div key={id} style={linkStyle(id)} onClick={() => scrollTo(id)}>
      {label}
    </div>
  ))

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        style={{
          position: 'fixed',
          top: '50%',
          left: '16px',
          transform: 'translateY(-50%)',
          width: '180px',
          zIndex: 50,
          display: 'none',
          background: 'rgba(255,255,255,0.92)',
          borderRadius: '8px',
          padding: '12px 0',
          boxShadow: '0 2px 16px rgba(0,0,0,0.1)',
        }}
        className="toc-desktop"
      >
        <div style={{ padding: '0 12px 8px', fontSize: '11px', fontWeight: 700, color: '#999', letterSpacing: '0.08em', fontFamily: '"articulat-cf", sans-serif' }}>
          CONTENTS
        </div>
        {links}
      </nav>

      {/* Mobile floating button + drawer */}
      <div className="toc-mobile" style={{ position: 'fixed', bottom: '20px', right: '16px', zIndex: 200 }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: 'none',
            background: '#023e8a',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Table of contents"
        >
          ☰
        </button>
        {open && (
          <div
            style={{
              position: 'absolute',
              bottom: '56px',
              right: 0,
              width: '220px',
              background: 'rgba(255,255,255,0.97)',
              borderRadius: '10px',
              padding: '12px 0',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ padding: '0 12px 8px', fontSize: '11px', fontWeight: 700, color: '#999', letterSpacing: '0.08em', fontFamily: '"articulat-cf", sans-serif' }}>
              CONTENTS
            </div>
            {links}
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 1100px) {
          .toc-desktop { display: block !important; }
          .toc-mobile { display: none !important; }
        }
      `}</style>
    </>
  )
}
