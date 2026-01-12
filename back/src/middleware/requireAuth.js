// // back/src/middleware/requireAuth.js
// import jwt from 'jsonwebtoken'

// export function requireAuth(req, res, next) {
//   const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/,'')
//   const token = req.cookies?.fc_token || bearer
//   if (!token) return res.status(401).json({ message: 'No autenticado' })
//   try {
//     const user = jwt.verify(token, process.env.JWT_SECRET || 'change_me')
//     req.user = user
//     next()
//   } catch {
//     return res.status(401).json({ message: 'Token inválido' })
//   }
// }

// //V.2
// /**
//  * Middleware requireAuth
//  * - Lee JWT desde cookie httpOnly 'fc_token' o Authorization: Bearer <token>
//  * - Si es válido, adjunta req.user y continúa; si no, 401
//  */
// import jwt from 'jsonwebtoken'

// export function requireAuth(req, res, next) {
//   const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/, '')
//   const token = req.cookies?.fc_token || bearer
//   if (!token) return res.status(401).json({ message: 'No autenticado' })
//   try {
//     const user = jwt.verify(token, process.env.JWT_SECRET || 'change_me')
//     req.user = user
//     next()
//   } catch {
//     return res.status(401).json({ message: 'Token inválido' })
//   }
// }

// back/src/middleware/requireAuth.js
// -----------------------------------------------------------------------------
// Compat wrapper.
// La implementación canónica de auth (requireAuth/optionalAuth) vive en
// middleware/auth.js. Mantener este archivo evita romper imports existentes.
// -----------------------------------------------------------------------------

export { requireAuth, optionalAuth } from './auth.js'
