// ViewToggle.jsx — Reusable table/grid view switcher
// Usage:
//   import ViewToggle from '../../Components/ViewToggle';
//   const [viewMode, setViewMode] = useState('table'); // or 'grid'
//   <ViewToggle viewMode={viewMode} onToggle={setViewMode} />

export default function ViewToggle({ viewMode, onToggle }) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onToggle('table')}
        title="Table view"
        className={`p-1.5 rounded-md transition-colors ${
          viewMode === 'table'
            ? 'bg-white text-red-600 shadow-sm'
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        {/* Table / list icon */}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 10h18M3 14h18M3 6h18M3 18h18" />
        </svg>
      </button>
      <button
        onClick={() => onToggle('grid')}
        title="Grid view"
        className={`p-1.5 rounded-md transition-colors ${
          viewMode === 'grid'
            ? 'bg-white text-red-600 shadow-sm'
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        {/* Grid icon */}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
    </div>
  );
}