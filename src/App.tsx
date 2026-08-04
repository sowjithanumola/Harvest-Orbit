/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, AlertTriangle, TrendingUp, Cloud, Droplets, Thermometer, Info, MessageSquare, X, Send } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
  const [formData, setFormData] = useState({
    fieldName: "",
    cropType: "",
    coordinates: "",
    ndviScore: "",
    band8: "",
    band4: "",
    alertThreshold: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [activeInfo, setActiveInfo] = useState<string | null>(null);
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInfoClick = (info: string) => {
    setActiveInfo(activeInfo === info ? null : info);
  };
  
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    
    const newMessages = [...chatMessages, { role: 'user', content: chatInput } as ChatMessage];
    setChatMessages(newMessages);
    setChatInput("");
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput, history: newMessages.map(m => ({ role: m.role, parts: [{text: m.content}] })) }),
      });
      const data = await response.json();
      setChatMessages([...newMessages, { role: 'bot', content: data.response }]);
    } catch (error) {
      console.error("Chat error:", error);
    }
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

  const handleClear = () => {
    setFormData({
      fieldName: "",
      cropType: "",
      coordinates: "",
      ndviScore: "",
      band8: "",
      band4: "",
      alertThreshold: "",
    });
    setResult(null);
    setWeather(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setWeather(null);

    try {
      const [analysisRes, weatherRes] = await Promise.all([
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }),
        fetch(`/api/weather?coordinates=${formData.coordinates}`)
      ]);
      const result = await analysisRes.json();
      const weather = await weatherRes.json();
      setResult(result);
      setWeather(weather);
      
      // Trigger notification/alert if threshold met
      if (result.alert_triggered) {
          alert(`Alert: Crop health is below threshold for ${result.plot_name}!`);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 text-slate-900 p-6 md:p-12">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-emerald-950 tracking-tight">Harvest Orbit</h1>
        <p className="text-xl text-emerald-700 mt-3 font-medium">Your Satellite Agronomist AI</p>
      </header>
...
      <main className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-emerald-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Enter Field Data</h2>
            <button type="button" onClick={handleUseLocation} className="text-emerald-700 font-semibold hover:text-emerald-900 transition-colors">
              {locLoading ? "Locating..." : "Use Current Location"}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <input name="fieldName" value={formData.fieldName} onChange={handleInputChange} placeholder="Field Name" className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none" required />
              <button type="button" onClick={() => handleInfoClick("Field Name: The name you want to give to this specific field plot.")} className="absolute right-3 top-5 text-emerald-400 hover:text-emerald-600"><Info size={16} /></button>
            </div>
            <div className="relative">
              <input name="cropType" value={formData.cropType} onChange={handleInputChange} placeholder="Crop Type" className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none" required />
              <button type="button" onClick={() => handleInfoClick("Crop Type: The type of crop you are growing in this plot.")} className="absolute right-3 top-5 text-emerald-400 hover:text-emerald-600"><Info size={16} /></button>
            </div>
            <div className="relative">
              <input name="coordinates" value={formData.coordinates} onChange={handleInputChange} placeholder="Coordinates (e.g., 34.0, -118.2)" className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none" required />
              <button type="button" onClick={() => handleInfoClick("Coordinates: Latitude and longitude of your field, used to fetch local weather.")} className="absolute right-3 top-5 text-emerald-400 hover:text-emerald-600"><Info size={16} /></button>
            </div>
            <div className="relative">
              <input name="ndviScore" type="number" step="0.01" value={formData.ndviScore} onChange={handleInputChange} placeholder="NDVI Score" className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none" required />
              <button type="button" onClick={() => handleInfoClick("NDVI Score: Normalized Difference Vegetation Index, a measure of plant health (0-1).")} className="absolute right-3 top-5 text-emerald-400 hover:text-emerald-600"><Info size={16} /></button>
            </div>
            <div className="relative">
              <input name="band8" type="number" step="0.01" value={formData.band8} onChange={handleInputChange} placeholder="Band 8 (NIR)" className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none" required />
              <button type="button" onClick={() => handleInfoClick("Band 8 (NIR): Near-Infrared reflection value from satellite data.")} className="absolute right-3 top-5 text-emerald-400 hover:text-emerald-600"><Info size={16} /></button>
            </div>
            <div className="relative">
              <input name="band4" type="number" step="0.01" value={formData.band4} onChange={handleInputChange} placeholder="Band 4 (Red)" className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none" required />
              <button type="button" onClick={() => handleInfoClick("Band 4 (Red): Red spectrum reflection value from satellite data.")} className="absolute right-3 top-5 text-emerald-400 hover:text-emerald-600"><Info size={16} /></button>
            </div>
            <div className="relative">
              <input name="alertThreshold" type="number" step="0.01" value={formData.alertThreshold} onChange={handleInputChange} placeholder="Alert Threshold" className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none" required />
              <button type="button" onClick={() => handleInfoClick("Alert Threshold: The NDVI score below which you want to receive an alert.")} className="absolute right-3 top-5 text-emerald-400 hover:text-emerald-600"><Info size={16} /></button>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button type="submit" className="flex-1 bg-emerald-700 text-white p-4 rounded-xl font-bold text-lg hover:bg-emerald-900 transition-colors shadow-emerald-200 shadow-lg" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Field Health"}
            </button>
            <button type="button" onClick={handleClear} className="bg-emerald-100 text-emerald-800 p-4 rounded-xl font-semibold text-lg hover:bg-emerald-200 transition-colors">
              Clear
            </button>
          </div>
        </form>

        {activeInfo && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-emerald-950/20 backdrop-blur-sm" onClick={() => setActiveInfo(null)}>
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm text-lg font-semibold text-emerald-950" onClick={(e) => e.stopPropagation()}>
              {activeInfo}
            </div>
          </div>
        )}

        {result && weather && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10 bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-emerald-100">
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
              <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Leaf className="text-emerald-600" /> {result.plot_name} Health Report
              </h2>
              
              <div className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-6 border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold"><Thermometer className="text-orange-500" /> {weather.temperature}</div>
                <div className="flex items-center gap-2 text-emerald-800 font-semibold"><Droplets className="text-blue-500" /> {weather.humidity}</div>
                <div className="flex items-center gap-2 text-emerald-800 font-semibold"><Cloud className="text-slate-500" /> {weather.precipitation}</div>
              </div>
            </div>
            
            <div className={`p-6 rounded-2xl mb-8 ${result.alert_triggered ? 'bg-amber-50 text-amber-950 border border-amber-200' : 'bg-emerald-50 text-emerald-950 border border-emerald-200'}`}>
              <p className="font-bold text-xl flex items-center gap-3">
                {result.alert_triggered ? <AlertTriangle size={28} /> : <TrendingUp size={28} />}
                Current Status: <span className="font-black text-2xl">{result.health_status}</span>
              </p>
            </div>
            
            <div className="h-72 mb-10">
              <h3 className="font-bold text-slate-900 text-lg mb-4">NDVI Trend Analysis</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis domain={[0, 1]} stroke="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="ndvi" stroke="#047857" strokeWidth={4} dot={{ r: 6, fill: '#047857' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mb-8">
              <h3 className="font-bold text-slate-950 text-xl mb-3">Diagnosis</h3>
              <p className="text-slate-700 text-lg leading-relaxed">{result.diagnosis}</p>
            </div>
            <div className="mb-8">
              <h3 className="font-bold text-slate-950 text-xl mb-3">Recommended Actions</h3>
              <ul className="space-y-3 text-lg text-slate-700">
                {result.action_items.map((item, i) => <li key={i} className="flex items-start gap-3">
                  <span className="font-bold text-emerald-600">•</span> {item}
                </li>)}
              </ul>
            </div>
            <div className="bg-emerald-950 text-emerald-50 p-8 rounded-2xl text-lg font-medium shadow-inner">
              {result.farmer_summary}
            </div>
          </motion.div>
        )}
      </main>
      
      {/* Chatbot UI */}
      <div className="fixed bottom-6 right-6 z-50">
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-emerald-700 text-white p-4 rounded-full shadow-lg hover:bg-emerald-800 transition-colors">
          {isChatOpen ? <X /> : <MessageSquare />}
        </button>
        <AnimatePresence>
          {isChatOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-xl border border-emerald-100 p-4">
              <div className="h-64 overflow-y-auto mb-4 space-y-2">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`p-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-emerald-100 text-emerald-900 self-end ml-auto max-w-[80%]' : 'bg-slate-100 text-slate-800 self-start mr-auto max-w-[80%]'}`}>
                    {msg.content}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChatSend()} placeholder="Ask a question..." className="flex-1 p-2 border rounded-lg outline-none" />
                <button onClick={handleChatSend} className="bg-emerald-700 text-white p-2 rounded-lg hover:bg-emerald-800"><Send size={18} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
