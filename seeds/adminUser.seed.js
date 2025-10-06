// // // // seeds/adminUser.seed.js
// // // -----------------------------------------------------------------------------
// // // Crea el usuario administrador inicial de FleetCore Suite
// // // Adaptado para estructura con carpetas: back/, front/, seeds/
// // // -----------------------------------------------------------------------------

// // import { createRequire } from 'module'
// // import path from 'path'
// // import { fileURLToPath } from 'url'

// // // 🔧 Habilitar require() desde aquí
// // const require = createRequire(import.meta.url)
// // const __dirname = path.dirname(fileURLToPath(import.meta.url))

// // // 🔧 Importar dependencias desde el backend
// // const dotenv = require('../back/node_modules/dotenv')
// // const mongoose = require('../back/node_modules/mongoose')
// // const bcrypt = require('../back/node_modules/bcryptjs')

// // // Importar el modelo de usuario
// // import User from '../back/src/models/User.js'

// // // Cargar las variables desde el .env del backend
// // dotenv.config({ path: path.resolve(__dirname, '../back/.env') })

// // async function seedAdminUser() {
// //     try {
// //         console.log('🔹 Conectando a MongoDB...')
// //         await mongoose.connect(process.env.MONGO_URI)

// //         const email = process.env.ADMIN_EMAIL || 'admin@cbs.cl'
// //         const password = process.env.ADMIN_PASSWORD || 'FleetCore#2025'
// //         const role = 'admin'

// //         const existing = await User.findOne({ email })
// //         if (existing) {
// //             console.log(`⚠️ El usuario administrador (${email}) ya existe.`)
// //             return process.exit(0)
// //         }

// //         const hashed = await bcrypt.hash(password, 10)
// //         await User.create({
// //             email,
// //             password: hashed,
// //             name: 'Administrador FleetCore',
// //             role,
// //             isActive: true,
// //             providers: {}
// //         })

// //         console.log('✅ Usuario administrador creado con éxito:')
// //         console.log(`   Email: ${email}`)
// //         console.log(`   Contraseña temporal: ${password}`)
// //         process.exit(0)
// //     } catch (err) {
// //         console.error('❌ Error al crear usuario administrador:', err)
// //         process.exit(1)
// //     }
// // }

// // seedAdminUser()


// // -----------------------------------------------------------------------------
// // FleetCore Suite - Autenticación (Local + Microsoft Entra ID / Azure AD)
// // Versión: 2025-10-06
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
// // LOGIN LOCAL (para cuentas con contraseña encriptada en local.passwordHash)
// // -----------------------------------------------------------------------------
// r.post('/login', async (req, res) => {
//   const { email, password } = req.body || {}
//   if (!email || !password)
//     return res.status(400).json({ message: 'Faltan credenciales' })

//   const normEmail = String(email).trim().toLowerCase()
//   const userDoc = await User.findOne({ email: normEmail })
//   if (!userDoc)
//     return res.status(403).json({ message: 'Usuario no autorizado o inexistente' })

//   if (!userDoc.isActive)
//     return res.status(403).json({ message: 'Usuario desactivado' })

//   // ⚠️ Verificar si la cuenta tiene login local habilitado
//   if (!userDoc.local?.allowLocalLogin)
//     return res.status(401).json({
//       message: 'Esta cuenta no permite login local. Use Microsoft o contacte al administrador.'
//     })

//   // ⚠️ Si no existe passwordHash => fue creada por Microsoft
//   if (!userDoc.local?.passwordHash)
//     return res.status(401).json({
//       message: 'Esta cuenta no tiene contraseña local. Ingrese con Microsoft o pida restablecer clave.'
//     })

//   // --- Comparar hash ---
//   const match = await bcrypt.compare(password, userDoc.local.passwordHash)
//   if (!match)
//     return res.status(401).json({ message: 'Credenciales inválidas' })

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
// // MICROSOFT (OIDC + PKCE)
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
// // CALLBACK OIDC – MULTI-TENANT + VALIDACIÓN DOMINIO CBS
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

//     if (ALLOWED_DOMAIN && !email.endsWith(`@${ALLOWED_DOMAIN}`)) {
//       res.clearCookie('fc_pkce')
//       return res.redirect(`${CLIENT_URL}/login?error=domain_not_allowed`)
//     }

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
// // LOGOUT
// // -----------------------------------------------------------------------------
// r.post('/logout', (req, res) => {
//   res.clearCookie('fc_token')
//   return res.json({ ok: true })
// })

// export default r
// seeds/adminUser.seed.js
// -----------------------------------------------------------------------------
// FleetCore Suite — Seed de usuario administrador inicial
// Crea o corrige el admin asegurando:
//   - email normalizado (lowercase/trim)
//   - local.passwordHash (bcryptjs)
//   - local.allowLocalLogin = true
//   - mustChangePassword configurable
//   - roles por defecto: ['admin','global'] (ajústalo si quieres)
// Usa el .env del BACKEND (back/.env) y sus dependencias.
// -----------------------------------------------------------------------------

import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Dependencias desde el backend (para evitar instalar dos veces)
const dotenv = require('../back/node_modules/dotenv')
const mongoose = require('../back/node_modules/mongoose')
const bcrypt = require('../back/node_modules/bcryptjs')

// Importa el modelo ESM desde el backend
import User from '../back/src/models/User.js'

// Cargar variables del back/.env
dotenv.config({ path: path.resolve(__dirname, '../back/.env') })

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

async function run() {
  try {
    const MONGO_URI = process.env.MONGO_URI
    if (!MONGO_URI) throw new Error('Falta MONGO_URI en back/.env')

    const email = normalizeEmail(process.env.ADMIN_EMAIL || 'admin@cbs.cl')
    const plain = process.env.ADMIN_PASSWORD || 'FleetCore#2025'
    const rolesFromEnv = (process.env.ADMIN_ROLES || '').trim()
    const roles = rolesFromEnv
      ? rolesFromEnv.split(',').map(r => r.trim()).filter(Boolean)
      : ['admin', 'global'] // <- ajusta si deseas otro set por defecto

    const mustChange =
      String(process.env.ADMIN_MUST_CHANGE || 'false').toLowerCase() === 'true'

    console.log('🔗 Conectando a Mongo…')
    await mongoose.connect(MONGO_URI)

    let user = await User.findOne({ email })

    if (!user) {
      console.log(`🆕 Creando usuario administrador: ${email}`)

      const hash = await bcrypt.hash(plain, 12)
      user = await User.create({
        email,
        name: 'Administrador FleetCore',
        isActive: true,
        roles,
        branchIds: [],
        local: {
          passwordHash: hash,
          allowLocalLogin: true,
          mustChangePassword: mustChange,
          passwordUpdatedAt: new Date(),
        },
        providers: {},
      })
    } else {
      console.log(`♻️ Usuario ya existe, corrigiendo credenciales locales: ${email}`)

      const updates = {}
      // Garantiza objeto local
      updates.local = {
        ...(user.local || {}),
        allowLocalLogin: true,
        mustChangePassword: mustChange,
        passwordUpdatedAt: new Date(),
      }

      // Re-hash siempre el password para garantizar estado correcto
      updates.local.passwordHash = await bcrypt.hash(plain, 12)

      // Roles por si quieres forzarlos desde el seed
      updates.roles = roles
      updates.isActive = true

      await User.updateOne({ _id: user._id }, { $set: updates })
    }

    console.log('✅ Admin listo para login local')
    console.log(`   Email: ${email}`)
    console.log(`   Contraseña temporal: ${plain}`)
    console.log(`   Roles: ${roles.join(', ')}`)
    console.log(`   mustChangePassword: ${mustChange}`)

    process.exit(0)
  } catch (err) {
    console.error('❌ Error en adminUser.seed.js:', err)
    process.exit(1)
  }
}

run()
