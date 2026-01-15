// back/src/controllers/users.controller.js
//
// Controlador de Usuarios
// - Lista paginada con filtros básicos (q, roles, isActive)
// - Alta con password opcional (clave temporal)
// - Update de metadatos y/o password
// - Reset/Cambio de contraseña por endpoint dedicado
// - Soft delete (no borra físicamente)
//
// NOTA: Aquí no incluimos autorización por roles para mantenerlo simple.
// En producción, protege estas rutas con middleware de auth/roles.

import User from '../models/User.js'

function parseBool(v, fallback = undefined) {
    if (v === undefined) return fallback
    if (typeof v === 'boolean') return v
    const s = String(v).toLowerCase()
    if (['true', '1', 'yes'].includes(s)) return true
    if (['false', '0', 'no'].includes(s)) return false
    return fallback
}

export const UsersController = {
    // GET /users?page=1&limit=10&q=texto&role=admin&isActive=true
    list: async (req, res, next) => {
        try {
            const {
                page = 1,
                limit = 10,
                q,
                role,                 // filtra si contiene rol
                isActive,             // true/false
            } = req.query

            const filter = {}
            if (q) {
                // busca por email o name (case-insensitive)
                filter.$or = [
                    { email: { $regex: q, $options: 'i' } },
                    { name: { $regex: q, $options: 'i' } },
                ]
            }
            if (role) {
                filter.roles = { $in: [role] }
            }
            const activeParsed = parseBool(isActive)
            if (activeParsed !== undefined) {
                filter.isActive = activeParsed
            }

            const result = await User.findPaged({
                filter,
                page,
                limit,
                sort: '-createdAt',
            })

            res.json(result)
        } catch (err) { next(err) }
    },

    // GET /users/:id
    get: async (req, res, next) => {
        try {
            const doc = await User.findById(req.params.id)
            if (!doc) return res.status(404).json({ message: 'Usuario no encontrado' })
            res.json(doc.toJSON())
        } catch (err) { next(err) }
    },

    // POST /users
    // Body esperado:
    // {
    //   email, name, roles?, branchIds?, isActive?,
    //   local?: { allowLocalLogin?, mustChangePassword? },
    //   providers?: { microsoft?: { allowMicrosoftLogin? } },
    //   password?  // opcional; si viene se hashea y (por defecto) mustChangePassword=true si lo indicas
    // }
    create: async (req, res, next) => {
        try {
            const {
                email,
                name = '',
                roles = ['user'],
                branchIds = [],
                isActive = true,
                local = {},
                providers = {},
                password, // opcional (clave inicial)
            } = req.body || {}

            if (!email) {
                return res.status(400).json({ message: 'email es requerido' })
            }

            const existing = await User.findOne({ email: String(email).toLowerCase() })
            if (existing) {
                return res.status(409).json({ message: 'El email ya existe' })
            }

            const user = new User({
                email,
                name,
                roles,
                branchIds,
                isActive,
                local: {
                    allowLocalLogin: local.allowLocalLogin !== undefined ? !!local.allowLocalLogin : true,
                    mustChangePassword: !!local.mustChangePassword, // si quieres forzar cambio al primer login
                },
                providers: {
                    microsoft: {
                        allowMicrosoftLogin: providers?.microsoft?.allowMicrosoftLogin !== undefined
                            ? !!providers.microsoft.allowMicrosoftLogin
                            : true,
                    },
                },
                createdBy: req.user?.uid || null,
                
            })

            // Si envías una contraseña inicial (temporal)
            if (password) {
                await user.setPassword(password) // hashea y marca passwordUpdatedAt
                // si quieres forzar cambio al primer login:
                if (local.mustChangePassword === true) {
                    user.local.mustChangePassword = true
                }
            }

            await user.save()
            res.status(201).json(user.toJSON())
        } catch (err) {
            // Duplicado único u otros errores
            if (err.code === 11000) {
                return res.status(409).json({ message: 'Email ya registrado' })
            }
            next(err)
        }
    },

    // PATCH /users/:id
    // Permite actualizar metadatos y opcionalmente password
    // Body puede incluir: name, roles, branchIds, isActive, local.allowLocalLogin, providers.microsoft.allowMicrosoftLogin, password
    update: async (req, res, next) => {
        try {
            const { id } = req.params
            const {
                name,
                roles,
                branchIds,
                isActive,
                local = {},
                providers = {},
                password, // si se envía, se actualiza la contraseña
                mustChangePassword, // opcional para controlar la bandera
            } = req.body || {}

            const user = await User.findById(id)
            if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

            if (name !== undefined) user.name = name
            if (Array.isArray(roles)) user.roles = roles
            if (Array.isArray(branchIds)) user.branchIds = branchIds

            const isActiveParsed = parseBool(isActive)
            if (isActiveParsed !== undefined) user.isActive = isActiveParsed

            if (local.allowLocalLogin !== undefined) {
                user.local.allowLocalLogin = !!local.allowLocalLogin
            }
            if (providers?.microsoft?.allowMicrosoftLogin !== undefined) {
                if (!user.providers) user.providers = {}
                if (!user.providers.microsoft) user.providers.microsoft = {}
                user.providers.microsoft.allowMicrosoftLogin = !!providers.microsoft.allowMicrosoftLogin
            }

            // Cambio de contraseña (admin/usuario)
            if (password) {
                await user.setPassword(password)
                if (mustChangePassword !== undefined) {
                    user.local.mustChangePassword = !!mustChangePassword
                }
            }

            user.updatedBy = req.user?.uid || null
            await user.save()
            res.json(user.toJSON())
        } catch (err) { next(err) }
    },

    // DELETE /users/:id  → soft delete
    remove: async (req, res, next) => {
        try {
            const { id } = req.params
            const user = await User.findById(id)
            if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

            await user.softDelete(req.user?.uid)
            res.json({ ok: true })
        } catch (err) { next(err) }
    },

    // POST /users/:id/password
    // Resetea/actualiza password. Por defecto marca mustChangePassword=true (clave temporal).
    // Body: { password, mustChangePassword? }
    setPassword: async (req, res, next) => {
        try {
            const { id } = req.params
            const { password, mustChangePassword = true } = req.body || {}
            if (!password) return res.status(400).json({ message: 'password es requerido' })

            const user = await User.findById(id)
            if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

            await user.setPassword(password)
            user.local.mustChangePassword = !!mustChangePassword
            user.updatedBy = req.user?.uid || null

            await user.save()
            res.json({ ok: true })
        } catch (err) { next(err) }
    },
}
