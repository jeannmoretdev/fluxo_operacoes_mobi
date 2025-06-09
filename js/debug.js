// Arquivo de depuração para ajudar a identificar problemas

// Função para verificar o estado do modo TV
function verificarEstadoModoTV() {
    console.log('=== VERIFICAÇÃO DO MODO TV ===');
    
    // Verificar se a classe tv-mode está aplicada ao body
    const tvModeAtivo = document.body.classList.contains('tv-mode');
    console.log('Modo TV ativo:', tvModeAtivo);
    
    // Verificar se o botão de modo TV existe
    const botaoTV = document.getElementById('tv-mode-toggle');
    console.log('Botão de modo TV encontrado:', !!botaoTV);
    
    if (botaoTV) {
        console.log('Texto do botão:', botaoTV.innerHTML);
        
        // Verificar se o botão tem event listeners
        const cloneBtn = botaoTV.cloneNode(true);
        const temEventListeners = botaoTV !== cloneBtn;
        console.log('Botão tem event listeners:', temEventListeners);
    }
    
    // Verificar se o cabeçalho do modo TV existe
    const cabecalhoTV = document.querySelector('.tv-mode-header');
    console.log('Cabeçalho do modo TV encontrado:', !!cabecalhoTV);
    
    if (cabecalhoTV) {
        console.log('Visibilidade do cabeçalho:', getComputedStyle(cabecalhoTV).display);
    }
    
    // Verificar os controles de tamanho de fonte
    const increaseBtn = document.getElementById('increase-font');
    const decreaseBtn = document.getElementById('decrease-font');
    const fontSizeValue = document.getElementById('font-size-value');
    
    console.log('Botão de aumentar fonte encontrado:', !!increaseBtn);
    console.log('Botão de diminuir fonte encontrado:', !!decreaseBtn);
    console.log('Valor do tamanho da fonte encontrado:', !!fontSizeValue);
    
    if (fontSizeValue) {
        console.log('Tamanho da fonte atual:', fontSizeValue.textContent);
    }
    
    // Verificar a variável CSS de tamanho de fonte
    const tvFontSize = getComputedStyle(document.documentElement).getPropertyValue('--tv-font-size');
    console.log('Valor da variável CSS --tv-font-size:', tvFontSize);
    
    // Verificar o localStorage
    console.log('Valor de modo-tv no localStorage:', localStorage.getItem('modo-tv'));
    console.log('Valor de tv-font-size no localStorage:', localStorage.getItem('tv-font-size'));
    
    console.log('=== FIM DA VERIFICAÇÃO ===');
}

// Executar a verificação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Esperar um pouco para garantir que todos os scripts foram carregados
    setTimeout(verificarEstadoModoTV, 2000);
    
    // Adicionar botão de depuração
    const debugBtn = document.createElement('button');
    debugBtn.textContent = 'Verificar Modo TV';
    debugBtn.style.position = 'fixed';
    debugBtn.style.bottom = '10px';
    debugBtn.style.right = '10px';
    debugBtn.style.zIndex = '9999';
    debugBtn.style.padding = '5px 10px';
    debugBtn.style.backgroundColor = '#f8f9fa';
    debugBtn.style.border = '1px solid #dee2e6';
    debugBtn.style.borderRadius = '4px';
    debugBtn.style.cursor = 'pointer';
    
    debugBtn.addEventListener('click', verificarEstadoModoTV);
    
    document.body.appendChild(debugBtn);
});

// Adicionar função para testar os controles de tamanho de fonte
function testarControlesFonte() {
    console.log('=== TESTE DOS CONTROLES DE FONTE ===');
    
    const increaseBtn = document.getElementById('increase-font');
    const decreaseBtn = document.getElementById('decrease-font');
    
    if (increaseBtn) {
        console.log('Simulando clique no botão de aumentar fonte');
        increaseBtn.click();
    } else {
        console.error('Botão de aumentar fonte não encontrado');
    }
    
    setTimeout(() => {
        if (decreaseBtn) {
            console.log('Simulando clique no botão de diminuir fonte');
            decreaseBtn.click();
        } else {
            console.error('Botão de diminuir fonte não encontrado');
        }
        
        console.log('=== FIM DO TESTE ===');
    }, 1000);
}

// Adicionar função para verificar a estrutura da tabela
function verificarEstruturaTabela() {
    console.log('=== VERIFICAÇÃO DA ESTRUTURA DA TABELA ===');
    
    const tabela = document.getElementById('propostas-table');
    if (!tabela) {
        console.error('Tabela não encontrada');
        return;
    }
    
    const thead = tabela.querySelector('thead');
    if (!thead) {
        console.error('Cabeçalho da tabela não encontrado');
        return;
    }
    
    const tbody = tabela.querySelector('tbody');
    if (!tbody) {
        console.error('Corpo da tabela não encontrado');
        return;
    }
    
    // Verificar as colunas do cabeçalho
    const thCells = thead.querySelectorAll('th');
    console.log(`Número de colunas no cabeçalho: ${thCells.length}`);
    
    thCells.forEach((th, index) => {
        console.log(`Coluna ${index + 1}: "${th.textContent.trim()}" - Visível: ${getComputedStyle(th).display !== 'none'}`);
    });
    
    // Verificar as linhas do corpo
    const rows = tbody.querySelectorAll('tr');
    console.log(`Número de linhas no corpo: ${rows.length}`);
    
    if (rows.length > 0) {
        const firstRow = rows[0];
        const tdCells = firstRow.querySelectorAll('td');
        
        console.log(`Número de células na primeira linha: ${tdCells.length}`);
        
        tdCells.forEach((td, index) => {
            console.log(`Célula ${index + 1}: "${td.textContent.trim()}" - Visível: ${getComputedStyle(td).display !== 'none'}`);
        });
    }
    
    console.log('=== FIM DA VERIFICAÇÃO ===');
}

// Expor funções para uso no console
window.verificarEstadoModoTV = verificarEstadoModoTV;
window.testarControlesFonte = testarControlesFonte;
window.verificarEstruturaTabela = verificarEstruturaTabela;

// Função para exibir informações detalhadas sobre cedentes e usuários
function exibirInformacoesCedentesDetalhadas() {
    console.log('=== INFORMAÇÕES DETALHADAS DE CEDENTES E USUÁRIOS ===');
    
    // Verificar se o CedenteService está disponível
    if (typeof window.CedenteService === 'undefined') {
        console.error('CedenteService não está disponível no escopo global');
        console.log('window.CedenteService:', window.CedenteService);
        return;
    }
    
    // Verificar se os dados foram carregados
    if (!window.CedenteService.dadosCarregados) {
        console.warn('Dados de cedentes ainda não foram carregados');
        console.log('Tentando carregar dados agora...');
        
        // Tentar carregar os dados
        window.CedenteService.buscarDadosCedentesUsuarios()
            .then(() => {
                console.log('Dados carregados com sucesso, exibindo informações...');
                mostrarInformacoesCedentes();
            })
            .catch(error => {
                console.error('Erro ao carregar dados:', error);
            });
        
        return;
    }
    
    // Se os dados já estiverem carregados, mostrar as informações
    mostrarInformacoesCedentes();
}

// Função auxiliar para mostrar as informações dos cedentes
function mostrarInformacoesCedentes() {
    // Obter todos os gerentes
    const gerentes = window.CedenteService.obterTodosGerentes();
    console.log(`Total de gerentes: ${gerentes.length}`);
    console.log('Gerentes:', gerentes);
    
    // Obter todos os usuários
    const usuarios = window.CedenteService.obterTodosUsuarios();
    console.log(`Total de usuários: ${usuarios.length}`);
    console.log('Usuários:', usuarios);
    
    // Exibir mapeamento de cedentes para gerentes e usuários
    console.log('Mapeamento de cedentes:');
    const cedentes = Object.keys(window.CedenteService.mapeamentoCedentesUsuarios);
    console.log(`Total de cedentes: ${cedentes.length}`);
    
    // Exibir os primeiros 10 cedentes como exemplo
    for (let i = 0; i < Math.min(10, cedentes.length); i++) {
        const cedente = cedentes[i];
        const info = window.CedenteService.mapeamentoCedentesUsuarios[cedente];
        console.log(`${i+1}. Cedente: ${cedente}`);
        console.log(`   Gerente: ${info.gerente}`);
        console.log(`   Usuários: ${info.usuarios.join(', ')}`);
    }
    
    console.log('=== FIM DAS INFORMAÇÕES DETALHADAS ===');
}

// Adicionar a função ao objeto window para poder ser chamada do console
window.exibirInformacoesCedentesDetalhadas = exibirInformacoesCedentesDetalhadas;

// Adicionar botão de depuração para exibir informações
function adicionarBotaoDebugCedentes() {
    // Verificar se o botão já existe
    if (document.getElementById('debug-cedentes-btn')) {
        return;
    }
    
    // Criar o botão
    const botao = document.createElement('button');
    botao.id = 'debug-cedentes-btn';
    botao.className = 'debug-button';
    botao.innerHTML = '<i class="fas fa-bug"></i> Debug Cedentes';
    botao.title = 'Exibir informações de cedentes e usuários no console';
    
    // Adicionar estilo ao botão
    botao.style.position = 'fixed';
    botao.style.bottom = '50px';
    botao.style.right = '10px';
    botao.style.padding = '5px 10px';
    botao.style.backgroundColor = '#f8f9fa';
    botao.style.border = '1px solid #dee2e6';
    botao.style.borderRadius = '4px';
    botao.style.cursor = 'pointer';
    botao.style.zIndex = '9999';
    
    // Adicionar evento de clique
    botao.addEventListener('click', exibirInformacoesCedentesDetalhadas);
    
    // Adicionar o botão ao documento
    document.body.appendChild(botao);
}

// Verificar se o CedenteService está disponível
function verificarCedenteService() {
    console.log('=== VERIFICAÇÃO DO CEDENTESERVICE ===');
    console.log('window.CedenteService existe:', typeof window.CedenteService !== 'undefined');
    
    if (typeof window.CedenteService !== 'undefined') {
        console.log('CedenteService.dadosCarregados:', window.CedenteService.dadosCarregados);
        console.log('CedenteService.buscaEmAndamento:', window.CedenteService.buscaEmAndamento);
        console.log('Métodos disponíveis:', Object.keys(window.CedenteService));
        
        // Verificar se há cedentes no mapeamento
        const numCedentes = Object.keys(window.CedenteService.mapeamentoCedentesUsuarios).length;
        console.log('Número de cedentes no mapeamento:', numCedentes);
    } else {
        console.error('CedenteService não está definido no escopo global');
    }
    
    console.log('=== FIM DA VERIFICAÇÃO ===');
}

// Adicionar a função ao objeto window para poder ser chamada do console
window.verificarCedenteService = verificarCedenteService;

// Executar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado em debug.js');
    
    // Verificar se o CedenteService está disponível
    setTimeout(verificarCedenteService, 1000);
    
    // Esperar um pouco mais para garantir que todos os scripts foram carregados
    setTimeout(adicionarBotaoDebugCedentes, 2000);
});

// Adicionar botão para verificar o CedenteService
function adicionarBotaoVerificarCedenteService() {
    // Verificar se o botão já existe
    if (document.getElementById('verificar-cedente-service-btn')) {
        return;
    }
    
    // Criar o botão
    const botao = document.createElement('button');
    botao.id = 'verificar-cedente-service-btn';
    botao.className = 'debug-button';
    botao.innerHTML = '<i class="fas fa-search"></i> Verificar CedenteService';
    botao.title = 'Verificar disponibilidade do CedenteService';
    
    // Adicionar estilo ao botão
    botao.style.position = 'fixed';
    botao.style.bottom = '90px';
    botao.style.right = '10px';
    botao.style.padding = '5px 10px';
    botao.style.backgroundColor = '#f8f9fa';
    botao.style.border = '1px solid #dee2e6';
    botao.style.borderRadius = '4px';
    botao.style.cursor = 'pointer';
    botao.style.zIndex = '9999';
    
    // Adicionar evento de clique
    botao.addEventListener('click', verificarCedenteService);
    
    // Adicionar o botão ao documento
    document.body.appendChild(botao);
}

// Adicionar o botão de verificação após um tempo
setTimeout(adicionarBotaoVerificarCedenteService, 2500);