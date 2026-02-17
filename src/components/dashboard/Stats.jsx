import StatCard from './StatCard'

export default function Stats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
      <StatCard label="Calls Analyzed" value={stats.total} accentColor="#737A5D" />
      <StatCard label="High Priority"  value={stats.high} accentColor="#A4AC86" />
      <StatCard label="High Risk"      value={stats.urgent} accentColor="#414833" />
    </div>
  )
}
