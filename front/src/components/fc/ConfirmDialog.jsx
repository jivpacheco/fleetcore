// front/src/components/fc/ConfirmDialog.jsx
// -----------------------------------------------------------------------------
// Confirmación simple (fallback) - puede reemplazarse por modal más avanzado
// -----------------------------------------------------------------------------
export function confirmLeave(message) {
  return window.confirm(message || "¿Confirmas la acción?");
}
