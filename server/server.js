import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import healthRoutes from './routes/health.js'
import { connectDatabase } from './config/database.js'
import { errorHandler, notFound } from './middleware/errors.js'

const envResult = dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env'), quiet: true })
if (envResult.error && envResult.error.code !== 'ENOENT') throw envResult.error
const app = express()
const port = Number(process.env.PORT || 5000)
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port.')

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()) : false,
  methods: ['GET', 'HEAD', 'OPTIONS'],
  optionsSuccessStatus: 204,
}))
app.use(express.json({ limit: '10kb', strict: true }))
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false }))
app.use('/api', healthRoutes)
app.use('/api', notFound)
app.use(errorHandler)

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await connectDatabase(process.env.MONGODB_URI)
    } catch (error) {
      console.error('MongoDB connection failed:', error.message)
      process.exitCode = 1
      return
    }
  }
  const server = app.listen(port, () => console.info(`Toolora API listening on port ${server.address().port}`))
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && process.env.NODE_ENV !== 'production') {
      console.warn(`Port ${port} is already in use. Selecting an available local port instead.`)
      const fallback = app.listen(0, () => {
        const availablePort = fallback.address().port
        console.info(`Toolora API listening on port ${availablePort}. Set VITE_API_URL=http://localhost:${availablePort} if the client needs the API.`)
      })
      fallback.on('error', (fallbackError) => {
        console.error('API server failed to start on an available port:', fallbackError.message)
        process.exitCode = 1
      })
      return
    }
    console.error('API server failed to start:', error.message)
    process.exitCode = 1
  })
}

start()
