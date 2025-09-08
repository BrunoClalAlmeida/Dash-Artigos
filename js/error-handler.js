// /js/error-handler.js
"use strict";

// Evita "spam" de mensagens idênticas em loop
const _seenErrors = new Set();

window.addEventListener("error", (e) => {
    const sig = `${e.message}@${e.filename}:${e.lineno}:${e.colno}`;
    if (_seenErrors.has(sig)) return;
    _seenErrors.add(sig);
    setTimeout(() => _seenErrors.delete(sig), 2000);

    console.error("[global error]", e.error || e.message);
    if (window.Swal) {
        Swal.fire({
            toast: true,
            position: "bottom-end",
            timer: 3500,
            showConfirmButton: false,
            icon: "error",
            title: "Erro de script",
            text: (e.error && e.error.message) || e.message || "Ver console",
            background: "#0f172a",
            color: "#e2e8f0",
        });
    }
});

window.addEventListener("unhandledrejection", (e) => {
    console.error("[unhandledrejection]", e.reason);
    if (window.Swal) {
        Swal.fire({
            toast: true,
            position: "bottom-end",
            timer: 3500,
            showConfirmButton: false,
            icon: "error",
            title: "Falha em promessa",
            text: (e.reason && e.reason.message) || String(e.reason),
            background: "#0f172a",
            color: "#e2e8f0",
        });
    }
});
