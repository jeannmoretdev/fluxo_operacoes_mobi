// Correção específica para o problema de coloração do status PAGO
(function() {
    console.log("Aplicando correção para coloração do status PAGO...");
    
    // Função para corrigir as cores das linhas com status PAGO
    function corrigirCoresPago() {
        // Obter todas as linhas da tabela
        const linhas = document.querySelectorAll('#propostas-table tbody tr');
        let contadorCorrigidas = 0;
        
        linhas.forEach(linha => {
            // Obter a célula de status (última coluna)
            const celulaStatus = linha.querySelector('td:last-child');
            
            if (!celulaStatus) return;
            
            // Obter o texto do status
            const textoStatus = celulaStatus.textContent.trim();
            
            // Se o status for PAGO, garantir que a linha tenha a classe status-pago
            if (textoStatus === 'PAGO') {
                // Verificar se a linha já tem a classe
                if (!linha.classList.contains('status-pago')) {
                    // Adicionar a classe status-pago
                    linha.classList.add('status-pago');
                    contadorCorrigidas++;
                    
                    // Log para depuração
                    console.log(`Linha corrigida para status PAGO: ID=${linha.getAttribute('data-id')}`);
                }
            }
        });
        
        if (contadorCorrigidas > 0) {
            console.log(`Total de ${contadorCorrigidas} linhas corrigidas para status PAGO`);
        }
    }
    
    // Função para corrigir a função getStatusClass
    function corrigirGetStatusClass() {
        // Verificar se a função getStatusClass existe
        if (typeof window.getStatusClass !== 'function') {
            console.warn("Função getStatusClass não encontrada, criando uma nova");
            
            // Criar uma nova função getStatusClass
            window.getStatusClass = function(status) {
                // Verificar se o status contém PAGO (independente do número)
                if (status.includes("PAGO")) return "status-pago";
                if (status.includes("COMITÊ")) return "status-comite";
                if (status.includes("DIGITANDO")) return "status-digitando";
                if (status.includes("AGUARD. ANÁLISE")) return "status-aguardando";
                if (status.includes("OPER. ANALISANDO")) return "status-analisando";
                if (status.includes("Q CERT. ASSINAT.")) return "status-assinatura";
                if (status.includes("CHECAGEM")) return "status-checagem";
                if (status.includes("POSTERGADO")) return "status-postergado";
                if (status.includes("CEDENTE DESISTIU")) return "status-desistiu";
                if (status.includes("RECUSADO")) return "status-recusado";
                if (status.includes("PENDÊNCIA")) return "status-pendencia";
                
                return "";
            };
            
            console.log("Nova função getStatusClass criada");
            return;
        }
        
        // Guardar referência à função original
        const getStatusClassOriginal = window.getStatusClass;
        
        // Sobrescrever a função
        window.getStatusClass = function(status) {
            // Verificar se o status contém PAGO (independente do número)
            if (status && status.includes("PAGO")) {
                return "status-pago";
            }
            
            // Caso contrário, usar a função original
            return getStatusClassOriginal(status);
        };
        
        console.log("Função getStatusClass corrigida para priorizar status PAGO");
    }
    
    // Função para corrigir a função renderizarTabela
    function corrigirRenderizarTabela() {
        // Verificar se a função renderizarTabela existe
        if (typeof window.renderizarTabela !== 'function') {
            console.error("Função renderizarTabela não encontrada");
            return;
        }
        
        // Guardar referência à função original
        const renderizarTabelaOriginal = window.renderizarTabela;
        
        // Sobrescrever a função
        window.renderizarTabela = function(propostas, novasPropostasIds) {
            // Chamar a função original
            const resultado = renderizarTabelaOriginal(propostas, novasPropostasIds);
            
            // Aplicar a correção de cores para PAGO
            setTimeout(corrigirCoresPago, 0);
            
            return resultado;
        };
        
        console.log("Função renderizarTabela corrigida para aplicar cores de PAGO");
    }
    
    // Função para verificar e corrigir o processamento de dados
    function verificarProcessamentoDados() {
        // Verificar se a função processarDados existe
        if (typeof window.processarDados !== 'function') {
            console.error("Função processarDados não encontrada");
            return;
        }
        
        // Imprimir informações sobre as propostas para depuração
        if (window.APP_STATE && Array.isArray(window.APP_STATE.propostas)) {
            const propostasPagas = window.APP_STATE.propostas.filter(p => 
                p.statusSimplificado === "PAGO"
            );
            
            console.log(`Total de propostas PAGAS: ${propostasPagas.length}`);
            
            if (propostasPagas.length > 0) {
                // Verificar a primeira proposta PAGA
                const primeiraPaga = propostasPagas[0];
                console.log("Exemplo de proposta PAGA:", {
                    id: primeiraPaga.id,
                    numero: primeiraPaga.numero,
                    statusAtual: primeiraPaga.statusAtual,
                    statusSimplificado: primeiraPaga.statusSimplificado
                });
            }
        }
    }
    
    // Executar a correção após o carregamento da tabela
    function iniciarCorrecao() {
        // Corrigir a função getStatusClass
        corrigirGetStatusClass();
        
        // Corrigir a função renderizarTabela
        corrigirRenderizarTabela();
        
        // Verificar o processamento de dados
        verificarProcessamentoDados();
        
        // Verificar se a tabela existe
        const tabela = document.getElementById('propostas-table');
        if (!tabela) {
            console.log("Tabela não encontrada, tentando novamente em 1 segundo...");
            setTimeout(iniciarCorrecao, 1000);
            return;
        }
        
        // Executar a correção inicial
        setTimeout(corrigirCoresPago, 500);
        
        // Observar mudanças na tabela para aplicar a correção quando necessário
        const observer = new MutationObserver(function(mutations) {
            let aplicarCorrecao = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    aplicarCorrecao = true;
                }
            });
            
            if (aplicarCorrecao) {
                console.log("Detectada mudança na tabela, reaplicando correção...");
                setTimeout(corrigirCoresPago, 0);
            }
        });
        
        // Configurar o observer para observar mudanças no tbody
        const tbody = tabela.querySelector('tbody');
        if (tbody) {
            observer.observe(tbody, { childList: true, subtree: true });
            console.log("Observer configurado para o tbody");
        }
        
        // Adicionar um botão de correção manual para testes
        adicionarBotaoCorrecaoManual();
    }
    
    // Função para adicionar um botão de correção manual (apenas para admins)
    function adicionarBotaoCorrecaoManual() {
        // Verificar se o botão já existe
        if (document.getElementById('corrigir-cores-pago-btn')) {
            return;
        }
        
        // Criar o botão
        const botao = document.createElement('button');
        botao.id = 'corrigir-cores-pago-btn';
        botao.textContent = 'Corrigir Cores PAGO';
        botao.className = 'debug-button admin-only';
        botao.style.position = 'fixed';
        botao.style.bottom = '50px';
        botao.style.right = '10px';
        botao.style.zIndex = '9999';
        botao.style.padding = '8px 12px';
        botao.style.backgroundColor = '#28a745';
        botao.style.color = 'white';
        botao.style.border = 'none';
        botao.style.borderRadius = '4px';
        botao.style.cursor = 'pointer';
        botao.style.fontSize = '12px';
        botao.style.display = 'none'; // Inicialmente oculto
        botao.style.visibility = 'hidden';
        
        // Adicionar event listener
        botao.addEventListener('click', function() {
            console.log('Executando correção manual de cores PAGO...');
            corrigirCoresPago();
            
            // Feedback visual
            const originalText = botao.textContent;
            botao.textContent = 'Corrigido!';
            botao.style.backgroundColor = '#218838';
            
            setTimeout(() => {
                botao.textContent = originalText;
                botao.style.backgroundColor = '#28a745';
            }, 2000);
            
            // Log detalhado
            const linhasPago = document.querySelectorAll('#propostas-table tbody tr.status-pago');
            console.log(`Correção aplicada a ${linhasPago.length} linhas com status PAGO`);
            
            // Alert para feedback
            alert(`Correção de cores aplicada!\n${linhasPago.length} linhas com status PAGO foram processadas.`);
        });
        
        // Adicionar o botão ao body
        document.body.appendChild(botao);
        
        console.log('Botão de correção de cores PAGO adicionado (oculto por padrão)');
    }
    
    // Iniciar a correção quando o documento estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarCorrecao);
    } else {
        iniciarCorrecao();
    }
})();