// front/src/components/table/PageSizeSelect.jsx
export default function PageSizeSelect({ value, onChange }) {
    return (
        <label className="text-sm text-gray-600 inline-flex items-center gap-2">
            Mostrar
            <select
                className="border rounded px-2 py-1 text-sm"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
            >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
            </select>
            ítems
        </label>
    )
}
