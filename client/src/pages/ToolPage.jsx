import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Check, Copy, Heart, Link2, RotateCcw, Share2, Star } from 'lucide-react'
import QRCode from 'qrcode'
import SEO from '../components/SEO.jsx'
import AdSlot from '../components/AdSlot.jsx'
import ToolCard from '../components/ToolCard.jsx'
import { findTool, tools } from '../data/tools.js'
import { calculate } from '../lib/calculations.js'
import { convertCurrency } from '../lib/currency.js'
import { useApp } from '../lib/AppContext.jsx'
import NotFoundPage from './NotFoundPage.jsx'

const relatedBySlug = {
  'emi-calculator': ['loan-calculator', 'sip-calculator', 'investment-calculator', 'salary-calculator', 'compound-interest-calculator'],
  'loan-calculator': ['emi-calculator', 'compound-interest-calculator', 'salary-calculator', 'investment-calculator'],
  'age-calculator': ['date-difference-calculator', 'days-between-dates-calculator', 'age-in-days-calculator'],
  'percentage-calculator': ['marks-percentage-calculator', 'discount-calculator', 'profit-loss-calculator', 'cgpa-to-percentage'],
  'gst-calculator': ['percentage-calculator', 'discount-calculator', 'profit-loss-calculator'],
  'bmi-calculator': ['age-calculator', 'percentage-calculator'],
  'sip-calculator': ['investment-calculator', 'fd-calculator', 'rd-calculator', 'compound-interest-calculator', 'salary-calculator'],
}
const exampleFor = (tool) => {
  const examples = {
    'percentage-calculator': 'If 25 items out of a group of 200 are selected, the calculator reports 12.5%.',
    'emi-calculator': 'A fixed-rate loan estimate combines your principal, monthly rate and number of installments to show the payment and overall cost.',
    'age-calculator': 'Enter a past date of birth to see completed calendar years, months and days as of today.',
    'bmi-calculator': 'For example, 70 kg at 175 cm gives a BMI of about 22.9. This is only a general screening measure.',
    'gst-calculator': 'Enter 1,000 and 18% in Add GST mode to see 180 tax and a 1,180 total.',
    'compound-interest-calculator': 'A deposit of 1,000 growing at 5% a year, compounded monthly for one year, is estimated at about 1,051.',
    'simple-interest-calculator': 'A principal of 1,000 at 5% simple annual interest for two years earns 100 interest.',
    'profit-loss-calculator': 'A cost of 80 and a selling price of 100 gives a profit of 20, or 25% of cost.',
    'discount-calculator': 'A 20% discount on a price of 500 saves 100, leaving a sale price of 400.',
    'marks-percentage-calculator': 'Scoring 42 out of 50 corresponds to 84%.',
    'cgpa-to-percentage': 'A CGPA of 8 on a 10-point scale converts to 80% using the direct scale method.',
    'fraction-calculator': 'One half plus one third simplifies to five sixths.',
    'scientific-calculator': 'Try sqrt(81) + 5 * 2. Trigonometric functions accept degrees.',
    'temperature-converter': '32 degrees Fahrenheit converts to 0 degrees Celsius.',
    'length-converter': 'One kilometer converts to 1,000 meters.',
    'sip-calculator': 'The projection applies a monthly rate to each regular contribution; it is an illustration, not a promise of return.',
    'currency-converter': 'Live rates are not fabricated. Configure a trusted provider URL before requesting a conversion.',
    'word-counter': 'Paste a draft to see its word count, character count, paragraphs and estimated reading time.',
    'password-generator': 'Choose character groups and a length; the browser cryptographic generator creates a fresh password on each run.',
    'qr-code-generator': 'Enter a link or short text to generate a QR image that can be downloaded from this page.',
  }
  return examples[tool.slug] || `${tool.name} applies the displayed method to your entries. Check the units and assumptions first, then compare the result with the context in which you plan to use it.`
}
const questionFor = (tool) => [
  { q: `What does the ${tool.name} do?`, a: tool.description },
  { q: `How is the ${tool.name} result calculated?`, a: `The tool uses ${tool.formula.toLowerCase()}. Confirm that its assumptions match your use case.` },
  { q: `Are my inputs stored when I use this tool?`, a: 'No. Tool inputs are processed in your browser and are not saved to a Toolora account or sent to our servers.' },
]

function initialValues(tool) {
  return Object.fromEntries(tool.fields.map((field) => [field.name, field.defaultValue ?? (field.type === 'select' ? field.options[0][0] : field.type === 'checkbox' ? false : '')]))
}

function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text)
  const input = document.createElement('textarea')
  input.value = text
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.append(input)
  input.select()
  const success = document.execCommand('copy')
  input.remove()
  return success ? Promise.resolve() : Promise.reject(new Error('Copy is not supported by this browser.'))
}

export default function ToolPage() {
  const { slug } = useParams()
  const tool = findTool(slug)
  const { addRecent, favorites, toggleFavorite } = useApp()
  const [values, setValues] = useState(() => tool ? initialValues(tool) : {})
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [qrData, setQrData] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (tool) addRecent(tool.slug)
    setValues(tool ? initialValues(tool) : {})
    setResult('')
    setError('')
    setQrData('')
  }, [slug])

  const related = useMemo(() => {
    if (!tool) return []
    const explicit = (relatedBySlug[tool.slug] || []).map(findTool).filter(Boolean)
    const sameCategory = tools.filter((item) => item.category === tool.category && item.slug !== tool.slug)
    return [...new Map([...explicit, ...sameCategory].map((item) => [item.slug, item])).values()].slice(0, 4)
  }, [tool])
  if (!tool) return <NotFoundPage />

  const faqs = questionFor(tool)
  const canonical = `${window.location.origin}${tool.path}`
  const schema = [
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: tool.name, applicationCategory: tool.category, operatingSystem: 'Any', description: tool.description, url: canonical, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: window.location.origin }, { '@type': 'ListItem', position: 2, name: tool.category, item: `${window.location.origin}/#categories` }, { '@type': 'ListItem', position: 3, name: tool.name, item: canonical }] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ]

  const update = (name, value) => setValues((current) => ({ ...current, [name]: value }))
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setResult('')
    setQrData('')
    setBusy(true)
    try {
      if (tool.slug === 'qr-code-generator') {
        const data = values.text?.trim()
        if (!data) throw new Error('Enter text or a URL to create a QR code.')
        if (data.length > 2000) throw new Error('Keep the QR content below 2,000 characters for reliable scanning.')
        const image = await QRCode.toDataURL(data, { width: 320, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#172033', light: '#ffffff' } })
        setQrData(image)
        setResult('Your QR code is ready. Download the image or scan it with a camera.')
      } else if (tool.slug === 'currency-converter') setResult(await convertCurrency(values.amount, values.fromUnit, values.toUnit))
      else setResult(calculate(tool.slug, values))
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Unable to calculate. Check your entries and try again.')
    } finally { setBusy(false) }
  }
  const reset = () => { setValues(initialValues(tool)); setResult(''); setError(''); setQrData('') }
  const copyResult = async () => {
    try {
      await copyText(result.replace(/^Result: /, ''))
      window.dispatchEvent(new CustomEvent('toolora:notice', { detail: 'Result copied to clipboard.' }))
    } catch (issue) {
      window.dispatchEvent(new CustomEvent('toolora:notice', { detail: issue.message || 'Could not copy the result.' }))
    }
  }
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: tool.name, text: tool.description, url: window.location.href })
      else { await copyText(window.location.href); window.dispatchEvent(new CustomEvent('toolora:notice', { detail: 'Tool link copied to clipboard.' })) }
    } catch (issue) {
      if (issue.name !== 'AbortError') window.dispatchEvent(new CustomEvent('toolora:notice', { detail: issue.message || 'Could not share this page.' }))
    }
  }
  const output = result.replace(/^Result: /, '')
  return (
    <>
      <SEO title={tool.name} description={`${tool.description} Use Toolora's free ${tool.name.toLowerCase()} with clear inputs, helpful guidance and instant results.`} path={tool.path} schema={schema} />
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><a href="/#categories">{tool.category}</a><span>/</span><span aria-current="page">{tool.name}</span></nav>
      </div>
      <section className="container tool-page">
        <div className="tool-intro"><div><span className="eyebrow">{tool.category}</span><h1>{tool.name}</h1><p>{tool.description}</p></div><button type="button" className={`button button-secondary favorite-action ${favorites.includes(tool.slug) ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(tool.slug)} aria-pressed={favorites.includes(tool.slug)}><Heart size={17} fill={favorites.includes(tool.slug) ? 'currentColor' : 'none'} />{favorites.includes(tool.slug) ? 'Saved' : 'Save tool'}</button></div>
        <AdSlot />
        <div className="tool-layout">
          <section className="calculator-panel" aria-label={`${tool.name} form`}>
            <div className="panel-heading"><div><span className="panel-step">YOUR INPUTS</span><h2>Enter your details</h2></div><span className="live-badge"><i /> Free tool</span></div>
            <form onSubmit={submit} noValidate>
              <div className="form-grid">
                {tool.fields.map((field) => <div className={`form-field ${field.type === 'textarea' ? 'form-field-full' : ''}`} key={field.name}>
                  <label htmlFor={`field-${field.name}`}>{field.label}</label>
                  {field.type === 'select' ? <select id={`field-${field.name}`} value={values[field.name]} onChange={(event) => update(field.name, event.target.value)}>{field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                    : field.type === 'textarea' ? <textarea id={`field-${field.name}`} value={values[field.name]} onChange={(event) => update(field.name, event.target.value)} rows={field.rows || 5} placeholder={field.placeholder || 'Type or paste your text here...'} />
                      : field.type === 'checkbox' ? <label className="checkbox-row" htmlFor={`field-${field.name}`}><input id={`field-${field.name}`} type="checkbox" checked={Boolean(values[field.name])} onChange={(event) => update(field.name, event.target.checked)} />{field.label}</label>
                        : <input id={`field-${field.name}`} type={field.type} value={values[field.name]} onChange={(event) => update(field.name, event.target.value)} min={field.min} max={field.max} step={field.step || 'any'} placeholder={field.placeholder || (field.type === 'number' ? 'Enter a value' : '')} />}
                </div>)}
              </div>
              {tool.slug === 'currency-converter' && <p className="field-note">Live exchange rates need a trusted provider configured with <code>VITE_CURRENCY_API_URL</code>. No rates are fabricated.</p>}
              {tool.slug === 'bmi-calculator' && <p className="field-note">BMI is a general screening calculation, not a diagnosis. Individual health varies.</p>}
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="form-actions"><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Working…' : tool.slug === 'qr-code-generator' ? 'Create QR code' : tool.slug === 'password-generator' ? 'Generate password' : 'Calculate'} <ArrowRight size={17} /></button><button className="button button-quiet" type="button" onClick={reset}><RotateCcw size={16} /> Reset</button></div>
            </form>
            {result && <section className="result-panel" aria-live="polite" aria-label="Tool result"><div className="result-heading"><span className="result-check"><Check size={18} /></span><div><small>YOUR RESULT</small><h2>{tool.slug === 'qr-code-generator' ? 'QR code ready' : 'Calculated result'}</h2></div></div><pre className="result-value">{output}</pre>{qrData && <div className="qr-result"><img src={qrData} alt="Generated QR code" /><a className="button button-secondary" href={qrData} download="toolora-qr-code.png">Download QR image</a></div>}<button type="button" className="button button-secondary copy-button" onClick={copyResult}><Copy size={15} /> Copy result</button></section>}
          </section>
          <aside className="tool-aside"><div className="aside-card"><span className="aside-icon"><Link2 size={18} /></span><h2>About this tool</h2><p>{tool.description}</p><p>Use the inputs above to get an immediate result. Your entries stay in this browser and are not stored by Toolora.</p><button type="button" className="text-link" onClick={share}>Share this tool <Share2 size={15} /></button></div><div className="aside-card aside-highlight"><Star size={18} /><h3>Keep it handy</h3><p>Save this tool to your favorites for easier access next time.</p><button type="button" className="text-link" onClick={() => toggleFavorite(tool.slug)}>{favorites.includes(tool.slug) ? 'Remove from favorites' : 'Add to favorites'} <Heart size={15} /></button></div></aside>
        </div>
        <AdSlot label="Advertisement" />
        <div className="tool-content-grid">
          <article className="content-section"><span className="eyebrow">The method</span><h2>Formula</h2><p>{tool.formula}</p><p>{tool.name} applies this method to the values you enter. Unit conventions and rounding can affect how a result should be interpreted, so review the explanation before using it.</p></article>
          <article className="content-section"><span className="eyebrow">A quick walkthrough</span><h2>How to use the {tool.name.toLowerCase()}</h2><ol>{tool.fields.map((field) => <li key={field.name}>Enter {field.label.toLowerCase()}{field.type === 'select' ? ' and choose the matching option' : ''}.</li>)}<li>Select <strong>{tool.slug === 'password-generator' ? 'Generate password' : tool.slug === 'qr-code-generator' ? 'Create QR code' : 'Calculate'}</strong> to view your result.</li><li>Check the result and adjust your entries if needed.</li></ol></article>
          <article className="content-section"><span className="eyebrow">Worked example</span><h2>Example</h2><p>{exampleFor(tool)}</p></article>
          <article className="content-section"><span className="eyebrow">Use with care</span><h2>Things to keep in mind</h2><p>Check that each input is in the unit and format requested. Results are rounded for readability. This tool offers general information only and should not replace professional, institutional or product-specific guidance where that matters.</p></article>
        </div>
        <section className="content-section tool-faq"><span className="eyebrow">Helpful answers</span><h2>Frequently asked questions</h2><div className="faq-list">{faqs.map(({ q, a }) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
        {related.length > 0 && <section className="related-section"><div className="section-heading"><div><span className="eyebrow">Keep exploring</span><h2>Related tools</h2></div><Link className="text-link" to="/#tools">All tools <ArrowRight size={15} /></Link></div><div className="tool-grid">{related.map((item) => <ToolCard key={item.slug} tool={item} compact />)}</div></section>}
      </section>
    </>
  )
}
