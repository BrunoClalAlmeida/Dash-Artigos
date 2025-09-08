// /js/logout.js
"use strict";

(function () {
    const STORAGE_KEY = "rg_auth";
    const PASSED_FLAG = "rg_passed_login";
    const LOGIN_PAGE = "./login.html";

    window.addEventListener("DOMContentLoaded", () => {
        const btn = document.getElementById("logoutBtn");
        if (!btn) return;

        btn.addEventListener("click", () => {
            try { localStorage.removeItem(STORAGE_KEY); } catch { }
            try { sessionStorage.removeItem(PASSED_FLAG); } catch { }
            // Mantemos as credenciais salvas (se existirem) para o login preencher
            location.replace(LOGIN_PAGE);
        });
    });
})();
