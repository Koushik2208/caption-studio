import express from "express";
import fs from "node:fs";
import path from "node:path";
import { app, PORT } from "./app";

const DIST_DIR = fs.existsSync(path.resolve(process.cwd(), "dist"))
  ? path.resolve(process.cwd(), "dist")
  : path.resolve(import.meta.dirname ?? "", "../dist");

// Serve production frontend assets from Vite's built dist directory
app.use(express.static(DIST_DIR));

// SPA fallback for client-side routing when running standalone:
// returns index.html for non-API/non-media GET requests
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api") && !req.path.startsWith("/tmp-media")) {
    const indexPath = path.join(DIST_DIR, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
      return;
    }
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Caption Studio server listening on http://localhost:${PORT}`);
});
