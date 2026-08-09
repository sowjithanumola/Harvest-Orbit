import { Thermometer, Droplets, Wifi, Copy } from 'lucide-react';
import { SensorData } from '../types';

interface Props {
  data: (SensorData & { isOffline: boolean }) | null;
}

export function GroundSensorSection({ data }: Props) {
  const isOnline = data && !data.isOffline;
  
  return (
    <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-md">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-emerald-400">🌱 GROUND SENSOR</h2>
          {isOnline && <button onClick={() => navigator.clipboard.writeText(JSON.stringify(data))} className="text-slate-500 hover:text-emerald-400"><Copy size={16} /></button>}
      </div>
      <div className="flex items-center justify-between mb-6">
          <span className="text-sm">FieldNode-01</span>
          <span className={`px-2 py-1 rounded text-xs ${isOnline ? 'bg-emerald-900 text-emerald-200' : 'bg-red-900 text-red-200'}`}>
            {isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}
          </span>
      </div>
      
      {isOnline && data ? (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-800 p-2 rounded-lg">
                <Thermometer size={14} className="text-orange-400 mx-auto mb-1" />
                <span className="block text-[10px] text-slate-400">GROUND TEMP</span>
                {data.temperature.toFixed(1)}°C
            </div>
            <div className="bg-slate-800 p-2 rounded-lg">
                <Droplets size={14} className="text-blue-400 mx-auto mb-1" />
                <span className="block text-[10px] text-slate-400">GROUND HUMID</span>
                {data.humidity.toFixed(1)}%
            </div>
            <div className="bg-slate-800 p-2 rounded-lg">
                <Wifi size={14} className="text-emerald-400 mx-auto mb-1" />
                <span className="block text-[10px] text-slate-400">STATUS</span>
                Active
            </div>
        </div>
      ) : (
        <div className="text-slate-500 text-center py-6">
            Waiting for sensor data...
        </div>
      )}
    </div>
  );
}
