import { useMemo } from 'react'

/**
 * ExaminerSelect
 * - Recibe people[] (Personas) y filtra por roles que contengan EXAMINER (case-insensitive)
 * - value: examinerId
 */
export default function ExaminerSelect({ people = [], value = '', onChange }) {
    const examiners = useMemo(() => {
        return (people || []).filter(p => {
            const roles = Array.isArray(p.roles) ? p.roles : []
            return roles.some(r => String(r).toUpperCase() === 'EXAMINER' || String(r).toUpperCase() === 'EXAMINADOR')
        })
    }, [people])

    return (
        <select
            className="w-full border rounded px-3 py-2"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
        >
            <option value="">— Selecciona examinador —</option>
            {examiners.map(ex => (
                <option key={ex._id} value={ex._id}>
                    {ex.lastName} {ex.firstName} ({ex.dni})
                </option>
            ))}
        </select>
    )
}
