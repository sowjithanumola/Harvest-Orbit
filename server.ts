import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.url}`);
    next();
  });

  // Sensor Data Store
  let latestSensorData: Record<string, { data: any, lastUpdated: number }> = {};

  app.post("/api/sensor-data", (req, res) => {
    const { deviceId, ...data } = req.body;
    if (!deviceId) return res.status(400).json({ error: "deviceId required" });
    latestSensorData[deviceId] = { data, lastUpdated: Date.now() };
    res.status(200).json({ status: "ok" });
  });

  app.get("/api/sensor-data/:deviceId", (req, res) => {
    const { deviceId } = req.params;
    console.log(`Fetching data for device: ${deviceId}`);
    const nodeData = latestSensorData[deviceId];
    if (!nodeData) return res.status(404).json({ error: "Node not found" });
    
    // Check if offline (e.g., no update in 60s)
    const isOffline = Date.now() - nodeData.lastUpdated > 60000;
    res.json({ ...nodeData.data, isOffline });
  });

  // Gemini API Proxy Route
  app.post("/api/analyze", async (req, res) => {
    const { fieldName, cropType, coordinates, ndviScore } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" },
      },
    });

    const nodeData = latestSensorData["FieldNode-01"];
    const sensorInfo = nodeData ? `Temperature: ${nodeData.data.temperature}°C, Humidity: ${nodeData.data.humidity}%, Heat Index: ${nodeData.data.heatIndex}°C` : "No recent sensor data";
    
    const prompt = `Analyze the following Earth Observation field report, considering the latest ESP32 sensor data:
Field Name: ${fieldName}
Crop Type: ${cropType}
Location: ${coordinates}
Computed NDVI Score: ${ndviScore}
Current ESP32 Sensor Data: ${sensorInfo}

Provide a 3-part diagnosis and recommendation report for the farmer. Format your response strictly in the following JSON structure:

{
  "plot_name": "String",
  "crop_type": "String",
  "ndvi_score": Number,
  "health_status": "Optimal | Moderate Stress | Severe Degradation",
  "alert_triggered": Boolean,
  "diagnosis": "String",
  "action_items": ["String"],
  "farmer_summary": "String"
}
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are Harvest Orbit's Lead Satellite Agronomist AI.
Translate multispectral satellite data into plain-language, encouraging, and highly actionable farming advice.
Guidelines:
1. Avoid dense scientific jargon.
2. Be direct and helpful. Prioritize practical physical steps.
3. Always format your output strictly as the requested JSON structure.`,
          responseMimeType: "application/json",
        },
      });

      const jsonText = response.text;
      if (!jsonText) throw new Error("No response from AI");
      res.json(JSON.parse(jsonText));
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: "Failed to analyze field data" });
    }
  });

  // Weather Data Proxy Route
  app.get("/api/weather", async (req, res) => {
    const { coordinates } = req.query;
    // In a production app, use NASA_API_KEY to fetch weather from NASA POWER API.
    // For now, simulate with temperature data from ESP32.
    res.json({
      temperature: `${latestSensorData.temperature.toFixed(1)}°C`,
      humidity: `${latestSensorData.humidity.toFixed(1)}%`,
      precipitation: "N/A"
    });
  });

  // Chat Bot Proxy Route
  app.post("/api/chat", async (req, res) => {
    const { message, history, context } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    
    const chat = ai.models.startChat({
        model: "gemini-3.6-flash",
        history: history || [],
    });
    
    const prompt = `Answer the following question about the field, considering the provided context (Field Report and ESP32 Sensor data):
Question: ${message}
Context: ${JSON.stringify(context)}
`;
    
    try {
        const result = await chat.sendMessage(prompt);
        res.json({ response: result.text });
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ error: "Chat error" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
