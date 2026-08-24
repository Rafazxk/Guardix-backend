/**
 * GUARDIX PRO - Forensic Engine v3.0
 */

const GuardixApp = (() => {
    const CONFIG = {
        API_BASE_URL: "https://projeto-anti-fraude.onrender.com",
        GAUGE_MAX_DASH: 126
    };

    const state = {
        isAnalyzing: false,
        currentTab: 'dashboard'
    };

    const ui = {
        riskFill: () => document.getElementById('risk-fill'),
        riskValue: () => document.getElementById('risk-value'),
        statusText: () => document.getElementById('status-text'),
        statusDot: () => document.getElementById('status-dot'),
        resultsArea: () => document.getElementById('results-area'),
        btnScan: () => document.querySelector('.btn-primary'),
        inputArea: () => document.querySelector('.scan-textarea'),
        chatBot: () => document.getElementById('guardbot')
    };

    const UIController = {
        init() {
            lucide.createIcons();
            this.setupEventListeners();
            console.log("🛡️ Guardix Engine: Operational");
        },

        setupEventListeners() {
            ui.inputArea()?.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') AnalyticEngine.run();
            });
        },

        toggleSidebar() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.overlay');
            if(sidebar) sidebar.classList.toggle('open');
            if(overlay) overlay.classList.toggle('show');
        },

        switchTab(element, tabId) {
            if (state.currentTab === tabId) return;
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            element.classList.add('active');
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const target = document.getElementById(tabId);
            if (target) {
                target.classList.add('active');
                state.currentTab = tabId;
            }
            if (window.innerWidth < 768) this.toggleSidebar();
        },

        updateGauge(value) {
            const fill = ui.riskFill();
            const display = ui.riskValue();
            const offset = CONFIG.GAUGE_MAX_DASH - (value / 100) * CONFIG.GAUGE_MAX_DASH;
            if (fill) fill.style.strokeDashoffset = offset;

            const theme = value > 70 ? { color: "#ef4444", text: "PERIGOSO" } :
                          value > 30 ? { color: "#f59e0b", text: "SUSPEITO" } :
                                       { color: "#22c55e", text: "SEGURO" };

            this.applyGaugeTheme(theme);
            this.animateNumber(display, value);
        },

        applyGaugeTheme({ color, text }) {
            const { riskFill, statusText, statusDot } = ui;
            if (riskFill()) riskFill().style.stroke = color;
            if (statusText()) {
                statusText().innerText = text;
                statusText().style.color = color;
            }
            if (statusDot()) {
                statusDot().style.background = color;
                statusDot().style.boxShadow = `0 0 12px ${color}`;
            }
        },

        animateNumber(obj, endValue) {
            let start = 0;
            const duration = 1000;
            const step = (timestamp) => {
                if (!start) start = timestamp;
                const progress = Math.min((timestamp - start) / duration, 1);
                obj.innerHTML = Math.floor(progress * endValue);
                if (progress < 1) window.requestAnimationFrame(step);
            };
            window.requestAnimationFrame(step);
        },

        toggleChat() {
            ui.chatBot()?.classList.toggle('hidden');
        }
    };

    const AnalyticEngine = {
        async run() {
            const input = ui.inputArea().value.trim();
            if (!input || state.isAnalyzing) return;

            this.setLoading(true);
            try {
                const endpoint = this.detectRoute(input);
                const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: input })
                });

                const data = await response.json();
                this.renderResults(data);
            } catch (err) {
                console.error("Erro na Engine:", err);
                alert("Servidor em standby. Tente novamente em alguns segundos.");
            } finally {
                this.setLoading(false);
            }
        },

        detectRoute(val) {
            const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
            return phoneRegex.test(val.replace(/\s/g, "")) ? "/api/phone" : "/api/link";
        },

        setLoading(isLoading) {
            state.isAnalyzing = isLoading;
            const btn = ui.btnScan();
            btn.disabled = isLoading;
            btn.innerHTML = isLoading ? `<i data-lucide="loader-2" class="spin"></i> AGUARDE...` : `<i data-lucide="zap"></i> INICIAR VARREDURA`;
            lucide.createIcons();
        },

        renderResults(data) {
            UIController.updateGauge(data.risco || 0);
            ui.resultsArea().style.display = "block";
            const xrayValues = document.querySelectorAll('.xray-value');
            if (xrayValues.length >= 3) {
                xrayValues[0].innerText = data.reputacao || "N/A";
                xrayValues[1].innerText = data.scripts || "N/A";
                xrayValues[2].innerText = data.blacklist || "N/A";
            }
        }
    };

    return {
        init: () => UIController.init(),
        toggleSidebar: () => UIController.toggleSidebar(),
        switchTab: (el, id) => UIController.switchTab(el, id),
        realizarAnalise: () => AnalyticEngine.run(),
        toggleChat: () => UIController.toggleChat()
    };
})();

// Disponibiliza globalmente
window.GuardixApp = GuardixApp;
document.addEventListener('DOMContentLoaded', () => GuardixApp.init());