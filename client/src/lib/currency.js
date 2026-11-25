export async function convertCurrency(amountInput, from, to) {
  const amount = Number(amountInput)
  if (amountInput === '' || !Number.isFinite(amount) || amount < 0) throw new Error('Enter a valid non-negative amount.')
  if (from === to) return `Converted amount: ${amount.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${to}\nSame-currency conversion; no exchange rate needed.`
  const providerUrl = import.meta.env.VITE_CURRENCY_API_URL?.trim()
  if (!providerUrl) throw new Error('Live exchange rates are not configured. Add a trusted provider URL with VITE_CURRENCY_API_URL; no exchange rate is estimated or invented.')
  let url
  try {
    url = new URL(providerUrl)
    if (window.location.protocol === 'https:' && url.protocol !== 'https:') throw new Error('Use an HTTPS currency provider URL on a secure website.')
  } catch (error) {
    throw new Error(error.message || 'VITE_CURRENCY_API_URL must be a valid URL.')
  }
  url.searchParams.set('from', from)
  url.searchParams.set('to', to)
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`The exchange-rate provider returned HTTP ${response.status}.`)
    const body = await response.json()
    const rate = Number(body?.rates?.[to])
    if (!Number.isFinite(rate) || rate <= 0) throw new Error('The provider response did not contain a valid rate for the selected currency.')
    const converted = amount * rate
    if (!Number.isFinite(converted)) throw new Error('The converted amount is outside the supported range.')
    return `Converted amount: ${converted.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${to}\nRate: 1 ${from} = ${rate.toLocaleString('en-US', { maximumFractionDigits: 8 })} ${to}\nRate date: ${typeof body.date === 'string' ? body.date : 'not provided by provider'}`
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The exchange-rate request timed out. Try again later.')
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}
