export default function Header({ query, setQuery, onUpload, fileInputRef, onFileChange }) {
  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white ">
            Banking Call Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            AI-powered call analysis and task management
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500"
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
              className="bg-slate-800/50 border border-slate-700 pl-10 pr-4 py-2.5 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all w-64"
            />
          </div>

          <button
            onClick={onUpload}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
          >
            Upload Call
          </button>
        </div>
      </div>

      <input ref={fileInputRef} type="file" hidden accept="audio/*" onChange={onFileChange} />
    </header>
  )
}
