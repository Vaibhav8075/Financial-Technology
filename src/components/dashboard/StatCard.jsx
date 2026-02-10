import { motion } from 'framer-motion'

export default function StatCard({ label, value, icon, gradient }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="relative overflow-hidden rounded-xl"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-10`} />
      <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">{label}</p>
            <p className="text-3xl font-bold text-slate-100">{value}</p>
          </div>
          <div className="text-4xl opacity-80">{icon}</div>
        </div>
        <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${gradient}`} />
      </div>
    </motion.div>
  )
}
