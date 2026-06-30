import { useEffect } from 'react'

export function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} — Discussions Exegetica` : 'Discussions Exegetica'
    return () => { document.title = prev }
  }, [title])
}
