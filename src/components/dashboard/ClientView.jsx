import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

export default function ClientView({ calls, onOpenCall }) {
  const [expandedClient, setExpandedClient] = useState(null)
  const [sortBy, setSortBy] = useState('recent') 

  
  const clientGroups = useMemo(() => {
    const groups = {}

    calls.forEach(call => {
      const clientName = call.customer_details?.name || 
                        call.title?.split('-')[0]?.trim() || 
                        'Unknown Client'
      
      const clientId = call.customer_details?.account_number || clientName

      if (!groups[clientId]) {
        groups[clientId] = {
          id: clientId,
          name: clientName,
          phone: call.customer_details?.phone_number,
          account: call.customer_details?.account_number,
          calls: [],
          totalActions: 0,
          highestPriority: 'low',
          highestRisk: 'Low',
          lastContact: null
        }
      }

      groups[clientId].calls.push(call)
      groups[clientId].totalActions += call.action_items?.length || 0
      
  
      if (call.priority === 'high' || groups[clientId].highestPriority === 'high') {
        groups[clientId].highestPriority = 'high'
      } else if (call.priority === 'medium' && groups[clientId].highestPriority === 'low') {
        groups[clientId].highestPriority = 'medium'
      }


      if (call.risk_level === 'High') {
        groups[clientId].highestRisk = 'High'
      } else if (call.risk_level === 'Medium' && groups[clientId].highestRisk === 'Low') {
        groups[clientId].highestRisk = 'Medium'
      }

      
      if (!groups[clientId].lastContact || call.id > groups[clientId].lastContact) {
        groups[clientId].lastContact = call.id
      }
    })

    return Object.values(groups)
  }, [calls])

 
  const sortedClients = useMemo(() => {
    const sorted = [...clientGroups]
    
    switch (sortBy) {
      case 'priority':
        sorted.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.highestPriority] - priorityOrder[a.highestPriority]
        })
        break
      case 'risk':
        sorted.sort((a, b) => {
          const riskOrder = { High: 3, Medium: 2, Low: 1 }
          return riskOrder[b.highestRisk] - riskOrder[a.highestRisk]
        })
        break
      case 'recent':
      default:
        sorted.sort((a, b) => b.lastContact - a.lastContact)
    }

    return sorted
  }, [clientGroups, sortBy])

  return (
    <div className="space-y-4">
     
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Clients Overview
        </h2>
        
     
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('recent')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              sortBy === 'recent'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setSortBy('priority')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              sortBy === 'priority'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Priority
          </button>
          <button
            onClick={() => setSortBy('risk')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              sortBy === 'risk'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Risk
          </button>
        </div>
      </div>

     
      {sortedClients.map(client => {
        const isExpanded = expandedClient === client.id
        
        return (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border overflow-hidden ${
              client.highestRisk === 'High' 
                ? 'border-red-500/50' 
                : client.highestPriority === 'high'
                ? 'border-orange-500/50'
                : 'border-slate-700/50'
            }`}
          >
          
            <button
              onClick={() => setExpandedClient(isExpanded ? null : client.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-4">
           
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {client.name.charAt(0).toUpperCase()}
                </div>

                <div className="text-left">
                  <h3 className="text-lg font-semibold text-slate-100">
                    {client.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                    {client.account && (
                      <span>Account: {client.account}</span>
                    )}
                    {client.phone && (
                      <span>• {client.phone}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
          
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                      {client.calls.length} {client.calls.length === 1 ? 'call' : 'calls'}
                    </span>
                    <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                      {client.totalActions} {client.totalActions === 1 ? 'action' : 'actions'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {client.highestPriority === 'high' && (
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
                        High Priority
                      </span>
                    )}
                    {client.highestRisk === 'High' && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                        ⚠ High Risk
                      </span>
                    )}
                  </div>
                </div>

                <motion.svg
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </div>
            </button>

           
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-slate-700/50 p-4 space-y-3"
              >
                {client.calls.map((call, idx) => (
                  <CallSummaryCard 
                    key={call.id} 
                    call={call} 
                    onOpenCall={onOpenCall}
                    index={idx}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        )
      })}

      {sortedClients.length === 0 && (
        <div className="text-center py-12 text-slate-400">
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onOpenCall(call)}
      className="bg-slate-900/50 rounded-lg p-4 cursor-pointer border border-slate-700/50 hover:border-slate-600 hover:bg-slate-900/70 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-slate-100">{call.title}</h4>
          <p className="text-sm text-slate-400 mt-1">Duration: {call.duration}</p>
        </div>
        <div className="flex gap-2">
          {call.priority === 'high' && (
            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
              High Priority
            </span>
          )}
          {call.risk_level === 'High' && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
              High Risk
            </span>
          )}
        </div>
      </div>

     
      <div className="grid grid-cols-2 gap-3 mb-3">
        {call.intent && (
          <div className="bg-slate-800/50 rounded p-2">
            <p className="text-xs text-slate-400">Intent</p>
            <p className="text-sm text-slate-200 font-medium">{call.intent.label}</p>
          </div>
        )}
        {call.sentiment && (
          <div className="bg-slate-800/50 rounded p-2">
            <p className="text-xs text-slate-400">Sentiment</p>
            <p className="text-sm text-slate-200 font-medium">{call.sentiment.label}</p>
          </div>
        )}
      </div>

     
      {call.action_items && call.action_items.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 mb-2">Action Items:</p>
          <div className="space-y-1">
            {call.action_items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <p className="text-sm text-slate-300">{item.task}</p>
              </div>
            ))}
            {call.action_items.length > 3 && (
              <p className="text-xs text-slate-500 mt-1">
                +{call.action_items.length - 3} more
              </p>
            )}
          </div>
        </div>
      )}

   
      {Array.isArray(call.summary) && call.summary.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <p className="text-xs text-slate-400 mb-1">Summary:</p>
          <p className="text-sm text-slate-300 line-clamp-2">
            {call.summary[0]}
          </p>
        </div>
      )}
    </motion.div>
  )
}
