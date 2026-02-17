import { motion } from 'framer-motion'

const tips = [
  {text: 'Upload audio files to analyze customer calls' },
  { text: 'View tasks by category or organize by client' },
  { text: 'High-risk calls are automatically flagged' },
  { text: 'Click any task card to see full call details' }
]

export default function Tips() {
  return (
    <div className="rounded-xl p-5" style={{ background: '#EBE3D2', border: '1px solid #CCBFA3' }}>
      <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#414833' }}>
        <span className="text-lg">💡</span>
        Quick Tips
      </h3>
      <ul className="space-y-3">
        {tips.map((tip, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.07, duration: 0.3, ease: 'easeOut' }}
            className="flex items-start gap-3 text-sm"
            style={{ color: '#737A5D' }}
          >
            <span className="text-base shrink-0">{tip.icon}</span>
            <span>{tip.text}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
