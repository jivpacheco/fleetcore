// // export default function App() {
// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-gray-100">
// //       <div className="p-8 bg-white rounded-2xl shadow-lg text-center">
// //         <h1 className="text-4xl font-bold text-blue-600">
// //           🚀 Tailwind v4 + React OK
// //         </h1>
// //         <p className="mt-4 text-gray-700">
// //           Si ves este texto estilizado, ¡Tailwind está funcionando!
// //         </p>
// //         <button className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
// //           Probar botón
// //         </button>
// //       </div>
// //     </div>
// //   )
// // }

import { useEffect } from 'react'

export default function App(){
  useEffect(()=>{
    http((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/health')
      .then(r=>r.json())
      .then(d=>console.log('health:', d))
      .catch(console.error)
  },[])

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-100 p-4">Sidebar</aside>
      <main className="flex-1">
        <header className="h-14 bg-[color:var(--fc-primary)] text-white flex items-center px-4">
          FleetCore Suite
        </header>
        <section className="p-4">Contenido principal</section>
      </main>
    </div>
  )
}

// import { useEffect, useState } from "react";

// function App() {
//   const [pong, setPong] = useState(null);

//   useEffect(() => {
//     http("/api/ping")
//       .then((r) => r.json())
//       .then(setPong)
//       .catch(console.error);
//   }, []);

//   return (
//     <>
//       <h1>Fleetcore</h1>
//       <pre>{JSON.stringify(pong, null, 2)}</pre>
//     </>
//   );
// }

// export default App;
