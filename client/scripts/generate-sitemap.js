import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import dotenv from 'dotenv'
import { tools } from '../src/data/tools.js'

const envResult = dotenv.config({ path: resolve('..', '.env'), quiet: true })
if (envResult.error && envResult.error.code !== 'ENOENT') throw envResult.error
const siteUrl = process.env.VITE_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://toolora.example')
const base = siteUrl.replace(/\/+$/, '')
let origin
try {
  origin = new URL(base)
  if (!['http:', 'https:'].includes(origin.protocol)) throw new Error()
} catch {
  throw new Error('VITE_SITE_URL must be an absolute HTTP or HTTPS origin.')
}
const routes = ['/', '/about', '/contact', '/privacy-policy', '/terms', '/disclaimer', ...tools.map((tool) => tool.path)]
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${origin.origin}${route}</loc></url>`).join('\n')}\n</urlset>\n`
const publicDirectory = resolve('public')
await Promise.all([
  writeFile(resolve(publicDirectory, 'sitemap.xml'), xml),
  writeFile(resolve(publicDirectory, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin.origin}/sitemap.xml\n`),
])
