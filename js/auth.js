"use strict";

(function () {
    const VALID_USER = "rocketacesso";
    const VALID_PASS = "rocketgroup";

    const STORAGE_KEY = "rg_auth";          // token de sessão
    const CRED_KEY = "rg_auth_cred";     // credenciais salvas (se marcar)
    const PASSED_FLAG = "rg_passed_login";  // passou pelo login nesta ABA

    // helpers p/ (de)coding
    const enc = (s) => btoa(unescape(encodeURIComponent(String(s))));
    const dec = (s) => { try { return decodeURIComponent(escape(atob(String(s)))); } catch { return ""; } };

    // Preencher usuário/senha se havia sido salvo
    function preloadCreds() {
        const userEl = document.getElementById("user");
        const pwdEl = document.getElementById("pwd");
        const chk = document.getElementById("remember");
        if (chk) chk.checked = false;

        try {
            const raw = localStorage.getItem(CRED_KEY);
            if (!raw) return;
            const obj = JSON.parse(raw);
            if (!obj || !obj.u || !obj.p) return;

            if (userEl) userEl.value = obj.u;
            if (pwdEl) pwdEl.value = dec(obj.p);
            if (chk) chk.checked = true;
        } catch { }
    }

    function saveCreds(u, p) {
        try { localStorage.setItem(CRED_KEY, JSON.stringify({ u, p: enc(p), ts: Date.now() })); } catch { }
    }
    function removeCreds() {
        try { localStorage.removeItem(CRED_KEY); } catch { }
    }

    // Olho inline (ícone dentro do input)
    const pwd = document.getElementById("pwd");
    const eye = document.getElementById("pwdToggle");
    if (pwd && eye) {
        function toggle() {
            const show = pwd.type === "password";
            pwd.type = show ? "text" : "password";
            eye.classList.toggle("is-showing", show);
            pwd.focus({ preventScroll: true });
            const v = pwd.value; pwd.value = ""; pwd.value = v;
        }
        eye.addEventListener("click", toggle);
        eye.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
        });
    }

    // Próxima página após login
    function goNext() {
        try {
            const u = new URL(location.href);
            const next = u.searchParams.get("next") || "./index.html"; // Dash
            location.replace(next);
        } catch {
            location.replace("./index.html");
        }
    }

    // Submit do login
    document.getElementById("loginForm")?.addEventListener("submit", (e) => {
        e.preventDefault();

        const user = (document.getElementById("user")?.value || "").trim();
        const pass = (document.getElementById("pwd")?.value || "").trim();
        const remember = document.getElementById("remember")?.checked;

        if (user !== VALID_USER || pass !== VALID_PASS) {
            alert("Usuário ou senha inválidos.");
            return;
        }

        // token (mais longo se lembrar senha)
        const hours = remember ? 24 * 30 : 8;
        const token = { user, exp: Date.now() + hours * 3600 * 1000 };
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(token)); } catch { }

        // lembrar ou esquecer
        if (remember) saveCreds(user, pass); else removeCreds();

        // marcou que passou pelo login NESTA aba
        try { sessionStorage.setItem(PASSED_FLAG, "1"); } catch { }

        goNext();
    });

    preloadCreds();
})();
