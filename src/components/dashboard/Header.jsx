export default function Header({ query, setQuery, onUpload, fileInputRef, onFileChange }) {
  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
      <div>
        <h1 className="text-3xl font-extrabold">Call Review</h1>
        <p className="text-orange-200/70 text-sm">Analyze calls and surface priority items</p>
      </div>

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search calls..."
        className="bg-black/40 border border-orange-900/20 px-4 py-2 rounded-lg"
      />

      <button
        onClick={onUpload}
        className="bg-orange-500 text-black px-4 py-2 rounded-md font-semibold"
      >
        Upload
      </button>

      <input ref={fileInputRef} type="file" hidden accept="audio/*" onChange={onFileChange} />
    </header>
  )
}
