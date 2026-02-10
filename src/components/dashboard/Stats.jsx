import StatCard from './StatCard'

export default function Stats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
      <StatCard 
        label="Total Calls Analyzed" 
        value={stats.total} 
        icon="📊"
        gradient="from-blue-600 to-blue-500"
      />
      <StatCard 
        label="Pending Actions" 
        value={stats.pending} 
        icon="⏳"
        gradient="from-yellow-600 to-yellow-500"
      />
      <StatCard 
        label="Urgent Items" 
        value={stats.urgent} 
        icon="🔥"
        gradient="from-red-600 to-red-500"
      />
    </div>
  )
}
