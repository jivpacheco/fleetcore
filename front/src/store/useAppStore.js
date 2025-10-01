import { create } from 'zustand'


// Estado global (auth + UI)
export const useAppStore = create((set) => ({
user: null, // { id, email, role }
token: null,
sidebarOpen: true,


setUser: (user) => set({ user }),
setToken: (token) => set({ token }),
toggleSidebar: () => set((s)=>({ sidebarOpen: !s.sidebarOpen }))
}))