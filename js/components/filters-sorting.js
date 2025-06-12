// Função para filtrar propostas - VERSÃO UNIFICADA
function filtrarPropostas() {
    console.log('🔍 Executando filtrarPropostas (components/filters-sorting.js)');
    
    // Verificar se APP_STATE existe
    if (!window.APP_STATE || !Array.isArray(window.APP_STATE.propostas)) {
        console.warn('APP_STATE ou propostas não disponíveis');
        return [];
    }
    
    // Obter valores dos filtros
    const statusFiltro = document.getElementById('status-filter')?.value || 'todos';
    const cedenteFiltro = document.getElementById('cedente-filter')?.value?.toLowerCase() || '';
    const usuarioFiltro = document.getElementById('usuario-filter')?.value || 'todos';
    
    console.log(`Filtros aplicados - Status: ${statusFiltro}, Cedente: "${cedenteFiltro}", Usuário: ${usuarioFiltro}`);
    
    // Filtrar propostas
    const resultado = window.APP_STATE.propostas.filter(proposta => {
        // Filtro de status
        let passaFiltroStatus = true;
        if (statusFiltro !== 'todos') {
            passaFiltroStatus = proposta.statusAtual === statusFiltro || proposta.statusSimplificado === statusFiltro;
        }
        
        // Filtro de cedente
        let passaFiltroCedente = true;
        if (cedenteFiltro !== '') {
            passaFiltroCedente = proposta.cedente.toLowerCase().includes(cedenteFiltro);
        }
        
        // Filtro de usuário
        let passaFiltroUsuario = true;
        if (usuarioFiltro !== 'todos' && window.CedenteService && typeof window.CedenteService.cedenteAssociadoAoUsuario === 'function') {
            passaFiltroUsuario = window.CedenteService.cedenteAssociadoAoUsuario(proposta.cedente, usuarioFiltro);
        }
        
        return passaFiltroStatus && passaFiltroCedente && passaFiltroUsuario;
    });
    
    console.log(`Filtro concluído: ${resultado.length} de ${window.APP_STATE.propostas.length} propostas`);
    return resultado;
}

// Função para ordenar propostas - VERSÃO UNIFICADA
function ordenarPropostas(propostas) {
    console.log('📊 Executando ordenarPropostas (components/filters-sorting.js)');
    
    if (!Array.isArray(propostas)) {
        console.error("ordenarPropostas: propostas não é um array");
        return [];
    }
    
    // Obter critério de ordenação
    const ordenacao = window.APP_STATE?.ordenacao || 'data_desc';
    console.log(`Ordenando por: ${ordenacao}`);
    
    // Criar cópia para não modificar o original
    const propostasOrdenadas = [...propostas];
    
    // Funções auxiliares para comparação
    const compareDates = (a, b) => {
        if (!a && !b) return 0;
        if (!a) return 1;
        if (!b) return -1;
        return new Date(a) - new Date(b);
    };
    
    const compareNumbers = (a, b) => {
        if (a === null && b === null) return 0;
        if (a === null) return 1;
        if (b === null) return -1;
        return a - b;
    };
    
    // Aplicar ordenação
    switch (ordenacao) {
        case 'data_desc':
            propostasOrdenadas.sort((a, b) => compareDates(b.data, a.data));
            break;
        case 'data_asc':
            propostasOrdenadas.sort((a, b) => compareDates(a.data, b.data));
            break;
        case 'tempo_total_desc':
            propostasOrdenadas.sort((a, b) => compareNumbers(b.tempoTotal, a.tempoTotal));
            break;
        case 'tempo_total_asc':
            propostasOrdenadas.sort((a, b) => compareNumbers(a.tempoTotal, b.tempoTotal));
            break;
        case 'hora_entrada_desc':
            propostasOrdenadas.sort((a, b) => compareDates(b.horaEntrada, a.horaEntrada));
            break;
        case 'hora_entrada_asc':
            propostasOrdenadas.sort((a, b) => compareDates(a.horaEntrada, b.horaEntrada));
            break;
        case 'numero_desc':
            propostasOrdenadas.sort((a, b) => parseInt(b.numero) - parseInt(a.numero));
            break;
        case 'numero_asc':
            propostasOrdenadas.sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
            break;
        case 'cedente_asc':
            propostasOrdenadas.sort((a, b) => a.cedente.localeCompare(b.cedente));
            break;
        case 'cedente_desc':
            propostasOrdenadas.sort((a, b) => b.cedente.localeCompare(a.cedente));
            break;
        case 'analise_desc':
            propostasOrdenadas.sort((a, b) => compareDates(b.horaAnalise, a.horaAnalise));
            break;
        case 'analise_asc':
            propostasOrdenadas.sort((a, b) => compareDates(a.horaAnalise, b.horaAnalise));
            break;
        case 'checagem_desc':
            propostasOrdenadas.sort((a, b) => compareDates(b.horaChecagem, a.horaChecagem));
            break;
        case 'checagem_asc':
            propostasOrdenadas.sort((a, b) => compareDates(a.horaChecagem, b.horaChecagem));
            break;
        case 'certificacao_desc':
            propostasOrdenadas.sort((a, b) => compareDates(b.horaCertifica, a.horaCertifica));
            break;
        case 'certificacao_asc':
            propostasOrdenadas.sort((a, b) => compareDates(a.horaCertifica, b.horaCertifica));
            break;
        case 'pagamento_desc':
            propostasOrdenadas.sort((a, b) => compareDates(b.horaPagamento, a.horaPagamento));
            break;
        case 'pagamento_asc':
            propostasOrdenadas.sort((a, b) => compareDates(a.horaPagamento, b.horaPagamento));
            break;
        case 'pendencia_desc':
            propostasOrdenadas.sort((a, b) => compareDates(b.horaPendencia, a.horaPendencia));
            break;
        case 'pendencia_asc':
            propostasOrdenadas.sort((a, b) => compareDates(a.horaPendencia, b.horaPendencia));
            break;
        case 'status_asc':
            propostasOrdenadas.sort((a, b) => (a.pesoStatus || 0) - (b.pesoStatus || 0));
            break;
        case 'status_desc':
            propostasOrdenadas.sort((a, b) => (b.pesoStatus || 0) - (a.pesoStatus || 0));
            break;
        default:
            console.warn(`Critério de ordenação desconhecido: ${ordenacao}`);
            propostasOrdenadas.sort((a, b) => compareDates(b.data, a.data));
    }
    
    console.log(`Ordenação concluída: ${propostasOrdenadas.length} propostas ordenadas por ${ordenacao}`);
    return propostasOrdenadas;
}

// Função para aplicar filtros e ordenação
function aplicarFiltrosEOrdenacao() {
    console.log('🔄 Aplicando filtros e ordenação...');
    
    try {
        // Filtrar propostas
        const propostasFiltradas = filtrarPropostas();
        
        // Ordenar propostas filtradas
        const propostasOrdenadas = ordenarPropostas(propostasFiltradas);
        
        // Renderizar tabela
        if (typeof window.renderizarTabela === 'function') {
            window.renderizarTabela(propostasOrdenadas);
        } else {
            console.error('Função renderizarTabela não encontrada');
        }
        
        // Atualizar estatísticas
        if (typeof window.atualizarEstatisticas === 'function') {
            window.atualizarEstatisticas(propostasFiltradas);
        }
        
        // Atualizar operações excedidas
        if (typeof window.atualizarOperacoesExcedidas === 'function') {
            window.atualizarOperacoesExcedidas(propostasFiltradas);
        }
        
        console.log('✅ Filtros e ordenação aplicados com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao aplicar filtros e ordenação:', error);
    }
}

// Função para configurar event listeners dos filtros
function configurarEventListenersFiltros() {
    console.log('🎛️ Configurando event listeners dos filtros...');
    
    // Filtro de status
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            if (window.APP_STATE) {
                window.APP_STATE.filtroStatus = this.value;
            }
            console.log(`Status filtro alterado para: ${this.value}`);
            aplicarFiltrosEOrdenacao();
        });
    }
    
    // Filtro de cedente
    const cedenteFilter = document.getElementById('cedente-filter');
    if (cedenteFilter) {
        cedenteFilter.addEventListener('input', function() {
            if (window.APP_STATE) {
                window.APP_STATE.filtroCedente = this.value;
            }
            console.log(`Cedente filtro alterado para: "${this.value}"`);
            aplicarFiltrosEOrdenacao();
        });
    }
    
    // Filtro de usuário
    const usuarioFilter = document.getElementById('usuario-filter');
    if (usuarioFilter) {
        usuarioFilter.addEventListener('change', function() {
            if (window.APP_STATE) {
                window.APP_STATE.usuarioSelecionado = this.value;
            }
            console.log(`Usuário filtro alterado para: ${this.value}`);
            aplicarFiltrosEOrdenacao();
        });
    }
    
    console.log('✅ Event listeners dos filtros configurados');
}

// Função para configurar ordenação por clique nos cabeçalhos
function configurarOrdenacaoPorCabecalho() {
    console.log('📋 Configurando ordenação por cabeçalho...');
    
    // Remover event listeners existentes
    document.querySelectorAll('.sortable').forEach(header => {
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
    });
    
    // Adicionar novos event listeners
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', function() {
            const sortType = this.getAttribute('data-sort');
            console.log(`Clicou no cabeçalho: ${sortType}`);
            
            if (!sortType) {
                console.warn('Tipo de ordenação não definido para este cabeçalho');
                return;
            }
            
            // Determinar direção da ordenação
            let novaOrdenacao = sortType + '_desc';
            
            if (window.APP_STATE && window.APP_STATE.ordenacao === sortType + '_desc') {
                novaOrdenacao = sortType + '_asc';
            }
            
            // Atualizar estado
            if (window.APP_STATE) {
                window.APP_STATE.ordenacao = novaOrdenacao;
            }
            
            console.log(`Ordenação alterada para: ${novaOrdenacao}`);
            
            // Atualizar indicadores visuais
            document.querySelectorAll('.sortable').forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
            });
            
            if (novaOrdenacao.endsWith('_asc')) {
                this.classList.add('sort-asc');
            } else {
                this.classList.add('sort-desc');
            }
            
            // Aplicar ordenação
            aplicarFiltrosEOrdenacao();
        });
        
        // Adicionar cursor pointer
        header.style.cursor = 'pointer';
    });
    
    console.log('✅ Ordenação por cabeçalho configurada');
}

// Expor funções globalmente
window.filtrarPropostas = filtrarPropostas;
window.ordenarPropostas = ordenarPropostas;
window.aplicarFiltrosEOrdenacao = aplicarFiltrosEOrdenacao;
window.configurarEventListenersFiltros = configurarEventListenersFiltros;
window.configurarOrdenacaoPorCabecalho = configurarOrdenacaoPorCabecalho;

// Configurar automaticamente quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            configurarEventListenersFiltros();
            configurarOrdenacaoPorCabecalho();
        }, 1000);
    });
} else {
    setTimeout(() => {
        configurarEventListenersFiltros();
        configurarOrdenacaoPorCabecalho();
    }, 1000);
}

console.log('✅ Filters and Sorting carregado');