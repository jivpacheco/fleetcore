// back/src/middleware/auth.js
//
// Autenticación por JWT (cookie httpOnly 'fc_token' o Authorization: Bearer)
// - requireAuth: exige token válido; pone req.user (payload del JWT)
// - optionalAuth: no exige, pero si hay token válido lo carga en req.user

import jwt from 'jsonwebtoken'

function getTokenFromReq(req) {
    const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
    const cookie = req.cookies?.fc_token
    return cookie || bearer || null
}

export function optionalAuth(req, res, next) {
    const token = getTokenFromReq(req)
    if (!token) return next()
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'change_me')
        req.user = payload
    } catch {
        // token inválido → seguir sin user
    }
    return next()
}

export function requireAuth(req, res, next) {
    const token = getTokenFromReq(req)
    if (!token) return res.status(401).json({ message: 'No autenticado' })
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'change_me')
        req.user = payload
        return next()
    } catch {
        return res.status(401).json({ message: 'Token inválido' })
    }
}
