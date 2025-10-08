// // back/src/routes/auth.routes.js
// // -----------------------------------------------------------------------------
// // Autenticación (Local + Microsoft Entra ID / Azure AD) con validación de dominio
// // - Login local usando password hash en user.local.passwordHash
// // - Microsoft OIDC (PKCE) multi-tenant (AZURE_TENANT_ID=common) + filtro por dominio
// // - Sesión vía cookie httpOnly (fc_token) + /me para rehidratar en el front
// //
// // .env requeridas:
// //   CLIENT_URL=http://localhost:5173
// //   JWT_SECRET=change_me
// //   AZURE_TENANT_ID=common
// //   AZURE_CLIENT_ID=<client_id>
// //   AZURE_CLIENT_SECRET=<client_secret>
// //   AZURE_REDIRECT_URI=http://localhost:5000/api/v1/auth/microsoft/callback
// //   ALLOWED_DOMAIN=cbs.cl
// //   AUTO_PROVISION=false
// //
// // Notas:
// // - En producción con HTTPS, poner secure:true en set-cookie de fc_token y fc_pkce.
// // -----------------------------------------------------------------------------
// import { Router } from 'express'
// import jwt from 'jsonwebtoken'
// import bcrypt from 'bcryptjs'
// import cookieParser from 'cookie-parser'
// import { Issuer, generators } from 'openid-client'
// import User from '../models/User.js'

// const r = Router()
// r.use(cookieParser())

// // --- ENV ---
// const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
// const ALLOWED_DOMAIN = (process.env.ALLOWED_DOMAIN || '').toLowerCase()
// const AUTO_PROVISION = String(process.env.AUTO_PROVISION || 'false').toLowerCase() === 'true'

// // --- helpers ---
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
// // POST /api/v1/auth/login  → login local
// // En DB debe existir el usuario y tener local.passwordHash (hash bcrypt) configurado.
// // -----------------------------------------------------------------------------
// r.post('/login', async (req, res) => {
//   let { email, password } = req.body || {}
//   if (!email || !password) {
//     return res.status(400).json({ message: 'Faltan credenciales' })
//   }

//   const normEmail = String(email).trim().toLowerCase()
//   password = String(password).trim()

//   const userDoc = await User.findOne({ email: normEmail })
//   if (!userDoc) {
//     return res.status(403).json({ message: 'Usuario no autorizado o inexistente' })
//   }
//   if (!userDoc.isActive) {
//     return res.status(403).json({ message: 'Usuario desactivado' })
//   }
//   if (!userDoc.local?.allowLocalLogin) {
//     return res.status(401).json({ message: 'Esta cuenta no permite login local. Use Microsoft o contacte al administrador.' })
//   }
//   if (!userDoc.local?.passwordHash) {
//     return res.status(401).json({ message: 'Esta cuenta no tiene contraseña local. Ingrese con Microsoft o solicite restablecer clave.' })
//   }

//   // Usa método del modelo si existe; sino compara directo
//   let ok = false
//   if (typeof userDoc.checkPassword === 'function') {
//     ok = await userDoc.checkPassword(password)
//   } else {
//     ok = await bcrypt.compare(password, userDoc.local.passwordHash)
//   }
//   if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' })

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
// // GET /api/v1/auth/microsoft  → inicia flujo OIDC (PKCE)
// // -----------------------------------------------------------------------------
// r.get('/microsoft', async (req, res, next) => {
//   try {
//     const client = await getOidcClient()
//     const code_verifier = generators.codeVerifier()
//     const code_challenge = generators.codeChallenge(code_verifier)

//     res.cookie('fc_pkce', code_verifier, {
//       httpOnly: true,
//       sameSite: 'lax',
//       secure: false, // PROD: true con HTTPS
//       maxAge: 10 * 60 * 1000,
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
// // GET /api/v1/auth/microsoft/callback  → canjea code, valida dominio, emite cookie
// // -----------------------------------------------------------------------------
// r.get('/microsoft/callback', async (req, res) => {
//   try {
//     if (req.query?.error) {
//       const err = String(req.query.error)
//       const desc = String(req.query.error_description || '')
//       console.warn('[auth] OIDC error:', err, desc)
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

//     if (ALLOWED_DOMAIN && !email.endsWith(`@${ALLOWED_DOMAIN}`)) {
//       res.clearCookie('fc_pkce')
//       return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent('domain_not_allowed')}`)
//     }

//     let userDoc = await User.findOne({ email })
//     if (!userDoc) {
//       if (!AUTO_PROVISION) {
//         res.clearCookie('fc_pkce')
//         return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent('user_not_found')}`)
//       }
//       userDoc = await User.create({
//         email,
//         name: userinfo.name || email,
//         roles: ['user'],
//         isActive: true,
//         providers: { microsoft: { sub: userinfo.sub } },
//       })
//     } else if (!userDoc.isActive) {
//       res.clearCookie('fc_pkce')
//       return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent('user_inactive')}`)
//     } else {
//       // guarda identificador microsoft si no existe
//       if (!userDoc.providers) userDoc.providers = {}
//       if (!userDoc.providers.microsoft) userDoc.providers.microsoft = {}
//       userDoc.providers.microsoft.sub = userinfo.sub
//       await userDoc.save()
//     }

//     const user = {
//       uid: String(userDoc._id),
//       email: userDoc.email,
//       name: userDoc.name,
//       roles: userDoc.roles || ['user'],
//       branchIds: userDoc.branchIds || [],
//     }
//     const token = signToken(user)

//     res.clearCookie('fc_pkce')
//     res.cookie('fc_token', token, {
//       httpOnly: true,
//       sameSite: 'lax',
//       secure: false, // PROD: true con HTTPS
//       maxAge: 2 * 60 * 60 * 1000,
//     })

//     return res.redirect(`${CLIENT_URL}/dashboard`)
//   } catch (e) {
//     console.error('[auth] callback error:', e?.message || e)
//     res.clearCookie('fc_pkce')
//     const code = e?.error || e?.name || 'oidc_error'
//     return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent(code)}`)
//   }
// })

// // -----------------------------------------------------------------------------
// // GET /api/v1/auth/me  → devuelve usuario a partir de cookie fc_token o Bearer
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
// // POST /api/v1/auth/logout  → limpia cookie de sesión
// // -----------------------------------------------------------------------------
// r.post('/logout', (req, res) => {
//   res.clearCookie('fc_token')
//   return res.json({ ok: true })
// })

// export default r

// back/src/routes/auth.routes.js
// -----------------------------------------------------------------------------
// Autenticación (Local + Microsoft Entra ID / Azure AD) con validación de dominio
// - Login local: ahora TAMBIÉN setea cookie httpOnly (fc_token) para persistir sesión
// - Microsoft OIDC (PKCE) multi-tenant (AZURE_TENANT_ID=common) + filtro por dominio
// - /me para rehidratar sesión tras refresh
//
// En PROD (HTTPS) cambia secure:false -> true en cookies.
// -----------------------------------------------------------------------------
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'
import { Issuer, generators } from 'openid-client'
import User from '../models/User.js'

const r = Router()
r.use(cookieParser())

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
const ALLOWED_DOMAIN = (process.env.ALLOWED_DOMAIN || '').toLowerCase()
const AUTO_PROVISION = String(process.env.AUTO_PROVISION || 'false').toLowerCase() === 'true'

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
// POST /api/v1/auth/login  → login local (ahora setea cookie httpOnly)
// -----------------------------------------------------------------------------
r.post('/login', async (req, res) => {
  let { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ message: 'Faltan credenciales' })
  }

  const normEmail = String(email).trim().toLowerCase()
  password = String(password).trim()

  const userDoc = await User.findOne({ email: normEmail })
  if (!userDoc) {
    return res.status(403).json({ message: 'Usuario no autorizado o inexistente' })
  }
  if (!userDoc.isActive) {
    return res.status(403).json({ message: 'Usuario desactivado' })
  }
  if (!userDoc.local?.allowLocalLogin) {
    return res.status(401).json({ message: 'Esta cuenta no permite login local. Use Microsoft o contacte al administrador.' })
  }
  if (!userDoc.local?.passwordHash) {
    return res.status(401).json({ message: 'Esta cuenta no tiene contraseña local. Ingrese con Microsoft o solicite restablecer clave.' })
  }

  const ok = typeof userDoc.checkPassword === 'function'
    ? await userDoc.checkPassword(password)
    : await bcrypt.compare(password, userDoc.local.passwordHash)

  if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' })

  const user = {
    uid: String(userDoc._id),
    email: userDoc.email,
    name: userDoc.name,
    roles: userDoc.roles || ['user'],
    branchIds: userDoc.branchIds || [],
  }
  const token = signToken(user)

  // ⬇️  **CLAVE**: persistir sesión como con Microsoft
  res.cookie('fc_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,          // PROD: true con HTTPS
    maxAge: 2 * 60 * 60 * 1000,
    path: '/',              // explícito
  })

  return res.json({ user, token })
})

// -----------------------------------------------------------------------------
// GET /api/v1/auth/microsoft
// -----------------------------------------------------------------------------
r.get('/microsoft', async (req, res, next) => {
  try {
    const client = await getOidcClient()
    const code_verifier = generators.codeVerifier()
    const code_challenge = generators.codeChallenge(code_verifier)

    res.cookie('fc_pkce', code_verifier, {
      httpOnly: true, sameSite: 'lax', secure: false, maxAge: 10 * 60 * 1000,
      path: '/',
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
// GET /api/v1/auth/microsoft/callback
// -----------------------------------------------------------------------------
r.get('/microsoft/callback', async (req, res) => {
  try {
    if (req.query?.error) {
      const err = String(req.query.error)
      const desc = String(req.query.error_description || '')
      console.warn('[auth] OIDC error:', err, desc)
      res.clearCookie('fc_pkce', { path: '/' })
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
      res.clearCookie('fc_pkce', { path: '/' })
      return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent('domain_not_allowed')}`)
    }

    let userDoc = await User.findOne({ email })
    if (!userDoc) {
      if (!AUTO_PROVISION) {
        res.clearCookie('fc_pkce', { path: '/' })
        return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent('user_not_found')}`)
      }
      userDoc = await User.create({
        email,
        name: userinfo.name || email,
        roles: ['user'],
        isActive: true,
        providers: { microsoft: { sub: userinfo.sub } },
      })
    } else if (!userDoc.isActive) {
      res.clearCookie('fc_pkce', { path: '/' })
      return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent('user_inactive')}`)
    } else {
      if (!userDoc.providers) userDoc.providers = {}
      if (!userDoc.providers.microsoft) userDoc.providers.microsoft = {}
      userDoc.providers.microsoft.sub = userinfo.sub
      await userDoc.save()
    }

    const user = {
      uid: String(userDoc._id),
      email: userDoc.email,
      name: userDoc.name,
      roles: userDoc.roles || ['user'],
      branchIds: userDoc.branchIds || [],
    }
    const token = signToken(user)

    res.clearCookie('fc_pkce', { path: '/' })
    res.cookie('fc_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,       // PROD: true con HTTPS
      maxAge: 2 * 60 * 60 * 1000,
      path: '/',
    })

    return res.redirect(`${CLIENT_URL}/dashboard`)
  } catch (e) {
    console.error('[auth] callback error:', e?.message || e)
    res.clearCookie('fc_pkce', { path: '/' })
    const code = e?.error || e?.name || 'oidc_error'
    return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent(code)}`)
  }
})

// -----------------------------------------------------------------------------
// GET /api/v1/auth/me
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
// POST /api/v1/auth/logout
// -----------------------------------------------------------------------------
r.post('/logout', (req, res) => {
  res.clearCookie('fc_token', { path: '/' })
  return res.json({ ok: true })
})

export default r
