import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

export default function CategoryView({ calls, onOpenCall }) {
  const [expandedCategory, setExpandedCategory] = useState('loan')

 
  const categories = useMemo(() => {
    const result = {
      loan: { requests: [], payoffs: [] },
      withdrawal: [],
      deposit: [],
      transfer: [],
      account: [],
      other: []
    }

    calls.forEach(call => {
      if (!call.intent || !call.action_items) return

      const intent = call.intent.label?.toLowerCase() || ''
      const actionItems = call.action_items || []

      actionItems.forEach(item => {
        const task = item.task?.toLowerCase() || ''
        const amount = extractAmount(task)
        
        const entry = {
          ...call,
          action: item,
          amount,
          clientName: extractClientName(call)
        }

        if (intent.includes('loan') || task.includes('loan')) {
          if (task.includes('request') || task.includes('apply') || task.includes('need') || task.includes('take')) {
            result.loan.requests.push(entry)
          } else if (task.includes('pay') || task.includes('payment') || task.includes('payoff')) {
            result.loan.payoffs.push(entry)
          } else {
            result.loan.requests.push(entry)
          }
        } else if (intent.includes('withdraw') || task.includes('withdraw')) {
          result.withdrawal.push(entry)
        } else if (intent.includes('deposit') || task.includes('deposit')) {
          result.deposit.push(entry)
        } else if (intent.includes('transfer') || task.includes('transfer')) {
          result.transfer.push(entry)
        } else if (intent.includes('account') || intent.includes('balance') || task.includes('account')) {
          result.account.push(entry)
        } else {
          result.other.push(entry)
        }
      })
    })

    return result
  }, [calls])

  function extractAmount(text) {
    const match = text.match(/\$?([\d,]+(\.\d{2})?)/);
    return match ? match[1] : 'N/A'
  }

  function extractClientName(call) {
    return call.customer_details?.name || 
           call.title?.split('-')[0]?.trim() || 
           'Unknown Client'
  }

  const categoryConfig = [
    {
      key: 'loan',
      title: 'Loan Services',
      icon: '💰',
      color: 'from-emerald-600 to-emerald-500',
      borderColor: 'border-emerald-500/30',
      subcategories: [
        { key: 'requests', title: 'Loan Requests', data: categories.loan.requests },
        { key: 'payoffs', title: 'Loan Payoffs', data: categories.loan.payoffs }
      ]
    },
    {
      key: 'withdrawal',
      title: 'Withdrawals',
      icon: '💵',
      color: 'from-orange-600 to-orange-500',
      borderColor: 'border-orange-500/30',
      data: categories.withdrawal
    },
    {
      key: 'deposit',
      title: 'Deposits',
      icon: '💳',
      color: 'from-blue-600 to-blue-500',
      borderColor: 'border-blue-500/30',
      data: categories.deposit
    },
    {
      key: 'transfer',
      title: 'Transfers',
      icon: '🔄',
      color: 'from-purple-600 to-purple-500',
      borderColor: 'border-purple-500/30',
      data: categories.transfer
    },
    {
      key: 'account',
      title: 'Account Services',
      icon: '🏦',
      color: 'from-cyan-600 to-cyan-500',
      borderColor: 'border-cyan-500/30',
      data: categories.account
    },
    {
      key: 'other',
      title: 'Other Requests',
      icon: '📋',
      color: 'from-slate-600 to-slate-500',
      borderColor: 'border-slate-500/30',
      data: categories.other
    }
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Tasks by Category
      </h2>

      {categoryConfig.map(category => {
        const hasSubcategories = category.subcategories
        const totalItems = hasSubcategories 
          ? category.subcategories.reduce((sum, sub) => sum + sub.data.length, 0)
          : category.data?.length || 0

        if (totalItems === 0) return null

        const isExpanded = expandedCategory === category.key

        return (
          <motion.div
            key={category.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border ${category.borderColor} overflow-hidden`}
          >
        
            <button
              onClick={() => setExpandedCategory(isExpanded ? null : category.key)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-slate-100">
                    {category.title}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </p>
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
            </button>

          
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-slate-700/50"
              >
                {hasSubcategories ? (
                  <div className="p-4 space-y-4">
                    {category.subcategories.map(sub => (
                      sub.data.length > 0 && (
                        <div key={sub.key}>
                          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                            {sub.title}
                            <span className="px-2 py-0.5 bg-slate-700 rounded-full text-xs">
                              {sub.data.length}
                            </span>
                          </h4>
                          <div className="space-y-2">
                            {sub.data.map((entry, idx) => (
                              <TaskCard key={idx} entry={entry} onOpenCall={onOpenCall} color={category.color} />
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {category.data?.map((entry, idx) => (
                      <TaskCard key={idx} entry={entry} onOpenCall={onOpenCall} color={category.color} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )
      })}

      {calls.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg">No calls analyzed yet</p>
          <p className="text-sm mt-2">Upload an audio file to get started</p>
        </div>
      )}
    </div>
  )
}

function TaskCard({ entry, onOpenCall, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 4 }}
      onClick={() => onOpenCall(entry)}
      className="bg-slate-900/50 rounded-lg p-3 cursor-pointer border border-slate-700/50 hover:border-slate-600 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold text-slate-100">{entry.clientName}</p>
          <p className="text-sm text-slate-300 mt-1">{entry.action.task}</p>
          {entry.amount !== 'N/A' && (
            <p className={`text-lg font-bold mt-2 bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
              ${entry.amount}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {entry.priority === 'high' && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
              Urgent
            </span>
          )}
          {entry.risk_level === 'High' && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
              ⚠ High Risk
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
