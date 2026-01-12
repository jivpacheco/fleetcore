// back/src/utils/permissionsCatalog.js
//
// Catálogo de permisos para UI (Roles) y consistencia de RBAC.
// Formato recomendado: <resource>.<action>

export const ACTIONS = ['create', 'read', 'update', 'delete', 'approve', 'authorize', 'close', 'print', 'export']

export const RESOURCES = [
    { key: 'people', label: 'RRHH - Personas' },
    { key: 'people.driverAuthorization', label: 'RRHH - Autorizar conductor' },

    { key: 'vehicles', label: 'Vehículos' },
    { key: 'drivingTests', label: 'Pruebas de conducción' },

    { key: 'workOrders', label: 'Órdenes de trabajo (reparaciones)' },
    { key: 'purchaseOrders', label: 'Órdenes de compra / Gastos' },

    { key: 'catalogs', label: 'Catálogos' },
    { key: 'positions', label: 'Catálogos - Cargos' },
    { key: 'roles', label: 'Catálogos - Roles' },
    { key: 'users', label: 'Usuarios (Admin)' },

    { key: 'systemConfig', label: 'Configuración del sistema' },
]

export function buildPermissionStrings() {
    const perms = []
    for (const r of RESOURCES) {
        for (const a of ACTIONS) perms.push(`${r.key}.${a}`)
    }
    return perms
}
