import { motion } from 'framer-motion'

export default function CallModal({ call, onClose }) {
  if (!call) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="bg-zinc-900 p-6 rounded-xl w-full max-w-lg
                   border border-orange-900/20 shadow-2xl"
      >
        {/* Header */}
        <h2 className="text-xl font-semibold mb-1 text-orange-50">
          {call.title}
        </h2>

        <p className="text-xs text-orange-300 mb-4">
          Duration: {call.duration}
        </p>

        {/* Priority */}
        <div className="mb-4">
          <span className="text-xs text-orange-300">Priority</span>
          <p className="capitalize text-orange-100">{call.priority}</p>
        </div>

        {/* Follow-up */}
        {call.needsFollowUp && (
          <p className="text-orange-400 mb-4">
            ⚠ Needs follow-up
          </p>
        )}

        {/* 🔥 TRANSCRIPT */}
        {call.transcript && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-orange-400 mb-1">
              Transcript
            </h4>
            <p className="text-sm text-orange-100 whitespace-pre-wrap
                          bg-black/40 p-3 rounded-lg max-h-40 overflow-y-auto">
              {call.transcript}
            </p>
          </div>
        )}

        {/* 🔥 SUMMARY */}
        {call.summary && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-orange-400 mb-1">
              Summary
            </h4>
            <p className="text-sm text-orange-100 bg-black/40 p-3 rounded-lg">
              {call.summary}
            </p>
          </div>
        )}

        {/* 🔥 INTENT */}
        {call.intent && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-orange-400 mb-1">
              Intent
            </h4>
            <p className="text-sm text-orange-100">
              {call.intent.label} ({call.intent.confidence})
            </p>
          </div>
        )}

        {/* 🔥 SENTIMENT */}
        {call.sentiment && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-orange-400 mb-1">
              Sentiment
            </h4>
            <p className="text-sm text-orange-100">
              {call.sentiment.label}
            </p>
          </div>
        )}

        {/* 🔥 ACTION ITEMS */}
        {call.action_items?.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-orange-400 mb-1">
              Action Items
            </h4>
            <ul className="list-disc list-inside text-sm text-orange-100">
              {call.action_items.map((item, i) => (
                <li key={i}>{item.task}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-orange-500 hover:bg-orange-600
                     text-black py-2 rounded-lg font-semibold transition"
        >
          Close
        </button>
      </motion.div>
    </div>
  )
}
