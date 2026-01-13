// back/src/scripts/seed.users.byBranch.js
// -----------------------------------------------------------------------------
// Seed: crea usuarios de prueba por sucursal (branches) para ensayar control de acceso.
// - Lee branches desde la colección Branch.
// - Crea (upsert) usuarios locales por cada branch: jefeTaller, bodega, tecnico.
// - Crea usuarios globales (directiva) + 1 admin.
// - Contraseña temporal común (SEED_PASSWORD) y obliga cambio (mustChangePassword=true).
//
// Requisitos:
// - MONGO_URI en .env (o variable de entorno)
// - Node ejecutando ES Modules (tu proyecto ya usa imports).
//
// Uso:
//   node back/src/scripts/seed.users.byBranch.js
//
// Variables opcionales:
//   SEED_DOMAIN=empresa.cl
//   SEED_PASSWORD=Temp1234!
//   SEED_CREATE_ADMIN=true|false
//   SEED_CREATE_BOARD=true|false
// -----------------------------------------------------------------------------

import 'dotenv/config'
import connectDB from '../config/db.js'
import Branch from '../models/Branch.js'
import User from '../models/User.js'

const SEED_DOMAIN = (process.env.SEED_DOMAIN || 'fleetcore.local').trim().toLowerCase()
const SEED_PASSWORD = process.env.SEED_PASSWORD || 'Temp1234!'
const SEED_CREATE_ADMIN = String(process.env.SEED_CREATE_ADMIN || 'true').toLowerCase() === 'true'
const SEED_CREATE_BOARD = String(process.env.SEED_CREATE_BOARD || 'true').toLowerCase() === 'true'

// Helpers
function emailOf(local) {
    return `${local}@${SEED_DOMAIN}`.toLowerCase()
}

async function upsertUser({ email, name, roles, branchIds }) {
    const existing = await User.findOne({ email })
    const u = existing || new User({ email })

    u.name = name || u.name || ''
    u.roles = Array.isArray(roles) && roles.length ? roles : (u.roles || ['user'])
    u.branchIds = Array.isArray(branchIds) ? branchIds : (u.branchIds || [])
    u.isActive = true
    u.local = u.local || {}
    u.local.allowLocalLogin = true
    u.local.mustChangePassword = true

    // Si no tiene passwordHash o queremos resetear siempre, setéalo
    await u.setPassword(SEED_PASSWORD)

    await u.save()
    return u
}

async function main() {
    await connectDB()

    const branches = await Branch.find({ active: { $ne: false } }).sort({ code: 1, name: 1 }).lean()
    if (!branches.length) {
        console.log('⚠️  No hay branches activas. Crea sucursales primero.')
        process.exit(0)
    }

    console.log(`✅ Branches encontradas: ${branches.length}`)

    // Admin global (acceso total)
    if (SEED_CREATE_ADMIN) {
        const adminEmail = emailOf('admin')
        await upsertUser({
            email: adminEmail,
            name: 'Administrador Global',
            roles: ['admin'],
            branchIds: branches.map(b => b._id),
        })
        console.log(`👤 Admin: ${adminEmail} / ${SEED_PASSWORD}`)
    }

    // Directiva: 8 personas + superior
    if (SEED_CREATE_BOARD) {
        for (let i = 1; i <= 8; i++) {
            const nn = String(i).padStart(2, '0')
            const em = emailOf(`dir${nn}`)
            await upsertUser({
                email: em,
                name: `Directiva ${nn}`,
                roles: ['global'],
                branchIds: branches.map(b => b._id),
            })
            console.log(`👤 Directiva: ${em} / ${SEED_PASSWORD}`)
        }

        const chief = emailOf('director.jefe')
        await upsertUser({
            email: chief,
            name: 'Director Jefe (Aprobaciones)',
            roles: ['global'],
            branchIds: branches.map(b => b._id),
        })
        console.log(`👤 Director Jefe: ${chief} / ${SEED_PASSWORD}`)

        const sub = emailOf('director.subrogante')
        await upsertUser({
            email: sub,
            name: 'Director Subrogante',
            roles: ['global'],
            branchIds: branches.map(b => b._id),
        })
        console.log(`👤 Subrogante: ${sub} / ${SEED_PASSWORD}`)
    }

    // Usuarios por sucursal (scoped)
    for (const b of branches) {
        const code = (b.code || '').toString().trim().toLowerCase().replace(/\s+/g, '')
        const tag = code || String(b._id).slice(-6)

        const jt = emailOf(`jt.${tag}`)
        const bo = emailOf(`bodega.${tag}`)
        const te = emailOf(`tecnico.${tag}`)

        await upsertUser({ email: jt, name: `Jefe de Taller (${b.code})`, roles: ['jefeTaller'], branchIds: [b._id] })
        await upsertUser({ email: bo, name: `Bodega (${b.code})`, roles: ['bodega'], branchIds: [b._id] })
        await upsertUser({ email: te, name: `Técnico (${b.code})`, roles: ['tecnico'], branchIds: [b._id] })

        console.log(`🏢 ${b.code} → jt.${tag}, bodega.${tag}, tecnico.${tag} (password: ${SEED_PASSWORD})`)
    }

    console.log('✅ Seed finalizado.')
    process.exit(0)
}

main().catch((err) => {
    console.error('❌ Seed falló:', err)
    process.exit(1)
})
