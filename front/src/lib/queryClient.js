import { QueryClient } from '@tanstack/react-query'


// Manejo de cache y reintentos (suave en dev)
export const queryClient = new QueryClient({
defaultOptions: {
queries: { refetchOnWindowFocus: false, retry: 1 },
mutations: { retry: 0 }
}
})