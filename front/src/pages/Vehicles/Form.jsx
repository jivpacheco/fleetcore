import { useState } from 'react'
import { api } from '../../services/http'
import { useNavigate } from 'react-router-dom'

export default function VehiclesForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    plate: '', internalCode: '', type: '', brand: '', model: '',
    year: '', color: '', branch: ''
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/api/v1/vehicles', form)
      alert('Vehículo creado con éxito')
      navigate('/vehicles')
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto bg-white shadow rounded p-4">
      <h2 className="text-xl font-semibold">Registrar Vehículo</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input placeholder="Placa" value={form.plate} onChange={e=>setForm({...form,plate:e.target.value})} className="border p-2 rounded"/>
        <input placeholder="Código interno" value={form.internalCode} onChange={e=>setForm({...form,internalCode:e.target.value})} className="border p-2 rounded"/>
        <input placeholder="Tipo" value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="border p-2 rounded"/>
        <input placeholder="Marca" value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})} className="border p-2 rounded"/>
        <input placeholder="Modelo" value={form.model} onChange={e=>setForm({...form,model:e.target.value})} className="border p-2 rounded"/>
        <input type="number" placeholder="Año" value={form.year} onChange={e=>setForm({...form,year:e.target.value})} className="border p-2 rounded"/>
        <input placeholder="Color" value={form.color} onChange={e=>setForm({...form,color:e.target.value})} className="border p-2 rounded"/>
        <input placeholder="Sucursal" value={form.branch} onChange={e=>setForm({...form,branch:e.target.value})} className="border p-2 rounded"/>
      </div>
      <div className="flex justify-end gap-3 pt-3">
        <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Cancelar</button>
        <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
