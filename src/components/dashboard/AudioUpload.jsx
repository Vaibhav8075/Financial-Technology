import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MAX_FILE_SIZE_MB = 10
const SUPPORTED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav']

export default function AudioUpload({ onAnalyze }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [duration, setDuration] = useState(null)
  const [dragging, setDragging] = useState(false)

  function validateFile(file) {
    if (!SUPPORTED_TYPES.includes(file.type) && !file.name.match(/\.(mp3|wav)$/i))
      return 'Unsupported format. Please upload MP3 or WAV.'
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024)
      return `File too large. Max ${MAX_FILE_SIZE_MB}MB allowed.`
    return ''
  }

  function handleFile(file) {
    const err = validateFile(file)
    if (err) { setError(err); setFile(null); setDuration(null); return }
    setError('')
    setFile(file)
    const audio = document.createElement('audio')
    audio.src = URL.createObjectURL(file)
    audio.onloadedmetadata = () => setDuration(audio.duration)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  function handleAnalyze() {
    if (!file) return
    onAnalyze(file)
    setFile(null)
    setDuration(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="rounded-xl p-6 space-y-4"
      style={{ background: '#EBE3D2', border: '1px solid #CCBFA3' }}
    >
      <div>
        <h3 className="text-lg font-semibold" style={{ color: '#414833' }}>Upload New Call</h3>
        <p className="text-sm mt-1" style={{ color: '#737A5D' }}>Add an audio file to analyze</p>
      </div>

      <motion.div
        onClick={() => inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        animate={{ scale: dragging ? 1.02 : 1, borderColor: dragging ? '#737A5D' : '#A4AC86' }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="cursor-pointer border-2 border-dashed rounded-xl p-8 text-center"
        style={{ background: dragging ? '#A4AC8615' : '#CCBFA322' }}
      >
        <div className="text-4xl mb-3">📁</div>
        <p className="text-sm font-medium" style={{ color: '#414833' }}>Drag & drop audio here</p>
        <p className="text-xs mt-1" style={{ color: '#737A5D' }}>
          or click to browse (MP3, WAV - max {MAX_FILE_SIZE_MB}MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".mp3,.wav,audio/mpeg,audio/wav"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </motion.div>

      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="rounded-lg p-4 space-y-2"
            style={{ background: '#CCBFA344', border: '1px solid #A4AC86' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#737A5D' }} />
              <p className="text-sm font-medium" style={{ color: '#414833' }}>{file.name}</p>
            </div>
            <div className="flex items-center justify-between text-xs" style={{ color: '#737A5D' }}>
              <span>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
              {duration && <span>Duration: {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>}
            </div>
          </motion.div>
        )}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm rounded-lg p-3"
            style={{ color: '#8B3030', background: '#8B303015', border: '1px solid #8B303040' }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={!file}
        onClick={handleAnalyze}
        className="w-full py-3 rounded-lg font-semibold transition-opacity"
        style={{ background: file ? '#414833' : '#CCBFA3', color: file ? '#EBE3D2' : '#737A5D', cursor: file ? 'pointer' : 'not-allowed' }}
      >
        {file ? 'Analyze Call' : 'Select a file to begin'}
      </motion.button>
    </motion.div>
  )
}
