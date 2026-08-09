/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Map, Mail, Lock, User as UserIcon } from "lucide-react";
import { SensorData } from "./types";
import { SatelliteSection } from "./components/SatelliteSection";
import { GroundSensorSection } from "./components/GroundSensorSection";
import { FieldSummarySection } from "./components/FieldSummarySection";
import { MapComponent } from "./components/MapComponent";
import { db, auth, provider } from "./lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    User, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "firebase/auth";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import { ProfileModal } from "./components/ProfileModal";
import { SatelliteAnalysis } from "./components/SatelliteAnalysis";

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

interface WeatherData {
  temperature: string;
  humidity: string;
  precipitation: string;
}

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

// Dummy data for graph
const data = [
  { name: 'Week 1', ndvi: 0.6 },
  { name: 'Week 2', ndvi: 0.65 },
  { name: 'Week 3', ndvi: 0.7 },
  { name: 'Week 4', ndvi: 0.74 },
];

export default function App() {
  return (
    <ThemeProvider>
        <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authError, setAuthError] = useState("");
  const [formData, setFormData] = useState({
    fieldName: "",
    cropType: "",
    coordinates: "",
    ndviScore: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [sensorData, setSensorData] = useState<(SensorData & { isOffline: boolean }) | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "sensors", "FieldNode-01"), (doc) => {
      if (doc.exists()) {
        setSensorData(doc.data() as SensorData & { isOffline: boolean });
      }
    });
    return () => unsub();
  }, [user]);

  const handleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
        }
    } catch (error: any) {
        setAuthError(error.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseLocation = () => {
    setLocLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            coordinates: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          }));
          setLocLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocLoading(false);
          alert("Could not get location. Please enter coordinates manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setLocLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const analysisRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await analysisRes.json();
      setResult(result);
      
      if (result.alert_triggered) {
          alert(`Alert: ${result.farmer_summary}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const parseCoordinates = (coords: string): [number, number] | null => {
      const [lat, lng] = coords.split(',').map(c => parseFloat(c.trim()));
      return !isNaN(lat) && !isNaN(lng) ? [lat, lng] : null;
  };
  const coords = parseCoordinates(formData.coordinates);

  if (!user) {
      return (
          <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'} flex flex-col items-center justify-center gap-8 p-4`}>
              <h1 className="text-4xl font-extrabold text-emerald-600">Harvest Orbit</h1>
              <div className={`border p-8 rounded-2xl w-full max-w-sm space-y-6 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                  <h2 className="text-xl font-bold">Harvest Orbit</h2>
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                      <div className="relative">
                          <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={`w-full p-3 pl-10 border rounded-xl outline-none ${theme === 'dark' ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-300'}`} required />
                      </div>
                      <div className="relative">
                          <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={`w-full p-3 pl-10 border rounded-xl outline-none ${theme === 'dark' ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-300'}`} required />
                      </div>
                      <button type="submit" className="w-full bg-emerald-600 py-3 rounded-xl font-bold hover:bg-emerald-700">{isLoginMode ? "Login" : "Sign Up"}</button>
                  </form>
                  {authError && <p className="text-red-400 text-sm">{authError}</p>}
                  <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-sm text-slate-400 hover:text-white underline">
                      {isLoginMode ? "Need an account? Sign up" : "Have an account? Login"}
                  </button>
                  <div className="border-t border-slate-700 pt-6">
                      <button onClick={(e) => handleLogin(e as any)} className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-200">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" /> Login with Google
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} p-6 md:p-12 font-sans transition-colors duration-300`}>
      <header className="mb-12 flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-emerald-600 tracking-tight">Harvest Orbit</h1>
        <button onClick={() => setShowProfile(true)} className={`p-3 rounded-full ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white shadow'}`}>
            <UserIcon />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
            <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-white shadow'}`}>
                <h2 className="text-xl font-bold mb-4">📍 Select Field Location</h2>
                <button onClick={handleUseLocation} className="bg-emerald-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700">
                    {locLoading ? "Detecting..." : "Use My Location"}
                </button>
                <div className="mt-4 p-4 bg-slate-950 rounded-lg text-sm font-mono text-emerald-300">
                    {formData.coordinates || "No location selected"}
                </div>
            </div>
            
            <SatelliteAnalysis result={result} sensorData={sensorData} />
            <GroundSensorSection data={sensorData} />
            <FieldSummarySection result={result} sensorData={sensorData} />
        </div>

        <div className="space-y-8">
            <div className={`p-6 rounded-2xl h-96 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-white shadow'}`}>
                {coords ? (
                    <MapComponent lat={coords[0]} lng={coords[1]} />
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 gap-2">
                        <Map /> Select coordinates to view map
                    </div>
                )}
            </div>
            
            <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-white shadow'}`}>
                <h2 className="text-xl font-bold mb-6">Field Data Input</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="fieldName" value={formData.fieldName} onChange={handleInputChange} placeholder="Field Name" className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl outline-none" required />
                    <input name="cropType" value={formData.cropType} onChange={handleInputChange} placeholder="Crop Type" className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl outline-none" required />
                    <input name="coordinates" value={formData.coordinates} onChange={handleInputChange} placeholder="Coordinates (lat, lng)" className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl outline-none" required />
                    <button type="submit" className="w-full bg-emerald-600 p-4 rounded-xl font-bold hover:bg-emerald-700" disabled={loading}>
                    {loading ? "Analyzing..." : "Analyze Field Health"}
                    </button>
                </form>
            </div>
        </div>
      </div>
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
    </div>
  );
}
