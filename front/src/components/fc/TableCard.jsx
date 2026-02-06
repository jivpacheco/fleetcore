// front/src/components/fc/TableCard.jsx
// -----------------------------------------------------------------------------
// Contenedor estándar para tablas/listados
// -----------------------------------------------------------------------------
export default function TableCard({ children }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      {children}
    </div>
  );
}
