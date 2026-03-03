import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // X (Twitter) OAuth Routes
  app.get("/api/auth/x/url", (req, res) => {
    const clientId = process.env.X_CLIENT_ID;
    const redirectUri = process.env.X_CALLBACK_URL || `${req.protocol}://${req.get('host')}/auth/x/callback`;
    
    if (!clientId) {
      return res.status(500).json({ error: "X_CLIENT_ID not configured" });
    }

    // OAuth 2.0 with PKCE (simplified for this example, but usually needs state/code_challenge)
    // For X, we need scopes like 'tweet.read', 'tweet.write', 'users.read', 'offline.access'
    const state = Math.random().toString(36).substring(7);
    const codeChallenge = "challenge"; // In real app, generate properly
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'tweet.read tweet.write users.read offline.access',
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'plain'
    });

    const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
    res.json({ url: authUrl });
  });

  app.get("/auth/x/callback", async (req, res) => {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).send("No code provided");
    }

    // Exchange code for tokens
    try {
      const clientId = process.env.X_CLIENT_ID;
      const clientSecret = process.env.X_CLIENT_SECRET;
      const redirectUri = process.env.X_CALLBACK_URL || `${req.protocol}://${req.get('host')}/auth/x/callback`;

      const response = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          code: code as string,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code_verifier: "challenge", // Must match code_challenge
        }),
      });

      const tokens = await response.json();

      if (tokens.error) {
        throw new Error(tokens.error_description || tokens.error);
      }

      // In a real app, store tokens in Supabase
      // For now, we'll send a success message to the frontend
      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f5f5f0;">
            <div style="text-align: center; border: 2px solid #141414; padding: 40px; background: white; box-shadow: 8px 8px 0px 0px #141414;">
              <h1 style="text-transform: uppercase; font-weight: 900; italic: true;">Conectado com Sucesso!</h1>
              <p style="font-weight: bold; opacity: 0.6;">A tua conta do X foi ligada ao AIxo do Mal.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'X_AUTH_SUCCESS', tokens: ${JSON.stringify(tokens)} }, '*');
                  setTimeout(() => window.close(), 2000);
                } else {
                  window.location.href = '/';
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("X Auth Error:", error);
      res.status(500).send(`Authentication failed: ${error.message}`);
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
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
