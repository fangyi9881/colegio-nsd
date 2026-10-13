// Añade FAQPage (JSON-LD) a una página con <details><summary>…</summary><div>…</div></details>
import fs from 'node:fs';
const f = process.argv[2];
let s = fs.readFileSync(f, 'utf8');
if (s.includes('"@type":"FAQPage"')) { console.log('ya tiene'); process.exit(0); }
const txt = (h) => h.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const q = [...s.matchAll(/<details[^>]*><summary[^>]*>(.*?)<\/summary>\s*<div[^>]*>(.*?)<\/div>\s*<\/details>/gs)].map((m) => ({ '@type': 'Question', name: txt(m[1]), acceptedAnswer: { '@type': 'Answer', text: txt(m[2]) } }));
if (!q.length) { console.log('sin preguntas'); process.exit(1); }
const ld = `  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: q })}</script>\n`;
s = s.replace('</head>', ld + '</head>');
fs.writeFileSync(f, s); console.log('FAQ añadidas:', q.length);
