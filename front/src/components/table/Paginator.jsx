// export default function Paginator({ page, pages, onPage }) {
//   const prev = () => onPage(Math.max(1, page - 1))
//   const next = () => onPage(Math.min(pages, page + 1))

//   return (
//     <div className="flex items-center gap-2">
//       <button className="px-3 py-1 rounded border" onClick={prev} disabled={page <= 1}>Anterior</button>
//       <span className="text-sm text-gray-600">Página {page} de {pages || 1}</span>
//       <button className="px-3 py-1 rounded border" onClick={next} disabled={page >= pages}>Siguiente</button>
//     </div>
//   )
// }

// front/src/components/table/Paginator.jsx
export default function Paginator({ page, pages, onPage }){
  const prev = ()=> onPage(Math.max(1, page-1))
  const next = ()=> onPage(Math.min(pages, page+1))
  return (
    <div className="flex items-center gap-2">
      <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={prev} disabled={page<=1}>Anterior</button>
      <div className="text-sm text-gray-600">Página {page} de {pages || 1}</div>
      <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={next} disabled={page>=pages}>Siguiente</button>
    </div>
  )
}

