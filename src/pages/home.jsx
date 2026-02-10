import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

import Header from '../components/dashboard/Header'
import Stats from '../components/dashboard/Stats'
import CategoryView from '../components/dashboard/CategoryView'
import ClientView from '../components/dashboard/ClientView'
import CallModal from '../components/dashboard/CallModal'
import AudioUpload from '../components/dashboard/AudioUpload'
import Queue from '../components/dashboard/Queue'
import Tips from '../components/dashboard/Tips'

const sampleCalls = []

export default function Home() {
  const fileInputRef = useRef(null)
  const [calls, setCalls] = useState(sampleCalls)
  const [selectedCall, setSelectedCall] = useState(null)
  const [query, setQuery] = useState('')
  const [activeView, setActiveView] = useState('category')
  const [stats, setStats] = useState({ total: 0, pending: 0, urgent: 0 })

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    handleAnalyzeCall(file)
  }

  async function handleAnalyzeCall(file) {
    const tempId = Date.now()

    setCalls(prev => [
      {
        id: tempId,
        title: file.name,
        duration: 'Processing...',
        priority: 'low',
        needsFollowUp: false,
      },
      ...prev,
    ])

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('http://127.0.0.1:8000/api/calls/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Analyze failed')

      const { call_id } = await res.json()

      const resultRes = await fetch(
        `http://127.0.0.1:8000/api/calls/result/${call_id}`
      )

      const data = await resultRes.json()

      setCalls(prev =>
        prev.map(call =>
          call.id === tempId
            ? {
                id: call_id,
                title: file.name,
                duration: data.duration || 'Completed',
                priority: data.priority || 'medium',
                needsFollowUp: data.action_items?.length > 0,
                transcript: data.transcript,
                summary: data.summary,
                intent: data.intent,
                sentiment: data.sentiment,
                action_items: data.action_items,
                risk_level: data.risk_level,
                customer_details: data.customer_details,
              }
            : call
        )
      )
    } catch (err) {
      console.error(err)
      alert('Backend error: ' + err.message)
      setCalls(prev => prev.filter(c => c.id !== tempId))
    }
  }

  useEffect(() => {
    const pending = calls.filter(c => 
      c.action_items?.some(item => !item.completed)
    ).length
    
    const urgent = calls.filter(c => 
      c.priority === 'high' || c.risk_level === 'High'
    ).length

    setStats({
      total: calls.length,
      pending,
      urgent,
    })
  }, [calls])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50"
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Header
          query={query}
          setQuery={setQuery}
          onUpload={handleUploadClick}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
        />

        <Stats stats={stats} />

        <div className="flex gap-4 mt-8 mb-6">
          <button
            onClick={() => setActiveView('category')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              activeView === 'category'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Category View
          </button>
          <button
            onClick={() => setActiveView('client')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              activeView === 'client'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Client View
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeView === 'category' ? (
              <CategoryView 
                calls={calls} 
                onOpenCall={(call) => setSelectedCall(call)}
              />
            ) : (
              <ClientView 
                calls={calls}
                onOpenCall={(call) => setSelectedCall(call)}
              />
            )}
          </div>

          <div className="space-y-6">
            <AudioUpload onAnalyze={handleAnalyzeCall} />
            <Queue calls={calls.filter(c => c.duration === 'Processing...')} />
            <Tips />
          </div>
        </div>
      </div>

      <CallModal
        call={selectedCall}
        onClose={() => setSelectedCall(null)}
      />
    </motion.div>
  )
}
