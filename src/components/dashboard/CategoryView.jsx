import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CategoryView({ calls, onOpenCall }) {
  const [expandedCategory, setExpandedCategory] = useState('loan')

  const categories = useMemo(() => {
    const result = { loan: { requests: [], payoffs: [] }, withdrawal: [], deposit: [], transfer: [], account: [], other: [] }

    calls.forEach(call => {
      if (!call.intent || !call.action_items) return
      const intent = call.intent.label?.toLowerCase() || ''
      const actionItems = call.action_items || []

      actionItems.forEach(item => {
        const task = item.task?.toLowerCase() || ''
        const amount = extractAmount(task)
        const entry = { ...call, action: item, amount, clientName: extractClientName(call) }

        if (intent.includes('loan') || task.includes('loan')) {
          if (task.includes('pay') || task.includes('payment') || task.includes('payoff')) result.loan.payoffs.push(entry)
          else result.loan.requests.push(entry)
        } else if (intent.includes('withdraw') || task.includes('withdraw')) result.withdrawal.push(entry)
        else if (intent.includes('deposit') || task.includes('deposit')) result.deposit.push(entry)
        else if (intent.includes('transfer') || task.includes('transfer')) result.transfer.push(entry)
        else if (intent.includes('account') || intent.includes('balance') || task.includes('account')) result.account.push(entry)
        else result.other.push(entry)
      })
    })
    return result
  }, [calls])

  function extractAmount(text) {
    const match = text.match(/\$?([\d,]+(\.\d{2})?)/)
    return match ? match[1] : 'N/A'
  }

  function extractClientName(call) {
    return call.customer_details?.name || call.title?.split('-')[0]?.trim() || 'Unknown Client'
  }

  const categoryConfig = [
    { key: 'loan',       title: 'Loan Services', accentColor: '#414833', subcategories: [{ key: 'requests', title: 'Loan Requests', data: categories.loan.requests }, { key: 'payoffs', title: 'Loan Payoffs', data: categories.loan.payoffs }] },
    { key: 'withdrawal', title: 'Withdrawals', accentColor: '#737A5D', data: categories.withdrawal },
    { key: 'deposit',    title: 'Deposits', accentColor: '#A4AC86', data: categories.deposit },
    { key: 'transfer',   title: 'Transfers', accentColor: '#737A5D', data: categories.transfer },
    { key: 'account',    title: 'Account Services', accentColor: '#414833', data: categories.account },
    { key: 'other',      title: 'Other Requests', accentColor: '#CCBFA3', data: categories.other },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold" style={{ color: '#414833' }}>Tasks by Category</h2>

      {categoryConfig.map((category, catIdx) => {
        const hasSubcategories = category.subcategories
        const totalItems = hasSubcategories
          ? category.subcategories.reduce((sum, sub) => sum + sub.data.length, 0)
          : category.data?.length || 0

        if (totalItems === 0) return null
        const isExpanded = expandedCategory === category.key

        return (
          <motion.div
            key={category.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIdx * 0.05, duration: 0.3, ease: 'easeOut' }}
            className="rounded-xl overflow-hidden"
            style={{ background: '#EBE3D2', border: `1px solid ${category.accentColor}44` }}
          >
            <button
              onClick={() => setExpandedCategory(isExpanded ? null : category.key)}
              className="w-full p-4 flex items-center justify-between hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                {/* <span className="text-2xl">{category.icon}</span> */}
                <div className="text-left">
                  <h3 className="text-lg font-semibold" style={{ color: '#414833' }}>{category.title}</h3>
                  <p className="text-sm" style={{ color: '#737A5D' }}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
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
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  style={{ borderTop: `1px solid ${category.accentColor}33` }}
                >
                  {hasSubcategories ? (
                    <div className="p-4 space-y-4">
                      {category.subcategories.map(sub => sub.data.length > 0 && (
                        <div key={sub.key}>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#737A5D' }}>
                            {sub.title}
                            <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: '#CCBFA3', color: '#414833' }}>{sub.data.length}</span>
                          </h4>
                          <div className="space-y-2">
                            {sub.data.map((entry, idx) => <TaskCard key={idx} entry={entry} onOpenCall={onOpenCall} accentColor={category.accentColor} index={idx} />)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 space-y-2">
                      {category.data?.map((entry, idx) => <TaskCard key={idx} entry={entry} onOpenCall={onOpenCall} accentColor={category.accentColor} index={idx} />)}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}

      {calls.length === 0 && (
        <div className="text-center py-12" style={{ color: '#737A5D' }}>
          <p className="text-lg">No calls analyzed yet</p>
          <p className="text-sm mt-2">Upload an audio file to get started</p>
        </div>
      )}
    </div>
  )
}

function TaskCard({ entry, onOpenCall, accentColor, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25, ease: 'easeOut' }}
      whileHover={{ scale: 1.01, x: 3 }}
      onClick={() => onOpenCall(entry)}
      className="rounded-lg p-3 cursor-pointer"
      style={{ background: '#CCBFA333', border: '1px solid #CCBFA3' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold" style={{ color: '#414833' }}>{entry.clientName}</p>
          <p className="text-sm mt-1" style={{ color: '#737A5D' }}>{entry.action.task}</p>
          {entry.amount !== 'N/A' && (
            <p className="text-lg font-bold mt-2" style={{ color: accentColor }}>${entry.amount}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {entry.priority === 'high' && (
            <span className="px-2 py-1 rounded-full text-xs" style={{ background: '#8B303015', color: '#8B3030', border: '1px solid #8B303040' }}>Urgent</span>
          )}
          {entry.risk_level === 'High' && (
            <span className="px-2 py-1 rounded-full text-xs" style={{ background: '#8B303015', color: '#8B3030', border: '1px solid #8B303040' }}>⚠ High Risk</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
