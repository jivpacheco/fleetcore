// // -----------------------------------------------------------------------------
// // FleetCore Suite - Página de Login
// // -----------------------------------------------------------------------------
// // Versión revisada (2025-10-06):
// //  ✅ Corrige el error 401 asegurando POST correcto a /api/v1/auth/login
// //  ✅ Mantiene tus logos, estructura, y fondo blanco
// //  ✅ Maneja errores del backend de forma clara
// //  ✅ Botón funcional de Microsoft (OpenID Connect → backend)
// //  ✅ Limpieza general y documentación de cada bloque
// // -----------------------------------------------------------------------------

// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAppStore } from '../store/useAppStore'
// import { api } from '../services/http'     // ya incluye el prefijo en axios baseURL

// import logo from '../assets/fleetcore-logo.png'
// import msIcon from '../assets/microsoft.svg'

// export default function Login() {
//   const nav = useNavigate()
//   const setUser = useAppStore((s) => s.setUser)
//   const setToken = useAppStore((s) => s.setToken)

//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   // ---------------------------------------------------------------------------
//   // LOGIN LOCAL → POST /api/v1/auth/login
//   // Backend devuelve: { user, token }
//   // ---------------------------------------------------------------------------
//   const loginLocal = async (e) => {
//     e.preventDefault()
//     setError('')
//     setLoading(true)
//     try {
//       const res = await api.post('/api/v1/auth/login', { email, password })
//       const { user, token } = res.data
//       if (!user || !token) throw new Error('Respuesta inválida del servidor')
//       setUser(user)
//       setToken(token)
//       nav('/dashboard')
//     } catch (err) {
//       console.error('[loginLocal]', err)
//       setError(
//         err.response?.data?.message ||
//         err.message ||
//         'Error al iniciar sesión'
//       )
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ---------------------------------------------------------------------------
//   // LOGIN MICROSOFT → redirige al backend (Azure OIDC)
//   // backend maneja callback y cookie fc_token
//   // ---------------------------------------------------------------------------
//   const loginMicrosoft = () => {
//     const apiUrl =
//       import.meta.env.VITE_API_URL || 'http://localhost:5000'
//     window.location.href = `${apiUrl}/api/v1/auth/microsoft`
//   }

//   // ---------------------------------------------------------------------------
//   // INTERFAZ VISUAL
//   // ---------------------------------------------------------------------------
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="card w-full max-w-md p-8 shadow-lg rounded-2xl bg-white">
//         {/* LOGO Y TÍTULO */}
//         <div className="flex flex-col items-center mb-6">
//           <img src={logo} alt="FleetCore Suite" className="h-38 mb-2" />
//           <h1
//             className="text-2xl font-bold"
//             style={{ color: 'var(--fc-primary)' }}
//           >
//             FleetCore Suite
//           </h1>
//           <p className="text-gray-600 text-sm mt-1">
//             Accede con tu cuenta
//           </p>
//         </div>

//         {/* BOTÓN MICROSOFT */}
//         <button
//           onClick={loginMicrosoft}
//           className="btn w-full mb-4 flex items-center justify-center gap-2 cursor-pointer"
//           style={{
//             background: 'white',
//             border: '1px solid #e5e7eb',
//             color: 'black',
//           }}
//         >
//           <img src={msIcon} alt="Microsoft" className="h-4 w-4" />
//           Ingresar con Microsoft 365
//         </button>

//         <div className="text-center text-gray-400 mb-4">o</div>

//         {/* FORMULARIO LOCAL */}
//         <form onSubmit={loginLocal} className="space-y-3">
//           <input
//             className="input border rounded px-3 py-2 w-full"
//             type="email"
//             placeholder="Correo"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <input
//             className="input border rounded px-3 py-2 w-full"
//             type="password"
//             placeholder="Contraseña"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           {error && (
//             <div className="text-red-600 text-sm text-center">
//               {error}
//             </div>
//           )}
//           <button
//             disabled={loading}
//             className="btn btn-primary w-full py-2 rounded text-white"
//             style={{
//               background: 'var(--fc-primary)',
//             }}
//           >
//             {loading ? 'Ingresando…' : 'Ingresar'}
//           </button>
//         </form>

//         {/* PIE DE PÁGINA */}
//         <p className="mt-4 text-[11px] leading-relaxed text-gray-400 text-center">
//           Al continuar aceptas nuestros Términos y Política de Privacidad.
//         </p>
//       </div>
//     </div>
//   )
// }

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
