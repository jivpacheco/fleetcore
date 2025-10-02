// back/src/routes/users.routes.js
//
// Rutas de Usuarios
// - CRUD + endpoint para password
// - Paginación en GET /users
//
// NOTA: Si ya tienes middlewares de auth/roles, móntalos aquí (ej. requireAuth, requireRole('admin'))

// import { Router } from 'express'
// import { UsersController as C } from '../controllers/users.controller.js'

// const r = Router()

// r.get('/', C.list)                 // Lista paginada: ?page=&limit=&q=&role=&isActive=
// r.get('/:id', C.get)               // Obtener 1 usuario
// r.post('/', C.create)              // Crear usuario (puede incluir password temporal)
// r.patch('/:id', C.update)          // Actualizar usuario (datos y opcionalmente password)
// r.delete('/:id', C.remove)         // Soft delete
// r.post('/:id/password', C.setPassword) // Reset/cambio de contraseña

// export default r

// back/src/routes/users.routes.js
//
// Rutas de Usuarios (CRUD + reset de contraseña)
// - Protegidas con requireAuth y requireRole (admin/global por defecto)
// - Paginación: GET /users?page=&limit=&q=&role=&isActive=
//
// Si deseas relajar permisos, elimina o ajusta requireRole.
//
// Requiere:
//  - UsersController (controllers/users.controller.js)
//  - requireAuth (middleware/auth.js)
//  - requireRole (middleware/roles.js)

import { Router } from 'express'
import { UsersController as C } from '../controllers/users.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/roles.js'

const r = Router()

// Lista paginada de usuarios
// Ej: GET /api/v1/users?page=1&limit=10&q=john&role=admin&isActive=true
r.get(
    '/',
    requireAuth,
    requireRole('admin', 'global'),
    C.list
)

// Obtiene un usuario por id
r.get(
    '/:id',
    requireAuth,
    requireRole('admin', 'global'),
    C.get
)

// Crea usuario (opcional password temporal)
r.post(
    '/',
    requireAuth,
    requireRole('admin', 'global'),
    C.create
)

// Actualiza usuario (metadatos y/o password)
r.patch(
    '/:id',
    requireAuth,
    requireRole('admin', 'global'),
    C.update
)

// Soft delete
r.delete(
    '/:id',
    requireAuth,
    requireRole('admin', 'global'),
    C.remove
)

// Reset/cambio de contraseña por admin
// Body: { password, mustChangePassword? }
r.post(
    '/:id/password',
    requireAuth,
    requireRole('admin', 'global'),
    C.setPassword
)

export default r
