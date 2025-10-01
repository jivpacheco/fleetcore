// import { useAppStore } from '../../store/useAppStore'


// export default function Topbar(){
// const toggleSidebar = useAppStore(s=>s.toggleSidebar)
// const user = useAppStore(s=>s.user)


// return (
// <header className="h-14 flex items-center justify-between px-4" style={{background:'var(--fc-primary)', color:'white'}}>
// <div className="flex items-center gap-3">
// <button className="btn-ghost" onClick={toggleSidebar} aria-label="Toggle sidebar">☰</button>
// <span className="font-semibold">FleetCore Suite</span>
// </div>
// <div className="flex items-center gap-3">
// <span className="text-sm opacity-90">{user?.email || 'Invitado'}</span>
// <img alt="avatar" className="w-8 h-8 rounded-full object-cover" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email||'FC')}&background=0055A5&color=fff`} />
// </div>
// </header>
// )
// }
import { useAppStore } from '../../store/useAppStore'
import logo from '../../assets/fleetcore-logo.png'

export default function Topbar() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const user = useAppStore((s) => s.user)

  return (
    <header
      className="h-14 flex items-center justify-between px-4"
      style={{ background: 'var(--fc-primary)', color: 'white' }}
    >
      {/* Left: Menu + Logo + Brand */}
      <div className="flex items-center gap-3">
        <button
          className="btn-ghost"
          onClick={toggleSidebar}
          aria-label="Abrir/Cerrar menú lateral"
          title="Menú"
        >
          ☰
        </button>

        <img src={logo} alt="FleetCore Suite" className="h-7 w-auto" />
        <span className="font-semibold tracking-wide">FleetCore Suite</span>
      </div>

      {/* Right: User */}
      <div className="flex items-center gap-3">
        <span className="text-sm opacity-90">{user?.email || 'Invitado'}</span>
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
