// front/src/pages/Account/ChangePassword.jsx
// -----------------------------------------------------------------------------
// Cambio de contraseña (usuario logueado)
// - Usa /api/v1/auth/change-password
// - Soporta flujo de password temporal: user.mustChangePassword
// -----------------------------------------------------------------------------

import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../services/http'
import { useAppStore } from '../../store/useAppStore'

export default function ChangePassword() {
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const forced = useMemo(() => sp.get('force') === '1', [sp])

  const { user, setUser, setToken } = useAppStore()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setOk('')

    if (!currentPassword) return setError('Ingresa tu contraseña actual')
    if (!newPassword) return setError('Ingresa tu nueva contraseña')
    if (newPassword.length < 8) return setError('La nueva contraseña debe tener al menos 8 caracteres')
    if (newPassword !== confirmPassword) return setError('La confirmación no coincide')

    setLoading(true)
    try {
      const { data } = await api.post('/api/v1/auth/change-password', {
        currentPassword,
        newPassword,
      })
      if (data?.user) setUser(data.user)
      if (data?.token) setToken(data.token)
      setOk('Contraseña actualizada')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      nav('/dashboard')
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'No fue posible cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Cambiar contraseña</h1>
        <p className="text-sm text-slate-600">
          Usuario: <span className="font-medium">{user?.email || '—'}</span>
        </p>
        {(forced || user?.mustChangePassword) && (
          <div className="mt-3 text-sm p-3 rounded border bg-yellow-50">
            Tu cuenta tiene una contraseña temporal. Debes cambiarla para continuar.
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="border rounded-xl p-4 space-y-4 bg-white">
        <label className="block text-sm">
          <div className="text-slate-600 mb-1">Contraseña actual</div>
          <div className="flex gap-2">
            <input
              type={showCurrent ? 'text' : 'password'}
              className="border rounded px-3 py-2 w-full"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="border rounded px-3 py-2 text-sm"
              onClick={() => setShowCurrent((v) => !v)}
              title={showCurrent ? 'Ocultar' : 'Mostrar'}
            >
              {showCurrent ? '🙈' : '👁️'}
            </button>
          </div>
        </label>

        <label className="block text-sm">
          <div className="text-slate-600 mb-1">Nueva contraseña</div>
          <div className="flex gap-2">
            <input
              type={showNew ? 'text' : 'password'}
              className="border rounded px-3 py-2 w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="border rounded px-3 py-2 text-sm"
              onClick={() => setShowNew((v) => !v)}
              title={showNew ? 'Ocultar' : 'Mostrar'}
            >
              {showNew ? '🙈' : '👁️'}
            </button>
          </div>
          <div className="text-xs text-slate-500 mt-1">Mínimo 8 caracteres.</div>
        </label>

        <label className="block text-sm">
          <div className="text-slate-600 mb-1">Confirmar nueva contraseña</div>
          <div className="flex gap-2">
            <input
              type={showConfirm ? 'text' : 'password'}
              className="border rounded px-3 py-2 w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="border rounded px-3 py-2 text-sm"
              onClick={() => setShowConfirm((v) => !v)}
              title={showConfirm ? 'Ocultar' : 'Mostrar'}
            >
              {showConfirm ? '🙈' : '👁️'}
            </button>
          </div>
        </label>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {ok && <div className="text-sm text-green-700">{ok}</div>}

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded border"
            onClick={() => nav(-1)}
          >
            Volver
          </button>
        </div>
      </form>
    </div>
  )
}
