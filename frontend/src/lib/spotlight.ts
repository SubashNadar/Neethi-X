import type { PointerEvent } from 'react'

// Pointer handler for `.spotlight` elements (index.css): moves the glow to follow the cursor.
export function trackSpotlight(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}
