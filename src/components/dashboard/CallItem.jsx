import { motion } from 'framer-motion'

export default function CallItem({ call, onOpen }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="flex justify-between p-3 rounded-lg"
      style={{ background: '#EBE3D2', border: '1px solid #CCBFA3' }}
    >
      <div>
        <p className="font-medium" style={{ color: '#414833' }}>{call.title}</p>
        <p className="text-sm" style={{ color: '#737A5D' }}>
          {call.duration} · {call.priority} priority
        </p>
      </div>
      <div className="flex items-center gap-3">
        {call.needsFollowUp && (
          <span className="text-sm font-medium" style={{ color: '#737A5D' }}>Needs follow-up</span>
        )}
        <button
          onClick={onOpen}
          className="px-3 py-1 rounded font-semibold text-sm transition-opacity hover:opacity-80"
          style={{ background: '#414833', color: '#EBE3D2' }}
        >
          Open
        </button>
      </div>
    </motion.div>
  )
}
