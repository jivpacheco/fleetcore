// front/src/components/fc/FiltersBar.jsx
// -----------------------------------------------------------------------------
// Barra de filtros estándar (q + active + limit + extras)
// -----------------------------------------------------------------------------
export default function FiltersBar({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
      {children}
    </div>
  );
}
