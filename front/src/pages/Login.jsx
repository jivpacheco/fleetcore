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
//       if (user.mustChangePassword) nav('/account/change-password?force=1')
//       else nav('/dashboard')
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

// -----------------------------------------------------------------------------
// FleetCore Suite - Página de Login
// -----------------------------------------------------------------------------
// Versión base + mejoras UX:
// ✅ Error 401 visible: "Credenciales incorrectas"
// ✅ Toggle Ver/Ocultar contraseña
// ✅ Reserva espacio para error (no parpadea / no desplaza)
// -----------------------------------------------------------------------------

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { api } from '../services/http'

import logo from '../assets/fleetcore-logo.png'
import msIcon from '../assets/microsoft.svg'

export default function Login() {
  const nav = useNavigate()
  const setUser = useAppStore((s) => s.setUser)
  const setToken = useAppStore((s) => s.setToken)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loginLocal = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/v1/auth/login', { email, password })
      const { user, token } = res.data

      if (!user) throw new Error('Respuesta inválida del servidor')

      setUser(user)
      // Si tu backend ya usa cookie httpOnly como fuente de verdad, token puede venir o no.
      // Mantengo esto para compatibilidad hacia atrás:
      if (token) setToken(token)

      if (user.mustChangePassword) nav('/account/change-password?force=1')
      else nav('/dashboard')
    } catch (err) {
      console.error('[loginLocal]', err)
      const status = err?.response?.status
      if (status === 401) {
        setError('Credenciales incorrectas')
      } else {
        setError(err?.response?.data?.message || err?.message || 'Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  const loginMicrosoft = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    window.location.href = `${apiUrl}/api/v1/auth/microsoft`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="card w-full max-w-md p-8 shadow-lg rounded-2xl bg-white">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="FleetCore Suite" className="h-38 mb-2" />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--fc-primary)' }}>
            FleetCore Suite
          </h1>
          <p className="text-gray-600 text-sm mt-1">Accede con tu cuenta</p>
        </div>

        <button
          onClick={loginMicrosoft}
          className="btn w-full mb-4 flex items-center justify-center gap-2 cursor-pointer"
          style={{ background: 'white', border: '1px solid #e5e7eb', color: 'black' }}
        >
          <img src={msIcon} alt="Microsoft" className="h-4 w-4" />
          Ingresar con Microsoft 365
        </button>

        <div className="text-center text-gray-400 mb-4">o</div>

        <form onSubmit={loginLocal} className="space-y-3">
          <input
            className="input border rounded px-3 py-2 w-full"
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />

          <div className="relative">
            <input
              className="input border rounded px-3 py-2 w-full pr-16"
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              title={showPassword ? 'Ocultar' : 'Mostrar'}
            >
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>

          <div className="min-h-[20px]">
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          </div>

          <button
            disabled={loading}
            className="btn btn-primary w-full py-2 rounded text-white"
            style={{ background: 'var(--fc-primary)' }}
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-4 text-[11px] leading-relaxed text-gray-400 text-center">
          Al continuar aceptas nuestros Términos y Política de Privacidad.
        </p>
      </div>
    </div>
  )
}
