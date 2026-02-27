// // import path from 'path'
// // import fs from 'fs'
// // import xlsx from 'xlsx'
// // import { fileURLToPath } from 'url'

// // const __filename = fileURLToPath(import.meta.url)
// // const __dirname = path.dirname(__filename)

// // function envPath(key, fallbackRel) {
// //     const v = process.env[key]
// //     if (v && v.trim()) return v.trim()
// //     return path.join(__dirname, '..', fallbackRel)
// // }

// // const FILE_SRM = envPath('SRM_HIST_XLSX', 'data/2026 01 27 SRM Historicas.xlsx')
// // const OUT_DIR = envPath('SRM_OUT_DIR', 'outputs')

// // function norm(s) {
// //     return typeof s === 'string' ? s.trim().replace(/\s+/g, ' ') : ''
// // }
// // function lower(s) {
// //     return norm(s).toLowerCase()
// // }

// // function readRows(file) {
// //     if (!fs.existsSync(file)) throw new Error(`No existe archivo: ${file}`)
// //     const wb = xlsx.readFile(file, { cellDates: true })
// //     // prioriza "Datos SRM" si existe
// //     const name =
// //         wb.SheetNames.find((n) => n.toLowerCase().includes('datos')) ||
// //         wb.SheetNames[0]
// //     const ws = wb.Sheets[name]
// //     const rows = xlsx.utils.sheet_to_json(ws, { defval: '' })
// //     return { rows, sheetName: name }
// // }

// // function pickColKeys(rows) {
// //     const keys = rows.length ? Object.keys(rows[0]) : []
// //     const findKey = (includesAny) =>
// //         keys.find((k) => includesAny.some((p) => k.toLowerCase().includes(p)))

// //     return {
// //         detalle: findKey(['detalle', 'detalle solicitud', 'detalle_srm']),
// //         realizado: findKey(['realizado', 'trabajo realizado', 'solucion', 'acción']),
// //         sistema: findKey(['sietema', 'sistema']),
// //         carro: findKey(['carro', 'vehiculo', 'vehículo']),
// //         fecha: findKey(['fecha']),
// //         sucursal: findKey(['compañía', 'compania', 'sucursal', 'branch']),
// //     }
// // }

// // // Heurística pro para separar “síntoma” vs “trabajo”
// // const REPAIR_VERBS = [
// //     'cambio', 'reemplazo', 'reparación', 'reparacion', 'instalación', 'instalacion',
// //     'mantención', 'mantencion', 'ajuste', 'lubricación', 'lubricacion', 'revisión', 'revision',
// //     'calibración', 'calibracion', 'alineación', 'alineacion', 'soldadura', 'pintura',
// //     'limpieza', 'desarme', 'armado'
// // ]

// // function classify(text) {
// //     const t = lower(text)
// //     if (!t) return 'unknown'

// //     // Si parte por verbo de acción, casi seguro es trabajo
// //     if (REPAIR_VERBS.some((v) => t.startsWith(v + ' '))) return 'repair'

// //     // Síntomas típicos
// //     const symptomHints = [
// //         'no enciende', 'no prende', 'no arranca', 'ruido', 'fuga', 'vibración', 'vibracion',
// //         'no funciona', 'no opera', 'no sube', 'no baja', 'calienta', 'no enfría', 'no enfria',
// //         'se apaga', 'olor', 'humo', 'luz', 'alarma', 'falla', 'error'
// //     ]
// //     if (symptomHints.some((h) => t.includes(h))) return 'failure'

// //     // fallback: frases cortas tienden a ser síntoma/queja
// //     if (t.length <= 80) return 'failure'

// //     return 'repair'
// // }

// // function countMapPush(map, key, payload) {
// //     if (!key) return
// //     const k = norm(key)
// //     if (!k) return
// //     const prev = map.get(k) || { text: k, count: 0, examples: [] }
// //     prev.count += 1
// //     if (payload && prev.examples.length < 5) prev.examples.push(payload)
// //     map.set(k, prev)
// // }

// // function toCsv(rows) {
// //     const cols = ['text', 'count', 'examples']
// //     const esc = (v) => {
// //         const s = String(v ?? '')
// //         const q = s.includes('"') || s.includes(',') || s.includes('\n')
// //         const out = s.replaceAll('"', '""')
// //         return q ? `"${out}"` : out
// //     }
// //     const lines = [cols.join(',')]
// //     for (const r of rows) {
// //         lines.push([esc(r.text), esc(r.count), esc((r.examples || []).join(' | '))].join(','))
// //     }
// //     return lines.join('\n')
// // }

// // async function main() {
// //     console.log('== extract:srm ==')
// //     console.log('SRM:', FILE_SRM)

// //     const { rows, sheetName } = readRows(FILE_SRM)
// //     console.log(`Sheet: ${sheetName} | rows: ${rows.length}`)

// //     const cols = pickColKeys(rows)
// //     console.log('Cols:', cols)

// //     const failures = new Map()
// //     const repairs = new Map()

// //     for (const r of rows) {
// //         const detalle = norm(r[cols.detalle] ?? '')
// //         const realizado = norm(r[cols.realizado] ?? '')
// //         const sistema = norm(r[cols.sistema] ?? '')
// //         const carro = norm(r[cols.carro] ?? '')
// //         const suc = norm(r[cols.sucursal] ?? '')
// //         const fecha = norm(r[cols.fecha] ?? '')

// //         // Fuente principal: Detalle (lo que la sucursal “dice”)
// //         if (detalle) {
// //             const kind = classify(detalle)
// //             const example = `(${fecha || 's/f'}) ${suc || ''} ${carro || ''} ${sistema || ''}`.trim()
// //             if (kind === 'failure') countMapPush(failures, detalle, example)
// //             else if (kind === 'repair') countMapPush(repairs, detalle, example)
// //         }

// //         // Fuente secundaria: Realizado (lo que realmente se ejecutó)
// //         if (realizado) {
// //             const example = `(${fecha || 's/f'}) ${suc || ''} ${carro || ''} ${sistema || ''}`.trim()
// //             countMapPush(repairs, realizado, example)
// //         }
// //     }

// //     const failureArr = Array.from(failures.values()).sort((a, b) => b.count - a.count)
// //     const repairArr = Array.from(repairs.values()).sort((a, b) => b.count - a.count)

// //     fs.mkdirSync(path.join(__dirname, '..', OUT_DIR), { recursive: true })
// //     const stamp = new Date().toISOString().replaceAll(':', '').slice(0, 15)

// //     const outFailuresJson = path.join(__dirname, '..', OUT_DIR, `srm_failure_candidates_${stamp}.json`)
// //     const outRepairsJson = path.join(__dirname, '..', OUT_DIR, `srm_repair_candidates_${stamp}.json`)
// //     const outFailuresCsv = path.join(__dirname, '..', OUT_DIR, `srm_failure_candidates_${stamp}.csv`)
// //     const outRepairsCsv = path.join(__dirname, '..', OUT_DIR, `srm_repair_candidates_${stamp}.csv`)

// //     fs.writeFileSync(outFailuresJson, JSON.stringify({ source: FILE_SRM, sheetName, items: failureArr }, null, 2), 'utf8')
// //     fs.writeFileSync(outRepairsJson, JSON.stringify({ source: FILE_SRM, sheetName, items: repairArr }, null, 2), 'utf8')
// //     fs.writeFileSync(outFailuresCsv, toCsv(failureArr), 'utf8')
// //     fs.writeFileSync(outRepairsCsv, toCsv(repairArr), 'utf8')

// //     console.log('Failure candidates:', failureArr.length, '->', outFailuresJson)
// //     console.log('Repair candidates :', repairArr.length, '->', outRepairsJson)
// //     console.log('== done ==')
// // }

// // main().catch((err) => {
// //     console.error(err)
// //     process.exit(1)
// // })

// import path from 'path'
// import fs from 'fs'
// import xlsx from 'xlsx'
// import { fileURLToPath } from 'url'
// import mongoose from 'mongoose'
// import { connectDb, disconnectDb } from './_lib/db.js'

// import VmrsSystem from '../models/VmrsSystem.js'
// import VmrsComponent from '../models/VmrsComponent.js'

// // Actor dummy válido para campos ObjectId (createdBy/updatedBy)
// const ACTOR_OID = new mongoose.Types.ObjectId('000000000000000000000000')

// // VmrsJob opcional
// let VmrsJob = null
// try {
//     const mod = await import('../models/VmrsJob.js')
//     VmrsJob = mod?.default || null
// } catch (_) {
//     // ok: no existe aún
// }

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// // Resuelve rutas env absolutas o relativas a /src
// function envPath(key, fallbackRelFromSrc) {
//     const v = process.env[key]?.trim()
//     if (v) return path.isAbsolute(v) ? v : path.join(__dirname, '..', v)
//     return path.join(__dirname, '..', fallbackRelFromSrc)
// }

// const FILE_FULL = envPath('VMRS_FULL_XLSX', 'data/VMRS-Full-List.xlsx')
// const FILE_RTA = envPath('VMRS_RTA_XLSX', 'data/RTA-WO-VMRS 2019.xlsx')

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
//         (sheetNameHint &&
//             wb.SheetNames.find((n) =>
//                 n.toLowerCase().includes(sheetNameHint.toLowerCase())
//             )) ||
//         wb.SheetNames[0]

//     const ws = wb.Sheets[sheetName]
//     const rows = xlsx.utils.sheet_to_json(ws, { defval: '' })
//     return { rows, sheetName }
// }

// function getCol(row, keys) {
//     for (const k of keys) {
//         if (row[k] !== undefined) return row[k]
//         const found = Object.keys(row).find(
//             (kk) => kk.toLowerCase() === String(k).toLowerCase()
//         )
//         if (found) return row[found]
//     }
//     return ''
// }

// function parseFullList(rows) {
//     const systems = new Map() // code -> nameEs
//     const components = new Map() // code -> { systemCode, code, nameEs }

//     for (const r of rows) {
//         const c3 = upper(getCol(r, ['3-Digit', '3 Digit', '3digit', '3']))
//         const c6 = upper(getCol(r, ['6-Digit', '6 Digit', '6digit', '6']))
//         const desc = norm(
//             getCol(r, ['Description', 'DESC', 'Descripcion', 'Descripción'])
//         )

//         if (c3 && desc) systems.set(c3, desc)

//         if (c6 && desc) {
//             const sys = c6.includes('-') ? c6.split('-')[0] : c6.slice(0, 3)
//             components.set(c6, { systemCode: upper(sys), code: c6, nameEs: desc })
//         }
//     }

//     return {
//         systems: Array.from(systems.entries()).map(([code, nameEs]) => ({
//             code,
//             nameEs,
//         })),
//         components: Array.from(components.values()),
//     }
// }

// function parseRta(rows) {
//     const systems = new Map()
//     const components = new Map()
//     const jobs = []

//     for (const r of rows) {
//         const major = upper(getCol(r, ['Major VMRS', 'Major', 'MAJOR VMRS']))
//         const inter = upper(
//             getCol(r, ['Intermediate VMRS', 'Intermediate', 'INTERMEDIATE VMRS'])
//         )
//         const minor = upper(getCol(r, ['Minor VMRS', 'Minor', 'MINOR VMRS']))
//         const desc = norm(
//             getCol(r, ['Description', 'DESC', 'Descripcion', 'Descripción'])
//         )

//         if (major && desc) systems.set(major, desc)

//         if (inter && desc) {
//             const sys = inter.includes('-') ? inter.split('-')[0] : inter.slice(0, 3)
//             components.set(inter, { systemCode: upper(sys), code: inter, nameEs: desc })
//         }

//         const hoursRaw =
//             getCol(r, ['Job Hours', 'Std Hours', 'Standard Hours', 'Hours', 'Labor Hours']) ||
//             getCol(r, ['Job Hours (Avg)', 'Job Hours Avg']) ||
//             ''

//         const hours = Number(String(hoursRaw).replace(',', '.'))
//         const stdHours = Number.isFinite(hours) ? hours : 0

//         if (minor && desc) {
//             jobs.push({
//                 systemCode:
//                     major ||
//                     (inter ? (inter.includes('-') ? inter.split('-')[0] : inter.slice(0, 3)) : ''),
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
//                 $set: {
//                     code: it.code,
//                     nameEs: it.nameEs,
//                     active: true,
//                     updatedBy: ACTOR_OID,
//                 },
//                 $setOnInsert: { createdBy: ACTOR_OID },
//             },
//             upsert: true,
//         },
//     }))

//     const r = await VmrsSystem.bulkWrite(ops, { ordered: false })
//     return { inserted: r.upsertedCount || 0, updated: r.modifiedCount || 0 }
// }

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

//     // ✅ FIX CRÍTICO: era VmrsSystem.bulkWrite por error
//     const r = await VmrsComponent.bulkWrite(ops, { ordered: false })
//     return { inserted: r.upsertedCount || 0, updated: r.modifiedCount || 0 }
// }

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
//     return { inserted: r.upsertedCount || 0, updated: r.modifiedCount || 0 }
// }

// async function main() {
//     console.log('== seed:vmrs ==')
//     console.log('FULL:', FILE_FULL)
//     console.log('RTA :', FILE_RTA)

//     await connectDb()

//     console.log('==============================')
//     console.log('DB NAME  :', mongoose.connection.name)
//     console.log('HOST     :', mongoose.connection.host)
//     console.log('URI      :', process.env.MONGO_URI)
//     console.log('==============================')

//     console.log('COLLECTION VmrsSystem   :', VmrsSystem.collection.name)
//     console.log('COLLECTION VmrsComponent:', VmrsComponent.collection.name)

//     const beforeSystems = await VmrsSystem.countDocuments()
//     const beforeComponents = await VmrsComponent.countDocuments()
//     console.log('BEFORE systems   :', beforeSystems)
//     console.log('BEFORE components:', beforeComponents)

//     const full = readSheetRows(FILE_FULL)
//     console.log(`FULL sheet: ${full.sheetName} | rows: ${full.rows.length}`)
//     const fullParsed = parseFullList(full.rows)

//     const rta = readSheetRows(FILE_RTA)
//     console.log(`RTA sheet: ${rta.sheetName} | rows: ${rta.rows.length}`)
//     const rtaParsed = parseRta(rta.rows)

//     // Merge (FULL base, RTA complementa)
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

//     console.log('AFTER systems   :', await VmrsSystem.countDocuments())
//     console.log('AFTER components:', await VmrsComponent.countDocuments())

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

import path from 'path'
import fs from 'fs'
import xlsx from 'xlsx'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Resuelve env absolutas o relativas a /src
function envPath(key, fallbackRelFromSrc) {
    const v = process.env[key]?.trim()
    if (v) return path.isAbsolute(v) ? v : path.join(__dirname, '..', v)
    return path.join(__dirname, '..', fallbackRelFromSrc)
}

const FILE_SRM = envPath('SRM_HIST_XLSX', 'data/2026 01 27 SRM Historicas.xlsx')
const OUT_DIR = envPath('SRM_OUT_DIR', 'outputs') // ✅ queda absoluto siempre

function norm(s) {
    return typeof s === 'string' ? s.trim().replace(/\s+/g, ' ') : ''
}
function lower(s) {
    return norm(s).toLowerCase()
}

function readRows(file) {
    if (!fs.existsSync(file)) throw new Error(`No existe archivo: ${file}`)
    const wb = xlsx.readFile(file, { cellDates: true })
    const name = wb.SheetNames.find((n) => n.toLowerCase().includes('datos')) || wb.SheetNames[0]
    const ws = wb.Sheets[name]
    const rows = xlsx.utils.sheet_to_json(ws, { defval: '' })
    return { rows, sheetName: name }
}

function pickColKeys(rows) {
    const keys = rows.length ? Object.keys(rows[0]) : []
    const findKey = (includesAny) =>
        keys.find((k) => includesAny.some((p) => k.toLowerCase().includes(p)))

    return {
        detalle: findKey(['detalle', 'detalle solicitud', 'detalle_srm']),
        realizado: findKey(['realizado', 'trabajo realizado', 'solucion', 'acción', 'accion']),
        sistema: findKey(['sietema', 'sistema']),
        carro: findKey(['carro', 'vehiculo', 'vehículo']),
        fecha: findKey(['fecha']),
        sucursal: findKey(['compañía', 'compania', 'sucursal', 'branch']),
    }
}

const REPAIR_VERBS = [
    'cambio', 'reemplazo', 'reparación', 'reparacion', 'instalación', 'instalacion',
    'mantención', 'mantencion', 'ajuste', 'lubricación', 'lubricacion', 'revisión', 'revision',
    'calibración', 'calibracion', 'alineación', 'alineacion', 'soldadura', 'pintura',
    'limpieza', 'desarme', 'armado'
]

function classify(text) {
    const t = lower(text)
    if (!t) return 'unknown'
    if (REPAIR_VERBS.some((v) => t.startsWith(v + ' '))) return 'repair'

    const symptomHints = [
        'no enciende', 'no prende', 'no arranca', 'ruido', 'fuga', 'vibración', 'vibracion',
        'no funciona', 'no opera', 'no sube', 'no baja', 'calienta', 'no enfría', 'no enfria',
        'se apaga', 'olor', 'humo', 'luz', 'alarma', 'falla', 'error'
    ]
    if (symptomHints.some((h) => t.includes(h))) return 'failure'
    if (t.length <= 80) return 'failure'
    return 'repair'
}

function countMapPush(map, key, payload) {
    const k = norm(key)
    if (!k) return
    const prev = map.get(k) || { text: k, count: 0, examples: [] }
    prev.count += 1
    if (payload && prev.examples.length < 5) prev.examples.push(payload)
    map.set(k, prev)
}

function toCsv(rows) {
    const cols = ['text', 'count', 'examples']
    const esc = (v) => {
        const s = String(v ?? '')
        const q = s.includes('"') || s.includes(',') || s.includes('\n')
        const out = s.replaceAll('"', '""')
        return q ? `"${out}"` : out
    }
    const lines = [cols.join(',')]
    for (const r of rows) {
        lines.push([esc(r.text), esc(r.count), esc((r.examples || []).join(' | '))].join(','))
    }
    return lines.join('\n')
}

async function main() {
    console.log('== extract:srm ==')
    console.log('SRM:', FILE_SRM)
    console.log('OUT:', OUT_DIR)

    const { rows, sheetName } = readRows(FILE_SRM)
    console.log(`Sheet: ${sheetName} | rows: ${rows.length}`)

    const cols = pickColKeys(rows)
    console.log('Cols:', cols)

    const failures = new Map()
    const repairs = new Map()

    for (const r of rows) {
        const detalle = norm(r[cols.detalle] ?? '')
        const realizado = norm(r[cols.realizado] ?? '')
        const sistema = norm(r[cols.sistema] ?? '')
        const carro = norm(r[cols.carro] ?? '')
        const suc = norm(r[cols.sucursal] ?? '')
        const fecha = norm(r[cols.fecha] ?? '')

        const example = `(${fecha || 's/f'}) ${suc || ''} ${carro || ''} ${sistema || ''}`.trim()

        if (detalle) {
            const kind = classify(detalle)
            if (kind === 'failure') countMapPush(failures, detalle, example)
            else if (kind === 'repair') countMapPush(repairs, detalle, example)
        }

        if (realizado) {
            countMapPush(repairs, realizado, example)
        }
    }

    const failureArr = Array.from(failures.values()).sort((a, b) => b.count - a.count)
    const repairArr = Array.from(repairs.values()).sort((a, b) => b.count - a.count)

    // ✅ mkdir robusto (OUT_DIR ya es absoluto)
    fs.mkdirSync(OUT_DIR, { recursive: true })

    const stamp = new Date().toISOString().replaceAll(':', '').slice(0, 15)

    const outFailuresJson = path.join(OUT_DIR, `srm_failure_candidates_${stamp}.json`)
    const outRepairsJson = path.join(OUT_DIR, `srm_repair_candidates_${stamp}.json`)
    const outFailuresCsv = path.join(OUT_DIR, `srm_failure_candidates_${stamp}.csv`)
    const outRepairsCsv = path.join(OUT_DIR, `srm_repair_candidates_${stamp}.csv`)

    fs.writeFileSync(outFailuresJson, JSON.stringify({ source: FILE_SRM, sheetName, items: failureArr }, null, 2), 'utf8')
    fs.writeFileSync(outRepairsJson, JSON.stringify({ source: FILE_SRM, sheetName, items: repairArr }, null, 2), 'utf8')
    fs.writeFileSync(outFailuresCsv, toCsv(failureArr), 'utf8')
    fs.writeFileSync(outRepairsCsv, toCsv(repairArr), 'utf8')

    console.log('Failure candidates:', failureArr.length, '->', outFailuresJson)
    console.log('Repair candidates :', repairArr.length, '->', outRepairsJson)
    console.log('== done ==')
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})