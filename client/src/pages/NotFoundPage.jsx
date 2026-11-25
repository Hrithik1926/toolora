import { Link } from 'react-router-dom'
import SEO from '../components/SEO.jsx'
import SearchBox from '../components/SearchBox.jsx'
import ToolCard from '../components/ToolCard.jsx'
import { popularTools } from '../data/tools.js'

export default function NotFoundPage() {
  return <>
    <SEO title="Page not found" description="We could not find that Toolora page. Search our tools or return to the homepage." />
    <section className="container not-found">
      <span className="not-found-code">404</span><h1>This page took a wrong turn.</h1><p>The page may have moved, or the address may not be right. Search for a tool or head back to the homepage.</p>
      <SearchBox /><Link to="/" className="button button-primary">Go to homepage</Link>
      <h2>Popular tools</h2><div className="tool-grid">{popularTools.slice(0, 3).map((tool) => <ToolCard key={tool.slug} tool={tool} compact />)}</div>
    </section>
  </>
}
