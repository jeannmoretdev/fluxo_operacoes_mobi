// Função para ajustar o cabeçalho da tabela no modo TV
function ajustarCabecalhoTabelaModoTV() {
    const thead = document.querySelector('#propostas-table thead');
    if (!thead) {
        console.error('Cabeçalho da tabela não encontrado');
        return;
    }
    
    const headerRow = thead.querySelector('tr');
    if (!headerRow) {
        console.error('Linha do cabeçalho não encontrada');
        return;
    }
    
    // Verificar se já está no formato do modo TV
    if (headerRow.classList.contains('tv-mode-header-row')) {
        console.log('Cabeçalho já está no formato do modo TV');
        return;
    }
    
    // Salvar o cabeçalho original se ainda não foi salvo
    if (!thead.getAttribute('data-original-html')) {
        thead.setAttribute('data-original-html', thead.innerHTML);
    }
    
    // Criar novo cabeçalho para o modo TV (sem coluna Data)
    const newHeaderHTML = `
        <tr class="tv-mode-header-row">
            <th class="sortable text-center" data-sort="tempo_total">Tempo Total<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="hora_entrada">ENTRADA GER<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="numero">Nº<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="cedente">Cedente<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="analise">ANALISTA AUTO<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="pendencia">PENDÊNCIA<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="checagem">CHECAGEM<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="certificacao" title="Tempo desde a última etapa até a Certificação">QCERT.<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="pagamento">PAGO<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="status">Status<span class="sort-icon"></span></th>
        </tr>
    `;
    
    thead.innerHTML = newHeaderHTML;
    
    // Reconfigurar a ordenação por clique nos cabeçalhos
    setTimeout(() => {
        if (typeof window.configurarOrdenacaoPorCabecalho === 'function') {
            window.configurarOrdenacaoPorCabecalho();
        }
    }, 100);
    
    console.log('✅ Cabeçalho da tabela ajustado para o modo TV');
}

// Função para restaurar o cabeçalho original da tabela
function restaurarCabecalhoTabelaOriginal() {
    const thead = document.querySelector('#propostas-table thead');
    if (!thead) {
        console.error('Cabeçalho da tabela não encontrado');
        return;
    }
    
    // Restaurar o cabeçalho original se foi salvo
    const originalHTML = thead.getAttribute('data-original-html');
    if (originalHTML) {
        thead.innerHTML = originalHTML;
        
        // Reconfigurar a ordenação por clique nos cabeçalhos
        setTimeout(() => {
            if (typeof window.configurarOrdenacaoPorCabecalho === 'function') {
                window.configurarOrdenacaoPorCabecalho();
            }
        }, 100);
        
        console.log('✅ Cabeçalho da tabela restaurado para o modo normal');
    }
}

// Função para alternar o modo TV
function alternarModoTV() {
    console.log('Botão de modo TV clicado');
    document.body.classList.toggle('tv-mode');
    
    // Atualizar o texto do botão
    const botaoTV = document.getElementById('tv-mode-toggle');
    if (botaoTV) {
        if (document.body.classList.contains('tv-mode')) {
            botaoTV.innerHTML = '<i class="fas fa-desktop"></i> Modo Normal';
            ajustarCabecalhoTabelaModoTV();
        } else {
            botaoTV.innerHTML = '<i class="fas fa-tv"></i> Modo TV';
            restaurarCabecalhoTabelaOriginal();
        }
    }
    
    // Salvar a preferência
    const novoEstado = document.body.classList.contains('tv-mode') ? 'ativo' : 'inativo';
    localStorage.setItem('modo-tv', novoEstado);
    
    // Forçar um redimensionamento da tabela
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        
        // Re-renderizar a tabela se necessário
        if (typeof filtrarPropostas === 'function' && typeof ordenarPropostas === 'function') {
            const propostasFiltradas = filtrarPropostas();
            const propostasOrdenadas = ordenarPropostas(propostasFiltradas);
            
            if (document.body.classList.contains('tv-mode') && typeof renderizarTabelaModoTV === 'function') {
                renderizarTabelaModoTV(propostasOrdenadas);
            } else if (typeof renderizarTabela === 'function') {
                renderizarTabela(propostasOrdenadas);
            }
        }
    }, 100);
}

// Função para configurar o modo TV
function configurarModoTV() {
    console.log('📺 Configurando modo TV...');
    
    // Verificar se o botão já existe
    let botaoTV = document.getElementById('tv-mode-toggle');
    if (!botaoTV) {
        console.warn('Botão de modo TV não encontrado, criando...');
        botaoTV = document.createElement('button');
        botaoTV.id = 'tv-mode-toggle';
        botaoTV.className = 'tv-mode-toggle';
        document.body.appendChild(botaoTV);
    }
    
    // Verificar se o modo TV já está ativo
    const modoTVAtivo = localStorage.getItem('modo-tv') === 'ativo';
    if (modoTVAtivo) {
        document.body.classList.add('tv-mode');
        botaoTV.innerHTML = '<i class="fas fa-desktop"></i> Modo Normal';
    } else {
        botaoTV.innerHTML = '<i class="fas fa-tv"></i> Modo TV';
    }
    
    // Remover event listeners existentes
    const novoBotaoTV = botaoTV.cloneNode(true);
    botaoTV.parentNode.replaceChild(novoBotaoTV, botaoTV);
    
    // Adicionar novo event listener
    novoBotaoTV.addEventListener('click', function() {
        console.log('📺 Alternando modo TV...');
        
        document.body.classList.toggle('tv-mode');
        
        // Atualizar texto do botão
        if (document.body.classList.contains('tv-mode')) {
            this.innerHTML = '<i class="fas fa-desktop"></i> Modo Normal';
            localStorage.setItem('modo-tv', 'ativo');
        } else {
            this.innerHTML = '<i class="fas fa-tv"></i> Modo TV';
            localStorage.setItem('modo-tv', 'inativo');
        }
        
        // Ajustar cabeçalho da tabela
        if (document.body.classList.contains('tv-mode')) {
            ajustarCabecalhoTabelaModoTV();
        } else {
            restaurarCabecalhoTabelaOriginal();
        }
        
        // Forçar redimensionamento
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            
            // Re-renderizar tabela se necessário
            if (typeof window.aplicarFiltrosEOrdenacao === 'function') {
                window.aplicarFiltrosEOrdenacao();
            }
        }, 100);
    });
    
    // Configurar controles de fonte
    configurarControlesFonte();
    
    // Configurar relógio do modo TV
    configurarRelogioModoTV();
    
    console.log('✅ Modo TV configurado');
}

// Função para configurar controles de fonte
function configurarControlesFonte() {
    const increaseBtn = document.getElementById('increase-font');
    const decreaseBtn = document.getElementById('decrease-font');
    const fontSizeValue = document.getElementById('font-size-value');
    
    if (!increaseBtn || !decreaseBtn || !fontSizeValue) {
        console.warn('Controles de fonte não encontrados');
        return;
    }
    
    // Carregar tamanho da fonte salvo
    let currentFontSize = parseInt(localStorage.getItem('tv-font-size') || '16');
    fontSizeValue.textContent = currentFontSize;
    document.documentElement.style.setProperty('--tv-font-size', `${currentFontSize}px`);
    
    // Remover event listeners existentes
    const newIncreaseBtn = increaseBtn.cloneNode(true);
    const newDecreaseBtn = decreaseBtn.cloneNode(true);
    increaseBtn.parentNode.replaceChild(newIncreaseBtn, increaseBtn);
    decreaseBtn.parentNode.replaceChild(newDecreaseBtn, decreaseBtn);
    
    // Adicionar novos event listeners
    newIncreaseBtn.addEventListener('click', function() {
        console.log('📺 Aumentando fonte...');
        if (currentFontSize < 32) {
            currentFontSize += 2;
            fontSizeValue.textContent = currentFontSize;
            document.documentElement.style.setProperty('--tv-font-size', `${currentFontSize}px`);
            localStorage.setItem('tv-font-size', currentFontSize);
        }
    });
    
    newDecreaseBtn.addEventListener('click', function() {
        console.log('📺 Diminuindo fonte...');
        if (currentFontSize > 12) {
            currentFontSize -= 2;
            fontSizeValue.textContent = currentFontSize;
            document.documentElement.style.setProperty('--tv-font-size', `${currentFontSize}px`);
            localStorage.setItem('tv-font-size', currentFontSize);
        }
    });
    
    console.log('✅ Controles de fonte configurados');
}

// Função para configurar relógio do modo TV
function configurarRelogioModoTV() {
    const tvDate = document.getElementById('tv-date');
    const tvTime = document.getElementById('tv-time');
    
    if (!tvDate || !tvTime) {
        console.warn('Elementos de data/hora do modo TV não encontrados');
        return;
    }
    
    function atualizarRelogio() {
        const agora = new Date();
        
        // Atualizar data
        const dataFormatada = agora.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        tvDate.textContent = `Data: ${dataFormatada}`;
        
        // Atualizar hora
        const horaFormatada = agora.toLocaleTimeString('pt-BR');
        tvTime.textContent = `Hora: ${horaFormatada}`;
    }
    
    // Atualizar imediatamente
    atualizarRelogio();
    
    // Atualizar a cada segundo
    setInterval(atualizarRelogio, 1000);
    
    console.log('✅ Relógio do modo TV configurado');
}

// Expor funções globalmente
window.configurarModoTV = configurarModoTV;
window.ajustarCabecalhoTabelaModoTV = ajustarCabecalhoTabelaModoTV;
window.restaurarCabecalhoTabelaOriginal = restaurarCabecalhoTabelaOriginal;

console.log('✅ TV Mode carregado');