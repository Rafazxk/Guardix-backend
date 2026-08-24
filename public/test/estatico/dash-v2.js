/**

- GUARDIX DASH v2 — dashboard.js
- Refatorado com: Gauge Chart, Pontos de Atenção, Botão de Reportar,
- Feed de Golpes, Filtros de Histórico, Estatísticas, Modal Pro.
  */

const API = "httpsprojeto-anti-fraude.onrender.com";

let consultasRealizadas = 0;
const limiteCota = 5;
let historicoCompleto = []; // cache para filtros
let ultimoScore = 0;        // score da última análise

// ============================================================
// 1. INICIALIZAÇÃO
// ============================================================
window.onload = function () {
const token = localStorage.getItem(‘guardix_token’);
const nomeUsuario = localStorage.getItem(‘usuario_nome’) || ‘Usuário’;

```
if (!token) {
    window.location.href = "index.html";
    return;
}

// Avatar e nome
const nomeEl = document.querySelector('.info-user .nome');
if (nomeEl) nomeEl.innerText = nomeUsuario;

const avatarEl = document.getElementById('sidebar-avatar');
if (avatarEl) {
    const parts = nomeUsuario.trim().split(' ');
    avatarEl.innerText = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();
}

atualizarInterfaceCota();
carregarHistorico();
loadLiveAlerts();
carregarFeedGolpes();
carregarEstatisticas();
iniciarStepAnimation();
```

};

// ============================================================
// 2. NAVEGAÇÃO
// ============================================================
function navegar(e, idAlvo) {
if (e) e.preventDefault();

```
document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
const secao = document.getElementById(`secao-${idAlvo}`);
if (secao) { secao.style.display = 'block'; secao.classList.add('active'); }

document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
if (e && e.currentTarget) e.currentTarget.classList.add('active');

if (window.innerWidth < 768) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('ativo');
}
```

}

function alternarMenu() {
const sidebar = document.getElementById(‘sidebar’);
if (sidebar) sidebar.classList.toggle(‘ativo’);
}

// ============================================================
// 3. FORMULÁRIO DE ANÁLISE
// ============================================================
const formAnalise = document.getElementById(‘form-analise-interna’);
if (formAnalise) {
formAnalise.onsubmit = async function (e) {
e.preventDefault();

```
    const link  = document.getElementById("input-url")?.value.trim();
    const phone = document.getElementById("input-tel")?.value.trim();
    const file  = document.getElementById("arquivo-print")?.files[0];

    const resBox   = document.getElementById('resultado-analise');
    const veredito = document.getElementById('veredito');
    const loading  = document.getElementById('loading-container');
    const token    = localStorage.getItem('guardix_token');

    if (consultasRealizadas >= limiteCota) {
        abrirModalPro();
        return;
    }

    if (!link && !phone && !file) {
        showToast("⚠️ Preencha ao menos um campo.", "error");
        return;
    }

    // Mostra resultado e loading
    resBox.style.display = 'block';
    veredito.style.display = 'none';
    loading.style.display = 'flex';
    iniciarStepAnimation();

    try {
        let resultado;
        const headers = { "Authorization": `Bearer ${token}` };

        if (file) {
            const formData = new FormData();
            formData.append("imagem", file);
            const res = await fetch(`${API}/api/print`, { method: "POST", headers, body: formData });
            resultado = await res.json();
        } else if (link) {
            const res = await fetch(`${API}/api/link`, {
                method: "POST",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({ url: link })
            });
            resultado = await res.json();
        } else if (phone) {
            const res = await fetch(`${API}/api/phone`, {
                method: "POST",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({ numero: phone })
            });
            resultado = await res.json();
        }

        if (resultado.error) throw new Error(resultado.error);

        consultasRealizadas++;
        atualizarInterfaceCota();

        loading.style.display = 'none';
        veredito.style.display = 'block';
        renderizarResultado(resultado);
        carregarHistorico();

    } catch (err) {
        loading.style.display = 'none';
        veredito.style.display = 'block';
        veredito.innerHTML = `
            <div style="padding:1.5rem; color: var(--danger); display:flex; align-items:center; gap:.75rem; background: var(--danger-dim); border-radius: var(--radius);">
                <i class="fas fa-triangle-exclamation" style="font-size:1.3rem;"></i>
                <p style="font-size:.9rem;">Erro: ${err.message}</p>
            </div>`;
    }
};
```

}

// ============================================================
// 4. RENDERIZAÇÃO DO RESULTADO COM GAUGE
// ============================================================
function renderizarResultado(data) {
ultimoScore = data.score || 0;
const isPerigo = ultimoScore >= 60;
const isAltaAmeaca = ultimoScore >= 70;

```
const cor    = isPerigo ? 'var(--danger)' : 'var(--success)';
const icone  = isPerigo ? 'fa-triangle-exclamation' : 'fa-circle-check';
const gradId = isPerigo ? 'url(#gaugeGradientDanger)' : 'url(#gaugeGradientSafe)';

// --- Gauge ---
animarGauge(ultimoScore, gradId);
document.getElementById('gauge-number').style.color = cor;
const gaugeLabel = document.getElementById('gauge-label');
gaugeLabel.style.color = cor;
gaugeLabel.innerText = isPerigo ? 'ALTO RISCO' : 'SEGURO';

// --- Header ---
document.getElementById('result-header').innerHTML = `
    <i class="fas ${icone}" style="color:${cor}; font-size:1.4rem;"></i>
    <h2 style="color:${cor}; font-size:1.25rem;">${data.classificacao || 'Análise Concluída'}</h2>`;

// --- Conclusão ---
document.getElementById('result-conclusao').innerText = data.conclusao || '';

// --- Pontos de Atenção ---
const pontosBox = document.getElementById('pontos-atencao');
const listaEl   = document.getElementById('lista-pontos');
const pontos = extrairPontosAtencao(data);

if (pontos.length > 0) {
    listaEl.innerHTML = pontos.map(p =>
        `<li><i class="fas fa-circle-dot" style="color:${p.cor}; font-size:.5rem;"></i> ${p.texto}</li>`
    ).join('');
    pontosBox.style.display = 'block';
} else {
    pontosBox.style.display = 'none';
}

// --- Botão de Reportar (condicional: score > 70) ---
const btnReportar = document.getElementById('btn-reportar');
btnReportar.style.display = isAltaAmeaca ? 'flex' : 'none';
```

}

/** Anima o arco SVG do gauge de 0 até o score */
function animarGauge(score, gradId) {
const fill   = document.getElementById(‘gauge-fill’);
const numEl  = document.getElementById(‘gauge-number’);
const total  = 267; // comprimento total do arco (aprox)
const offset = total - (score / 100) * total;

```
fill.setAttribute('stroke', gradId);

// Animação suave
let current = 267;
let currentNum = 0;
const duration = 900;
const startTime = performance.now();

function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic

    const curOffset = 267 - ease * (267 - offset);
    fill.setAttribute('stroke-dashoffset', curOffset);
    numEl.innerText = Math.round(ease * score);

    if (progress < 1) requestAnimationFrame(step);
}

requestAnimationFrame(step);
```

}

/** Extrai pontos de atenção do resultado da API (adapte às chaves da sua API) */
function extrairPontosAtencao(data) {
const pontos = [];

```
// Exemplo: a API pode retornar um array data.flags ou data.pontos
if (data.flags && Array.isArray(data.flags)) {
    data.flags.forEach(f => {
        pontos.push({ texto: f, cor: 'var(--warn)' });
    });
    return pontos;
}

// Fallback: inferir pontos a partir do score e classificação
if (data.score >= 70) pontos.push({ texto: 'Alvo associado a relatos de fraude', cor: 'var(--danger)' });
if (data.score >= 50) pontos.push({ texto: 'Padrão suspeito detectado nos dados', cor: 'var(--warn)' });
if (data.score >= 30) pontos.push({ texto: 'Verifique a origem antes de prosseguir', cor: 'var(--warn)' });
if (data.score < 30)  pontos.push({ texto: 'Nenhum padrão de risco identificado', cor: 'var(--success)' });

return pontos;
```

}

// ============================================================
// 5. BOTÃO REPORTAR AMEAÇA
// ============================================================
async function reportarAmeaca() {
const token = localStorage.getItem(‘guardix_token’);
try {
await fetch(`${API}/api/reportar`, {
method: ‘POST’,
headers: { ‘Authorization’: `Bearer ${token}`, ‘Content-Type’: ‘application/json’ },
body: JSON.stringify({ score: ultimoScore })
});
showToast(“🚩 Ameaça reportada para a comunidade Guardix!”, “success”);
document.getElementById(‘btn-reportar’).style.display = ‘none’;
} catch {
showToast(“Erro ao reportar. Tente novamente.”, “error”);
}
}

// ============================================================
// 6. COTA
// ============================================================
function atualizarInterfaceCota() {
const contagem = document.getElementById(‘contagem-cota’);
const barra    = document.getElementById(‘progresso-cota’);
if (contagem) contagem.innerText = `${consultasRealizadas}/${limiteCota}`;
if (barra)    barra.style.width  = `${(consultasRealizadas / limiteCota) * 100}%`;
}

// ============================================================
// 7. ALERTAS AO VIVO (strip no verificador)
// ============================================================
async function loadLiveAlerts() {
const container = document.getElementById(‘live-alerts’);
if (!container) return;

```
try {
    const response = await fetch('/api/stats/live');
    const data = await response.json();

    container.innerHTML = '';
    data.forEach(item => {
        const danger = item.total_denuncias > 5;
        container.innerHTML += `
            <div class="live-feed-item">
                <span style="color: var(--text-dim); font-size:.82rem;">${item.status}</span>
                <span class="feed-badge ${danger ? 'feed-badge-danger' : 'feed-badge-warn'}">${item.total_denuncias} relatos</span>
            </div>`;
    });

    if (data.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); font-size:.82rem; padding:.5rem 0;">Nenhum alerta no momento.</p>';
    }
} catch {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:.82rem; padding:.5rem 0;">Sem conexão com a rede Guardix.</p>';
}
```

}

// ============================================================
// 8. FEED DE GOLPES (seção dedicada)
// ============================================================
async function carregarFeedGolpes() {
const container = document.getElementById(‘feed-golpes’);
if (!container) return;

```
// Dados simulados — substitua por chamada real à sua API
const feedMock = [
    { tipo: 'link',     titulo: 'Link de phishing do Itaú detectado', local: 'Recife · PE', tempo: '3 min atrás',   risco: 'alto'  },
    { tipo: 'telefone', titulo: 'Número suspeito aplicando golpe do PIX', local: 'São Paulo · SP', tempo: '11 min atrás', risco: 'alto' },
    { tipo: 'print',    titulo: 'Comprovante falso de depósito circulando', local: 'Fortaleza · CE', tempo: '25 min atrás', risco: 'medio' },
    { tipo: 'link',     titulo: 'Site clonado da Caixa Econômica detectado', local: 'Belo Horizonte · MG', tempo: '42 min atrás', risco: 'alto' },
    { tipo: 'telefone', titulo: 'Fraude em nome do INSS identificada', local: 'Rio de Janeiro · RJ', tempo: '1h atrás',    risco: 'medio' },
];

try {
    // Tente buscar da API real:
    // const res = await fetch(`${API}/api/feed`);
    // const feedMock = await res.json();
} catch { /* usa mock */ }

const tipoIcon = { link: 'fa-link', telefone: 'fa-phone', print: 'fa-image' };
const riscoClasse = { alto: 'feed-badge-danger', medio: 'feed-badge-warn', baixo: 'feed-badge-safe' };
const riscoLabel  = { alto: 'ALTO RISCO', medio: 'MÉDIO', baixo: 'SEGURO' };
const iconeCor = { link: 'var(--indigo)', telefone: 'var(--warn)', print: 'var(--success)' };
const iconeBg  = { link: 'var(--indigo-dim)', telefone: 'var(--warn-dim)', print: 'var(--success-dim)' };

container.innerHTML = feedMock.map(item => `
    <div class="feed-entry">
        <div class="feed-entry-icon" style="background:${iconeBg[item.tipo]}; color:${iconeCor[item.tipo]};">
            <i class="fas ${tipoIcon[item.tipo] || 'fa-circle-exclamation'}"></i>
        </div>
        <div class="feed-entry-body">
            <p class="feed-entry-title">${item.titulo}</p>
            <div class="feed-entry-meta">
                <span><i class="fas fa-location-dot"></i> ${item.local}</span>
                <span><i class="fas fa-clock"></i> ${item.tempo}</span>
            </div>
        </div>
        <span class="feed-badge ${riscoClasse[item.risco]}">${riscoLabel[item.risco]}</span>
    </div>
`).join('');
```

}

// ============================================================
// 9. HISTÓRICO
// ============================================================
async function carregarHistorico() {
const lista = document.getElementById(‘lista-historico’);
const token = localStorage.getItem(‘guardix_token’);
if (!lista) return;

```
try {
    const res = await fetch(`${API}/api/historico`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    historicoCompleto = await res.json();
    renderizarHistorico(historicoCompleto);
} catch {
    lista.innerHTML = '<tr><td colspan="4" class="table-empty" style="color:var(--danger)">Erro de conexão.</td></tr>';
}
```

}

function renderizarHistorico(dados) {
const lista = document.getElementById(‘lista-historico’);
if (!lista) return;

```
if (!dados || dados.length === 0) {
    lista.innerHTML = '<tr><td colspan="4" class="table-empty">Sem consultas ainda.</td></tr>';
    return;
}

const tipoIcon  = { link: '🔗', telefone: '📞', tel: '📞', print: '🖼️', imagem: '🖼️' };
const isRisco   = r => String(r).toLowerCase().includes('risco') || String(r).toLowerCase() === 'perigoso';

lista.innerHTML = dados.map(h => {
    const risco = isRisco(h.resultado);
    const cor   = risco ? 'var(--danger)' : 'var(--success)';
    const icon  = risco ? 'fa-circle-xmark' : 'fa-circle-check';
    const tipo  = (h.tipo || 'link').toLowerCase();
    const tipoEmoji = tipoIcon[tipo] || '🔍';

    return `<tr data-tipo="${tipo}">
        <td style="font-family:'Space Mono',monospace; font-size:.78rem; color:var(--text-dim);">${h.data || '---'}</td>
        <td><span class="type-icon">${tipoEmoji}</span></td>
        <td style="font-weight:600; font-size:.875rem;">${(h.alvo || 'N/A').toUpperCase()}</td>
        <td>
            <span style="color:${cor}; font-weight:700; display:flex; align-items:center; gap:6px; font-size:.82rem;">
                <i class="fas ${icon}"></i> ${h.resultado}
            </span>
        </td>
    </tr>`;
}).join('');
```

}

function filtrarHistorico(tipo, btn) {
document.querySelectorAll(’.filter-tab’).forEach(t => t.classList.remove(‘active’));
btn.classList.add(‘active’);

```
if (tipo === 'todos') {
    renderizarHistorico(historicoCompleto);
} else {
    const filtrado = historicoCompleto.filter(h =>
        (h.tipo || '').toLowerCase() === tipo ||
        (h.tipo || '').toLowerCase().includes(tipo.substring(0, 3))
    );
    renderizarHistorico(filtrado);
}
```

}

// ============================================================
// 10. ESTATÍSTICAS
// ============================================================
async function carregarEstatisticas() {
try {
const token = localStorage.getItem(‘guardix_token’);
const res = await fetch(`${API}/api/stats`, {
headers: { ‘Authorization’: `Bearer ${token}` }
});
const data = await res.json();

```
    setText('stat-total',     data.total      ?? '—');
    setText('stat-ameacas',   data.ameacas     ?? '—');
    setText('stat-risco',     data.risco_medio ? `${data.risco_medio}%` : '—');
    setText('stat-reportados', data.reportados ?? '—');
} catch {
    // silently fail — stats aren't critical
}
```

}

function setText(id, val) {
const el = document.getElementById(id);
if (el) el.innerText = val;
}

// ============================================================
// 11. MODAL PRO
// ============================================================
function abrirModalPro(e) {
if (e) e.preventDefault();
document.getElementById(‘modal-pro’).style.display = ‘flex’;
}

function fecharModalPro(e) {
if (e && e.target !== document.getElementById(‘modal-pro’)) return;
document.getElementById(‘modal-pro’).style.display = ‘none’;
}

// ============================================================
// 12. ASSINAR PRO / LOGOUT
// ============================================================
function assinarPro() {
if (confirm(“Deseja continuar para o checkout do Guardix Pro?”)) {
window.location.href = “dashboard-pro.html”;
}
}

function logout() {
localStorage.clear();
window.location.href = “index.html”;
}

// ============================================================
// 13. TOAST
// ============================================================
function showToast(msg, tipo = ‘info’) {
const toast = document.getElementById(‘toast’);
toast.textContent = msg;
toast.className = `toast toast-${tipo} show`;
setTimeout(() => { toast.className = ‘toast’; }, 3500);
}

// ============================================================
// 14. FILE INPUT
// ============================================================
const inputFile = document.getElementById(‘arquivo-print’);
if (inputFile) {
inputFile.addEventListener(‘change’, function () {
const nome = this.files[0] ? this.files[0].name : “Nenhum arquivo selecionado”;
const labelDoc = document.getElementById(‘nome-doc’);
if (labelDoc) labelDoc.innerText = nome;
});
}

// ============================================================
// 15. ANIMAÇÃO DOS STEPS DE SCAN
// ============================================================
function iniciarStepAnimation() {
const steps = document.querySelectorAll(’.step’);
if (!steps.length) return;
let i = 0;
steps.forEach(s => s.classList.remove(‘active’));
steps[0].classList.add(‘active’);

```
const interval = setInterval(() => {
    i++;
    if (i >= steps.length) { clearInterval(interval); return; }
    steps.forEach(s => s.classList.remove('active'));
    steps[i].classList.add('active');
}, 1200);
```

}