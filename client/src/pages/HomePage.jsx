import { ArrowRight, Check, Clock3, Heart, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import SearchBox from '../components/SearchBox.jsx'
import ToolCard from '../components/ToolCard.jsx'
import SEO from '../components/SEO.jsx'
import { categories, popularTools, tools } from '../data/tools.js'
import { resolveTools, useApp } from '../lib/AppContext.jsx'
import { useState } from 'react'

const benefits = [
  [Zap, 'Quick by design', 'Get useful answers without unnecessary steps or waiting.'],
  [Heart, 'Free to use', 'Every available calculator and productivity tool is ready to use.'],
  [ShieldCheck, 'Privacy-conscious', 'Calculations happen in your browser; we do not save your tool inputs.'],
  [Sparkles, 'Made for everyone', 'Clear labels and responsive layouts work across devices and experience levels.'],
]

function CategoryIcon({ category }) {
  const icons = { Calculators: '＋', Finance: '₹', Education: 'Aa', Health: '♡', 'Date & Time': '◷', Math: '÷', Converters: '↔', 'Text Tools': 'T', Productivity: '✦' }
  return <span className="category-icon" aria-hidden="true">{icons[category] || '•'}</span>
}

export default function HomePage() {
  const { recent } = useApp()
  const [category, setCategory] = useState('')
  const displayed = category ? tools.filter((tool) => tool.category === category) : tools
  const recentTools = resolveTools(recent)
  return (
    <>
      <SEO title="Free Online Tools & Calculators" description="Fast, free and easy-to-use online calculators, converters and productivity tools. Explore 50 practical tools for everyday questions." path="/" />
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> Useful tools. Clear answers.</span>
            <h1>Free Online Tools <span>&amp; Calculators</span></h1>
            <p>Fast, free and easy-to-use online calculators, converters and productivity tools.</p>
            <SearchBox />
            <div className="hero-proof"><span><Check size={15} /> No signup required</span><span><Check size={15} /> Works on any device</span></div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
            <div className="hero-float float-top"><span className="float-icon purple">%</span><span><strong>Percentage</strong><small>Simple, instant results</small></span></div>
            <div className="hero-float float-bottom"><span className="float-icon blue">∑</span><span><strong>Math made clear</strong><small>Practical tools for every day</small></span></div>
            <div className="hero-device"><span className="device-dot" /><span className="device-line short" /><span className="device-line" /><div className="device-result"><span>YOUR RESULT</span><strong>Simple &amp; clear</strong><span className="device-check"><Check size={17} /></span></div><div className="device-bars"><i /><i /><i /><i /><i /><i /></div></div>
          </div>
        </div>
      </section>

      <section className="section section-tight" id="popular">
        <div className="container">
          <div className="section-heading"><div><span className="eyebrow">A great place to start</span><h2>Popular tools</h2><p>Quick access to everyday favorites.</p></div><Link className="text-link" to="/#tools">Browse all tools <ArrowRight size={16} /></Link></div>
          <div className="tool-grid tool-grid-featured">{popularTools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}</div>
        </div>
      </section>

      <section className="section category-section" id="categories">
        <div className="container">
          <div className="section-heading"><div><span className="eyebrow">Find what you need</span><h2>Explore by category</h2><p>Organized around the tasks you want to get done.</p></div></div>
          <div className="category-grid">{categories.map((item) => <a className="category-card" href="#tools" key={item} onClick={() => setCategory(item)}><CategoryIcon category={item} /><span><strong>{item}</strong><small>{tools.filter((tool) => tool.category === item).length} tools</small></span><ArrowRight size={16} /></a>)}</div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="section-heading"><div><span className="eyebrow"><Clock3 size={14} /> Pick up where you left off</span><h2>Recently used</h2><p>Your recent tools are saved only in this browser.</p></div></div>
          {recentTools.length ? <div className="tool-grid">{recentTools.slice(0, 4).map((tool) => <ToolCard key={tool.slug} tool={tool} compact />)}</div> : <div className="empty-state"><Clock3 size={20} /><span>Tools you use will appear here for quick access.</span></div>}
        </div>
      </section>

      <section className="section all-tools-section" id="tools">
        <div className="container">
          <div className="section-heading tools-heading"><div><span className="eyebrow">The full collection</span><h2>{category || 'All tools'}</h2><p>Explore practical tools with clear inputs and straightforward results.</p></div>
            <label className="filter-select-label">Filter by category <select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          <div className="tool-grid">{displayed.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}</div>
          {displayed.length === 0 && <p className="empty-state">No tools found in that category.</p>}
        </div>
      </section>

      <section className="section why-section">
        <div className="container">
          <div className="section-heading centered"><div><span className="eyebrow">Designed around you</span><h2>Why Toolora?</h2><p>Tools should help you get to an answer, not get in the way.</p></div></div>
          <div className="benefit-grid">{benefits.map(([Icon, title, body]) => <article key={title} className="benefit-card"><span className="benefit-icon"><Icon size={21} /></span><h3>{title}</h3><p>{body}</p></article>)}</div>
        </div>
      </section>

      <section className="section faq-section">
        <div className="container faq-layout"><div><span className="eyebrow">Good to know</span><h2>Frequently asked questions</h2><p>Some quick answers about using Toolora.</p></div>
          <div className="faq-list">
            <details><summary>Are Toolora's tools free to use?</summary><p>Yes. The tools currently available on Toolora can be used without a subscription or account.</p></details>
            <details><summary>Do I need to create an account?</summary><p>No. You can use the tools directly. Favorites, theme choice and recent tools are stored locally in your browser.</p></details>
            <details><summary>Is my information saved?</summary><p>Calculator and text inputs are processed in your browser and are not sent to or stored by Toolora. Avoid entering sensitive information into any website.</p></details>
            <details><summary>Are financial and health results professional advice?</summary><p>No. Financial outputs are estimates based on the values you enter, and BMI is a general screening calculation. Consult an appropriately qualified professional for decisions.</p></details>
          </div>
        </div>
      </section>
      <section className="section seo-intro"><div className="container seo-copy"><h2>A practical toolkit for everyday questions</h2><p>Toolora brings together calculators, converters and focused productivity helpers in one straightforward place. Whether you are checking a percentage, estimating a monthly payment, comparing dates, converting units or polishing a piece of text, each tool is designed to make the task clear from the first input to the final result.</p><p>Choose a category or search by the task you have in mind. Each tool explains its inputs and, where useful, the formula behind its result. Calculations run in your browser, so no account is needed for everyday use. Results are intended as helpful estimates; for financial, medical or educational decisions, confirm the assumptions and rules that apply to your own situation.</p></div></section>
    </>
  )
}
