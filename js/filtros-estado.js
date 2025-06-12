// Arquivo para gerenciar o estado dos filtros

// Função para salvar o estado dos filtros
function salvarEstadoFiltros() {
    const estado = {
        status: document.getElementById('status-filter')?.value || 'todos',
        cedente: document.getElementById('cedente-filter')?.value || '',
        usuario: document.getElementById('usuario-filter')?.value || 'todos',
        ordenacao: document.getElementById('sort-by')?.value || 'data_desc'
    };
    
    localStorage.setItem('filtros-estado', JSON.stringify(estado));
    console.log('Estado dos filtros salvo:', estado);
}

// Função para restaurar o estado dos filtros
function restaurarEstadoFiltros() {
    try {
        const estadoSalvo = localStorage.getItem('filtros-estado');
        if (!estadoSalvo) {
            console.log('Nenhum estado de filtros salvo encontrado');
            return;
        }
        
        const estado = JSON.parse(estadoSalvo);
        console.log('Restaurando estado dos filtros:', estado);
        
        // Restaurar filtro de status
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter && estado.status) {
            statusFilter.value = estado.status;
        }
        
        // Restaurar filtro de cedente
        const cedenteFilter = document.getElementById('cedente-filter');
        if (cedenteFilter && estado.cedente) {
            cedenteFilter.value = estado.cedente;
        }
        
        // Restaurar filtro de usuário
        const usuarioFilter = document.getElementById('usuario-filter');
        if (usuarioFilter && estado.usuario) {
            usuarioFilter.value = estado.usuario;
        }
        
        // Restaurar ordenação
        const sortBy = document.getElementById('sort-by');
        if (sortBy && estado.ordenacao) {
            sortBy.value = estado.ordenacao;
        }
        
        // Atualizar o estado da aplicação
        if (window.APP_STATE) {
            window.APP_STATE.filtroStatus = estado.status || 'todos';
            window.APP_STATE.filtroCedente = estado.cedente || '';
            window.APP_STATE.usuarioSelecionado = estado.usuario || 'todos';
            window.APP_STATE.ordenacao = estado.ordenacao || 'data_desc';
        }
        
        console.log('Estado dos filtros restaurado com sucesso');
        
    } catch (error) {
        console.error('Erro ao restaurar estado dos filtros:', error);
    }
}

// Função para limpar o estado dos filtros
function limparEstadoFiltros() {
    localStorage.removeItem('filtros-estado');
    console.log('Estado dos filtros limpo');
}

// Função wrapper para compatibilidade
function restaurarEstadoFiltrosSalvo() {
    console.log('Chamando restaurarEstadoFiltros...');
    if (typeof restaurarEstadoFiltros === 'function') {
        restaurarEstadoFiltros();
    } else {
        console.error('Função restaurarEstadoFiltros não encontrada');
    }
}

// Expor funções globalmente
window.salvarEstadoFiltros = salvarEstadoFiltros;
window.restaurarEstadoFiltros = restaurarEstadoFiltros;
window.restaurarEstadoFiltrosSalvo = restaurarEstadoFiltrosSalvo;
window.limparEstadoFiltros = limparEstadoFiltros;

// Auto-salvar quando os filtros mudarem
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que os elementos existam
    setTimeout(() => {
        // Adicionar listeners para auto-salvar
        const statusFilter = document.getElementById('status-filter');
        const cedenteFilter = document.getElementById('cedente-filter');
        const usuarioFilter = document.getElementById('usuario-filter');
        const sortBy = document.getElementById('sort-by');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', salvarEstadoFiltros);
        }
        
        if (cedenteFilter) {
            cedenteFilter.addEventListener('input', salvarEstadoFiltros);
        }
        
        if (usuarioFilter) {
            usuarioFilter.addEventListener('change', salvarEstadoFiltros);
        }
        
        if (sortBy) {
            sortBy.addEventListener('change', salvarEstadoFiltros);
        }
        
        console.log('Auto-save dos filtros configurado');
    }, 2000);
});