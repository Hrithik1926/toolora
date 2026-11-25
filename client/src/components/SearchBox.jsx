import { useMemo, useState } from 'react'
import { ArrowUpRight, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { tools } from '../data/tools.js'

export default function SearchBox({ compact = false, onPick }) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return []
    return tools.map((tool) => ({
      tool,
      score: tool.name.toLowerCase().includes(term) ? 0 : tool.keywords.includes(term) ? 1 : tool.keywords.split(/\s+/).some((word) => word.startsWith(term)) ? 2 : 3,
    })).filter((result) => result.score < 3).sort((a, b) => a.score - b.score || a.tool.name.localeCompare(b.tool.name)).slice(0, 8).map(({ tool }) => tool)
  }, [query])
  return (
    <div className={`search-wrap ${compact ? 'search-compact' : ''}`}>
      <label className="sr-only" htmlFor={compact ? 'site-search-small' : 'site-search'}>Search all tools</label>
      <div className="search-input">
        <Search size={19} aria-hidden="true" />
        <input id={compact ? 'site-search-small' : 'site-search'} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search calculators, converters and more..." autoComplete="off" />
        {query && <button type="button" className="icon-button" aria-label="Clear search" onClick={() => setQuery('')}><X size={17} /></button>}
      </div>
      {query && <div className="search-results" role="listbox" aria-label="Search results">
        {results.length ? results.map((tool) => <Link key={tool.slug} to={tool.path} role="option" onClick={() => { setQuery(''); onPick?.() }}>
          <span><strong>{tool.name}</strong><small>{tool.category} · {tool.description}</small></span><ArrowUpRight size={16} />
        </Link>) : <p className="empty-search">No matching tools. Try a shorter search.</p>}
      </div>}
    </div>
  )
}
