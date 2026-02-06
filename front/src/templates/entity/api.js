// front/src/templates/entity/api.js
// -----------------------------------------------------------------------------
// Template API para Entidades (FleetCore Standard v1.0)
// - Contrato list: { items, total, page, limit }
// -----------------------------------------------------------------------------
import { api } from "../../services/http";

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

export const EntityAPI = {
  async list(params = {}) {
    const { data } = await api.get(RESOURCE, { params });
    return { items: pickItems(data), ...pickMeta(data) };
  },
  async get(id) {
    const { data } = await api.get(`${RESOURCE}/${id}`);
    return data?.item ?? data?.data ?? data;
  },
  async create(payload) {
    const { data } = await api.post(RESOURCE, payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.patch(`${RESOURCE}/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`${RESOURCE}/${id}`);
    return data;
  },
};
