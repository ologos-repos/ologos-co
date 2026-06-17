#!/usr/bin/env node
// Generate the investor-facing /portfolio page from in-flight-projects.md.
// The .md stays source of truth; this emits public/portfolio.html, which Vite
// copies into the Pages build (served at /portfolio.html).
// Runs as part of `npm run build`; standalone:
//   node marketing/build-portfolio.mjs

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const md = readFileSync(join(here, "in-flight-projects.md"), "utf8");
const lines = md.split("\n");

let title = "Ologos — In-Flight Projects";
let thesis = "";
let footer = "";
const sections = [];
let cur = null; // current section
let entry = null; // current entry

const pushEntry = () => { if (entry && cur) cur.entries.push(entry); entry = null; };

for (const raw of lines) {
  const line = raw.trimEnd();
  if (line.startsWith("> ")) continue; // internal note, never rendered
  if (line.startsWith("# ")) { title = line.slice(2).trim(); continue; }
  if (/^\*\*Thesis:\*\*/.test(line)) { thesis = line.replace(/^\*\*Thesis:\*\*/, "").trim(); continue; }
  if (line.startsWith("## ")) { pushEntry(); cur = { name: line.slice(3).trim(), entries: [] }; sections.push(cur); continue; }
  if (line.startsWith("### ")) {
    pushEntry();
    const [name, ...tag] = line.slice(4).split(" — ");
    entry = { name: name.trim(), tag: tag.join(" — ").trim(), what: "", sowhat: "", link: "", stage: "" };
    continue;
  }
  const f = line.match(/^\*\*(What|So what|Link|Stage):\*\*\s*(.*)$/);
  if (f && entry) {
    const k = f[1].toLowerCase().replace(" ", "");
    entry[k === "sowhat" ? "sowhat" : k] = f[2].trim();
    continue;
  }
  if (/^\*[^*].*\*$/.test(line) && !line.startsWith("**")) footer = line.replace(/^\*|\*$/g, "").trim();
}
pushEntry();

const linkBtn = (url) =>
  url ? `<a class="proj-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(url.replace(/^https?:\/\//, ""))} →</a>` : "";

const entryHtml = (e) => `
  <article class="proj">
    <div class="proj-head">
      <h3>${esc(e.name)}${e.tag ? `<span class="tag">${esc(e.tag)}</span>` : ""}</h3>
      ${e.stage ? `<span class="stage">${esc(e.stage)}</span>` : ""}
    </div>
    ${e.what ? `<p class="what">${esc(e.what)}</p>` : ""}
    ${e.sowhat ? `<p class="sowhat"><span>So what.</span> ${esc(e.sowhat)}</p>` : ""}
    ${linkBtn(e.link)}
  </article>`;

const sectionHtml = (s) => `
  <section class="tier">
    <h2>${esc(s.name)}</h2>
    ${s.entries.map(entryHtml).join("")}
  </section>`;

const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)}</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Sans:wght@300;400;500&display=swap">
<style>
  :root{--bg:#1a1a1a;--bg2:#222;--fg:#f0ede6;--dim:rgba(240,237,230,0.62);--faint:rgba(240,237,230,0.4);--line:rgba(240,237,230,0.15);--accent:#c4956a}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--fg);font-family:'IBM Plex Sans',sans-serif;line-height:1.6;padding:4rem 1.5rem 6rem}
  .wrap{max-width:820px;margin:0 auto}
  header{border-bottom:1px solid var(--line);padding-bottom:2rem;margin-bottom:3rem}
  .brand{display:flex;align-items:center;gap:.7rem;margin-bottom:1.5rem}
  .brand img{height:2rem}
  .brand span{font-family:'Playfair Display',serif;font-weight:700;font-size:1.2rem}
  header h1{font-family:'Playfair Display',serif;font-weight:400;font-size:2.6rem;line-height:1.1;margin-bottom:1.25rem}
  .thesis{font-weight:300;font-size:1.05rem;color:var(--dim);max-width:640px}
  .tier{margin-bottom:3.5rem}
  .tier>h2{font-family:'Playfair Display',serif;font-weight:400;font-size:1.5rem;color:var(--fg);margin-bottom:1.5rem;padding-bottom:.6rem;border-bottom:1px solid var(--line)}
  .proj{padding:1.4rem 0;border-bottom:1px solid var(--line)}
  .proj:last-child{border-bottom:none}
  .proj-head{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;flex-wrap:wrap;margin-bottom:.6rem}
  .proj-head h3{font-family:'Playfair Display',serif;font-weight:400;font-size:1.4rem}
  .tag{font-family:'IBM Plex Sans';font-size:.66rem;text-transform:uppercase;letter-spacing:.1em;color:var(--accent);border:1px solid var(--accent);border-radius:10px;padding:1px 9px;margin-left:.7rem;vertical-align:middle}
  .stage{font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;color:var(--faint);white-space:nowrap}
  .what{font-weight:300;color:var(--fg);margin-bottom:.5rem}
  .sowhat{font-weight:300;color:var(--dim)}
  .sowhat span{color:var(--accent);font-weight:500}
  .proj-link{display:inline-block;margin-top:.8rem;font-size:.82rem;letter-spacing:.03em;color:var(--accent);text-decoration:none;border-bottom:1px solid rgba(196,149,106,0.4);padding-bottom:1px}
  .proj-link:hover{border-color:var(--accent)}
  footer{margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--line);font-size:.8rem;font-style:italic;color:var(--faint)}
</style></head>
<body><div class="wrap">
<header>
  <div class="brand"><img src="/ologos-mark.png" alt="Ologos"><span>Ologos</span></div>
  <h1>${esc(title.replace(/^Ologos — /, ""))}</h1>
  ${thesis ? `<p class="thesis">${esc(thesis)}</p>` : ""}
</header>
${sections.map(sectionHtml).join("")}
${footer ? `<footer>${esc(footer)}</footer>` : ""}
</div></body></html>`;

mkdirSync(join(repoRoot, "public"), { recursive: true });
const out = join(repoRoot, "public", "portfolio.html");
writeFileSync(out, html);
const count = sections.reduce((n, s) => n + s.entries.length, 0);
console.log(`wrote ${out} (${sections.length} tiers, ${count} entries)`);
