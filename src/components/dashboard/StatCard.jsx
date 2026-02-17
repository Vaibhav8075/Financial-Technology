import { motion } from 'framer-motion'

export default function StatCard({ label, value, icon, accentColor }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="relative overflow-hidden rounded-xl p-6"
      style={{ background: '#EBE3D2', border: `1px solid ${accentColor}44` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm mb-1 font-medium" style={{ color: '#737A5D' }}>{label}</p>
          <p className="text-3xl font-bold" style={{ color: '#414833' }}>{value}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
      <div className="mt-3 h-1 rounded-full" style={{ background: accentColor }} />
    </motion.div>
  )
}
