import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

const MAX_FILE_SIZE_MB = 10
const SUPPORTED_TYPES = ['audio/mpeg', 'audio/wav']

export default function AudioUpload({ onAnalyze }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [duration, setDuration] = useState(null)

  function validateFile(file) {
    if (!SUPPORTED_TYPES.includes(file.type)) {
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
      className="bg-gradient-to-b from-zinc-900 to-black
                 border border-orange-900/20
                 rounded-2xl p-8 space-y-6 shadow-xl"
    >
    
      <div>
        <h3 className="text-lg font-semibold text-orange-50">
          Upload New Call
        </h3>
        <p className="text-sm text-orange-200/70">
          Add an audio file to analyze customer calls
        </p>
      </div>

   
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={() => inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className="cursor-pointer
                   border border-dashed border-orange-500/30
                   bg-black/30 rounded-xl p-8 text-center
                   transition-colors hover:border-orange-500"
      >
        <p className="text-sm text-orange-200">
          Drag & drop audio here
        </p>
        <p className="text-xs text-orange-400 mt-1">
          or click to browse (mp3, wav)
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".mp3,.wav"
          className="hidden"
          onChange={handleInputChange}
        />
      </motion.div>

     
      {file && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-zinc-900/80 rounded-xl p-4 text-sm space-y-1"
        >
          <p><span className="text-orange-300">File:</span> {file.name}</p>
          <p>
            <span className="text-orange-300">Size:</span>{' '}
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
          {duration && (
            <p>
              <span className="text-orange-300">Duration:</span>{' '}
              {Math.floor(duration / 60)}:
              {String(Math.floor(duration % 60)).padStart(2, '0')}
            </p>
          )}
        </motion.div>
      )}


      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-sm"
        >
          {error}
        </motion.p>
      )}

      <button
        disabled={!file}
        onClick={handleAnalyze}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${
          file
            ? 'bg-orange-500 text-black hover:bg-orange-600'
            : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
        }`}
      >
        Analyze Call
      </button>
    </motion.div>
  )
}
