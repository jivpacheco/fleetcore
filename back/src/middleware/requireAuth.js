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

/**
 * Middleware requireAuth
 * - Lee JWT desde cookie httpOnly 'fc_token' o Authorization: Bearer <token>
 * - Si es válido, adjunta req.user y continúa; si no, 401
 */
import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/, '')
  const token = req.cookies?.fc_token || bearer
  if (!token) return res.status(401).json({ message: 'No autenticado' })
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'change_me')
    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Token inválido' })
  }
}
