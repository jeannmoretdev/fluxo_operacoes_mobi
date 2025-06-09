// Arquivo js/excedido-diagnostico.js - Diagnóstico para operações excedidas

(function() {
    console.log("Inicializando diagnóstico para operações excedidas...");
    
    // Função para verificar se há propostas com tempo excedido
    function verificarPropostasExcedidas() {
        // Verificar se temos acesso ao estado da aplicação
        if (!window.APP_STATE || !Array.isArray(APP_STATE.propostas)) {
            console.error("APP_STATE não disponível ou não contém propostas");
            return {
                totalPropostas: 0,
                propostasPagas: 0,
                propostasExcedidas: 0,
                detalhes: []
            };
        }
        
        // Contar propostas
        const totalPropostas = APP_STATE.propostas.length;
        
        // Contar propostas pagas
        const propostasPagas = APP_STATE.propostas.filter(p => 
            p.statusSimplificado === "PAGO"
        ).length;
        
        // Contar propostas excedidas
        const propostasExcedidas = APP_STATE.propostas.filter(p => 
            p.statusSimplificado === "PAGO" && 
            p.tempoTotalExcedido
        );
        
        // Obter detalhes das propostas excedidas
        const detalhes = propostasExcedidas.map(p => ({
            numero: p.numero,
            cedente: p.cedente,
            tempoTotal: p.tempoTotal,
            tempoFormatado: formatarTempo(p.tempoTotal)
        }));
        
        return {
            totalPropostas,
            propostasPagas,
            propostasExcedidas: propostasExcedidas.length,
            detalhes
        };
    }
    
    // Expor a função globalmente
    window.ExcedidoDiagnostico = {
        verificarPropostas: verificarPropostasExcedidas
    };
    
    // Adicionar botão de diagnóstico
    function adicionarBotaoDiagnostico() {
        // Verificar se o botão já existe
        if (document.getElementById('excedido-diagnostico-btn')) {
            return;
        }
        
        // Criar o botão
        const botao = document.createElement('button');
        botao.id = 'excedido-diagnostico-btn';
        botao.className = 'debug-button';
        botao.innerHTML = '<i class="fas fa-stethoscope"></i> Diagnóstico Excedido';
        botao.title = 'Verificar propostas com tempo excedido';
        
        // Adicionar estilo ao botão
        botao.style.position = 'fixed';
        botao.style.bottom = '60px';
        botao.style.right = '10px';
        botao.style.padding = '5px 10px';
        botao.style.backgroundColor = '#17a2b8';
        botao.style.color = 'white';
        botao.style.border = 'none';
        botao.style.borderRadius = '4px';
        botao.style.cursor = 'pointer';
        botao.style.zIndex = '9999';
        botao.style.display = 'none'; // Inicialmente oculto, será mostrado no modo admin
        
        // Adicionar evento de clique
        botao.addEventListener('click', function() {
            const resultado = verificarPropostasExcedidas();
            
            // Exibir resultado em um alerta formatado
            const mensagem = `
                Diagnóstico de Operações Excedidas:
                
                Total de propostas: ${resultado.totalPropostas}
                Propostas PAGAS: ${resultado.propostasPagas}
                Propostas PAGAS com tempo excedido: ${resultado.propostasExcedidas}
                
                ${resultado.detalhes.length > 0 ? 'Detalhes das propostas excedidas:' : 'Nenhuma proposta excedida encontrada.'}
                ${resultado.detalhes.map(p => `\n- Proposta #${p.numero} (${p.cedente}): ${p.tempoFormatado}`).join('')}
                
                Container visível: ${document.getElementById('excedido-container').style.display !== 'none' ? 'Sim' : 'Não'}
            `;
            
            alert(mensagem);
            
            // Também exibir no console para facilitar a análise
            console.log("Diagnóstico de Operações Excedidas:", resultado);
            
            // Forçar a atualização da seção de operações excedidas
            if (typeof window.atualizarOperacoesExcedidasComFiltros === 'function') {
                window.atualizarOperacoesExcedidasComFiltros();
            } else if (typeof window.atualizarOperacoesExcedidas === 'function') {
                window.atualizarOperacoesExcedidas();
            }
        });
        
        // Adicionar o botão ao documento
        document.body.appendChild(botao);
    }
    
    // Inicializar quando o documento estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        // Esperar um pouco para garantir que todos os scripts foram carregados
        setTimeout(function() {
            adicionarBotaoDiagnostico();
            
            // Verificar se o AdminMode está disponível
            if (window.AdminMode && typeof AdminMode.adicionarListenerMudancaEstado === 'function') {
                AdminMode.adicionarListenerMudancaEstado(function(ativo) {
                    const botao = document.getElementById('excedido-diagnostico-btn');
                    if (botao) {
                        botao.style.display = ativo ? 'block' : 'none';
                    }
                });
            }
        }, 2000);
    });
})();