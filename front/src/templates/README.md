# FleetCore Templates v1.0 (Front)
Fecha: 2026-02-04

Estos templates + componentes base permiten crear módulos nuevos sin “reinventar” layout y lógica.

## Estructura
- `templates/catalog/` : catálogos (code + name/label + active)
- `templates/entity/` : entidades (list+form) con filtros ampliables
- `templates/entityTabs/` : entidades con tabs (People/Vehicles style)

## Componentes compartidos (FleetCore UI)
- `components/fc/PageHeader.jsx`
- `components/fc/TableCard.jsx`
- `components/fc/TableFooter.jsx`
- `components/fc/FiltersBar.jsx`
- `components/fc/AuditDrawer.jsx`
- `components/fc/ConfirmDialog.jsx`

## Hooks compartidos
- `hooks/useUnsavedGlobals.js` (bandera para Sidebar/AppLayout)
- `hooks/useDebouncedValue.js` (búsqueda live)
- `hooks/useListQueryParams.js` (page/limit/q/filters en URL)

## Cómo iniciar un módulo nuevo (checklist)
1. Crear carpeta: `front/src/pages/<Module>/`
2. Copiar template:
   - Catálogo: `templates/catalog/List.jsx` + `Form.jsx`
   - Entidad: `templates/entity/List.jsx` + `Form.jsx`
3. Crear API en `front/src/api/<module>.api.js` usando el template `api.js`
4. Registrar rutas en `front/src/routes/index.jsx`
5. Agregar entrada a Sidebar si aplica

> Recomendación: mantener siempre List/Form separados y usar los componentes `components/fc/*` para simetría visual.
