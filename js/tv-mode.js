// Configurações globais do modo TV
const TV_MODE = {
    fontSizeMin: 12,
    fontSizeMax: 32,
    fontSizeStep: 2,
    fontSizeCurrent: 16,
    clockIntervalId: null
};

// Função para atualizar o tamanho da fonte
function atualizarTamanhoFonte(tamanho) {
    console.log(`Atualizando tamanho da fonte para ${tamanho}px`);
    
    // Atualizar a variável CSS
    document.documentElement.style.setProperty('--tv-font-size', `${tamanho}px`);
    
    // Atualizar o valor exibido
    const fontSizeValue = document.getElementById('font-size-value');
    if (fontSizeValue) {
        fontSizeValue.textContent = tamanho;
    }
    
    // Salvar a preferência
    localStorage.setItem('tv-font-size', tamanho);
}

// Função para atualizar o relógio do modo TV
function atualizarRelogioTV() {
    const agora = new Date();
    
    // Atualizar a data
    const dataElement = document.getElementById('tv-date');
    if (dataElement) {
        const dia = agora.getDate().toString().padStart(2, '0');
        const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
        const ano = agora.getFullYear();
        dataElement.textContent = `Data: ${dia}/${mes}/${ano}`;
    }
    
    // Atualizar a hora
    const horaElement = document.getElementById('tv-time');
    if (horaElement) {
        const hora = agora.getHours().toString().padStart(2, '0');
        const minuto = agora.getMinutes().toString().padStart(2, '0');
        const segundo = agora.getSeconds().toString().padStart(2, '0');
        horaElement.textContent = `Hora: ${hora}:${minuto}:${segundo}`;
    }
}

function aplicarClassesColunas() {
    const table = document.getElementById('propostas-table');
    if (!table) return;
    
    // Verificar se estamos no modo TV
    const isModoTV = document.body.classList.contains('tv-mode');
    
    // Primeiro, identificar os cabeçalhos
    const headers = table.querySelectorAll('thead th');
    let dataIndex = -1;
    let cedenteIndex = -1;
    let tempoTotalIndex = -1;
    let statusIndex = -1;
    
    headers.forEach((header, index) => {
        const text = header.textContent.trim().toLowerCase();
        
        if (text.includes('data')) {
            dataIndex = index;
            header.classList.add('data-column');
            // Se estiver no modo TV, esconder imediatamente
            if (isModoTV) {
                header.style.display = 'none';
            }
        } else if (text.includes('cedente')) {
            cedenteIndex = index;
            header.classList.add('cedente-column');
        } else if (text.includes('tempo total')) {
            tempoTotalIndex = index;
            header.classList.add('tempo-total-column');
        } else if (text === 'status') {
            statusIndex = index;
            header.classList.add('status-column');
        }
    });
    
    // Agora, aplicar as classes às células
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        
        if (dataIndex >= 0 && cells[dataIndex]) {
            cells[dataIndex].classList.add('data-column');
            // Se estiver no modo TV, esconder imediatamente
            if (isModoTV) {
                cells[dataIndex].style.display = 'none';
            }
        }
        
        if (cedenteIndex >= 0 && cells[cedenteIndex]) {
            cells[cedenteIndex].classList.add('cedente-column');
        }
        
        if (tempoTotalIndex >= 0 && cells[tempoTotalIndex]) {
            cells[tempoTotalIndex].classList.add('tempo-total-column');
        }
        
        if (statusIndex >= 0 && cells[statusIndex]) {
            cells[statusIndex].classList.add('status-column');
        }
    });
    
    console.log('Classes de colunas aplicadas:', {
        dataIndex,
        cedenteIndex,
        tempoTotalIndex,
        statusIndex,
        modoTV: isModoTV
    });
}

// Função para verificar se um tempo excedeu o limite
function verificarTempoExcedido(tempoTotal) {
    if (!tempoTotal) return false;
    
    const partes = tempoTotal.split(':');
    if (partes.length >= 2) {
        const horas = parseInt(partes[0]);
        const minutos = parseInt(partes[1]);
        
        // Verificar se o tempo é maior que 2:30
        return (horas > 2 || (horas === 2 && minutos >= 30));
    }
    
    return false;
}

// Função para formatar apenas células de tempo total com efeito pulsante quando excedido
function formatarTempoExcedido() {
    console.log('Formatando células de tempo excedido');
    
    const table = document.getElementById('propostas-table');
    if (!table) return;
    
    // Encontrar a coluna de tempo total
    const headers = table.querySelectorAll('thead th');
    let tempoTotalIndex = -1;
    
    headers.forEach((header, index) => {
        const text = header.textContent.trim().toLowerCase();
        if (text.includes('tempo total')) {
            tempoTotalIndex = index;
        }
    });
    
    if (tempoTotalIndex === -1) {
        console.log('Coluna de tempo total não encontrada');
        return;
    }
    
    // Processar cada célula de tempo total
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (tempoTotalIndex < cells.length) {
            const cell = cells[tempoTotalIndex];
            const tempoTotal = cell.textContent.trim();
            
            // Verificar se o tempo excedeu o limite
            if (verificarTempoExcedido(tempoTotal)) {
                // Remover qualquer formatação anterior
                if (cell.querySelector('.tempo-excedido')) {
                    cell.innerHTML = tempoTotal;
                }
                
                // Aplicar a classe para efeito pulsante apenas ao tempo total
                const span = document.createElement('span');
                span.className = 'tempo-excedido';
                span.textContent = tempoTotal;
                cell.innerHTML = '';
                cell.appendChild(span);
            } else {
                // Se não excedeu, garantir que não tenha a classe
                if (cell.querySelector('.tempo-excedido')) {
                    cell.innerHTML = tempoTotal;
                }
            }
        }
    });
}

// Modificar a função alternarModoTVAprimorado:
function alternarModoTVAprimorado() {
    console.log('Alternando modo TV aprimorado...');
    
    const ativandoModoTV = !document.body.classList.contains('tv-mode');
    document.body.classList.toggle('tv-mode');
    
    const botaoTV = document.getElementById('tv-mode-toggle');
    if (botaoTV) {
        if (document.body.classList.contains('tv-mode')) {
            botaoTV.innerHTML = '<i class="fas fa-desktop"></i> Modo Normal';
            
            // ATIVAR MODO TV INDEPENDENTE
            setTimeout(() => {
                buscarDadosModoTV();
                
                // Iniciar relógio
                atualizarRelogioTV();
                if (TV_MODE.clockIntervalId) {
                    clearInterval(TV_MODE.clockIntervalId);
                }
                TV_MODE.clockIntervalId = setInterval(atualizarRelogioTV, 1000);
                
                // INICIAR TIMER DE ATUALIZAÇÃO AUTOMÁTICA
                iniciarTimerModoTV();
            }, 100);
            
        } else {
            botaoTV.innerHTML = '<i class="fas fa-tv"></i> Modo TV';
            
            // DESATIVAR MODO TV
            // Parar relógio
            if (TV_MODE.clockIntervalId) {
                clearInterval(TV_MODE.clockIntervalId);
                TV_MODE.clockIntervalId = null;
            }
            
            // PARAR TIMER DE ATUALIZAÇÃO
            pararTimerModoTV();
            
            // Voltar ao modo normal
            setTimeout(() => {
                restaurarCabecalhoTabelaOriginal();
                // Forçar atualização do modo normal
                if (typeof atualizarInterface === 'function') {
                    atualizarInterface();
                }
            }, 100);
        }
    }
    
    // Salvar preferência
    const novoEstado = document.body.classList.contains('tv-mode') ? 'ativo' : 'inativo';
    localStorage.setItem('modo-tv', novoEstado);
}

// Função para inicializar o modo TV
function configurarModoTVAprimorado() {
    console.log('Configurando modo TV aprimorado...');
    
    // Verificar se o botão já existe
    let botaoTV = document.getElementById('tv-mode-toggle');
    if (!botaoTV) {
        botaoTV = document.createElement('button');
        botaoTV.id = 'tv-mode-toggle';
        botaoTV.className = 'tv-mode-toggle';
        botaoTV.title = 'Alternar modo TV';
        document.body.appendChild(botaoTV);
        console.log('Botão de modo TV criado');
    }
    
    // Verificar se há uma preferência salva
    const modoTVAtivo = localStorage.getItem('modo-tv') === 'ativo';
    
    // Aplicar o modo TV se estiver ativo
    if (modoTVAtivo) {
        document.body.classList.add('tv-mode');
        botaoTV.innerHTML = '<i class="fas fa-desktop"></i> Modo Normal';
        
        // Aplicar classes às colunas específicas, mas apenas se a tabela existir
        const table = document.getElementById('propostas-table');
        if (table) {
            // Adicionar classe à tabela
            table.classList.add('tv-mode-table');
            
            // Aplicar classes às colunas específicas
            const headers = table.querySelectorAll('thead th');
            let dataColumnFound = false;
            let cedenteColumnFound = false;
            
            headers.forEach((header, index) => {
                const text = header.textContent.trim().toLowerCase();
                
                if (text.includes('data')) {
                    dataColumnFound = true;
                    // Adicionar classe à coluna de data
                    header.classList.add('data-column');
                    
                    // Adicionar a mesma classe às células correspondentes
                    table.querySelectorAll(`tbody tr td:nth-child(${index + 1})`).forEach(cell => {
                        cell.classList.add('data-column');
                    });
                }
                
                if (text.includes('cedente')) {
                    cedenteColumnFound = true;
                    // Adicionar classe à coluna de cedente
                    header.classList.add('cedente-column');
                    
                    // Adicionar a mesma classe às células correspondentes
                    table.querySelectorAll(`tbody tr td:nth-child(${index + 1})`).forEach(cell => {
                        cell.classList.add('cedente-column');
                    });
                }
            });
            
            console.log('Colunas identificadas:', {
                dataColumnFound,
                cedenteColumnFound
            });
        }
    } else {
        botaoTV.innerHTML = '<i class="fas fa-tv"></i> Modo TV';
    }
    
    // Remover event listeners existentes
    const novoBtn = botaoTV.cloneNode(true);
    botaoTV.parentNode.replaceChild(novoBtn, botaoTV);
    botaoTV = novoBtn;
    
    // Adicionar novo event listener
    botaoTV.addEventListener('click', alternarModoTVAprimorado);
    
    // Configurar controles de tamanho de fonte
    const increaseBtn = document.getElementById('increase-font');
    const decreaseBtn = document.getElementById('decrease-font');
    const fontSizeValue = document.getElementById('font-size-value');
    
    if (increaseBtn && decreaseBtn && fontSizeValue) {
        // Carregar o tamanho da fonte salvo
        const savedFontSize = localStorage.getItem('tv-font-size');
        if (savedFontSize) {
            TV_MODE.fontSizeCurrent = parseInt(savedFontSize);
        }
        
        // Atualizar o valor exibido
        fontSizeValue.textContent = TV_MODE.fontSizeCurrent;
        
        // Aplicar o tamanho da fonte
        document.documentElement.style.setProperty('--tv-font-size', `${TV_MODE.fontSizeCurrent}px`);
        
        // Remover event listeners existentes
        const newIncreaseBtn = increaseBtn.cloneNode(true);
        const newDecreaseBtn = decreaseBtn.cloneNode(true);
        increaseBtn.parentNode.replaceChild(newIncreaseBtn, increaseBtn);
        decreaseBtn.parentNode.replaceChild(newDecreaseBtn, decreaseBtn);
        
        // Adicionar novos event listeners
        newIncreaseBtn.addEventListener('click', function() {
            console.log('Botão de aumentar fonte clicado');
            if (TV_MODE.fontSizeCurrent < TV_MODE.fontSizeMax) {
                TV_MODE.fontSizeCurrent += TV_MODE.fontSizeStep;
                atualizarTamanhoFonte(TV_MODE.fontSizeCurrent);
            }
        });
        
        newDecreaseBtn.addEventListener('click', function() {
            console.log('Botão de diminuir fonte clicado');
            if (TV_MODE.fontSizeCurrent > TV_MODE.fontSizeMin) {
                TV_MODE.fontSizeCurrent -= TV_MODE.fontSizeStep;
                atualizarTamanhoFonte(TV_MODE.fontSizeCurrent);
            }
        });
    } else {
        console.error('Controles de tamanho de fonte não encontrados');
    }
    
    // Inicializar o modo TV se estiver ativo
    if (modoTVAtivo) {
        // Ajustar a visibilidade do cabeçalho do modo TV
        const tvHeader = document.querySelector('.tv-mode-header');
        if (tvHeader) {
            tvHeader.style.display = 'flex';
        }
        
        // GARANTIR QUE O CABEÇALHO DA TABELA ESTEJA CORRETO
        setTimeout(() => {
            ajustarCabecalhoTabelaModoTV();
            aplicarClassesColunas();
        }, 500);
        
        // Iniciar o relógio
        atualizarRelogioTV();
        if (TV_MODE.clockIntervalId) {
            clearInterval(TV_MODE.clockIntervalId);
        }
        TV_MODE.clockIntervalId = setInterval(atualizarRelogioTV, 1000);
    }
    
    console.log('Modo TV aprimorado configurado');
}

// Modificar a inicialização do modo TV:
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que tudo foi carregado
    setTimeout(() => {
        configurarModoTVAprimorado();
        
        // Se o modo TV estiver ativo, garantir formatação correta
        if (document.body.classList.contains('tv-mode')) {
            setTimeout(() => {
                ajustarCabecalhoTabelaModoTV();
                aplicarClassesColunas();
            }, 500);
        }
    }, 200);
});


// Função específica para renderizar tabela no modo TV (sem coluna de data)
function renderizarTabelaModoTV(propostasFiltradas, novasPropostasIds = []) {
    console.log('Renderizando tabela no modo TV');
    
    // Verificar se as propostas já foram processadas corretamente
    propostasFiltradas.forEach(p => {
        if (!p.tempoEtapaAnteriorAteCertifica && p.horaCertifica) {
            console.warn(`Proposta ${p.numero} sem tempoEtapaAnteriorAteCertifica calculado`);
        }
    });
    
    const tbody = document.getElementById('propostas-body');
    if (!tbody) {
        console.error('Elemento tbody não encontrado');
        return;
    }
    
    // Garantir que o cabeçalho esteja correto para o modo TV
    ajustarCabecalhoTabelaModoTV();
    
    // Limpar o corpo da tabela
    tbody.innerHTML = '';
    
    if (propostasFiltradas.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="10" class="no-data">Nenhuma proposta encontrada</td>`; // 10 colunas (sem data)
        tbody.appendChild(tr);
        return;
    }
    
    // Limpar quaisquer temporizadores existentes
    if (window.tempoRealTimers) {
        window.tempoRealTimers.forEach(timer => clearInterval(timer));
    }
    window.tempoRealTimers = [];
    
    propostasFiltradas.forEach((p, index) => {
        const tr = document.createElement('tr');
        
        // Obter a classe de status e aplicar à linha
        const statusClass = getStatusClass(p.statusAtual);
        if (statusClass) {
            tr.className = statusClass;
        }
        
        tr.id = `proposta-${p.id}`;
        
        // Adiciona classe para animação se for uma nova proposta
        if (novasPropostasIds && novasPropostasIds.includes(p.id)) {
            tr.classList.add('new-row');
        }
        
        // Encontrar a entrada de checagem
        const entradaChecagem = p.fluxoCompleto ? p.fluxoCompleto.find(f => f.STATUS_FLUXO === "CHECAGEM") : null;
        const horaChecagem = entradaChecagem ? entradaChecagem.DATA_HORA_ENTRADA : null;
        const tempoAteChecagem = calcularTempoEmMinutos(p.horaEntrada, horaChecagem);
        
        // Criar um ID único para a célula de tempo total
        const tempoTotalId = `tempo-total-${p.id}`;
        
        // Verificar se há observações
        const temObservacoes = p.observacoes && p.observacoes.length > 0;
        const cedenteClass = temObservacoes ? 'has-observations' : '';
        const statusCellClass = 'status-cell';
        
        // RENDERIZAR SEM A COLUNA DE DATA - MODO TV
        tr.innerHTML = `
            <td class="text-center tempo-total-column" id="${tempoTotalId}">${formatarTempo(p.tempoTotal, true, p.tempoEmTempoReal)}</td>
            <td class="text-center">${formatarHora(p.horaEntrada)}</td>
            <td class="text-center">${p.numero}</td>
            <td class="text-center cedente-cell cedente-column ${cedenteClass}" data-proposta-id="${p.id}">${p.cedente}</td>
            <td class="text-center">${formatarHoraTempo(p.horaAnalise, p.tempoAteAnalise)}</td>
            <td class="text-center">${formatarHoraTempo(p.horaComite, p.tempoAnaliseAteComite)}</td>
            <td class="text-center">${formatarHoraTempo(horaChecagem, tempoAteChecagem)}</td>
            <td class="text-center">${formatarHoraTempo(p.horaCertifica, p.tempoComiteAteCertifica)}</td>
            <td class="text-center">${formatarHoraTempo(p.horaPagamento, p.tempoCertificaAtePagamento)}</td>
            <td class="text-center status-column ${statusCellClass}" data-proposta-id="${p.id}">${p.statusSimplificado}</td>
        `;
        
        tbody.appendChild(tr);
        
        // Configurar temporizador para tempo real se necessário
        if (p.tempoEmTempoReal && p.horaEntrada) {
            const dataEntrada = new Date(p.horaEntrada);
            const timer = setInterval(() => {
                const agora = new Date();
                let tempoDecorrido = Math.floor((agora - dataEntrada) / (1000 * 60));
                
                // Aplicar desconto de horário de almoço se necessário
                const horaEntrada = dataEntrada.getHours();
                const entrouAntesDas13 = horaEntrada < 13;
                const horaAtual = agora.getHours();
                const passouDas14 = horaAtual >= 14;
                
                if (entrouAntesDas13 && passouDas14) {
                    tempoDecorrido -= 60;
                }
                
                const tempoTotalCell = document.getElementById(tempoTotalId);
                if (tempoTotalCell) {
                    tempoTotalCell.innerHTML = formatarTempo(tempoDecorrido, true, true);
                }
            }, 60000);
            
            window.tempoRealTimers.push(timer);
        }
        
        // Adicionar event listeners após a renderização
        setTimeout(() => {
            // Event listener para a célula do cedente
            if (temObservacoes) {
                const cedenteCell = tbody.querySelector(`.cedente-cell[data-proposta-id="${p.id}"]`);
                if (cedenteCell) {
                    cedenteCell.addEventListener('click', (e) => {
                        e.stopPropagation();
                        mostrarObservacoes(p);
                    });
                }
            }
            
            // Event listener para a célula de status
            const statusCell = tbody.querySelector(`.status-cell[data-proposta-id="${p.id}"]`);
            if (statusCell) {
                statusCell.style.cursor = 'pointer';
                statusCell.title = 'Clique para ver o histórico de status';
                
                statusCell.addEventListener('click', (e) => {
                    e.stopPropagation();
                    mostrarHistoricoStatus(p);
                });
            }
        }, 0);
    });
    
    // Aplicar classes específicas do modo TV
    aplicarClassesColunas();
    
    console.log(`Tabela no modo TV renderizada com ${propostasFiltradas.length} propostas (sem coluna de data).`);
}

// Modificar a função ajustarCabecalhoTabelaModoTV para criar cabeçalho sem data
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
    
    // Criar um novo cabeçalho para o modo TV (SEM COLUNA DE DATA)
    const newHeaderHTML = `
        <tr class="tv-mode-header-row">
            <th class="sortable text-center tempo-total-column" data-sort="tempo_total">Tempo Total<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="hora_entrada">ENTRADA GER<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="numero">Nº<span class="sort-icon"></span></th>
            <th class="sortable text-center cedente-column" data-sort="cedente">Cedente<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="analise">ANALISTA AUTO<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="comite">COMITÊ<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="checagem">CHECAGEM<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="certificacao">QCERT.<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="pagamento">PAGO<span class="sort-icon"></span></th>
            <th class="sortable text-center status-column" data-sort="status">Status<span class="sort-icon"></span></th>
        </tr>
    `;
    
    thead.innerHTML = newHeaderHTML;
    
    // Reconfigurar a ordenação por clique nos cabeçalhos
    if (typeof configurarOrdenacaoPorCabecalho === 'function') {
        configurarOrdenacaoPorCabecalho();
    }
    
    console.log('Cabeçalho da tabela ajustado para o modo TV (sem coluna de data)');
}

// Modificar a função configurarModoTV para incluir a interceptação
function configurarModoTV() {
    console.log('Configurando modo TV...');
    
    // Verificar se o modo TV estava ativo
    const modoTVSalvo = localStorage.getItem('modo-tv');
    if (modoTVSalvo === 'ativo') {
        console.log('Ativando modo TV salvo');
        document.body.classList.add('tv-mode');
        
        // Aguardar um pouco para garantir que a tabela foi renderizada
        setTimeout(() => {
            ajustarCabecalhoTabelaModoTV();
            aplicarClassesColunas();
        }, 100);
    }
    
    // Configurar o botão de alternância
    const botaoTV = document.getElementById('tv-mode-toggle');
    if (botaoTV) {
        // Remover event listeners existentes
        const novoBotao = botaoTV.cloneNode(true);
        botaoTV.parentNode.replaceChild(novoBotao, botaoTV);
        
        // Adicionar novo event listener
        novoBotao.addEventListener('click', alternarModoTV);
        
        // Atualizar o texto do botão
        if (document.body.classList.contains('tv-mode')) {
            novoBotao.innerHTML = '<i class="fas fa-desktop"></i> Modo Normal';
        } else {
            novoBotao.innerHTML = '<i class="fas fa-tv"></i> Modo TV';
        }
    }
    
    console.log('Modo TV configurado');
}

// Expor funções para uso global
window.TV_MODE = TV_MODE;
window.alternarModoTVAprimorado = alternarModoTVAprimorado;
window.atualizarTamanhoFonte = atualizarTamanhoFonte;
window.atualizarRelogioTV = atualizarRelogioTV;
window.configurarModoTVAprimorado = configurarModoTVAprimorado;
window.formatarTempoExcedido = formatarTempoExcedido;

// Função para adicionar botão de verificação do modo TV (apenas para admins)
function adicionarBotaoVerificarModoTV() {
    // Verificar se o botão já existe
    if (document.getElementById('verificar-modo-tv-btn')) {
        return;
    }
    
    // Criar o botão
    const botao = document.createElement('button');
    botao.id = 'verificar-modo-tv-btn';
    botao.textContent = 'Verificar Modo TV';
    botao.className = 'debug-button admin-only';
    botao.style.position = 'fixed';
    botao.style.bottom = '100px';
    botao.style.right = '10px';
    botao.style.zIndex = '9999';
    botao.style.padding = '8px 12px';
    botao.style.backgroundColor = '#17a2b8';
    botao.style.color = 'white';
    botao.style.border = 'none';
    botao.style.borderRadius = '4px';
    botao.style.cursor = 'pointer';
    botao.style.fontSize = '12px';
    botao.style.display = 'none'; // Inicialmente oculto
    botao.style.visibility = 'hidden';
    
    // Adicionar event listener
    botao.addEventListener('click', function() {
        verificarEstadoModoTV();
    });
    
    // Adicionar o botão ao body
    document.body.appendChild(botao);
    
    console.log('Botão de verificar modo TV adicionado (oculto por padrão)');
}

// Função para verificar o estado do modo TV (debug)
function verificarEstadoModoTV() {
    const isModoTV = document.body.classList.contains('tv-mode');
    const tvHeader = document.querySelector('.tv-mode-header');
    const tvToggleBtn = document.getElementById('tv-mode-toggle');
    const table = document.getElementById('propostas-table');
    
    const info = {
        'Modo TV Ativo': isModoTV,
        'Cabeçalho TV Visível': tvHeader ? tvHeader.style.display !== 'none' : false,
        'Botão Toggle Existe': !!tvToggleBtn,
        'Texto do Botão': tvToggleBtn ? tvToggleBtn.textContent : 'N/A',
        'Tabela tem classe TV': table ? table.classList.contains('tv-mode-table') : false,
        'Colunas de Data Ocultas': document.querySelectorAll('.data-column[style*="display: none"]').length,
        'Relógio Ativo': !!TV_MODE.clockIntervalId,
        'Tamanho da Fonte': TV_MODE.fontSizeCurrent,
        'Preferência Salva': localStorage.getItem('modo-tv')
    };
    
    console.table(info);
    
    // Mostrar em um alert também
    const infoText = Object.entries(info)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    
    alert(`Estado do Modo TV:\n\n${infoText}`);
}

// Inicializar o botão quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que outros scripts foram carregados
    setTimeout(() => {
        adicionarBotaoVerificarModoTV();
    }, 1000);
});

// Função específica para buscar dados no modo TV
async function buscarDadosModoTV() {
    console.log('🖥️ Buscando dados específicos para modo TV...');
    
    if (!window.APP_STATE) {
        console.error('APP_STATE não disponível');
        return;
    }
    
    try {
        // Usar os dados já carregados
        const propostas = window.APP_STATE.propostas || [];
        console.log(`📊 [TV] Processando ${propostas.length} propostas`);
        
        // Filtrar e ordenar (usando as funções normais que já funcionam)
        const propostasFiltradas = window.filtrarPropostas ? window.filtrarPropostas() : propostas;
        const propostasOrdenadas = ordenarPropostasModoTV(propostasFiltradas);
        
        // Renderizar especificamente para modo TV
        renderizarTabelaModoTVEspecifica(propostasOrdenadas);
        
        console.log(`✅ [TV] Modo TV atualizado com ${propostasOrdenadas.length} propostas`);
        
    } catch (error) {
        console.error('❌ [TV] Erro ao buscar dados para modo TV:', error);
    }
}

// Função para filtrar propostas no modo TV
function filtrarPropostasModoTV(propostas) {
    if (!Array.isArray(propostas)) return [];
    
    // Usar os mesmos filtros do modo normal
    const statusFiltro = document.getElementById('status-filter')?.value || 'todos';
    const cedenteFiltro = document.getElementById('cedente-filter')?.value?.toLowerCase() || '';
    const usuarioFiltro = document.getElementById('usuario-filter')?.value || 'todos';
    
    return propostas.filter(proposta => {
        // Filtro de status
        const passaFiltroStatus = statusFiltro === 'todos' || 
            proposta.statusAtual === statusFiltro || 
            proposta.statusSimplificado === statusFiltro;
        
        // Filtro de cedente
        const passaFiltroCedente = cedenteFiltro === '' || 
            proposta.cedente.toLowerCase().includes(cedenteFiltro);
        
        // Filtro de usuário
        let passaFiltroUsuario = true;
        if (usuarioFiltro !== 'todos' && window.CedenteService && 
            typeof window.CedenteService.cedenteAssociadoAoUsuario === 'function') {
            passaFiltroUsuario = window.CedenteService.cedenteAssociadoAoUsuario(proposta.cedente, usuarioFiltro);
        }
        
        return passaFiltroStatus && passaFiltroCedente && passaFiltroUsuario;
    });
}

// Modificar a função ordenarPropostasModoTV para SEMPRE usar ordenação por status:
function ordenarPropostasModoTV(propostas) {
    if (!Array.isArray(propostas)) return [];
    
    console.log('🖥️ [TV] Forçando ordenação por status (início para fim)');
    
    // SEMPRE usar ordenação por status no modo TV
    const propostasOrdenadas = [...propostas];
    
    // Ordenar por peso do status (início para fim do fluxo)
    propostasOrdenadas.sort((a, b) => {
        // Usar o peso do status para ordenar do início ao fim do processo
        const pesoA = a.pesoStatus || getPesoStatus(a.statusSimplificado) || 0;
        const pesoB = b.pesoStatus || getPesoStatus(b.statusSimplificado) || 0;
        
        // Ordenação crescente (início para fim)
        return pesoA - pesoB;
    });
    
    console.log(`✅ [TV] Propostas ordenadas por status: ${propostasOrdenadas.length} itens`);
    
    return propostasOrdenadas;
}

// Função de renderização completamente independente para modo TV
function renderizarTabelaModoTVEspecifica(propostas) {
    console.log('🖥️ Renderizando tabela específica do modo TV');
    
    const tbody = document.getElementById('propostas-body');
    if (!tbody) {
        console.error('Elemento tbody não encontrado');
        return;
    }
    
    // Garantir cabeçalho correto
    ajustarCabecalhoTabelaModoTV();
    
    // Limpar tabela
    tbody.innerHTML = '';
    
    if (!Array.isArray(propostas) || propostas.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="10" class="no-data">Nenhuma proposta encontrada</td>`;
        tbody.appendChild(tr);
        return;
    }
    
    // Limpar temporizadores existentes
    if (window.tempoRealTimers) {
        window.tempoRealTimers.forEach(timer => clearInterval(timer));
    }
    window.tempoRealTimers = [];
    
    propostas.forEach(p => {
        const tr = document.createElement('tr');
        
        // Aplicar classe de status
        const statusClass = getStatusClass ? getStatusClass(p.statusAtual) : '';
        if (statusClass) {
            tr.className = statusClass;
        }
        
        tr.id = `proposta-${p.id}`;
        
        // Calcular dados necessários
        const entradaChecagem = p.fluxoCompleto ? 
            p.fluxoCompleto.find(f => f.STATUS_FLUXO === "CHECAGEM") : null;
        const horaChecagem = entradaChecagem ? entradaChecagem.DATA_HORA_ENTRADA : null;
        const tempoAteChecagem = horaChecagem ? 
            calcularTempoEmMinutos(p.horaEntrada, horaChecagem) : null;
        
        // GARANTIR que tempoEtapaAnteriorAteCertifica existe
        if (p.horaCertifica && !p.tempoEtapaAnteriorAteCertifica) {
            if (p.horaPendencia) {
                p.tempoEtapaAnteriorAteCertifica = calcularTempoEmMinutos(p.horaPendencia, p.horaCertifica);
            } else if (p.horaAnalise) {
                p.tempoEtapaAnteriorAteCertifica = calcularTempoEmMinutos(p.horaAnalise, p.horaCertifica);
            } else {
                p.tempoEtapaAnteriorAteCertifica = calcularTempoEmMinutos(p.horaEntrada, p.horaCertifica);
            }
        }
        
        // Verificar observações
        const temObservacoes = p.observacoes && p.observacoes.length > 0;
        const cedenteClass = temObservacoes ? 'has-observations' : '';
        
        // ID único para tempo total
        const tempoTotalId = `tempo-total-${p.id}`;
        
        // Renderizar linha (SEM COLUNA DE DATA)
        tr.innerHTML = `
            <td class="text-center" id="${tempoTotalId}">${formatarTempo(p.tempoTotal, true, p.tempoEmTempoReal)}</td>
            <td class="text-center">${formatarHora(p.horaEntrada)}</td>
            <td class="text-center">${p.numero}</td>
            <td class="text-center cedente-cell ${cedenteClass}" data-proposta-id="${p.id}">${p.cedente}</td>
            <td class="text-center">${formatarHoraTempoTV(p.horaAnalise, p.tempoAteAnalise)}</td>
            <td class="text-center">${formatarHoraTempoTV(p.horaPendencia, p.tempoAnaliseAtePendencia)}</td>
            <td class="text-center">${formatarHoraTempoTV(horaChecagem, tempoAteChecagem)}</td>
            <td class="text-center">${formatarHoraTempoTV(p.horaCertifica, p.tempoEtapaAnteriorAteCertifica)}</td>
            <td class="text-center">${formatarHoraTempoTV(p.horaPagamento, p.tempoCertificaAtePagamento)}</td>
            <td class="text-center status-cell" data-proposta-id="${p.id}">${p.statusSimplificado}</td>
        `;
        
        tbody.appendChild(tr);
        
        // Configurar timer para tempo real
        if (p.tempoEmTempoReal && p.horaEntrada) {
            const dataEntrada = new Date(p.horaEntrada);
            const timer = setInterval(() => {
                const agora = new Date();
                let tempoDecorrido = Math.floor((agora - dataEntrada) / (1000 * 60));
                
                // Aplicar desconto de almoço se necessário
                const horaEntrada = dataEntrada.getHours();
                const entrouAntesDas13 = horaEntrada < 13;
                const horaAtual = agora.getHours();
                const passouDas14 = horaAtual >= 14;
                
                if (entrouAntesDas13 && passouDas14) {
                    tempoDecorrido -= 60;
                }
                
                const tempoTotalCell = document.getElementById(tempoTotalId);
                if (tempoTotalCell) {
                    tempoTotalCell.innerHTML = formatarTempo(tempoDecorrido, true, true);
                }
            }, 60000);
            
            window.tempoRealTimers.push(timer);
        }
    });
    
    // Configurar event listeners
    configurarEventListenersModoTV();
    
    console.log(`✅ Tabela modo TV renderizada com ${propostas.length} propostas`);
}

// Função específica para formatar hora e tempo no modo TV
function formatarHoraTempoTV(hora, tempo) {
    if (!hora) return '--';
    
    const horaFormatada = formatarHora(hora);
    if (!tempo) return horaFormatada;
    
    return `${horaFormatada} (${formatarTempo(tempo)})`;
}

// Event listeners específicos para modo TV
function configurarEventListenersModoTV() {
    // Observações
    document.querySelectorAll('.cedente-cell.has-observations').forEach(cell => {
        cell.style.cursor = 'pointer';
        cell.title = 'Clique para ver as observações';
        
        cell.addEventListener('click', (e) => {
            e.stopPropagation();
            const propostaId = cell.dataset.propostaId;
            const proposta = window.APP_STATE.propostas.find(p => p.id === propostaId);
            if (proposta && typeof mostrarObservacoes === 'function') {
                mostrarObservacoes(proposta);
            }
        });
    });
    
    // Status
    document.querySelectorAll('.status-cell').forEach(cell => {
        cell.style.cursor = 'pointer';
        cell.title = 'Clique para ver o histórico de status';
        
        cell.addEventListener('click', (e) => {
            e.stopPropagation();
            const propostaId = cell.dataset.propostaId;
            const proposta = window.APP_STATE.propostas.find(p => p.id === propostaId);
            if (proposta && typeof mostrarHistoricoStatus === 'function') {
                mostrarHistoricoStatus(proposta);
            }
        });
    });
}

// Timer específico para modo TV
let timerAtualizacaoModoTV = null;

// Iniciar timer de atualização para modo TV
function iniciarTimerModoTV() {
    // Parar timer existente se houver
    if (timerAtualizacaoModoTV) {
        clearInterval(timerAtualizacaoModoTV);
    }
    
    // Atualizar a cada 30 segundos no modo TV
    timerAtualizacaoModoTV = setInterval(() => {
        if (document.body.classList.contains('tv-mode')) {
            console.log('🔄 Atualização automática do modo TV');
            buscarDadosModoTV();
        } else {
            // Se não estiver mais no modo TV, parar o timer
            pararTimerModoTV();
        }
    }, 30000); // 30 segundos
    
    console.log('⏰ Timer de atualização do modo TV iniciado');
}

// Parar timer do modo TV
function pararTimerModoTV() {
    if (timerAtualizacaoModoTV) {
        clearInterval(timerAtualizacaoModoTV);
        timerAtualizacaoModoTV = null;
        console.log('⏰ Timer de atualização do modo TV parado');
    }
}

// Escutar mudanças nos filtros quando estiver no modo TV
function configurarFiltrosModoTV() {
    const statusFilter = document.getElementById('status-filter');
    const cedenteFilter = document.getElementById('cedente-filter');
    const usuarioFilter = document.getElementById('usuario-filter');
    
    [statusFilter, cedenteFilter, usuarioFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', () => {
                if (document.body.classList.contains('tv-mode')) {
                    console.log('🔄 Filtro alterado no modo TV - atualizando');
                    setTimeout(() => {
                        buscarDadosModoTV();
                    }, 100);
                }
            });
        }
    });
}

// Chamar na inicialização
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        configurarFiltrosModoTV();
    }, 500);
});

// Modificar a inicialização:
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        configurarModoTVAprimorado();
        
        // Se o modo TV estiver ativo ao carregar a página
        if (document.body.classList.contains('tv-mode')) {
            console.log('🖥️ Página carregada no modo TV - inicializando lógica independente');
            
            setTimeout(() => {
                buscarDadosModoTV();
                
                // Iniciar relógio
                atualizarRelogioTV();
                if (TV_MODE.clockIntervalId) {
                    clearInterval(TV_MODE.clockIntervalId);
                }
                TV_MODE.clockIntervalId = setInterval(atualizarRelogioTV, 1000);
                
                // Iniciar timer de atualização
                iniciarTimerModoTV();
            }, 1000);
        }
    }, 200);
});

// Limpar timers ao sair da página
window.addEventListener('beforeunload', function() {
    pararTimerModoTV();
    if (TV_MODE.clockIntervalId) {
        clearInterval(TV_MODE.clockIntervalId);
    }
});

