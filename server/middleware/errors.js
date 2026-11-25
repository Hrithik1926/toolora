export function notFound(_request, response) {
  response.status(404).json({ error: 'Route not found.' })
}

export function errorHandler(error, _request, response, _next) {
  console.error('Request failed:', error.message)
  if (response.headersSent) return
  response.status(Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500)
    .json({ error: response.statusCode === 500 ? 'An unexpected server error occurred.' : error.message })
}
