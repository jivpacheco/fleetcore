import Role from '../models/Role.js';

function buildOrgFilter(req) {
  // organizationId NO se fuerza por ahora.
  // Si existe (futuro o admin global), filtramos por org.
  const orgId = req?.user?.organizationId || null;
  return orgId ? { organizationId: orgId } : { organizationId: null };
}

export async function listRoles(req, res) {
  const filter = { active: true, ...buildOrgFilter(req) };
  const items = await Role.find(filter).sort({ name: 1 });
  return res.json({ items });
}

export async function createRole(req, res) {
  const orgFilter = buildOrgFilter(req);

  const payload = {
    code: req.body.code,
    name: req.body.name,
    permissions: Array.isArray(req.body.permissions) ? req.body.permissions : [],
    scope: req.body.scope || 'BRANCH',
    active: req.body.active !== false,
    isSystem: !!req.body.isSystem,
    organizationId: orgFilter.organizationId ?? null,
  };

  const created = await Role.create(payload);
  return res.status(201).json(created);
}

export async function updateRole(req, res) {
  const { id } = req.params;
  const role = await Role.findById(id);
  if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

  if (role.isSystem) {
    return res.status(403).json({ message: 'No se puede modificar un rol del sistema' });
  }

  if (typeof req.body.code === 'string') role.code = req.body.code;
  if (typeof req.body.name === 'string') role.name = req.body.name;
  if (Array.isArray(req.body.permissions)) role.permissions = req.body.permissions;
  if (typeof req.body.scope === 'string') role.scope = req.body.scope;
  if (typeof req.body.active === 'boolean') role.active = req.body.active;

  await role.save();
  return res.json(role);
}

export async function deleteRole(req, res) {
  const { id } = req.params;
  const role = await Role.findById(id);
  if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

  if (role.isSystem) {
    return res.status(403).json({ message: 'No se puede eliminar un rol del sistema' });
  }

  role.active = false;
  await role.save();
  return res.status(204).end();
}
