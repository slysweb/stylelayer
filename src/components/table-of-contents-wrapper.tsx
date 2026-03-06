'use client'

import { useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

export function TableOfContentsWrapper() {
  const [headings, setHeadings] = useState<Heading[]>([])

  useEffect(() => {
    // Extract headings from the rendered content
    const extractHeadings = () => {
      const headingElements = document.querySelectorAll('article h2, article h3')
      const extracted: Heading[] = []

      headingElements.forEach((element) => {
        const id = element.id
        const text = element.textContent || ''
        const level = parseInt(element.tagName.charAt(1))

        if (id && text) {
          extracted.push({ id, text, level })
        }
      })

      setHeadings(extracted)
    }

    // Wait for content to render
    const timer = setTimeout(extractHeadings, 100)

    // Also extract on content changes
    const observer = new MutationObserver(extractHeadings)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (headings.length === 0) return

    // Set up Intersection Observer to track which heading is in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0,
      }
    )

    // Observe all headings
    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      headings.forEach(({ id }) => {
        const element = document.getElementById(id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const offset = 100 // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })

      // Update URL without scrolling
      window.history.pushState({}, '', `#${id}`)
    }
  }

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto"
    >
      <div className="border-l-2 border-stone-200 pl-6">
        <h2 className="text-sm font-semibold text-stone-900 mb-4">Table of Contents</h2>
        <ul className="space-y-2 text-sm">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={`
                  block py-1 transition-colors
                  ${heading.level === 2 ? 'pl-0 font-medium' : 'pl-4 text-stone-600'}
                  ${
                    activeId === heading.id
                      ? 'text-stone-900 border-l-2 border-stone-900 -ml-6 pl-6'
                      : 'text-stone-600 hover:text-stone-900'
                  }
                `}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
