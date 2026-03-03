// back/src/scripts/seedRepairFromVmrs.js
// -----------------------------------------------------------------------------
// Seed PRO: genera/actualiza Repair desde VmrsJob (VMRS)
// - Idempotente (upsert por vmrs.jobCode)
// - Defaults operacionales (tipo/severidad/impacto/tiempo)
// - Permite SYNC_INDEXES en DEV
// -----------------------------------------------------------------------------
// ENV opcionales:
// - SEED_ACTOR_OID=000000000000000000000000
// - SEED_SYNC_INDEXES=1
// - SEED_BATCH=1000
// - REPAIR_CODE_PREFIX=REP-VMRS-
// - REPAIR_NAME_PREFIX=
// - REPAIR_DEFAULT_TYPE=CORRECTIVE
// - REPAIR_DEFAULT_SEVERITY=MEDIUM
// - REPAIR_DEFAULT_IMPACT=LIMITED
// - REPAIR_DEFAULT_MINUTES=0
// -----------------------------------------------------------------------------

import { connectDb, disconnectDb } from './_lib/db.js'
import mongoose from 'mongoose'

import VmrsJob from '../models/VmrsJob.js'
import Repair from '../models/Repair.js'

const ACTOR_OID = new mongoose.Types.ObjectId(process.env.SEED_ACTOR_OID || '000000000000000000000000')

const SYNC = String(process.env.SEED_SYNC_INDEXES || '').trim() === '1'
const BATCH = Number(process.env.SEED_BATCH || 1000)

const CODE_PREFIX = (process.env.REPAIR_CODE_PREFIX || 'REP-VMRS-').trim()
const NAME_PREFIX = (process.env.REPAIR_NAME_PREFIX || '').trim()

const DEFAULT_TYPE = (process.env.REPAIR_DEFAULT_TYPE || 'CORRECTIVE').trim()
const DEFAULT_SEVERITY = (process.env.REPAIR_DEFAULT_SEVERITY || 'MEDIUM').trim()
const DEFAULT_IMPACT = (process.env.REPAIR_DEFAULT_IMPACT || 'LIMITED').trim()
const DEFAULT_MINUTES = Number(process.env.REPAIR_DEFAULT_MINUTES || 0)

function norm(s) {
    return typeof s === 'string' ? s.trim().replace(/\s+/g, ' ') : ''
}

function upper(s) {
    return norm(s).toUpperCase()
}

// --- Reglas operacionales (puedes refinarlas después) ---
// Si quieres, luego hacemos un “rules map” por systemCode (013 frenos, etc.)
function pickDefaultsFromVmrs(job) {
    const stdHours = Number(job?.stdLaborHours || 0)
    const minutesFromRta = Number.isFinite(stdHours) && stdHours > 0 ? Math.round(stdHours * 60) : null

    return {
        repairType: DEFAULT_TYPE,                 // CORRECTIVE por defecto
        severityDefault: DEFAULT_SEVERITY,        // MEDIUM
        operationalImpactDefault: DEFAULT_IMPACT, // LIMITED
        standardLaborMinutes: minutesFromRta ?? DEFAULT_MINUTES,
    }
}

function buildRepairCode(jobCode) {
    // code debe ser legible y estable
    // Ej: REP-VMRS-021-001-048
    return upper(`${CODE_PREFIX}${jobCode}`)
}

function buildRepairName(jobNameEs, jobCode) {
    const base = norm(jobNameEs) || `VMRS ${jobCode}`
    // Puedes poner prefijo si quieres: "VMRS - "
    return norm(`${NAME_PREFIX}${base}`)
}

async function syncIndexesIfNeeded() {
    if (!SYNC) return
    console.log('[SYNC] syncIndexes()...')
    await Repair.syncIndexes()
    console.log('[SYNC] Repair indexes OK')
}

async function main() {
    console.log('== seed:repair:from:vmrs ==')

    await connectDb()
    console.log('DB:', mongoose.connection.name, '|', mongoose.connection.host)

    await syncIndexesIfNeeded()

    const totalJobs = await VmrsJob.countDocuments({ active: true })
    console.log('VmrsJob active:', totalJobs)

    // Cursor para no cargar 28k en memoria de golpe
    const cursor = VmrsJob.find({ active: true })
        .select('systemCode componentCode jobCode nameEs stdLaborHours active')
        .lean()
        .cursor()

    let ops = []
    let seen = 0
    let flushed = 0

    for await (const j of cursor) {
        const systemCode = upper(j.systemCode)
        const componentCode = upper(j.componentCode)
        const jobCode = upper(j.jobCode)
        const nameEs = norm(j.nameEs)

        if (!systemCode || !componentCode || !jobCode || !nameEs) {
            // no debería pasar, pero evitamos basura
            continue
        }

        const d = pickDefaultsFromVmrs(j)

        const code = buildRepairCode(jobCode)
        const name = buildRepairName(nameEs, jobCode)

        // IMPORTANTE:
        // - Upsert por vmrs.jobCode (1 repair por cada job VMRS)
        // - No tocamos systemKey/subsystemKey/componentKey/failureModeKey para no “ensuciar” taxonomía humana
        // - vmrs.* queda poblado y es lo que usaremos para navegación jerárquica técnica
        ops.push({
            updateOne: {
                filter: { 'vmrs.jobCode': jobCode },
                update: {
                    $set: {
                        code,
                        name,
                        description: '',

                        // Taxonomía FleetCore (la refinamos después)
                        // systemKey/subsystemKey/componentKey/failureModeKey: quedan como están si ya existen
                        // Si no existen, quedarán por default en el schema (''), y el usuario podrá editarlas.
                        // OJO: esto evita conflictos y mantiene la UI estable.
                        // Si quieres forzarlas, lo hacemos en una segunda fase con reglas.
                        // systemKey: '',
                        // subsystemKey: '',
                        // componentKey: '',
                        // failureModeKey: '',

                        vmrs: {
                            systemCode,
                            componentCode,
                            jobCode,
                        },

                        repairType: d.repairType,
                        severityDefault: d.severityDefault,
                        operationalImpactDefault: d.operationalImpactDefault,
                        standardLaborMinutes: d.standardLaborMinutes,

                        active: true,
                        updatedBy: String(ACTOR_OID),
                    },
                    $setOnInsert: {
                        createdBy: String(ACTOR_OID),
                    },
                },
                upsert: true,
            },
        })

        seen++

        if (ops.length >= BATCH) {
            const r = await Repair.bulkWrite(ops, { ordered: false })
            flushed += ops.length
            console.log('[BULK]', {
                batchOps: ops.length,
                upserted: r.upsertedCount,
                matched: r.matchedCount,
                modified: r.modifiedCount,
            })
            ops = []
        }
    }

    if (ops.length) {
        const r = await Repair.bulkWrite(ops, { ordered: false })
        flushed += ops.length
        console.log('[BULK]', {
            batchOps: ops.length,
            upserted: r.upsertedCount,
            matched: r.matchedCount,
            modified: r.modifiedCount,
        })
    }

    console.log('Processed jobs:', seen)
    console.log('Flushed ops   :', flushed)
    console.log('Repairs total :', await Repair.countDocuments())

    await disconnectDb()
    console.log('== done ==')
}

main().catch(async (err) => {
    console.error(err)
    try {
        await disconnectDb()
    } catch (_) { }
    process.exit(1)
})