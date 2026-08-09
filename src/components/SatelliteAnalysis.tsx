
import { useTheme } from "./ThemeContext";
import { Satellite, Thermometer, Leaf, Droplets, AlertTriangle } from "lucide-react";

export const SatelliteAnalysis = () => {
    const { theme } = useTheme();

    return (
        <div className={`border p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-white shadow'}`}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Satellite className="text-blue-500" /> Current Satellite Analysis
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                   <div className="flex items-center gap-2 text-slate-500 mb-1"><Thermometer className="w-4 h-4" /> Temp</div>
                   <div className="text-lg font-bold">24.5 °C</div>
                </div>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                   <div className="flex items-center gap-2 text-slate-500 mb-1"><Leaf className="w-4 h-4" /> Vegetation</div>
                   <div className="text-lg font-bold">82 %</div>
                </div>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                   <div className="flex items-center gap-2 text-slate-500 mb-1"><Droplets className="w-4 h-4" /> Moisture</div>
                   <div className="text-lg font-bold">0.45</div>
                </div>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                   <div className="flex items-center gap-2 text-slate-500 mb-1"><AlertTriangle className="w-4 h-4" /> Anomalies</div>
                   <div className="text-lg font-bold text-emerald-500">None</div>
                </div>
            </div>
        </div>
    );
};
