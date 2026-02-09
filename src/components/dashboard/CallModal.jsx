import { motion } from 'framer-motion'

export default function CallModal({ call, onClose }) {
  if (!call) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="
          bg-zinc-900 rounded-xl w-full max-w-2xl
          border border-orange-900/20 shadow-2xl
          max-h-[85vh] flex flex-col
        "
      >

      
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

       
          <div>
            <h2 className="text-xl font-semibold text-orange-50">
              {call.title}
            </h2>
            <p className="text-xs text-orange-300">
              Duration: {call.duration}
            </p>
          </div>

     
          <div>
            <span className="text-xs text-orange-300">Priority</span>
            <p className="capitalize text-orange-100">{call.priority}</p>
          </div>

        
          {call.needsFollowUp && (
            <p className="text-orange-400">⚠ Needs follow-up</p>
          )}

         
          {call.transcript && (
            <div>
              <h4 className="text-sm font-semibold text-orange-400 mb-1">
                Transcript
              </h4>
              <p className="text-sm text-orange-100 whitespace-pre-wrap
                            bg-black/40 p-3 rounded-lg max-h-40 overflow-y-auto">
                {call.transcript}
              </p>
            </div>
          )}

      
          {Array.isArray(call.summary) && (
            <div>
              <h4 className="text-sm font-semibold text-orange-400 mb-2">
                Banker Summary
              </h4>
              <ul className="space-y-2 bg-black/40 p-4 rounded-lg">
                {call.summary.map((point, index) => {
                  const isRisk =
                    point.toLowerCase().includes("risk") ||
                    point.toLowerCase().includes("priority") ||
                    point.toLowerCase().includes("negative")

                  return (
                    <li
                      key={index}
                      className={`flex items-start gap-2 text-sm ${
                        isRisk ? "text-red-400" : "text-orange-100"
                      }`}
                    >
                      <span className="mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

     
          <button
            onClick={() => {
              const crmText = `
Customer Name: ${call.customer_details?.name || "N/A"}
Phone: ${call.customer_details?.phone_number || "N/A"}
Account: ${call.customer_details?.account_number || "N/A"}
Intent: ${call.intent?.label}
Priority: ${call.priority}
Risk: ${call.risk_level}
`
              navigator.clipboard.writeText(crmText)
              alert("Copied to CRM clipboard")
            }}
            className="w-full bg-zinc-800 hover:bg-zinc-700
                       text-orange-300 py-2 rounded-lg text-sm transition"
          >
            Copy to CRM
          </button>

         
          <div className="bg-black/40 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-orange-400 mb-2">
              Suggested Banker Email
            </h4>
            <p className="text-sm text-orange-100 whitespace-pre-wrap">
              Dear Customer,

              We have reviewed your recent call regarding {call.intent?.label}.
              Our team has identified this as a {call.priority} priority case.

              We will assist you shortly.

              Regards,
              Banking Support Team
            </p>
          </div>

         
          {call.intent && (
            <div>
              <h4 className="text-sm font-semibold text-orange-400 mb-1">
                Intent
              </h4>
              <p className="text-sm text-orange-100">
                {call.intent.label} ({call.intent.confidence})
              </p>
            </div>
          )}

      
          {call.sentiment && (
            <div>
              <h4 className="text-sm font-semibold text-orange-400 mb-1">
                Sentiment
              </h4>
              <p className="text-sm text-orange-100">
                {call.sentiment.label}
              </p>
            </div>
          )}

     
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 p-3 rounded-lg border border-orange-900/20">
              <p className="text-xs text-orange-400">Intent Confidence</p>
              <p className="text-sm text-orange-100">
                {call.intent?.confidence || "Medium"}
              </p>
            </div>

            <div
              className={`p-3 rounded-lg border ${
                call.risk_level === "High"
                  ? "bg-red-900/30 border-red-600 text-red-300"
                  : "bg-black/40 border-orange-900/20 text-orange-100"
              }`}
            >
              <p className="text-xs text-orange-400">Risk Level</p>
              <p className="text-sm font-semibold">
                {call.risk_level || "Low"}
              </p>
            </div>
          </div>

       
          {call.risk_level === "High" && (
            <div className="p-4 rounded-lg bg-red-900/30 border border-red-600">
              <h4 className="text-sm font-semibold text-red-400 mb-1">
                ⚠ Risk Alert
              </h4>
              <p className="text-sm text-red-300">
                This call shows indicators of high emotional stress or financial risk.
                Immediate banker attention is recommended.
              </p>
            </div>
          )}

         
          {call.action_items?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-orange-400 mb-1">
                Action Items
              </h4>
              <ul className="list-disc list-inside text-sm text-orange-100">
                {call.action_items.map((item, i) => (
                  <li key={i}>{item.task}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

    
        <div className="p-4 border-t border-orange-900/20">
          <button
            onClick={onClose}
            className="w-full bg-orange-500 hover:bg-orange-600
                       text-black py-2 rounded-lg font-semibold transition"
          >
            Close
          </button>
        </div>

      </motion.div>
    </div>
  )
}
