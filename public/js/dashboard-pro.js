

/* ─── GUARDIX PRO — VANILLA JS ──────────────────────────────────── */

/* ── DATA ─────────────────────────────────────────────────────────── */
const SCAN_STEPS = [
  "Iniciando varredura forense...",
  "Verificando registros DNS...",
  "Analisando certificado SSL...",
  "Consultando PhishTank...",
  "Verificando VirusTotal...",
  "Checando blacklists globais...",
  "Analisando comportamento de scripts...",
  "Compilando relatório de ameaças...",
  "Varredura concluída.",
];

const RECENT_THREATS = [
  { target: "suporte-itau.xyz", score: 93, type: "Phishing" },
  { target: "+55 (11) 9 8765-4321", score: 72, type: "Golpe SMS" },
  { target: "netflix-login.site.com", score: 88, type: "Clonagem" },
  { target: "pix-bradesco.tk", score: 97, type: "Fraude PIX" },
];

const INCIDENTS = [
  {
    id: "INC-2026-001", target: "suporte-itau-br.xyz", type: "Phishing Bancário",
    severity: "critical", status: "active", date: "05/04/2026 14:32", score: 96,
    description: "Página clonada do Itaú Unibanco coletando credenciais bancárias e tokens 2FA.",
    evidence: ["Screenshot da página de login falsa", "Certificado SSL autofirmado detectado", "Domínio registrado há 2 dias", "IP localizado na Rússia (185.220.101.42)"],
  },
  {
    id: "INC-2026-002", target: "+55 (11) 9 8234-5678", type: "Golpe via WhatsApp",
    severity: "high", status: "investigating", date: "04/04/2026 09:15", score: 78,
    description: "Número realizando golpe do falso funcionário bancário via WhatsApp.",
    evidence: ["3 denúncias no banco de dados", "Número registrado há 2 semanas", "Padrão de ligações suspeitas detectado"],
  },
  {
    id: "INC-2026-003", target: "netflix-renovacao.com", type: "Clonagem de Serviço",
    severity: "high", status: "active", date: "03/04/2026 22:47", score: 89,
    description: "Site falso da Netflix coletando dados de cartão de crédito.",
    evidence: ["Design clonado detectado", "Formulário envia dados para servidor externo", "WHOIS: Registrant oculto"],
  },
  {
    id: "INC-2026-004", target: "vagas-emprego-urgente.top", type: "Fraude de Emprego",
    severity: "medium", status: "resolved", date: "02/04/2026 11:20", score: 62,
    description: "Site de vagas falsas coletando dados pessoais para revenda.",
    evidence: ["Coleta de CPF e RG sem LGPD", "Sem CNPJ válido registrado"],
  },
  {
    id: "INC-2026-005", target: "pix-devolucao.tk", type: "Fraude PIX",
    severity: "critical", status: "active", date: "01/04/2026 08:05", score: 98,
    description: "Golpe de falsa devolução PIX via engenharia social.",
    evidence: ["Domínio .tk (gratuito)", "Script de redirecionamento malicioso", "Listado no PhishTank"],
  },
];

const SEVERITY_CFG = {
  critical: { label: "CRÍTICO", cls: "badge-red",     icon: "fa-triangle-exclamation", iconCls: "c-red",    bgCls: "bg-red",    borderCls: "border-red"   },
  high:     { label: "ALTO",    cls: "badge-orange",   icon: "fa-triangle-exclamation", iconCls: "c-orange", bgCls: "bg-orange", borderCls: "border-orange" },
  medium:   { label: "MÉDIO",   cls: "badge-yellow",   icon: "fa-circle-exclamation",   iconCls: "c-yellow", bgCls: "bg-yellow", borderCls: "border-yellow" },
  low:      { label: "BAIXO",   cls: "badge-green",    icon: "fa-circle-check",         iconCls: "c-green",  bgCls: "bg-green",  borderCls: "border-green"  },
};

const STATUS_CFG = {
  active:       { label: "ATIVO",        dotCls: "bg-red",    cls: "badge-red"    },
  investigating:{ label: "INVESTIGANDO", dotCls: "bg-yellow", cls: "badge-yellow" },
  resolved:     { label: "RESOLVIDO",    dotCls: "bg-green",  cls: "badge-green"  },
};

const CHAT_ANSWERS = {
  "Como denunciar este número?":
    "Para denunciar um número suspeito:\n\n<b>1. SaferNet Brasil</b> — safer.net.br\n<b>2. Polícia Civil</b> — delegacia virtual do seu estado\n<b>3. Procon</b> — procon.sp.gov.br\n<b>4. Anatel</b> — registre reclamação contra spam via SMS\n\nGuarde prints como prova antes de bloquear.",
  "O que é Typosquatting?":
    "<b>Typosquatting</b> é quando criminosos registram domínios com erros de digitação propositais.\n\nExemplos:\n• itaú.com.br → <b>itauu.com.br</b>\n• nubank.com.br → <b>nubenk.com.br</b>\n• amazon.com → <b>arnazon.com</b>\n\nSempre verifique a URL com cuidado antes de inserir dados sensíveis!",
  "Como identificar phishing?":
    "Sinais de alerta de phishing:\n\n🚩 <b>URL suspeita</b> — domínio diferente da empresa real\n🚩 <b>Urgência forçada</b> — 'Sua conta será bloqueada em 24h!'\n🚩 <b>SSL inválido</b> — sem cadeado ou certificado falso\n🚩 <b>Erros ortográficos</b> — textos mal escritos\n🚩 <b>Pedido de senha</b> — bancos NUNCA pedem senha por e-mail\n\nUse o Guardix Pro para verificar qualquer URL suspeita!",
  "O que fazer se fui vítima?":
    "Aja imediatamente:\n\n1. <b>Bloqueie seu cartão/conta</b> — ligue para o banco\n2. <b>Registre um B.O.</b> — delegacia online do seu estado\n3. <b>Notifique o banco</b> — por canais oficiais apenas\n4. <b>Mude todas as senhas</b> — especialmente e-mail\n5. <b>Ative 2FA</b> — em todas as contas importantes\n\nConserve todas as evidências digitais.",
  "Como verificar um PIX seguro?":
    "Para confirmar que um PIX é legítimo:\n\n✅ Verifique o <b>nome completo</b> do destinatário\n✅ Confirme com a pessoa por <b>vídeo ou ligação</b>\n✅ Desconfie de <b>devoluções</b> que pedem PIX de volta\n✅ Use apenas <b>apps oficiais</b> do seu banco\n✅ Nunca faça PIX por <b>link</b> recebido por mensagem\n\nBancos reais NUNCA enviam links para PIX.",
  "O que é engenharia social?":
    "<b>Engenharia social</b> é a manipulação psicológica para obter informações confidenciais.\n\nTécnicas comuns:\n• <b>Pretexting</b> — pretexto falso (ex: 'sou do banco')\n• <b>Baiting</b> — isca digital (ex: pendrive 'perdido')\n• <b>Vishing</b> — phishing por voz/ligação\n• <b>Smishing</b> — phishing por SMS\n\nA melhor defesa é <b>verificar sempre a identidade</b> de quem pede informações.",
};

/* ── UTILS ────────────────────────────────────────────────────────── */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const qs = sel => document.querySelector(sel);
const qsa = sel => document.querySelectorAll(sel);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const now = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

function scoreColor(s) { return s < 35 ? '#22c55e' : s < 65 ? '#f59e0b' : s < 85 ? '#f97316' : '#ef4444'; }
function scoreCls(s)   { return s < 35 ? 'c-green' : s < 65 ? 'c-yellow' : s < 85 ? 'c-orange' : 'c-red'; }
function scoreBgCls(s) { return s < 35 ? 'bg-green' : s < 65 ? 'bg-yellow' : s < 85 ? 'bg-orange' : 'bg-red'; }
function scoreLabel(s) { return s < 35 ? 'SEGURO' : s < 65 ? 'SUSPEITO' : s < 85 ? 'PERIGOSO' : 'CRÍTICO'; }

/* ── GAUGE CHART ──────────────────────────────────────────────────── */
const GAUGE_R = 90;
const GAUGE_C = Math.PI * GAUGE_R;

function updateGauge(value) {
  const color = scoreColor(value);
  const offset = GAUGE_C - (value / 100) * GAUGE_C;

  const track    = qs('#gauge-fill');
  const valText  = qs('#gauge-val');
  const dotEl    = qs('#gauge-dot');
  const lblEl    = qs('#gauge-lbl');
  const wrapEl   = qs('#gauge-wrap');

  if (!track) return;

  track.style.stroke = color;
  track.style.strokeDashoffset = offset;
  track.style.filter = `drop-shadow(0 0 8px ${color})`;
  valText.style.fill = color;
  valText.textContent = Math.round(value);

  const lbl = scoreLabel(value);
  dotEl.style.background = color;
  dotEl.style.boxShadow = `0 0 6px ${color}`;
  lblEl.textContent = lbl;
  lblEl.style.color = color;

  // pulse red on high risk
  if (value >= 65) {
    wrapEl.style.animation = 'pulse-red 2s ease-in-out infinite';
  } else {
    wrapEl.style.animation = 'none';
  }
}

function animateGaugeTo(target, duration = 1200) {
  let start = null;
  let from = 0;

  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = from + (target - from) * eased;
    updateGauge(current);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ── SCAN LOGIC ───────────────────────────────────────────────────── */
function generateScanResult(input) {
  const isSuspicious = input.includes('http://') || /phish|fake|bit\.ly/i.test(input);
  const isDangerous  = /malware|virus|\.xyz|\.tk/i.test(input);
  const score = isDangerous
    ? Math.floor(Math.random() * 20 + 78)
    : isSuspicious
      ? Math.floor(Math.random() * 25 + 45)
      : Math.floor(Math.random() * 25 + 5);

  return {
    score,
    domain: {
      age:      score > 65 ? '3 dias' : '4 anos, 7 meses',       ageOk:     score <= 65,
      ssl:      score > 65 ? 'Autofirmado / Inválido' : "Let's Encrypt (válido)", sslOk: score <= 65,
      country:  score > 65 ? 'RU / Rússia' : 'US / Estados Unidos', countryOk: score <= 65,
    },
    behavior: {
      cookies:  score > 50 ? 'Leitura de cookies detectada' : 'Nenhum acesso',  cookiesDetected: score > 50,
      camera:   score > 75 ? 'Solicitação de webcam detectada' : 'Nenhum acesso', cameraDetected: score > 75,
      trackers: score > 40 ? `${Math.floor(score/15)} rastreadores` : 'Nenhum rastreador', trackersDetected: score > 40,
    },
    blacklists: {
      phishtank: score > 70 ? 'LISTADO' : 'Limpo',                 phishtankOk: score <= 70,
      virustotal:score > 60 ? `${Math.floor(score/10)}/72 engines` : '0/72 engines', virustotalOk: score <= 60,
      google:    score > 80 ? 'FLAGGED' : 'Não listado',           googleOk: score <= 80,
    },
  };
}

async function runScan(input) {
  const scanBtn   = qs('#scan-btn');
  const clearBtn  = qs('#clear-btn');
  const logSection= qs('#scan-log');
  const logLines  = qs('#scan-log-lines');
  const resultSec = qs('#scan-result');
  const hintEl    = qs('#gauge-hint');

  scanBtn.disabled = true;
  scanBtn.innerHTML = '<span class="spinner"></span> Analisando...';
  clearBtn.classList.add('hidden');
  logSection.classList.remove('hidden');
  logLines.innerHTML = '';
  resultSec.classList.add('hidden');
  updateGauge(0);
  hintEl && (hintEl.textContent = '');

  for (let i = 0; i < SCAN_STEPS.length; i++) {
    await sleep(500 + Math.random() * 300);
    const line = el('div', 'scan-line');
    line.innerHTML = `<i class="fa-solid fa-check"></i><span>${SCAN_STEPS[i]}</span>`;
    logLines.appendChild(line);
    logLines.scrollTop = logLines.scrollHeight;
  }

  await sleep(300);
  const result = generateScanResult(input);
  animateGaugeTo(result.score);
  logSection.classList.add('hidden');
  renderScanResult(result);

  scanBtn.disabled = false;
  scanBtn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Iniciar Varredura Forense';
  clearBtn.classList.remove('hidden');
  hintEl && (hintEl.textContent = '');
}

function renderScanResult(r) {
  const sec = qs('#scan-result');
  const isDanger = r.score >= 65;

  const domainItems = [
    { label: 'Idade do Domínio', value: r.domain.age,     ok: r.domain.ageOk,     icon: 'fa-clock' },
    { label: 'SSL/TLS',          value: r.domain.ssl,     ok: r.domain.sslOk,     icon: 'fa-lock' },
    { label: 'País de Origem',   value: r.domain.country, ok: r.domain.countryOk, icon: 'fa-globe' },
  ];
  const behaviorItems = [
    { label: 'Acesso a Cookies', value: r.behavior.cookies,  ok: !r.behavior.cookiesDetected,  icon: 'fa-eye' },
    { label: 'Acesso a Câmera',  value: r.behavior.camera,   ok: !r.behavior.cameraDetected,   icon: 'fa-eye' },
    { label: 'Rastreadores',     value: r.behavior.trackers, ok: !r.behavior.trackersDetected, icon: 'fa-wifi' },
  ];
  const blacklistItems = [
    { label: 'PhishTank',       value: r.blacklists.phishtank,  ok: r.blacklists.phishtankOk,  icon: 'fa-shield' },
    { label: 'VirusTotal',      value: r.blacklists.virustotal, ok: r.blacklists.virustotalOk, icon: 'fa-shield' },
    { label: 'Google SafeBrowse',value: r.blacklists.google,    ok: r.blacklists.googleOk,     icon: 'fa-shield' },
  ];

  const xrayCol = (title, items, delay) => `
    <div>
      <div class="xray-col-title">${title}</div>
      ${items.map((it, i) => `
        <div class="xray-item" style="animation-delay:${delay + i*0.07}s">
          <div class="xray-icon ${it.ok ? 'ok' : 'bad'}"><i class="fa-solid ${it.icon}"></i></div>
          <div class="xray-text">
            <div class="xray-label">${it.label}</div>
            <div class="xray-value ${it.ok ? 'ok' : 'bad'}">${it.value}</div>
          </div>
          <div class="xray-dot ${it.ok ? 'ok' : 'bad'}"></div>
        </div>`).join('')}
    </div>`;

  sec.innerHTML = `
    <div class="result-header">
      <div class="result-header-left">
        <i class="fa-solid ${isDanger ? 'fa-triangle-exclamation c-red' : 'fa-circle-check c-green'}" style="font-size:20px"></i>
        <h3>${isDanger ? 'AMEAÇA DETECTADA' : 'Alvo Seguro'}</h3>
      </div>
      <span class="result-score ${scoreCls(r.score)}">${r.score}/100</span>
    </div>
    <div class="xray-title">
      <i class="fa-solid fa-bolt"></i> Raio-X da Ameaça
      <div class="divider"></div>
    </div>
    <div class="xray-grid grid-3" style="gap:16px">
      ${xrayCol('Reputação do Domínio', domainItems, 0.05)}
      ${xrayCol('Comportamento do Script', behaviorItems, 0.18)}
      ${xrayCol('Blacklist Global', blacklistItems, 0.32)}
    </div>`;

  sec.style.borderColor = isDanger ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)';
  sec.classList.remove('hidden');
  sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── DASHBOARD INIT ───────────────────────────────────────────────── */
function initDashboard() {
  // Quick target chips
  qsa('.quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      qs('#scan-input').value = chip.dataset.target;
    });
  });

  // Drag-and-drop
  const zone = qs('#input-zone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) qs('#scan-input').value = `[Imagem carregada: ${file.name}]`;
  });

  // File pick
  qs('#file-btn').addEventListener('click', () => qs('#file-input').click());
  qs('#file-input').addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) qs('#scan-input').value = `[Imagem: ${f.name}]`;
  });

  // Scan button
  qs('#scan-btn').addEventListener('click', () => {
    const val = qs('#scan-input').value.trim();
    if (!val) return;
    runScan(val);
  });
  qs('#scan-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); qs('#scan-btn').click(); }
  });

  // Clear button
  qs('#clear-btn').addEventListener('click', () => {
    qs('#scan-input').value = '';
    qs('#scan-result').classList.add('hidden');
    qs('#scan-log').classList.add('hidden');
    qs('#clear-btn').classList.add('hidden');
    updateGauge(0);
    qs('#gauge-hint') && (qs('#gauge-hint').textContent = 'Insira uma URL ou telefone para análise');
  });

  // Render recent threats
  const list = qs('#recent-threats-list');
  RECENT_THREATS.forEach(t => {
    const item = el('div', 'threat-item');
    item.innerHTML = `
      <div class="threat-icon ${scoreBgCls(t.score)}">
        <i class="fa-solid fa-triangle-exclamation ${scoreCls(t.score)}"></i>
      </div>
      <div>
        <div class="threat-name">${t.target}</div>
        <div class="threat-type">${t.type}</div>
      </div>
      <span class="threat-score ${scoreCls(t.score)}">${t.score}</span>
      <i class="fa-solid fa-chevron-right threat-arrow"></i>`;
    item.addEventListener('click', () => {
      qs('#scan-input').value = t.target;
      navigateTo('dashboard');
    });
    list.appendChild(item);
  });
}

/* ── IP INVESTIGATOR ──────────────────────────────────────────────── */
function generateIPResult(ip) {
  const isSus = ip.startsWith('185.') || ip.startsWith('45.') || ip.startsWith('194.');
  const score = isSus ? Math.floor(Math.random() * 30 + 60) : Math.floor(Math.random() * 25 + 5);
  return {
    ip,
    country: isSus ? 'Rússia' : 'Brasil', countryCode: isSus ? 'RU' : 'BR',
    region: isSus ? 'Moscou Oblast' : 'São Paulo', city: isSus ? 'Moscou' : 'São Paulo',
    isp: isSus ? 'Hosting ISP Ltd' : 'Claro S.A.',
    org: isSus ? 'AS12345 Hosting Provider' : 'AS28573 Claro',
    lat: isSus ? 55.7558 : -23.5505, lon: isSus ? 37.6173 : -46.6333,
    timezone: isSus ? 'Europe/Moscow' : 'America/Sao_Paulo',
    isProxy: isSus && Math.random() > .5,
    isTor: isSus && Math.random() > .7,
    isVPN: isSus && Math.random() > .4,
    score, asn: isSus ? 'AS12345' : 'AS28573',
    ports: [
      { port: 22,   svc: 'SSH',      open: isSus },
      { port: 80,   svc: 'HTTP',     open: true },
      { port: 443,  svc: 'HTTPS',    open: true },
      { port: 3306, svc: 'MySQL',    open: isSus },
      { port: 6379, svc: 'Redis',    open: isSus },
      { port: 8080, svc: 'HTTP-Alt', open: Math.random() > .5 },
    ],
  };
}

function renderIPResult(r) {
  const sec = qs('#ip-result');

  const infoRow = (label, value) => `
    <div class="ip-info-row">
      <span class="ip-info-label">${label}</span>
      <span class="ip-info-value">${value}</span>
    </div>`;

  const flagBadge = (v) => v
    ? `<span class="badge badge-red">DETECTADO</span>`
    : `<span class="badge badge-green">Não</span>`;

  sec.innerHTML = `
    <div class="grid-2" style="gap:16px">
      <!-- LEFT: loc + provider + ports -->
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card">
          <div class="card-title"><i class="fa-solid fa-location-dot"></i> Localização <div class="divider"></div></div>
          ${infoRow('IP', r.ip)}
          ${infoRow('País', `${r.countryCode} / ${r.country}`)}
          ${infoRow('Região', r.region)}
          ${infoRow('Cidade', r.city)}
          ${infoRow('Timezone', r.timezone)}
          ${infoRow('Coordenadas', `${r.lat.toFixed(4)}, ${r.lon.toFixed(4)}`)}
        </div>
        <div class="card">
          <div class="card-title"><i class="fa-solid fa-server"></i> Provedor <div class="divider"></div></div>
          ${infoRow('ISP', r.isp)}
          ${infoRow('Organização', r.org)}
          ${infoRow('ASN', r.asn)}
          <div style="margin-top:14px;border-top:1px solid rgba(255,255,255,.05);padding-top:12px">
            ${infoRow('Proxy', flagBadge(r.isProxy))}
            ${infoRow('Tor Node', flagBadge(r.isTor))}
            ${infoRow('VPN', flagBadge(r.isVPN))}
          </div>
        </div>
        <div class="card">
          <div class="card-title"><i class="fa-solid fa-wifi"></i> Varredura de Portas <div class="divider"></div></div>
          <div class="port-grid">
            ${r.ports.map(p => `
              <div class="port-item ${p.open ? 'open' : ''}">
                <div class="port-dot"></div>
                <div><div class="port-num">${p.port}</div><div class="port-svc">${p.svc}</div></div>
                <span class="port-status">${p.open ? 'OPEN' : 'closed'}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <!-- RIGHT: score + map -->
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card" style="border-color:${r.score >= 65 ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}">
          <div class="card-title"><i class="fa-solid fa-shield-halved"></i> Score de Ameaça <div class="divider"></div></div>
          <div style="font-size:64px;font-weight:900;text-align:center;padding:16px 0;color:${scoreColor(r.score)}">${r.score}</div>
          <div style="height:6px;border-radius:4px;overflow:hidden;background:rgba(255,255,255,.06)">
            <div style="height:100%;border-radius:4px;width:${r.score}%;background:${scoreColor(r.score)};transition:width 1s ease"></div>
          </div>
          <div style="text-align:center;margin-top:10px;font-size:14px;font-weight:800;color:${scoreColor(r.score)}">${scoreLabel(r.score)}</div>
        </div>

        <div class="card">
          <div class="card-title"><i class="fa-solid fa-globe"></i> Mapa de Localização <div class="divider"></div></div>
          <div class="map-placeholder">
            <div class="map-grid"></div>
            <div class="map-ping"></div>
            <div class="map-coords">
              <div class="coord">${r.lat.toFixed(2)}, ${r.lon.toFixed(2)}</div>
              <div class="city">${r.city}, ${r.country}</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  sec.classList.remove('hidden');
  sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function initIPInvestigator() {
  qs('#ip-investigate-btn').addEventListener('click', async () => {
    const val = qs('#ip-input').value.trim();
    if (!val) return;
    const btn = qs('#ip-investigate-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Investigando...';
    qs('#ip-result').classList.add('hidden');
    await sleep(1800 + Math.random() * 800);
    renderIPResult(generateIPResult(val));
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Investigar';
  });

  qs('#ip-input').addEventListener('keydown', e => { if (e.key === 'Enter') qs('#ip-investigate-btn').click(); });

  qsa('.ip-suspect-chip').forEach(chip => {
    chip.addEventListener('click', () => { qs('#ip-input').value = chip.dataset.ip; });
  });
}

/* ── INCIDENT REPORTS ─────────────────────────────────────────────── */
let selectedIncident = null;
let currentFilter = 'all';

function renderIncidentItem(inc) {
  const sev = SEVERITY_CFG[inc.severity];
  const sta = STATUS_CFG[inc.status];
  const div = el('div', `incident-item${selectedIncident?.id === inc.id ? ' selected' : ''}`);
  div.dataset.id = inc.id;
  div.innerHTML = `
    <div class="inc-top">
      <span class="inc-id">${inc.id}</span>
      <span class="badge ${sev.cls}">${sev.label}</span>
      <span class="badge ${sta.cls}" style="display:flex;align-items:center;gap:4px">
        <span style="width:6px;height:6px;border-radius:50%;background:currentColor;display:inline-block;opacity:.7"></span>
        ${sta.label}
      </span>
    </div>
    <div class="inc-name">${inc.target}</div>
    <div class="inc-type">${inc.type}</div>
    <div class="inc-bottom">
      <div class="inc-time"><i class="fa-regular fa-clock"></i> ${inc.date}</div>
      <span class="inc-score ${scoreCls(inc.score)}">${inc.score}/100</span>
      <i class="fa-solid fa-chevron-right" style="color:#4b5563;font-size:11px;margin-left:4px"></i>
    </div>`;
  div.addEventListener('click', () => selectIncident(inc));
  return div;
}

function renderIncidentList() {
  const list = qs('#incident-list');
  list.innerHTML = '';
  const filtered = currentFilter === 'all' ? INCIDENTS : INCIDENTS.filter(i => i.severity === currentFilter);
  filtered.forEach(inc => list.appendChild(renderIncidentItem(inc)));
}

function selectIncident(inc) {
  selectedIncident = inc;
  renderIncidentList();
  const sev = SEVERITY_CFG[inc.severity];
  const detail = qs('#incident-detail');
  detail.innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px;flex-wrap:wrap">
      <div>
        <div style="font-size:10px;font-family:monospace;color:var(--text-muted)">${inc.id}</div>
        <div style="font-size:15px;font-weight:700;color:#fff;margin-top:3px">${inc.target}</div>
      </div>
      <button id="dl-pdf-btn" class="btn-gold">
        <i class="fa-solid fa-file-arrow-down"></i> Gerar PDF de Provas
      </button>
    </div>
    <div style="padding:12px;border-radius:10px;background:rgba(255,255,255,.025);margin-bottom:16px">
      <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px">Descrição</div>
      <div style="font-size:13px;color:var(--text-dim);line-height:1.6">${inc.description}</div>
    </div>
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin-bottom:8px;display:flex;align-items:center;gap:6px">
      <i class="fa-solid fa-eye" style="color:var(--purple-light)"></i> Evidências Coletadas
    </div>
    <div id="evidence-list"></div>`;

  const evList = qs('#evidence-list');
  inc.evidence.forEach((ev, i) => {
    const item = el('div', 'evidence-item');
    item.style.animationDelay = `${i * 0.06}s`;
    item.innerHTML = `<i class="fa-solid fa-shield-halved"></i><span>${ev}</span>`;
    evList.appendChild(item);
  });

  qs('#dl-pdf-btn').addEventListener('click', async () => {
    const btn = qs('#dl-pdf-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="border-color:rgba(0,0,0,.2);border-top-color:#000"></span> Gerando...';
    await sleep(1200);
    downloadReport(inc);
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-file-arrow-down"></i> Gerar PDF de Provas';
  });
}

function downloadReport(inc) {
  const content = [
    'RELATÓRIO FORENSE — GUARDIX PRO',
    '='.repeat(48),
    '',
    `ID do Incidente : ${inc.id}`,
    `Data            : ${inc.date}`,
    `Alvo            : ${inc.target}`,
    `Tipo            : ${inc.type}`,
    `Severidade      : ${SEVERITY_CFG[inc.severity].label}`,
    `Score de Risco  : ${inc.score}/100`,
    `Status          : ${STATUS_CFG[inc.status].label}`,
    '',
    'DESCRIÇÃO:',
    inc.description,
    '',
    'EVIDÊNCIAS COLETADAS:',
    ...inc.evidence.map((e, i) => `${i + 1}. ${e}`),
    '',
    '='.repeat(48),
    `Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`,
    'Powered by Guardix Pro',
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `guardix-${inc.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function initIncidentReports() {
  renderIncidentList();

  qsa('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      qsa('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      renderIncidentList();
    });
  });
}

/* ── PRO SETTINGS ─────────────────────────────────────────────────── */
function initProSettings() {
  const API_KEY = 'grdx_pro_sk_7c3aed9f2b1a8e4d6c5f3b2a1e9d8c7b';
  const masked  = API_KEY.replace(/^(grdx_pro_sk_)(.{4}).*(.{4})$/, '$1$2••••••••••••••••$3');
  let showKey   = false;

  const keyEl  = qs('#api-key-text');
  const eyeBtn = qs('#eye-btn');
  const copyBtn= qs('#copy-btn');

  eyeBtn.addEventListener('click', () => {
    showKey = !showKey;
    keyEl.textContent = showKey ? API_KEY : masked;
    eyeBtn.innerHTML = showKey
      ? '<i class="fa-solid fa-eye-slash"></i>'
      : '<i class="fa-solid fa-eye"></i>';
  });

  copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(API_KEY).catch(() => {});
    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i>';
      copyBtn.classList.remove('copied');
    }, 2000);
  });

  qsa('.toggle-switch').forEach(sw => {
    sw.addEventListener('click', () => sw.classList.toggle('on'));
  });

  qsa('.save-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Salvo!';
      btn.disabled = true;
      await sleep(2000);
      btn.innerHTML = orig;
      btn.disabled = false;
    });
  });
}

/* ── CHATBOT ──────────────────────────────────────────────────────── */
function initChatbot() {
  const fab      = qs('#chat-fab');
  const chatbox  = qs('#chatbot');
  const msgsEl   = qs('#chat-messages');
  const inputEl  = qs('#chat-text-input');
  const sendBtn  = qs('#chat-send-btn');
  const qaArea   = qs('#chat-qa-area');

  let open = false;
  let msgCount = 1;

  fab.addEventListener('click', () => {
    open = !open;
    chatbox.classList.toggle('hidden', !open);
    fab.querySelector('i').className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-comment-dots';
    if (open) setTimeout(() => inputEl.focus(), 200);
  });

  function appendMsg(role, html) {
    const isUser = role === 'user';
    const wrap = el('div', `chat-msg${isUser ? ' user' : ''}`);
    wrap.innerHTML = isUser ? '' : `
      <div class="chat-avatar"><i class="fa-solid fa-shield-halved"></i></div>`;
    const bwrap = el('div', 'chat-bubble-wrap');
    const bubble = el('div', 'chat-bubble');
    bubble.innerHTML = html;
    const time = el('div', 'chat-time', now());
    bwrap.appendChild(bubble);
    bwrap.appendChild(time);
    wrap.appendChild(bwrap);
    msgsEl.appendChild(wrap);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    msgCount++;
    if (msgCount > 2) qaArea.classList.add('hidden');
    return wrap;
  }

  function showTyping() {
    const wrap = el('div', 'chat-typing');
    wrap.innerHTML = `<div class="chat-avatar"><i class="fa-solid fa-shield-halved"></i></div>
      <div class="typing-dots">
        <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
      </div>`;
    msgsEl.appendChild(wrap);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return wrap;
  }

  async function sendMessage(text) {
    if (!text.trim()) return;
    inputEl.value = '';
    sendBtn.disabled = true;
    appendMsg('user', text);
    const typing = showTyping();
    await sleep(700 + Math.random() * 600);
    typing.remove();
    const answer = CHAT_ANSWERS[text] || 'Para uma análise detalhada, use o campo de entrada no Dashboard Forense. Cole a URL ou número suspeito lá para uma varredura completa.<br><br>Posso ajudar com mais alguma dúvida sobre cibersegurança?';
    appendMsg('bot', answer.replace(/\n/g, '<br>'));
    sendBtn.disabled = false;
  }

  sendBtn.addEventListener('click', () => sendMessage(inputEl.value));
  inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(inputEl.value); });

  qsa('.qa-chip').forEach(chip => {
    chip.addEventListener('click', () => sendMessage(chip.dataset.q));
  });
}

/* ── NAVIGATION ───────────────────────────────────────────────────── */
const PAGE_TITLES = {
  dashboard:        'Dashboard Forense',
  'ip-investigator':'Investigador de IPs',
  'incident-reports':'Relatórios de Incidente',
  'pro-settings':   'Configurações PRO',
};

function navigateTo(pageId) {
  qsa('.page').forEach(p => p.classList.remove('active'));
  qsa('.nav-item').forEach(n => n.classList.remove('active'));

  const page = qs(`#page-${pageId}`);
  if (page) page.classList.add('active');

  const navItem = qs(`[data-page="${pageId}"]`);
  if (navItem) navItem.classList.add('active');

  qs('#topbar-title').textContent = PAGE_TITLES[pageId] || '';

  // Close mobile sidebar
  qs('.sidebar').classList.remove('open');
  qs('.overlay').classList.remove('show');
}

function initNav() {
  qsa('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });

  // Mobile hamburger
  qs('#hamburger').addEventListener('click', () => {
    qs('.sidebar').classList.toggle('open');
    qs('.overlay').classList.toggle('show');
  });
  qs('.overlay').addEventListener('click', () => {
    qs('.sidebar').classList.remove('open');
    qs('.overlay').classList.remove('show');
  });
}

/* ── BOOTSTRAP ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initDashboard();
  initIPInvestigator();
  initIncidentReports();
  initProSettings();
  initChatbot();
  navigateTo('dashboard');
});