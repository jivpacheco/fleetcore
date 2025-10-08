// front/src/store/useAppStore.js
// -----------------------------------------------------------
// Store global (Zustand) con persistencia del user y bootstrapping.
// - guardamos user (no el token, ya que va en cookie httpOnly).
// - flag authBootstrapped: evita redirección temprana en refresh.
// -----------------------------------------------------------
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set, get) => ({
      // sesión
      user: null,
      token: null, // opcional si usas Bearer además de cookie
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      // bootstrap de auth
      authBootstrapped: false,
      setAuthBootstrapped: (v) => set({ authBootstrapped: Boolean(v) }),

      // logout local
      clearSession: () => set({ user: null, token: null }),
    }),
    {
      name: 'fc-app', // clave en localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,               // si prefieres no persistir token, bórralo
      }),
    }
  )
)



// // front/src/store/useAppStore.js
// // -----------------------------------------------------------------------------
// // Store global de la app (Zustand)
// // - user, token
// // - sidebarOpen (si ya lo usas)
// // - authChecked: indica si ya corrimos la verificación inicial (/auth/me)
// // -----------------------------------------------------------------------------
// import { create } from 'zustand'

// export const useAppStore = create((set) => ({
//   user: null,
//   token: null,
//   sidebarOpen: true,

//   // Flag para gating de rutas protegidas
//   authChecked: false,

//   setUser: (user) => set({ user }),
//   setToken: (token) => set({ token }),
//   toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

//   // Marcar que ya verificamos sesión (ok o no)
//   setAuthChecked: (v) => set({ authChecked: !!v }),
// }))



// import { create } from 'zustand'


// // Estado global (auth + UI)
// export const useAppStore = create((set) => ({
// user: null, // { id, email, role }
// token: null,
// sidebarOpen: true,

// // Flag para gating de rutas protegidas
//   authChecked: false,



// setUser: (user) => set({ user }),
// setToken: (token) => set({ token }),
// toggleSidebar: () => set((s)=>({ sidebarOpen: !s.sidebarOpen }))
// }))