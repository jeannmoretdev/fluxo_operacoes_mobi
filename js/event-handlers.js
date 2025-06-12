// Função para reconfigurar event listeners após mudanças na tabela
function reconfigurarEventListenersTabela() {
    // Aguardar um pouco para garantir que o DOM foi atualizado
    setTimeout(() => {
        if (typeof configurarEventListenersTabela === 'function') {
            configurarEventListenersTabela();
        }
    }, 100);
}

// Função principal para atualizar os dados
async function atualizarDados() {
    console.log('Iniciando atualização de dados');
    
    // Verificar se já existe uma busca em andamento
    if (APP_STATE.buscaEmAndamento) {
        console.log('Busca já em andamento, ignorando nova solicitação de atualização');
        return;
    }
    
    const novasPropostasIds = await buscarDados();
    console.log(`Dados atualizados, ${novasPropostasIds.length} novas propostas`);
    
    const propostasFiltradas = filtrarPropostas();
    const propostasOrdenadas = ordenarPropostas(propostasFiltradas);
    
    console.log(`Renderizando tabela com ${propostasOrdenadas.length} propostas`);
    
    atualizarEstatisticas(propostasFiltradas);
    renderizarTabela(propostasOrdenadas, novasPropostasIds);
    atualizarOperacoesExcedidas();
    atualizarHoraAtualizacao();
    
    // ADICIONAR ESTAS LINHAS:
    calcularSomaValoresAprovados();
    
    // Atualizar label dos borderôs com nova porcentagem
    if (typeof atualizarLabelBorderos === 'function') {
        atualizarLabelBorderos();
    }
    
    // Manter o estado visual da ordenação
    definirEstadoInicialOrdenacao();
    
    // RECONFIGURAR EVENT LISTENERS
    reconfigurarEventListenersTabela();
    
    console.log('Atualização de dados concluída');
}


// Função para definir o intervalo de datas
function definirIntervaloDatas(inicio, fim) {
    APP_STATE.dataInicio = new Date(inicio);
    APP_STATE.dataFim = new Date(fim);
    
    // Atualizar o valor do seletor de datas
    const datepicker = document.getElementById('date-range')._flatpickr;
    datepicker.setDate([APP_STATE.dataInicio, APP_STATE.dataFim]);
    
    // Buscar dados com o novo intervalo
    atualizarDados().then(() => {
        // ADICIONAR ESTA LINHA PARA GARANTIR QUE A SOMA SEJA CALCULADA APÓS OS DADOS SEREM CARREGADOS:
        setTimeout(() => {
            if (typeof calcularSomaValoresAprovados === 'function') {
                calcularSomaValoresAprovados();
            }
        }, 500);
    });
}

// Função para definir intervalo de datas relativo a hoje
function definirIntervaloRelativo(dias) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    let inicio;
    if (dias === 0) {
        // Hoje
        inicio = new Date(hoje);
    } else if (dias === 1) {
        // Ontem
        inicio = new Date(hoje);
        inicio.setDate(inicio.getDate() - 1);
    } else {
        // Últimos X dias
        inicio = new Date(hoje);
        inicio.setDate(inicio.getDate() - (dias - 1));
    }
    
    definirIntervaloDatas(inicio, hoje);
}

// Função para iniciar a atualização automática
function iniciarAtualizacaoAutomatica() {
    // Verificar se já existe um intervalo configurado
    if (window.APP_STATE.intervalId) {
        console.log("Atualização automática já está configurada. Intervalo ID:", window.APP_STATE.intervalId);
        return; // Sair da função sem criar um novo intervalo
    }
    
    console.log("Configurando atualização automática com intervalo de", CONFIG.REFRESH_INTERVAL, "ms");
    
    // Configurar o intervalo
    window.APP_STATE.intervalId = setInterval(() => {
        if (window.APP_STATE.atualizacaoAutomatica && !window.APP_STATE.buscaEmAndamento) {
            console.log("Executando atualização automática");
            atualizarDados();
        } else {
            console.log("Pulando atualização automática:", 
                window.APP_STATE.atualizacaoAutomatica ? "Atualização automática ativada" : "Atualização automática desativada",
                window.APP_STATE.buscaEmAndamento ? "Busca em andamento" : "Nenhuma busca em andamento");
        }
    }, CONFIG.REFRESH_INTERVAL || 300000); // Usar 5 minutos como fallback
    
    console.log("Atualização automática configurada. Intervalo ID:", window.APP_STATE.intervalId);
}

// Tornar a função global
window.iniciarAtualizacaoAutomatica = iniciarAtualizacaoAutomatica;

// Função para parar a atualização automática
function pararAtualizacaoAutomatica() {
    if (window.APP_STATE.intervalId) {
        console.log("Parando atualização automática. Intervalo ID:", window.APP_STATE.intervalId);
        clearInterval(window.APP_STATE.intervalId);
        window.APP_STATE.intervalId = null;
    } else {
        console.log("Nenhuma atualização automática para parar");
    }
}

// Função para alternar a atualização automática
function alternarAtualizacaoAutomatica() {
    APP_STATE.atualizacaoAutomatica = !APP_STATE.atualizacaoAutomatica;
    
    // Atualizar o estado do toggle
    document.getElementById('auto-refresh-toggle').checked = APP_STATE.atualizacaoAutomatica;
    
    // Atualizar o ícone do botão de atualização manual
    const refreshButton = document.getElementById('manual-refresh');
    
    if (APP_STATE.atualizacaoAutomatica) {
        iniciarAtualizacaoAutomatica();
        refreshButton.title = "Atualizar agora (atualização automática ativada)";
    } else {
        refreshButton.title = "Atualizar agora (atualização automática desativada)";
    }
}

// Configurar event listeners para filtros
function configurarEventListenersFiltros() {
    // Event listener para o filtro de status
    document.getElementById('status-filter').addEventListener('change', function() {
        APP_STATE.filtroStatus = this.value;
        const propostasFiltradas = filtrarPropostas();
        const propostasOrdenadas = ordenarPropostas(propostasFiltradas);
        atualizarEstatisticas(propostasFiltradas);
        renderizarTabela(propostasOrdenadas);
        atualizarOperacoesExcedidas();
        
        // ADICIONAR ESTAS LINHAS:
        calcularSomaValoresAprovados();
        if (typeof atualizarLabelBorderos === 'function') {
            atualizarLabelBorderos();
        }
    });
    
    // Event listener para o filtro de cedente
    document.getElementById('cedente-filter').addEventListener('input', function() {
        APP_STATE.filtroCedente = this.value;
        const propostasFiltradas = filtrarPropostas();
        const propostasOrdenadas = ordenarPropostas(propostasFiltradas);
        atualizarEstatisticas(propostasFiltradas);
        renderizarTabela(propostasOrdenadas);
        atualizarOperacoesExcedidas();
        
        // ADICIONAR ESTAS LINHAS:
        calcularSomaValoresAprovados();
        if (typeof atualizarLabelBorderos === 'function') {
            atualizarLabelBorderos();
        }
    });
    
    // Event listener para a ordenação
    document.getElementById('sort-by').addEventListener('change', function() {
        APP_STATE.ordenacao = this.value;
        const propostasFiltradas = filtrarPropostas();
        const propostasOrdenadas = ordenarPropostas(propostasFiltradas);
        renderizarTabela(propostasOrdenadas);
    });
}

// Configurar event listeners para controles de atualização
function configurarEventListenersAtualizacao() {
    // Event listener para o toggle de atualização automática
    document.getElementById('auto-refresh-toggle').addEventListener('change', function() {
        APP_STATE.atualizacaoAutomatica = this.checked;
        if (APP_STATE.atualizacaoAutomatica) {
            iniciarAtualizacaoAutomatica();
        } else {
            pararAtualizacaoAutomatica();
        }
    });
    
    // Event listener para o botão de atualização manual
    document.getElementById('manual-refresh').addEventListener('click', function() {
        atualizarDados();
        // Adicionar animação de rotação ao clicar
        this.classList.add('rotating');
        setTimeout(() => {
            this.classList.remove('rotating');
        }, 1000);
    });
}

// Configurar event listeners para seleção de datas
function configurarEventListenersDatas() {
    // Inicializar o seletor de intervalo de datas
    const datepicker = flatpickr('#date-range', {
        mode: 'range',
        dateFormat: 'd/m/Y',
        locale: 'pt',
        maxDate: 'today',
        defaultDate: [APP_STATE.dataInicio, APP_STATE.dataFim],
        onChange: function(selectedDates) {
            if (selectedDates.length === 2) {
                definirIntervaloDatas(selectedDates[0], selectedDates[1]);
            }
        }
    });
    
    // Event listeners para os botões de presets de datas
    document.querySelectorAll('.date-preset').forEach(button => {
        button.addEventListener('click', function() {
            const dias = parseInt(this.getAttribute('data-days'));
            definirIntervaloRelativo(dias);
        });
    });
}

// Função para configurar a ordenação por clique nos cabeçalhos
function configurarOrdenacaoPorCabecalho() {
    const cabecalhosOrdenáveis = document.querySelectorAll('th.sortable');
    
    cabecalhosOrdenáveis.forEach(cabecalho => {
        cabecalho.addEventListener('click', function() {
            const tipoOrdenacao = this.getAttribute('data-sort');
            
            // Verificar se já está ordenado por esta coluna
            if (this.classList.contains('sort-asc')) {
                // Mudar para ordem decrescente
                APP_STATE.ordenacao = `${tipoOrdenacao}_desc`;
                
                // Atualizar classes
                cabecalhosOrdenáveis.forEach(c => c.classList.remove('sort-asc', 'sort-desc'));
                this.classList.add('sort-desc');
            } else {
                // Mudar para ordem crescente
                APP_STATE.ordenacao = `${tipoOrdenacao}_asc`;
                
                // Atualizar classes
                cabecalhosOrdenáveis.forEach(c => c.classList.remove('sort-asc', 'sort-desc'));
                this.classList.add('sort-asc');
            }
            
            // Atualizar o select de ordenação para refletir a escolha atual
            const selectOrdenacao = document.getElementById('sort-by');
            if (selectOrdenacao && selectOrdenacao.querySelector(`option[value="${APP_STATE.ordenacao}"]`)) {
                selectOrdenacao.value = APP_STATE.ordenacao;
            }
            
            // Reordenar e renderizar a tabela
            const propostasFiltradas = filtrarPropostas();
            const propostasOrdenadas = ordenarPropostas(propostasFiltradas);
            renderizarTabela(propostasOrdenadas);
        });
    });
}

// Função para definir o estado inicial da ordenação
function definirEstadoInicialOrdenacao() {
    // Obter o valor atual da ordenação
    const ordenacaoAtual = APP_STATE.ordenacao;
    
    // Encontrar o tipo e direção da ordenação
    const [tipo, direcao] = ordenacaoAtual.split('_');
    
    // Encontrar o cabeçalho correspondente
    const cabecalho = document.querySelector(`th[data-sort="${tipo}"]`);
    
    if (cabecalho) {
        // Remover classes de todos os cabeçalhos
        document.querySelectorAll('th.sortable').forEach(c => 
            c.classList.remove('sort-asc', 'sort-desc')
        );
        
        // Adicionar a classe apropriada
        cabecalho.classList.add(direcao === 'asc' ? 'sort-asc' : 'sort-desc');
    }
}