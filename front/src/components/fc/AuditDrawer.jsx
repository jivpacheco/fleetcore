// front/src/components/fc/AuditDrawer.jsx
// -----------------------------------------------------------------------------
// Auditoría "bajo demanda" (no impacta rendimiento)
// - Renderiza drawer lateral derecho
// - Carga datos cuando se abre (fetch externo desde el padre)
// -----------------------------------------------------------------------------
export default function AuditDrawer({ open, title = "Auditoría", onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white dark:bg-slate-900 border-l dark:border-slate-700 shadow-xl flex flex-col">
        <div className="p-4 border-b dark:border-slate-700 flex items-center justify-between">
          <div className="font-semibold text-slate-900 dark:text-white">{title}</div>
          <button className="px-3 py-1.5 rounded-lg border dark:border-slate-700" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
