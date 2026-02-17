export default function Header({ query, setQuery, onUpload, fileInputRef, onFileChange }) {
  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-4xl font-bold" style={{ color: '#414833' }}>
              Banking Call Analytics
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#A4AC8625', border: '1px solid #737A5D55', color: '#414833' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#737A5D' }} />
              Backboard AI
            </span>
          </div>
          <p className="text-sm" style={{ color: '#737A5D' }}>
            AI-powered call analysis
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: '#A4AC86' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search calls..."
              className="pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none w-64 transition-all"
              style={{ background: '#EBE3D2', border: '1px solid #CCBFA3', color: '#414833' }}
            />
          </div>

          <button
            onClick={onUpload}
            className="px-6 py-2.5 rounded-lg font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#414833', color: '#EBE3D2', boxShadow: '0 4px 14px #41483340' }}
          >
            Upload Call
          </button>
        </div>
      </div>

      <input ref={fileInputRef} type="file" hidden accept="audio/*" onChange={onFileChange} />
    </header>
  )
}
