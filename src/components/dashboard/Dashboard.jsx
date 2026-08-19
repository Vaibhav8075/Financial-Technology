export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 p-4 rounded-lg border border-orange-900/20">
          <p className="text-sm text-orange-300">Total Calls</p>
          <p className="text-2xl font-bold text-orange-500">12</p>
        </div>

        <div className="bg-zinc-900 p-4 rounded-lg border border-orange-900/20">
          <p className="text-sm text-orange-300">Follow-ups</p>
          <p className="text-2xl font-bold text-orange-500">4</p>
        </div>

        <div className="bg-zinc-900 p-4 rounded-lg border border-orange-900/20">
          <p className="text-sm text-orange-300">High Priority</p>
          <p className="text-2xl font-bold text-orange-500">2</p>
        </div>
      </div>
    </div>
  )
}
