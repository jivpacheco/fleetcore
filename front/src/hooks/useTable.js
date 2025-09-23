import { useEffect, useState } from 'react';
export function useTable(loader, deps = []){
  const [rows,setRows] = useState([]);
  const [page,setPage] = useState(1);
  const [limit,setLimit] = useState(20);
  const [total,setTotal] = useState(0);
  useEffect(()=>{ (async()=>{ const d = await loader({ page, limit }); setRows(d.data||[]); setTotal(d.total||0); })(); }, [page,limit, ...deps]);
  return { rows, page, setPage, limit, setLimit, total };
}