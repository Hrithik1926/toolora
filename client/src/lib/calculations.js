const MAX = 1e15
const number = (v, label, { min = -MAX, max = MAX, integer = false } = {}) => {
  if (v === '' || v === null || v === undefined) throw new Error(`Enter ${label.toLowerCase()}.`)
  const n = Number(v)
  if (!Number.isFinite(n) || Math.abs(n) > MAX) throw new Error(`Enter a valid ${label.toLowerCase()} within the supported range.`)
  if (integer && !Number.isInteger(n)) throw new Error(`${label} must be a whole number.`)
  if (n < min && min === Number.MIN_VALUE) throw new Error(`${label} must be greater than 0.`)
  if (n < min || n > max) throw new Error(`${label} must be between ${min} and ${max}.`)
  return n
}
const list = (value, label, { integers = false, minItems = 1 } = {}) => {
  if (String(value ?? '').length > 4000) throw new Error(`Enter no more than 100 ${label.toLowerCase()}.`)
  const values = String(value ?? '').split(',').map((item) => item.trim())
  if (values.length > 100) throw new Error(`Enter no more than 100 ${label.toLowerCase()}.`)
  if (values.length < minItems || values.some((item) => !item)) throw new Error(`Enter ${label.toLowerCase()} separated by commas.`)
  return values.map((item) => number(item, label, { integer: integers }))
}
const checkResult = (n) => {
  if (!Number.isFinite(n) || Math.abs(n) > MAX) throw new Error('That result is outside the supported range. Try smaller values.')
  return n
}
const money = (n) => checkResult(n).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
const fixed = (n, digits = 4) => Number(checkResult(n).toPrecision(12)).toLocaleString('en-US', { maximumFractionDigits: digits })
const dateValue = (input, label) => {
  if (!input) throw new Error(`Choose ${label.toLowerCase()}.`)
  const date = new Date(`${input}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== input) throw new Error(`Enter a valid ${label.toLowerCase()}.`)
  return date
}
const days = (a, b) => Math.round((b - a) / 86400000)
const gcd = (x, y) => {
  let a = Math.abs(x), b = Math.abs(y)
  while (b) [a, b] = [b, a % b]
  return a
}
const bigintGcd = (x, y) => {
  let a = x < 0n ? -x : x, b = y < 0n ? -y : y
  while (b) [a, b] = [b, a % b]
  return a
}
const safePower = (base, exponent) => {
  const result = base ** exponent
  if (!Number.isFinite(result) || Math.abs(result) > MAX) throw new Error('That result is outside the supported range. Try smaller values.')
  return result
}
const formatDate = (date) => {
  const year = date.getUTCFullYear()
  if (year < 0 || year > 9999) throw new Error('The result date must be between 0000-01-01 and 9999-12-31.')
  return `${String(year).padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}
const countText = (text) => ({
  words: (text.trim().match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || []).length,
  characters: Array.from(text).length,
  noSpaces: Array.from(text.replace(/\s/gu, '')).length,
  lines: text.length ? text.split(/\r\n|\r|\n/).length : 0,
  paragraphs: text.trim() ? text.trim().split(/\n\s*\n/u).length : 0,
})

const unitFactors = {
  length: { mm: .001, cm: .01, m: 1, km: 1000, in: .0254, ft: .3048, yd: .9144, mi: 1609.344 },
  weight: { mg: .000001, g: .001, kg: 1, oz: .028349523125, lb: .45359237, st: 6.35029318 },
  area: { mm2: 1e-6, cm2: 1e-4, m2: 1, km2: 1e6, ha: 10000, acre: 4046.8564224, ft2: .09290304 },
  volume: { ml: .001, l: 1, m3: 1000, tsp: .00492892159375, tbsp: .01478676478125, cup: .2365882365, gal: 3.785411784 },
  speed: { mps: 1, kph: 1 / 3.6, mph: .44704, knot: .5144444444 },
  time: { ms: .001, s: 1, min: 60, h: 3600, day: 86400, week: 604800 },
  data: { B: 1, KB: 1000, MB: 1e6, GB: 1e9, KiB: 1024, MiB: 1024 ** 2, GiB: 1024 ** 3 },
}

const evaluateExpression = (source) => {
  const input = source.replace(/\s+/g, '').toLowerCase()
  if (!input || input.length > 200 || /[^0-9.+\-*/^()%a-z]/.test(input)) throw new Error('Enter a valid expression using numbers and supported operators.')
  const tokens = input.match(/(?:\d*\.?\d+(?:e[+-]?\d+)?|[a-z]+|[()+\-*/^%])/g) || []
  if (tokens.join('') !== input) throw new Error('The expression contains an unsupported character.')
  let index = 0
  const peek = () => tokens[index]
  const take = () => tokens[index++]
  const primary = () => {
    const token = take()
    if (token === '(') {
      const value = expression(0)
      if (take() !== ')') throw new Error('Check that every opening parenthesis has a closing one.')
      return value
    }
    if (token === '+' || token === '-') return (token === '-' ? -1 : 1) * expression(3)
    if (token === 'pi') return Math.PI
    if (token === 'e') return Math.E
    if (['sqrt', 'sin', 'cos', 'tan', 'log', 'ln', 'abs'].includes(token)) {
      if (take() !== '(') throw new Error(`Use ${token}(value) for this function.`)
      const v = expression(0)
      if (take() !== ')') throw new Error('Check that every function has a closing parenthesis.')
      const result = ({ sqrt: Math.sqrt, sin: (x) => Math.sin(x * Math.PI / 180), cos: (x) => Math.cos(x * Math.PI / 180), tan: (x) => Math.tan(x * Math.PI / 180), log: Math.log10, ln: Math.log, abs: Math.abs })[token](v)
      if (!Number.isFinite(result)) throw new Error(`${token} is not defined for that value.`)
      return result
    }
    const value = Number(token)
    if (!Number.isFinite(value)) throw new Error('Check the expression syntax.')
    return value
  }
  const binding = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, '^': 3 }
  const expression = (minimum) => {
    let left = primary()
    while (binding[peek()] >= minimum) {
      const operator = take()
      const precedence = binding[operator]
      const right = expression(precedence + (operator === '^' ? 0 : 1))
      if ((operator === '/' || operator === '%') && right === 0) throw new Error('Division by zero is not allowed.')
      left = operator === '+' ? left + right : operator === '-' ? left - right : operator === '*' ? left * right : operator === '/' ? left / right : operator === '%' ? left % right : safePower(left, right)
    }
    return left
  }
  const result = expression(0)
  if (index !== tokens.length) throw new Error('Check the expression syntax near the end.')
  if (!Number.isFinite(result) || Math.abs(result) > MAX) throw new Error('That result is outside the supported range.')
  return result
}

export function createPassword(length, groups) {
  const sets = [
    groups.uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
    groups.lowercase ? 'abcdefghijklmnopqrstuvwxyz' : '',
    groups.numbers ? '0123456789' : '',
    groups.symbols ? '!@#$%^&*()-_=+[]{}:,.?' : '',
  ].filter(Boolean)
  if (!sets.length) throw new Error('Select at least one character type.')
  if (length < sets.length) throw new Error(`Choose a length of at least ${sets.length} to include every selected character type.`)
  const chars = sets.join('')
  const randomIndex = (limit) => {
    const ceiling = Math.floor(256 / limit) * limit
    const byte = new Uint8Array(1)
    do { crypto.getRandomValues(byte) } while (byte[0] >= ceiling)
    return byte[0] % limit
  }
  const output = sets.map((set) => set[randomIndex(set.length)])
  while (output.length < length) output.push(chars[randomIndex(chars.length)])
  for (let i = output.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1)
    ;[output[i], output[j]] = [output[j], output[i]]
  }
  return output.join('')
}

export function calculate(slug, v) {
  const n = (key, label, options) => number(v[key], label || key, options)
  const p = (key, label) => n(key, label, { min: 0 })
  const positive = (key, label) => n(key, label, { min: Number.MIN_VALUE })
  switch (slug) {
    case 'percentage-calculator': {
      const part = n('part', 'Part'), whole = positive('whole', 'Whole')
      return `Result: ${fixed(part / whole * 100, 2)}%`
    }
    case 'age-calculator':
    case 'age-in-days-calculator': {
      const birth = dateValue(v.birthDate, 'date of birth')
      const today = new Date(); today.setUTCHours(0, 0, 0, 0)
      if (birth > today) throw new Error('Date of birth cannot be in the future.')
      if (slug === 'age-in-days-calculator') return `Age: ${days(birth, today).toLocaleString()} days`
      let years = today.getUTCFullYear() - birth.getUTCFullYear()
      let months = today.getUTCMonth() - birth.getUTCMonth()
      let dateDays = today.getUTCDate() - birth.getUTCDate()
      if (dateDays < 0) {
        months--
        dateDays += new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0)).getUTCDate()
      }
      if (months < 0) { years--; months += 12 }
      return `Age: ${years} years, ${months} months and ${dateDays} days`
    }
    case 'emi-calculator':
    case 'loan-calculator': {
      const principal = positive('principal', 'Loan amount'), annual = p('annualRate', 'Annual interest rate'), years = positive('tenureYears', 'Loan term')
      const count = Math.round(years * 12)
      if (count < 1) throw new Error('Loan term must be at least one month.')
      if (count > 1200) throw new Error('Loan term must not exceed 100 years.')
      const rate = annual / 1200
      const emi = rate === 0 ? principal / count : principal * rate * (1 + rate) ** count / ((1 + rate) ** count - 1)
      const total = emi * count
      return `Monthly EMI: ₹${money(emi)}\nPrincipal: ₹${money(principal)}\nTotal interest: ₹${money(total - principal)}\nTotal payment: ₹${money(total)}`
    }
    case 'discount-calculator': {
      const price = p('originalPrice', 'Original price'), discount = n('discountPercent', 'Discount', { min: 0, max: 100 })
      return `You save: ${money(price * discount / 100)}\nSale price: ${money(price * (1 - discount / 100))}`
    }
    case 'gst-calculator': {
      const amount = p('amount', 'Amount'), rate = p('gstRate', 'GST rate'), factor = rate / 100
      if (v.mode === 'remove') return `Original amount: ${money(amount / (1 + factor))}\nGST included: ${money(amount - amount / (1 + factor))}\nAmount before tax: ${money(amount / (1 + factor))}`
      return `GST amount: ${money(amount * factor)}\nTotal including GST: ${money(amount * (1 + factor))}`
    }
    case 'tip-calculator': {
      const bill = p('billAmount', 'Bill amount'), rate = p('tipPercent', 'Tip percentage'), people = n('people', 'People sharing', { min: 1, max: 10000, integer: true })
      return `Tip: ${money(bill * rate / 100)}\nTotal bill: ${money(bill * (1 + rate / 100))}\nPer person: ${money(bill * (1 + rate / 100) / people)}`
    }
    case 'bmi-calculator': {
      const weight = positive('weightKg', 'Weight'), height = positive('heightCm', 'Height') / 100
      const bmi = weight / height ** 2
      const category = bmi < 18.5 ? 'below the standard adult range' : bmi < 25 ? 'within the standard adult range' : bmi < 30 ? 'above the standard adult range' : 'in the higher adult range'
      return `BMI: ${fixed(bmi, 1)}\nCategory: ${category}\nThis general screening result is not a medical diagnosis.`
    }
    case 'simple-interest-calculator': {
      const principal = p('principal', 'Principal'), rate = p('rate', 'Annual interest rate'), time = p('timeYears', 'Time')
      const interest = principal * rate * time / 100
      return `Simple interest: ${money(interest)}\nTotal amount: ${money(principal + interest)}`
    }
    case 'compound-interest-calculator':
    case 'fd-calculator': {
      const principal = positive('principal', 'Principal'), rate = p(slug === 'fd-calculator' ? 'annualRate' : 'rate', 'Annual interest rate')
      const years = positive(slug === 'fd-calculator' ? 'tenureYears' : 'timeYears', 'Time')
      const freq = n('compoundsPerYear', 'Compounds per year', { min: 1, max: 365, integer: true })
      const total = principal * (1 + rate / 100 / freq) ** (freq * years)
      return `Maturity value: ${money(total)}\nInterest earned: ${money(total - principal)}\nInitial amount: ${money(principal)}`
    }
    case 'average-calculator': {
      const values = list(v.numbers, 'numbers')
      return `Average: ${fixed(values.reduce((a, b) => a + b, 0) / values.length)}\nCount: ${values.length}\nSum: ${fixed(values.reduce((a, b) => a + b, 0))}`
    }
    case 'ratio-calculator': {
      const a = n('a', 'First value', { integer: true }), b = n('b', 'Second value', { integer: true })
      if (a === 0 && b === 0) throw new Error('At least one ratio value must be non-zero.')
      const divisor = gcd(a, b)
      return `Simplified ratio: ${a / divisor}:${b / divisor}`
    }
    case 'profit-loss-calculator': {
      const cost = positive('costPrice', 'Cost price'), sale = p('sellingPrice', 'Selling price')
      const difference = sale - cost
      return difference > 0 ? `Profit: ${money(difference)}\nProfit percentage: ${fixed(difference / cost * 100, 2)}%`
        : difference < 0 ? `Loss: ${money(-difference)}\nLoss percentage: ${fixed(-difference / cost * 100, 2)}%`
          : 'No profit or loss: the selling price equals the cost price.'
    }
    case 'date-difference-calculator':
    case 'days-between-dates-calculator': {
      const start = dateValue(v.startDate, 'start date'), end = dateValue(v.endDate, 'end date')
      if (end < start) throw new Error('End date must be the same as or later than the start date.')
      const elapsed = days(start, end)
      if (slug === 'days-between-dates-calculator') return `Elapsed time: ${elapsed.toLocaleString()} days`
      let years = end.getUTCFullYear() - start.getUTCFullYear()
      let months = end.getUTCMonth() - start.getUTCMonth()
      let dateDays = end.getUTCDate() - start.getUTCDate()
      if (dateDays < 0) { months--; dateDays += new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 0)).getUTCDate() }
      if (months < 0) { years--; months += 12 }
      return `Difference: ${years} years, ${months} months and ${dateDays} days\nElapsed total: ${elapsed.toLocaleString()} days`
    }
    case 'add-subtract-days': {
      const start = dateValue(v.startDate, 'start date'), delta = n('numberOfDays', 'Number of days', { min: 0, max: 3650000, integer: true })
      const result = new Date(start)
      result.setUTCDate(result.getUTCDate() + (v.operation === 'subtract' ? -delta : delta))
      return `Result date: ${formatDate(result)}`
    }
    case 'time-duration-calculator': {
      if (!v.startTime || !v.endTime) throw new Error('Enter both a start time and an end time.')
      const asMinutes = (time) => { const [h, m] = time.split(':').map(Number); return h * 60 + m }
      let duration = asMinutes(v.endTime) - asMinutes(v.startTime)
      if (![v.startTime, v.endTime].every((time) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time))) throw new Error('Enter valid clock times.')
      if (duration < 0) duration += 1440
      return `Duration: ${Math.floor(duration / 60)} hours ${duration % 60} minutes\nTotal: ${duration} minutes`
    }
    case 'cgpa-to-percentage':
    case 'percentage-to-cgpa': {
      const scale = positive('scale', 'Maximum CGPA scale')
      if (slug === 'cgpa-to-percentage') {
        const cgpa = n('cgpa', 'CGPA', { min: 0, max: scale })
        return `Estimated percentage: ${fixed(cgpa / scale * 100, 2)}%\nUses a direct scale conversion; follow your institution's official formula if different.`
      }
      const percent = n('percentage', 'Percentage', { min: 0, max: 100 })
      return `Estimated CGPA: ${fixed(percent / 100 * scale, 2)} / ${fixed(scale, 2)}\nUses a direct scale conversion; follow your institution's official formula if different.`
    }
    case 'marks-percentage-calculator':
    case 'grade-calculator': {
      const marks = p('marks', 'Marks obtained'), total = positive('total', 'Total marks')
      if (marks > total) throw new Error('Marks obtained cannot exceed the total marks.')
      const percent = marks / total * 100
      if (slug === 'marks-percentage-calculator') return `Percentage: ${fixed(percent, 2)}%`
      const grade = percent >= 90 ? 'A' : percent >= 80 ? 'B' : percent >= 70 ? 'C' : percent >= 60 ? 'D' : 'F'
      return `Score: ${fixed(percent, 2)}%\nEstimated letter grade: ${grade}\nGrade boundaries vary by school.`
    }
    case 'gpa-calculator': {
      const grades = list(v.grades, 'grade points')
      if (grades.some((grade) => grade < 0 || grade > 5)) throw new Error('Grade points must be between 0 and 5.')
      return `Unweighted GPA: ${fixed(grades.reduce((a, b) => a + b, 0) / grades.length, 2)}\nCourses: ${grades.length}`
    }
    case 'scientific-calculator': return `Result: ${fixed(evaluateExpression(v.expression))}`
    case 'fraction-calculator': {
      const a = n('numerator1', 'First numerator', { integer: true }), b = n('denominator1', 'First denominator', { integer: true })
      const c = n('numerator2', 'Second numerator', { integer: true }), d = n('denominator2', 'Second denominator', { integer: true })
      if (!b || !d) throw new Error('Fraction denominators cannot be zero.')
      const numerator1 = BigInt(a), denominator1 = BigInt(b)
      const numerator2 = BigInt(c), denominator2 = BigInt(d)
      let top, bottom
      if (v.operation === '+') { top = numerator1 * denominator2 + numerator2 * denominator1; bottom = denominator1 * denominator2 }
      else if (v.operation === '-') { top = numerator1 * denominator2 - numerator2 * denominator1; bottom = denominator1 * denominator2 }
      else if (v.operation === '*') { top = numerator1 * numerator2; bottom = denominator1 * denominator2 }
      else if (v.operation === '/') {
        if (!numerator2) throw new Error('Cannot divide by a fraction with a zero numerator.')
        top = numerator1 * denominator2
        bottom = denominator1 * numerator2
      } else throw new Error('Choose a valid fraction operation.')
      if (bottom < 0n) { top *= -1n; bottom *= -1n }
      const divisor = bigintGcd(top, bottom)
      top /= divisor
      bottom /= divisor
      return `Simplified fraction: ${top}/${bottom}\nDecimal: ${fixed(Number(top) / Number(bottom))}`
    }
    case 'lcm-calculator':
    case 'hcf-gcd-calculator': {
      const values = list(v.numbers, 'whole numbers', { integers: true }).map(Math.abs)
      const common = values.reduce((a, b) => gcd(a, b))
      if (slug === 'hcf-gcd-calculator') return `HCF / GCD: ${common}`
      if (values.some((value) => value === 0)) return 'LCM: 0'
      const result = values.reduce((a, b) => {
        const next = Math.abs(a / gcd(a, b) * b)
        if (!Number.isSafeInteger(next)) throw new Error('The LCM is too large to represent accurately.')
        return next
      })
      return `LCM: ${result}`
    }
    case 'square-root-calculator': {
      const value = n('number', 'Number', { min: 0 })
      return `Square root: ${fixed(Math.sqrt(value))}`
    }
    case 'power-calculator': return `Result: ${fixed(safePower(n('base', 'Base'), n('exponent', 'Exponent')))}`
    case 'random-number-generator': {
      const min = n('minimum', 'Minimum', { integer: true }), max = n('maximum', 'Maximum', { integer: true }), count = n('count', 'Count', { min: 1, max: 100, integer: true })
      if (max < min) throw new Error('Maximum must be greater than or equal to minimum.')
      if (!Number.isSafeInteger(max - min)) throw new Error('The selected range is too large.')
      const values = Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min)
      return `Random number${count > 1 ? 's' : ''}: ${values.join(', ')}`
    }
    case 'length-converter':
    case 'weight-converter':
    case 'area-converter':
    case 'volume-converter':
    case 'speed-converter':
    case 'time-converter':
    case 'data-storage-converter': {
      const group = slug.split('-')[0]
      const value = n('amount', 'Value')
      const factors = unitFactors[group]
      return `Converted value: ${fixed(value * factors[v.fromUnit] / factors[v.toUnit])} ${v.toUnit}`
    }
    case 'temperature-converter': {
      const value = n('amount', 'Temperature')
      const celsius = v.fromUnit === 'C' ? value : v.fromUnit === 'F' ? (value - 32) * 5 / 9 : value - 273.15
      if (v.fromUnit === 'K' && value < 0) throw new Error('Kelvin cannot be below absolute zero.')
      const result = v.toUnit === 'C' ? celsius : v.toUnit === 'F' ? celsius * 9 / 5 + 32 : celsius + 273.15
      if (result < -273.15) throw new Error('Temperature cannot be below absolute zero.')
      return `Converted temperature: ${fixed(result)} °${v.toUnit}`
    }
    case 'salary-calculator': {
      const annual = p('annualSalary', 'Annual salary'), deductions = n('deductionPercent', 'Deduction rate', { min: 0, max: 100 })
      const net = annual * (1 - deductions / 100)
      return `Estimated take-home per year: ${money(net)}\nEstimated take-home per month: ${money(net / 12)}\nEstimated deductions per year: ${money(annual - net)}`
    }
    case 'sip-calculator': {
      const monthly = p('monthlyInvestment', 'Monthly investment'), rate = p('annualRate', 'Expected annual return'), years = positive('tenureYears', 'Investment period')
      const months = Math.round(years * 12), monthlyRate = rate / 1200
      if (months < 1) throw new Error('Investment period must be at least one month.')
      const value = monthlyRate ? monthly * (((1 + monthlyRate) ** months - 1) / monthlyRate) * (1 + monthlyRate) : monthly * months
      return `Estimated maturity value: ${money(value)}\nInvested amount: ${money(monthly * months)}\nEstimated returns: ${money(value - monthly * months)}\nIllustration only; actual returns are not guaranteed.`
    }
    case 'investment-calculator': {
      const principal = p('principal', 'Initial investment'), rate = p('annualRate', 'Expected annual return'), years = p('tenureYears', 'Investment period')
      const value = principal * (1 + rate / 100) ** years
      return `Estimated future value: ${money(value)}\nEstimated growth: ${money(value - principal)}\nIllustration only; actual returns are not guaranteed.`
    }
    case 'rd-calculator': {
      const monthly = p('monthlyDeposit', 'Monthly deposit'), rate = p('annualRate', 'Annual interest rate'), years = positive('tenureYears', 'Tenure')
      const months = Math.round(years * 12), r = rate / 1200
      if (months < 1) throw new Error('Tenure must be at least one month.')
      const value = r ? monthly * (((1 + r) ** months - 1) / r) * (1 + r) : monthly * months
      return `Estimated maturity value: ${money(value)}\nTotal deposits: ${money(monthly * months)}\nEstimated interest: ${money(value - monthly * months)}`
    }
    case 'currency-converter': throw new Error('Live exchange rates are not configured. Add a trusted provider URL with VITE_CURRENCY_API_URL; no exchange rate is estimated or invented.')
    case 'word-counter': {
      const c = countText(v.text || '')
      return `Words: ${c.words}\nCharacters: ${c.characters}\nReading time: ${Math.ceil(c.words / 200)} min\nParagraphs: ${c.paragraphs}`
    }
    case 'character-counter': {
      const c = countText(v.text || '')
      return `Characters (including spaces): ${c.characters}\nCharacters (excluding spaces): ${c.noSpaces}\nWords: ${c.words}\nLines: ${c.lines}`
    }
    case 'case-converter': {
      const text = v.text || ''
      const result = v.caseType === 'upper' ? text.toLocaleUpperCase() : v.caseType === 'lower' ? text.toLocaleLowerCase()
        : v.caseType === 'title' ? text.toLocaleLowerCase().replace(/(^|[\s([{])([\p{L}\p{N}])/gu, (_, prefix, char) => prefix + char.toLocaleUpperCase())
          : text.toLocaleLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (match) => match.toLocaleUpperCase())
      return result ? `Converted text:\n${result}` : 'Enter text to convert.'
    }
    case 'text-cleaner': {
      let text = v.text || ''
      if (v.cleanOptions === 'spaces' || v.cleanOptions === 'all') text = text.split(/\r\n|\r|\n/).map((line) => line.trim().replace(/[ \t]{2,}/g, ' ')).join('\n').trim()
      if (v.cleanOptions === 'lines' || v.cleanOptions === 'all') text = text.split(/\r\n|\r|\n/).filter((line) => line.trim()).join('\n')
      return text ? `Cleaned text:\n${text}` : 'Enter text to clean.'
    }
    case 'password-generator': {
      const length = n('length', 'Password length', { min: 8, max: 128, integer: true })
      const password = createPassword(length, { uppercase: v.includeUppercase, lowercase: true, numbers: v.includeNumbers, symbols: v.includeSymbols })
      return `Generated password:\n${password}`
    }
    case 'qr-code-generator': return v.text?.trim() ? `QR code for: ${v.text.trim()}` : 'Enter text or a URL to create a QR code.'
    default: throw new Error('This tool is not available.')
  }
}
