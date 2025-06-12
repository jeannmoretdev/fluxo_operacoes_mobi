// Função para carregar scripts dinamicamente
function carregarScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            console.log(`✅ ${src.split('/').pop()} carregado`);
            resolve();
        };
        script.onerror = () => {
            console.warn(`⚠️ Erro ao carregar ${src}, continuando...`);
            resolve(); // Resolver mesmo com erro para não travar o carregamento
        };
        document.head.appendChild(script);
    });
}

// Lista de arquivos para carregar - CAMINHOS CORRETOS
const arquivos = [
    './js/components/status-utils.js',
    './js/components/filters-sorting.js',
    './js/components/statistics.js', 
    './js/components/table-renderer.js',
    './js/components/tv-mode.js',
    './js/components/tooltips-modals.js'
];

// Carregar todos os arquivos
async function inicializarComponentes() {
    console.log('🚀 Carregando componentes de UI...');
    
    try {
        // Carregar todos os scripts em paralelo
        await Promise.all(arquivos.map(carregarScript));
        
        console.log('✅ Todos os componentes carregados!');
        
        // Aguardar um pouco para garantir que tudo foi inicializado
        setTimeout(() => {
            // Inicializar o modo TV
            if (typeof configurarModoTV === 'function') {
                configurarModoTV();
            }
            
            // Configurar filtros e ordenação
            if (typeof window.configurarEventListenersFiltros === 'function') {
                window.configurarEventListenersFiltros();
            }
            
            if (typeof window.configurarOrdenacaoPorCabecalho === 'function') {
                window.configurarOrdenacaoPorCabecalho();
            }
            
            // Marcar como carregado
            window.uiComponentesCarregados = true;
            
            console.log('🎉 Componentes de UI inicializados com sucesso!');
        }, 500);
        
    } catch (error) {
        console.error('❌ Erro ao carregar componentes:', error);
        
        // Fallback: usar componentes inline se existirem
        console.log('🔄 Tentando usar componentes inline...');
        usarComponentesInline();
    }
}

// Função de fallback para usar componentes que já estão no arquivo principal
function usarComponentesInline() {
    console.log('📦 Usando componentes inline como fallback...');
    
    // Verificar se as funções principais já existem no escopo global
    const funcoesEssenciais = [
        'getStatusClass',
        'filtrarPropostas', 
        'ordenarPropostas',
        'atualizarEstatisticas',
        'renderizarTabela',
        'mostrarObservacoes',
        'mostrarHistoricoStatus'
    ];
    
    let componentesDisponiveis = 0;
    
    funcoesEssenciais.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            componentesDisponiveis++;
            console.log(`✅ ${funcName} disponível`);
        } else {
            console.warn(`⚠️ ${funcName} não disponível`);
        }
    });
    
    if (componentesDisponiveis >= 4) {
        console.log(`✅ ${componentesDisponiveis}/${funcoesEssenciais.length} componentes essenciais disponíveis`);
        window.uiComponentesCarregados = true;
        
        // Configurar modo TV se disponível
        if (typeof configurarModoTV === 'function') {
            configurarModoTV();
        }
        
        // Tentar configurar filtros
        setTimeout(() => {
            if (typeof window.corrigirFiltros === 'function') {
                window.corrigirFiltros();
            }
        }, 1000);
        
    } else {
        console.error(`❌ Apenas ${componentesDisponiveis}/${funcoesEssenciais.length} componentes disponíveis`);
    }
}

// Função para criar fallbacks básicos das funções essenciais
function criarFallbacksBasicos() {
    console.log('🔧 Criando fallbacks básicos...');
    
    // Fallback para getStatusClass
    if (typeof window.getStatusClass !== 'function') {
        window.getStatusClass = function(status) {
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
        };
        console.log('✅ getStatusClass fallback criado');
    }
    
    // Fallback para filtrarPropostas
    if (typeof window.filtrarPropostas !== 'function') {
        window.filtrarPropostas = function() {
            if (!window.APP_STATE || !window.APP_STATE.propostas) {
                return [];
            }
            
            return window.APP_STATE.propostas.filter(p => {
                // Filtro de status
                if (window.APP_STATE.filtroStatus !== 'todos' && p.statusAtual !== window.APP_STATE.filtroStatus) {
                    return false;
                }
                
                // Filtro de cedente
                if (window.APP_STATE.filtroCedente && !p.cedente.toLowerCase().includes(window.APP_STATE.filtroCedente.toLowerCase())) {
                    return false;
                }
                
                return true;
            });
        };
        console.log('✅ filtrarPropostas fallback criado');
    }
    
    // Fallback para ordenarPropostas
    if (typeof window.ordenarPropostas !== 'function') {
        window.ordenarPropostas = function(propostas) {
            if (!Array.isArray(propostas)) return [];
            
            const ordenacao = window.APP_STATE ? window.APP_STATE.ordenacao : 'data_desc';
            
            return [...propostas].sort((a, b) => {
                switch (ordenacao) {
                    case 'numero_desc':
                        return b.numero - a.numero;
                    case 'numero_asc':
                        return a.numero - b.numero;
                    case 'data_desc':
                        return new Date(b.data || 0) - new Date(a.data || 0);
                    case 'data_asc':
                        return new Date(a.data || 0) - new Date(b.data || 0);
                    case 'tempo_total_desc':
                        return (b.tempoTotal || 0) - (a.tempoTotal || 0);
                    case 'tempo_total_asc':
                        return (a.tempoTotal || 0) - (b.tempoTotal || 0);
                    case 'cedente_asc':
                        return (a.cedente || '').localeCompare(b.cedente || '');
                    case 'cedente_desc':
                        return (b.cedente || '').localeCompare(a.cedente || '');
                    default:
                        return 0;
                }
            });
        };
        console.log('✅ ordenarPropostas fallback criado');
    }
    
    // Fallback para renderizarTabela
    if (typeof window.renderizarTabela !== 'function') {
        window.renderizarTabela = function(propostasFiltradas) {
            const tbody = document.getElementById('propostas-body');
            if (!tbody) {
                console.error('Elemento tbody não encontrado');
                return;
            }
            
            tbody.innerHTML = '';
            
            if (!Array.isArray(propostasFiltradas) || propostasFiltradas.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="11" class="no-data">Nenhuma proposta encontrada</td>`;
                tbody.appendChild(tr);
                return;
            }
            
            propostasFiltradas.forEach(p => {
                const tr = document.createElement('tr');
                const statusClass = window.getStatusClass(p.statusAtual);
                
                if (statusClass) {
                    tr.className = statusClass;
                }
                
                tr.setAttribute('data-id', p.id);
                
                // Funções auxiliares com fallback
                const formatarTempo = window.formatarTempo || ((min) => {
                    if (!min || min === 0) return '--';
                    const horas = Math.floor(min / 60);
                    const mins = min % 60;
                    return horas > 0 ? `${horas}h${mins}m` : `${mins}m`;
                });
                
                const formatarHora = window.formatarHora || ((data) => {
                    if (!data) return '--';
                    try {
                        return new Date(data).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    } catch (error) {
                        return '--';
                    }
                });
                
                tr.innerHTML = `
                    <td class="text-center tv-hide-column">${p.dataFormatada || '--'}</td>
                    <td class="text-center">${formatarTempo(p.tempoTotal)}</td>
                    <td class="text-center">${formatarHora(p.horaEntrada)}</td>
                    <td class="text-center">${p.numero || '--'}</td>
                    <td class="cedente-cell" data-proposta-id="${p.id}">${p.cedente || '--'}</td>
                    <td class="text-center">${formatarHora(p.horaAnalise)}</td>
                    <td class="text-center">${formatarHora(p.horaPendencia)}</td>
                    <td class="text-center">--</td>
                    <td class="text-center">${formatarHora(p.horaCertifica)}</td>
                    <td class="text-center">${formatarHora(p.horaPagamento)}</td>
                    <td class="text-center status-cell" data-proposta-id="${p.id}">${p.statusSimplificado || '--'}</td>
                `;
                
                tbody.appendChild(tr);
            });
            
            console.log(`📊 Tabela renderizada com ${propostasFiltradas.length} propostas (fallback)`);
        };
        console.log('✅ renderizarTabela fallback criado');
    }
    
    // Fallback para atualizarEstatisticas
    if (typeof window.atualizarEstatisticas !== 'function') {
        window.atualizarEstatisticas = function(propostasFiltradas) {
            if (!Array.isArray(propostasFiltradas)) return;
            
            const totalElement = document.getElementById('total-propostas');
            const pagasElement = document.getElementById('total-pagas');
            const processamentoElement = document.getElementById('total-processamento');
            
            if (totalElement) totalElement.textContent = propostasFiltradas.length;
            
            const propostasPagas = propostasFiltradas.filter(p => p.statusSimplificado === "PAGO");
            if (pagasElement) pagasElement.textContent = propostasPagas.length;
            
            const propostasEmProcessamento = propostasFiltradas.filter(p => {
                return p.statusSimplificado !== "PAGO" && 
                       p.statusSimplificado !== "CEDENTE DESISTIU" && 
                       p.statusSimplificado !== "RECUSADO" &&
                       p.statusSimplificado !== "POSTERGADO";
            });
            
            if (processamentoElement) processamentoElement.textContent = propostasEmProcessamento.length;
            
            console.log(`📊 Estatísticas atualizadas (fallback): ${propostasFiltradas.length} total, ${propostasPagas.length} pagas`);
        };
        console.log('✅ atualizarEstatisticas fallback criado');
    }
    
    // Fallback para mostrarObservacoes
    if (typeof window.mostrarObservacoes !== 'function') {
        window.mostrarObservacoes = function(proposta) {
            if (!proposta) return;
            
            const observacoes = proposta.observacoes || [];
            const texto = observacoes.length > 0 ? 
                observacoes.map(obs => `${obs.USUARIO}: ${obs.OBSERVACAO}`).join('\n') :
                'Nenhuma observação encontrada';
            
            alert(`Observações - ${proposta.cedente} (${proposta.numero}):\n\n${texto}`);
        };
        console.log('✅ mostrarObservacoes fallback criado');
    }
    
    // Fallback para mostrarHistoricoStatus
    if (typeof window.mostrarHistoricoStatus !== 'function') {
        window.mostrarHistoricoStatus = function(proposta) {
            if (!proposta) return;
            
            const fluxo = proposta.fluxoCompleto || [];
            const texto = fluxo.length > 0 ?
                fluxo.map(f => `${f.STATUS_FLUXO} - ${new Date(f.DATA_HORA_ENTRADA).toLocaleString('pt-BR')}`).join('\n') :
                'Nenhum histórico encontrado';
            
            alert(`Histórico - ${proposta.cedente} (${proposta.numero}):\n\n${texto}`);
        };
        console.log('✅ mostrarHistoricoStatus fallback criado');
    }
    
    // Marcar como carregado
    window.uiComponentesCarregados = true;
    console.log('✅ Fallbacks básicos criados e sistema funcional');
}

// Auto-executar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarComponentes);
} else {
    inicializarComponentes();
}

// Expor função globalmente
window.inicializarComponentesUI = inicializarComponentes;

console.log('🔧 UI Components carregado');