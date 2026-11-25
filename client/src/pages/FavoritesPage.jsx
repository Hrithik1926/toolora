import { Link } from 'react-router-dom'
import { ArrowLeft, Heart } from 'lucide-react'
import SEO from '../components/SEO.jsx'
import ToolCard from '../components/ToolCard.jsx'
import { resolveTools, useApp } from '../lib/AppContext.jsx'

export default function FavoritesPage() {
  const { favorites } = useApp()
  const saved = resolveTools(favorites)
  return <>
    <SEO title="Your Favorite Tools" description="Find the Toolora calculators, converters and productivity tools you have saved in this browser." path="/favorites" />
    <section className="container page-section">
      <Link className="back-link" to="/"><ArrowLeft size={16} /> Back to all tools</Link>
      <span className="eyebrow"><Heart size={14} /> Saved in this browser</span><h1>Your favorite tools</h1><p className="page-lead">Keep the tools you use most close at hand. Favorites stay on this device and do not require an account.</p>
      {saved.length ? <div className="tool-grid">{saved.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}</div> : <div className="empty-state favorite-empty"><Heart size={24} /><h2>No favorites yet</h2><p>Save a tool with the star button and it will show up here.</p><Link className="button button-primary" to="/">Explore tools</Link></div>}
    </section>
  </>
}
