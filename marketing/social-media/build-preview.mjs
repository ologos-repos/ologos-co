#!/usr/bin/env node
// Generate a browsable preview of the LinkedIn social copy from the .md source.
// The .md files stay the source of truth; this emits preview.html.
// Run: node marketing/social-media/build-preview.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

const SOURCES = [
  { file: "linkedin/launch-sequence.md", section: "Launch sequence" },
  { file: "linkedin/evergreen/operating-principles.md", section: "Evergreen — Operating Principles" },
  { file: "linkedin/evergreen/thought-leadership.md", section: "Evergreen — Thought leadership" },
];

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// "## 3. The process *(carousel candidate)*" -> { title, note }
function parseHeading(line) {
  let t = line.replace(/^##\s+/, "").trim();
  let note = "";
  const m = t.match(/\*\(([^)]+)\)\*/);
  if (m) { note = m[1]; t = t.replace(m[0], "").trim(); }
  return { title: t, note };
}

function parsePosts(md) {
  const posts = [];
  for (const chunk of md.split(/^---$/m)) {
    const lines = chunk.split("\n");
    const hIdx = lines.findIndex((l) => /^##\s+/.test(l));
    if (hIdx === -1) continue; // preamble / intro chunk
    const { title, note } = parseHeading(lines[hIdx]);
    let hashtags = "";
    const body = [];
    for (const l of lines.slice(hIdx + 1)) {
      const tag = l.match(/^`(#.+)`\s*$/);
      if (tag) { hashtags = tag[1]; continue; }
      body.push(l);
    }
    const bodyText = body.join("\n").trim();
    if (!bodyText) continue;
    posts.push({ title, note, body: bodyText, hashtags });
  }
  return posts;
}

const sections = SOURCES.map(({ file, section }) => ({
  section,
  posts: parsePosts(readFileSync(join(here, file), "utf8")),
}));

const total = sections.reduce((n, s) => n + s.posts.length, 0);

const card = (p, id) => {
  const full = p.hashtags ? `${p.body}\n\n${p.hashtags}` : p.body;
  const chars = full.length;
  const bodyHtml = esc(p.body).replace(/\n/g, "<br>");
  return `
    <article class="card">
      <div class="card-head">
        <h3>${esc(p.title)}${p.note ? `<span class="note">${esc(p.note)}</span>` : ""}</h3>
        <button class="copy" data-target="post-${id}">Copy</button>
      </div>
      <div class="post" id="post-${id}">${bodyHtml}${p.hashtags ? `<div class="tags">${esc(p.hashtags)}</div>` : ""}</div>
      <div class="meta"><span class="${chars > 3000 ? "over" : ""}">${chars} chars</span> · LinkedIn limit 3000</div>
    </article>`;
};

let n = 0;
const body = sections
  .map(
    (s) => `
    <section class="group">
      <h2>${esc(s.section)} <span class="count">${s.posts.length}</span></h2>
      ${s.posts.map((p) => card(p, n++)).join("")}
    </section>`
  )
  .join("");

const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ologos — LinkedIn copy preview</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Sans:wght@300;400;500&display=swap">
<style>
  :root{--bg:#1a1a1a;--bg2:#222;--fg:#f0ede6;--dim:rgba(240,237,230,0.6);--line:rgba(240,237,230,0.15);--accent:#F06B35}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--fg);font-family:'IBM Plex Sans',sans-serif;line-height:1.6;padding:3rem 1.5rem 6rem}
  .wrap{max-width:760px;margin:0 auto}
  header{border-bottom:1px solid var(--line);padding-bottom:1.5rem;margin-bottom:2.5rem}
  header h1{font-family:'Playfair Display',serif;font-weight:400;font-size:2.2rem}
  header p{color:var(--dim);font-weight:300;margin-top:.4rem;font-size:.9rem}
  .group{margin-bottom:3rem}
  .group>h2{font-family:'Playfair Display',serif;font-weight:400;font-size:1.4rem;margin-bottom:1.25rem;padding-top:1rem}
  .count{font-size:.7rem;color:var(--dim);border:1px solid var(--line);border-radius:10px;padding:1px 8px;vertical-align:middle;margin-left:.4rem}
  .card{background:var(--bg2);border:1px solid var(--line);border-radius:10px;padding:1.25rem 1.4rem;margin-bottom:1.1rem}
  .card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:.85rem}
  .card-head h3{font-family:'Playfair Display',serif;font-weight:400;font-size:1.05rem}
  .note{display:block;font-family:'IBM Plex Sans';font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;color:var(--accent);margin-top:.25rem}
  .copy{flex-shrink:0;background:transparent;color:var(--fg);border:1px solid var(--line);border-radius:5px;padding:.3rem .8rem;font-size:.72rem;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;transition:.2s}
  .copy:hover{border-color:var(--fg)}
  .copy.done{border-color:#5a9a5a;color:#5a9a5a}
  .post{font-weight:300;white-space:normal}
  .tags{color:var(--dim);font-size:.85rem;margin-top:.9rem}
  .meta{margin-top:.9rem;font-size:.72rem;color:var(--dim);border-top:1px solid var(--line);padding-top:.6rem}
  .meta .over{color:var(--accent)}
</style></head>
<body><div class="wrap">
<header>
  <h1>Ologos — LinkedIn copy</h1>
  <p>${total} posts · punchy register · generated from the marketing/social-media source. Review draft.</p>
</header>
${body}
</div>
<script>
document.querySelectorAll(".copy").forEach((b)=>{
  b.addEventListener("click",()=>{
    const el=document.getElementById(b.dataset.target);
    const txt=el.innerText.trim();
    navigator.clipboard.writeText(txt).then(()=>{
      const o=b.textContent;b.textContent="Copied";b.classList.add("done");
      setTimeout(()=>{b.textContent=o;b.classList.remove("done")},1400);
    });
  });
});
</script>
</body></html>`;

const out = join(here, "preview.html");
writeFileSync(out, html);
console.log(`wrote ${out} (${total} posts)`);
