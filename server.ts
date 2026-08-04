import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Proxy Route
  app.post("/api/analyze", async (req, res) => {
    const { fieldName, cropType, coordinates, ndviScore, band8, band4, alertThreshold } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" },
      },
    });

    const prompt = `Analyze the following Earth Observation field report:
Field Name: ${fieldName}
Crop Type: ${cropType}
Location: ${coordinates}
Computed NDVI Score: ${ndviScore}
Band 8 (Near-Infrared Reflectance): ${band8}
Band 4 (Red Spectrum Reflectance): ${band4}
Alert Health Threshold: ${alertThreshold}

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
          systemInstruction: `You are Harvest Orbit's Lead Satellite Agronomist AI, designed to democratize Earth Observation data for small-scale farmers, school biology clubs, and urban gardeners.

Your job is to take multispectral satellite data (such as NDVI vegetation scores, Near-Infrared Band 8, and Visible Red Band 4) and translate it into plain-language, encouraging, and highly actionable farming advice.

Guidelines:
1. Avoid dense scientific jargon; explain terms simply if you mention them.
2. Be direct and helpful. Prioritize practical physical steps (e.g., check soil moisture, inspect leaves, apply natural fertilizer).
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
    // In a real app, use a weather API here (e.g., OpenWeatherMap)
    // Simulating weather data for demo purposes
    res.json({
      temperature: "28°C",
      humidity: "65%",
      precipitation: "10%"
    });
  });

  // Chat Bot Proxy Route
  app.post("/api/chat", async (req, res) => {
    const { message, history } = req.body;
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
    
    try {
        const result = await chat.sendMessage(message);
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
