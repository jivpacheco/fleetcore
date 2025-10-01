// src/hooks/useAuth.js
export function getToken(){ return localStorage.getItem('token') || ''; }
export function parseJwt(token){ try{ const [,p]=token.split('.'); return JSON.parse(atob(p)); }catch{ return null; } }
export function isExpired(token){ const p=parseJwt(token); if(!p||!p.exp) return false; const now=Math.floor(Date.now()/1000); return p.exp<=now; }
export function isAuthenticated(){ const t=getToken(); return !!t && !isExpired(t); }
export function logout(){ try{ localStorage.removeItem('token'); }catch{} }
export function redirectToLogin(){
  try{ localStorage.removeItem('token'); }catch{}
  const from = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/login?from=${from}`;
}
