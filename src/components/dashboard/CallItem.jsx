import { motion } from 'framer-motion'

export default function CallItem({ call, onOpen }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="flex justify-between bg-black/40 p-3 rounded-lg border border-orange-900/10"
    >
      <div>
        <p className="font-medium">{call.title}</p>
        <p className="text-sm text-orange-200">
          {call.duration} · {call.priority} priority
        </p>
      </div>

      <div className="flex items-center gap-3">
        {call.needsFollowUp && (
          <span className="text-orange-400 text-sm">Needs follow-up</span>
        )}

        <button
          onClick={onOpen}
          className="bg-orange-400 hover:bg-orange-500 text-black px-3 py-1 rounded"
        >
          Open
        </button>
      </div>
    </motion.div>
  )
}
