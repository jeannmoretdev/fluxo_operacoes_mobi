// Arquivo js/excedido-filter.js - Aplica filtros à seção de operações excedidas

(function() {
    console.log("Inicializando filtros para operações excedidas...");
    
    // Função para garantir que a seção de operações excedidas seja atualizada quando os filtros mudarem
    function configurarListenersParaFiltros() {
        // Filtro de usuário
        const filtroUsuario = document.getElementById('usuario-filter');
        if (filtroUsuario) {
            filtroUsuario.addEventListener('change', function() {
                console.log("Filtro de usuário alterado, atualizando operações excedidas");
                atualizarOperacoesExcedidasComFiltros();
            });
        }
        
        // Filtro de cedente
        const filtroCedente = document.getElementById('cedente-filter');
        if (filtroCedente) {
            filtroCedente.addEventListener('input', function() {
                console.log("Filtro de cedente alterado, atualizando operações excedidas");
                atualizarOperacoesExcedidasComFiltros();
            });
        }
        
        // Filtro de status
        const filtroStatus = document.getElementById('status-filter');
        if (filtroStatus) {
            filtroStatus.addEventListener('change', function() {
                console.log("Filtro de status alterado, atualizando operações excedidas");
                atualizarOperacoesExcedidasComFiltros();
            });
        }
        
        // Botões de presets de data
        const botoesPresets = document.querySelectorAll('.date-preset');
        botoesPresets.forEach(botao => {
            botao.addEventListener('click', function() {
                console.log("Preset de data clicado, atualizando operações excedidas");
                setTimeout(atualizarOperacoesExcedidasComFiltros, 100);
            });
        });
        
        console.log("Listeners adicionados aos filtros para atualizar operações excedidas");
    }
    
    // Função para atualizar operações excedidas usando os filtros atuais
    function atualizarOperacoesExcedidasComFiltros() {
        console.log("Atualizando operações excedidas com filtros aplicados");
        
        // Verificar se a função filtrarPropostas existe
        if (typeof window.filtrarPropostas !== 'function') {
            console.error("Função filtrarPropostas não encontrada");
            return;
        }
        
        // Obter as propostas filtradas
        const propostasFiltradas = window.filtrarPropostas();
        console.log(`Obtidas ${propostasFiltradas.length} propostas filtradas`);
        
        // Filtrar apenas propostas PAGAS com tempo excedido
        const propostasExcedidas = propostasFiltradas.filter(p => 
            p.statusSimplificado === "PAGO" && 
            p.tempoTotalExcedido
        );
        
        console.log(`Encontradas ${propostasExcedidas.length} operações PAGAS com tempo excedido`);
        
        // Ordenar por tempo total (maior para menor)
        propostasExcedidas.sort((a, b) => b.tempoTotal - a.tempoTotal);
        
        // Obter o container
        const container = document.getElementById('excedido-container');
        const lista = document.getElementById('excedido-list');
        
        if (!container || !lista) {
            console.error("Container ou lista de operações excedidas não encontrado");
            return;
        }
        
        // Limpar a lista
        lista.innerHTML = '';
        
        // Verificar se há operações excedidas
        if (propostasExcedidas.length === 0) {
            // Se não houver, ocultar o container
            container.style.display = 'none';
            console.log("Nenhuma operação excedida encontrada, ocultando container");
            return;
        }
        
        // Se houver, mostrar o container
        container.style.display = 'block';
        console.log(`Mostrando container com ${propostasExcedidas.length} operações excedidas`);
        
        // Adicionar cada operação excedida à lista
        propostasExcedidas.forEach(proposta => {
            // Criar o item da lista
            const item = document.createElement('div');
            item.className = 'observation-item';
            
            // Formatar o tempo total
            const tempoFormatado = formatarTempo(proposta.tempoTotal);
            
            // Criar o conteúdo do item
            item.innerHTML = `
                <div class="observation-header">
                    <span class="observation-number">Proposta #${proposta.numero}</span>
                    <span class="observation-cedente">${proposta.cedente}</span>
                    <span class="observation-time">Tempo Total: <strong>${tempoFormatado}</strong></span>
                </div>
                <div class="observation-details">
                    <div class="observation-timestamps">
                        <span>Entrada: ${formatarDataHora(proposta.horaEntrada)}</span>
                        <span>Pagamento: ${formatarDataHora(proposta.horaPagamento)}</span>
                    </div>
                    ${proposta.observacoes && proposta.observacoes.length > 0 ? 
                        `<div class="observation-notes">
                            <h4>Observações:</h4>
                            <ul>
                                ${proposta.observacoes
                                    .filter(obs => obs.USUARIO === 'GER' && obs.OBSERVACAO && obs.OBSERVACAO.includes('Tempo excedido'))
                                    .map(obs => `<li>${obs.OBSERVACAO}</li>`)
                                    .join('')}
                            </ul>
                        </div>` : ''}
                </div>
            `;
            
            // Adicionar o item à lista
            lista.appendChild(item);
        });
    }
    
    // Função para verificar se o container de operações excedidas existe e está visível
    function verificarContainerExcedido() {
        const container = document.getElementById('excedido-container');
        if (!container) {
            console.error("Container de operações excedidas não encontrado");
            return false;
        }
        
        const estiloComputado = window.getComputedStyle(container);
        const estaVisivel = estiloComputado.display !== 'none';
        
        console.log(`Container de operações excedidas ${estaVisivel ? 'está visível' : 'está oculto'}`);
        
        return estaVisivel;
    }
    
    // Inicializar quando o documento estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        console.log("DOM carregado, inicializando filtros para operações excedidas");
        
        // Configurar listeners para filtros
        configurarListenersParaFiltros();
        
        // Verificar o container após um tempo
        setTimeout(function() {
            verificarContainerExcedido();
            
            // Forçar uma atualização inicial
            atualizarOperacoesExcedidasComFiltros();
            
            // Sobrescrever a função original para garantir que nossos filtros sejam aplicados
            if (typeof window.atualizarOperacoesExcedidas === 'function') {
                const funcaoOriginal = window.atualizarOperacoesExcedidas;
                
                window.atualizarOperacoesExcedidas = function() {
                    console.log("Função atualizarOperacoesExcedidas chamada, redirecionando para nossa implementação");
                    atualizarOperacoesExcedidasComFiltros();
                };
                
                console.log("Função atualizarOperacoesExcedidas sobrescrita com sucesso");
            } else {
                console.log("Função atualizarOperacoesExcedidas não encontrada, definindo nossa implementação");
                window.atualizarOperacoesExcedidas = atualizarOperacoesExcedidasComFiltros;
            }
        }, 2000);
    });
})();