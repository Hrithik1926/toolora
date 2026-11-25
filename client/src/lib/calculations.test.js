import test from 'node:test'
import assert from 'node:assert/strict'
import { tools } from '../data/tools.js'
import { calculate } from './calculations.js'

const value = (result, expected) => assert.ok(result.includes(expected), `${result} does not include ${expected}`)

test('all 50 tools have unique routes and input definitions', () => {
  assert.equal(tools.length, 50)
  assert.equal(new Set(tools.map((tool) => tool.path)).size, 50)
  for (const tool of tools) {
    assert.ok(tool.fields.length, `${tool.name} should have at least one input`)
    assert.ok(tool.description.length > 30, `${tool.name} should have useful page-specific description`)
  }
})

test('all client-side tools return a result with representative valid inputs', () => {
  for (const tool of tools) {
    if (tool.slug === 'currency-converter') continue
    const inputs = Object.fromEntries(tool.fields.map((field) => {
      if (field.type === 'select') return [field.name, field.options[0][0]]
      if (field.type === 'checkbox') return [field.name, false]
      if (field.type === 'date') return [field.name, '2000-01-01']
      if (field.type === 'time') return [field.name, '12:00']
      if (field.name === 'numbers' || field.name === 'grades') return [field.name, '1, 2']
      if (field.name === 'expression') return [field.name, '1 + 1']
      if (field.type === 'textarea' || field.name === 'text') return [field.name, 'Toolora example text']
      if (field.type === 'number' || !field.type) return [field.name, String(field.defaultValue ?? Math.max(field.min ?? 1, 1))]
      return [field.name, '1']
    }))
    assert.doesNotThrow(() => {
      const result = calculate(tool.slug, inputs)
      assert.ok(result.length > 0, `${tool.name} should return a result`)
    }, tool.name)
  }
})

test('percentage, GST, discount and profit/loss calculations are correct', () => {
  value(calculate('percentage-calculator', { part: 25, whole: 200 }), '12.5%')
  value(calculate('gst-calculator', { amount: 1000, gstRate: 18, mode: 'add' }), '1,180.00')
  value(calculate('gst-calculator', { amount: 1180, gstRate: 18, mode: 'remove' }), '1,000.00')
  value(calculate('discount-calculator', { originalPrice: 500, discountPercent: 20 }), '400.00')
  value(calculate('profit-loss-calculator', { costPrice: 80, sellingPrice: 100 }), '25%')
  value(calculate('profit-loss-calculator', { costPrice: 100, sellingPrice: 80 }), '20.00')
})

test('loan and interest calculations handle rate edge cases', () => {
  value(calculate('emi-calculator', { principal: 1200, annualRate: 0, tenureYears: 1 }), 'Monthly EMI: ₹100.00')
  value(calculate('simple-interest-calculator', { principal: 1000, rate: 5, timeYears: 2 }), 'Simple interest: 100.00')
  value(calculate('compound-interest-calculator', { principal: 1000, rate: 0, timeYears: 2, compoundsPerYear: 12 }), 'Maturity value: 1,000.00')
  value(calculate('sip-calculator', { monthlyInvestment: 100, annualRate: 0, tenureYears: 1 }), 'Invested amount: 1,200.00')
})

test('date and time tools reject reversed ranges and count elapsed days', () => {
  value(calculate('days-between-dates-calculator', { startDate: '2024-02-28', endDate: '2024-03-01' }), '2 days')
  assert.throws(() => calculate('date-difference-calculator', { startDate: '2024-03-01', endDate: '2024-02-28' }), /later than/)
  value(calculate('time-duration-calculator', { startTime: '23:30', endTime: '00:15' }), '45 minutes')
  value(calculate('add-subtract-days', { startDate: '2024-02-28', numberOfDays: 2, operation: 'add' }), '2024-03-01')
  assert.throws(() => calculate('add-subtract-days', { startDate: '9999-12-31', numberOfDays: 1, operation: 'add' }), /result date must be between/)
})

test('math tools simplify fractions and reject invalid division', () => {
  value(calculate('fraction-calculator', { numerator1: 1, denominator1: 2, numerator2: 1, denominator2: 3, operation: '+' }), '5/6')
  value(calculate('fraction-calculator', { numerator1: 999999999, denominator1: 999999937, numerator2: 999999937, denominator2: 999999929, operation: '*' }), '999999999/999999929')
  assert.throws(() => calculate('fraction-calculator', { numerator1: 1, denominator1: 2, numerator2: 1, denominator2: 3, operation: 'invalid' }), /valid fraction operation/)
  value(calculate('scientific-calculator', { expression: 'sqrt(81) + 5 * 2' }), 'Result: 19')
  value(calculate('scientific-calculator', { expression: '-2^2' }), 'Result: -4')
  value(calculate('scientific-calculator', { expression: '2^-2' }), 'Result: 0.25')
  value(calculate('lcm-calculator', { numbers: '12, 18, 30' }), 'LCM: 180')
  assert.throws(() => calculate('percentage-calculator', { part: 5, whole: 0 }), /greater than 0/)
  assert.throws(() => calculate('scientific-calculator', { expression: '1 / 0' }), /zero/)
})

test('converters and text tools produce useful results', () => {
  value(calculate('temperature-converter', { amount: 32, fromUnit: 'F', toUnit: 'C' }), '0 °C')
  value(calculate('length-converter', { amount: 1, fromUnit: 'km', toUnit: 'm' }), '1,000 m')
  value(calculate('word-counter', { text: 'Toolora makes everyday tools easy.' }), 'Words: 5')
  value(calculate('case-converter', { text: 'hello toolora', caseType: 'title' }), 'Hello Toolora')
})

test('currency conversion never falls back to an invented rate', () => {
  assert.throws(() => calculate('currency-converter', { amount: 10, fromUnit: 'USD', toUnit: 'INR' }), /not configured/)
})
