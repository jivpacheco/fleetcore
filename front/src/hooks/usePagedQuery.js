// Hook genérico para listas paginadas con React Query.
// fetcher: función que recibe { page, limit, q } y retorna { data, meta } desde backend
import { useQuery } from '@tanstack/react-query'

export function usePagedQuery(key, state, fetcher) {
    const { page, limit, q } = state
    return useQuery({
        queryKey: [key, { page, limit, q }],
        queryFn: async () => {
            const res = await fetcher({ page, limit, q })
            // Se espera un payload del backend con forma:
            // { docs: [...], total: N, page, pages, limit }
            return res.data
        },
        keepPreviousData: true,
        staleTime: 15_000,
    })
}
