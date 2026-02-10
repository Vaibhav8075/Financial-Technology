import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

const MAX_FILE_SIZE_MB = 10
const SUPPORTED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav']

export default function AudioUpload({ onAnalyze }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [duration, setDuration] = useState(null)

  function validateFile(file) {
    if (!SUPPORTED_TYPES.includes(file.type) && !file.name.match(/\.(mp3|wav)$/i)) {
      return 'Unsupported format. Please upload MP3 or WAV.'
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File too large. Max ${MAX_FILE_SIZE_MB}MB allowed.`
    }
    return ''
  }

  function handleFile(file) {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setFile(null)
      setDuration(null)
      return
    }

    setError('')
    setFile(file)

    const audio = document.createElement('audio')
    audio.src = URL.createObjectURL(file)
    audio.onloadedmetadata = () => {
      setDuration(audio.duration)
    }
  }

  function handleInputChange(e) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) handleFile(selectedFile)
  }

  function handleDrop(e) {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) handleFile(droppedFile)
  }

  function handleAnalyze() {
    if (!file) return
    onAnalyze(file)
    setFile(null)
    setDuration(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 space-y-4"
    >
      <div>
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="text-xl">🎙️</span>
          Upload New Call
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Add an audio file to analyze
        </p>
      </div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={() => inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className="cursor-pointer border-2 border-dashed border-slate-600 hover:border-blue-500 bg-slate-900/50 rounded-xl p-8 text-center transition-all"
      >
        <div className="text-4xl mb-3">📁</div>
        <p className="text-sm text-slate-300 font-medium">
          Drag & drop audio here
        </p>
        <p className="text-xs text-slate-500 mt-1">
          or click to browse (MP3, WAV - max {MAX_FILE_SIZE_MB}MB)
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".mp3,.wav,audio/mpeg,audio/wav"
          className="hidden"
          onChange={handleInputChange}
        />
      </motion.div>

      {file && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-4 space-y-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <p className="text-sm font-medium text-slate-200">{file.name}</p>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
            {duration && (
              <span>
                Duration: {Math.floor(duration / 60)}:
                {String(Math.floor(duration % 60)).padStart(2, '0')}
              </span>
            )}
          </div>
        </motion.div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3"
        >
          {error}
        </motion.p>
      )}

      <button
        disabled={!file}
        onClick={handleAnalyze}
        className={`w-full py-3 rounded-lg font-semibold transition-all ${
          file
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/30'
            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
        }`}
      >
        {file ? 'Analyze Call' : 'Select a file to begin'}
      </button>
    </motion.div>
  )
}
