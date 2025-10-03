// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAppStore } from '../store/useAppStore'
// import { api } from '../services/http'


// export default function Login(){
// const nav = useNavigate()
// const setUser = useAppStore(s=>s.setUser)
// const setToken = useAppStore(s=>s.setToken)


// const [email, setEmail] = useState('')
// const [password, setPassword] = useState('')
// const [loading, setLoading] = useState(false)
// const [error, setError] = useState('')


// const loginLocal = async (e) => {
// e.preventDefault()
// setError(''); setLoading(true)
// try{
// // Backend esperado: POST /api/v1/auth/login → { user, token }
// const data = await api.post('/api/v1/auth/login', { email, password })
// setUser(data.user); setToken(data.token)
// nav('/dashboard')
// }catch(err){ setError(err.message || 'Credenciales inválidas') }
// finally{ setLoading(false) }
// }


// const loginMicrosoft = () => {
// // Redirige al backend (Azure/M365 OAuth). El backend maneja el callback y cookie/session.
// window.location.href = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1/auth/microsoft'
// }


// return (
// <div className="min-h-screen flex items-center justify-center bg-gray-100">
// <div className="card w-full max-w-md p-8">
// <h1 className="text-2xl font-bold text-center mb-2" style={{color:'var(--fc-primary)'}}>FleetCore Suite</h1>
// <p className="text-center text-gray-600 mb-6">Accede con tu cuenta</p>


// <button onClick={loginMicrosoft} className="btn w-full mb-4" style={{background:'white', border:'1px solid #e5e7eb', color:'black'}}>
// Ingresar con Microsoft 365
// </button>


// <div className="text-center text-gray-400 mb-4">o</div>


// <form onSubmit={loginLocal} className="space-y-3">
// <input className="input" type="email" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} required />
// <input className="input" type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} required />
// {error && <div className="text-red-600 text-sm">{error}</div>}
// <button disabled={loading} className="btn btn-primary w-full">
// {loading ? 'Ingresando…' : 'Ingresar'}
// </button>
// </form>
// </div>
// </div>
// )
// }
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
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const loginLocal = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            // Backend esperado: POST /api/v1/auth/login → { user, token }
            const { data } = await api.post('/api/v1/auth/login', { email, password })
            setUser(data.user)
            setToken(data.token)
            nav('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Credenciales inválidas')
        } finally {
            setLoading(false)
        }
    }

    const loginMicrosoft = () => {
        // Redirige al backend (Azure/M365 OAuth). El backend maneja el callback y cookie/session.
        window.location.href =
            (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1/auth/microsoft'
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="card w-full max-w-md p-8 shadow-lg">
                {/* Logo FleetCore */}
                <div className="flex flex-col items-center mb-6">
                    <img src={logo} alt="FleetCore Suite" className="h-14 mb-2" />
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--fc-primary)' }}>
                        FleetCore Suite
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">Accede con tu cuenta</p>
                </div>

                {/* Botón Microsoft */}
                <button
                    onClick={loginMicrosoft}
                    className="btn w-full mb-4 flex items-center justify-center gap-2"
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

                {/* Formulario Local */}
                <form onSubmit={loginLocal} className="space-y-3">
                    <input
                        className="input"
                        type="email"
                        placeholder="Correo"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="input"
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    <button disabled={loading} className="btn btn-primary w-full">
                        {loading ? 'Ingresando…' : 'Ingresar'}
                    </button>
                </form>
                {/* Mini texto legal/opcional */}
                <p className="mt-4 text-[11px] leading-relaxed text-gray-400 text-center">
                    Al continuar acepta nuestros Términos y Política de Privacidad.
                </p>
            </div>
        </div>
    ) //fin return fondo Blanco


}

