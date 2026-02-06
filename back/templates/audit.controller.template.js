// back/templates/audit.controller.template.js
// -----------------------------------------------------------------------------
// FleetCore Standard v1.0 - Auditoría paginada por demanda
// - Endpoint sugerido: GET /api/v1/audit?entity=<Entity>&entityId=<id>&page&limit
// -----------------------------------------------------------------------------
export async function listAudit(req, res, next) {
  try {
    const entity = String(req.query.entity || "");
    const entityId = String(req.query.entityId || "");
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);

    // TODO: implementar consulta real a AuditLog
    return res.json({ items: [], total: 0, page, limit, entity, entityId });
  } catch (e) {
    next(e);
  }
}
