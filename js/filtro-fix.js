// Arquivo js/filtro-fix.js - Correção para o filtro de usuário - VERSÃO ATUALIZADA

(function() {
    console.log("🔧 Inicializando correção para o filtro de usuário...");
    
    // Função para garantir que os filtros funcionem corretamente
    function garantirFuncionamentoFiltros() {
        console.log("🔍 Verificando funcionamento dos filtros...");
        
        // Verificar se as funções principais existem
        if (typeof window.filtrarPropostas !== 'function') {
            console.error("❌ Função filtrarPropostas não encontrada");
            return false;
        }
        
        if (typeof window.ordenarPropostas !== 'function') {
            console.error("❌ Função ordenarPropostas não encontrada");
            return false;
        }
        
        if (typeof window.aplicarFiltrosEOrdenacao !== 'function') {
            console.warn("⚠️ Função aplicarFiltrosEOrdenacao não encontrada, criando fallback...");
            
            // Criar função de fallback
            window.aplicarFiltrosEOrdenacao = function() {
                console.log("🔄 Executando aplicarFiltrosEOrdenacao (fallback)");
                
                try {
                    const propostasFiltradas = window.filtrarPropostas();
                    const propostasOrdenadas = window.ordenarPropostas(propostasFiltradas);
                    
                    if (typeof window.renderizarTabela === 'function') {
                        window.renderizarTabela(propostasOrdenadas);
                    }
                    
                    if (typeof window.atualizarEstatisticas === 'function') {
                        window.atualizarEstatisticas(propostasFiltradas);
                    }
                    
                    if (typeof window.atualizarOperacoesExcedidas === 'function') {
                        window.atualizarOperacoesExcedidas(propostasFiltradas);
                    }
                    
                    console.log("✅ Filtros aplicados com sucesso (fallback)");
                } catch (error) {
                    console.error("❌ Erro ao aplicar filtros (fallback):", error);
                }
            };
        }
        
        return true;
    }
    
    // Função para corrigir event listeners dos filtros
    function corrigirEventListenersFiltros() {
        console.log("🎛️ Corrigindo event listeners dos filtros...");
        
        // Filtro de status
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            // Remover listeners existentes
            const newStatusFilter = statusFilter.cloneNode(true);
            statusFilter.parentNode.replaceChild(newStatusFilter, statusFilter);
            
            // Adicionar novo listener
            newStatusFilter.addEventListener('change', function() {
                console.log(`🔄 Status filtro alterado para: ${this.value}`);
                if (window.APP_STATE) {
                    window.APP_STATE.filtroStatus = this.value;
                }
                
                if (typeof window.aplicarFiltrosEOrdenacao === 'function') {
                    window.aplicarFiltrosEOrdenacao();
                } else {
                    console.error("Função aplicarFiltrosEOrdenacao não encontrada");
                }
            });
            
            console.log("✅ Event listener do filtro de status corrigido");
        }
        
        // Filtro de cedente
        const cedenteFilter = document.getElementById('cedente-filter');
        if (cedenteFilter) {
            // Remover listeners existentes
            const newCedenteFilter = cedenteFilter.cloneNode(true);
            cedenteFilter.parentNode.replaceChild(newCedenteFilter, cedenteFilter);
            
            // Adicionar novo listener
            newCedenteFilter.addEventListener('input', function() {
                console.log(`🔄 Cedente filtro alterado para: "${this.value}"`);
                if (window.APP_STATE) {
                    window.APP_STATE.filtroCedente = this.value;
                }
                
                if (typeof window.aplicarFiltrosEOrdenacao === 'function') {
                    window.aplicarFiltrosEOrdenacao();
                } else {
                    console.error("Função aplicarFiltrosEOrdenacao não encontrada");
                }
            });
            
            console.log("✅ Event listener do filtro de cedente corrigido");
        }
        
        // Filtro de usuário
        const usuarioFilter = document.getElementById('usuario-filter');
        if (usuarioFilter) {
            // Remover listeners existentes
            const newUsuarioFilter = usuarioFilter.cloneNode(true);
            usuarioFilter.parentNode.replaceChild(newUsuarioFilter, usuarioFilter);
            
            // Adicionar novo listener
            newUsuarioFilter.addEventListener('change', function() {
                console.log(`🔄 Usuário filtro alterado para: ${this.value}`);
                if (window.APP_STATE) {
                    window.APP_STATE.usuarioSelecionado = this.value;
                }
                
                if (typeof window.aplicarFiltrosEOrdenacao === 'function') {
                    window.aplicarFiltrosEOrdenacao();
                } else {
                    console.error("Função aplicarFiltrosEOrdenacao não encontrada");
                }
            });
            
            console.log("✅ Event listener do filtro de usuário corrigido");
        }
        
        // Filtro de ordenação
        const sortFilter = document.getElementById('sort-by');
        if (sortFilter) {
            // Remover listeners existentes
            const newSortFilter = sortFilter.cloneNode(true);
            sortFilter.parentNode.replaceChild(newSortFilter, sortFilter);
            
            // Adicionar novo listener
            newSortFilter.addEventListener('change', function() {
                console.log(`🔄 Ordenação alterada para: ${this.value}`);
                if (window.APP_STATE) {
                    window.APP_STATE.ordenacao = this.value;
                }
                
                if (typeof window.aplicarFiltrosEOrdenacao === 'function') {
                    window.aplicarFiltrosEOrdenacao();
                } else {
                    console.error("Função aplicarFiltrosEOrdenacao não encontrada");
                }
            });
            
            console.log("✅ Event listener da ordenação corrigido");
        }
    }
    
    // Função para corrigir ordenação por cabeçalho
    function corrigirOrdenacaoPorCabecalho() {
        console.log("📋 Corrigindo ordenação por cabeçalho...");
        
        // Remover todos os event listeners existentes dos cabeçalhos
        document.querySelectorAll('.sortable').forEach(header => {
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);
        });
        
        // Adicionar novos event listeners
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', function() {
                const sortType = this.getAttribute('data-sort');
                console.log(`📊 Clicou no cabeçalho para ordenar por: ${sortType}`);
                
                if (!sortType) {
                    console.warn("⚠️ Tipo de ordenação não definido para este cabeçalho");
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
                
                console.log(`📊 Ordenação definida como: ${novaOrdenacao}`);
                
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
                if (typeof window.aplicarFiltrosEOrdenacao === 'function') {
                    window.aplicarFiltrosEOrdenacao();
                } else {
                    console.error("❌ Função aplicarFiltrosEOrdenacao não encontrada");
                }
            });
            
            // Adicionar cursor pointer
            header.style.cursor = 'pointer';
            header.title = `Clique para ordenar por ${header.textContent}`;
        });
        
        console.log("✅ Ordenação por cabeçalho corrigida");
    }
    
    // Função principal de inicialização
    function inicializarCorrecaoFiltros() {
        console.log("🚀 Inicializando correção completa dos filtros...");
        
        // Verificar se as dependências estão disponíveis
        if (!garantirFuncionamentoFiltros()) {
            console.error("❌ Dependências não disponíveis, tentando novamente em 2 segundos...");
            setTimeout(inicializarCorrecaoFiltros, 2000);
            return;
        }
        
        // Corrigir event listeners
        corrigirEventListenersFiltros();
        
        // Corrigir ordenação por cabeçalho
        corrigirOrdenacaoPorCabecalho();
        
        console.log("✅ Correção dos filtros concluída com sucesso!");
        
        // Testar se os filtros estão funcionando
        setTimeout(() => {
            testarFuncionamentoFiltros();
        }, 1000);
    }
    
    // Função para testar o funcionamento dos filtros
    function testarFuncionamentoFiltros() {
        console.log("🧪 Testando funcionamento dos filtros...");
        
        try {
            // Testar filtrarPropostas
            const propostasFiltradas = window.filtrarPropostas();
            console.log(`✅ filtrarPropostas funcionando: ${propostasFiltradas.length} propostas filtradas`);
            
            // Testar ordenarPropostas
            const propostasOrdenadas = window.ordenarPropostas(propostasFiltradas);
            console.log(`✅ ordenarPropostas funcionando: ${propostasOrdenadas.length} propostas ordenadas`);
            
            // Testar aplicarFiltrosEOrdenacao
            if (typeof window.aplicarFiltrosEOrdenacao === 'function') {
                console.log("✅ aplicarFiltrosEOrdenacao disponível");
            } else {
                console.warn("⚠️ aplicarFiltrosEOrdenacao não disponível");
            }
            
            console.log("🎉 Todos os testes de filtros passaram!");
            
        } catch (error) {
            console.error("❌ Erro nos testes de filtros:", error);
        }
    }
    
    // Função para adicionar botão de debug dos filtros
    function adicionarBotaoDebugFiltros() {
        // Verificar se o botão já existe
        if (document.getElementById('debug-filtros-btn')) {
            return;
        }
        
        // Criar o botão
        const botao = document.createElement('button');
        botao.id = 'debug-filtros-btn';
        botao.className = 'debug-filtros-button';
        botao.innerHTML = '<i class="fas fa-bug"></i> Debug Filtros';
        botao.title = 'Debug dos filtros e ordenação';
        
        // Adicionar estilo ao botão
        botao.style.position = 'fixed';
        botao.style.bottom = '100px';
        botao.style.right = '10px';
        botao.style.padding = '5px 10px';
        botao.style.backgroundColor = '#FF5722';
        botao.style.color = 'white';
        botao.style.border = 'none';
        botao.style.borderRadius = '4px';
        botao.style.cursor = 'pointer';
        botao.style.zIndex = '9999';
        botao.style.fontSize = '12px';
        
        // Adicionar evento de clique
        botao.addEventListener('click', function() {
            console.log("🐛 === DEBUG DOS FILTROS ===");
            
            // Verificar APP_STATE
            console.log("APP_STATE:", window.APP_STATE);
            
            // Verificar filtros atuais
            const statusFiltro = document.getElementById('status-filter')?.value;
            const cedenteFiltro = document.getElementById('cedente-filter')?.value;
            const usuarioFiltro = document.getElementById('usuario-filter')?.value;
            const ordenacao = document.getElementById('sort-by')?.value;
            
            console.log("Filtros atuais:", {
                status: statusFiltro,
                cedente: cedenteFiltro,
                usuario: usuarioFiltro,
                ordenacao: ordenacao
            });
            
            // Verificar funções disponíveis
            console.log("Funções disponíveis:", {
                filtrarPropostas: typeof window.filtrarPropostas,
                ordenarPropostas: typeof window.ordenarPropostas,
                aplicarFiltrosEOrdenacao: typeof window.aplicarFiltrosEOrdenacao,
                renderizarTabela: typeof window.renderizarTabela,
                atualizarEstatisticas: typeof window.atualizarEstatisticas
            });
            
            // Testar filtros
            if (typeof window.filtrarPropostas === 'function') {
                try {
                    const resultado = window.filtrarPropostas();
                    console.log(`Resultado do filtro: ${resultado.length} propostas`);
                } catch (error) {
                    console.error("Erro ao executar filtrarPropostas:", error);
                }
            }
            
            // Verificar event listeners dos cabeçalhos
            const cabecalhos = document.querySelectorAll('.sortable');
            console.log(`Cabeçalhos ordenáveis encontrados: ${cabecalhos.length}`);
            
            cabecalhos.forEach((cabecalho, index) => {
                const sortType = cabecalho.getAttribute('data-sort');
                console.log(`Cabeçalho ${index + 1}: ${cabecalho.textContent.trim()} (data-sort: ${sortType})`);
            });
            
            console.log("🐛 === FIM DEBUG DOS FILTROS ===");
            
            // Mostrar resumo em alert
            alert(`Debug dos Filtros:\n\n` +
                  `• APP_STATE: ${window.APP_STATE ? 'OK' : 'ERRO'}\n` +
                  `• filtrarPropostas: ${typeof window.filtrarPropostas}\n` +
                  `• ordenarPropostas: ${typeof window.ordenarPropostas}\n` +
                  `• Cabeçalhos ordenáveis: ${cabecalhos.length}\n` +
                  `• Status atual: ${statusFiltro}\n` +
                  `• Cedente atual: "${cedenteFiltro}"\n` +
                  `• Usuário atual: ${usuarioFiltro}\n\n` +
                  `Veja mais detalhes no console.`);
        });
        
        // Adicionar o botão ao documento
        document.body.appendChild(botao);
        console.log("🐛 Botão de debug dos filtros adicionado");
    }
    
    // Função para forçar reconfiguração dos filtros
    function forcarReconfiguracaoFiltros() {
        console.log("🔄 Forçando reconfiguração dos filtros...");
        
        // Aguardar um pouco e tentar novamente
        setTimeout(() => {
            inicializarCorrecaoFiltros();
        }, 500);
        
        // Tentar novamente após mais tempo se necessário
        setTimeout(() => {
            if (typeof window.configurarOrdenacaoPorCabecalho === 'function') {
                console.log("🔄 Executando configurarOrdenacaoPorCabecalho...");
                window.configurarOrdenacaoPorCabecalho();
            }
            
            if (typeof window.configurarEventListenersFiltros === 'function') {
                console.log("🔄 Executando configurarEventListenersFiltros...");
                window.configurarEventListenersFiltros();
            }
        }, 2000);
    }
    
    // Inicializar quando o documento estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log("📄 DOM carregado, iniciando correção dos filtros...");
            setTimeout(inicializarCorrecaoFiltros, 1000);
            setTimeout(adicionarBotaoDebugFiltros, 2000);
            setTimeout(forcarReconfiguracaoFiltros, 3000);
        });
    } else {
        console.log("📄 DOM já carregado, iniciando correção dos filtros...");
        setTimeout(inicializarCorrecaoFiltros, 1000);
        setTimeout(adicionarBotaoDebugFiltros, 2000);
        setTimeout(forcarReconfiguracaoFiltros, 3000);
    }
    
    // Expor função para uso externo
    window.corrigirFiltros = inicializarCorrecaoFiltros;
    window.debugFiltros = testarFuncionamentoFiltros;
    
    console.log("🔧 Filtro-fix carregado e configurado");
})();