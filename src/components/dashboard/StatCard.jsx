import { motion } from 'framer-motion'

export default function StatCard({ label, value, icon, highlight }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 280 }}
      className={`p-4 rounded-lg flex items-center gap-4 ${
        highlight
          ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-black'
          : 'bg-black/40 border border-orange-900/10'
      }`}
    >
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-sm text-orange-200">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </motion.div>
  )
}
