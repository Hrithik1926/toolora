import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import { AppProvider } from './lib/AppContext.jsx'

const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const ToolPage = lazy(() => import('./pages/ToolPage.jsx'))
const InfoPage = lazy(() => import('./pages/InfoPage.jsx'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

function Analytics() {
  useEffect(() => {
    const id = import.meta.env.VITE_GA_ID
    if (!id) return
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
    document.head.append(script)
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', id, { anonymize_ip: true })
    return () => script.remove()
  }, [])
  return null
}

export default function App() {
  return <AppProvider><Analytics /><Layout><Suspense fallback={<div className="container loading-state" role="status">Loading Toolora…</div>}>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tools/:slug" element={<ToolPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/about" element={<InfoPage />} />
      <Route path="/contact" element={<InfoPage />} />
      <Route path="/privacy-policy" element={<InfoPage />} />
      <Route path="/terms" element={<InfoPage />} />
      <Route path="/disclaimer" element={<InfoPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense></Layout></AppProvider>
}
