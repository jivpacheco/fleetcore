// // front/src/hooks/UnsavedChangesGuard.jsx
// import { useEffect } from "react";
// import { useBlocker } from "react-router-dom";

// /**
//  * UnsavedChangesGuard (RRD v7 compatible)
//  * - Bloquea navegación interna con useBlocker(when)
//  * - Bloquea cierre/recarga con beforeunload nativo
//  */
// export default function UnsavedChangesGuard({ when, getMessage }) {
//   const message =
//     (typeof getMessage === "function" && getMessage()) ||
//     "Tienes cambios sin guardar. ¿Quieres salir sin guardar?";

//   // 1) Cierre/recarga de pestaña
//   useEffect(() => {
//     if (!when) return;

//     const onBeforeUnload = (e) => {
//       e.preventDefault();
//       e.returnValue = "";
//     };

//     window.addEventListener("beforeunload", onBeforeUnload);
//     return () => window.removeEventListener("beforeunload", onBeforeUnload);
//   }, [when]);

//   // 2) Navegación interna (React Router)
//   const blocker = useBlocker(when);

//   useEffect(() => {
//     if (blocker.state !== "blocked") return;

//     const ok = window.confirm(message);
//     if (ok) blocker.proceed();
//     else blocker.reset();
//   }, [blocker, message]);

//   return null;
// }

// front/src/hooks/UnsavedChangesGuard.jsx
import { useEffect, useMemo } from 'react'
import * as RRD from 'react-router-dom'

/**
 * Bloquea navegación si hay cambios sin guardar.
 *
 * - Siempre protege cierre/recarga de pestaña (beforeunload).
 * - Si React Router expone useBlocker, también bloquea navegación interna.
 */
export default function UnsavedChangesGuard({ when, getMessage }) {
  const message = useMemo(() => {
    return (typeof getMessage === 'function' && getMessage())
      || 'Tienes cambios sin guardar. ¿Quieres salir sin guardar?'
  }, [getMessage])

  // 1) Cierre/recarga de pestaña
  useEffect(() => {
    if (!when) return

    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [when])

  // 2) Navegación interna (solo si RR lo soporta)
  const blockerHook = RRD.useBlocker // RR >= 6.4+ (en v7 debe existir)
  const blocker = blockerHook ? blockerHook(when) : null

  useEffect(() => {
    if (!blocker || blocker.state !== 'blocked') return

    const ok = window.confirm(message)
    if (ok) blocker.proceed()
    else blocker.reset()
  }, [blocker, message])

  return null
}
