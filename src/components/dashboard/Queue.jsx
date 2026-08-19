import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

function ProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) return p  // stall near 100 until done
        return p + Math.random() * 4
      })
    }, 600)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: '#CCBFA3' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: '#737A5D' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}

export default function Queue({ calls = [] }) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#EBE3D2', border: '1px solid #CCBFA3' }}>
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ background: '#737A5D' }}
          animate={calls.length > 0 ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <h3 className="font-semibold" style={{ color: '#414833' }}>Processing Queue</h3>
        <AnimatePresence>
          {calls.length > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: '#737A5D22', color: '#737A5D', border: '1px solid #737A5D44' }}
            >
              {calls.length}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="popLayout">
        {calls.length > 0 ? (
          <motion.div className="space-y-2">
            {calls.map((call) => (
              <motion.div
                key={call.id}
                layout
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className="rounded-lg p-3"
                style={{ background: '#CCBFA344', border: '1px solid #CCBFA3' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: '#A4AC86' }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <p className="text-sm font-medium truncate" style={{ color: '#414833' }}>{call.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ProgressBar />
                  <span className="text-xs shrink-0" style={{ color: '#737A5D' }}>Analyzing…</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-sm"
            style={{ color: '#737A5D' }}
          >
            No calls currently processing
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
