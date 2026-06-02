import { useEffect, useRef, useState } from 'react'

export const useStickySentinel = () => {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || typeof IntersectionObserver === 'undefined') {
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsSticky(!entry.isIntersecting)
    })

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [])

  return {
    isSticky,
    sentinelRef,
  }
}
