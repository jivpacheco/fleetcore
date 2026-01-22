// // front/src/components/DrivingTests/MapRecorder.jsx
// import { useEffect, useMemo, useRef, useState } from 'react'

// function haversineKm(a, b) {
//     const R = 6371
//     const dLat = (b.lat - a.lat) * Math.PI / 180
//     const dLon = (b.lng - a.lng) * Math.PI / 180
//     const lat1 = a.lat * Math.PI / 180
//     const lat2 = b.lat * Math.PI / 180
//     const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
//     return 2 * R * Math.asin(Math.sqrt(x))
// }

// /**
//  * MapRecorder (Sprint 1)
//  * - Registra track usando navigator.geolocation.
//  * - Calcula distancia y duración.
//  * - Genera snapshot simple en canvas (no mapa real) para guardar base64.
//  *
//  * Props:
//  *  - onFinish({ startedAt, endedAt, durationSec, distanceKm, track, mapSnapshotDataUrl })
//  */
// export default function MapRecorder({ onFinish }) {
//     const [status, setStatus] = useState('IDLE') // IDLE | RUNNING | FINISHED
//     const [track, setTrack] = useState([])
//     const [startedAt, setStartedAt] = useState(null)
//     const [endedAt, setEndedAt] = useState(null)
//     const watchIdRef = useRef(null)
//     const tickRef = useRef(null)
//     const [tick, setTick] = useState(0)

//     const distanceKm = useMemo(() => {
//         if (track.length < 2) return 0
//         let sum = 0
//         for (let i = 1; i < track.length; i++) sum += haversineKm(track[i - 1], track[i])
//         return Number(sum.toFixed(3))
//     }, [track])

//     const durationSec = useMemo(() => {
//         if (!startedAt) return 0
//         // tick fuerza re-render mientras está corriendo
//         void tick
//         const end = endedAt ? new Date(endedAt) : new Date()
//         return Math.max(0, Math.round((end - new Date(startedAt)) / 1000))
//     }, [startedAt, endedAt])

//     // Mientras corre, actualiza cada segundo para que el cronómetro sea visible
//     useEffect(() => {
//         if (status !== 'RUNNING') {
//             if (tickRef.current) {
//                 clearInterval(tickRef.current)
//                 tickRef.current = null
//             }
//             return
//         }
//         tickRef.current = setInterval(() => setTick((v) => v + 1), 1000)
//         return () => {
//             if (tickRef.current) {
//                 clearInterval(tickRef.current)
//                 tickRef.current = null
//             }
//         }
//     }, [status])

//     useEffect(() => {
//         return () => {
//             if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
//             if (tickRef.current) clearInterval(tickRef.current)
//         }
//     }, [])

//     // Bloqueo básico: evita perder la prueba por refrescar/cerrar
//     useEffect(() => {
//         const onBeforeUnload = (e) => {
//             if (status !== 'RUNNING') return
//             e.preventDefault()
//             e.returnValue = ''
//         }
//         if (status === 'RUNNING') {
//             window.__FLEETCORE_UNSAVED__ = true
//             window.addEventListener('beforeunload', onBeforeUnload)
//         }
//         return () => {
//             if (status === 'RUNNING') {
//                 window.removeEventListener('beforeunload', onBeforeUnload)
//                 window.__FLEETCORE_UNSAVED__ = false
//             }
//         }
//     }, [status])

//     const start = async () => {
//         // Pre-checks mínimos (no intrusivos)
//         if (typeof navigator !== 'undefined' && navigator.onLine === false) {
//             alert('Sin conexión a internet. Antes de iniciar verifica tus datos móviles / Wi-Fi.')
//             return
//         }

//         // GPS / permisos
//         if (navigator?.permissions?.query) {
//             try {
//                 const p = await navigator.permissions.query({ name: 'geolocation' })
//                 if (p.state === 'denied') {
//                     alert('Permiso de GPS denegado. Habilítalo antes de iniciar la prueba.')
//                     return
//                 }
//             } catch { /* noop */ }
//         }

//         // Consejo operativo
//         if (!window.confirm('Antes de iniciar verifica la carga de tu dispositivo. ¿Deseas iniciar la prueba ahora?')) {
//             return
//         }

//         if (!navigator.geolocation) {
//             alert('Geolocalización no disponible en este navegador')
//             return
//         }
//         setTrack([])
//         const now = new Date()
//         setStartedAt(now.toISOString())
//         setEndedAt(null)
//         setStatus('RUNNING')

//         watchIdRef.current = navigator.geolocation.watchPosition(
//             (pos) => {
//                 const p = {
//                     lat: pos.coords.latitude,
//                     lng: pos.coords.longitude,
//                     at: new Date().toISOString(),
//                 }
//                 setTrack((prev) => [...prev, p])
//             },
//             (err) => {
//                 console.error(err)
//                 alert('No fue posible obtener ubicación. Revisa permisos GPS.')
//                 setStatus('IDLE')
//             },
//             { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
//         )
//     }

//     const finish = async () => {
//         if (watchIdRef.current != null) {
//             navigator.geolocation.clearWatch(watchIdRef.current)
//             watchIdRef.current = null
//         }
//         const end = new Date().toISOString()
//         setEndedAt(end)
//         setStatus('FINISHED')

//         // Snapshot simple: línea representando track en un canvas
//         const canvas = document.createElement('canvas')
//         canvas.width = 640
//         canvas.height = 360
//         const ctx = canvas.getContext('2d')
//         ctx.clearRect(0, 0, canvas.width, canvas.height)

//         ctx.font = '16px sans-serif'
//         ctx.fillText(`Track points: ${track.length}`, 18, 28)
//         ctx.fillText(`Distancia (km): ${distanceKm}`, 18, 52)
//         ctx.fillText(`Duración (s): ${durationSec}`, 18, 76)

//         if (track.length >= 2) {
//             const lats = track.map(t => t.lat)
//             const lngs = track.map(t => t.lng)
//             const minLat = Math.min(...lats), maxLat = Math.max(...lats)
//             const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
//             const pad = 20
//             const w = canvas.width - pad * 2
//             const h = canvas.height - pad * 2 - 90

//             const proj = (t) => {
//                 const x = (t.lng - minLng) / (maxLng - minLng || 1) * w + pad
//                 const y = (maxLat - t.lat) / (maxLat - minLat || 1) * h + pad + 90
//                 return { x, y }
//             }

//             ctx.beginPath()
//             track.forEach((t, i) => {
//                 const { x, y } = proj(t)
//                 if (i === 0) ctx.moveTo(x, y)
//                 else ctx.lineTo(x, y)
//             })
//             ctx.stroke()
//         }

//         const mapSnapshotDataUrl = canvas.toDataURL('image/png')

//         onFinish?.({
//             startedAt,
//             endedAt: end,
//             durationSec,
//             distanceKm,
//             track,
//             mapSnapshotDataUrl,
//         })
//     }

//     const reset = () => {
//         setStatus('IDLE')
//         setTrack([])
//         setStartedAt(null)
//         setEndedAt(null)
//     }

//     return (
//         <div className="border rounded p-4 space-y-3">
//             <div className="flex items-center gap-2">
//                 <span className="text-sm text-gray-600">Estado:</span>
//                 <span className="text-sm font-semibold">{status}</span>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//                 <div className="text-sm">Distancia: <b>{distanceKm}</b> km</div>
//                 <div className="text-sm">Duración: <b>{durationSec}</b> s</div>
//             </div>

//             <div className="flex gap-2">
//                 <button
//                     type="button"
//                     className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
//                     onClick={start}
//                     disabled={status === 'RUNNING'}
//                 >
//                     Iniciar
//                 </button>

//                 <button
//                     type="button"
//                     className="px-3 py-2 rounded border disabled:opacity-50"
//                     onClick={finish}
//                     disabled={status !== 'RUNNING'}
//                 >
//                     Finalizar
//                 </button>

//                 <button
//                     type="button"
//                     className="px-3 py-2 rounded border"
//                     onClick={reset}
//                 >
//                     Reiniciar
//                 </button>
//             </div>

//             <div className="text-xs text-gray-600">
//                 Puntos registrados: {track.length}
//             </div>
//         </div>
//     )
// }

// front/src/components/DrivingTests/MapRecorder.jsx
import { useEffect, useMemo, useRef, useState } from 'react'

function haversineKm(a, b) {
    const R = 6371
    const dLat = (b.lat - a.lat) * Math.PI / 180
    const dLon = (b.lng - a.lng) * Math.PI / 180
    const lat1 = a.lat * Math.PI / 180
    const lat2 = b.lat * Math.PI / 180
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
    return 2 * R * Math.asin(Math.sqrt(x))
}

/**
 * MapRecorder (Sprint 1)
 * - Registra track usando navigator.geolocation.
 * - Calcula distancia y duración.
 * - Genera snapshot simple en canvas (no mapa real) para guardar base64.
 *
 * Props:
 *  - onFinish({ startedAt, endedAt, durationSec, distanceKm, track, mapSnapshotDataUrl })
 */
export default function MapRecorder({ onFinish }) {
    const [status, setStatus] = useState('IDLE') // IDLE | RUNNING | FINISHED
    const [track, setTrack] = useState([])
    const [startedAt, setStartedAt] = useState(null)
    const [endedAt, setEndedAt] = useState(null)
    const watchIdRef = useRef(null)
    const tickRef = useRef(null)
    const [tick, setTick] = useState(0)

    const distanceKm = useMemo(() => {
        if (track.length < 2) return 0
        let sum = 0
        for (let i = 1; i < track.length; i++) sum += haversineKm(track[i - 1], track[i])
        return Number(sum.toFixed(3))
    }, [track])

    const durationSec = useMemo(() => {
        if (!startedAt) return 0
        // tick fuerza re-render mientras está corriendo
        void tick
        const end = endedAt ? new Date(endedAt) : new Date()
        return Math.max(0, Math.round((end - new Date(startedAt)) / 1000))
    }, [startedAt, endedAt])

    // Mientras corre, actualiza cada segundo para que el cronómetro sea visible
    useEffect(() => {
        if (status !== 'RUNNING') {
            if (tickRef.current) {
                clearInterval(tickRef.current)
                tickRef.current = null
            }
            return
        }
        tickRef.current = setInterval(() => setTick((v) => v + 1), 1000)
        return () => {
            if (tickRef.current) {
                clearInterval(tickRef.current)
                tickRef.current = null
            }
        }
    }, [status])

    useEffect(() => {
        return () => {
            if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
            if (tickRef.current) clearInterval(tickRef.current)
        }
    }, [])

    // Bloqueo básico: evita perder la prueba por refrescar/cerrar
    useEffect(() => {
        const onBeforeUnload = (e) => {
            if (status !== 'RUNNING') return
            e.preventDefault()
            e.returnValue = ''
        }
        if (status === 'RUNNING') {
            window.__FLEETCORE_UNSAVED__ = true
            window.addEventListener('beforeunload', onBeforeUnload)
        }
        return () => {
            if (status === 'RUNNING') {
                window.removeEventListener('beforeunload', onBeforeUnload)
                window.__FLEETCORE_UNSAVED__ = false
            }
        }
    }, [status])

    const start = async () => {
        // Pre-checks mínimos (no intrusivos)
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            alert('Sin conexión a internet. Antes de iniciar verifica tus datos móviles / Wi-Fi.')
            return
        }

        // GPS / permisos
        if (navigator?.permissions?.query) {
            try {
                const p = await navigator.permissions.query({ name: 'geolocation' })
                if (p.state === 'denied') {
                    alert('Permiso de GPS denegado. Habilítalo antes de iniciar la prueba.')
                    return
                }
            } catch { /* noop */ }
        }

        // Consejo operativo
        if (!window.confirm('Antes de iniciar verifica la carga de tu dispositivo. ¿Deseas iniciar la prueba ahora?')) {
            return
        }

        if (!navigator.geolocation) {
            alert('Geolocalización no disponible en este navegador')
            return
        }
        setTrack([])
        const now = new Date()
        setStartedAt(now.toISOString())
        setEndedAt(null)
        setStatus('RUNNING')

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const p = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    at: new Date().toISOString(),
                }
                setTrack((prev) => [...prev, p])
            },
            (err) => {
                console.error(err)
                alert('No fue posible obtener ubicación. Revisa permisos GPS.')
                setStatus('IDLE')
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        )
    }

    const finish = async () => {
        const ok = window.confirm('¿Está seguro de finalizar la prueba de ruta?')
        if (!ok) return
        if (watchIdRef.current != null) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }
        const end = new Date().toISOString()
        setEndedAt(end)
        setStatus('FINISHED')

        // Snapshot simple: línea representando track en un canvas
        const canvas = document.createElement('canvas')
        canvas.width = 640
        canvas.height = 360
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        ctx.font = '16px sans-serif'
        ctx.fillText(`Track points: ${track.length}`, 18, 28)
        ctx.fillText(`Distancia (km): ${distanceKm}`, 18, 52)
        ctx.fillText(`Duración (s): ${durationSec}`, 18, 76)

        if (track.length >= 2) {
            const lats = track.map(t => t.lat)
            const lngs = track.map(t => t.lng)
            const minLat = Math.min(...lats), maxLat = Math.max(...lats)
            const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
            const pad = 20
            const w = canvas.width - pad * 2
            const h = canvas.height - pad * 2 - 90

            const proj = (t) => {
                const x = (t.lng - minLng) / (maxLng - minLng || 1) * w + pad
                const y = (maxLat - t.lat) / (maxLat - minLat || 1) * h + pad + 90
                return { x, y }
            }

            ctx.beginPath()
            track.forEach((t, i) => {
                const { x, y } = proj(t)
                if (i === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
            })
            ctx.stroke()
        }

        const mapSnapshotDataUrl = canvas.toDataURL('image/png')

        onFinish?.({
            startedAt,
            endedAt: end,
            durationSec,
            distanceKm,
            track,
            mapSnapshotDataUrl,
        })
    }

    const reset = () => {
        // Requerimiento: confirmar reinicio para evitar reinicios por error.
        if (status !== 'IDLE' || track.length) {
            const ok = window.confirm('¿Está seguro de reiniciar la prueba? Se perderán los puntos registrados.')
            if (!ok) return
        }
        setStatus('IDLE')
        setTrack([])
        setStartedAt(null)
        setEndedAt(null)
    }

    return (
        <div className="border rounded p-4 space-y-3">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Estado:</span>
                <span className="text-sm font-semibold">{status}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="text-sm">Distancia: <b>{distanceKm}</b> km</div>
                <div className="text-sm">Duración: <b>{durationSec}</b> s</div>
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
                    onClick={start}
                    disabled={status === 'RUNNING'}
                >
                    Iniciar
                </button>

                {/* Requerimiento: finalizar y reiniciar deben omitirse y aparecer
                    solo después de iniciar */}
                {status !== 'IDLE' && (
                    <>
                        {status === 'RUNNING' && (
                            <button
                                type="button"
                                className="px-3 py-2 rounded border"
                                onClick={finish}
                            >
                                Finalizar
                            </button>
                        )}

                        <button
                            type="button"
                            className="px-3 py-2 rounded border"
                            onClick={reset}
                        >
                            Reiniciar
                        </button>
                    </>
                )}
            </div>

            <div className="text-xs text-gray-600">
                Puntos registrados: {track.length}
            </div>
        </div>
    )
}