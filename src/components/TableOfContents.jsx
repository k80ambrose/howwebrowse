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

  const links = SECTIONS.map(({ id, label }) => (
    <button
      key={id}
      type="button"
      className={`toc-link ${activeId === id ? 'is-active' : ''}`}
      onClick={() => scrollTo(id)}
    >
      {label}
    </button>
  ))

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="toc toc-desktop" aria-label="Table of contents">
        <div className="toc-title">Contents</div>
        {links}
      </nav>

      {/* Mobile top-floating menu */}
      <div className="toc toc-mobile">
        <button
          onClick={() => setOpen(!open)}
          className="toc-mobile-toggle"
          aria-label="Table of contents"
          aria-expanded={open}
        >
          <span>Contents</span>
          <span aria-hidden="true">{open ? 'Close' : 'Menu'}</span>
        </button>
        {open && (
          <div className="toc-mobile-panel">{links}</div>
        )}
      </div>
    </>
  )
}
