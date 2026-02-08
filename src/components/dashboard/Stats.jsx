import StatCard from './StatCard'

export default function Stats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="Total calls analyzed" value={stats.total} icon="📊" />
      <StatCard label="Calls needing follow-up" value={stats.followUp} icon="📞" highlight />
      <StatCard label="High-priority calls" value={stats.highPriority} icon="🔥" />
    </div>
  )
}
