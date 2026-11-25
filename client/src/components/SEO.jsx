import { useEffect } from 'react'

export default function SEO({ title, description, path = '', schema }) {
  useEffect(() => {
    const fullTitle = `${title} | Toolora`
    document.title = fullTitle
    const setMeta = (selector, attribute, value) => {
      let element = document.head.querySelector(selector)
      if (!element) {
        element = document.createElement('meta')
        if (selector.includes('property=')) element.setAttribute('property', selector.match(/property="([^"]+)"/)[1])
        else element.setAttribute('name', selector.match(/name="([^"]+)"/)[1])
        document.head.append(element)
      }
      element.setAttribute(attribute, value)
    }
    const url = `${window.location.origin}${path || window.location.pathname}`
    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = url
    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[property="og:type"]', 'content', 'website')
    setMeta('meta[property="og:url"]', 'content', url)
    setMeta('meta[name="twitter:card"]', 'content', 'summary')
    setMeta('meta[name="twitter:title"]', 'content', fullTitle)
    setMeta('meta[name="twitter:description"]', 'content', description)
    let structured = document.getElementById('page-structured-data')
    if (schema) {
      if (!structured) {
        structured = document.createElement('script')
        structured.id = 'page-structured-data'
        structured.type = 'application/ld+json'
        document.head.append(structured)
      }
      structured.textContent = JSON.stringify(schema)
    } else structured?.remove()
  }, [title, description, path, schema])
  return null
}
