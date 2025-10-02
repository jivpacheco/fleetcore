


/**
 * Autenticación (Local + Microsoft Entra ID con OpenID Connect + PKCE)
 *
 * Endpoints:
 *  - POST /api/v1/auth/login                 → login local DEMO (password "admin")
 *  - GET  /api/v1/auth/microsoft             → inicia flujo OIDC con PKCE (redirige a Microsoft)
 *  - GET  /api/v1/auth/microsoft/callback    → callback OIDC, emite JWT y setea cookie httpOnly
 *  - GET  /api/v1/auth/me                    → devuelve usuario autenticado (cookie o Bearer)
 *  - POST /api/v1/auth/logout                → limpia cookie de sesión
 *
 * Requiere variables .env:
 *   CLIENT_URL=http://localhost:5173
 *   JWT_SECRET=change_me
 *   AZURE_TENANT_ID=<tenant_id>
 *   AZURE_CLIENT_ID=<client_id>
 *   AZURE_CLIENT_SECRET=<client_secret>
 *   AZURE_REDIRECT_URI=http://localhost:5000/api/v1/auth/microsoft/callback
 *
 * Notas:
 *  - Esta versión está pensada para openid-client v5.x (API con Issuer/generators).
 *  - En desarrollo, 'secure:false' en cookies. En producción (HTTPS), poner secure:true.
 */

import { Router } from 'express'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { Issuer, generators } from 'openid-client'

// IMPORTA TU MODELO DE USUARIO (ajusta la ruta real)
import User from '../models/User.js'

const r = Router()
r.use(cookieParser())

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
const ALLOWED_DOMAIN = (process.env.ALLOWED_DOMAIN || '').toLowerCase() // ej. cbs.cl
const AUTO_PROVISION = String(process.env.AUTO_PROVISION || 'false').toLowerCase() === 'true'

// ---------- helpers ----------
function signToken(user) {
  return jwt.sign(user, process.env.JWT_SECRET || 'change_me', { expiresIn: '2h' })
}

let oidcClient
async function getOidcClient() {
  if (oidcClient) return oidcClient

  const tenant = process.env.AZURE_TENANT_ID
  const clientId = process.env.AZURE_CLIENT_ID
  const clientSecret = process.env.AZURE_CLIENT_SECRET
  const redirectUri = process.env.AZURE_REDIRECT_URI

  if (!tenant || !clientId || !clientSecret || !redirectUri) {
    throw new Error('Faltan variables AZURE_* en .env')
  }

  const discoveryUrl = `https://login.microsoftonline.com/${tenant}/v2.0`
  console.log('[auth] Descubriendo issuer:', discoveryUrl)
  const issuer = await Issuer.discover(discoveryUrl)

  oidcClient = new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [redirectUri],
    response_types: ['code'],
  })
  return oidcClient
}

// ---------- rutas ----------

// Login local DEMO
r.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ message: 'Faltan credenciales' })
  if (password !== 'admin') return res.status(401).json({ message: 'Credenciales inválidas' })

  // ↓↓↓ Unificación de identidad: buscamos el mismo email en DB
  const existing = await User.findOne({ email: email.toLowerCase() }).lean()
  if (!existing) {
    return res.status(403).json({ message: 'Usuario no autorizado. Pide alta al administrador.' })
  }
  if (existing.isActive === false) {
    return res.status(403).json({ message: 'Usuario desactivado. Contacta al administrador.' })
  }

  const user = {
    uid: String(existing._id),
    email: existing.email,
    name: existing.name,
    roles: existing.roles || ['user'],
    branchIds: existing.branchIds || [],
  }
  const token = signToken(user)
  return res.json({ user, token })
})

// Microsoft (OIDC + PKCE) – con prompt: 'select_account' para forzar selector
r.get('/microsoft', async (req, res, next) => {
  try {
    const client = await getOidcClient()
    const code_verifier = generators.codeVerifier()
    const code_challenge = generators.codeChallenge(code_verifier)

    res.cookie('fc_pkce', code_verifier, {
      httpOnly: true, sameSite: 'lax', secure: false, maxAge: 10 * 60 * 1000,
    })

    const authUrl = client.authorizationUrl({
      scope: 'openid profile email offline_access',
      code_challenge,
      code_challenge_method: 'S256',
      prompt: 'select_account', // ← fuerza selector de cuenta y evita “enganche” de sesión previa
    })

    return res.redirect(authUrl)
  } catch (e) { next(e) }
})

// Callback – maneja errores de Azure, valida dominio y existencia en DB
r.get('/microsoft/callback', async (req, res, next) => {
  try {
    // 1) ¿Azure nos devolvió error? (ej. consent_required, access_denied, login_required)
    if (req.query?.error) {
      const err = String(req.query.error)
      const desc = String(req.query.error_description || '')
      console.warn('[auth] OIDC error de Azure:', err, desc)
      // Limpia PKCE
      res.clearCookie('fc_pkce')
      // Redirige a login con mensaje legible
      return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent(err)}`)
    }

    const client = await getOidcClient()
    const code_verifier = req.cookies?.fc_pkce
    if (!code_verifier) return res.status(400).send('PKCE verifier perdido')

    const params = client.callbackParams(req)
    const tokenSet = await client.callback(process.env.AZURE_REDIRECT_URI, params, { code_verifier })

    // 2) userinfo
    const userinfo = await client.userinfo(tokenSet.access_token)
    const email = (userinfo.email || userinfo.preferred_username || '').toLowerCase()

    // 3) restricción de dominio
    if (ALLOWED_DOMAIN && !email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      res.clearCookie('fc_pkce')
      return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent('domain_not_allowed')}`)
    }

    // 4) buscar usuario en DB por email (unificación identidad)
    let userDoc = await User.findOne({ email })
    if (!userDoc) {
      if (!AUTO_PROVISION) {
        res.clearCookie('fc_pkce')
        return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent('user_not_found')}`)
      }
      // Auto-provisión opcional (si decidieras activarlo)
      userDoc = await User.create({
        email,
        name: userinfo.name || email,
        roles: ['user'],
        branchIds: [],
        isActive: true,
        providers: { microsoft: { sub: userinfo.sub } },
      })
    } else if (userDoc.isActive === false) {
      res.clearCookie('fc_pkce')
      return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent('user_inactive')}`)
    } else {
      // Actualiza marca de Microsoft si no existe
      if (!userDoc.providers) userDoc.providers = {}
      if (!userDoc.providers.microsoft) userDoc.providers.microsoft = {}
      userDoc.providers.microsoft.sub = userinfo.sub
      await userDoc.save()
    }

    // 5) token propio
    const user = {
      uid: String(userDoc._id),
      email: userDoc.email,
      name: userDoc.name,
      roles: userDoc.roles || ['user'],
      branchIds: userDoc.branchIds || [],
    }
    const token = signToken(user)

    // 6) sesión cookie + limpiar PKCE
    res.clearCookie('fc_pkce')
    res.cookie('fc_token', token, {
      httpOnly: true, sameSite: 'lax', secure: false, maxAge: 2 * 60 * 60 * 1000,
    })

    return res.redirect(`${CLIENT_URL}/dashboard`)
  } catch (e) {
    // Errores de OIDC (incl. consent_required si llegó hasta callback y falló)
    console.error('[auth] callback error:', e?.message || e)
    res.clearCookie('fc_pkce')
    // Redirige a login con código genérico u OPError.code si existe
    const code = e?.error || e?.name || 'oidc_error'
    return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent(code)}`)
  }
})

// Sesión actual
r.get('/me', (req, res) => {
  const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/, '')
  const token = req.cookies?.fc_token || bearer
  if (!token) return res.status(401).json({ message: 'No autenticado' })
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'change_me')
    return res.json({ user })
  } catch {
    return res.status(401).json({ message: 'Token inválido' })
  }
})

// Logout
r.post('/logout', (req, res) => {
  res.clearCookie('fc_token')
  return res.json({ ok: true })
})

export default r


// import { Router } from 'express'
// import jwt from 'jsonwebtoken'
// import cookieParser from 'cookie-parser'
// import { Issuer, generators } from 'openid-client'   // ← v5: named exports

// const r = Router()
// r.use(cookieParser())

// // ------------------------------------------------------
// // Helpers
// // ------------------------------------------------------

// /**
//  * Firma un JWT con los campos que requiere la app.
//  * Ajusta roles/branchIds según tus reglas de negocio.
//  */
// function signToken(user) {
//   return jwt.sign(user, process.env.JWT_SECRET || 'change_me', { expiresIn: '2h' })
// }

// /**
//  * Construye y memoiza el cliente OIDC de Microsoft Entra ID.
//  * - Descubre metadata del issuer usando el tenant de Azure.
//  * - Crea un client con client_id/secret/redirect_uris.
//  */
// let oidcClient
// async function getOidcClient() {
//   if (oidcClient) return oidcClient

//   // Validaciones de entorno
//   const tenant = process.env.AZURE_TENANT_ID
//   const clientId = process.env.AZURE_CLIENT_ID
//   const clientSecret = process.env.AZURE_CLIENT_SECRET
//   const redirectUri = process.env.AZURE_REDIRECT_URI

//   if (!tenant) throw new Error('Falta AZURE_TENANT_ID en .env')
//   if (!clientId) throw new Error('Falta AZURE_CLIENT_ID en .env')
//   if (!clientSecret) throw new Error('Falta AZURE_CLIENT_SECRET en .env')
//   if (!redirectUri) throw new Error('Falta AZURE_REDIRECT_URI en .env')

//   // Descubrimiento OIDC (issuer de Microsoft para tu tenant)
//   const discoveryUrl = `https://login.microsoftonline.com/${tenant}/v2.0`
//   console.log('[auth] Descubriendo issuer:', discoveryUrl)
//   const issuer = await Issuer.discover(discoveryUrl)

//   // Cliente OIDC
//   oidcClient = new issuer.Client({
//     client_id: clientId,
//     client_secret: clientSecret,
//     redirect_uris: [redirectUri],
//     response_types: ['code'],
//   })

//   return oidcClient
// }

// // ------------------------------------------------------
// // Rutas
// // ------------------------------------------------------

// /**
//  * POST /login
//  * - DEMO: acepta cualquier email con password === "admin".
//  * - Sustituir por lógica real: buscar usuario en Mongo + bcrypt.compare + emitir JWT.
//  */
// r.post('/login', async (req, res) => {
//   const { email, password } = req.body || {}
//   if (!email || !password) {
//     return res.status(400).json({ message: 'Faltan credenciales' })
//   }
//   if (password !== 'admin') {
//     return res.status(401).json({ message: 'Credenciales inválidas' })
//   }

//   // Usuario mínimo (ajusta roles/branchIds según tu necesidad)
//   const user = {
//     uid: 'u_demo_1',
//     email,
//     roles: ['global'],  // 'global' ve todo; si lo quitas, branchScope restringe
//     branchIds: [],      // p.ej. ['<id-branch-1>']
//   }

//   const token = signToken(user)
//   return res.json({ user, token })
// })

// /**
//  * GET /microsoft
//  * - Inicia login con Microsoft usando OIDC + PKCE.
//  * - Genera code_verifier y code_challenge; guarda el verifier en cookie httpOnly temporal.
//  * - Redirige a la página de login de Microsoft.
//  */
// r.get('/microsoft', async (req, res, next) => {
//   try {
//     const client = await getOidcClient()

//     // PKCE
//     const code_verifier = generators.codeVerifier()
//     const code_challenge = generators.codeChallenge(code_verifier)

//     // Guardar verifier en cookie httpOnly (válida por 10 min)
//     res.cookie('fc_pkce', code_verifier, {
//       httpOnly: true,
//       sameSite: 'lax',
//       secure: false,            // prod (HTTPS): true
//       maxAge: 10 * 60 * 1000,
//     })

//     // URL de autorización con PKCE
//     const authUrl = client.authorizationUrl({
//       scope: 'openid profile email offline_access',
//       code_challenge,
//       code_challenge_method: 'S256',
//     })

//     return res.redirect(authUrl)
//   } catch (e) { next(e) }
// })

// /**
//  * GET /microsoft/callback
//  * - Microsoft redirige aquí con "code".
//  * - Canjeamos code + code_verifier → tokenSet, pedimos userinfo, mapeamos usuario, firmamos JWT.
//  * - Guardamos cookie httpOnly 'fc_token' con el JWT, y redirigimos al frontend (/dashboard).
//  */
// r.get('/microsoft/callback', async (req, res, next) => {
//   try {
//     const client = await getOidcClient()

//     // Recuperar verifier desde cookie
//     const code_verifier = req.cookies?.fc_pkce
//     if (!code_verifier) return res.status(400).send('PKCE verifier perdido')

//     // Extraer parámetros desde la request (code, state, etc.)
//     const params = client.callbackParams(req)

//     // Intercambiar code por tokens (usa el verifier)
//     const tokenSet = await client.callback(process.env.AZURE_REDIRECT_URI, params, { code_verifier })

//     // Obtener perfil del usuario
//     const userinfo = await client.userinfo(tokenSet.access_token)
//     const email = userinfo.email || userinfo.preferred_username

//     // Mapeo a tu modelo de usuario (roles/branchIds según tus reglas de negocio)
//     const user = {
//       uid: userinfo.sub,
//       email,
//       name: userinfo.name,
//       roles: ['user'],  // cambia a ['global'] si debe ver todo
//       branchIds: [],
//     }

//     const token = signToken(user)

//     // Limpiar PKCE y setear cookie de sesión (JWT)
//     res.clearCookie('fc_pkce')
//     res.cookie('fc_token', token, {
//       httpOnly: true,
//       sameSite: 'lax',
//       secure: false, // prod: true con HTTPS
//       maxAge: 2 * 60 * 60 * 1000, // 2h
//     })

//     // Redirigir al frontend (dashboard)
//     const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
//     return res.redirect(`${clientUrl}/dashboard`)
//   } catch (e) { next(e) }
// })

// /**
//  * GET /me
//  * - Devuelve el usuario autenticado leyendo:
//  *   1) Cookie httpOnly 'fc_token', o
//  *   2) Authorization: Bearer <token>
//  */
// r.get('/me', (req, res) => {
//   const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/, '')
//   const token = req.cookies?.fc_token || bearer
//   if (!token) return res.status(401).json({ message: 'No autenticado' })
//   try {
//     const user = jwt.verify(token, process.env.JWT_SECRET || 'change_me')
//     return res.json({ user })
//   } catch {
//     return res.status(401).json({ message: 'Token inválido' })
//   }
// })

// /**
//  * POST /logout
//  * - Limpia la cookie httpOnly con el JWT.
//  */
// r.post('/logout', (req, res) => {
//   res.clearCookie('fc_token')
//   return res.json({ ok: true })
// })

// export default r




// /**
//  * Autenticación (Local + Microsoft Entra ID con OpenID Connect + PKCE)
//  *
//  * Endpoints:
//  *  - POST /api/v1/auth/login            → login local DEMO (password "admin")
//  *  - GET  /api/v1/auth/microsoft        → inicia flujo OIDC con PKCE
//  *  - GET  /api/v1/auth/microsoft/callback → callback OIDC, emite JWT y setea cookie httpOnly
//  *  - GET  /api/v1/auth/me               → devuelve usuario autenticado (cookie o Bearer)
//  *  - POST /api/v1/auth/logout           → limpia cookie de sesión
//  *
//  * Requiere .env:
//  *   CLIENT_URL=http://localhost:5173
//  *   JWT_SECRET=change_me
//  *   AZURE_TENANT_ID=<tenant_id>
//  *   AZURE_CLIENT_ID=<client_id>
//  *   AZURE_CLIENT_SECRET=<client_secret>
//  *   AZURE_REDIRECT_URI=http://localhost:5000/api/v1/auth/microsoft/callback
//  */

// import { Router } from 'express'
// import jwt from 'jsonwebtoken'
// import cookieParser from 'cookie-parser'

// const r = Router()
// r.use(cookieParser())

// // ---------- Helpers ----------
// function signToken(user) {
//   return jwt.sign(user, process.env.JWT_SECRET || 'change_me', { expiresIn: '2h' })
// }

// /**
//  * Carga robusta de openid-client con import dinámico (compatible con v5/v6 y ESM/CJS interop).
//  * Evita problemas cuando hay mezclas de imports o resoluciones raras en runtime.
//  */
// let oidcClient
// let oidcGenerators // { codeVerifier, codeChallenge }
// async function getOidcClient() {
//   if (oidcClient) return oidcClient

//   // Validaciones de entorno obligatorias
//   const tenant = process.env.AZURE_TENANT_ID
//   const clientId = process.env.AZURE_CLIENT_ID
//   const clientSecret = process.env.AZURE_CLIENT_SECRET
//   const redirectUri = process.env.AZURE_REDIRECT_URI
//   if (!tenant) throw new Error('Falta AZURE_TENANT_ID en .env')
//   if (!clientId) throw new Error('Falta AZURE_CLIENT_ID en .env')
//   if (!clientSecret) throw new Error('Falta AZURE_CLIENT_SECRET en .env')
//   if (!redirectUri) throw new Error('Falta AZURE_REDIRECT_URI en .env')

//   // Carga dinámica del módulo
//   const mod = await import('openid-client')
//   const Issuer = mod.Issuer ?? mod.default?.Issuer
//   const generators = mod.generators ?? mod.default?.generators

//   if (!Issuer || typeof Issuer.discover !== 'function') {
//     console.error('[auth] openid-client inválido. keys:', Object.keys(mod))
//     throw new Error('openid-client mal importado: Issuer.discover no existe')
//   }
//   if (!generators?.codeVerifier || !generators?.codeChallenge) {
//     console.error('[auth] generators no disponible. keys:', Object.keys(mod))
//     throw new Error('openid-client mal importado: generators no existe')
//   }

//   // Descubrimiento del issuer
//   const discoveryUrl = `https://login.microsoftonline.com/${tenant}/v2.0`
//   console.log('[auth] Descubriendo issuer:', discoveryUrl)
//   const issuer = await Issuer.discover(discoveryUrl)

//   // Cliente OIDC
//   oidcClient = new issuer.Client({
//     client_id: clientId,
//     client_secret: clientSecret,
//     redirect_uris: [redirectUri],
//     response_types: ['code'],
//   })

//   oidcGenerators = generators
//   return oidcClient
// }

// // ---------- Rutas ----------

// /**
//  * Login local DEMO
//  * - Para pruebas iniciales: password "admin"
//  * - Sustituir por: búsqueda Mongo + bcrypt.compare + emisión de JWT
//  */
// r.post('/login', async (req, res) => {
//   const { email, password } = req.body || {}
//   if (!email || !password) {
//     return res.status(400).json({ message: 'Faltan credenciales' })
//   }
//   if (password !== 'admin') {
//     return res.status(401).json({ message: 'Credenciales inválidas' })
//   }

//   const user = {
//     uid: 'u_demo_1',
//     email,
//     roles: ['global'], // 'global' ve todo; si no quieres, usa ['user']
//     branchIds: [],
//   }
//   const token = signToken(user)
//   return res.json({ user, token })
// })

// /**
//  * Inicia login con Microsoft (OIDC + PKCE)
//  */
// r.get('/microsoft', async (req, res, next) => {
//   try {
//     const client = await getOidcClient()
//     const { codeVerifier, codeChallenge } = oidcGenerators

//     const code_verifier = codeVerifier()
//     const code_challenge = codeChallenge(code_verifier)

//     // Guarda verifier en cookie httpOnly temporal
//     res.cookie('fc_pkce', code_verifier, {
//       httpOnly: true,
//       sameSite: 'lax',
//       secure: false, // producción: true (HTTPS)
//       maxAge: 10 * 60 * 1000,
//     })

//     const authUrl = client.authorizationUrl({
//       scope: 'openid profile email offline_access',
//       code_challenge,
//       code_challenge_method: 'S256',
//     })

//     return res.redirect(authUrl)
//   } catch (e) { next(e) }
// })

// /**
//  * Callback de Microsoft → canjea code, obtiene userinfo y firma JWT
//  */
// r.get('/microsoft/callback', async (req, res, next) => {
//   try {
//     const client = await getOidcClient()
//     const code_verifier = req.cookies?.fc_pkce
//     if (!code_verifier) return res.status(400).send('PKCE verifier perdido')

//     const params = client.callbackParams(req)
//     const tokenSet = await client.callback(process.env.AZURE_REDIRECT_URI, params, { code_verifier })

//     const userinfo = await client.userinfo(tokenSet.access_token)
//     const email = userinfo.email || userinfo.preferred_username

//     // Mapea a tu modelo (roles/branchIds según grupos/claims si corresponde)
//     const user = {
//       uid: userinfo.sub,
//       email,
//       name: userinfo.name,
//       roles: ['user'],  // pon 'global' si ese usuario debe ver todo
//       branchIds: [],
//     }

//     const token = signToken(user)

//     // Limpia PKCE y setea cookie de sesión
//     res.clearCookie('fc_pkce')
//     res.cookie('fc_token', token, {
//       httpOnly: true,
//       sameSite: 'lax',
//       secure: false, // producción: true con HTTPS
//       maxAge: 2 * 60 * 60 * 1000,
//     })

//     const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
//     return res.redirect(`${clientUrl}/dashboard`)
//   } catch (e) { next(e) }
// })

// /**
//  * Información del usuario autenticado
//  * - Lee cookie httpOnly 'fc_token' o Authorization: Bearer
//  */
// r.get('/me', (req, res) => {
//   const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/, '')
//   const token = req.cookies?.fc_token || bearer
//   if (!token) return res.status(401).json({ message: 'No autenticado' })
//   try {
//     const user = jwt.verify(token, process.env.JWT_SECRET || 'change_me')
//     return res.json({ user })
//   } catch {
//     return res.status(401).json({ message: 'Token inválido' })
//   }
// })

// /**
//  * Logout → limpia cookie
//  */
// r.post('/logout', (req, res) => {
//   res.clearCookie('fc_token')
//   return res.json({ ok: true })
// })

// export default r


// // // import { Router } from 'express'
// // // import jwt from 'jsonwebtoken'
// // // import { Issuer, generators } from 'openid-client'
// // // import * as openid from 'openid-client'
// // // const { Issuer, generators } = openid

// // /**
// //  * Rutas de Autenticación (Local + Microsoft Entra ID con OpenID Connect + PKCE)
// //  * - /login (POST): login local DEMO (password "admin"). Sustituir por tu lógica real (bcrypt).
// //  * - /microsoft (GET): inicia flujo OIDC con PKCE hacia Microsoft.
// //  * - /microsoft/callback (GET): callback de Microsoft, firma JWT y setea cookie httpOnly.
// //  * - /me (GET): devuelve el usuario autenticado desde cookie o Bearer.
// //  * - /logout (POST): limpia cookie.
// //  *
// //  * Requiere variables en .env:
// //  *   CLIENT_URL=http://localhost:5173
// //  *   JWT_SECRET=change_me
// //  *   AZURE_TENANT_ID=<tu_tenant_id>
// //  *   AZURE_CLIENT_ID=<tu_client_id>
// //  *   AZURE_CLIENT_SECRET=<tu_client_secret>
// //  *   AZURE_REDIRECT_URI=http://localhost:5000/api/v1/auth/microsoft/callback
// //  */

// // import { Router } from 'express'
// // import jwt from 'jsonwebtoken'
// // import cookieParser from 'cookie-parser'
// // // import openid from 'openid-client' // v6: import default y desestructurar
// // // import * as openid from 'openid-client'
// // // const { Issuer, generators } = openid
// // import { Issuer, generators } from 'openid-client'  // <- ÚNICO import del paquete

// // const r = Router()

// // // Asegura que cookie-parser esté montado (por si app.js no lo tiene antes de las rutas)
// // r.use(cookieParser())

// // /**
// //  * Helper: firma un JWT con los campos que necesita tu app.
// //  * Ajusta roles/branchIds según tus reglas de negocio o mapeo desde Azure.
// //  */
// // function signToken(user) {
// //   return jwt.sign(user, process.env.JWT_SECRET || 'change_me', { expiresIn: '2h' })
// // }

// // /**
// //  * LOGIN LOCAL (DEMO)
// //  * - Para pruebas iniciales: acepta cualquier email y password === "admin".
// //  * - Sustituye por: búsqueda de usuario en Mongo + bcrypt.compare + emisión de JWT.
// //  */
// // r.post('/login', async (req, res) => {
// //   const { email, password } = req.body || {}
// //   if (!email || !password) {
// //     return res.status(400).json({ message: 'Faltan credenciales' })
// //   }
// //   if (password !== 'admin') {
// //     return res.status(401).json({ message: 'Credenciales inválidas' })
// //   }

// //   // Usuario mínimo (ajusta roles/branchIds según tu necesidad)
// //   const user = {
// //     uid: 'u_demo_1',
// //     email,
// //     roles: ['global'],  // 'global' ve todo; si lo quitas, branchScope restringe
// //     branchIds: [],      // ej. ['<id-branch-1>']
// //   }
// //   const token = signToken(user)
// //   return res.json({ user, token })
// // })

// // /**
// //  * Cliente OIDC (Entra ID)
// //  * Descubre el issuer en base al tenant y construye cliente.
// //  */
// // let oidcClient
// // async function getOidcClient() {
// //   if (oidcClient) return oidcClient
// //   const tenant = process.env.AZURE_TENANT_ID
// //   const issuer = await Issuer.discover(`https://login.microsoftonline.com/${tenant}/v2.0`)
// //   oidcClient = new issuer.Client({
// //     client_id: process.env.AZURE_CLIENT_ID,
// //     client_secret: process.env.AZURE_CLIENT_SECRET,
// //     redirect_uris: [process.env.AZURE_REDIRECT_URI],
// //     response_types: ['code'],
// //   })
// //   return oidcClient
// // }

// // /**
// //  * /microsoft → inicia auth OIDC con PKCE
// //  * - Crea code_verifier/challenge y los guarda temporalmente vía cookie httpOnly.
// //  */
// // r.get('/microsoft', async (req, res, next) => {
// //   try {
// //     const client = await getOidcClient()
// //     const code_verifier = generators.codeVerifier()
// //     const code_challenge = generators.codeChallenge(code_verifier)

// //     res.cookie('fc_pkce', code_verifier, {
// //       httpOnly: true,
// //       sameSite: 'lax',
// //       secure: false,        // en producción con HTTPS => true
// //       maxAge: 10 * 60 * 1000,
// //     })

// //     const authUrl = client.authorizationUrl({
// //       scope: 'openid profile email offline_access',
// //       code_challenge,
// //       code_challenge_method: 'S256',
// //     })

// //     return res.redirect(authUrl)
// //   } catch (e) { next(e) }
// // })

// // /**
// //  * /microsoft/callback → canjea code por tokens, obtiene userinfo y firma JWT propio
// //  * - Setea cookie httpOnly 'fc_token' para sesión basada en cookie (opción recomendada).
// //  */
// // r.get('/microsoft/callback', async (req, res, next) => {
// //   try {
// //     const client = await getOidcClient()
// //     const code_verifier = req.cookies?.fc_pkce
// //     if (!code_verifier) return res.status(400).send('PKCE verifier perdido')

// //     const params = client.callbackParams(req)
// //     const tokenSet = await client.callback(process.env.AZURE_REDIRECT_URI, params, { code_verifier })

// //     // Perfil del usuario
// //     const userinfo = await client.userinfo(tokenSet.access_token)
// //     const email = userinfo.email || userinfo.preferred_username

// //     // Mapea a tu modelo de usuario (roles/branchIds según grupos/claims si corresponde)
// //     const user = {
// //       uid: userinfo.sub,
// //       email,
// //       name: userinfo.name,
// //       roles: ['user'],  // cambia a ['global'] si ese usuario debe ver todo
// //       branchIds: [],
// //     }

// //     const token = signToken(user)

// //     // Limpia PKCE y setea cookie de sesión
// //     res.clearCookie('fc_pkce')
// //     res.cookie('fc_token', token, {
// //       httpOnly: true,
// //       sameSite: 'lax',
// //       secure: false, // producción: true con HTTPS
// //       maxAge: 2 * 60 * 60 * 1000,
// //     })

// //     const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
// //     return res.redirect(`${clientUrl}/dashboard`)
// //   } catch (e) { next(e) }
// // })

// // /**
// //  * /me → devuelve usuario autenticado desde cookie httpOnly o Authorization: Bearer
// //  */
// // r.get('/me', (req, res) => {
// //   const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/, '')
// //   const token = req.cookies?.fc_token || bearer
// //   if (!token) return res.status(401).json({ message: 'No autenticado' })
// //   try {
// //     const user = jwt.verify(token, process.env.JWT_SECRET || 'change_me')
// //     return res.json({ user })
// //   } catch {
// //     return res.status(401).json({ message: 'Token inválido' })
// //   }
// // })

// // /**
// //  * /logout → limpia cookie de sesión
// //  */
// // r.post('/logout', (req, res) => {
// //   res.clearCookie('fc_token')
// //   return res.json({ ok: true })
// // })

// // export default r
