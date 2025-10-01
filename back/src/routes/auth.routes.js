// import { Router } from 'express'
// import jwt from 'jsonwebtoken'

// const r = Router()

// // LOGIN LOCAL (dummy): valida email/clave y responde {user, token}
// // ⚠️ Solo para prueba. Sustituir por validación real (hash de password, etc).
// r.post('/login', async (req, res) => {
//   const { email, password } = req.body || {}
//   if (!email || !password) {
//     return res.status(400).json({ message: 'Faltan credenciales' })
//   }

//   // Demo: acepta cualquier email y password 'admin' para probar UI
//   if (password !== 'admin') {
//     return res.status(401).json({ message: 'Credenciales inválidas' })
//   }

//   const user = { id: 'u_demo_1', email, role: 'admin' }
//   const token = jwt.sign(user, process.env.JWT_SECRET || 'change_me', { expiresIn: '2h' })

//   // Si quisieras cookie httpOnly:
//   // res.cookie('fc_token', token, { httpOnly:true, sameSite:'lax' })
//   return res.json({ user, token })
// })

// // MICROSOFT 365 (stub): redirige por ahora a /login con mensaje.
// // Cuando configures Azure AD/Entra, aquí irá passport/oidc-client, etc.
// r.get('/microsoft', (req, res) => {
//   return res.status(501).json({ message: 'Microsoft OAuth no implementado aún' })
//   // o res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?ms=not-implemented`)
// })

// r.get('/microsoft/callback', (req, res) => {
//   return res.status(501).json({ message: 'Callback Microsoft no implementado aún' })
// })

// export default r

import { Router } from 'express'
import jwt from 'jsonwebtoken'
// import { Issuer, generators } from 'openid-client'
import * as openid from 'openid-client'
const { Issuer, generators } = openid


const r = Router()

// ===== Login local (demo) =====
// A efectos de prueba: password 'admin'. Cambia por tu lógica real (bcrypt, etc.)
r.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ message: 'Faltan credenciales' })
  if (password !== 'admin') return res.status(401).json({ message: 'Credenciales inválidas' })

  const user = {
    uid: 'u_demo_1',
    email,
    roles: ['global'],     // o ['user'] si quieres que branchScope filtre
    branchIds: []          // o ['<idbranch>']
  }
  const token = jwt.sign(user, process.env.JWT_SECRET || 'change_me', { expiresIn: '2h' })

  // opción JSON (frontend guarda token en Zustand):
  return res.json({ user, token })
})

// ===== Microsoft 365 (Azure Entra) con OIDC + PKCE =====
let oidcClient
async function getClient(){
  if (oidcClient) return oidcClient
  const tenant = process.env.AZURE_TENANT_ID
  const issuer = await Issuer.discover(`https://login.microsoftonline.com/${tenant}/v2.0`)
  oidcClient = new issuer.Client({
    client_id: process.env.AZURE_CLIENT_ID,
    client_secret: process.env.AZURE_CLIENT_SECRET,
    redirect_uris: [process.env.AZURE_REDIRECT_URI],
    response_types: ['code']
  })
  return oidcClient
}

// Inicia login
r.get('/microsoft', async (req, res, next) => {
  try {
    const client = await getClient()
    const code_verifier = generators.codeVerifier()
    const code_challenge = generators.codeChallenge(code_verifier)

    res.cookie('fc_pkce', code_verifier, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,           // en producción: true (HTTPS)
      maxAge: 10 * 60 * 1000
    })

    const authUrl = client.authorizationUrl({
      scope: 'openid profile email offline_access',
      code_challenge,
      code_challenge_method: 'S256'
    })

    return res.redirect(authUrl)
  } catch (e) { next(e) }
})

// Callback
r.get('/microsoft/callback', async (req, res, next) => {
  try {
    const client = await getClient()
    const code_verifier = req.cookies?.fc_pkce
    if (!code_verifier) return res.status(400).send('PKCE verifier perdido')

    const params = client.callbackParams(req)
    const tokenSet = await client.callback(process.env.AZURE_REDIRECT_URI, params, { code_verifier })

    const userinfo = await client.userinfo(tokenSet.access_token)
    const email = userinfo.email || userinfo.preferred_username

    // Mapea a tu modelo de usuario/roles/scope
    const user = {
      uid: userinfo.sub,
      email,
      name: userinfo.name,
      roles: ['user'],      // TODO: mapea a 'global' o roles según tus claims/grupos
      branchIds: []
    }

    const token = jwt.sign(user, process.env.JWT_SECRET || 'change_me', { expiresIn: '2h' })

    res.clearCookie('fc_pkce')
    res.cookie('fc_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,        // producción: true
      maxAge: 2 * 60 * 60 * 1000
    })

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    return res.redirect(`${clientUrl}/dashboard`)
  } catch (e) { next(e) }
})

// Conocer el usuario desde cookie o Bearer
r.get('/me', (req, res) => {
  const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/, '')
  const token = req.cookies?.fc_token || bearer
  if (!token) return res.status(401).json({ message: 'No autenticado' })
  try{
    const user = jwt.verify(token, process.env.JWT_SECRET || 'change_me')
    return res.json({ user })
  }catch{
    return res.status(401).json({ message: 'Token inválido' })
  }
})

// Logout
r.post('/logout', (req, res) => {
  res.clearCookie('fc_token')
  return res.json({ ok:true })
})

export default r
