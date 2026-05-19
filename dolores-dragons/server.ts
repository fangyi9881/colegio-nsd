import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = new Resend(process.env.RESEND_API_KEY);
const QUOTES_STATE_FILE = new URL('../quotes-state.json', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

interface QuotesState { used: number[]; }

function loadQuotesState(): QuotesState {
  try {
    if (existsSync(QUOTES_STATE_FILE)) return JSON.parse(readFileSync(QUOTES_STATE_FILE, 'utf-8'));
  } catch {}
  return { used: [] };
}

function saveQuotesState(state: QuotesState) {
  writeFileSync(QUOTES_STATE_FILE, JSON.stringify(state), 'utf-8');
}

async function pickQuote(quotes: { text: string; author: string }[]) {
  const state = loadQuotesState();
  const remaining = quotes.map((_, i) => i).filter(i => !state.used.includes(i));

  if (remaining.length === 0) {
    // All quotes used — notify admin and reset
    await resend.emails.send({
      from: "Dolores Dragons <onboarding@resend.dev>",
      to: "basketnsd@gmail.com",
      subject: "⚠️ Citas de bienvenida agotadas — reiniciando",
      html: `<p>Se han usado todas las citas disponibles (${quotes.length}). El sistema ha reiniciado el ciclo autom&#225;ticamente.</p>`,
    });
    state.used = [];
    saveQuotesState(state);
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  const idx = remaining[Math.floor(Math.random() * remaining.length)];
  state.used.push(idx);
  saveQuotesState(state);
  return quotes[idx];
}

async function welcomeEmailHTML(displayName: string, quotes: { text: string; author: string; image: string }[]) {
  const name = displayName?.split(' ')[0] || 'Crack';
  const quote = await pickQuote(quotes) as { text: string; author: string; image: string };
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>La cancha te espera</title>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet"/>
  <style>
    @keyframes glow {
      0%,100% { opacity:0.7; }
      50% { opacity:1; }
    }
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(16px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position:  400px 0; }
    }
    @keyframes pulse {
      0%,100% { transform:scale(1); }
      50%      { transform:scale(1.04); }
    }
    .logo    { animation: glow 2.8s ease-in-out infinite; }
    .hero-h  { animation: fadeUp 0.9s ease 0.1s both; }
    .hero-n  { animation: fadeUp 0.9s ease 0.25s both; }
    .quote   { animation: fadeUp 0.9s ease 0.4s both; }
    .cta-btn { animation: pulse 2.4s ease-in-out infinite; }
  </style>
</head>
<body style="margin:0;padding:0;background:#060606;font-family:'Montserrat',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#060606;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HERO -->
  <tr><td style="background:#0a0a0a;padding:48px 48px 0;text-align:center;border-top:3px solid #D4AF37;border-left:1px solid #1e1a0e;border-right:1px solid #1e1a0e;">
    <!-- Shield / Logo -->
    <div class="logo" style="margin-bottom:24px;">
      <img src="https://i.imgur.com/OP6BbHs.png" alt="Dolores Dragons" width="90" height="90" style="display:inline-block;width:90px;height:90px;object-fit:contain;filter:drop-shadow(0 0 18px rgba(212,175,55,0.7));" />
    </div>
    <p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:0.45em;color:#6a5820;text-transform:uppercase;font-family:'Montserrat',sans-serif;">Dolores Dragons &mdash; Madrid &mdash; Est. 1957</p>
    <h1 class="hero-h" style="margin:0 0 6px;font-size:14px;font-weight:600;color:#888070;text-transform:uppercase;letter-spacing:0.3em;font-family:'Montserrat',sans-serif;">Bienvenido a la cancha,</h1>
    <h2 class="hero-n" style="margin:0 0 36px;font-size:56px;font-weight:900;color:#D4AF37;text-transform:uppercase;letter-spacing:0.06em;line-height:1;font-family:'Bebas Neue','Montserrat',sans-serif;">${name}</h2>

    <!-- Basketball court SVG -->
    <div style="margin:0 -48px;">
      <svg width="600" height="160" viewBox="0 0 600 160" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;max-width:600px;">
        <defs>
          <linearGradient id="courtFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0a0a0a" stop-opacity="0"/>
            <stop offset="100%" stop-color="#0a0a0a" stop-opacity="1"/>
          </linearGradient>
        </defs>
        <!-- Court floor -->
        <rect x="0" y="0" width="600" height="160" fill="#0d0b04"/>
        <!-- Court lines -->
        <rect x="20" y="10" width="560" height="140" fill="none" stroke="#D4AF37" stroke-width="1.2" opacity="0.25" rx="2"/>
        <!-- Center court line -->
        <line x1="300" y1="10" x2="300" y2="150" stroke="#D4AF37" stroke-width="1" opacity="0.2"/>
        <!-- Center circle -->
        <circle cx="300" cy="80" r="45" fill="none" stroke="#D4AF37" stroke-width="1.2" opacity="0.2"/>
        <circle cx="300" cy="80" r="4" fill="#D4AF37" opacity="0.35"/>
        <!-- Left paint -->
        <rect x="20" y="30" width="110" height="100" fill="rgba(212,175,55,0.03)" stroke="#D4AF37" stroke-width="1" opacity="0.2"/>
        <!-- Left free throw circle -->
        <path d="M 130,55 A 30,30 0 0 1 130,105" fill="none" stroke="#D4AF37" stroke-width="1" opacity="0.2"/>
        <!-- Left 3pt arc -->
        <path d="M 20,25 Q 200,195 20,135" fill="none" stroke="#D4AF37" stroke-width="1" opacity="0.18"/>
        <!-- Right paint -->
        <rect x="470" y="30" width="110" height="100" fill="rgba(212,175,55,0.03)" stroke="#D4AF37" stroke-width="1" opacity="0.2"/>
        <!-- Right free throw circle -->
        <path d="M 470,55 A 30,30 0 0 0 470,105" fill="none" stroke="#D4AF37" stroke-width="1" opacity="0.2"/>
        <!-- Right 3pt arc -->
        <path d="M 580,25 Q 400,195 580,135" fill="none" stroke="#D4AF37" stroke-width="1" opacity="0.18"/>
        <!-- Fade overlay -->
        <rect x="0" y="0" width="600" height="160" fill="url(#courtFade)"/>
      </svg>
    </div>
  </td></tr>

  <!-- QUOTE -->
  <tr><td class="quote" style="background:#0d0b04;padding:40px 48px;border-left:1px solid #1e1a0e;border-right:1px solid #1e1a0e;border-top:1px solid #1a1600;border-bottom:1px solid #1a1600;text-align:center;">
    <!-- Decorative top line -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr>
      <td style="width:40%;border-bottom:1px solid rgba(212,175,55,0.15);"></td>
      <td style="width:12px;text-align:center;padding:0 10px;font-size:16px;color:rgba(212,175,55,0.3);">&#9670;</td>
      <td style="width:40%;border-bottom:1px solid rgba(212,175,55,0.15);"></td>
    </tr></table>
    <!-- Big quote mark -->
    <p style="margin:0 0 4px;font-size:60px;line-height:1;color:rgba(212,175,55,0.18);font-family:Georgia,serif;">&ldquo;</p>
    <!-- Quote text -->
    <p style="margin:0 0 28px;font-size:16px;font-style:italic;color:rgba(212,175,55,0.9);line-height:1.8;font-family:'Montserrat',sans-serif;">${quote.text}</p>
    <!-- Author name in big Bebas Neue -->
    <p style="margin:0 0 4px;font-size:22px;font-weight:400;color:#D4AF37;letter-spacing:0.18em;font-family:'Bebas Neue','Montserrat',sans-serif;">${quote.author === 'unknown' ? 'Sabidur&#237;a del Juego' : quote.author}</p>
    <p style="margin:0;font-size:10px;font-weight:600;color:rgba(255,255,255,0.2);letter-spacing:0.3em;text-transform:uppercase;font-family:'Montserrat',sans-serif;">Leyenda del Baloncesto</p>
    <!-- Decorative bottom line -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;"><tr>
      <td style="width:40%;border-bottom:1px solid rgba(212,175,55,0.15);"></td>
      <td style="width:12px;text-align:center;padding:0 10px;font-size:16px;color:rgba(212,175,55,0.3);">&#9670;</td>
      <td style="width:40%;border-bottom:1px solid rgba(212,175,55,0.15);"></td>
    </tr></table>
  </td></tr>

  <!-- MENSAJE PRINCIPAL -->
  <tr><td style="background:#0a0a0a;padding:40px 48px 32px;border-left:1px solid #1e1a0e;border-right:1px solid #1e1a0e;">
    <p style="margin:0 0 16px;font-size:16px;color:#888070;line-height:1.8;"><span style="color:#D4AF37;font-weight:700;">${name}</span>, cada grande empez&#243; en alguna cancha. Jordan empez&#243; en el patio del colegio. LeBron, en una pista de cemento en Akron. T&#250; acabas de dar tu primer paso aqu&#237;, en la Guarida del Drag&#243;n.</p>
    <p style="margin:0;font-size:16px;color:#888070;line-height:1.8;">Desde hoy tienes acceso a todo lo que necesitas para crecer: conocimiento, competici&#243;n y una comunidad que respira baloncesto.</p>
  </td></tr>

  <!-- STATS DE DEBUT -->
  <tr><td style="background:#0a0a0a;padding:0 48px 32px;border-left:1px solid #1e1a0e;border-right:1px solid #1e1a0e;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2a2210;background:#0e0c05;">
      <tr>
        <td style="padding:10px 0 6px;text-align:center;border-right:1px solid #2a2210;">
          <p style="margin:0;font-size:30px;font-weight:900;color:#D4AF37;">+100</p>
          <p style="margin:2px 0 10px;font-size:9px;font-weight:700;color:#5a4e20;letter-spacing:0.2em;text-transform:uppercase;">XP de Debut</p>
        </td>
        <td style="padding:10px 0 6px;text-align:center;border-right:1px solid #2a2210;">
          <p style="margin:0;font-size:30px;font-weight:900;color:#D4AF37;">1</p>
          <p style="margin:2px 0 10px;font-size:9px;font-weight:700;color:#5a4e20;letter-spacing:0.2em;text-transform:uppercase;">Escama Drag&#243;n</p>
        </td>
        <td style="padding:10px 0 6px;text-align:center;">
          <p style="margin:0;font-size:30px;font-weight:900;color:#D4AF37;">&#8734;</p>
          <p style="margin:2px 0 10px;font-size:9px;font-weight:700;color:#5a4e20;letter-spacing:0.2em;text-transform:uppercase;">Potencial</p>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- TU SIGUIENTE JUGADA -->
  <tr><td style="background:#0a0a0a;padding:0 48px 40px;border-left:1px solid #1e1a0e;border-right:1px solid #1e1a0e;">
    <p style="margin:0 0 16px;font-size:10px;font-weight:700;letter-spacing:0.35em;color:#6a5820;text-transform:uppercase;">Tu siguiente jugada</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:16px 20px;background:#0e0c05;border-left:3px solid #D4AF37;">
          <p style="margin:0 0 3px;font-size:13px;font-weight:800;color:#ffffff;">&#127936; Demuestra lo que sabes</p>
          <p style="margin:0;font-size:12px;color:#5a5030;">Entra a la Trivia y consigue tu primer XP en la pista.</p>
        </td>
      </tr>
      <tr><td style="height:6px;"></td></tr>
      <tr>
        <td style="padding:16px 20px;background:#0e0c05;border-left:3px solid #6a5820;">
          <p style="margin:0 0 3px;font-size:13px;font-weight:800;color:#ffffff;">&#127942; Busca tu nombre en el ranking</p>
          <p style="margin:0;font-size:12px;color:#5a5030;">Cada punto cuenta. &#191;D&#243;nde acabar&#225;s esta semana?</p>
        </td>
      </tr>
      <tr><td style="height:6px;"></td></tr>
      <tr>
        <td style="padding:16px 20px;background:#0e0c05;border-left:3px solid #6a5820;">
          <p style="margin:0 0 3px;font-size:13px;font-weight:800;color:#ffffff;">&#128293; No rompas tu racha</p>
          <p style="margin:0;font-size:12px;color:#5a5030;">Vuelve ma&#241;ana y el d&#237;a siguiente. Los grandes no tienen d&#237;as libres.</p>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td style="background:#0a0a0a;padding:0 48px 52px;text-align:center;border-left:1px solid #1e1a0e;border-right:1px solid #1e1a0e;">
    <a href="https://doloresdragons.com" class="cta-btn" style="display:inline-block;background:#D4AF37;color:#000000;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:0.25em;padding:20px 56px;text-decoration:none;font-family:'Montserrat',sans-serif;">
      &#127936;&nbsp; Entrar a la Cancha
    </a>
    <p style="margin:24px 0 0;font-size:12px;color:#3a3020;">
      <a href="https://www.instagram.com/doloresdragons/" style="color:#7a6820;text-decoration:none;">&#128247; @doloresdragons</a>
      &nbsp;&nbsp;&#183;&nbsp;&nbsp;
      <a href="https://wa.me/34646794962" style="color:#7a6820;text-decoration:none;">&#128172; WhatsApp del club</a>
    </p>
  </td></tr>

  <!-- Bottom bar -->
  <tr><td style="height:3px;background:#D4AF37;"></td></tr>

  <!-- FOOTER -->
  <tr><td style="padding:20px 48px;text-align:center;">
    <p style="margin:0;font-size:10px;color:#2a2820;line-height:1.8;">
      Dolores Dragons &mdash; Club de Baloncesto &mdash; Madrid &mdash; Est. 1957<br/>
      Si no creaste esta cuenta, ignora este mensaje.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Dynamically import quotes (ESM)
  const { EMAIL_QUOTES } = await import('./src/data/emailQuotes.js');

  app.use(express.json());

  // Welcome email
  app.post("/api/send-welcome", async (req, res) => {
    const { to, displayName } = req.body;
    if (!to) return res.status(400).json({ error: "Missing email" });

    try {
      const html = await welcomeEmailHTML(displayName || '', EMAIL_QUOTES);
      await resend.emails.send({
        from: "Dolores Dragons <onboarding@resend.dev>",
        to,
        subject: "Bienvenido a la Guarida del Dragón 🐉",
        html,
      });
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("Error sending welcome email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Generic email (kept for other uses)
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, html } = req.body;
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: "Email service not configured" });
    }
    try {
      const data = await resend.emails.send({
        from: "Dolores Dragons <onboarding@resend.dev>",
        to: to || "basketnsd@gmail.com",
        subject: subject || "Dolores Dragons",
        html: html || "",
      });
      res.status(200).json(data);
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
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
