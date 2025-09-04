"use strict";

(function () {
    // Credenciais
    const VALID_USER = "rocketacesso";
    const VALID_PASS = "rocketgroup";

    // Storage keys
    const STORAGE_KEY = "rg_auth";          // token de sessão
    const CRED_KEY = "rg_auth_cred";      // credenciais salvas (se marcar)
    const PASSED_FLAG = "rg_passed_login";  // passou pelo login nesta ABA

    // Helpers para (de)coding da senha salva
    const enc = (s) => btoa(unescape(encodeURIComponent(String(s))));
    const dec = (s) => { try { return decodeURIComponent(escape(atob(String(s)))); } catch { return ""; } };

    // DOM
    const form = document.getElementById("loginForm");
    const userEl = document.getElementById("user");
    const pwdEl = document.getElementById("pwd");
    const remember = document.getElementById("remember");
    const eyeBtn = document.getElementById("pwdToggle");
    const welcome = document.getElementById("loginWelcome");

    // Overlay helpers
    function showWelcome(msg) {
        if (!welcome) return;
        const sub = welcome.querySelector(".welcome-sub");
        if (sub && msg) sub.textContent = msg;
        welcome.removeAttribute("hidden");
    }
    function hideWelcome() {
        if (!welcome) return;
        welcome.setAttribute("hidden", "");
    }

    // Pre-load de credenciais salvas (se houver)
    function preloadCreds() {
        if (remember) remember.checked = false;
        try {
            const raw = localStorage.getItem(CRED_KEY);
            if (!raw) return;
            const obj = JSON.parse(raw);
            if (!obj || !obj.u || !obj.p) return;
            if (userEl) userEl.value = obj.u;
            if (pwdEl) pwdEl.value = dec(obj.p);
            if (remember) remember.checked = true;
        } catch { }
    }

    function saveCreds(u, p) {
        try {
            localStorage.setItem(CRED_KEY, JSON.stringify({ u, p: enc(p), ts: Date.now() }));
        } catch { }
    }
    function removeCreds() {
        try { localStorage.removeItem(CRED_KEY); } catch { }
    }

    // Mostrar/ocultar senha (ícone dentro do input)
    if (pwdEl && eyeBtn) {
        function togglePwd() {
            const show = pwdEl.type === "password";
            pwdEl.type = show ? "text" : "password";
            eyeBtn.classList.toggle("is-showing", show);
            // hackzinho p/ manter caret no fim
            const v = pwdEl.value; pwdEl.value = ""; pwdEl.value = v;
            pwdEl.focus({ preventScroll: true });
        }
        eyeBtn.addEventListener("click", togglePwd);
        eyeBtn.addEventListener("keydown", (e) => {
            if (e.key === " " || e.key === "Enter") { e.preventDefault(); togglePwd(); }
        });
    }

    // Redirecionamento pós-login (respeita ?next=)
    function goNext() {
        try {
            const u = new URL(location.href);
            const next = u.searchParams.get("next") || "./index.html";
            location.replace(next);
        } catch {
            location.replace("./index.html");
        }
    }

    // Submit do login
    form?.addEventListener("submit", (e) => {
        e.preventDefault();

        const user = (userEl?.value || "").trim();
        const pass = (pwdEl?.value || "").trim();
        const wantRemember = !!remember?.checked;

        // Mostra o bloco imediatamente (efeito "preloader")
        showWelcome("Validando acesso…");

        // Aguarda um tick para o overlay renderizar antes da validação
        setTimeout(() => {
            if (user !== VALID_USER || pass !== VALID_PASS) {
                hideWelcome();
                alert("Usuário ou senha inválidos.");
                return;
            }

            // OK: cria token (mais longo se lembrar senha)
            const hours = wantRemember ? 24 * 30 : 8;
            const token = { user, exp: Date.now() + hours * 3600 * 1000 };
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(token)); } catch { }

            // Lembrar/limpar credenciais
            if (wantRemember) saveCreds(user, pass);
            else removeCreds();

            // Marca que passou pelo login nesta ABA
            try { sessionStorage.setItem(PASSED_FLAG, "1"); } catch { }

            // Mensagem final e segue para a Dash
            showWelcome("Carregando sua Dash…");
            setTimeout(goNext, 3000); // pequeno delay só para ver a animação
        }, 50);
    });

    preloadCreds();
})();
