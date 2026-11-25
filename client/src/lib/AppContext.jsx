import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { readStorage, writeStorage } from './storage.js'
import { findTool } from '../data/tools.js'

const Context = createContext(null)

function storedTheme() {
  const saved = readStorage('toolora-theme', null)
  if (saved === 'light' || saved === 'dark') return saved
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function storedTools(key, limit = Infinity) {
  const saved = readStorage(key, [])
  if (!Array.isArray(saved)) return []
  return [...new Set(saved.filter((slug) => typeof slug === 'string' && findTool(slug)))].slice(0, limit)
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(storedTheme)
  const [favorites, setFavorites] = useState(() => storedTools('toolora-favorites'))
  const [recent, setRecent] = useState(() => storedTools('toolora-recent', 8))
  const [notice, setNotice] = useState('')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    writeStorage('toolora-theme', theme)
  }, [theme])
  useEffect(() => {
    const show = (event) => {
      setNotice(event.detail)
      window.setTimeout(() => setNotice(''), 3200)
    }
    window.addEventListener('toolora:notice', show)
    return () => window.removeEventListener('toolora:notice', show)
  }, [])
  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark'),
    favorites,
    toggleFavorite: (slug) => setFavorites((current) => {
      const next = current.includes(slug) ? current.filter((item) => item !== slug) : [slug, ...current]
      writeStorage('toolora-favorites', next)
      return next
    }),
    recent,
    addRecent: (slug) => setRecent((current) => {
      const next = [slug, ...current.filter((item) => item !== slug)].slice(0, 8)
      writeStorage('toolora-recent', next)
      return next
    }),
  }), [theme, favorites, recent])
  return <Context.Provider value={value}>{children}{notice && <div className="toast" role="status">{notice}</div>}</Context.Provider>
}

export const useApp = () => useContext(Context)
export const resolveTools = (slugs) => slugs.map(findTool).filter(Boolean)
