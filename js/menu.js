"use strict";

/**
 * Menu rápido: abre/fecha com acessibilidade, faz o "stagger" nos botões
 * e garante que o botão Sync (criado depois) também anima quando aparecer.
 */
function setupMenu() {
    const toggle = document.getElementById("menuToggle");
    const panel = document.getElementById("quickMenu");
    const closeBt = document.getElementById("menuClose");
    const actions = document.getElementById("menuActions");

    if (!toggle || !panel || !actions) return;

    const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

    // Aplica delays por ordem (stagger) 0,1,2...
    function applyStagger() {
        const kids = Array.from(actions.children);
        kids.forEach((el, i) => {
            el.style.setProperty("--stg", i.toString());
        });
    }

    function openMenu() {
        // mostra o painel
        panel.hidden = false;
        // força cálculo antes de adicionar a classe (para transição suave)
        void panel.offsetWidth;
        toggle.setAttribute("aria-expanded", "true");
        panel.classList.add("open");
        applyStagger();
    }

    function closeMenu() {
        toggle.setAttribute("aria-expanded", "false");
        panel.classList.remove("open");
        // espera a transição terminar e esconde (evita "pulo")
        setTimeout(() => { if (!isOpen()) panel.hidden = true; }, 180);
    }

    // Toggle pelo botão
    toggle.addEventListener("click", () => (isOpen() ? closeMenu() : openMenu()));
    // Fechar no X
    closeBt?.addEventListener("click", closeMenu);

    // Fecha ao clicar fora
    document.addEventListener("click", (e) => {
        if (panel.hidden) return;
        const inside = panel.contains(e.target) || toggle.contains(e.target);
        if (!inside) closeMenu();
    });

    // Fecha com ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isOpen()) closeMenu();
    });

    // Quando o botão Sync ficar pronto, o menu "adota" e anima
    window.addEventListener("dash:sync-button-ready", (ev) => {
        const syncBtn = ev.detail?.button;
        if (!syncBtn) return;

        // coloca antes do "Sair"
        const logout = actions.querySelector("#logoutBtn");
        if (logout) actions.insertBefore(syncBtn, logout);
        else actions.appendChild(syncBtn);

        // garante que ele siga o layout do menu
        syncBtn.style.position = "static";

        // Se o menu está aberto agora, anima a entrada
        if (isOpen()) {
            syncBtn.classList.add("menu-just-added");
            // tira a classe quando terminar a animação
            syncBtn.addEventListener("animationend", () => {
                syncBtn.classList.remove("menu-just-added");
            }, { once: true });
        }

        // reindexa o stagger (ordem pode mudar)
        applyStagger();
    });

    // Caso o Sync já exista no DOM (reload), adotamos também
    const adoptExistingSync = () => {
        const syncBtn = document.getElementById("syncNowBtn");
        if (syncBtn && !actions.contains(syncBtn)) {
            const logout = actions.querySelector("#logoutBtn");
            if (logout) actions.insertBefore(syncBtn, logout);
            else actions.appendChild(syncBtn);
            syncBtn.style.position = "static";
            applyStagger();
        }
    };
    adoptExistingSync();

    // Observa futuras mudanças (se o Sync for criado depois)
    const obs = new MutationObserver(adoptExistingSync);
    obs.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupMenu, { once: true });
} else {
    setupMenu();
}
