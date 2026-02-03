// // front/src/store/useAppStore.js
// // -----------------------------------------------------------------------------
// // Store global (Zustand)
// // Revisión 2026-01-14 (seguridad + responsive):
// // - NO persiste user/token (evita quedar logueado al cerrar navegador)
// // - Persiste únicamente el estado del sidebar (UI)
// // -----------------------------------------------------------------------------

// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'

// export const useAppStore = create(
//   persist(
//     (set) => ({
//       // sesión (NO persistente)
//       user: null,
//       token: null, // opcional (si además de cookie usas Bearer). No persistimos por seguridad.
//       setUser: (user) => set({ user }),
//       setToken: (token) => set({ token }),
//       clearSession: () => set({ user: null, token: null }),

//       // bootstrap de auth
//       authBootstrapped: false,
//       setAuthBootstrapped: (v) => set({ authBootstrapped: Boolean(v) }),

//       // UI
//       sidebarOpen: true,
//       toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
//       setSidebarOpen: (v) => set({ sidebarOpen: Boolean(v) }),
//     }),
//     {
//       name: 'fc-ui',
//       partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
//     }
//   )
// )

//020226
// front/src/store/useAppStore.js
// -----------------------------------------------------------------------------
// Store global (Zustand)
// Seguridad + responsive:
// - NO persiste user/token (evita quedar logueado al cerrar navegador)
// - Persiste únicamente estado UI (sidebarOpen + sidebarCollapsed)
// -----------------------------------------------------------------------------

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set, get) => ({
      // sesión (NO persistente)
      user: null,
      token: null, // opcional (si además de cookie usas Bearer). No persistimos por seguridad.
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      clearSession: () => set({ user: null, token: null }),

      // bootstrap de auth
      authBootstrapped: false,
      setAuthBootstrapped: (v) => set({ authBootstrapped: Boolean(v) }),

      // UI (persistente)
      // Drawer móvil: abierto/cerrado
      sidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (v) => set({ sidebarOpen: Boolean(v) }),

      // Colapsado desktop: ancho normal vs icon-only (persistente)
      // sidebarCollapsed: false,
      // toggleSidebarCollapsed: () =>
      //   set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      // setSidebarCollapsed: (v) => set({ sidebarCollapsed: Boolean(v) }),
      sidebarCollapsed: false,
      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: Boolean(v) }),

      /** NUEVO: acordeón Catálogos **/
      // catalogsOpen: true,
      // toggleCatalogsOpen: () => set((s) => ({ catalogsOpen: !s.catalogsOpen })),
      // setCatalogsOpen: (v) => set({ catalogsOpen: Boolean(v) }),
      catalogsOpen: true,
      toggleCatalogsOpen: () => set((s) => ({ catalogsOpen: !s.catalogsOpen })),
      setCatalogsOpen: (v) => set({ catalogsOpen: Boolean(v) }),
    }),
    {
      name: 'fc-ui',
      // Solo persiste UI. Nada de user/token.
      // partialize: (state) => ({
      //   sidebarOpen: state.sidebarOpen,
      //   sidebarCollapsed: state.sidebarCollapsed,
      //   catalogsOpen: state.catalogsOpen, // NUEVO
      // }),
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed,
        catalogsOpen: state.catalogsOpen,
      }),
    }
  )
)
