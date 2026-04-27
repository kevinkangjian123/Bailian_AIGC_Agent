import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8080;

  app.use(cors());
  app.use(express.json());

  // Request Logging Middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });

  // Diagnostic Logs for Environment
  console.log("--- Environment Diagnostics ---");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("CWD:", process.cwd());
  console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "PRESENT (Masked)" : "MISSING");
  console.log("-------------------------------");

  // Multer setup for image uploads
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  // Gemini API Lazy Initialization Helper
  const getAiClient = () => {
    // Try multiple possible sources for the key
    const rawKey = process.env.API_KEY || process.env.GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
    
    // Clean the key: trim whitespace and remove potential surrounding quotes from platform injection
    const apiKey = rawKey?.trim().replace(/^["']|["']$/g, "");
    
    if (!apiKey) {
      const availableKeys = Object.keys(process.env).filter(k => k.includes("KEY") || k.includes("GEMINI"));
      console.error(`[Critical] API Key is missing. Available related keys: ${availableKeys.join(", ")}`);
      throw new Error("Gemini API Key environment variable is missing (tried API_KEY, GEMINI_API_KEY).");
    }

    if (apiKey === "undefined" || apiKey === "null" || apiKey.length < 10) {
      console.error(`[Critical] GEMINI_API_KEY value is invalid: "${apiKey}"`);
      throw new Error(`The provided GEMINI_API_KEY is invalid (too short or placeholder). Current value: ${apiKey}`);
    }

    // Safe logging for debugging
    console.log(`[Diagnostic] AI Client Init. Source: ${process.env.GEMINI_API_KEY ? "process.env" : "import.meta.env"}. Length: ${apiKey.length}. Prefix: ${apiKey.substring(0, 4)}`);
    
    return new GoogleGenAI({ apiKey });
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Test endpoint to verify API Key directly
  app.get("/api/ai/test", async (req, res) => {
    try {
      const rawKey = process.env.API_KEY || process.env.GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
      const cleanKey = rawKey?.trim().replace(/^["']|["']$/g, "");
      
      const availableKeys = Object.keys(process.env).filter(k => k.includes("KEY") || k.includes("GEMINI"));
      const keyPrefixes: Record<string, string> = {};
      availableKeys.forEach(k => {
        const val = process.env[k] || "";
        keyPrefixes[k] = val.length > 8 ? `${val.substring(0, 4)}...${val.substring(val.length - 4)}` : "TOO_SHORT";
      });
      
      const diagnostic = {
        hasRawKey: !!rawKey,
        rawLength: rawKey?.length || 0,
        cleanLength: cleanKey?.length || 0,
        prefix: cleanKey ? `${cleanKey.substring(0, 4)}...${cleanKey.substring(cleanKey.length - 4)}` : "N/A",
        envSource: process.env.GEMINI_API_KEY ? "process.env" : "import.meta.env",
        availableKeys: availableKeys,
        keyPrefixes: keyPrefixes
      };

      console.log("[Diagnostic Test]", diagnostic);

      const ai = getAiClient();
      console.log("[Diagnostic Test] Attempting gemini-3-flash-preview...");
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "Hi",
        });
        res.json({ success: true, text: response.text, diagnostic, model: "gemini-3" });
      } catch (gem3Error: any) {
        console.warn("[Diagnostic Test] gemini-3 failed, falling back to 1.5-flash...", gem3Error.message);
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: "Hi",
        });
        res.json({ success: true, text: response.text, diagnostic, model: "1.5-flash", gem3Error: gem3Error.message });
      }
    } catch (error: any) {
      console.error("Test API Error:", error);
      
      const availableKeys = Object.keys(process.env).filter(k => k.includes("KEY") || k.includes("GEMINI"));
      const keyPrefixes: Record<string, string> = {};
      availableKeys.forEach(k => {
        const val = process.env[k] || "";
        keyPrefixes[k] = val.length > 8 ? `${val.substring(0, 4)}...${val.substring(val.length - 4)}` : "TOO_SHORT";
      });

      res.status(500).json({ 
        success: false, 
        error: error.message,
        diagnostic: {
          availableKeys: availableKeys,
          keyPrefixes: keyPrefixes
        }
      });
    }
  });

  // Proxy endpoint for Gemini to bypass VPN issues for external users
  app.post("/api/ai/generate", async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);
    try {
      const { model, contents, config } = req.body;
      const rawKey = process.env.API_KEY || process.env.GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
      const apiKey = rawKey?.trim().replace(/^["']|["']$/g, "");
      
      if (!apiKey) {
        throw new Error("API Key is missing in environment.");
      }

      // Try multiple model names in order of preference
      const modelsToTry = [model, "gemini-3-flash-preview", "gemini-1.5-flash", "gemini-2.0-flash-exp"].filter(Boolean);
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

          // Use v1beta for access to the latest preview models like gemini-3
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          
          console.log(`[Generate][${requestId}] Attempting Gemini. Model: ${modelName}. API Version: v1beta`);

          const response = await fetch(url, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey 
            },
            body: JSON.stringify({ 
              contents: Array.isArray(contents) ? contents : [{ role: "user", parts: [{ text: String(contents) }] }],
              generationConfig: config 
            }),
            signal: controller.signal
          });

          clearTimeout(timeout);
          const data: any = await response.json();
          
          if (data.error) {
            console.warn(`[Generate][${requestId}] Model ${modelName} failed: ${data.error.message}`);
            lastError = data.error;
            continue; // Try next model
          }
          
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          console.log(`[Generate][${requestId}] Success with ${modelName}. Response preview: ${text?.substring(0, 50)}...`);
          return res.json({ text });
        } catch (err: any) {
          if (err.name === "AbortError") {
            console.error(`[Generate][${requestId}] Request timed out for ${modelName}`);
          } else {
            console.error(`[Generate][${requestId}] Fetch error for ${modelName}:`, err);
          }
          lastError = err;
        }
      }

      // If we reach here, all models failed
      throw lastError || new Error("All Gemini models failed to respond or timed out.");
    } catch (error: any) {
      console.error(`[Generate][${requestId}] Manual AI Error:`, error);
      res.status(500).json({ error: error.message || "Internal AI Error" });
    }
  });

  // Image analysis endpoint (multi-modal)
  app.post("/api/ai/vision", upload.single("image"), async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }
      const { prompt, model } = req.body;
      const rawKey = process.env.API_KEY || process.env.GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
      const apiKey = rawKey?.trim().replace(/^["']|["']$/g, "");
      
      if (!apiKey) throw new Error("API Key is missing");

      const modelsToTry = [model, "gemini-3-flash-preview", "gemini-1.5-flash", "gemini-2.0-flash-exp"].filter(Boolean);
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 90000); // 90s timeout for vision as it can be slower

          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          
          console.log(`[Vision][${requestId}] Attempting Gemini. Model: ${modelName}. API Version: v1beta`);

          const response = await fetch(url, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey 
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        mimeType: req.file!.mimetype,
                        data: req.file!.buffer.toString("base64"),
                      },
                    },
                  ],
                },
              ],
            }),
            signal: controller.signal
          });

          clearTimeout(timeout);
          const data: any = await response.json();
          if (data.error) {
            console.warn(`[Vision][${requestId}] Model ${modelName} failed: ${data.error.message}`);
            lastError = data.error;
            continue;
          }
          
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          console.log(`[Vision][${requestId}] Success with ${modelName}`);
          return res.json({ text });
        } catch (err: any) {
          if (err.name === "AbortError") {
            console.error(`[Vision][${requestId}] Request timed out for ${modelName}`);
          }
          lastError = err;
        }
      }
      
      throw lastError || new Error("All Vision models failed.");
    } catch (error: any) {
      console.error(`[Vision][${requestId}] Vision Error:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
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
