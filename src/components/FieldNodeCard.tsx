import { SensorData } from '../types';
import { Thermometer, Droplets, Wifi } from 'lucide-react';

interface Props {
  data: SensorData | null;
}

export function FieldNodeCard({ data }: Props) {
  const isOnline = !!data;
  return (
    <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">FieldNode-01</h3>
          <div className={`flex items-center gap-2 text-sm ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
            {isOnline ? '● Online' : '○ Offline'}
          </div>
        </div>
      </div>
      
      {isOnline && data ? (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-800 p-2 rounded-lg">
                <Thermometer size={14} className="text-orange-400 mx-auto mb-1" />
                {data.temperature.toFixed(1)}°C
            </div>
            <div className="bg-slate-800 p-2 rounded-lg">
                <Droplets size={14} className="text-blue-400 mx-auto mb-1" />
                {data.humidity.toFixed(1)}%
            </div>
            <div className="bg-slate-800 p-2 rounded-lg">
                <Wifi size={14} className="text-emerald-400 mx-auto mb-1" />
                --
            </div>
        </div>
      ) : (
        <div className="h-16 flex items-center justify-center text-slate-600 text-sm">
            Device offline
        </div>
      )}
    </div>
  );
}
