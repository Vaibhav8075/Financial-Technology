import { motion } from 'framer-motion'

export default function Queue({ calls = [] }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        <h3 className="font-semibold text-slate-100">Processing Queue</h3>
      </div>
      
      {calls.length > 0 ? (
        <div className="space-y-2">
          {calls.map((call, idx) => (
            <motion.div
              key={call.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50"
            >
              <p className="text-sm text-slate-300 font-medium truncate">{call.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <span className="text-xs text-slate-500">Processing...</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No calls currently processing</p>
      )}
    </div>
  )
}
