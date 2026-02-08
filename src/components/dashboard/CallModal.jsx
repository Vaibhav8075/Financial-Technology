import { motion } from 'framer-motion'

export default function CallModal({ call, onClose }) {
  if (!call) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 p-6 rounded-xl w-full max-w-md border border-orange-900/20"
      >
        <h2 className="text-xl font-semibold mb-2">{call.title}</h2>

        <p className="text-sm text-orange-200 mb-2">
          Duration: {call.duration}
        </p>

        <p className="text-sm text-orange-200 mb-4 capitalize">
          Priority: {call.priority}
        </p>

        {call.needsFollowUp && (
          <p className="text-orange-400 mb-4">Needs follow-up</p>
        )}

        <button
          onClick={onClose}
          className="mt-4 bg-orange-500 text-black px-4 py-2 rounded"
        >
          Close
        </button>
      </motion.div>
    </div>
  )
}
