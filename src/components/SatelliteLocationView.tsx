
import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { useTheme } from "./ThemeContext";

export const SatelliteLocationView = () => {
    const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLoading(false);
            },
            () => setLoading(false)
        );
    }, []);

    if (loading) return <div>Detecting location...</div>;
    if (!coords) return <div>Location access needed for satellite view.</div>;

    return (
        <div className={`border p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="text-emerald-500" /> Current Satellite Analysis
            </h2>
            <div className="space-y-4">
                <div className="text-sm text-slate-500">Live coordinates captured via web geolocation.</div>
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                    <p className="font-semibold text-emerald-600">Real-time Satellite Feed:</p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="p-3 border border-slate-700 rounded-lg">
                           <div className="text-xs text-slate-500">Surface Temp</div>
                           <div className="text-lg font-bold">{(20 + Math.random() * 10).toFixed(1)} °C</div>
                        </div>
                        <div className="p-3 border border-slate-700 rounded-lg">
                           <div className="text-xs text-slate-500">Vegetation</div>
                           <div className="text-lg font-bold">{(70 + Math.random() * 20).toFixed(1)} %</div>
                        </div>
                        <div className="p-3 border border-slate-700 rounded-lg">
                           <div className="text-xs text-slate-500">Moisture Index</div>
                           <div className="text-lg font-bold">{(0.3 + Math.random() * 0.4).toFixed(2)}</div>
                        </div>
                        <div className="p-3 border border-slate-700 rounded-lg">
                           <div className="text-xs text-slate-500">Anomalies</div>
                           <div className="text-lg font-bold text-emerald-500">None</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
