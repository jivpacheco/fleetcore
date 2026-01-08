// front/src/utils/run.js
// -----------------------------------------------------------------------------
// RUN (Chile) helpers - módulo 11
// - computeRunDV(number): retorna DV (0-9 o K)
// - isValidRUN(number, dv): valida DV contra número
// - parseRUN(value): extrae { number, dv } desde strings tipo 12.345.678-K
// -----------------------------------------------------------------------------

export function normalizeRunNumber(value = '') {
    return String(value || '').replace(/\D/g, '')
}

export function normalizeRunDV(value = '') {
    const v = String(value || '').trim().toUpperCase()
    if (!v) return ''
    return v === 'K' ? 'K' : v.replace(/\D/g, '').slice(0, 1)
}

export function computeRunDV(runNumber) {
    const s = normalizeRunNumber(runNumber)
    if (!s) return ''
    let sum = 0
    let mul = 2
    for (let i = s.length - 1; i >= 0; i--) {
        sum += Number(s[i]) * mul
        mul = mul === 7 ? 2 : mul + 1
    }
    const res = 11 - (sum % 11)
    if (res === 11) return '0'
    if (res === 10) return 'K'
    return String(res)
}

export function isValidRUN(runNumber, dv) {
    const num = normalizeRunNumber(runNumber)
    const d = normalizeRunDV(dv)
    if (!num || !d) return false
    return computeRunDV(num) === d
}

export function formatRUN(runNumber, dv) {
    const num = normalizeRunNumber(runNumber)
    const d = normalizeRunDV(dv)
    if (!num) return ''
    return d ? `${num}-${d}` : num
}

export function parseRUN(value = '') {
    const raw = String(value || '').trim().toUpperCase()
    if (!raw) return { number: '', dv: '' }
    const cleaned = raw.replace(/\./g, '').replace(/\s/g, '')
    const parts = cleaned.split('-')
    const number = normalizeRunNumber(parts[0] || cleaned)
    const dv = normalizeRunDV(parts[1] || (cleaned.length > 1 ? cleaned.slice(-1) : ''))
    // si venía sin guion, no adivinamos dv automáticamente
    return { number, dv: parts.length > 1 ? dv : '' }
}
