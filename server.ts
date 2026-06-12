import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Route for individual courier summaries
  app.get("/api/courier/summary", async (req, res) => {
    try {
      const searchTerm = req.query.searchTerm as string;
      const clientApiKey = req.query.apiKey as string || req.headers["x-courier-api-key"] as string;
      const apiKey = process.env.COURIER_API_KEY || clientApiKey;

      if (!searchTerm) {
        return res.status(400).json({ error: "searchTerm (phone number) is required" });
      }

      if (!apiKey) {
        return res.status(401).json({ error: "API Key is required. Please set COURIER_API_KEY env variable or input in settings." });
      }

      const url = `https://dash.hoorin.com/api/courier/api?apiKey=${encodeURIComponent(apiKey)}&searchTerm=${encodeURIComponent(searchTerm)}`;
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ error: `Courier API returned status ${response.status}`, status: response.status });
      }
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error("Courier Summary Error:", err);
      res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  });

  // API Route for total parcel summary (sheet)
  app.get("/api/courier/sheet", async (req, res) => {
    try {
      const searchTerm = req.query.searchTerm as string;
      const clientApiKey = req.query.apiKey as string || req.headers["x-courier-api-key"] as string;
      const apiKey = process.env.COURIER_API_KEY || clientApiKey;

      if (!searchTerm) {
        return res.status(400).json({ error: "searchTerm (phone number) is required" });
      }

      if (!apiKey) {
        return res.status(401).json({ error: "API Key is required. Please set COURIER_API_KEY env variable or input in settings." });
      }

      const url = `https://dash.hoorin.com/api/courier/sheet?apiKey=${encodeURIComponent(apiKey)}&searchTerm=${encodeURIComponent(searchTerm)}`;
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ error: `Courier Sheet API returned status ${response.status}`, status: response.status });
      }
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error("Courier Sheet Error:", err);
      res.status(500).json({ error: err.message || "Internal Server Error" });
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
    // Extremely robust path resolution compatible with ESM/CJS and any working directory on Node 24
    let distPath = path.join(process.cwd(), 'dist');
    try {
      const fs = require('fs');
      if (!fs.existsSync(distPath)) {
        distPath = __dirname.endsWith('dist') ? __dirname : path.join(__dirname, 'dist');
      }
    } catch {
      // Fallback if require is not defined (pure ESM mode)
      try {
        const fs = await import('fs');
        if (!fs.existsSync(distPath)) {
          const { fileURLToPath } = await import('url');
          const currentDir = path.dirname(fileURLToPath(import.meta.url));
          distPath = currentDir.endsWith('dist') ? currentDir : path.join(currentDir, 'dist');
        }
      } catch {
        // Safe standard fallback
        distPath = path.join(process.cwd(), 'dist');
      }
    }

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
