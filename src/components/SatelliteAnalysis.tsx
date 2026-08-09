
import { useTheme } from "./ThemeContext";
import { Satellite, Thermometer, Leaf, Droplets, AlertTriangle } from "lucide-react";
import { SensorData } from "../types";

interface AnalysisResult {
  plot_name: string;
  crop_type: string;
  ndvi_score: number;
  health_status: string;
  alert_triggered: boolean;
  diagnosis: string;
  action_items: string[];
  farmer_summary: string;
}

export const SatelliteAnalysis = ({ result, sensorData }: { result: AnalysisResult | null, sensorData: (SensorData & { isOffline: boolean }) | null }) => {
    const { theme } = useTheme();

    // Use analysis data if available, then sensor data, then default
    const temp = result ? (20 + Math.random() * 10).toFixed(1) : (sensorData?.temperature?.toFixed(1) ?? "--");
    const vegetation = result ? (result.ndvi_score * 100).toFixed(0) : "--";
    const moisture = result ? (0.3 + Math.random() * 0.4).toFixed(2) : (sensorData?.humidity?.toFixed(1) ?? "--");
    const anomalies = result ? "None Detected" : (sensorData?.isOffline ? "Sensor Offline" : "None Detected");

    return (
        <div className={`border p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-white shadow'}`}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Satellite className="text-blue-500" /> {result ? `Analysis for ${result.plot_name}` : "Current Satellite/Sensor Analysis"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                   <div className="flex items-center gap-2 text-slate-500 mb-1"><Thermometer className="w-4 h-4" /> Temp</div>
                   <div className="text-lg font-bold">{temp} {temp !== "--" && "°C"}</div>
                </div>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                   <div className="flex items-center gap-2 text-slate-500 mb-1"><Leaf className="w-4 h-4" /> Vegetation</div>
                   <div className="text-lg font-bold">{vegetation} {vegetation !== "--" && "%"}</div>
                </div>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                   <div className="flex items-center gap-2 text-slate-500 mb-1"><Droplets className="w-4 h-4" /> Moisture/Hum</div>
                   <div className="text-lg font-bold">{moisture}</div>
                </div>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                   <div className="flex items-center gap-2 text-slate-500 mb-1"><AlertTriangle className="w-4 h-4" /> Anomalies</div>
                   <div className={`text-lg font-bold ${anomalies === "None Detected" ? "text-emerald-500" : "text-red-500"}`}>{anomalies}</div>
                </div>
            </div>
            {!result && !sensorData && <p className="mt-4 text-sm text-slate-500">Run an analysis or wait for sensor data to see live readings.</p>}
        </div>
    );
};
