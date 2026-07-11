import { useEffect } from 'react'
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — Discussions Exegetica` : 'Discussions Exegetica — Where Scripture is Opened Together'
  }, [title])
}
