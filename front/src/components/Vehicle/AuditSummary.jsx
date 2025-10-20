// front/src/components/Vehicle/AuditSummary.jsx
// -----------------------------------------------------------------------------
// Resumen compacto de auditoría (últimos 5 eventos) con link "Ver todo".
// - props: { items = [], onOpenFull }
// -----------------------------------------------------------------------------
export default function AuditSummary({ items = [], onOpenFull }) {
    const top = items
        .slice()
        .sort((a, b) => new Date(b.at) - new Date(a.at))
        .slice(0, 5);

    if (!top.length) return (
        <div className="text-sm text-slate-500">Sin eventos aún.</div>
    );

    return (
        <div>
            <ul className="text-sm space-y-1">
                {top.map((a) => (
                    <li key={a._id || `${a.action}-${a.at}`}>
                        <span className="font-medium">{a.action}</span>
                        <span className="mx-2 text-slate-400">•</span>
                        <span className="text-slate-600">{new Date(a.at).toLocaleString()}</span>
                        {a.by && <span className="ml-2 text-slate-500">({a.by})</span>}
                    </li>
                ))}
            </ul>
            <button type="button" onClick={onOpenFull} className="mt-2 text-blue-600 hover:underline text-sm">
                Ver toda la auditoría
            </button>
        </div>
    );
}
