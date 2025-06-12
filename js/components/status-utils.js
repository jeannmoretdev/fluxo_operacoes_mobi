// Função para obter classe CSS baseada no status
function getStatusClass(status) {
    if (!status) return "";
    if (status.includes("PAGO")) return "status-pago";
    if (status.includes("PENDÊNCIA")) return "status-pendencia";
    if (status.includes("DIGITANDO")) return "status-digitando";
    if (status.includes("AGUARD. ANÁLISE")) return "status-aguardando";
    if (status.includes("OPER. ANALISANDO")) return "status-analisando";
    if (status.includes("Q CERT. ASSINAT.")) return "status-assinatura";
    if (status.includes("CHECAGEM")) return "status-checagem";
    if (status.includes("POSTERGADO")) return "status-postergado";
    if (status.includes("CEDENTE DESISTIU")) return "status-desistiu";
    if (status.includes("RECUSADO")) return "status-recusado";
    return "";
}

// Expor função globalmente
window.getStatusClass = getStatusClass;

console.log('✅ Status Utils carregado');