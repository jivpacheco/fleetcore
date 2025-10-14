import * as svc from '../services/catalogs.service.js'

export async function getOne(req, res, next) {
    try { res.json(await svc.getByKey(req.params.key)) }
    catch (e) { e.message === 'not_found' ? res.status(404).json({ message: 'Catálogo no encontrado' }) : next(e) }
}

export async function addItem(req, res, next) {
    try {
        const { code, label, active } = req.body || {}
        if (!code || !label) return res.status(400).json({ message: 'code y label son requeridos' })
        const out = await svc.upsertItem(req.params.key, { code, label, active })
        res.status(201).json(out)
    } catch (e) { next(e) }
}

export async function patchItem(req, res, next) {
    try {
        const out = await svc.updateItem(req.params.key, req.params.itemId, req.body || {})
        res.json(out)
    } catch (e) { e.message === 'not_found' ? res.status(404).json({ message: 'Item no encontrado' }) : next(e) }
}

export async function removeItem(req, res, next) {
    try {
        const out = await svc.removeItem(req.params.key, req.params.itemId)
        res.json(out)
    } catch (e) { e.message === 'not_found' ? res.status(404).json({ message: 'Item no encontrado' }) : next(e) }
}
