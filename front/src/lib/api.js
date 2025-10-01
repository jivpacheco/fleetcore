export async function api(path, { method='GET', body, token } = {}){
  const headers = { 'Content-Type': 'application/json' };
  const t = token || localStorage.getItem('token');
  if(t) headers.Authorization = `Bearer ${t}`;
  const res = await http(`${import.meta.env.VITE_API_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error || 'Network error');
  return data;
}