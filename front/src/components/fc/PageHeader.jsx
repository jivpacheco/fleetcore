// front/src/components/fc/PageHeader.jsx
// -----------------------------------------------------------------------------
// FleetCore UI Standard v1.0 - Encabezado consistente para List/Form
// -----------------------------------------------------------------------------
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-slate-500 dark:text-slate-300">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
    </div>
  );
}
