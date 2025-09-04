"use strict";

/**
 * Regra: SEMPRE começar pelo login em cada nova aba/visita.
 * - Se não passou pelo login nesta aba (sessionStorage), redireciona pro login.
 * - Mesmo tendo passado, precisa ter token válido.
 */
(function () {
    const STORAGE_KEY = "rg_auth";          // token
    const LOGIN_PAGE = "./login.html";
    const PASSED_FLAG = "rg_passed_login";  // flag por aba

    // --- Detecta se a página atual é o login (sem regex)
    function isLoginPage() {
        try {
            const p = (location.pathname || "").toLowerCase();
            const h = (location.href || "").toLowerCase();
            return p.endsWith("/login.html") || p.endsWith("login.html") || h.indexOf("login.html") !== -1;
        } catch {
            return false;
        }
    }

    // --- Lê token válido
    function getToken() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const t = JSON.parse(raw);
            if (!t || !t.exp || Date.now() > Number(t.exp)) return null;
            return t;
        } catch {
            return null;
        }
    }

    // Login sempre pode abrir
    if (isLoginPage()) return;

    // Qualquer página protegida exige ter passado pelo login nesta aba
    let passed = false;
    try { passed = sessionStorage.getItem(PASSED_FLAG) === "1"; } catch { }
    if (!passed) {
        const next = encodeURIComponent((location.pathname || "") + (location.search || ""));
        location.replace(LOGIN_PAGE + "?next=" + next);
        return;
    }

    // E também exige token válido
    if (!getToken()) {
        const next = encodeURIComponent((location.pathname || "") + (location.search || ""));
        location.replace(LOGIN_PAGE + "?next=" + next);
        return;
    }
})();
