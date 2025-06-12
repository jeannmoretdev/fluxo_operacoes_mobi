// Arquivo js/filtro-fix.js - Correção para o filtro de usuário

(function() {
    console.log("Inicializando correção para o filtro de usuário...");
    
    // Função para corrigir o filtro de usuário
    function corrigirFiltroUsuario() {
        // Verificar se a função filtrarPropostas existe
        if (typeof window.filtrarPropostas !== 'function') {
            console.error("Função filtrarPropostas não encontrada");
            return;
        }
        
        // Fazer backup da função original
        const filtrarPropostasOriginal = window.filtrarPropostas;
        
        // Sobrescrever a função
        window.filtrarPropostas = function() {
            // Obter os valores dos filtros
            const statusFiltro = document.getElementById('status-filter').value;
            const cedenteFiltro = document.getElementById('cedente-filter').value.toLowerCase();
            const usuarioFiltro = document.getElementById('usuario-filter')?.value || 'todos';
            
            // Log para depuração
            console.log(`Filtrando propostas - Status: ${statusFiltro}, Cedente: ${cedenteFiltro}, Usuário: ${usuarioFiltro}`);
            
            // Verificar se APP_STATE e APP_STATE.propostas existem
            if (!window.APP_STATE || !Array.isArray(window.APP_STATE.propostas)) {
                console.error("APP_STATE ou APP_STATE.propostas não estão disponíveis");
                return [];
            }
            
            // Filtrar as propostas com base nos critérios
            const resultado = window.APP_STATE.propostas.filter(proposta => {
                // Filtro de status
                const passaFiltroStatus = statusFiltro === 'todos' || proposta.statusAtual === statusFiltro || proposta.statusSimplificado === statusFiltro;
                
                // Filtro de cedente
                const passaFiltroCedente = cedenteFiltro === '' || proposta.cedente.toLowerCase().includes(cedenteFiltro);
                
                // Filtro de usuário
                let passaFiltroUsuario = true;
                if (usuarioFiltro !== 'todos' && window.CedenteService && typeof window.CedenteService.cedenteAssociadoAoUsuario === 'function') {
                    passaFiltroUsuario = window.CedenteService.cedenteAssociadoAoUsuario(proposta.cedente, usuarioFiltro);
                }
                
                // Retornar true apenas se passar por todos os filtros
                return passaFiltroStatus && passaFiltroCedente && passaFiltroUsuario;
            });
            
            console.log(`Filtro aplicado: ${resultado.length} propostas encontradas de ${window.APP_STATE.propostas.length} total`);
            
            return resultado;
        };
        
        console.log("Função filtrarPropostas corrigida para melhor suporte ao filtro de usuário");
    }
    
    // Função para corrigir o seletor de usuário
    function corrigirSeletorUsuario() {
        // Verificar se o seletor existe
        const seletor = document.getElementById('usuario-filter');
        if (!seletor) {
            console.error("Seletor de usuário não encontrado");
            return;
        }
        
        // Remover event listeners existentes
        const novoSeletor = seletor.cloneNode(true);
        seletor.parentNode.replaceChild(novoSeletor, seletor);
        
        // Adicionar novo event listener
        novoSeletor.addEventListener('change', function() {
            const usuarioSelecionado = this.value;
            console.log(`Usuário selecionado: ${usuarioSelecionado}`);
            
            if (window.APP_STATE) {
                window.APP_STATE.usuarioSelecionado = usuarioSelecionado;
            }
            
            if (typeof window.filtrarPropostas === 'function' && 
                typeof window.ordenarPropostas === 'function') {
                
                const propostasFiltradas = window.filtrarPropostas();
                const propostasOrdenadas = window.ordenarPropostas(propostasFiltradas);
                
                // USAR RENDERIZAÇÃO UNIVERSAL
                if (typeof window.renderizarTabelaUniversal === 'function') {
                    window.renderizarTabelaUniversal(propostasOrdenadas);
                } else {
                    window.renderizarTabela(propostasOrdenadas);
                }
                
                if (typeof window.atualizarEstatisticas === 'function') {
                    window.atualizarEstatisticas(propostasFiltradas);
                }
                
                if (typeof window.atualizarOperacoesExcedidas === 'function') {
                    window.atualizarOperacoesExcedidas(propostasFiltradas);
                }
            } else {
                console.error("Funções necessárias não encontradas");
            }
        });
        
        console.log("Seletor de usuário corrigido");
    }
    
    // Função para verificar e corrigir o filtro
    function verificarECorrigirFiltro() {
        // Verificar se o CedenteService está disponível
        if (!window.CedenteService || typeof window.CedenteService.cedenteAssociadoAoUsuario !== 'function') {
            console.error("CedenteService não está disponível ou não tem o método cedenteAssociadoAoUsuario");
            return;
        }
        
        // Verificar se o seletor de usuário existe
        const seletor = document.getElementById('usuario-filter');
        if (!seletor) {
            console.error("Seletor de usuário não encontrado");
            return;
        }
        
        // Corrigir o filtro
        corrigirFiltroUsuario();
        
        // Corrigir o seletor
        corrigirSeletorUsuario();
        
        console.log("Verificação e correção do filtro de usuário concluídas");
    }
    
    // Função para adicionar botão de teste de filtro
    function adicionarBotaoTesteFiltro() {
        // Verificar se o botão já existe
        if (document.getElementById('teste-filtro-btn')) {
            return;
        }
        
        // Criar o botão
        const botao = document.createElement('button');
        botao.id = 'teste-filtro-btn';
        botao.className = 'teste-filtro-button';
        botao.innerHTML = '<i class="fas fa-filter"></i> Testar Filtro';
        botao.title = 'Testar o filtro de usuário';
        
        // Adicionar estilo ao botão
        botao.style.position = 'fixed';
        botao.style.bottom = '50px';
        botao.style.right = '10px';
        botao.style.padding = '5px 10px';
        botao.style.backgroundColor = '#2196F3';
        botao.style.color = 'white';
        botao.style.border = 'none';
        botao.style.borderRadius = '4px';
        botao.style.cursor = 'pointer';
        botao.style.zIndex = '9999';
        
        // Adicionar evento de clique
        botao.addEventListener('click', function() {
            // Obter o usuário selecionado
            const seletor = document.getElementById('usuario-filter');
            const usuarioSelecionado = seletor ? seletor.value : 'todos';
            
            // Testar o filtro
            if (window.CedenteDiagnostico && typeof window.CedenteDiagnostico.testarFiltro === 'function') {
                const resultado = window.CedenteDiagnostico.testarFiltro(usuarioSelecionado);
                
                // Exibir resultado
                alert(`Teste do filtro para o usuário "${usuarioSelecionado}":\n\n` +
                      `Total de cedentes: ${resultado.totalCedentes}\n` +
                      `Cedentes associados: ${resultado.cedentesAssociados.length}\n` +
                      `Total de propostas: ${resultado.totalPropostas}\n` +
                      `Propostas filtradas: ${resultado.propostasFiltradas}\n\n` +
                      `Veja mais detalhes no console.`);
            } else {
                alert("Ferramenta de diagnóstico não disponível");
            }
        });
        
        // Adicionar o botão ao documento
        document.body.appendChild(botao);
    }
    
    // Inicializar quando o documento estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        // Esperar um pouco para garantir que todos os scripts foram carregados
        setTimeout(function() {
            // Verificar e corrigir o filtro
            verificarECorrigirFiltro();
            
            // Adicionar botão de teste
            adicionarBotaoTesteFiltro();
            
            console.log("Correção para o filtro de usuário inicializada");
        }, 3000);
    });
})();