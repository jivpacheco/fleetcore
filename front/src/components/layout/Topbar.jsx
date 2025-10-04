// front/src/components/layout/Topbar.jsx
// -----------------------------------------------------------------------------
// Barra superior:
// - Botón hamburguesa (visible en móvil) que abre/cierra el sidebar.
// - Marca FleetCore (logo + nombre).
// - Info de usuario a la derecha.
// - Usa tu store existente (useAppStore) para toggleSidebar y user.
// -----------------------------------------------------------------------------

import { useAppStore } from '../../store/useAppStore'
import logo from '../../assets/fleetcore-logo.png' // asegúrate del path del asset

export default function Topbar(){
  const toggleSidebar = useAppStore(s => s.toggleSidebar)
  const user = useAppStore(s => s.user)

  return (
    <header
      className="h-14 md:h-16 flex items-center justify-between px-3 md:px-4 border-b"
      style={{ background: 'var(--fc-primary)', color: 'white' }}
    >
      {/* Izquierda: menú + logo + marca */}
      <div className="flex items-center gap-3">
        {/* Botón hamburguesa solo en móvil */}
        <button
          className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded hover:bg-white/10"
          onClick={toggleSidebar}
          aria-label="Abrir/Cerrar menú lateral"
          title="Menú"
        >
          {/* Ícono hamburguesa */}
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M3 6h18M3 12h18M3 18h18"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Logo + nombre */}
        <img src={logo} alt="FleetCore Suite" className="h-7 w-auto" />
        <span className="font-semibold tracking-wide hidden sm:inline">FleetCore Suite</span>
      </div>

      {/* Derecha: usuario */}
      <div className="flex items-center gap-3">
        <span className="text-sm opacity-90 hidden sm:inline">
          {user?.email || 'Invitado'}
        </span>
        <img
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover bg-white/20"
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            user?.email || 'FC'
          )}&background=0055A5&color=fff`}
        />
      </div>
    </header>
  )
}
