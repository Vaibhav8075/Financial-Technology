import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

import Header from '../components/dashboard/Header'
import Stats from '../components/dashboard/Stats'
import CallList from '../components/dashboard/CallList'
import CallModal from '../components/dashboard/CallModal'
import Queue from '../components/dashboard/Queue'
import Tips from '../components/dashboard/Tips'
import AudioUpload from '../components/dashboard/AudioUpload'

const sampleCalls = [
  { id: 1, title: 'Client A - Onboarding', duration: '12:34', priority: 'low', needsFollowUp: false },
  { id: 2, title: 'Client B - Billing issue', duration: '08:20', priority: 'high', needsFollowUp: true },
  { id: 3, title: 'Client C - Feature request', duration: '05:12', priority: 'medium', needsFollowUp: true },
]

export default function Home() {
  const fileInputRef = useRef(null)
  const [calls, setCalls] = useState(sampleCalls)
  const [selectedCall, setSelectedCall] = useState(null)

  const [query, setQuery] = useState('')
  const [stats, setStats] = useState({ total: 0, followUp: 0, highPriority: 0 })

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setCalls(prev => [
      {
        id: Date.now(),
        title: file.name,
        duration: '00:00',
        priority: 'low',
        needsFollowUp: false,
      },
      ...prev,
    ])
  }

  function handleAnalyzeCall(file) {
    setCalls(prev => [
      {
        id: Date.now(),
        title: file.name,
        duration: 'Processing...',
        priority: 'low',
        needsFollowUp: false,
      },
      ...prev,
    ])
  }

  useEffect(() => {
    setStats({
      total: calls.length,
      followUp: calls.filter(c => c.needsFollowUp).length,
      highPriority: calls.filter(c => c.priority === 'high').length,
    })
  }, [calls])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-zinc-950 text-orange-50"
    >
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Header
          query={query}
          setQuery={setQuery}
          onUpload={handleUploadClick}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
        />

        <Stats stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <CallList
            calls={calls}
            query={query}
            onOpen={setSelectedCall}
          />

          <div className="space-y-6">
            <AudioUpload onAnalyze={handleAnalyzeCall} />
            <Queue />
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
