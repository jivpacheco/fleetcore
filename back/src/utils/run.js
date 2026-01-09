// back/src/utils/run.js
// -----------------------------------------------------------------------------
// RUN (Chile) helpers
// - Normaliza RUN a formato: 12345678-K (sin puntos, DV mayúscula)
// - Valida DV por Módulo 11
// -----------------------------------------------------------------------------

export function normalizeRUN(value) {
    if (value === null || value === undefined) return value;
    const s = String(value).trim().toUpperCase();
    if (!s) return s;

    // quitar puntos y espacios
    const cleaned = s.replace(/\./g, '').replace(/\s+/g, '');

    // soportar entradas tipo 12345678K (sin guion)
    if (/^\d{7,8}[0-9K]$/.test(cleaned)) {
        return `${cleaned.slice(0, -1)}-${cleaned.slice(-1)}`;
    }

    // soportar 12.345.678-K / 12345678-K / 12345678-k
    const m = cleaned.match(/^([0-9]{7,8})-?([0-9K])$/);
    if (!m) return cleaned;
    return `${m[1]}-${m[2]}`;
}

export function computeRunDV(runNumber) {
    const s = String(runNumber ?? '').replace(/\D/g, '');
    if (!s) return '';

    let sum = 0;
    let mul = 2;
    for (let i = s.length - 1; i >= 0; i--) {
        sum += Number(s[i]) * mul;
        mul = mul === 7 ? 2 : mul + 1;
    }
    const res = 11 - (sum % 11);
    if (res === 11) return '0';
    if (res === 10) return 'K';
    return String(res);
}

export function isValidRUN(value) {
    if (value === null || value === undefined) return false;
    const norm = normalizeRUN(value);
    const m = String(norm).match(/^([0-9]{7,8})-([0-9K])$/);
    if (!m) return false;
    const num = m[1];
    const dv = m[2];
    const expected = computeRunDV(num);
    return expected === dv;
}
