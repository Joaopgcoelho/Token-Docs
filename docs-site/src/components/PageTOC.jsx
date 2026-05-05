import React, { useState, useEffect } from 'react';

/**
 * Scans a container element for h2 and h3 headings, assigns unique IDs,
 * and returns an array of heading items.
 *
 * Exported for testability (property-based tests).
 *
 * @param {Element} container - DOM element to scan (e.g. `.main-content`)
 * @param {string} active - Active section ID used to generate unique heading IDs
 * @returns {Array<{ id: string, text: string, level: string }>}
 */
export function collectHeadings(container, active) {
  if (!container) return [];

  const elements = container.querySelectorAll('h2, h3');
  return Array.from(elements).map((el, i) => {
    const id = `toc-${active}-${i}`;
    el.id = id;
    return { id, text: el.textContent, level: el.tagName };
  });
}

export default function PageTOC({ active }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const container = document.querySelector('.main-content');
    const items = collectHeadings(container, active);
    setHeadings(items);
    setActiveId(null);
  }, [active]);

  // IntersectionObserver for scroll spy
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const h2Count = headings.filter((h) => h.level === 'H2').length;
  if (h2Count < 3) return null;

  return (
    <nav className="page-toc">
      <div className="page-toc-title">Nesta página</div>
      {headings.map(({ id, text, level }) => (
        <a
          key={id}
          href={`#${id}`}
          className={`${level === 'H3' ? 'toc-h3' : ''}${activeId === id ? ' active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          {text.substring(0, 40)}
        </a>
      ))}
    </nav>
  );
}
