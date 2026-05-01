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
  const [visible, setVisible] = useState(false)
  const desktopRef = useRef(null)
  const mobileRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    function updateVisibility() {
      const introduction = document.getElementById('introduction')
      if (!introduction) return

      const toc = window.matchMedia('(min-width: 1100px)').matches
        ? desktopRef.current
        : mobileRef.current
      if (!toc) return

      const introductionTop = introduction.getBoundingClientRect().top
      const tocTop = toc.getBoundingClientRect().top
      setVisible(introductionTop <= tocTop)
    }

    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })
    window.addEventListener('resize', updateVisibility)

    return () => {
      window.removeEventListener('scroll', updateVisibility)
      window.removeEventListener('resize', updateVisibility)
    }
  }, [])

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
      <nav
        ref={desktopRef}
        className={`toc toc-desktop ${visible ? 'is-visible' : ''}`}
        aria-label="Table of contents"
      >
        <div className="toc-title">Contents</div>
        {links}
      </nav>

      {/* Mobile top-floating menu */}
      <div ref={mobileRef} className={`toc toc-mobile ${visible ? 'is-visible' : ''}`}>
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
