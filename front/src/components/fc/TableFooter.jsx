// front/src/components/fc/TableFooter.jsx
// -----------------------------------------------------------------------------
// Footer estándar (Total + paginación) dentro del card, con border-t
// -----------------------------------------------------------------------------
export default function TableFooter({
  total = 0,
  page = 1,
  limit = 20,
  onPrev,
  onNext,
  isPrevDisabled,
  isNextDisabled,
}) {
  const pages = Math.max(1, Math.ceil(Number(total || 0) / Number(limit || 1)));
  return (
    <div className="border-t border-slate-200 dark:border-slate-700 px-3 py-2 flex items-center justify-between gap-3 flex-wrap">
      <div className="text-sm text-slate-600 dark:text-slate-200">
        Total: <span className="font-medium">{Number(total || 0)}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-60"
          onClick={onPrev}
          disabled={Boolean(isPrevDisabled)}
          type="button"
        >
          Anterior
        </button>

        <div className="text-sm text-slate-600 dark:text-slate-200">
          Página <span className="font-medium">{page}</span> /{" "}
          <span className="font-medium">{pages}</span>
        </div>

        <button
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-60"
          onClick={onNext}
          disabled={Boolean(isNextDisabled)}
          type="button"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
