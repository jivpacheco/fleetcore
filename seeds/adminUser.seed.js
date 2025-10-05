// // seeds/adminUser.seed.js
// -----------------------------------------------------------------------------
// Crea el usuario administrador inicial de FleetCore Suite
// Adaptado para estructura con carpetas: back/, front/, seeds/
// -----------------------------------------------------------------------------

import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

// 🔧 Habilitar require() desde aquí
const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 🔧 Importar dependencias desde el backend
const dotenv = require('../back/node_modules/dotenv')
const mongoose = require('../back/node_modules/mongoose')
const bcrypt = require('../back/node_modules/bcryptjs')

// Importar el modelo de usuario
import User from '../back/src/models/User.js'

// Cargar las variables desde el .env del backend
dotenv.config({ path: path.resolve(__dirname, '../back/.env') })

async function seedAdminUser() {
    try {
        console.log('🔹 Conectando a MongoDB...')
        await mongoose.connect(process.env.MONGO_URI)

        const email = process.env.ADMIN_EMAIL || 'admin@cbs.cl'
        const password = process.env.ADMIN_PASSWORD || 'FleetCore#2025'
        const role = 'admin'

        const existing = await User.findOne({ email })
        if (existing) {
            console.log(`⚠️ El usuario administrador (${email}) ya existe.`)
            return process.exit(0)
        }

        const hashed = await bcrypt.hash(password, 10)
        await User.create({
            email,
            password: hashed,
            name: 'Administrador FleetCore',
            role,
            isActive: true,
            providers: {}
        })

        console.log('✅ Usuario administrador creado con éxito:')
        console.log(`   Email: ${email}`)
        console.log(`   Contraseña temporal: ${password}`)
        process.exit(0)
    } catch (err) {
        console.error('❌ Error al crear usuario administrador:', err)
        process.exit(1)
    }
}

seedAdminUser()
