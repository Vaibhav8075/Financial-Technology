import { useRef, useState, useEffect } from 'react'

import Header from '../components/dashboard/Header'
import Stats from '../components/dashboard/Stats'
import CategoryView from '../components/dashboard/CategoryView'
import ClientView from '../components/dashboard/ClientView'
import CallModal from '../components/dashboard/CallModal'
import AudioUpload from '../components/dashboard/AudioUpload'
import Queue from '../components/dashboard/Queue'
import Tips from '../components/dashboard/Tips'

export default function Home() {
  const fileInputRef = useRef(null)
  const [calls, setCalls] = useState([])
  const [selectedCall, setSelectedCall] = useState(null)
  const [query, setQuery] = useState('')
  const [activeView, setActiveView] = useState('category')
  const [stats, setStats] = useState({ total: 0, high: 0, urgent: 0 })

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

    // Add a placeholder while processing
    setCalls(prev => [
      {
        id: tempId,
        title: file.name,
        status: 'processing',
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

      // Poll for result
      let data = null
      for (let i = 0; i < 30; i++) {
        const resultRes = await fetch(`http://127.0.0.1:8000/api/calls/result/${call_id}`)
        data = await resultRes.json()
        if (data.status === 'completed') break
        await new Promise(r => setTimeout(r, 2000))
      }

      if (!data || data.status !== 'completed') throw new Error('Processing timed out')

      // Map the backend response correctly
      // Backend shape:
      // {
      //   status, call_id,
      //   customer_details: { name, phone_number, account_number, card_number },
      //   rule_based: { intent: { label, confidence }, priority, sentiment: { label, score } },
      //   ai_verification: { verified_intent, verified_priority, reasoning: [] },
      //   final_decision: { intent, priority },
      //   summary: [],
      //   transcript: ""
      // }

      const mappedCall = {
        id: call_id,
        title: file.name,
        status: 'completed',

        // Customer info
        customer_details: data.customer_details || {},

        // Rule-based results
        rule_based: data.rule_based || {},

        // Backboard AI verification results — shown separately in UI
        ai_verification: data.ai_verification || {
          verified_intent: data.rule_based?.intent?.label,
          verified_priority: data.rule_based?.priority,
          reasoning: ['AI verification not available'],
        },

        // Final merged decision
        final_decision: data.final_decision || {
          intent: data.rule_based?.intent?.label,
          priority: data.rule_based?.priority,
        },

        // Convenience accessors (used by CategoryView / ClientView)
        intent: {
          label: data.final_decision?.intent || data.rule_based?.intent?.label || 'General Inquiry',
          confidence: data.rule_based?.intent?.confidence || 'Medium',
        },
        sentiment: data.rule_based?.sentiment || { label: 'Neutral', score: 0 },
        priority: (data.final_decision?.priority || data.rule_based?.priority || 'Medium').toLowerCase(),
        risk_level: data.rule_based?.sentiment?.label === 'Negative' ? 'High' : 'Low',

        summary: data.summary || [],
        transcript: data.transcript || '',

        // CategoryView needs action_items — derive from final intent since backend doesn't return them
        action_items: buildActionItems(data),
      }

      setCalls(prev =>
        prev.map(call => (call.id === tempId ? mappedCall : call))
      )
    } catch (err) {
      console.error(err)
      alert('Backend error: ' + err.message)
      setCalls(prev => prev.filter(c => c.id !== tempId))
    }
  }

  // Derive action items from backend data so CategoryView works
  function buildActionItems(data) {
    const intent = data.final_decision?.intent || data.rule_based?.intent?.label || ''
    const priority = data.final_decision?.priority || data.rule_based?.priority || 'Medium'
    const customerName = data.customer_details?.name || 'Customer'

    const items = []

    if (intent.toLowerCase().includes('loan')) {
      items.push({ task: `Process loan inquiry for ${customerName}`, completed: false })
    } else if (intent.toLowerCase().includes('withdrawal')) {
      items.push({ task: `Process withdrawal request for ${customerName}`, completed: false })
    } else if (intent.toLowerCase().includes('deposit')) {
      items.push({ task: `Process deposit request for ${customerName}`, completed: false })
    } else if (intent.toLowerCase().includes('complaint')) {
      items.push({ task: `Resolve complaint from ${customerName}`, completed: false })
    } else {
      items.push({ task: `Follow up with ${customerName} regarding inquiry`, completed: false })
    }

    if (priority === 'High' || data.rule_based?.sentiment?.label === 'Negative') {
      items.push({ task: `Escalate to senior banker — high priority case`, completed: false })
    }

    return items
  }

  useEffect(() => {
    const high = calls.filter(c => c.priority === 'high').length
    const urgent = calls.filter(c => c.risk_level === 'High').length

    setStats({
      total: calls.filter(c => c.status === 'completed').length,
      high,
      urgent,
    })
  }, [calls])

  return (
    <div className="min-h-screen" style={{ background: "#EBE3D2", color: "#414833" }}>
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
            className="px-6 py-2.5 rounded-lg font-semibold transition-all hover:opacity-90"
            style={activeView === 'category'
              ? { background: '#414833', color: '#EBE3D2', boxShadow: '0 4px 14px #41483340' }
              : { background: '#CCBFA366', color: '#737A5D', border: '1px solid #CCBFA3' }}
          >
            Category View
          </button>
          <button
            onClick={() => setActiveView('client')}
            className="px-6 py-2.5 rounded-lg font-semibold transition-all hover:opacity-90"
            style={activeView === 'client'
              ? { background: '#414833', color: '#EBE3D2', boxShadow: '0 4px 14px #41483340' }
              : { background: '#CCBFA366', color: '#737A5D', border: '1px solid #CCBFA3' }}
          >
            Client View
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeView === 'category' ? (
              <CategoryView
                calls={calls.filter(c => c.status === 'completed')}
                onOpenCall={(call) => setSelectedCall(call)}
              />
            ) : (
              <ClientView
                calls={calls.filter(c => c.status === 'completed')}
                onOpenCall={(call) => setSelectedCall(call)}
              />
            )}
          </div>

          <div className="space-y-6">
            <AudioUpload onAnalyze={handleAnalyzeCall} />
            <Queue calls={calls.filter(c => c.status === 'processing')} />
            <Tips />
          </div>
        </div>
      </div>

      <CallModal
        call={selectedCall}
        onClose={() => setSelectedCall(null)}
      />
    </div>
  )
}
