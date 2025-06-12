// Adicionar funções para gerenciar estado dos filtros:

// Salvar estado atual dos filtros
function salvarEstadoFiltros() {
    const estado = {
        status: document.getElementById('status-filter')?.value || 'todos',
        cedente: document.getElementById('cedente-filter')?.value || '',
        usuario: document.getElementById('usuario-filter')?.value || 'todos',
        ordenacao: document.getElementById('sort-by')?.value || APP_STATE.ordenacao,
        timestamp: Date.now()
    };
    
    // Salvar no localStorage também para persistir entre recarregamentos
    localStorage.setItem('filtros-estado', JSON.stringify(estado));
    
    return estado;
}

// Restaurar estado dos filtros
function restaurarEstadoFiltrosSalvo() {
    try {
        const estadoSalvo = localStorage.getItem('filtros-estado');
        if (estadoSalvo) {
            const estado = JSON.parse(estadoSalvo);
            
            // Verificar se não é muito antigo (máximo 1 hora)
            if (Date.now() - estado.timestamp < 3600000) {
                restaurarEstadoFiltros(estado);
                return true;
            }
        }
    } catch (error) {
        console.error('Erro ao restaurar estado dos filtros:', error);
    }
    
    return false;
}

// Chamar na inicialização
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        restaurarEstadoFiltrosSalvo();
    }, 1000);
});