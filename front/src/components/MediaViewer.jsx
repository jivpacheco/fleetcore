import { useState } from 'react';
export default function MediaViewer({items=[]}){
  const [i,setI]=useState(0);
  if(!items.length) return <div className="text-gray-500 text-sm">Sin archivos</div>;
  const m=items[i];
  return(
  <div className="space-y-3">
    <div className="border rounded p-3 flex flex-col items-center gap-2">
      <div>{m.title||m.kind}</div>
      {m.url?.match(/\\.(jpg|png|jpeg|gif|webp)$/i)?
        <img src={m.url} alt={m.title||''} className="max-h-72 object-contain"/>:
        <a href={m.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Ver documento</a>}
      <div className="flex gap-2">
        <button onClick={()=>setI((i-1+items.length)%items.length)}>◀</button>
        <span>{i+1}/{items.length}</span>
        <button onClick={()=>setI((i+1)%items.length)}>▶</button>
      </div>
    </div>
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {items.map((x,idx)=>
        <button key={idx} onClick={()=>setI(idx)} className={`border rounded p-1 ${idx===i?'ring-2 ring-blue-500':''}`}>
          {x.url?.match(/\\.(jpg|png|jpeg|gif|webp)$/i)?
            <img src={x.url} alt={x.title||''} className="h-20 w-full object-cover"/>:
            <div className="h-20 flex items-center justify-center text-xs">DOC</div>}
        </button>
      )}
    </div>
  </div>);
}
