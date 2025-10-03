export default function LimitSelect({ value, onChange }) {
  return (
    <select
      className="border rounded px-2 py-1"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label="Items por página"
    >
      {[10, 25, 50].map(n => <option key={n} value={n}>{n} / pág</option>)}
    </select>
  )
}
