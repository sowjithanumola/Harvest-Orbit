import { Copy } from 'lucide-react';

export function FieldSummarySection({ result, sensorData }: { result: any, sensorData: any }) {
  const summaryText = result ? result.farmer_summary : "Waiting for satellite data...";
  return (
    <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-md mt-8">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-emerald-400">🌾 FIELD SUMMARY</h2>
          {result && <button onClick={() => navigator.clipboard.writeText(summaryText)} className="text-slate-500 hover:text-emerald-400"><Copy size={16} /></button>}
      </div>
      {result || sensorData ? (
        <div className="space-y-4 text-slate-300">
            <p><strong>Satellite Assessment:</strong> {summaryText}</p>
            <p><strong>Ground Conditions:</strong> {sensorData && !sensorData.isOffline ? `Temp: ${sensorData.temperature.toFixed(1)}°C, Humidity: ${sensorData.humidity.toFixed(1)}%` : "Sensor data unavailable"}</p>
        </div>
      ) : (
        <div className="text-slate-500">Awaiting data to generate summary...</div>
      )}
    </div>
  );
}
