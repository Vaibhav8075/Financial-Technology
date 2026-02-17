import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ClientView({ calls, onOpenCall }) {
  const [expandedClient, setExpandedClient] = useState(null)
  const [sortBy, setSortBy] = useState('recent')

  const clientGroups = useMemo(() => {
    const groups = {}
    calls.forEach(call => {
      const clientName = call.customer_details?.name || call.title?.split('-')[0]?.trim() || 'Unknown Client'
      const clientId = call.customer_details?.account_number || clientName

      if (!groups[clientId]) {
        groups[clientId] = { id: clientId, name: clientName, phone: call.customer_details?.phone_number, account: call.customer_details?.account_number, calls: [], totalActions: 0, highestPriority: 'low', highestRisk: 'Low', lastContact: null }
      }

      groups[clientId].calls.push(call)
      groups[clientId].totalActions += call.action_items?.length || 0

      if (call.priority === 'high') groups[clientId].highestPriority = 'high'
      else if (call.priority === 'medium' && groups[clientId].highestPriority === 'low') groups[clientId].highestPriority = 'medium'

      if (call.risk_level === 'High') groups[clientId].highestRisk = 'High'
      else if (call.risk_level === 'Medium' && groups[clientId].highestRisk === 'Low') groups[clientId].highestRisk = 'Medium'

      if (!groups[clientId].lastContact || call.id > groups[clientId].lastContact) groups[clientId].lastContact = call.id
    })
    return Object.values(groups)
  }, [calls])

  const sortedClients = useMemo(() => {
    const sorted = [...clientGroups]
    switch (sortBy) {
      case 'priority': sorted.sort((a, b) => ({ high: 3, medium: 2, low: 1 }[b.highestPriority] - { high: 3, medium: 2, low: 1 }[a.highestPriority])); break
      case 'risk': sorted.sort((a, b) => ({ High: 3, Medium: 2, Low: 1 }[b.highestRisk] - { High: 3, Medium: 2, Low: 1 }[a.highestRisk])); break
      default: sorted.sort((a, b) => b.lastContact - a.lastContact)
    }
    return sorted
  }, [clientGroups, sortBy])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: '#414833' }}>Clients Overview</h2>
        <div className="flex gap-2">
          {['recent', 'priority', 'risk'].map(s => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortBy(s)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: sortBy === s ? '#414833' : '#CCBFA366',
                color: sortBy === s ? '#EBE3D2' : '#737A5D',
                border: `1px solid ${sortBy === s ? '#414833' : '#CCBFA3'}`
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      {sortedClients.map((client, idx) => {
        const isExpanded = expandedClient === client.id
        const borderColor = client.highestRisk === 'High' ? '#8B303060' : client.highestPriority === 'high' ? '#7A6A1A60' : '#CCBFA3'

        return (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3, ease: 'easeOut' }}
            className="rounded-xl overflow-hidden"
            style={{ background: '#EBE3D2', border: `1px solid ${borderColor}` }}
          >
            <button
              onClick={() => setExpandedClient(isExpanded ? null : client.id)}
              className="w-full p-4 flex items-center justify-between hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0" style={{ background: '#737A5D' }}>
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold" style={{ color: '#414833' }}>{client.name}</h3>
                  <div className="flex items-center gap-3 text-sm mt-1" style={{ color: '#737A5D' }}>
                    {client.account && <span>Account: {client.account}</span>}
                    {client.phone && <span>• {client.phone}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs" style={{ background: '#CCBFA3', color: '#414833' }}>{client.calls.length} {client.calls.length === 1 ? 'call' : 'calls'}</span>
                    <span className="px-2 py-1 rounded-full text-xs" style={{ background: '#CCBFA3', color: '#414833' }}>{client.totalActions} {client.totalActions === 1 ? 'action' : 'actions'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {client.highestPriority === 'high' && <span className="px-2 py-1 rounded-full text-xs" style={{ background: '#7A6A1A15', color: '#7A6A1A', border: '1px solid #7A6A1A40' }}>High Priority</span>}
                    {client.highestRisk === 'High' && <span className="px-2 py-1 rounded-full text-xs" style={{ background: '#8B303015', color: '#8B3030', border: '1px solid #8B303040' }}>⚠ High Risk</span>}
                  </div>
                </div>
                <motion.svg
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="w-5 h-5"
                  style={{ color: '#737A5D' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="p-4 space-y-3"
                  style={{ borderTop: '1px solid #CCBFA3' }}
                >
                  {client.calls.map((call, i) => (
                    <CallSummaryCard key={call.id} call={call} onOpenCall={onOpenCall} index={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}

      {sortedClients.length === 0 && (
        <div className="text-center py-12" style={{ color: '#737A5D' }}>
          <p className="text-lg">No clients yet</p>
          <p className="text-sm mt-2">Upload call recordings to see client information</p>
        </div>
      )}
    </div>
  )
}

function CallSummaryCard({ call, onOpenCall, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25, ease: 'easeOut' }}
      whileHover={{ scale: 1.005 }}
      onClick={() => onOpenCall(call)}
      className="rounded-lg p-4 cursor-pointer"
      style={{ background: '#CCBFA333', border: '1px solid #CCBFA3' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold" style={{ color: '#414833' }}>{call.title}</h4>
          <p className="text-sm mt-1" style={{ color: '#737A5D' }}>Duration: {call.duration}</p>
        </div>
        <div className="flex gap-2">
          {call.priority === 'high' && <span className="px-2 py-1 rounded-full text-xs" style={{ background: '#7A6A1A15', color: '#7A6A1A' }}>High Priority</span>}
          {call.risk_level === 'High' && <span className="px-2 py-1 rounded-full text-xs" style={{ background: '#8B303015', color: '#8B3030' }}>High Risk</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {call.intent && (
          <div className="rounded p-2" style={{ background: '#EBE3D288' }}>
            <p className="text-xs" style={{ color: '#737A5D' }}>Intent</p>
            <p className="text-sm font-medium" style={{ color: '#414833' }}>{call.intent.label}</p>
          </div>
        )}
        {call.sentiment && (
          <div className="rounded p-2" style={{ background: '#EBE3D288' }}>
            <p className="text-xs" style={{ color: '#737A5D' }}>Sentiment</p>
            <p className="text-sm font-medium" style={{ color: '#414833' }}>{call.sentiment.label}</p>
          </div>
        )}
      </div>

      {call.action_items?.length > 0 && (
        <div>
          <p className="text-xs mb-2" style={{ color: '#737A5D' }}>Action Items:</p>
          <div className="space-y-1">
            {call.action_items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span style={{ color: '#A4AC86' }}>•</span>
                <p className="text-sm" style={{ color: '#414833' }}>{item.task}</p>
              </div>
            ))}
            {call.action_items.length > 3 && <p className="text-xs mt-1" style={{ color: '#A4AC86' }}>+{call.action_items.length - 3} more</p>}
          </div>
        </div>
      )}

      {Array.isArray(call.summary) && call.summary.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid #CCBFA3' }}>
          <p className="text-xs mb-1" style={{ color: '#737A5D' }}>Summary:</p>
          <p className="text-sm line-clamp-2" style={{ color: '#414833' }}>{call.summary[0]}</p>
        </div>
      )}
    </motion.div>
  )
}
