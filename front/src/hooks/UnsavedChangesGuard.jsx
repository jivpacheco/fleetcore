/**
 * UnsavedChangesGuard
 * Bloquea navegación (interna y cierre/recarga de pestaña) si `when` es true.
 *
 * - Navegación interna (links, NavLinks, navigate, back/forward):
 *   usa useBlocker (o unstable_useBlocker en versiones antiguas de RRv6).
 * - Cierre/recarga de pestaña:
 *   usa useBeforeUnload para mostrar el prompt del navegador.
 *
 * Props:
 *  - when: boolean → activa el guard.
 *  - getMessage?: () => string → mensaje a mostrar en confirmación.
 *
 * Uso:
 *  <UnsavedChangesGuard when={isDirty} getMessage={() => "Tienes cambios sin guardar. ¿Salir sin guardar?"} />
 */

import { useEffect } from "react";
import {
    useBeforeUnload,
    // Para soportar distintas versiones de RRv6:
    unstable_useBlocker as useBlockerV6_Unstable,
    useBlocker as useBlockerV6,
} from "react-router-dom";

export default function UnsavedChangesGuard({ when, getMessage }) {
    // 1) Bloqueo en cierre/recarga de pestaña
    useBeforeUnload(when, (event) => {
        // Algunos navegadores necesitan preventDefault para mostrar el prompt nativo
        event.preventDefault();
    });

    // 2) Bloqueo en navegación interna (router)
    const blockerHook = useBlockerV6 || useBlockerV6_Unstable;
    const blocker = blockerHook ? blockerHook(when) : null;

    useEffect(() => {
        if (!blocker || blocker.state !== "blocked") return;

        const msg =
            (typeof getMessage === "function" &&
                getMessage()) ||
            "Tienes cambios sin guardar. ¿Quieres salir sin guardar?";

        // Puedes reemplazar window.confirm por tu modal propio si lo prefieres
        const ok = window.confirm(msg);

        if (ok) {
            blocker.proceed(); // continúa la navegación
        } else {
            blocker.reset();   // cancela la navegación
        }
    }, [blocker, getMessage]);

    return null;
}
