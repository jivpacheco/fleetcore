// front/src/hooks/useUnsavedGlobals.js
// -----------------------------------------------------------------------------
// FleetCore Standard v1.0
// - Sincroniza estado "dirty" con banderas globales usadas por Sidebar/AppLayout:
//   window.__FLEETCORE_UNSAVED__ y window.__FLEETCORE_UNSAVED_MESSAGE__
// -----------------------------------------------------------------------------
import { useEffect } from "react";

export default function useUnsavedGlobals(dirty, message) {
  useEffect(() => {
    try {
      window.__FLEETCORE_UNSAVED__ = Boolean(dirty);
      window.__FLEETCORE_UNSAVED_MESSAGE__ =
        message || "Hay cambios sin guardar. ¿Deseas salir sin guardar?";
    } catch {
      // no-op
    }

    return () => {
      try {
        window.__FLEETCORE_UNSAVED__ = false;
        window.__FLEETCORE_UNSAVED_MESSAGE__ = "";
      } catch {
        // no-op
      }
    };
  }, [dirty, message]);
}
