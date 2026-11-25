import { ArrowUpRight, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/AppContext.jsx'

export default function ToolCard({ tool, compact = false }) {
  const { favorites, toggleFavorite } = useApp()
  const active = favorites.includes(tool.slug)
  return (
    <article className={`tool-card ${compact ? 'tool-card-compact' : ''}`}>
      <div className="tool-card-top">
        <span className="tool-category">{tool.category}</span>
        <button type="button" className={`favorite-button ${active ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(tool.slug)} aria-label={`${active ? 'Remove' : 'Add'} ${tool.name} ${active ? 'from' : 'to'} favorites`} aria-pressed={active}>
          <Star size={17} fill={active ? 'currentColor' : 'none'} />
        </button>
      </div>
      <Link className="tool-card-link" to={tool.path}>
        <h3>{tool.name}</h3>
        <p>{tool.description}</p>
        <span className="tool-open">Open tool <ArrowUpRight size={15} /></span>
      </Link>
    </article>
  )
}
