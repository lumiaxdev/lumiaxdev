// Erzeugt die animierten SVGs für github.com/lumiaxdev.
// Aufruf: node erzeugen.cjs <repo-ordner>
// GitHub zeigt SVGs als Bild: SMIL- und CSS-Animationen laufen, Skripte und
// nachgeladene Dateien nicht — deshalb sind Banner und Logos als base64 drin.
const fs = require("fs");
const path = require("path");
const repo = process.argv[2];
const A = (p) => path.join(repo, "assets", p);

const MINT = "#62E8C1";
const VIOLETT = "#9d5cf6";
const VHELL = "#c4a5fb";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

function zufall(saat) {
  return () => {
    saat = (saat + 0x6d2b79f5) | 0;
    let t = Math.imul(saat ^ (saat >>> 15), 1 | saat);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const daten = (datei, typ) => `data:${typ};base64,${fs.readFileSync(datei).toString("base64")}`;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const f = (n) => Number(n.toFixed(1));

/** Funkelnde Punkte; `meiden` sind Rechtecke, in die keiner fällt. */
function funkeln(z, anzahl, b, h, farben, meiden = []) {
  let out = "";
  for (let i = 0; i < anzahl; i++) {
    let x, y, n = 0;
    do {
      x = z() * b;
      y = z() * h;
      n++;
    } while (n < 20 && meiden.some(([x1, y1, x2, y2]) => x > x1 && x < x2 && y > y1 && y < y2));
    const r = z() < 0.12 ? 1.6 + z() * 0.8 : 0.5 + z() * 0.9;
    const farbe = farben[Math.floor(z() * farben.length)];
    const dauer = 2.5 + z() * 4;
    const tief = 0.1 + z() * 0.25;
    const hoch = 0.5 + z() * 0.5;
    out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${farbe}" opacity="${tief}"><animate attributeName="opacity" values="${tief};${hoch};${tief}" dur="${f(dauer)}s" begin="${f(z() * 4)}s" repeatCount="indefinite"/></circle>`;
  }
  return out;
}

/** Sternschnuppe, die alle `takt` Sekunden einmal durchfliegt. */
function schnuppe(id, x, y, dx, dy, takt, start, farbe) {
  const laenge = Math.hypot(dx, dy);
  const w = (Math.atan2(dy, dx) * 180) / Math.PI;
  return `<g transform="translate(${x} ${y}) rotate(${f(w)})" opacity="0">
    <rect x="-140" y="-1" width="140" height="2" rx="1" fill="url(#${id})"/>
    <circle r="2.2" fill="#fff"/>
    <animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;${f(laenge)} 0" keyTimes="0;1" dur="1.1s" begin="${start}s;${id}e.end+${takt}s" id="${id}e" fill="freeze"/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.7;1" dur="1.1s" begin="${start}s;${id}e.end+${takt}s"/>
  </g>
  <linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${farbe}" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0.9"/></linearGradient>`;
}

/* ---------------------------------------------------------------- Kopf */
// Ohne das gerenderte Banner (das hat Paul am 05.11.2026 selbst aus der README
// genommen): ein Sternenhimmel über einem Horizont mit Lichtkante, darüber
// der Name, über den ein Mint-Glanz läuft.
function kopf() {
  const z = zufall(7);
  const B = 1200;
  const H = 380;
  const name = "lumiaxdev";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${B} ${H}" width="${B}" height="${H}" role="img" aria-label="lumiaxdev — Hey, ich bin Paul. Java, Kotlin, Minecraft, Logsy Network.">
  <defs>
    <clipPath id="rund"><rect width="${B}" height="${H}" rx="20"/></clipPath>
    <radialGradient id="nebelM" cx="0.18" cy="0.35" r="0.5"><stop offset="0" stop-color="${MINT}" stop-opacity="0.22"/><stop offset="1" stop-color="${MINT}" stop-opacity="0"/></radialGradient>
    <radialGradient id="nebelV" cx="0.85" cy="0.55" r="0.55"><stop offset="0" stop-color="${VIOLETT}" stop-opacity="0.28"/><stop offset="1" stop-color="${VIOLETT}" stop-opacity="0"/></radialGradient>
    <!-- Horizont: ein riesiger dunkler Planet, nur seine Kante leuchtet -->
    <linearGradient id="kante" x1="0" x2="1">
      <stop offset="0" stop-color="${MINT}" stop-opacity="0"/>
      <stop offset="0.3" stop-color="${MINT}"/>
      <stop offset="0.7" stop-color="${VHELL}"/>
      <stop offset="1" stop-color="${VIOLETT}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="atmo" cx="0.5" cy="1" r="0.75"><stop offset="0.72" stop-color="${MINT}" stop-opacity="0"/><stop offset="0.86" stop-color="${MINT}" stop-opacity="0.18"/><stop offset="1" stop-color="${MINT}" stop-opacity="0"/></radialGradient>
    <filter id="weich" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    <linearGradient id="schrift" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfe9e1"/></linearGradient>
    <linearGradient id="glanz" x1="0" x2="1">
      <stop offset="0" stop-color="${MINT}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${MINT}"/>
      <stop offset="1" stop-color="${MINT}" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="nameForm"><text x="${B / 2}" y="214" text-anchor="middle" font-family="${SANS}" font-size="124" font-weight="800" letter-spacing="-5">${name}</text></clipPath>
  </defs>
  <g clip-path="url(#rund)">
    <rect width="${B}" height="${H}" fill="#06080c"/>
    <rect width="${B}" height="${H}" fill="url(#nebelM)"/>
    <rect width="${B}" height="${H}" fill="url(#nebelV)"><animate attributeName="opacity" values="0.7;1;0.7" dur="8s" repeatCount="indefinite"/></rect>
    ${funkeln(z, 130, B, 300, ["#ffffff", "#ffffff", MINT, VHELL], [[300, 120, 900, 240]])}
    ${schnuppe("s1", 1160, 30, -280, 120, 7, 2.4, MINT)}
    ${schnuppe("s3", 420, 20, -220, 100, 11, 6.5, VHELL)}

    <!-- Horizont -->
    <ellipse cx="${B / 2}" cy="1580" rx="1500" ry="1290" fill="url(#atmo)"/>
    <ellipse cx="${B / 2}" cy="1580" rx="1400" ry="1260" fill="#06080c"/>
    <ellipse cx="${B / 2}" cy="1580" rx="1400" ry="1260" fill="none" stroke="url(#kante)" stroke-width="6" filter="url(#weich)" opacity="0.9"><animate attributeName="opacity" values="0.65;1;0.65" dur="5s" repeatCount="indefinite"/></ellipse>
    <ellipse cx="${B / 2}" cy="1580" rx="1400" ry="1260" fill="none" stroke="url(#kante)" stroke-width="1.5"/>
    <!-- Ein Licht wandert die Kante entlang -->
    <circle r="3.5" fill="#fff" opacity="0">
      <animateMotion dur="6s" repeatCount="indefinite" begin="1.5s" path="M ${B / 2 - 340},${f(1580 - 1260 * Math.sqrt(1 - (340 / 1400) ** 2))} A 1400 1260 0 0 1 ${B / 2 + 340},${f(1580 - 1260 * Math.sqrt(1 - (340 / 1400) ** 2))}"/>
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="6s" begin="1.5s" repeatCount="indefinite"/>
    </circle>

    <text x="${B / 2}" y="96" text-anchor="middle" font-family="${MONO}" font-size="15" letter-spacing="7" fill="${MINT}">HEY, ICH BIN PAUL</text>
    <text x="${B / 2}" y="214" text-anchor="middle" font-family="${SANS}" font-size="124" font-weight="800" letter-spacing="-5" fill="url(#schrift)">${name}</text>
    <g clip-path="url(#nameForm)">
      <rect x="-300" y="80" width="260" height="160" fill="url(#glanz)" transform="skewX(-20)">
        <animate attributeName="x" values="-300;1500" dur="2.8s" begin="0.8s;glanzE.end+4s" id="glanzE"/>
      </rect>
    </g>
    <text x="${B / 2}" y="262" text-anchor="middle" font-family="${MONO}" font-size="16" letter-spacing="4" fill="#8b949e">JAVA · KOTLIN · MINECRAFT · <tspan fill="${VHELL}">LOGSY NETWORK</tspan></text>
  </g>
</svg>`;
}

/* ------------------------------------------------------------ Terminal */
function terminal() {
  const zeilen = [
    { p: true, t: "whoami" },
    { t: "Paul — Entwickler aus Deutschland · Java, Kotlin, Minecraft", c: "#e6edf3" },
    { p: true, t: "ls ~/logsy" },
    { t: "voice/   icon-roleplay/   songs-erraten/   who-liked/   builds/", c: VHELL },
    { p: true, t: "cat stack.txt" },
    { t: "Java · Kotlin · Maven · TypeScript · React · Next.js · Node.js · Linux", c: "#e6edf3" },
    { p: true, t: "echo $STATUS" },
    { t: "offen für Projekte  →  hello@logsy.de", c: MINT },
  ];
  const ZH = 34;
  const ZEICHEN = 12.6;
  let t = 0.6;
  let out = "";
  zeilen.forEach((z, i) => {
    const y = 96 + i * ZH;
    // Mehrere Leerzeichen als feste Leerzeichen, sonst fasst das SVG sie zusammen
    const text = esc(z.t).replace(/ {2,}/g, (m) => " ".repeat(m.length));
    if (z.p) {
      const breite = z.t.length * ZEICHEN + 4;
      const dauer = Math.max(0.35, z.t.length * 0.055);
      out += `<clipPath id="k${i}"><rect x="64" y="${y - 22}" height="30" width="0"><animate attributeName="width" from="0" to="${f(breite)}" dur="${f(dauer)}s" begin="${f(t)}s" fill="freeze" calcMode="discrete" values="${Array.from({ length: z.t.length + 1 }, (_, n) => f(n * ZEICHEN + (n ? 4 : 0))).join(";")}"/></rect></clipPath>`;
      out += `<g opacity="0"><set attributeName="opacity" to="1" begin="${f(t)}s" fill="freeze"/><text x="32" y="${y}" fill="${MINT}">~</text><text x="46" y="${y}" fill="#7d8590">$</text></g>`;
      out += `<text x="66" y="${y}" fill="#e6edf3" clip-path="url(#k${i})">${text}</text>`;
      t += dauer + 0.35;
    } else {
      out += `<text x="32" y="${y}" fill="${z.c}" opacity="0">${text}<set attributeName="opacity" to="1" begin="${f(t)}s" fill="freeze"/></text>`;
      t += 0.5;
    }
  });
  const yEnde = 96 + zeilen.length * ZH;
  out += `<g opacity="0"><set attributeName="opacity" to="1" begin="${f(t)}s" fill="freeze"/><text x="32" y="${yEnde}" fill="${MINT}">~</text><text x="46" y="${yEnde}" fill="#7d8590">$</text><rect x="68" y="${yEnde - 19}" width="11" height="23" fill="${MINT}"><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.05s" repeatCount="indefinite"/></rect></g>`;
  const hoehe = yEnde + 40;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 ${hoehe}" width="1200" height="${hoehe}" role="img" aria-label="Terminal: whoami — Paul, Entwickler aus Deutschland. Projekte bei Logsy: Voice, Icon Roleplay, Songs erraten, Who Liked?, Builds. Stack: Java, Kotlin, Maven, TypeScript, React, Next.js, Node.js, Linux. Offen für Projekte: hello@logsy.de">
  <defs>
    <linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#11161d"/><stop offset="1" stop-color="#0a0d12"/></linearGradient>
    <linearGradient id="rand" x1="0" x2="1"><stop offset="0" stop-color="${MINT}" stop-opacity="0.55"/><stop offset="0.5" stop-color="#30363d"/><stop offset="1" stop-color="${VIOLETT}" stop-opacity="0.55"/></linearGradient>
  </defs>
  <rect x="1" y="1" width="1198" height="${hoehe - 2}" rx="16" fill="url(#fl)" stroke="url(#rand)" stroke-width="1.5"/>
  <circle cx="30" cy="30" r="6.5" fill="#ff5f57"/><circle cx="52" cy="30" r="6.5" fill="#febc2e"/><circle cx="74" cy="30" r="6.5" fill="#28c840"/>
  <text x="600" y="35" text-anchor="middle" font-family="${MONO}" font-size="14" fill="#7d8590">paul@lumiax — ~</text>
  <line x1="1" y1="56" x2="1199" y2="56" stroke="#21262d"/>
  <g font-family="${MONO}" font-size="21" xml:space="preserve" style="white-space: pre">${out}</g>
</svg>`;
}

/* ------------------------------------------------------------ Sternbild */
const PROJEKTE = [
  { id: "voice", name: "Logsy Voice", status: "live", x: 250, y: 190, logo: "voice.png" },
  { id: "icon", name: "Icon Roleplay", status: "live", x: 960, y: 175, logo: "icon.png" },
  { id: "songs", name: "Songs erraten", status: "live", x: 1000, y: 430, logo: "songs.png" },
  { id: "builds", name: "Logsy Builds", status: "Beta", x: 610, y: 505, logo: "builds.png" },
  { id: "wl", name: "Who Liked?", status: "in Arbeit", x: 205, y: 440, logo: "wholiked.svg" },
];
const STATUS = { live: MINT, Beta: VHELL, "in Arbeit": "#a39db3" };

function sternbild() {
  const z = zufall(42);
  const M = { x: 600, y: 300 };
  const logo = (datei) => daten(A(`logsy/${datei}`), datei.endsWith(".svg") ? "image/svg+xml" : "image/png");
  // Linien: Mitte zu jedem Stern, dazu ein Bogen aussen herum wie ein Sternbild
  const kanten = [
    ...PROJEKTE.map((p) => [M, p]),
    [PROJEKTE[0], PROJEKTE[4]],
    [PROJEKTE[4], PROJEKTE[3]],
    [PROJEKTE[3], PROJEKTE[2]],
    [PROJEKTE[2], PROJEKTE[1]],
  ];
  let linien = "";
  kanten.forEach(([a, b], i) => {
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    const aussen = i >= PROJEKTE.length;
    linien += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${aussen ? "url(#linieA)" : "url(#linieM)"}" stroke-width="${aussen ? 1 : 1.4}" stroke-dasharray="${f(l)}" stroke-dashoffset="${f(l)}" opacity="${aussen ? 0.55 : 0.9}"><animate attributeName="stroke-dashoffset" from="${f(l)}" to="0" dur="1.2s" begin="${f(0.5 + i * 0.18)}s" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1" keyTimes="0;1"/></line>`;
    // Ein Lichtfunke wandert in Schleife die inneren Linien entlang
    if (!aussen) {
      linien += `<circle r="3" fill="#fff" opacity="0"><animateMotion path="M${M.x},${M.y} L${b.x},${b.y}" dur="2.4s" begin="${f(2.6 + i * 0.9)}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0.9;0" dur="2.4s" begin="${f(2.6 + i * 0.9)}s" repeatCount="indefinite"/></circle>`;
    }
  });
  let knoten = "";
  PROJEKTE.forEach((p, i) => {
    const b = f(1.3 + i * 0.22);
    const farbe = STATUS[p.status];
    const pillB = p.status.length * 8.4 + 26;
    knoten += `<g opacity="0" transform="translate(${p.x} ${p.y})">
      <animate attributeName="opacity" from="0" to="1" dur="0.6s" begin="${b}s" fill="freeze"/>
      <circle r="58" fill="url(#hof)"><animate attributeName="r" values="52;64;52" dur="${f(3.4 + i * 0.4)}s" repeatCount="indefinite"/></circle>
      <circle r="31" fill="#0d1117" stroke="${farbe}" stroke-opacity="0.75" stroke-width="1.5"/>
      <clipPath id="kr${i}"><circle r="24"/></clipPath>
      <image href="${logo(p.logo)}" x="-24" y="-24" width="48" height="48" clip-path="url(#kr${i})" preserveAspectRatio="xMidYMid meet"/>
      <text y="58" text-anchor="middle" font-family="${SANS}" font-size="18" font-weight="650" fill="#e6edf3">${esc(p.name)}</text>
      <g transform="translate(${f(-pillB / 2)} 70)">
        <rect width="${f(pillB)}" height="22" rx="11" fill="${farbe}" fill-opacity="0.12" stroke="${farbe}" stroke-opacity="0.45"/>
        <circle cx="12" cy="11" r="3.2" fill="${farbe}"><animate attributeName="opacity" values="1;0.35;1" dur="1.8s" repeatCount="indefinite"/></circle>
        <text x="21" y="15.5" font-family="${MONO}" font-size="12" fill="${farbe}">${esc(p.status)}</text>
      </g>
    </g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 620" width="1200" height="620" role="img" aria-label="Sternbild Logsy: Logsy Network in der Mitte, verbunden mit Logsy Voice (live), Icon Roleplay (live), Songs erraten (live), Logsy Builds (Beta) und Who Liked? (in Arbeit).">
  <defs>
    <radialGradient id="nebelV" cx="0.62" cy="0.55" r="0.55"><stop offset="0" stop-color="${VIOLETT}" stop-opacity="0.32"/><stop offset="1" stop-color="${VIOLETT}" stop-opacity="0"/></radialGradient>
    <radialGradient id="nebelM" cx="0.22" cy="0.3" r="0.45"><stop offset="0" stop-color="${MINT}" stop-opacity="0.16"/><stop offset="1" stop-color="${MINT}" stop-opacity="0"/></radialGradient>
    <radialGradient id="hof"><stop offset="0" stop-color="${VHELL}" stop-opacity="0.35"/><stop offset="1" stop-color="${VHELL}" stop-opacity="0"/></radialGradient>
    <radialGradient id="hofM"><stop offset="0" stop-color="${VIOLETT}" stop-opacity="0.6"/><stop offset="1" stop-color="${VIOLETT}" stop-opacity="0"/></radialGradient>
    <linearGradient id="linieM" x1="0" x2="1"><stop offset="0" stop-color="${VHELL}"/><stop offset="1" stop-color="${MINT}"/></linearGradient>
    <linearGradient id="linieA" x1="0" x2="1"><stop offset="0" stop-color="#8b949e"/><stop offset="1" stop-color="#8b949e"/></linearGradient>
    <clipPath id="rund"><rect width="1200" height="620" rx="20"/></clipPath>
    <clipPath id="mitte"><circle r="34"/></clipPath>
  </defs>
  <g clip-path="url(#rund)">
    <rect width="1200" height="620" fill="#07090d"/>
    <rect width="1200" height="620" fill="url(#nebelV)"><animate attributeName="opacity" values="0.75;1;0.75" dur="9s" repeatCount="indefinite"/></rect>
    <rect width="1200" height="620" fill="url(#nebelM)"/>
    ${funkeln(z, 140, 1200, 620, ["#ffffff", "#ffffff", VHELL, MINT])}
    ${schnuppe("s2", 1150, 40, -300, 140, 9, 4, VHELL)}
    <text x="40" y="54" font-family="${MONO}" font-size="13" letter-spacing="4" fill="${MINT}">STERNBILD</text>
    <text x="40" y="84" font-family="${SANS}" font-size="26" font-weight="700" fill="#e6edf3">Logsy Network</text>
    <text x="40" y="108" font-family="${SANS}" font-size="15" fill="#8b949e">Gebaut, betrieben und jeden Tag benutzt.</text>
    ${linien}
    <g transform="translate(${M.x} ${M.y})">
      <circle r="90" fill="url(#hofM)"><animate attributeName="r" values="80;100;80" dur="4s" repeatCount="indefinite"/></circle>
      <circle r="40" fill="#0d1117" stroke="${VIOLETT}" stroke-width="2"/>
      <circle r="40" fill="none" stroke="${VHELL}" stroke-width="1.5" opacity="0"><animate attributeName="r" values="40;70" dur="2.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.7;0" dur="2.6s" repeatCount="indefinite"/></circle>
      <image href="${logo("logsy.png")}" x="-34" y="-34" width="68" height="68" clip-path="url(#mitte)"/>
    </g>
    ${knoten}
    <text x="1160" y="596" text-anchor="end" font-family="${MONO}" font-size="13" fill="#6e7681">logsy.de</text>
  </g>
</svg>`;
}

/* ------------------------------------------------- Knöpfe zu Projekten */
function knopf(p, beschriftung, logoDatei) {
  const logo = daten(A(`logsy/${logoDatei}`), logoDatei.endsWith(".svg") ? "image/svg+xml" : "image/png");
  const farbe = STATUS[p] || VHELL;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 64" width="380" height="64" role="img" aria-label="${esc(beschriftung)}">
  <defs><linearGradient id="r" x1="0" x2="1"><stop offset="0" stop-color="${farbe}" stop-opacity="0.6"/><stop offset="1" stop-color="#30363d"/></linearGradient>
  <linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.09"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <clipPath id="c"><rect x="1" y="1" width="378" height="62" rx="14"/></clipPath><clipPath id="l"><rect x="14" y="12" width="40" height="40" rx="10"/></clipPath></defs>
  <g clip-path="url(#c)"><rect width="380" height="64" fill="#0d1117"/>
  <rect x="-120" width="90" height="64" fill="url(#g)"><animate attributeName="x" values="-120;420" dur="2.4s" begin="${f(Math.random() * 2)}s;gE.end+4s" id="gE"/></rect></g>
  <rect x="1" y="1" width="378" height="62" rx="14" fill="none" stroke="url(#r)" stroke-width="1.5"/>
  <image href="${logo}" x="14" y="12" width="40" height="40" clip-path="url(#l)"/>
  <text x="68" y="38" font-family="${SANS}" font-size="17" font-weight="650" fill="#e6edf3">${esc(beschriftung)}</text>
  <text x="352" y="39" text-anchor="end" font-family="${SANS}" font-size="18" fill="${farbe}">→</text>
</svg>`;
}

fs.writeFileSync(A("kopf.svg"), kopf());
fs.writeFileSync(A("terminal.svg"), terminal());
fs.writeFileSync(A("sternbild.svg"), sternbild());
const KNOEPFE = [
  ["knopf-voice.svg", "live", "Logsy Voice", "voice.png"],
  ["knopf-icon.svg", "live", "Icon Roleplay", "icon.png"],
  ["knopf-songs.svg", "live", "Songs erraten", "songs.png"],
  ["knopf-wl.svg", "in Arbeit", "Who Liked?", "wholiked.svg"],
  ["knopf-builds.svg", "Beta", "Logsy Builds", "builds.png"],
  ["knopf-anfragen.svg", "projekt", "Projekt anfragen", "logsy.png"],
];
for (const [datei, status, name, logo] of KNOEPFE) fs.writeFileSync(A(datei), knopf(status, name, logo));
for (const d of fs.readdirSync(path.join(repo, "assets")).filter((d) => d.endsWith(".svg"))) {
  console.log(d.padEnd(22), Math.round(fs.statSync(A(d)).size / 1024) + " KB");
}
