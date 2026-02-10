import { motion } from 'framer-motion'

const tips = [
  { icon: '🎯', text: 'Upload audio files to analyze customer calls' },
  { icon: '📊', text: 'View tasks by category or organize by client' },
  { icon: '⚡', text: 'High-risk calls are automatically flagged' },
  { icon: '💡', text: 'Click any task card to see full call details' }
]

export default function Tips() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
      <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
        <span className="text-lg">💡</span>
        Quick Tips
      </h3>
      
      <ul className="space-y-3">
        {tips.map((tip, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-start gap-3 text-sm text-slate-300"
          >
            <span className="text-base shrink-0">{tip.icon}</span>
            <span>{tip.text}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
