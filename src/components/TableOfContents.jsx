import { useState, useEffect, useRef } from 'react'

const SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'background', label: 'The Netflix Recommendation System' },
  {
    id: 'litreview',
    label: 'Literature Review',
    subsections: [
      { id: 'lit-taste', label: 'Taste and Classification' },
      { id: 'lit-cultural', label: 'Cultural Knowledge in Action' },
      { id: 'lit-browsing', label: 'Studies of Browsing Behavior' },
      { id: 'lit-netflix', label: 'Scholarship of Netflix' },
    ],
  },
  {
    id: 'methods',
    label: 'Methods & Data',
    subsections: [
      { id: 'methods-recruitment', label: 'Recruitment and Demographics' },
      { id: 'methods-site', label: 'The Site' },
      { id: 'methods-interview', label: 'Interview Structure' },
      { id: 'methods-analysis', label: 'Data Analysis' },
    ],
  },
  {
    id: 'results',
    label: 'Results',
    subsections: [
      { id: 'results-classifying', label: 'Classifying Content' },
      { id: 'results-browsing', label: 'Browsing Behavior' },
      { id: 'results-working', label: 'Working Together' },
    ],
  },
  { id: 'discussion', label: 'Discussion' },
  { id: 'bibliography', label: 'Bibliography' },
  { id: 'acknowledgments', label: 'Acknowledgments' },
]

const SUBSECTION_PARENT = {}
SECTIONS.forEach(s => {
  if (s.subsections) s.subsections.forEach(sub => { SUBSECTION_PARENT[sub.id] = s.id })
})

export default function TableOfContents() {
  const [activeSectionId, setActiveSectionId] = useState(null)
  const [activeSubId, setActiveSubId] = useState(null)
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
      setVisible(introduction.getBoundingClientRect().top <= toc.getBoundingClientRect().top)
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
    const allIds = []
    SECTIONS.forEach(s => {
      allIds.push(s.id)
      if (s.subsections) s.subsections.forEach(sub => allIds.push(sub.id))
    })

    const options = { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id
          const parent = SUBSECTION_PARENT[id]
          if (parent) {
            setActiveSectionId(parent)
            setActiveSubId(id)
          } else {
            setActiveSectionId(id)
            setActiveSubId(null)
          }
        }
      })
    }, options)

    allIds.forEach(id => {
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

  const links = SECTIONS.map(section => {
    const isActive = activeSectionId === section.id
    return (
      <div key={section.id}>
        <button
          type="button"
          className={`toc-link ${isActive ? 'is-active' : ''}`}
          onClick={() => scrollTo(section.id)}
        >
          {section.label}
        </button>
        {isActive && section.subsections && (
          <div className="toc-subsections">
            {section.subsections.map(sub => (
              <button
                key={sub.id}
                type="button"
                className={`toc-sublink ${activeSubId === sub.id ? 'is-active' : ''}`}
                onClick={() => scrollTo(sub.id)}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  })

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

      {/* Mobile floating menu */}
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
