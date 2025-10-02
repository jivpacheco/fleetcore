import { useEffect } from 'react'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import { api } from '../../services/http'
import { useAppStore } from '../../store/useAppStore'
import { Outlet } from 'react-router-dom'

export default function AppLayout() {
    const setUser = useAppStore(s => s.setUser)

    useEffect(() => {
        // Si existe cookie httpOnly (Microsoft), esto carga el user al entrar
        api.get('/api/v1/auth/me')
            .then(({ data }) => setUser(data.user))
            .catch(() => { }) // no autenticado => sigue normal
    }, [setUser])

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <Topbar />
                <div className="flex-1 min-w-0 overflow-auto p-3 sm:p-4 lg:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
