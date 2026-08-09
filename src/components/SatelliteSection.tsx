import { Copy } from 'lucide-react';

export function SatelliteSection({ result, loading }: { result: any, loading: boolean }) {
  return (
    <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-md">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-emerald-400">🛰️ SATELLITE OBSERVATION</h2>
          {result && <button onClick={() => navigator.clipboard.writeText(JSON.stringify(result))} className="text-slate-500 hover:text-emerald-400"><Copy size={16} /></button>}
      </div>
      {loading ? (
        <div className="text-slate-500">Analyzing satellite data...</div>
      ) : result ? (
        <div className="space-y-4">
            {Object.entries(result).map(([key, value]) => (
                typeof value !== 'object' && <p key={key}><strong>SATELLITE {key.replace('_', ' ').toUpperCase()}:</strong> {value as any}</p>
            ))}
        </div>
      ) : (
        <div className="text-slate-500">Enter field location and data to see analysis.</div>
      )}
    </div>
  );
}
