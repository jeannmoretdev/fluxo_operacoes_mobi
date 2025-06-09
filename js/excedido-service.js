// Arquivo js/excedido-service.js - Serviço para gerenciar operações excedidas

(function() {
    console.log("Inicializando serviço de operações excedidas...");
    
    // Função principal para atualizar a seção de operações excedidas
    function atualizarOperacoesExcedidas() {
        console.log("Atualizando seção de operações excedidas (nova implementação)");
        
        // Verificar se a função de filtro existe
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
    
    // Função para adicionar listeners aos filtros
    function adicionarListenersAosFiltros() {
        // Filtro de usuário
        const filtroUsuario = document.getElementById('usuario-filter');
        if (filtroUsuario) {
            filtroUsuario.addEventListener('change', function() {
                console.log("Filtro de usuário alterado, atualizando operações excedidas");
                atualizarOperacoesExcedidas();
            });
        }
        
        // Filtro de cedente
        const filtroCedente = document.getElementById('cedente-filter');
        if (filtroCedente) {
            filtroCedente.addEventListener('input', function() {
                console.log("Filtro de cedente alterado, atualizando operações excedidas");
                atualizarOperacoesExcedidas();
            });
        }
        
        // Filtro de status
        const filtroStatus = document.getElementById('status-filter');
        if (filtroStatus) {
            filtroStatus.addEventListener('change', function() {
                console.log("Filtro de status alterado, atualizando operações excedidas");
                atualizarOperacoesExcedidas();
            });
        }
        
        // Botões de presets de data
        const botoesPresets = document.querySelectorAll('.date-preset');
        botoesPresets.forEach(botao => {
            botao.addEventListener('click', function() {
                console.log("Preset de data clicado, atualizando operações excedidas");
                setTimeout(atualizarOperacoesExcedidas, 100);
            });
        });
        
        console.log("Listeners adicionados aos filtros para atualizar operações excedidas");
    }
    
    // Inicializar quando o documento estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        console.log("DOM carregado, inicializando serviço de operações excedidas");
        
        // Esperar um pouco para garantir que todos os scripts foram carregados
        setTimeout(function() {
            // Sobrescrever a função original
            window.atualizarOperacoesExcedidas = atualizarOperacoesExcedidas;
            console.log("Função atualizarOperacoesExcedidas sobrescrita com nova implementação");
            
            // Adicionar listeners aos filtros
            adicionarListenersAosFiltros();
            
            // Forçar uma atualização inicial
            atualizarOperacoesExcedidas();
        }, 2000);
    });
})();