import { motion, AnimatePresence } from 'framer-motion'

const priorityColor = {
  high:   { color: '#8B3030', bg: '#8B303015', border: '#8B303040' },
  medium: { color: '#7A6A1A', bg: '#7A6A1A15', border: '#7A6A1A40' },
  low:    { color: '#414833', bg: '#41483315', border: '#41483340' },
}

const sentimentColor = {
  Negative: '#8B3030',
  Positive: '#414833',
  Neutral:  '#737A5D',
}

export default function CallModal({ call, onClose }) {
  if (!call) return null

  const finalIntent = call.final_decision?.intent || call.intent?.label || 'General Inquiry'
  const finalPriority = (call.final_decision?.priority || call.priority || 'medium').toLowerCase()
  const ruleIntent = call.rule_based?.intent?.label || call.intent?.label
  const rulePriority = (call.rule_based?.priority || call.priority || 'medium').toLowerCase()
  const aiVerification = call.ai_verification || null
  const aiChanged = aiVerification &&
    (aiVerification.verified_intent !== ruleIntent || aiVerification.verified_priority?.toLowerCase() !== rulePriority)

  function handleCopyToCRM() {
    const crmText = `
Customer Name: ${call.customer_details?.name || 'N/A'}
Phone: ${call.customer_details?.phone_number || 'N/A'}
Account: ${call.customer_details?.account_number || 'N/A'}
Card: ${call.customer_details?.card_number || 'N/A'}
Intent: ${finalIntent}
Priority: ${finalPriority}
Sentiment: ${call.sentiment?.label || 'N/A'}
Risk Level: ${call.risk_level || 'N/A'}
AI Verified: ${aiVerification ? 'Yes' : 'No'}
`.trim()
    navigator.clipboard.writeText(crmText)
    alert('Copied to clipboard')
  }

  const pc = priorityColor[finalPriority] || priorityColor.medium

  return (
    <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: '#41483380', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl shadow-2xl"
        style={{ background: '#EBE3D2', border: '1px solid #CCBFA3' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid #CCBFA3' }}>
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-xs uppercase tracking-widest mb-1 font-medium" style={{ color: '#A4AC86' }}>Call Analysis</p>
            <h2 className="text-xl font-bold truncate" style={{ color: '#414833' }}>{call.title}</h2>
            {call.customer_details?.name && (
              <p className="text-sm mt-1 font-medium" style={{ color: '#737A5D' }}>
                👤 {call.customer_details.name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all hover:opacity-70"
            style={{ color: '#737A5D', background: '#CCBFA355' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {call.customer_details && Object.keys(call.customer_details).some(k => call.customer_details[k]) && (
            <Section title="Customer Details">
              <div className="grid grid-cols-2 gap-3">
                {call.customer_details.name && <InfoTile label="Name" value={call.customer_details.name} />}
                {call.customer_details.phone_number && <InfoTile label="Phone" value={call.customer_details.phone_number} />}
                {call.customer_details.account_number && <InfoTile label="Account" value={call.customer_details.account_number} />}
                {call.customer_details.card_number && <InfoTile label="Card" value={call.customer_details.card_number} />}
              </div>
            </Section>
          )}

          <Section title="Final Decision">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4" style={{ background: '#CCBFA344', border: '1px solid #CCBFA3' }}>
                <p className="text-xs mb-1 uppercase tracking-wider" style={{ color: '#737A5D' }}>Intent</p>
                <p className="text-base font-bold" style={{ color: '#414833' }}>{finalIntent}</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: '#CCBFA344', border: '1px solid #CCBFA3' }}>
                <p className="text-xs mb-1 uppercase tracking-wider" style={{ color: '#737A5D' }}>Priority</p>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold" style={{ color: pc.color, background: pc.bg, border: `1px solid ${pc.border}` }}>
                  {finalPriority.charAt(0).toUpperCase() + finalPriority.slice(1)}
                </span>
              </div>
            </div>
          </Section>

          {call.risk_level === 'High' && (
            <div className="p-4 rounded-xl" style={{ background: '#8B303015', border: '1px solid #8B303040' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold" style={{ color: '#8B3030' }}>⚠ High Risk Alert</span>
              </div>
              <p className="text-sm" style={{ color: '#8B3030' }}>
                This call shows indicators of high emotional stress or financial risk. Immediate banker attention is recommended.
              </p>
            </div>
          )}

          {aiVerification && (
            <Section
              title="Backboard AI Verification"
             
              badge={aiChanged
                ? { text: 'Overrode Rules', color: '#737A5D', bg: '#737A5D15', border: '#737A5D40' }
                : { text: 'Confirmed', color: '#414833', bg: '#41483315', border: '#41483340' }}
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl p-4" style={{ background: '#A4AC8622', border: '1px solid #A4AC8655' }}>
                  <p className="text-xs mb-1 uppercase tracking-wider" style={{ color: '#737A5D' }}>AI Intent</p>
                  <p className="text-sm font-bold" style={{ color: '#414833' }}>{aiVerification.verified_intent}</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: '#A4AC8622', border: '1px solid #A4AC8655' }}>
                  <p className="text-xs mb-1 uppercase tracking-wider" style={{ color: '#737A5D' }}>AI Priority</p>
                  <p className="text-sm font-bold" style={{ color: '#414833' }}>{aiVerification.verified_priority}</p>
                </div>
              </div>
              {aiVerification.reasoning?.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#737A5D' }}>AI Reasoning</p>
                  <ul className="space-y-1.5">
                    {aiVerification.reasoning.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#414833' }}>
                        <span className="mt-0.5 shrink-0" style={{ color: '#737A5D' }}>›</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>
          )}

          <Section title="Rule-Based Analysis">
            <div className="grid grid-cols-3 gap-3">
              <InfoTile label="Intent" value={ruleIntent || '—'} />
              <InfoTile label="Priority" value={rulePriority ? rulePriority.charAt(0).toUpperCase() + rulePriority.slice(1) : '—'} />
              <div className="rounded-lg p-3" style={{ background: '#CCBFA344', border: '1px solid #CCBFA3' }}>
                <p className="text-xs mb-1" style={{ color: '#737A5D' }}>Sentiment</p>
                <p className="text-sm font-semibold" style={{ color: sentimentColor[call.sentiment?.label] || '#414833' }}>
                  {call.sentiment?.label || '—'}
                </p>
              </div>
            </div>
            {aiChanged && (
              <p className="text-xs mt-2 italic" style={{ color: '#737A5D' }}>
                * Backboard AI overrode one or more of these values in the final decision above.
              </p>
            )}
          </Section>

          {Array.isArray(call.summary) && call.summary.length > 0 && (
            <Section title="Banker Summary">
              <ul className="space-y-2">
                {call.summary.map((point, i) => {
                  const isRisk = point.toLowerCase().includes('risk') || point.toLowerCase().includes('negative') || point.toLowerCase().includes('immediate')
                  return (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: isRisk ? '#8B3030' : '#414833' }}>
                      <span className="mt-1 shrink-0" style={{ color: isRisk ? '#8B3030' : '#737A5D' }}>•</span>
                      <span>{point}</span>
                    </li>
                  )
                })}
              </ul>
            </Section>
          )}

          {call.transcript && (
            <Section title="Transcript">
              <div className="rounded-xl p-4 max-h-44 overflow-y-auto" style={{ background: '#CCBFA344', border: '1px solid #CCBFA3' }}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#414833' }}>
                  {call.transcript}
                </p>
              </div>
            </Section>
          )}

          <Section title="Suggested Response Email">
            <div className="rounded-xl p-4" style={{ background: '#CCBFA344', border: '1px solid #CCBFA3' }}>
              <p className="text-xs whitespace-pre-wrap leading-relaxed font-mono" style={{ color: '#414833' }}>
{`Dear ${call.customer_details?.name || 'Customer'},

We have reviewed your recent call regarding ${finalIntent}.

Our team is currently assessing your request and will update you shortly. If any additional information is required, we will reach out to you directly.

Thank you for your patience.

Regards,
Banking Support Team`}


              </p>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="p-4 flex gap-3" style={{ borderTop: '1px solid #CCBFA3' }}>
          <button
            onClick={handleCopyToCRM}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: '#CCBFA3', color: '#414833', border: '1px solid #A4AC86' }}
          >
            📋 Copy to CRM
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: '#414833', color: '#EBE3D2' }}
          >
            Close
          </button>
        </div>
      </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function Section({ title, badge, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
       
        <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#737A5D' }}>{title}</h4>
        {badge && (
          <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium" style={{ color: badge.color, background: badge.bg, border: `1px solid ${badge.border}` }}>
            {badge.text}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-lg p-3" style={{ background: '#CCBFA344', border: '1px solid #CCBFA3' }}>
      <p className="text-xs mb-1" style={{ color: '#737A5D' }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: '#414833' }}>{value}</p>
    </div>
  )
}