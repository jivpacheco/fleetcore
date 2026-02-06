// front/src/hooks/useDebouncedValue.js
// -----------------------------------------------------------------------------
// FleetCore Standard v1.0 - Búsqueda live (sin botón Buscar)
// -----------------------------------------------------------------------------
import { useEffect, useState } from "react";

export default function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
