// Arquivo js/user-filter.js - Filtro de usuário com controle de acesso

(function() {
    console.log("Carregando filtro de usuário com controle de acesso...");
    
    // Lista de usuários que sempre devem ser visíveis
    const USUARIOS_SEMPRE_VISIVEIS = ['BRUNNA', 'DAIANA', 'GABRIEL', 'CAROL'];
    
    // Flag para controlar se o filtro já foi inicializado
    let filtroInicializado = false;
    
    // Esperar o DOM estar pronto
    document.addEventListener('DOMContentLoaded', function() {
        console.log("DOM carregado, aguardando dados de cedentes e usuários");
        
        // Verificar se o filtro já foi inicializado
        if (filtroInicializado) {
            console.log("Filtro de usuário já foi inicializado anteriormente");
            return;
        }
        
        // Verificar se o serviço de cedentes já carregou os dados
        if (window.CedenteService && CedenteService.dadosCarregados) {
            inicializarFiltroUsuario();
        } else {
            // Aguardar o evento de dados carregados
            document.addEventListener('cedentesUsuariosCarregados', function() {
                if (!filtroInicializado) {
                    inicializarFiltroUsuario();
                }
            });
            
            // Timeout como fallback caso o evento não seja disparado
            setTimeout(() => {
                if (!filtroInicializado) {
                    console.log("Inicializando filtro de usuário via timeout");
                    inicializarFiltroUsuario();
                }
            }, 3000);
        }
    });
    
    // Função para inicializar o filtro de usuário
    function inicializarFiltroUsuario() {
        // Verificar se o filtro já foi inicializado
        if (filtroInicializado) {
            console.log("Filtro de usuário já foi inicializado");
            return;
        }
        
        // Marcar como inicializado
        filtroInicializado = true;
        
        console.log("Inicializando filtro de usuário com controle de acesso");
        
        // Verificar se o container de filtros existe
        const filtersContainer = document.querySelector('.filters');
        if (!filtersContainer) {
            console.error("Container de filtros não encontrado");
            return;
        }
        
        // Verificar se o filtro já existe
        if (document.getElementById('usuario-filter')) {
            console.log("Filtro de usuário já existe no DOM");
            return;
        }
        
        // Obter a lista de usuários do serviço de cedentes, se disponível
        let listaUsuarios = [];
        if (window.CedenteService && typeof CedenteService.obterTodosUsuarios === 'function') {
            listaUsuarios = CedenteService.obterTodosUsuarios();
            console.log(`Lista de usuários obtida do serviço de cedentes: ${listaUsuarios.length} usuários`);
        } else {
            // Lista vazia como fallback
            console.log("CedenteService não disponível, usando lista vazia");
        }
        
        // Criar o grupo de filtro
        const filterGroup = document.createElement('div');
        filterGroup.className = 'filter-group';
        
        // Criar o label
        const label = document.createElement('label');
        label.setAttribute('for', 'usuario-filter');
        label.textContent = 'Usuário:';
        
        // Criar o select
        const select = document.createElement('select');
        select.id = 'usuario-filter';
        
        // Adicionar opção padrão
        const defaultOption = document.createElement('option');
        defaultOption.value = 'todos';
        defaultOption.textContent = 'Todos os Usuários';
        select.appendChild(defaultOption);
        
        // Verificar se o modo admin está ativo
        const modoAdminAtivo = window.AdminMode && typeof window.AdminMode.isAtivo === 'function' 
            ? window.AdminMode.isAtivo() 
            : false;
        
        // Filtrar a lista de usuários com base no modo admin
        const usuariosParaMostrar = modoAdminAtivo 
            ? listaUsuarios 
            : listaUsuarios.filter(usuario => USUARIOS_SEMPRE_VISIVEIS.includes(usuario));
        
        // Adicionar usuários ao select
        usuariosParaMostrar.sort().forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario;
            option.textContent = usuario;
            select.appendChild(option);
        });
        
        console.log(`Adicionadas ${usuariosParaMostrar.length} opções de usuário ao filtro`);
        
        // Adicionar event listener
        select.addEventListener('change', function() {
            const usuarioSelecionado = this.value;
            console.log(`Usuário selecionado: ${usuarioSelecionado}`);
            
            // Aplicar o filtro
            filtrarPropostasPorUsuario(usuarioSelecionado);
        });
        
        // Adicionar elementos ao grupo
        filterGroup.appendChild(label);
        filterGroup.appendChild(select);
        
        // Adicionar o grupo à seção de filtros
        filtersContainer.appendChild(filterGroup);
        console.log("Filtro de usuário adicionado com sucesso ao DOM");
    }
    
    // Função para atualizar o filtro de usuário (pode ser chamada após atualizar os dados de cedentes)
    window.atualizarFiltroUsuario = function() {
        console.log("Atualizando filtro de usuário");
        
        // Obter o select de usuário
        const select = document.getElementById('usuario-filter');
        if (!select) {
            console.error("Select de usuário não encontrado");
            return;
        }
        
        // Salvar o valor selecionado atualmente
        const valorAtual = select.value;
        
        // Limpar as opções existentes
        while (select.options.length > 0) {
            select.remove(0);
        }
        
        // Adicionar opção padrão
        const defaultOption = document.createElement('option');
        defaultOption.value = 'todos';
        defaultOption.textContent = 'Todos os Usuários';
        select.appendChild(defaultOption);
        
        // Obter a lista atualizada de usuários
        let listaUsuarios = [];
        if (window.CedenteService && typeof CedenteService.obterTodosUsuarios === 'function') {
            listaUsuarios = CedenteService.obterTodosUsuarios();
            console.log(`Lista atualizada de usuários: ${listaUsuarios.length} usuários`);
        }
        
        // Verificar se o modo admin está ativo
        const modoAdminAtivo = window.AdminMode && typeof window.AdminMode.isAtivo === 'function' 
            ? window.AdminMode.isAtivo() 
            : false;
        
        // Filtrar a lista de usuários com base no modo admin
        const usuariosParaMostrar = modoAdminAtivo 
            ? listaUsuarios 
            : listaUsuarios.filter(usuario => USUARIOS_SEMPRE_VISIVEIS.includes(usuario));
        
        // Adicionar usuários ao select
        usuariosParaMostrar.sort().forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario;
            option.textContent = usuario;
            select.appendChild(option);
        });
        
        // Restaurar o valor selecionado, se possível
        if (valorAtual && (valorAtual === 'todos' || usuariosParaMostrar.includes(valorAtual))) {
            select.value = valorAtual;
        } else {
            select.value = 'todos';
        }
        
        console.log(`Filtro de usuário atualizado com ${usuariosParaMostrar.length} opções`);
        
        // Aplicar o filtro novamente
        filtrarPropostasPorUsuario(select.value);
    };
    
    // Função para filtrar propostas por usuário (MODIFICADA)
    function filtrarPropostasPorUsuario(usuario) {
        console.log(`Filtrando propostas por usuário: ${usuario}`);
        
        // Se o CedenteService não estiver disponível, usar o método antigo
        if (!window.CedenteService || !CedenteService.cedenteAssociadoAoUsuario) {
            console.log("CedenteService não disponível, usando método de filtragem antigo");
            filtrarTabelaPorUsuario(usuario);
            return;
        }
        
        // Verificar se temos acesso ao estado da aplicação
        if (!window.APP_STATE || !Array.isArray(APP_STATE.propostas)) {
            console.error("APP_STATE não disponível ou não contém propostas");
            return;
        }
        
        // Salvar o usuário selecionado no estado da aplicação
        APP_STATE.usuarioSelecionado = usuario;
        
        // Aplicar outros filtros existentes
        if (typeof window.filtrarPropostas === 'function') {
            // Chamar a função de filtragem existente
            const propostasFiltradas = window.filtrarPropostas();
            
            // Ordenar as propostas
            if (typeof window.ordenarPropostas === 'function') {
                const propostasOrdenadas = window.ordenarPropostas(propostasFiltradas);
                
                // Renderizar a tabela
                if (typeof window.renderizarTabela === 'function') {
                    window.renderizarTabela(propostasOrdenadas);
                    
                    // Atualizar estatísticas (agora inclui a soma dos borderôs)
                    if (typeof window.atualizarEstatisticas === 'function') {
                        window.atualizarEstatisticas(propostasFiltradas);
                    }
                    
                    // REMOVIDO: calcularSomaValoresAprovados(propostasFiltradas);
                    
                    // Atualizar operações excedidas
                    if (typeof window.atualizarOperacoesExcedidas === 'function') {
                        window.atualizarOperacoesExcedidas();
                    }
                }
            }
        } else {
            console.error("Função filtrarPropostas não encontrada");
            // Fallback para o método antigo
            filtrarTabelaPorUsuario(usuario);
        }
        
        // Registrar a ação para diagnóstico
        if (window.CedenteDiagnostico && typeof window.CedenteDiagnostico.testarFiltro === 'function') {
            const resultado = window.CedenteDiagnostico.testarFiltro(usuario);
            console.log("Diagnóstico do filtro:", resultado);
        }
    }
    
    // Método antigo de filtragem (fallback) - MODIFICADO
    function filtrarTabelaPorUsuario(usuario) {
        console.log(`Filtrando tabela por usuário (método antigo): ${usuario}`);
        
        // Obter a tabela
        const tabela = document.getElementById('propostas-table');
        if (!tabela) {
            console.error("Tabela de propostas não encontrada");
            return;
        }
        
        // Obter todas as linhas da tabela (exceto o cabeçalho)
        const linhas = tabela.querySelectorAll('tbody tr');
        console.log(`Total de linhas na tabela: ${linhas.length}`);
        
        // Se o usuário for "todos", mostrar todas as linhas
        if (usuario === 'todos') {
            linhas.forEach(linha => {
                linha.style.display = '';
            });
            console.log("Mostrando todas as linhas");
            
            // Atualizar estatísticas
            atualizarEstatisticasAposFiltragem();
            
            // ADICIONADO: Atualizar soma com todas as propostas
            if (typeof window.calcularSomaValoresAprovados === 'function' && typeof window.filtrarPropostas === 'function') {
                const todasPropostasFiltradas = window.filtrarPropostas();
                window.calcularSomaValoresAprovados(todasPropostasFiltradas);
            }
            return;
        }
        
        // Contador para linhas visíveis
        let linhasVisiveis = 0;
        
        // Para cada linha, verificar se o cedente está associado ao usuário
        linhas.forEach(linha => {
            // Obter o cedente da linha (quinta coluna)
            const celulaCedente = linha.querySelector('td:nth-child(5)');
            if (!celulaCedente) {
                linha.style.display = 'none';
                return;
            }
            
            const cedente = celulaCedente.textContent.trim();
            
            // Verificar se o cedente está associado ao usuário
            let associado = false;
            
            if (window.CedenteService && typeof CedenteService.cedenteAssociadoAoUsuario === 'function') {
                associado = CedenteService.cedenteAssociadoAoUsuario(cedente, usuario);
            } else {
                // Fallback: verificar se o usuário está mencionado em algum lugar na linha
                const conteudoLinha = linha.textContent || linha.innerText;
                associado = conteudoLinha.includes(usuario);
            }
            
            if (associado) {
                linha.style.display = '';
                linhasVisiveis++;
            } else {
                linha.style.display = 'none';
            }
        });
        
        console.log(`Linhas visíveis após filtragem: ${linhasVisiveis}`);
        
        // Atualizar estatísticas
        atualizarEstatisticasAposFiltragem();
        
        // ADICIONADO: Atualizar soma após filtragem (método antigo)
        if (typeof window.calcularSomaValoresAprovados === 'function' && typeof window.filtrarPropostas === 'function') {
            const propostasFiltradas = window.filtrarPropostas();
            window.calcularSomaValoresAprovados(propostasFiltradas);
            console.log('Soma atualizada após filtragem por usuário (método antigo)');
        }
    }
    
    // Função para atualizar estatísticas após filtragem
    function atualizarEstatisticasAposFiltragem() {
        console.log("Atualizando estatísticas após filtragem");
        
        // Obter todas as linhas visíveis
        const linhasVisiveis = document.querySelectorAll('#propostas-table tbody tr:not([style*="display: none"])');
        console.log(`Total de linhas visíveis: ${linhasVisiveis.length}`);
        
        // Atualizar o contador de total de propostas
        const totalPropostasElement = document.getElementById('total-propostas');
        if (totalPropostasElement) {
            totalPropostasElement.textContent = linhasVisiveis.length;
        }
        
        // Contar propostas pagas
        let propostasPagas = 0;
        linhasVisiveis.forEach(linha => {
            if (linha.classList.contains('status-pago')) {
                propostasPagas++;
            }
        });
        
        // Atualizar o contador de propostas pagas
        const totalPagasElement = document.getElementById('total-pagas');
        if (totalPagasElement) {
            totalPagasElement.textContent = propostasPagas;
        }
        
        // Atualizar o contador de propostas em processamento
        const totalProcessamentoElement = document.getElementById('total-processamento');
        if (totalProcessamentoElement) {
            totalProcessamentoElement.textContent = linhasVisiveis.length - propostasPagas;
        }
    }
    
    // Função para atualizar o filtro quando o modo admin muda
    function atualizarFiltroQuandoModoAdminMuda() {
        // Verificar se o AdminMode está disponível
        if (!window.AdminMode) {
            console.log("AdminMode não disponível, não é possível registrar listener");
            return;
        }
        
        // Registrar uma função para ser chamada quando o modo admin mudar
        if (typeof window.AdminMode.adicionarListenerMudancaEstado === 'function') {
            window.AdminMode.adicionarListenerMudancaEstado(atualizarFiltroUsuario);
            console.log("Listener de mudança de estado do modo admin registrado");
        } else {
            console.log("Função adicionarListenerMudancaEstado não disponível");
        }
    }
    
    // Registrar a função para atualizar o filtro quando o modo admin mudar
    document.addEventListener('DOMContentLoaded', function() {
        // Esperar um pouco para garantir que o AdminMode foi carregado
        setTimeout(atualizarFiltroQuandoModoAdminMuda, 3000);
    });
})();