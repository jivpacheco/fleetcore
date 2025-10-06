// seeds/fixAdminPassword.js
// -----------------------------------------------------------------------------
// Corrige el usuario admin@cbs.cl para que use `local.passwordHash`
// y permita login local (allowLocalLogin: true).
// Usa el .env del backend y las dependencias del backend.
// -----------------------------------------------------------------------------

import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const dotenv = require('../back/node_modules/dotenv')
const mongoose = require('../back/node_modules/mongoose')
const bcrypt = require('../back/node_modules/bcryptjs')

// Modelo (ESM)
import User from '../back/src/models/User.js'

// Carga .env del back
dotenv.config({ path: path.resolve(__dirname, '../back/.env') })

async function run() {
  try {
    const MONGO_URI = process.env.MONGO_URI
    if (!MONGO_URI) throw new Error('Falta MONGO_URI en back/.env')

    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@cbs.cl').toLowerCase().trim()
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'FleetCore#2025'

    console.log('🔗 Conectando a Mongo...')
    await mongoose.connect(MONGO_URI)

    const user = await User.findOne({ email: ADMIN_EMAIL })
    if (!user) {
      console.log(`❌ No existe ${ADMIN_EMAIL}. Ejecuta primero el seed de creación o corrige el email.`)
      process.exit(1)
    }

    // Hashea y guarda en local.passwordHash
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12)
    user.local = user.local || {}
    user.local.passwordHash = hash
    user.local.allowLocalLogin = true
    user.local.mustChangePassword = false
    user.isActive = true

    await user.save()

    console.log('✅ Admin corregido:')
    console.log(`   Email: ${ADMIN_EMAIL}`)
    console.log('   Campo local.passwordHash actualizado y allowLocalLogin=true')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error fixAdminPassword:', err)
    process.exit(1)
  }
}

run()
