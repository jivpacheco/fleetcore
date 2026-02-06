// front/src/templates/entityTabs/Form.jsx
// -----------------------------------------------------------------------------
// FleetCore Standard v1.0 - Entidad con Tabs (People/Vehicles style)
// - Mantener patrón: View/Edit + UnsavedChangesGuard + botón Editar en view
// - Cada tab debe usar TableCard para consistencia visual
// -----------------------------------------------------------------------------
import { useState } from "react";
import PageHeader from "../../components/fc/PageHeader";
import TableCard from "../../components/fc/TableCard";

export default function EntityTabsForm() {
  const [tab, setTab] = useState("general");

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader title="<Entidad Tabs>" subtitle="Plantilla base para entidades complejas." />

      <div className="flex gap-2 flex-wrap">
        {[
          { key: "general", label: "General" },
          { key: "files", label: "Archivos" },
          { key: "audit", label: "Auditoría" },
        ].map((t) => (
          <button
            key={t.key}
            className={`px-3 py-1.5 rounded-lg border ${tab === t.key ? "bg-slate-100 dark:bg-slate-700" : ""}`}
            onClick={() => setTab(t.key)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      <TableCard>
        <div className="p-4 sm:p-6">
          {tab === "general" && <div>Contenido tab General…</div>}
          {tab === "files" && <div>Contenido tab Archivos…</div>}
          {tab === "audit" && <div>Contenido tab Auditoría…</div>}
        </div>
      </TableCard>
    </div>
  );
}
