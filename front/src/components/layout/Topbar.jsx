// // front/src/components/layout/Topbar.jsx
// import { useEffect, useRef, useState } from 'react'
// import { useAppStore } from '../../store/useAppStore'
// import { api } from '../../services/http'
// import logo from '../../assets/fleetcore-logo.png'

// export default function Topbar({ toggleSidebar }) {
//   const { user, setUser, setToken } = useAppStore()
//   const [open, setOpen] = useState(false)
//   const btnRef = useRef(null)
//   const menuRef = useRef(null)

//   useEffect(() => {
//     function onDocClick(e) {
//       if (!menuRef.current || !btnRef.current) return
//       if (menuRef.current.contains(e.target) || btnRef.current.contains(e.target)) return
//       setOpen(false)
//     }
//     function onKey(e) {
//       if (e.key === 'Escape') setOpen(false)
//     }
//     document.addEventListener('click', onDocClick)
//     document.addEventListener('keydown', onKey)
//     return () => {
//       document.removeEventListener('click', onDocClick)
//       document.removeEventListener('keydown', onKey)
//     }
//   }, [])

//   async function handleLogout() {
//     try {
//       await api.post('/api/v1/auth/logout')
//     } catch (_) {}
//     setUser(null)
//     setToken(null)
//     window.location.href = '/login'
//   }

//   const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
//     user?.email || 'FleetCore'
//   )}&background=0055A5&color=fff`

//   return (
//     <header
//       className="h-14 md:h-16 flex items-center justify-between px-3 md:px-4 border-b dark:border-gray-700"
//       style={{ background: 'var(--fc-primary)', color: 'white' }}
//     >
//       {/* IZQUIERDA: menú + marca */}
//       <div className="flex items-center gap-3">
//         <button
//           className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded hover:bg-white/10"
//           onClick={toggleSidebar}
//           aria-label="Abrir/Cerrar menú lateral"
//           title="Menú"
//         >
//           <svg width="22" height="22" viewBox="0 0 24 24">
//             <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//           </svg>
//         </button>

//         <img src={logo} alt="FleetCore Suite" className="h-7 w-auto" />
//         <span className="font-semibold tracking-wide hidden sm:inline">FleetCore Suite</span>
//       </div>

//       {/* DERECHA: usuario + menú */}
//       <div className="relative flex items-center gap-3">
//         <span className="text-sm opacity-90 hidden sm:inline">{user?.email || 'Invitado'}</span>

//         <button
//           ref={btnRef}
//           onClick={() => setOpen((v) => !v)}
//           className="rounded-full focus:outline-none focus:ring-2 focus:ring-white/60"
//           aria-haspopup="menu"
//           aria-expanded={open}
//           title="Menú de usuario"
//         >
//           <img
//             alt="avatar"
//             className="w-8 h-8 rounded-full object-cover bg-white/20"
//             src={avatarUrl}
//           />
//         </button>

//         {open && (
//           <div
//             ref={menuRef}
//             role="menu"
//             className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white text-slate-800 shadow-lg ring-1 ring-slate-200 overflow-hidden z-50"
//           >
//             <div className="px-4 py-3 border-b border-slate-100">
//               <p className="text-sm font-medium truncate">{user?.name || user?.email || 'Usuario'}</p>
//               {user?.email && <p className="text-xs text-slate-500 truncate">{user.email}</p>}
//             </div>
//             <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50" role="menuitem">
//               Perfil
//             </button>
//             <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50" role="menuitem">
//               Configuración
//             </button>
//             <button
//               onClick={handleLogout}
//               className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//               role="menuitem"
//             >
//               Cerrar sesión
//             </button>
//           </div>
//         )}
//       </div>
//     </header>
//   )
// }
// front/src/components/layout/Topbar.jsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { api } from '../../services/http'
import logo from '../../assets/fleetcore-logo.png'

export default function Topbar({ toggleSidebar }) {
  const nav = useNavigate()
  const { user, setUser, setToken } = useAppStore()
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current || !btnRef.current) return
      if (menuRef.current.contains(e.target) || btnRef.current.contains(e.target)) return
      setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  async function handleLogout() {
    try {
      await api.post('/api/v1/auth/logout')
    } catch (_) {}
    setUser(null)
    setToken(null)
    window.location.href = '/login'
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.email || 'FleetCore'
  )}&background=0055A5&color=fff`

  return (
    <header
      className="h-14 md:h-16 flex items-center justify-between px-3 md:px-4 border-b dark:border-gray-700"
      style={{ background: 'var(--fc-primary)', color: 'white' }}
    >
      {/* IZQUIERDA: menú + marca */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded hover:bg-white/10"
          onClick={toggleSidebar}
          aria-label="Abrir/Cerrar menú lateral"
          title="Menú"
        >
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <img src={logo} alt="FleetCore Suite" className="h-7 w-auto" />
        <span className="font-semibold tracking-wide hidden sm:inline">FleetCore Suite</span>
      </div>

      {/* DERECHA: usuario + menú */}
      <div className="relative flex items-center gap-3">
        <span className="text-sm opacity-90 hidden sm:inline">{user?.email || 'Invitado'}</span>

        <button
          ref={btnRef}
          onClick={() => setOpen((v) => !v)}
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-white/60"
          aria-haspopup="menu"
          aria-expanded={open}
          title="Menú de usuario"
        >
          <img
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover bg-white/20"
            src={avatarUrl}
          />
        </button>

        {open && (
          <div
            ref={menuRef}
            role="menu"
            className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white text-slate-800 shadow-lg ring-1 ring-slate-200 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-medium truncate">{user?.name || user?.email || 'Usuario'}</p>
              {user?.email && <p className="text-xs text-slate-500 truncate">{user.email}</p>}
            </div>
            <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50" role="menuitem">
              Perfil
            </button>
            <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50" role="menuitem">
              Configuración
            </button>
            <button
              onClick={() => { setOpen(false); nav('/account/change-password') }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
              role="menuitem"
            >
              Cambiar clave
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              role="menuitem"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
