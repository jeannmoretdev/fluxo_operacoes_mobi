// Arquivo js/excedido-fix.js - Correção para exibição de operações excedidas

(function() {
    console.log("Inicializando correção para exibição de operações excedidas...");
    
    // Função para atualizar a seção de operações excedidas
    function atualizarOperacoesExcedidasCorrigido() {
        console.log("Atualizando seção de operações excedidas (versão corrigida)");
        
        // Obter as propostas filtradas
        const propostasFiltradas = typeof window.filtrarPropostas === 'function' 
            ? window.filtrarPropostas() 
            : (window.APP_STATE ? window.APP_STATE.propostas : []);
        
        console.log(`Obtidas ${propostasFiltradas.length} propostas filtradas`);
        
        // Filtrar apenas propostas PAGAS com tempo excedido
        const propostasExcedidas = propostasFiltradas.filter(p => 
            p.statusSimplificado === "PAGO" && 
            p.tempoTotalExcedido
        );
        
        console.log(`Encontradas ${propostasExcedidas.length} operações PAGAS com tempo excedido`);
        
        // Ordenar por tempo total (maior para menor)
        propostasExcedidas.sort((a, b) => b.tempoTotal - a.tempoTotal);
        
        // Obter o container e a lista
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
            // Se não houver, adicionar uma mensagem
            const mensagem = document.createElement('div');
            mensagem.className = 'no-excedido';
            mensagem.textContent = 'Nenhuma operação PAGA com tempo excedido encontrada.';
            lista.appendChild(mensagem);
            console.log("Nenhuma operação excedida encontrada, adicionada mensagem");
        } else {
            // Se houver, adicionar cada operação excedida à lista
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
                                        .map(obs => `<li>${obs.USUARIO}: ${obs.OBSERVACAO}</li>`)
                                        .join('')}
                                </ul>
                            </div>` : ''}
                    </div>
                `;
                
                // Adicionar o item à lista
                lista.appendChild(item);
            });
            
            console.log(`Renderizadas ${propostasExcedidas.length} operações excedidas`);
        }
        
        // Garantir que o container esteja visível
        container.style.display = 'block';
    }
    
    // Função para sincronizar com os filtros
    function sincronizarComFiltros() {
        // Filtro de usuário
        const filtroUsuario = document.getElementById('usuario-filter');
        if (filtroUsuario) {
            filtroUsuario.addEventListener('change', atualizarOperacoesExcedidasCorrigido);
        }
        
        // Filtro de cedente
        const filtroCedente = document.getElementById('cedente-filter');
        if (filtroCedente) {
            filtroCedente.addEventListener('input', atualizarOperacoesExcedidasCorrigido);
        }
        
        // Filtro de status
        const filtroStatus = document.getElementById('status-filter');
        if (filtroStatus) {
            filtroStatus.addEventListener('change', atualizarOperacoesExcedidasCorrigido);
        }
        
        // Botões de presets de data
        const botoesPresets = document.querySelectorAll('.date-preset');
        botoesPresets.forEach(botao => {
            botao.addEventListener('click', function() {
                setTimeout(atualizarOperacoesExcedidasCorrigido, 100);
            });
        });
        
        console.log("Sincronização com filtros configurada");
    }
    
    // Função para formatar data e hora
    function formatarDataHora(dataHora) {
        if (!dataHora) return '--:--';
        
        try {
            const data = new Date(dataHora);
            if (isNaN(data.getTime())) return '--:--';
            
            const horas = data.getHours().toString().padStart(2, '0');
            const minutos = data.getMinutes().toString().padStart(2, '0');
            
            return `${horas}:${minutos}`;
        } catch (error) {
            console.error("Erro ao formatar data e hora:", error);
            return '--:--';
        }
    }
    
    // Função para formatar tempo em minutos para formato legível
    function formatarTempo(minutos) {
        if (minutos === null || minutos === undefined) return '--:--';
        
        try {
            const horas = Math.floor(minutos / 60);
            const mins = minutos % 60;
            return `${horas}:${mins.toString().padStart(2, '0')}`;
        } catch (error) {
            console.error("Erro ao formatar tempo:", error);
            return '--:--';
        }
    }
    
    // Inicializar quando o documento estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        console.log("DOM carregado, inicializando correção para exibição de operações excedidas");
        
        // Esperar um pouco para garantir que todos os scripts foram carregados
        setTimeout(function() {
            // Sobrescrever a função original
            if (typeof window.atualizarOperacoesExcedidas === 'function') {
                console.log("Sobrescrevendo função atualizarOperacoesExcedidas existente");
                window.atualizarOperacoesExcedidas = atualizarOperacoesExcedidasCorrigido;
            } else {
                console.log("Definindo função atualizarOperacoesExcedidas");
                window.atualizarOperacoesExcedidas = atualizarOperacoesExcedidasCorrigido;
            }
            
            // Sincronizar com os filtros
            sincronizarComFiltros();
            
            // Forçar uma atualização inicial
            atualizarOperacoesExcedidasCorrigido();
            
            // Adicionar ao evento de atualização de dados
            const atualizarDadosOriginal = window.atualizarDados;
            if (typeof atualizarDadosOriginal === 'function') {
                window.atualizarDados = async function() {
                    await atualizarDadosOriginal.apply(this, arguments);
                    atualizarOperacoesExcedidasCorrigido();
                };
                console.log("Função atualizarDados modificada para incluir atualização de operações excedidas");
            }
            
            console.log("Correção para exibição de operações excedidas inicializada");
        }, 2000);
    });
})();