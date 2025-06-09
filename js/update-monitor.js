// Arquivo js/update-monitor.js - Monitoramento de atualizações

(function() {
    // Contador de atualizações
    let contadorAtualizacoes = 0;
    
    // Timestamp da última atualização
    let ultimaAtualizacao = Date.now();
    
    // Limite de atualizações em um curto período de tempo
    const LIMITE_ATUALIZACOES = 5;
    const PERIODO_MONITORAMENTO = 10000; // 10 segundos
    
    // Função para monitorar atualizações
    function monitorarAtualizacao() {
        contadorAtualizacoes++;
        const agora = Date.now();
        
        console.log(`Atualização #${contadorAtualizacoes} - Intervalo: ${agora - ultimaAtualizacao}ms`);
        
        // Verificar se estamos tendo muitas atualizações em um curto período
        if (agora - ultimaAtualizacao < PERIODO_MONITORAMENTO && contadorAtualizacoes > LIMITE_ATUALIZACOES) {
            console.error("ALERTA: Possível loop de atualização infinita detectado!");
            
            // Parar qualquer atualização automática
            if (window.APP_STATE && window.APP_STATE.intervalId) {
                console.log("Parando atualização automática para evitar loop");
                clearInterval(window.APP_STATE.intervalId);
                window.APP_STATE.intervalId = null;
                window.APP_STATE.atualizacaoAutomatica = false;
                
                // Atualizar o toggle na interface
                const toggle = document.getElementById('auto-refresh-toggle');
                if (toggle) {
                    toggle.checked = false;
                }
                
                // Exibir mensagem de erro
                const errorMessage = document.getElementById('error-message');
                if (errorMessage) {
                    errorMessage.textContent = "Atualização automática desativada para evitar loop infinito";
                    errorMessage.style.display = 'block';
                    setTimeout(() => {
                        errorMessage.style.display = 'none';
                    }, 5000);
                }
            }
            
            // Resetar o contador
            contadorAtualizacoes = 0;
        }
        
        // Se passaram mais de 10 segundos desde a última atualização, resetar o contador
        if (agora - ultimaAtualizacao > PERIODO_MONITORAMENTO) {
            contadorAtualizacoes = 1;
        }
        
        ultimaAtualizacao = agora;
    }
    
    // Sobrescrever a função atualizarDados para monitorar as chamadas
    const atualizarDadosOriginal = window.atualizarDados;
    
    if (typeof atualizarDadosOriginal === 'function') {
        window.atualizarDados = async function() {
            monitorarAtualizacao();
            return await atualizarDadosOriginal.apply(this, arguments);
        };
        console.log("Função atualizarDados sobrescrita para monitoramento");
    } else {
        console.warn("Função atualizarDados não encontrada para monitoramento");
    }
    
    // Adicionar botão para reiniciar a atualização automática
    function adicionarBotaoReiniciarAtualizacao() {
        // Verificar se o botão já existe
        if (document.getElementById('restart-update-btn')) {
            return;
        }
        
        // Criar o botão
        const botao = document.createElement('button');
        botao.id = 'restart-update-btn';
        botao.className = 'debug-button';
        botao.innerHTML = '<i class="fas fa-sync"></i> Reiniciar Atualização';
        botao.title = 'Reiniciar a atualização automática';
        
        // Adicionar estilo ao botão
        botao.style.position = 'fixed';
        botao.style.bottom = '130px';
        botao.style.right = '10px';
        botao.style.padding = '5px 10px';
        botao.style.backgroundColor = '#f8f9fa';
        botao.style.border = '1px solid #dee2e6';
        botao.style.borderRadius = '4px';
        botao.style.cursor = 'pointer';
        botao.style.zIndex = '9999';
        
        // Adicionar evento de clique
        botao.addEventListener('click', function() {
            console.log("Reiniciando atualização automática");
            
            // Parar qualquer atualização existente
            if (window.APP_STATE && window.APP_STATE.intervalId) {
                clearInterval(window.APP_STATE.intervalId);
                window.APP_STATE.intervalId = null;
            }
            
            // Resetar flags
            if (window.APP_STATE) {
                window.APP_STATE.buscaEmAndamento = false;
                window.APP_STATE.atualizacaoAutomatica = true;
                
                // Atualizar o toggle na interface
                const toggle = document.getElementById('auto-refresh-toggle');
                if (toggle) {
                    toggle.checked = true;
                }
            }
            
            // Reiniciar a atualização
            if (typeof window.iniciarAtualizacaoAutomatica === 'function') {
                window.iniciarAtualizacaoAutomatica();
                console.log("Atualização automática reiniciada");
            } else if (typeof iniciarAtualizacaoAutomatica === 'function') {
                iniciarAtualizacaoAutomatica();
                console.log("Atualização automática reiniciada");
            } else {
                console.error("Função iniciarAtualizacaoAutomatica não encontrada");
            }
            
            // Executar uma atualização imediata
            if (typeof window.atualizarDados === 'function') {
                window.atualizarDados();
            }
        });
        
        // Adicionar o botão ao documento
        document.body.appendChild(botao);
    }
    
    // Adicionar o botão após um tempo
    setTimeout(adicionarBotaoReiniciarAtualizacao, 3000);
})();