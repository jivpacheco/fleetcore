// front/src/pages/ChangePassword.jsx
// -----------------------------------------------------------------------------
// Cambio de clave (usuario logueado)
// - Soporta modo forzado (?force=1) cuando el backend indica mustChangePassword
// - Llama a POST /api/v1/auth/change-password
// -----------------------------------------------------------------------------

import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../services/http'
import { useAppStore } from '../store/useAppStore'
import logo from '../assets/fleetcore-logo.png'

export default function ChangePassword() {
    const nav = useNavigate()
    const loc = useLocation()
    const force = useMemo(() => new URLSearchParams(loc.search).get('force') === '1', [loc.search])

    const user = useAppStore((s) => s.user)
    const setUser = useAppStore((s) => s.setUser)

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [okMsg, setOkMsg] = useState('')

    const submit = async (e) => {
        e.preventDefault()
        setError('')
        setOkMsg('')

        if (!currentPassword) return setError('Debes ingresar tu clave actual')
        if (!newPassword || newPassword.length < 8) return setError('La nueva clave debe tener al menos 8 caracteres')
        if (newPassword !== confirmPassword) return setError('La confirmación no coincide')

        setLoading(true)
        try {
            await api.post('/api/v1/auth/change-password', { currentPassword, newPassword })
            setOkMsg('Clave actualizada correctamente')

            // Limpia flag local (rehidratará igual con /me)
            setUser({ ...(user || {}), mustChangePassword: false })

            // Si era forzado, volver al dashboard; si no, volver a donde estaba
            nav('/dashboard')
        } catch (err) {
            console.error('[change-password]', err)
            const status = err?.response?.status
            if (status === 401) return setError(err?.response?.data?.message || 'Clave actual incorrecta')
            setError(err?.response?.data?.message || 'No fue posible actualizar la clave')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <img src={logo} alt="FleetCore" className="h-10 w-10 rounded-xl" />
                    <div>
                        <div className="text-lg font-semibold">Cambiar clave</div>
                        <div className="text-sm text-slate-500 truncate">{user?.email}</div>
                    </div>
                </div>

                {force && (
                    <div className="mb-4 text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-3">
                        Por seguridad, debes actualizar tu clave antes de continuar.
                    </div>
                )}

                {error && (
                    <div className="mb-4 text-sm bg-red-50 border border-red-200 text-red-700 rounded-2xl p-3">
                        {error}
                    </div>
                )}
                {okMsg && (
                    <div className="mb-4 text-sm bg-green-50 border border-green-200 text-green-700 rounded-2xl p-3">
                        {okMsg}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-3">
                    <label className="text-sm block">
                        <div className="text-slate-600 mb-1">Clave actual</div>
                        <input
                            type="password"
                            className="w-full h-10 px-3 border rounded-2xl"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </label>

                    <label className="text-sm block">
                        <div className="text-slate-600 mb-1">Nueva clave</div>
                        <input
                            type="password"
                            className="w-full h-10 px-3 border rounded-2xl"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </label>

                    <label className="text-sm block">
                        <div className="text-slate-600 mb-1">Confirmar nueva clave</div>
                        <input
                            type="password"
                            className="w-full h-10 px-3 border rounded-2xl"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </label>

                    <div className="pt-2 flex gap-2">
                        {!force && (
                            <button
                                type="button"
                                className="h-10 px-4 rounded-2xl border hover:bg-slate-50"
                                onClick={() => nav(-1)}
                                disabled={loading}
                            >
                                Volver
                            </button>
                        )}
                        <button
                            type="submit"
                            className="h-10 px-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Actualizar clave'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
