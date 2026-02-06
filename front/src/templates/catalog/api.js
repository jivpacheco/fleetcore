// front/src/templates/catalog/api.js
// -----------------------------------------------------------------------------
// Template API para Catálogos (FleetCore Standard v1.0)
// - Contrato list: { items, total, page, limit }
// - Payload UI (Form): { code, name, active }
// - En el backend, algunos catálogos usan { key, label } -> mapear aquí si aplica.
// -----------------------------------------------------------------------------
import { api } from "../../services/http";

// Reemplazar por el endpoint real del catálogo.
// Ejemplo:
// const RESOURCE = "/api/v1/positions"
// const RESOURCE = "/api/v1/roles"
const RESOURCE = "/api/v1/<resource>";

function pickItems(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.result?.items)) return data.result.items;
  if (Array.isArray(data.data?.items)) return data.data.items;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

function pickMeta(data) {
  const total =
    data?.total ??
    data?.result?.total ??
    data?.data?.total ??
    (Array.isArray(data?.items) ? data.items.length : undefined) ??
    (Array.isArray(data) ? data.length : 0);

  const page = data?.page ?? data?.result?.page ?? data?.data?.page ?? 1;
  const limit = data?.limit ?? data?.result?.limit ?? data?.data?.limit ?? 20;

  return { total: Number(total || 0), page: Number(page || 1), limit: Number(limit || 20) };
}

export const CatalogAPI = {
  async list({ q = "", active = "", page = 1, limit = 20 } = {}) {
    const { data } = await api.get(RESOURCE, { params: { q, active, page, limit } });
    return { items: pickItems(data), ...pickMeta(data) };
  },
  async get(id) {
    const { data } = await api.get(`${RESOURCE}/${id}`);
    return data?.item ?? data?.data ?? data;
  },
  async create(payload) {
    // UI -> API mapping
    const body = { code: payload.code, name: payload.name, active: payload.active };
    const { data } = await api.post(RESOURCE, body);
    return data;
  },
  async update(id, payload) {
    const body = { code: payload.code, name: payload.name, active: payload.active };
    const { data } = await api.patch(`${RESOURCE}/${id}`, body);
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`${RESOURCE}/${id}`);
    return data;
  },
};
