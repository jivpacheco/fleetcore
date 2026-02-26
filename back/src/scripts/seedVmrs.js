import path from 'path'
import fs from 'fs'
import xlsx from 'xlsx'
import { fileURLToPath } from 'url'
import { connectDb, disconnectDb } from './_lib/db.js'
import mongoose from 'mongoose'

import VmrsSystem from '../models/VmrsSystem.js'
import VmrsComponent from '../models/VmrsComponent.js'

// Si ya tienes/crearás VmrsJob model, lo conectamos aquí.
// Por ahora lo dejamos opcional (si el model no existe, solo loguea).
let VmrsJob = null
try {
    const mod = await import('../models/VmrsJob.js')
    VmrsJob = mod?.default || null
} catch (_) {
    // ok: no existe aún
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function envPath(key, fallbackRel) {
    const v = process.env[key]
    if (v && v.trim()) return v.trim()
    return path.join(__dirname, '..', fallbackRel)
}

const FILE_FULL = envPath('VMRS_FULL_XLSX', 'data/VMRS-Full-List.xlsx')
const FILE_RTA = envPath('VMRS_RTA_XLSX', 'data/RTA-WO-VMRS 2019.xlsx')

const ACTOR = process.env.SEED_ACTOR || 'seed'

function norm(s) {
    return typeof s === 'string' ? s.trim().replace(/\s+/g, ' ') : ''
}
function upper(s) {
    return norm(s).toUpperCase()
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
        // fallback por case-insensitive
        const found = Object.keys(row).find((kk) => kk.toLowerCase() === String(k).toLowerCase())
        if (found) return row[found]
    }
    return ''
}

/**
 * VMRS-Full-List.xlsx suele traer columnas:
 * - 3-Digit, 6-Digit, 9-Digit, Description
 */
function parseFullList(rows) {
    const systems = new Map()     // code -> nameEs
    const components = new Map()  // code -> { systemCode, code, nameEs }

    for (const r of rows) {
        const c3 = upper(getCol(r, ['3-Digit', '3 Digit', '3digit', '3']))
        const c6 = upper(getCol(r, ['6-Digit', '6 Digit', '6digit', '6']))
        const desc = norm(getCol(r, ['Description', 'DESC', 'Descripcion', 'Descripción']))

        if (c3 && desc) systems.set(c3, desc)

        if (c6 && desc) {
            // systemCode lo inferimos de los primeros 3 chars (si viene como 013-02, también funciona)
            const sys = c6.includes('-') ? c6.split('-')[0] : c6.slice(0, 3)
            components.set(c6, { systemCode: upper(sys), code: c6, nameEs: desc })
        }
    }

    return {
        systems: Array.from(systems.entries()).map(([code, nameEs]) => ({ code, nameEs })),
        components: Array.from(components.values()),
    }
}

/**
 * RTA-WO-VMRS 2019.xlsx suele traer:
 * Major VMRS, Intermediate VMRS, Minor VMRS, Description + Job Hours...
 * Lo usamos para:
 * - reforzar Systems/Components si faltan
 * - poblar Jobs (si existe VmrsJob)
 */
function parseRta(rows) {
    const systems = new Map()
    const components = new Map()
    const jobs = [] // opcional

    for (const r of rows) {
        const major = upper(getCol(r, ['Major VMRS', 'Major', 'MAJOR VMRS']))
        const inter = upper(getCol(r, ['Intermediate VMRS', 'Intermediate', 'INTERMEDIATE VMRS']))
        const minor = upper(getCol(r, ['Minor VMRS', 'Minor', 'MINOR VMRS']))
        const desc = norm(getCol(r, ['Description', 'DESC', 'Descripcion', 'Descripción']))

        // Major suele ser system (3-digit)
        if (major && desc) systems.set(major, desc)

        // Intermediate suele ser component (6-digit)
        if (inter && desc) {
            const sys = inter.includes('-') ? inter.split('-')[0] : inter.slice(0, 3)
            components.set(inter, { systemCode: upper(sys), code: inter, nameEs: desc })
        }

        // Minor suele ser Job/Work accomplished (9-digit o similar)
        // Si el archivo trae Hours, los leemos (si no, queda 0)
        const hoursRaw =
            getCol(r, ['Job Hours', 'Std Hours', 'Standard Hours', 'Hours', 'Labor Hours']) ||
            getCol(r, ['Job Hours (Avg)', 'Job Hours Avg']) ||
            ''
        const hours = Number(String(hoursRaw).replace(',', '.'))
        const stdHours = Number.isFinite(hours) ? hours : 0

        if (minor && desc) {
            jobs.push({
                systemCode: major || (inter ? (inter.includes('-') ? inter.split('-')[0] : inter.slice(0, 3)) : ''),
                componentCode: inter || '',
                jobCode: minor,
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
    const ops = items.map((it) => ({
        updateOne: {
            filter: { code: it.code },
            update: {
                $set: {
                    code: it.code,
                    nameEs: it.nameEs,
                    active: true,
                    updatedBy: ACTOR,
                },
                $setOnInsert: { createdBy: ACTOR },
            },
            upsert: true,
        },
    }))

    // const r = await VmrsSystem.bulkWrite(ops, { ordered: false })
    // return {
    //     inserted: r.upsertedCount || 0,
    //     updated: r.modifiedCount || 0,
    // }

    const r = await VmrsSystem.bulkWrite(ops, { ordered: false })

    console.log('[VmrsSystem bulkWrite]', {
        inserted: r.upsertedCount,
        matched: r.matchedCount,
        modified: r.modifiedCount,
        upsertedIds: r.upsertedIds,
    })
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
                        updatedBy: ACTOR,
                    },
                    $setOnInsert: { createdBy: ACTOR },
                },
                upsert: true,
            },
        }))

    // const r = await VmrsComponent.bulkWrite(ops, { ordered: false })
    // return {
    //     inserted: r.upsertedCount || 0,
    //     updated: r.modifiedCount || 0,
    // }

    const r = await VmrsSystem.bulkWrite(ops, { ordered: false })

    console.log('[VmrsSystem bulkWrite]', {
        inserted: r.upsertedCount,
        matched: r.matchedCount,
        modified: r.modifiedCount,
        upsertedIds: r.upsertedIds,
    })
}

async function bulkUpsertJobs(items) {
    if (!VmrsJob) return { skipped: true }
    if (!items.length) return { inserted: 0, updated: 0 }

    const ops = items
        .filter((it) => it.jobCode && it.nameEs)
        .map((it) => ({
            updateOne: {
                filter: { jobCode: it.jobCode },
                update: {
                    $set: {
                        systemCode: it.systemCode || '',
                        componentCode: it.componentCode || '',
                        jobCode: it.jobCode,
                        nameEs: it.nameEs,
                        stdLaborHours: it.stdLaborHours || 0,
                        active: true,
                        updatedBy: ACTOR,
                    },
                    $setOnInsert: { createdBy: ACTOR },
                },
                upsert: true,
            },
        }))

    const r = await VmrsJob.bulkWrite(ops, { ordered: false })
    return {
        inserted: r.upsertedCount || 0,
        updated: r.modifiedCount || 0,
    }
}

async function main() {
    console.log('== seed:vmrs ==')
    console.log('FULL:', FILE_FULL)
    console.log('RTA :', FILE_RTA)

    await connectDb()



    console.log('==============================')
    console.log('DB NAME  :', mongoose.connection.name)
    console.log('HOST     :', mongoose.connection.host)
    console.log('URI      :', process.env.MONGO_URI)
    console.log('==============================')

    console.log('COLLECTION VmrsSystem   :', VmrsSystem.collection.name)
    console.log('COLLECTION VmrsComponent:', VmrsComponent.collection.name)

    console.log('BEFORE count systems    :', await VmrsSystem.countDocuments())
    console.log('BEFORE count components :', await VmrsComponent.countDocuments())

    // FULL
    const full = readSheetRows(FILE_FULL)
    console.log(`FULL sheet: ${full.sheetName} | rows: ${full.rows.length}`)
    const fullParsed = parseFullList(full.rows)

    // RTA
    const rta = readSheetRows(FILE_RTA)
    console.log(`RTA sheet: ${rta.sheetName} | rows: ${rta.rows.length}`)
    const rtaParsed = parseRta(rta.rows)

    // Merge: FULL es base, RTA complementa (sin duplicar)
    const systemsMap = new Map()
    for (const s of fullParsed.systems) systemsMap.set(s.code, s)
    for (const s of rtaParsed.systems) if (!systemsMap.has(s.code)) systemsMap.set(s.code, s)

    const compsMap = new Map()
    for (const c of fullParsed.components) compsMap.set(`${c.systemCode}__${c.code}`, c)
    for (const c of rtaParsed.components) {
        const k = `${c.systemCode}__${c.code}`
        if (!compsMap.has(k)) compsMap.set(k, c)
    }

    const systems = Array.from(systemsMap.values())
    const components = Array.from(compsMap.values())

    console.log(`Systems to upsert   : ${systems.length}`)
    console.log(`Components to upsert: ${components.length}`)
    console.log(`Jobs candidates     : ${rtaParsed.jobs.length} (VmrsJob ${VmrsJob ? 'ENABLED' : 'NOT FOUND'})`)

    const r1 = await bulkUpsertSystems(systems)
    const r2 = await bulkUpsertComponents(components)
    const r3 = await bulkUpsertJobs(rtaParsed.jobs)

    console.log('Systems  :', r1)
    console.log('Components:', r2)
    console.log('Jobs     :', r3)

    console.log('AFTER count systems     :', await VmrsSystem.countDocuments())
    console.log('AFTER count components  :', await VmrsComponent.countDocuments())

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