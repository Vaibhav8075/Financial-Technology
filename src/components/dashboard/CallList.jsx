import CallItem from './CallItem'

export default function CallList({ calls, query, onOpen }) {
  return (
    <div className="lg:col-span-2 space-y-3">
      {calls
        .filter(c =>
          c.title.toLowerCase().includes(query.toLowerCase())
        )
        .map(call => (
          <CallItem
            key={call.id}
            call={call}
            onOpen={() => onOpen({ ...call })}  // 🔥 FIX
          />
        ))}
    </div>
  )
}
