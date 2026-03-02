// import path from 'path'
// import fs from 'fs'
// import xlsx from 'xlsx'
// import { fileURLToPath } from 'url'
// import { connectDb, disconnectDb } from './_lib/db.js'
// import mongoose from 'mongoose'

// import VmrsSystem from '../models/VmrsSystem.js'
// import VmrsComponent from '../models/VmrsComponent.js'
// import VmrsJob from '../models/VmrsJob.js'

// // const ACTOR_OID = new mongoose.Types.ObjectId('000000000000000000000000') // dummy válido para seed
// const ACTOR_OID = new mongoose.Types.ObjectId(
//     process.env.SEED_ACTOR_OID || '000000000000000000000000'
// )

// // Si ya tienes/crearás VmrsJob model, lo conectamos aquí.
// // Por ahora lo dejamos opcional (si el model no existe, solo loguea).
// // let VmrsJob = null
// // try {
// //     const mod = await import('../models/VmrsJob.js')
// //     VmrsJob = mod?.default || null
// // } catch (_) {
// //     // ok: no existe aún
// // }

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// function envPath(key, fallbackRel) {
//     const v = process.env[key]
//     if (v && v.trim()) return v.trim()
//     return path.join(__dirname, '..', fallbackRel)
// }

// const FILE_FULL = envPath('VMRS_FULL_XLSX', 'data/VMRS-Full-List.xlsx')
// const FILE_RTA = envPath('VMRS_RTA_XLSX', 'data/RTA-WO-VMRS 2019.xlsx')

// const ACTOR = process.env.SEED_ACTOR || 'seed'

// function norm(s) {
//     return typeof s === 'string' ? s.trim().replace(/\s+/g, ' ') : ''
// }
// function upper(s) {
//     return norm(s).toUpperCase()
// }

// function readSheetRows(file, sheetNameHint = '') {
//     if (!fs.existsSync(file)) throw new Error(`No existe archivo: ${file}`)
//     const wb = xlsx.readFile(file, { cellDates: true })
//     const sheetName =
//         (sheetNameHint && wb.SheetNames.find((n) => n.toLowerCase().includes(sheetNameHint.toLowerCase()))) ||
//         wb.SheetNames[0]
//     const ws = wb.Sheets[sheetName]
//     const rows = xlsx.utils.sheet_to_json(ws, { defval: '' })
//     return { rows, sheetName }
// }

// function getCol(row, keys) {
//     for (const k of keys) {
//         if (row[k] !== undefined) return row[k]
//         // fallback por case-insensitive
//         const found = Object.keys(row).find((kk) => kk.toLowerCase() === String(k).toLowerCase())
//         if (found) return row[found]
//     }
//     return ''
// }

// /**
//  * VMRS-Full-List.xlsx suele traer columnas:
//  * - 3-Digit, 6-Digit, 9-Digit, Description
//  */
// // function parseFullList(rows) {
// //     const systems = new Map()     // code -> nameEs
// //     const components = new Map()  // code -> { systemCode, code, nameEs }

// //     for (const r of rows) {
// //         const c3 = upper(getCol(r, ['3-Digit', '3 Digit', '3digit', '3']))
// //         const c6 = upper(getCol(r, ['6-Digit', '6 Digit', '6digit', '6']))
// //         const desc = norm(getCol(r, ['Description', 'DESC', 'Descripcion', 'Descripción']))

// //         if (c3 && desc) systems.set(c3, desc)

// //         if (c6 && desc) {
// //             // systemCode lo inferimos de los primeros 3 chars (si viene como 013-02, también funciona)
// //             const sys = c6.includes('-') ? c6.split('-')[0] : c6.slice(0, 3)
// //             components.set(c6, { systemCode: upper(sys), code: c6, nameEs: desc })
// //         }
// //     }

// //     return {
// //         systems: Array.from(systems.entries()).map(([code, nameEs]) => ({ code, nameEs })),
// //         components: Array.from(components.values()),
// //     }
// // }

// function parseFullList(rows) {
//     const systems = new Map()        // "021" -> desc
//     const components = new Map()     // "021-001" -> { systemCode, code, nameEs }
//     const jobs = new Map()           // "021-001-048" -> { systemCode, componentCode, jobCode, nameEs }

//     for (const r of rows) {
//         const c3 = upper(getCol(r, ['3-Digit', '3 Digit', '3digit', '3']))
//         const c6 = upper(getCol(r, ['6-Digit', '6 Digit', '6digit', '6']))
//         const c9 = upper(getCol(r, ['9-Digit', '9 Digit', '9digit', '9']))
//         const desc = norm(getCol(r, ['Description', 'DESC', 'Descripcion', 'Descripción']))

//         if (c3 && desc) systems.set(c3, desc)

//         if (c6 && desc) {
//             const sys = c6.includes('-') ? c6.split('-')[0] : c6.slice(0, 3)
//             components.set(c6, { systemCode: upper(sys), code: c6, nameEs: desc })
//         }

//         if (c9 && desc) {
//             // asume formato 021-001-048
//             const parts = c9.split('-')
//             const sys = parts[0] || ''
//             const comp = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : ''
//             if (sys && comp) {
//                 jobs.set(c9, {
//                     systemCode: upper(sys),
//                     componentCode: upper(comp),
//                     jobCode: c9,
//                     nameEs: desc,
//                     stdLaborHours: 0, // FULL no trae horas
//                 })
//             }
//         }
//     }

//     return {
//         systems: Array.from(systems.entries()).map(([code, nameEs]) => ({ code, nameEs })),
//         components: Array.from(components.values()),
//         jobs: Array.from(jobs.values()),
//     }
// }

// /**
//  * RTA-WO-VMRS 2019.xlsx suele traer:
//  * Major VMRS, Intermediate VMRS, Minor VMRS, Description + Job Hours...
//  * Lo usamos para:
//  * - reforzar Systems/Components si faltan
//  * - poblar Jobs (si existe VmrsJob)
//  */
// function parseRta(rows) {
//     const systems = new Map()
//     const components = new Map()
//     const jobs = [] // opcional

//     for (const r of rows) {
//         const major = upper(getCol(r, ['Major VMRS', 'Major', 'MAJOR VMRS']))
//         const inter = upper(getCol(r, ['Intermediate VMRS', 'Intermediate', 'INTERMEDIATE VMRS']))
//         const minor = upper(getCol(r, ['Minor VMRS', 'Minor', 'MINOR VMRS']))
//         const desc = norm(getCol(r, ['Description', 'DESC', 'Descripcion', 'Descripción']))

//         // Major suele ser system (3-digit)
//         if (major && desc) systems.set(major, desc)

//         // Intermediate suele ser component (6-digit)
//         if (inter && desc) {
//             const sys = inter.includes('-') ? inter.split('-')[0] : inter.slice(0, 3)
//             components.set(inter, { systemCode: upper(sys), code: inter, nameEs: desc })
//         }

//         // Minor suele ser Job/Work accomplished (9-digit o similar)
//         // Si el archivo trae Hours, los leemos (si no, queda 0)
//         const hoursRaw =
//             getCol(r, ['Job Hours', 'Std Hours', 'Standard Hours', 'Hours', 'Labor Hours']) ||
//             getCol(r, ['Job Hours (Avg)', 'Job Hours Avg']) ||
//             ''
//         const hours = Number(String(hoursRaw).replace(',', '.'))
//         const stdHours = Number.isFinite(hours) ? hours : 0

//         if (minor && desc) {
//             jobs.push({
//                 systemCode: major || (inter ? (inter.includes('-') ? inter.split('-')[0] : inter.slice(0, 3)) : ''),
//                 componentCode: inter || '',
//                 jobCode: minor,
//                 nameEs: desc,
//                 stdLaborHours: stdHours,
//             })
//         }
//     }

//     return {
//         systems: Array.from(systems.entries()).map(([code, nameEs]) => ({ code, nameEs })),
//         components: Array.from(components.values()),
//         jobs,
//     }
// }

// async function bulkUpsertSystems(items) {
//     if (!items.length) return { inserted: 0, updated: 0 }

//     const ops = items.map((it) => ({
//         updateOne: {
//             filter: { code: it.code },
//             update: {
//                 $set: { code: it.code, nameEs: it.nameEs, active: true, updatedBy: ACTOR_OID },
//                 $setOnInsert: { createdBy: ACTOR_OID },
//             },
//             upsert: true,
//         },
//     }))

//     const r = await VmrsSystem.bulkWrite(ops, { ordered: false })

//     console.log('[VmrsSystem bulkWrite]', {
//         inserted: r.upsertedCount,
//         matched: r.matchedCount,
//         modified: r.modifiedCount,
//     })

//     return { inserted: r.upsertedCount || 0, updated: r.modifiedCount || 0 }
// }

// // async function bulkUpsertSystems(items) {
// //     if (!items.length) return { inserted: 0, updated: 0 }
// //     const ops = items.map((it) => ({
// //         updateOne: {
// //             filter: { code: it.code },
// //             update: {
// //                 $set: {
// //                     code: it.code,
// //                     nameEs: it.nameEs,
// //                     active: true,
// //                     updatedBy: ACTOR_OID,
// //                 },
// //                 $setOnInsert: { createdBy: ACTOR_OID },
// //             },
// //             upsert: true,
// //         },
// //     }))

// //     // const r = await VmrsSystem.bulkWrite(ops, { ordered: false })
// //     // return {
// //     //     inserted: r.upsertedCount || 0,
// //     //     updated: r.modifiedCount || 0,
// //     // }

// //     const r = await VmrsSystem.bulkWrite(ops, { ordered: false })

// //     console.log('[VmrsSystem bulkWrite]', {
// //         inserted: r.upsertedCount,
// //         matched: r.matchedCount,
// //         modified: r.modifiedCount,
// //         upsertedIds: r.upsertedIds,
// //     })
// // }

// async function bulkUpsertComponents(items) {
//     if (!items.length) return { inserted: 0, updated: 0 }

//     const ops = items
//         .filter((it) => it.systemCode && it.code && it.nameEs)
//         .map((it) => ({
//             updateOne: {
//                 filter: { systemCode: it.systemCode, code: it.code },
//                 update: {
//                     $set: {
//                         systemCode: it.systemCode,
//                         code: it.code,
//                         nameEs: it.nameEs,
//                         active: true,
//                         updatedBy: ACTOR_OID,
//                     },
//                     $setOnInsert: { createdBy: ACTOR_OID },
//                 },
//                 upsert: true,
//             },
//         }))

//     const r = await VmrsComponent.bulkWrite(ops, { ordered: false })

//     console.log('[VmrsComponent bulkWrite]', {
//         inserted: r.upsertedCount,
//         matched: r.matchedCount,
//         modified: r.modifiedCount,
//     })

//     return { inserted: r.upsertedCount || 0, updated: r.modifiedCount || 0 }
// }


// // async function bulkUpsertComponents(items) {
// //     if (!items.length) return { inserted: 0, updated: 0 }
// //     const ops = items
// //         .filter((it) => it.systemCode && it.code && it.nameEs)
// //         .map((it) => ({
// //             updateOne: {
// //                 filter: { systemCode: it.systemCode, code: it.code },
// //                 update: {
// //                     $set: {
// //                         systemCode: it.systemCode,
// //                         code: it.code,
// //                         nameEs: it.nameEs,
// //                         active: true,
// //                         updatedBy: ACTOR_OID,
// //                     },
// //                     $setOnInsert: { createdBy: ACTOR_OID },
// //                 },
// //                 upsert: true,
// //             },
// //         }))



// //     // const r = await VmrsComponent.bulkWrite(ops, { ordered: false })
// //     // return {
// //     //     inserted: r.upsertedCount || 0,
// //     //     updated: r.modifiedCount || 0,
// //     // }

// //     const r = await VmrsSystem.bulkWrite(ops, { ordered: false })

// //     console.log('[VmrsSystem bulkWrite]', {
// //         inserted: r.upsertedCount,
// //         matched: r.matchedCount,
// //         modified: r.modifiedCount,
// //         upsertedIds: r.upsertedIds,
// //     })
// // }

// async function bulkUpsertJobs(items) {
//     if (!VmrsJob) return { skipped: true }
//     if (!items.length) return { inserted: 0, updated: 0 }

//     const ops = items
//         .filter((it) => it.jobCode && it.nameEs)
//         .map((it) => ({
//             updateOne: {
//                 filter: { jobCode: it.jobCode },
//                 update: {
//                     $set: {
//                         systemCode: it.systemCode || '',
//                         componentCode: it.componentCode || '',
//                         jobCode: it.jobCode,
//                         nameEs: it.nameEs,
//                         stdLaborHours: it.stdLaborHours || 0,
//                         active: true,
//                         updatedBy: ACTOR_OID,
//                     },
//                     $setOnInsert: { createdBy: ACTOR_OID },
//                 },
//                 upsert: true,
//             },
//         }))

//     const r = await VmrsJob.bulkWrite(ops, { ordered: false })
//     return {
//         inserted: r.upsertedCount || 0,
//         updated: r.modifiedCount || 0,
//     }
// }

// async function main() {
//     console.log('== seed:vmrs ==')
//     console.log('FULL:', FILE_FULL)
//     console.log('RTA :', FILE_RTA)



//     await connectDb()

//     // await VmrsSystem.deleteOne({ code: 'ZZZ' })

//     console.log('[MODEL] VmrsSystem modelName:', VmrsSystem.modelName)
//     console.log('[MODEL] VmrsSystem schema createdBy type:', VmrsSystem.schema.path('createdBy')?.instance)
//     console.log('[MODEL] VmrsSystem schema updatedBy type:', VmrsSystem.schema.path('updatedBy')?.instance)
//     console.log('[MODEL] VmrsSystem collection:', VmrsSystem.collection.name)


//     // await VmrsSystem.create({ code: 'ZZZ', nameEs: 'PRUEBA SEED', active: true, createdBy: ACTOR_OID, updatedBy: ACTOR_OID })
//     // const z = await VmrsSystem.findOne({ code: 'ZZZ' }).lean()
//     // console.log('[TEST] insertOne OK?', !!z)

//     console.log('==============================')
//     console.log('DB NAME  :', mongoose.connection.name)
//     console.log('HOST     :', mongoose.connection.host)
//     console.log('URI      :', process.env.MONGO_URI)
//     console.log('==============================')

//     console.log('COLLECTION VmrsSystem   :', VmrsSystem.collection.name)
//     console.log('COLLECTION VmrsComponent:', VmrsComponent.collection.name)

//     console.log('BEFORE count systems    :', await VmrsSystem.countDocuments())
//     console.log('BEFORE count components :', await VmrsComponent.countDocuments())

//     // FULL
//     const full = readSheetRows(FILE_FULL)
//     console.log(`FULL sheet: ${full.sheetName} | rows: ${full.rows.length}`)
//     const fullParsed = parseFullList(full.rows)

//     // RTA
//     const rta = readSheetRows(FILE_RTA)
//     console.log(`RTA sheet: ${rta.sheetName} | rows: ${rta.rows.length}`)
//     const rtaParsed = parseRta(rta.rows)

//     // Merge: FULL es base, RTA complementa (sin duplicar)
//     const systemsMap = new Map()
//     for (const s of fullParsed.systems) systemsMap.set(s.code, s)
//     for (const s of rtaParsed.systems) if (!systemsMap.has(s.code)) systemsMap.set(s.code, s)

//     const compsMap = new Map()
//     for (const c of fullParsed.components) compsMap.set(`${c.systemCode}__${c.code}`, c)
//     for (const c of rtaParsed.components) {
//         const k = `${c.systemCode}__${c.code}`
//         if (!compsMap.has(k)) compsMap.set(k, c)
//     }

//     const systems = Array.from(systemsMap.values())
//     const components = Array.from(compsMap.values())

//     console.log(`Systems to upsert   : ${systems.length}`)
//     console.log(`Components to upsert: ${components.length}`)
//     console.log(`Jobs candidates     : ${rtaParsed.jobs.length} (VmrsJob ${VmrsJob ? 'ENABLED' : 'NOT FOUND'})`)

//     const r1 = await bulkUpsertSystems(systems)
//     const r2 = await bulkUpsertComponents(components)
//     const r3 = await bulkUpsertJobs(rtaParsed.jobs)

//     console.log('Systems  :', r1)
//     console.log('Components:', r2)
//     console.log('Jobs     :', r3)

//     console.log('AFTER count systems     :', await VmrsSystem.countDocuments())
//     console.log('AFTER count components  :', await VmrsComponent.countDocuments())

//     await disconnectDb()
//     console.log('== done ==')
// }

// main().catch(async (err) => {
//     console.error(err)
//     try {
//         await disconnectDb()
//     } catch (_) { }
//     process.exit(1)
// })

/**
 * back/src/scripts/seedVmrs.js
 * -----------------------------------------------------------------------------
 * Seed PRO de VMRS:
 * - Lee FULL (VMRS-Full-List.xlsx) y RTA (RTA-WO-VMRS 2019.xlsx)
 * - Upsert:
 *   A) Systems  (3-digit)  -> vmrssystems
 *   B) Components (6-digit) -> vmrscomponents
 *   C) Jobs (9-digit)       -> vmrsjobs (desde FULL + RTA)
 * - Merge:
 *   - FULL es base (más completo en catálogo)
 *   - RTA complementa y aporta stdLaborHours
 * - Normaliza códigos:
 *   - 3-digit: "021"
 *   - 6-digit: "021-001"
 *   - 9-digit: "021-001-048"
 * -----------------------------------------------------------------------------
 */

import path from 'path'
import fs from 'fs'
import xlsx from 'xlsx'
import { fileURLToPath } from 'url'
import { connectDb, disconnectDb } from './_lib/db.js'
import mongoose from 'mongoose'

import VmrsSystem from '../models/VmrsSystem.js'
import VmrsComponent from '../models/VmrsComponent.js'
import VmrsJob from '../models/VmrsJob.js'

const ACTOR_OID = new mongoose.Types.ObjectId(
    process.env.SEED_ACTOR_OID || '000000000000000000000000'
)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function envPath(key, fallbackRel) {
    const v = process.env[key]
    if (v && v.trim()) return v.trim()
    return path.join(__dirname, '..', fallbackRel)
}

const FILE_FULL = envPath('VMRS_FULL_XLSX', 'data/VMRS-Full-List.xlsx')
const FILE_RTA = envPath('VMRS_RTA_XLSX', 'data/RTA-WO-VMRS 2019.xlsx')

function norm(s) {
    return typeof s === 'string' ? s.trim().replace(/\s+/g, ' ') : ''
}
function upper(s) {
    return norm(s).toUpperCase()
}

/**
 * Normaliza:
 * - "021" -> "021"
 * - "021001" -> "021-001"
 * - "021-001-048" -> "021-001-048"
 * - "021001048" -> "021-001-048"
 */
function normalizeVmrsCode(raw) {
    const s = upper(String(raw || '')).replace(/\s+/g, '')
    if (!s) return ''

    // Ya viene con guiones
    if (s.includes('-')) {
        const parts = s.split('-').filter(Boolean)
        if (parts.length === 1) return parts[0].padStart(3, '0')
        if (parts.length === 2) return `${parts[0].padStart(3, '0')}-${parts[1].padStart(3, '0')}`
        if (parts.length >= 3)
            return `${parts[0].padStart(3, '0')}-${parts[1].padStart(3, '0')}-${parts[2].padStart(3, '0')}`
        return s
    }

    // Sin guiones, solo dígitos
    const digits = s.replace(/\D/g, '')
    if (digits.length === 3) return digits.padStart(3, '0')
    if (digits.length === 6) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}`
    if (digits.length === 9) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}`
    return s
}

function systemFrom6(code6) {
    const c = normalizeVmrsCode(code6)
    if (!c) return ''
    return c.includes('-') ? c.split('-')[0] : c.slice(0, 3)
}

function componentFrom9(code9) {
    const c = normalizeVmrsCode(code9)
    if (!c) return ''
    const parts = c.split('-')
    if (parts.length < 2) return ''
    return `${parts[0]}-${parts[1]}`
}

function readSheetRows(file, sheetNameHint = '') {
    if (!fs.existsSync(file)) throw new Error(`No existe archivo: ${file}`)
    const wb = xlsx.readFile(file, { cellDates: true })
    const sheetName =
        (sheetNameHint && wb.SheetNames.find((n) => n.toLowerCase().includes(sheetNameHint.toLowerCase()))) ||
        wb.SheetNames[0]
    const ws = wb.Sheets[sheetName]
    const rows = xlsx.utils.sheet_to_json(ws, { defval: '' })
    return { rows, sheetName }
}

function getCol(row, keys) {
    for (const k of keys) {
        if (row[k] !== undefined) return row[k]
        const found = Object.keys(row).find((kk) => kk.toLowerCase() === String(k).toLowerCase())
        if (found) return row[found]
    }
    return ''
}

/**
 * FULL:
 * - 3-Digit, 6-Digit, 9-Digit, Description
 */
function parseFullList(rows) {
    const systems = new Map()        // "021" -> desc
    const components = new Map()     // "021-001" -> { systemCode, code, nameEs }
    const jobs = new Map()           // "021-001-048" -> { systemCode, componentCode, jobCode, nameEs, stdLaborHours }

    for (const r of rows) {
        const c3raw = getCol(r, ['3-Digit', '3 Digit', '3digit', '3'])
        const c6raw = getCol(r, ['6-Digit', '6 Digit', '6digit', '6'])
        const c9raw = getCol(r, ['9-Digit', '9 Digit', '9digit', '9'])
        const desc = norm(getCol(r, ['Description', 'DESC', 'Descripcion', 'Descripción']))

        const c3 = normalizeVmrsCode(c3raw)
        const c6 = normalizeVmrsCode(c6raw)
        const c9 = normalizeVmrsCode(c9raw)

        if (c3 && desc) systems.set(c3, desc)

        if (c6 && desc) {
            const sys = systemFrom6(c6)
            if (sys) components.set(c6, { systemCode: sys, code: c6, nameEs: desc })
        }

        if (c9 && desc) {
            const sys = c9.split('-')[0] || ''
            const comp = componentFrom9(c9)
            if (sys && comp) {
                jobs.set(c9, {
                    systemCode: sys,
                    componentCode: comp,
                    jobCode: c9,
                    nameEs: desc,
                    stdLaborHours: 0, // FULL no trae horas
                })
            }
        }
    }

    return {
        systems: Array.from(systems.entries()).map(([code, nameEs]) => ({ code, nameEs })),
        components: Array.from(components.values()),
        jobs: Array.from(jobs.values()),
    }
}

/**
 * RTA:
 * - Major VMRS (3-digit)
 * - Intermediate VMRS (6-digit)
 * - Minor VMRS (9-digit)
 * - Description + Hours
 */
function parseRta(rows) {
    const systems = new Map()
    const components = new Map()
    const jobs = []

    for (const r of rows) {
        const majorRaw = getCol(r, ['Major VMRS', 'Major', 'MAJOR VMRS'])
        const interRaw = getCol(r, ['Intermediate VMRS', 'Intermediate', 'INTERMEDIATE VMRS'])
        const minorRaw = getCol(r, ['Minor VMRS', 'Minor', 'MINOR VMRS'])
        const desc = norm(getCol(r, ['Description', 'DESC', 'Descripcion', 'Descripción']))

        const major = normalizeVmrsCode(majorRaw) // -> 3-digit
        const inter = normalizeVmrsCode(interRaw) // -> 6-digit
        const minor = normalizeVmrsCode(minorRaw) // -> 9-digit

        if (major && desc) systems.set(major, desc)

        if (inter && desc) {
            const sys = systemFrom6(inter)
            if (sys) components.set(inter, { systemCode: sys, code: inter, nameEs: desc })
        }

        const hoursRaw =
            getCol(r, ['Job Hours', 'Std Hours', 'Standard Hours', 'Hours', 'Labor Hours']) ||
            getCol(r, ['Job Hours (Avg)', 'Job Hours Avg']) ||
            ''
        const hours = Number(String(hoursRaw).replace(',', '.'))
        const stdHours = Number.isFinite(hours) ? hours : 0

        if (minor && desc) {
            const systemCode = major || (inter ? systemFrom6(inter) : (minor ? minor.split('-')[0] : ''))
            const componentCode = inter || componentFrom9(minor)

            jobs.push({
                systemCode: upper(systemCode),
                componentCode: upper(componentCode),
                jobCode: upper(minor),
                nameEs: desc,
                stdLaborHours: stdHours,
            })
        }
    }

    return {
        systems: Array.from(systems.entries()).map(([code, nameEs]) => ({ code, nameEs })),
        components: Array.from(components.values()),
        jobs,
    }
}

async function bulkUpsertSystems(items) {
    if (!items.length) return { inserted: 0, updated: 0 }

    const ops = items
        .filter((it) => it.code && it.nameEs)
        .map((it) => ({
            updateOne: {
                filter: { code: it.code },
                update: {
                    $set: { code: it.code, nameEs: it.nameEs, active: true, updatedBy: ACTOR_OID },
                    $setOnInsert: { createdBy: ACTOR_OID },
                },
                upsert: true,
            },
        }))

    const r = await VmrsSystem.bulkWrite(ops, { ordered: false })

    console.log('[VmrsSystem bulkWrite]', {
        inserted: r.upsertedCount,
        matched: r.matchedCount,
        modified: r.modifiedCount,
    })

    return { inserted: r.upsertedCount || 0, updated: r.modifiedCount || 0 }
}

async function bulkUpsertComponents(items) {
    if (!items.length) return { inserted: 0, updated: 0 }

    const ops = items
        .filter((it) => it.systemCode && it.code && it.nameEs)
        .map((it) => ({
            updateOne: {
                filter: { systemCode: it.systemCode, code: it.code },
                update: {
                    $set: {
                        systemCode: it.systemCode,
                        code: it.code,
                        nameEs: it.nameEs,
                        active: true,
                        updatedBy: ACTOR_OID,
                    },
                    $setOnInsert: { createdBy: ACTOR_OID },
                },
                upsert: true,
            },
        }))

    const r = await VmrsComponent.bulkWrite(ops, { ordered: false })

    console.log('[VmrsComponent bulkWrite]', {
        inserted: r.upsertedCount,
        matched: r.matchedCount,
        modified: r.modifiedCount,
    })

    return { inserted: r.upsertedCount || 0, updated: r.modifiedCount || 0 }
}

async function bulkUpsertJobs(items) {
    if (!items.length) return { inserted: 0, updated: 0 }

    const ops = items
        .filter((it) => it.systemCode && it.componentCode && it.jobCode && it.nameEs)
        .map((it) => ({
            updateOne: {
                filter: { jobCode: it.jobCode },
                update: {
                    $set: {
                        systemCode: it.systemCode,
                        componentCode: it.componentCode,
                        jobCode: it.jobCode,
                        nameEs: it.nameEs,
                        stdLaborHours: Number(it.stdLaborHours || 0),
                        active: true,
                        updatedBy: ACTOR_OID,
                    },
                    $setOnInsert: { createdBy: ACTOR_OID },
                },
                upsert: true,
            },
        }))

    const r = await VmrsJob.bulkWrite(ops, { ordered: false })

    console.log('[VmrsJob bulkWrite]', {
        inserted: r.upsertedCount,
        matched: r.matchedCount,
        modified: r.modifiedCount,
    })

    return { inserted: r.upsertedCount || 0, updated: r.modifiedCount || 0 }
}

async function main() {
    console.log('== seed:vmrs ==')
    console.log('FULL:', FILE_FULL)
    console.log('RTA :', FILE_RTA)

    await connectDb()

    console.log('[MODEL] VmrsSystem modelName:', VmrsSystem.modelName)
    console.log('[MODEL] VmrsSystem schema createdBy type:', VmrsSystem.schema.path('createdBy')?.instance)
    console.log('[MODEL] VmrsSystem schema updatedBy type:', VmrsSystem.schema.path('updatedBy')?.instance)
    console.log('[MODEL] VmrsSystem collection:', VmrsSystem.collection.name)

    console.log('==============================')
    console.log('DB NAME  :', mongoose.connection.name)
    console.log('HOST     :', mongoose.connection.host)
    console.log('URI      :', process.env.MONGO_URI)
    console.log('==============================')

    console.log('COLLECTION VmrsSystem   :', VmrsSystem.collection.name)
    console.log('COLLECTION VmrsComponent:', VmrsComponent.collection.name)
    console.log('COLLECTION VmrsJob      :', VmrsJob.collection.name)

    console.log('BEFORE count systems    :', await VmrsSystem.countDocuments())
    console.log('BEFORE count components :', await VmrsComponent.countDocuments())
    console.log('BEFORE count jobs       :', await VmrsJob.countDocuments())

    // FULL
    const full = readSheetRows(FILE_FULL)
    console.log(`FULL sheet: ${full.sheetName} | rows: ${full.rows.length}`)
    const fullParsed = parseFullList(full.rows)

    // RTA
    const rta = readSheetRows(FILE_RTA)
    console.log(`RTA sheet: ${rta.sheetName} | rows: ${rta.rows.length}`)
    const rtaParsed = parseRta(rta.rows)

    // Merge Systems (FULL base + RTA complementa)
    const systemsMap = new Map()
    for (const s of fullParsed.systems) systemsMap.set(s.code, s)
    for (const s of rtaParsed.systems) if (!systemsMap.has(s.code)) systemsMap.set(s.code, s)
    const systems = Array.from(systemsMap.values())

    // Merge Components (FULL base + RTA complementa)
    const compsMap = new Map()
    for (const c of fullParsed.components) compsMap.set(`${c.systemCode}__${c.code}`, c)
    for (const c of rtaParsed.components) {
        const k = `${c.systemCode}__${c.code}`
        if (!compsMap.has(k)) compsMap.set(k, c)
    }
    const components = Array.from(compsMap.values())

    // Merge Jobs (FULL base + RTA complementa y aporta stdLaborHours)
    const jobsMap = new Map()
    for (const j of (fullParsed.jobs || [])) jobsMap.set(j.jobCode, j)

    for (const j of (rtaParsed.jobs || [])) {
        const prev = jobsMap.get(j.jobCode)
        if (prev) {
            prev.stdLaborHours = Number(j.stdLaborHours || prev.stdLaborHours || 0)
            prev.systemCode = j.systemCode || prev.systemCode
            prev.componentCode = j.componentCode || prev.componentCode
            if (!prev.nameEs && j.nameEs) prev.nameEs = j.nameEs
            jobsMap.set(j.jobCode, prev)
        } else {
            jobsMap.set(j.jobCode, j)
        }
    }
    const jobs = Array.from(jobsMap.values())

    console.log(`Systems to upsert   : ${systems.length}`)
    console.log(`Components to upsert: ${components.length}`)
    console.log(`Jobs (FULL)         : ${(fullParsed.jobs || []).length}`)
    console.log(`Jobs (RTA)          : ${(rtaParsed.jobs || []).length}`)
    console.log(`Jobs to upsert      : ${jobs.length}`)

    const r1 = await bulkUpsertSystems(systems)
    const r2 = await bulkUpsertComponents(components)
    const r3 = await bulkUpsertJobs(jobs)

    console.log('Systems  :', r1)
    console.log('Components:', r2)
    console.log('Jobs     :', r3)

    console.log('AFTER count systems     :', await VmrsSystem.countDocuments())
    console.log('AFTER count components  :', await VmrsComponent.countDocuments())
    console.log('AFTER count jobs        :', await VmrsJob.countDocuments())

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