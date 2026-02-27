import { useEffect, useRef, useState } from 'react'

/**
 * A fun lobster emoji that crawls around the edges of the chat body
 * while the AI is processing. Uses CSS animation to travel in a
 * rectangular path along the container perimeter.
 */
export default function LobsterLoader() {
  const ref = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 600, h: 400 })

  useEffect(() => {
    const measure = () => {
      const parent = ref.current?.parentElement
      if (parent) {
        setDims({ w: parent.clientWidth, h: parent.clientHeight })
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (ref.current?.parentElement) ro.observe(ref.current.parentElement)
    return () => ro.disconnect()
  }, [])

  // Build a CSS offset-path rectangle that traces the container edges with
  // some inset so the lobster stays visually inside the chat area.
  const inset = 18
  const w = Math.max(dims.w - inset * 2, 40)
  const h = Math.max(dims.h - inset * 2, 40)

  return (
    <div ref={ref} className="LobsterLoader" aria-hidden="true">
      <span
        className="LobsterLoader__crab"
        style={{
          // offset-path draws a rectangle the lobster follows
          offsetPath: `path("M ${inset} ${inset} L ${inset + w} ${inset} L ${inset + w} ${inset + h} L ${inset} ${inset + h} Z")`,
        }}
      >
        🦞
      </span>
    </div>
  )
}
