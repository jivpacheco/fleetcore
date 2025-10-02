// back/src/controllers/account.controller.js
//
// Acciones del usuario autenticado (mi cuenta):
// - GET /account/me               → perfil actual (desde DB)
// - PUT /account/password         → cambio de contraseña (oldPassword → newPassword)
//   * Verifica allowLocalLogin y password actual
//   * Puede limpiar mustChangePassword después del cambio

import User from '../models/User.js'

export const AccountController = {
    // Perfil desde DB (para obtener roles, branchIds, flags actualizados)
    me: async (req, res, next) => {
        try {
            const userId = req.user?.uid
            if (!userId) return res.status(401).json({ message: 'No autenticado' })
            const doc = await User.findById(userId)
            if (!doc) return res.status(404).json({ message: 'Usuario no encontrado' })
            return res.json(doc.toJSON())
        } catch (err) { next(err) }
    },

    // Cambiar contraseña propia
    // Body: { oldPassword, newPassword }
    password: async (req, res, next) => {
        try {
            const userId = req.user?.uid
            if (!userId) return res.status(401).json({ message: 'No autenticado' })

            const { oldPassword, newPassword } = req.body || {}
            if (!oldPassword || !newPassword) {
                return res.status(400).json({ message: 'oldPassword y newPassword son requeridos' })
            }

            const user = await User.findById(userId)
            if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

            // Debe tener login local habilitado
            if (user.local?.allowLocalLogin === false) {
                return res.status(400).json({ message: 'El login local está deshabilitado para este usuario' })
            }

            // Validar password actual
            const ok = await user.checkPassword(oldPassword)
            if (!ok) return res.status(401).json({ message: 'Contraseña actual incorrecta' })

            // (Opcional) validar política de complejidad aquí
            // if (newPassword.length < 8) return res.status(400).json({ message: 'La nueva contraseña es muy corta' })

            await user.setPassword(newPassword)
            // Si tenía clave temporal, la limpiamos
            if (user.local?.mustChangePassword) {
                user.local.mustChangePassword = false
            }
            user.updatedBy = userId
            await user.save()

            return res.json({ ok: true })
        } catch (err) { next(err) }
    },
}
