import path from 'path'
import fs from 'fs'
import xlsx from 'xlsx'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function envPath(key, fallbackRel) {
    const v = process.env[key]
    if (v && v.trim()) return v.trim()
    return path.join(__dirname, '..', fallbackRel)
}

const FILE_SRM = envPath('SRM_HIST_XLSX', 'data/2026 01 27 SRM Historicas.xlsx')
const OUT_DIR = envPath('SRM_OUT_DIR', 'outputs')

function norm(s) {
    return typeof s === 'string' ? s.trim().replace(/\s+/g, ' ') : ''
}
function lower(s) {
    return norm(s).toLowerCase()
}

function readRows(file) {
    if (!fs.existsSync(file)) throw new Error(`No existe archivo: ${file}`)
    const wb = xlsx.readFile(file, { cellDates: true })
    // prioriza "Datos SRM" si existe
    const name =
        wb.SheetNames.find((n) => n.toLowerCase().includes('datos')) ||
        wb.SheetNames[0]
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
        realizado: findKey(['realizado', 'trabajo realizado', 'solucion', 'acción']),
        sistema: findKey(['sietema', 'sistema']),
        carro: findKey(['carro', 'vehiculo', 'vehículo']),
        fecha: findKey(['fecha']),
        sucursal: findKey(['compañía', 'compania', 'sucursal', 'branch']),
    }
}

// Heurística pro para separar “síntoma” vs “trabajo”
const REPAIR_VERBS = [
    'cambio', 'reemplazo', 'reparación', 'reparacion', 'instalación', 'instalacion',
    'mantención', 'mantencion', 'ajuste', 'lubricación', 'lubricacion', 'revisión', 'revision',
    'calibración', 'calibracion', 'alineación', 'alineacion', 'soldadura', 'pintura',
    'limpieza', 'desarme', 'armado'
]

function classify(text) {
    const t = lower(text)
    if (!t) return 'unknown'

    // Si parte por verbo de acción, casi seguro es trabajo
    if (REPAIR_VERBS.some((v) => t.startsWith(v + ' '))) return 'repair'

    // Síntomas típicos
    const symptomHints = [
        'no enciende', 'no prende', 'no arranca', 'ruido', 'fuga', 'vibración', 'vibracion',
        'no funciona', 'no opera', 'no sube', 'no baja', 'calienta', 'no enfría', 'no enfria',
        'se apaga', 'olor', 'humo', 'luz', 'alarma', 'falla', 'error'
    ]
    if (symptomHints.some((h) => t.includes(h))) return 'failure'

    // fallback: frases cortas tienden a ser síntoma/queja
    if (t.length <= 80) return 'failure'

    return 'repair'
}

function countMapPush(map, key, payload) {
    if (!key) return
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

        // Fuente principal: Detalle (lo que la sucursal “dice”)
        if (detalle) {
            const kind = classify(detalle)
            const example = `(${fecha || 's/f'}) ${suc || ''} ${carro || ''} ${sistema || ''}`.trim()
            if (kind === 'failure') countMapPush(failures, detalle, example)
            else if (kind === 'repair') countMapPush(repairs, detalle, example)
        }

        // Fuente secundaria: Realizado (lo que realmente se ejecutó)
        if (realizado) {
            const example = `(${fecha || 's/f'}) ${suc || ''} ${carro || ''} ${sistema || ''}`.trim()
            countMapPush(repairs, realizado, example)
        }
    }

    const failureArr = Array.from(failures.values()).sort((a, b) => b.count - a.count)
    const repairArr = Array.from(repairs.values()).sort((a, b) => b.count - a.count)

    fs.mkdirSync(path.join(__dirname, '..', OUT_DIR), { recursive: true })
    const stamp = new Date().toISOString().replaceAll(':', '').slice(0, 15)

    const outFailuresJson = path.join(__dirname, '..', OUT_DIR, `srm_failure_candidates_${stamp}.json`)
    const outRepairsJson = path.join(__dirname, '..', OUT_DIR, `srm_repair_candidates_${stamp}.json`)
    const outFailuresCsv = path.join(__dirname, '..', OUT_DIR, `srm_failure_candidates_${stamp}.csv`)
    const outRepairsCsv = path.join(__dirname, '..', OUT_DIR, `srm_repair_candidates_${stamp}.csv`)

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