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
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Multer setup for image uploads
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  // Gemini API Setup
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy endpoint for Gemini to bypass VPN issues for external users
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { model, contents, config } = req.body;
      const response = await ai.models.generateContent({ 
        model: model || "gemini-3-flash-preview", 
        contents, 
        config 
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Image analysis endpoint (multi-modal)
  app.post("/api/ai/vision", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }
      const { prompt, model } = req.body;
      
      const response = await ai.models.generateContent({
        model: model || "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: req.file.mimetype,
                  data: req.file.buffer.toString("base64"),
                },
              },
            ],
          },
        ],
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Vision Error:", error);
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
