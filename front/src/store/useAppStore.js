// // front/src/store/useAppStore.js
// // -----------------------------------------------------------
// // Store global (Zustand) con persistencia del user y bootstrapping.
// // - Guardamos user (no el token, ya que va en cookie httpOnly).
// // - flag authBootstrapped: evita redirección temprana en refresh.
// // - Agrega control de sidebar (abrir/cerrar en modo responsive).
// // -----------------------------------------------------------

// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'

// export const useAppStore = create(
//   persist(
//     (set, get) => ({
//       // sesión
//       user: null,
//       token: null, // opcional si usas Bearer además de cookie
//       setUser: (user) => set({ user }),
//       setToken: (token) => set({ token }),

//       // bootstrap de auth
//       authBootstrapped: false,
//       setAuthBootstrapped: (v) => set({ authBootstrapped: Boolean(v) }),

//       // logout local
//       clearSession: () => set({ user: null, token: null }),

//       // ⬇️ NUEVO: control de sidebar
//       sidebarOpen: true,
//       toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
//     }),
//     {
//       name: 'fc-app', // clave en localStorage
//       partialize: (state) => ({
//         user: state.user,
//         token: state.token, // si prefieres no persistir token, bórralo
//       }),
//     }
//   )
// )

// front/src/store/useAppStore.js
// -----------------------------------------------------------------------------
// Store global (Zustand)
// Revisión 2026-01-14 (seguridad + responsive):
// - NO persiste user/token (evita quedar logueado al cerrar navegador)
// - Persiste únicamente el estado del sidebar (UI)
// -----------------------------------------------------------------------------

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set) => ({
      // sesión (NO persistente)
      user: null,
      token: null, // opcional (si además de cookie usas Bearer). No persistimos por seguridad.
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      clearSession: () => set({ user: null, token: null }),

      // bootstrap de auth
      authBootstrapped: false,
      setAuthBootstrapped: (v) => set({ authBootstrapped: Boolean(v) }),

      // UI
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (v) => set({ sidebarOpen: Boolean(v) }),
    }),
    {
      name: 'fc-ui',
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
    }
  )
)
