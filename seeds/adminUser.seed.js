// seeds/adminUser.seed.js
// -----------------------------------------------------------------------------
// Script para insertar un usuario administrador inicial en la colección `users`
// Ejecutar con: `node seeds/adminUser.seed.js`
// Asegúrate de tener tu .env configurado con MONGO_URI
// -----------------------------------------------------------------------------

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import { User } from '../back/src/models/user.model.js'  // Ajusta la ruta según tu estructura

dotenv.config()

async function run() {
    try {
        // Conexión a Mongo
        await mongoose.connect(process.env.MONGO_URI)
        console.log('✅ Conectado a MongoDB')

        // Datos del admin inicial
        const adminEmail = 'admin@cbs.cl'
        const adminPassword = 'Admin123!' // Se recomienda cambiar luego
        const hashed = await bcrypt.hash(adminPassword, 10)

        // Buscar si ya existe
        let user = await User.findOne({ email: adminEmail })

        if (user) {
            console.log('⚠️ Usuario admin ya existe:', user.email)
        } else {
            user = new User({
                name: 'Administrador',
                email: adminEmail,
                password: hashed,
                role: 'admin',
                isActive: true,
                createdAt: new Date(),
            })
            await user.save()
            console.log('🎉 Usuario admin creado:', adminEmail)
            console.log('ℹ️ Contraseña temporal:', adminPassword)
        }

        process.exit(0)
    } catch (err) {
        console.error('❌ Error creando usuario admin', err)
        process.exit(1)
    }
}

run()
