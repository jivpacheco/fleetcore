// front/src/pages/People/List.jsx
// -----------------------------------------------------------------------------
// RRHH - Listado de Personas
// - Búsqueda básica + filtros
// - Acciones: Ver (?mode=view) y Editar
// - Filtro por sucursal: ?branchId=...
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PeopleAPI } from '../../api/people.api'

export default function PeopleList() {
  const navigate = useNavigate()
  const [sp, setSp] = useSearchParams()

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const page = Number(sp.get('page') || 1)
  const limit = Number(sp.get('limit') || 20)
  const [q, setQ] = useState(sp.get('q') || '')
  const branchId = sp.get('branchId') || ''
  const positionId = sp.get('positionId') || ''
  const active = sp.get('active') || ''

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await PeopleAPI.list({ page, limit, q, branchId, positionId, active })
      const list = data?.items || data?.data?.items || data?.data || []
      setItems(list)
      setTotal(data?.total || data?.data?.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page, limit]) // eslint-disable-line

  const applySearch = () => {
    const next = new URLSearchParams(sp)
    next.set('q', q)
    next.set('page', '1')
    setSp(next, { replace: true })
    // load triggered by effect because page changes to 1
    if (page === 1) load()
  }

  return (
    <div className="max-w-6xl mx-auto p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">RRHH — Personas</h2>
        <button
          className="px-3 py-2 bg-blue-600 text-white rounded"
          onClick={() => navigate('/people/new')}
        >
          Crear persona
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className="border rounded p-2 w-full"
          placeholder="Buscar por nombre, documento, email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="px-3 py-2 border rounded" onClick={applySearch}>
          Buscar
        </button>
      </div>

      <div className="mt-4 bg-white border rounded-xl overflow-hidden">
        {loading && <div className="p-3 text-sm text-slate-500">Cargando…</div>}
        {!loading && items.length === 0 && <div className="p-3 text-sm text-slate-500">Sin resultados.</div>}

        {!loading && items.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-2">Nombre</th>
                <th className="text-left p-2">Documento</th>
                <th className="text-left p-2">Sucursal</th>
                <th className="text-left p-2">Cargo</th>
                <th className="text-right p-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map(p => (
                <tr key={p._id}>
                  <td className="p-2">{p.firstName} {p.lastName}</td>
                  <td className="p-2">{p.documentType} {p.documentId}</td>
                  <td className="p-2">{p.branchId?.name || '—'}</td>
                  <td className="p-2">{p.positionId?.name || '—'}</td>
                  <td className="p-2 text-right space-x-2">
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={() => navigate(`/people/${p._id}?mode=view&tab=BASICO`)}
                    >
                      Ver
                    </button>
                    <button
                      className="px-2 py-1 bg-blue-600 text-white rounded"
                      onClick={() => navigate(`/people/${p._id}?tab=BASICO`)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          className="px-3 py-2 border rounded"
          disabled={page <= 1}
          onClick={() => {
            const next = new URLSearchParams(sp)
            next.set('page', String(page - 1))
            setSp(next, { replace: true })
          }}
        >
          Anterior
        </button>

        <div className="px-3 py-2 text-sm text-slate-600">Página {page}</div>

        <button
          className="px-3 py-2 border rounded"
          disabled={page * limit >= total}
          onClick={() => {
            const next = new URLSearchParams(sp)
            next.set('page', String(page + 1))
            setSp(next, { replace: true })
          }}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
