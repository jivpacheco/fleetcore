// // import { useState } from 'react'
// // import { useNavigate } from 'react-router-dom'
// // import { useAppStore } from '../store/useAppStore'
// // import { api } from '../services/http'


// // export default function Login(){
// // const nav = useNavigate()
// // const setUser = useAppStore(s=>s.setUser)
// // const setToken = useAppStore(s=>s.setToken)


// // const [email, setEmail] = useState('')
// // const [password, setPassword] = useState('')
// // const [loading, setLoading] = useState(false)
// // const [error, setError] = useState('')


// // const loginLocal = async (e) => {
// // e.preventDefault()
// // setError(''); setLoading(true)
// // try{
// // // Backend esperado: POST /api/v1/auth/login → { user, token }
// // const data = await api.post('/api/v1/auth/login', { email, password })
// // setUser(data.user); setToken(data.token)
// // nav('/dashboard')
// // }catch(err){ setError(err.message || 'Credenciales inválidas') }
// // finally{ setLoading(false) }
// // }


// // const loginMicrosoft = () => {
// // // Redirige al backend (Azure/M365 OAuth). El backend maneja el callback y cookie/session.
// // window.location.href = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1/auth/microsoft'
// // }


// // return (
// // <div className="min-h-screen flex items-center justify-center bg-gray-100">
// // <div className="card w-full max-w-md p-8">
// // <h1 className="text-2xl font-bold text-center mb-2" style={{color:'var(--fc-primary)'}}>FleetCore Suite</h1>
// // <p className="text-center text-gray-600 mb-6">Accede con tu cuenta</p>


// // <button onClick={loginMicrosoft} className="btn w-full mb-4" style={{background:'white', border:'1px solid #e5e7eb', color:'black'}}>
// // Ingresar con Microsoft 365
// // </button>


// // <div className="text-center text-gray-400 mb-4">o</div>


// // <form onSubmit={loginLocal} className="space-y-3">
// // <input className="input" type="email" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} required />
// // <input className="input" type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} required />
// // {error && <div className="text-red-600 text-sm">{error}</div>}
// // <button disabled={loading} className="btn btn-primary w-full">
// // {loading ? 'Ingresando…' : 'Ingresar'}
// // </button>
// // </form>
// // </div>
// // </div>
// // )
// // }
// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAppStore } from '../store/useAppStore'
// // import { api } from '../services/http'
// import { api, API_PREFIX } from '../services/http'

// import logo from '../assets/fleetcore-logo.png'
// import msIcon from '../assets/microsoft.svg'

// export default function Login() {
//     const nav = useNavigate()
//     const setUser = useAppStore((s) => s.setUser)
//     const setToken = useAppStore((s) => s.setToken)

//     const [email, setEmail] = useState('')
//     const [password, setPassword] = useState('')
//     const [loading, setLoading] = useState(false)
//     const [error, setError] = useState('')

//     const loginLocal = async (e) => {
//         e.preventDefault()
//         setError('')
//         setLoading(true)
//         try {
//             // Backend esperado: POST /api/v1/auth/login → { user, token }
//             const { data } = await api.post(`${API_PREFIX}/auth/login`, { email, password })
//             setUser(data.user)
//             setToken(data.token)
//             nav('/dashboard')
//         } catch (err) {
//             setError(err.response?.data?.message || err.message || 'Credenciales inválidas')
//         } finally {
//             setLoading(false)
//         }
//     }

//     const loginMicrosoft = () => {
//         // Redirige al backend (Azure/M365 OAuth). El backend maneja el callback y cookie/session.
//         window.location.href =
//             (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1/auth/microsoft'
//     }


//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-100">
//             <div className="card w-full max-w-md p-8 shadow-lg">
//                 {/* Logo FleetCore */}
//                 <div className="flex flex-col items-center mb-6">
//                     <img src={logo} alt="FleetCore Suite" className="h-14 mb-2" />
//                     <h1 className="text-2xl font-bold" style={{ color: 'var(--fc-primary)' }}>
//                         FleetCore Suite
//                     </h1>
//                     <p className="text-gray-600 text-sm mt-1">Accede con tu cuenta</p>
//                 </div>

//                 {/* Botón Microsoft */}
//                 <button
//                     onClick={loginMicrosoft}
//                     className="btn w-full mb-4 flex items-center justify-center gap-2"
//                     style={{
//                         background: 'white',
//                         border: '1px solid #e5e7eb',
//                         color: 'black',
//                     }}
//                 >
//                     <img src={msIcon} alt="Microsoft" className="h-4 w-4" />
//                     Ingresar con Microsoft 365
//                 </button>

//                 <div className="text-center text-gray-400 mb-4">o</div>

//                 {/* Formulario Local */}
//                 <form onSubmit={loginLocal} className="space-y-3">
//                     <input
//                         className="input"
//                         type="email"
//                         placeholder="Correo"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         required
//                     />
//                     <input
//                         className="input"
//                         type="password"
//                         placeholder="Contraseña"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         required
//                     />
//                     {error && <div className="text-red-600 text-sm">{error}</div>}
//                     <button disabled={loading} className="btn btn-primary w-full">
//                         {loading ? 'Ingresando…' : 'Ingresar'}
//                     </button>
//                 </form>
//                 {/* Mini texto legal/opcional */}
//                 <p className="mt-4 text-[11px] leading-relaxed text-gray-400 text-center">
//                     Al continuar acepta nuestros Términos y Política de Privacidad.
//                 </p>
//             </div>
//         </div>
//     ) //fin return fondo Blanco


// }

// -----------------------------------------------------------------------------
// FleetCore Suite - Página de Login
// -----------------------------------------------------------------------------
// Versión revisada (2025-10-06):
//  ✅ Corrige el error 401 asegurando POST correcto a /api/v1/auth/login
//  ✅ Mantiene tus logos, estructura, y fondo blanco
//  ✅ Maneja errores del backend de forma clara
//  ✅ Botón funcional de Microsoft (OpenID Connect → backend)
//  ✅ Limpieza general y documentación de cada bloque
// -----------------------------------------------------------------------------

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { api } from '../services/http'     // ya incluye el prefijo en axios baseURL

import logo from '../assets/fleetcore-logo.png'
import msIcon from '../assets/microsoft.svg'

export default function Login() {
  const nav = useNavigate()
  const setUser = useAppStore((s) => s.setUser)
  const setToken = useAppStore((s) => s.setToken)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ---------------------------------------------------------------------------
  // LOGIN LOCAL → POST /api/v1/auth/login
  // Backend devuelve: { user, token }
  // ---------------------------------------------------------------------------
  const loginLocal = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/v1/auth/login', { email, password })
      const { user, token } = res.data
      if (!user || !token) throw new Error('Respuesta inválida del servidor')
      setUser(user)
      setToken(token)
      nav('/dashboard')
    } catch (err) {
      console.error('[loginLocal]', err)
      setError(
        err.response?.data?.message ||
        err.message ||
        'Error al iniciar sesión'
      )
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------------------------------
  // LOGIN MICROSOFT → redirige al backend (Azure OIDC)
  // backend maneja callback y cookie fc_token
  // ---------------------------------------------------------------------------
  const loginMicrosoft = () => {
    const apiUrl =
      import.meta.env.VITE_API_URL || 'http://localhost:5000'
    window.location.href = `${apiUrl}/api/v1/auth/microsoft`
  }

  // ---------------------------------------------------------------------------
  // INTERFAZ VISUAL
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="card w-full max-w-md p-8 shadow-lg rounded-2xl bg-white">
        {/* LOGO Y TÍTULO */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="FleetCore Suite" className="h-38 mb-2" />
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--fc-primary)' }}
          >
            FleetCore Suite
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Accede con tu cuenta
          </p>
        </div>

        {/* BOTÓN MICROSOFT */}
        <button
          onClick={loginMicrosoft}
          className="btn w-full mb-4 flex items-center justify-center gap-2 cursor-pointer"
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            color: 'black',
          }}
        >
          <img src={msIcon} alt="Microsoft" className="h-4 w-4" />
          Ingresar con Microsoft 365
        </button>

        <div className="text-center text-gray-400 mb-4">o</div>

        {/* FORMULARIO LOCAL */}
        <form onSubmit={loginLocal} className="space-y-3">
          <input
            className="input border rounded px-3 py-2 w-full"
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input border rounded px-3 py-2 w-full"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          <button
            disabled={loading}
            className="btn btn-primary w-full py-2 rounded text-white"
            style={{
              background: 'var(--fc-primary)',
            }}
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        {/* PIE DE PÁGINA */}
        <p className="mt-4 text-[11px] leading-relaxed text-gray-400 text-center">
          Al continuar aceptas nuestros Términos y Política de Privacidad.
        </p>
      </div>
    </div>
  )
}


// // ***** /// //// con cambio de estructura ****
// // -----------------------------------------------------------------------------
// // FleetCore Suite - Página de Login
// // - Permite autenticación local (correo + contraseña)
// // - Opción de ingresar con Microsoft (OIDC)
// // - Guarda sesión y redirige al dashboard
// // -----------------------------------------------------------------------------

// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { api } from '../services/http'
// import { useAppStore } from '../store/useAppStore'
// import { API_PREFIX } from '../services/http'

// export default function Login() {
//     const navigate = useNavigate()
//     const setUser = useAppStore((s) => s.setUser)
//     const [email, setEmail] = useState('')
//     const [password, setPassword] = useState('')
//     const [loading, setLoading] = useState(false)
//     const [error, setError] = useState('')

//     async function handleLogin(e) {
//         e.preventDefault()
//         setLoading(true)
//         setError('')

//         try {
//             const { data } = await api.post(`${API_PREFIX}/auth/login`, { email, password })
//             if (data?.user) {
//                 setUser(data.user)
//                 localStorage.setItem('fc_token', data.token)
//                 navigate('/dashboard')
//             }
//         } catch (err) {
//             setError(err?.response?.data?.message || 'Error de autenticación')
//         } finally {
//             setLoading(false)
//         }
//     }

//     function handleMicrosoftLogin() {
//         window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/microsoft`
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//             <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md border">
//                 <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
//                     FleetCore Suite
//                 </h1>

//                 <form onSubmit={handleLogin} className="space-y-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
//                         <input
//                             type="email"
//                             className="input w-full border rounded px-3 py-2"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             placeholder="ejemplo@cbs.cl"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Contraseña</label>
//                         <input
//                             type="password"
//                             className="input w-full border rounded px-3 py-2"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             placeholder="********"
//                             required
//                         />
//                     </div>

//                     {error && <p className="text-red-600 text-sm">{error}</p>}

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="w-full bg-[var(--fc-primary)] hover:brightness-95 text-white font-medium rounded py-2"
//                     >
//                         {loading ? 'Ingresando...' : 'Iniciar sesión'}
//                     </button>
//                 </form>

//                 <div className="mt-6 text-center">
//                     <p className="text-sm text-gray-500 mb-2">o continúa con</p>
//                     <button
//                         onClick={handleMicrosoftLogin}
//                         className="w-full border rounded py-2 hover:bg-gray-50 flex items-center justify-center gap-2"
//                     >
//                         <img src="/microsoft.svg" alt="Microsoft" className="h-5 w-5" />
//                         Iniciar sesión con Microsoft
//                     </button>
//                 </div>
//             </div>
//         </div>
//     )
// }
