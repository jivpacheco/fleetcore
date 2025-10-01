export function normCode(s=''){ return (s||'').trim().toUpperCase().replace(/\s+/g,'-'); }
export function normPlate(s=''){ return (s||'').trim().toUpperCase().replace(/[^A-Z0-9]/g,''); }
export function normRut(r=''){ return (r||'').replace(/\./g,'').replace(/-/g,'').toUpperCase(); }
export function validateRut(rut){ return !!rut; } // TODO: módulo 11
