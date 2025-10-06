// // -----------------------------------------------------------------------------
// // Autenticación (Local + Microsoft Entra ID / Azure AD)
// // FleetCore Suite — versión con soporte multi-tenant y validación de dominio CBS
// // -----------------------------------------------------------------------------
// //
// // Requiere .env con:
// //   CLIENT_URL=http://localhost:5173
// //   JWT_SECRET=change_me
// //   AZURE_TENANT_ID=common
// //   AZURE_CLIENT_ID=tu_client_id
// //   AZURE_CLIENT_SECRET=tu_client_secret
// //   AZURE_REDIRECT_URI=http://localhost:5000/api/v1/auth/microsoft/callback
// //   ALLOWED_DOMAIN=cbs.cl
// //   AUTO_PROVISION=false
// //
// // Dependencias: bcrypt, jsonwebtoken, openid-client, cookie-parser, mongoose
// // -----------------------------------------------------------------------------

// import { Router } from 'express'
// import jwt from 'jsonwebtoken'
// import bcrypt from 'bcryptjs'
// import cookieParser from 'cookie-parser'
// import { Issuer, generators } from 'openid-client'
// import User from '../models/User.js'

// const r = Router()
// r.use(cookieParser())

// // --- Variables de entorno ---
// const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
// const ALLOWED_DOMAIN = (process.env.ALLOWED_DOMAIN || '').toLowerCase()
// const AUTO_PROVISION = String(process.env.AUTO_PROVISION || 'false').toLowerCase() === 'true'

// // -----------------------------------------------------------------------------
// // Helpers
// // -----------------------------------------------------------------------------
// function signToken(user) {
//   return jwt.sign(user, process.env.JWT_SECRET || 'change_me', { expiresIn: '2h' })
// }

// let oidcClient
// async function getOidcClient() {
//   if (oidcClient) return oidcClient
//   const tenant = process.env.AZURE_TENANT_ID
//   const clientId = process.env.AZURE_CLIENT_ID
//   const clientSecret = process.env.AZURE_CLIENT_SECRET
//   const redirectUri = process.env.AZURE_REDIRECT_URI

//   if (!tenant || !clientId || !clientSecret || !redirectUri) {
//     throw new Error('Faltan variables AZURE_* en .env')
//   }

//   const discoveryUrl = `https://login.microsoftonline.com/${tenant}/v2.0`
//   console.log('[auth] Descubriendo issuer:', discoveryUrl)
//   const issuer = await Issuer.discover(discoveryUrl)

//   oidcClient = new issuer.Client({
//     client_id: clientId,
//     client_secret: clientSecret,
//     redirect_uris: [redirectUri],
//     response_types: ['code'],
//   })
//   return oidcClient
// }

// // -----------------------------------------------------------------------------
// // Login local (admin o usuario base)
// // -----------------------------------------------------------------------------
// r.post('/login', async (req, res) => {
//   const { email, password } = req.body || {}
//   if (!email || !password)
//     return res.status(400).json({ message: 'Faltan credenciales' })

//    // normaliza email
//   const normEmail = String(email).trim().toLowerCase()

//    const userDoc = await User.findOne({ email: normEmail }).lean()
//   // const userDoc = await User.findOne({ email: email.toLowerCase() })
//   if (!userDoc) // 403 → existe el endpoint pero usuario no autorizado en DB
//     return res.status(403).json({ message: 'Usuario no autorizado o inexistente' })

//   if (userDoc.isActive === false)
//     return res.status(403).json({ message: 'Usuario desactivado' })

//    // Si el usuario no tiene password guardada (creado por Microsoft), forzamos 401 claro
//   if (!userDoc.password) {
//     return res.status(401).json({
//       message: 'Esta cuenta no tiene contraseña local. Ingrese con Microsoft o pida restablecer clave.'
//     })
//   }

//   // --- Comparar hash ---
//   const match = await bcrypt.compare(password, userDoc.password || '')
//   if (!match) return res.status(401).json({ message: 'Credenciales inválidas' })

//   // --- Generar token ---
//   const user = {
//     uid: String(userDoc._id),
//     email: userDoc.email,
//     name: userDoc.name,
//     roles: userDoc.roles || ['user'],
//     branchIds: userDoc.branchIds || [],
//   }
//   const token = signToken(user)
//   return res.json({ user, token })
// })

// // -----------------------------------------------------------------------------
// // Microsoft (OIDC + PKCE)
// // -----------------------------------------------------------------------------
// r.get('/microsoft', async (req, res, next) => {
//   try {
//     const client = await getOidcClient()
//     const code_verifier = generators.codeVerifier()
//     const code_challenge = generators.codeChallenge(code_verifier)

//     res.cookie('fc_pkce', code_verifier, {
//       httpOnly: true, sameSite: 'lax', secure: false, maxAge: 10 * 60 * 1000,
//     })

//     const authUrl = client.authorizationUrl({
//       scope: 'openid profile email offline_access',
//       code_challenge,
//       code_challenge_method: 'S256',
//       prompt: 'select_account',
//     })

//     return res.redirect(authUrl)
//   } catch (e) { next(e) }
// })

// // -----------------------------------------------------------------------------
// // Callback OIDC – multi-tenant + validación dominio CBS
// // -----------------------------------------------------------------------------
// r.get('/microsoft/callback', async (req, res, next) => {
//   try {
//     if (req.query?.error) {
//       const err = String(req.query.error)
//       console.warn('[auth] OIDC error:', err)
//       res.clearCookie('fc_pkce')
//       return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent(err)}`)
//     }

//     const client = await getOidcClient()
//     const code_verifier = req.cookies?.fc_pkce
//     if (!code_verifier) return res.status(400).send('PKCE perdido')

//     const params = client.callbackParams(req)
//     const tokenSet = await client.callback(process.env.AZURE_REDIRECT_URI, params, { code_verifier })
//     const userinfo = await client.userinfo(tokenSet.access_token)

//     const email = (userinfo.email || userinfo.preferred_username || '').toLowerCase()

//     // Validar dominio permitido
//     if (ALLOWED_DOMAIN && !email.endsWith(`@${ALLOWED_DOMAIN}`)) {
//       res.clearCookie('fc_pkce')
//       return res.redirect(`${CLIENT_URL}/login?error=domain_not_allowed`)
//     }

//     // Buscar o crear usuario
//     let userDoc = await User.findOne({ email })
//     if (!userDoc && AUTO_PROVISION) {
//       userDoc = await User.create({
//         email,
//         name: userinfo.name || email,
//         roles: ['user'],
//         isActive: true,
//         providers: { microsoft: { sub: userinfo.sub } },
//       })
//     } else if (!userDoc) {
//       res.clearCookie('fc_pkce')
//       return res.redirect(`${CLIENT_URL}/login?error=user_not_found`)
//     }

//     const user = {
//       uid: String(userDoc._id),
//       email: userDoc.email,
//       name: userDoc.name,
//       roles: userDoc.roles || ['user'],
//     }

//     const token = signToken(user)
//     res.clearCookie('fc_pkce')
//     res.cookie('fc_token', token, {
//       httpOnly: true, sameSite: 'lax', secure: false, maxAge: 2 * 60 * 60 * 1000,
//     })

//     return res.redirect(`${CLIENT_URL}/dashboard`)
//   } catch (e) {
//     console.error('[auth] callback error:', e.message)
//     res.clearCookie('fc_pkce')
//     return res.redirect(`${CLIENT_URL}/login?error=oidc_error`)
//   }
// })

// // -----------------------------------------------------------------------------
// // /me → Devuelve usuario autenticado (cookie o Bearer)
// // -----------------------------------------------------------------------------
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

// // -----------------------------------------------------------------------------
// // Logout
// // -----------------------------------------------------------------------------
// r.post('/logout', (req, res) => {
//   res.clearCookie('fc_token')
//   return res.json({ ok: true })
// })

// export default r
// -----------------------------------------------------------------------------
// FleetCore Suite - Autenticación (Local + Microsoft Entra ID / Azure AD)
// Versión: 2025-10-06
// -----------------------------------------------------------------------------
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'
import { Issuer, generators } from 'openid-client'
import User from '../models/User.js'

const r = Router()
r.use(cookieParser())

// --- Variables de entorno ---
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
const ALLOWED_DOMAIN = (process.env.ALLOWED_DOMAIN || '').toLowerCase()
const AUTO_PROVISION = String(process.env.AUTO_PROVISION || 'false').toLowerCase() === 'true'

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// LOGIN LOCAL (para cuentas con contraseña encriptada en local.passwordHash)
// -----------------------------------------------------------------------------
r.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password)
    return res.status(400).json({ message: 'Faltan credenciales' })

  const normEmail = String(email).trim().toLowerCase()
  const userDoc = await User.findOne({ email: normEmail })
  if (!userDoc)
    return res.status(403).json({ message: 'Usuario no autorizado o inexistente' })

  if (!userDoc.isActive)
    return res.status(403).json({ message: 'Usuario desactivado' })

  // ⚠️ Verificar si la cuenta tiene login local habilitado
  if (!userDoc.local?.allowLocalLogin)
    return res.status(401).json({
      message: 'Esta cuenta no permite login local. Use Microsoft o contacte al administrador.'
    })

  // ⚠️ Si no existe passwordHash => fue creada por Microsoft
  if (!userDoc.local?.passwordHash)
    return res.status(401).json({
      message: 'Esta cuenta no tiene contraseña local. Ingrese con Microsoft o pida restablecer clave.'
    })

  // --- Comparar hash ---
  const match = await bcrypt.compare(password, userDoc.local.passwordHash)
  if (!match)
    return res.status(401).json({ message: 'Credenciales inválidas' })

  // --- Generar token ---
  const user = {
    uid: String(userDoc._id),
    email: userDoc.email,
    name: userDoc.name,
    roles: userDoc.roles || ['user'],
    branchIds: userDoc.branchIds || [],
  }
  const token = signToken(user)
  return res.json({ user, token })
})

// -----------------------------------------------------------------------------
// MICROSOFT (OIDC + PKCE)
// -----------------------------------------------------------------------------
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
      prompt: 'select_account',
    })

    return res.redirect(authUrl)
  } catch (e) { next(e) }
})

// -----------------------------------------------------------------------------
// CALLBACK OIDC – MULTI-TENANT + VALIDACIÓN DOMINIO CBS
// -----------------------------------------------------------------------------
r.get('/microsoft/callback', async (req, res, next) => {
  try {
    if (req.query?.error) {
      const err = String(req.query.error)
      console.warn('[auth] OIDC error:', err)
      res.clearCookie('fc_pkce')
      return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent(err)}`)
    }

    const client = await getOidcClient()
    const code_verifier = req.cookies?.fc_pkce
    if (!code_verifier) return res.status(400).send('PKCE perdido')

    const params = client.callbackParams(req)
    const tokenSet = await client.callback(process.env.AZURE_REDIRECT_URI, params, { code_verifier })
    const userinfo = await client.userinfo(tokenSet.access_token)

    const email = (userinfo.email || userinfo.preferred_username || '').toLowerCase()

    if (ALLOWED_DOMAIN && !email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      res.clearCookie('fc_pkce')
      return res.redirect(`${CLIENT_URL}/login?error=domain_not_allowed`)
    }

    let userDoc = await User.findOne({ email })
    if (!userDoc && AUTO_PROVISION) {
      userDoc = await User.create({
        email,
        name: userinfo.name || email,
        roles: ['user'],
        isActive: true,
        providers: { microsoft: { sub: userinfo.sub } },
      })
    } else if (!userDoc) {
      res.clearCookie('fc_pkce')
      return res.redirect(`${CLIENT_URL}/login?error=user_not_found`)
    }

    const user = {
      uid: String(userDoc._id),
      email: userDoc.email,
      name: userDoc.name,
      roles: userDoc.roles || ['user'],
    }

    const token = signToken(user)
    res.clearCookie('fc_pkce')
    res.cookie('fc_token', token, {
      httpOnly: true, sameSite: 'lax', secure: false, maxAge: 2 * 60 * 60 * 1000,
    })

    return res.redirect(`${CLIENT_URL}/dashboard`)
  } catch (e) {
    console.error('[auth] callback error:', e.message)
    res.clearCookie('fc_pkce')
    return res.redirect(`${CLIENT_URL}/login?error=oidc_error`)
  }
})

// -----------------------------------------------------------------------------
// /me → Devuelve usuario autenticado (cookie o Bearer)
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// LOGOUT
// -----------------------------------------------------------------------------
r.post('/logout', (req, res) => {
  res.clearCookie('fc_token')
  return res.json({ ok: true })
})

export default r
