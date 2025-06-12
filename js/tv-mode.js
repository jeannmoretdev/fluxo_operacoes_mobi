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

// Função para alternar o modo TV com funcionalidades aprimoradas
function alternarModoTVAprimorado() {
    console.log('Alternando modo TV aprimorado...');
    
    const ativandoModoTV = !document.body.classList.contains('tv-mode');
    document.body.classList.toggle('tv-mode');
    
    // Atualizar o texto do botão
    const botaoTV = document.getElementById('tv-mode-toggle');
    if (botaoTV) {
        if (document.body.classList.contains('tv-mode')) {
            botaoTV.innerHTML = '<i class="fas fa-desktop"></i> Modo Normal';
            
            // Iniciar o relógio se não estiver rodando
            atualizarRelogioTV();
            if (TV_MODE.clockIntervalId) {
                clearInterval(TV_MODE.clockIntervalId);
            }
            TV_MODE.clockIntervalId = setInterval(atualizarRelogioTV, 1000);
        } else {
            botaoTV.innerHTML = '<i class="fas fa-tv"></i> Modo TV';
            
            // Parar o relógio se estiver rodando
            if (TV_MODE.clockIntervalId) {
                clearInterval(TV_MODE.clockIntervalId);
                TV_MODE.clockIntervalId = null;
            }
        }
    }
    
    // Salvar a preferência
    const novoEstado = document.body.classList.contains('tv-mode') ? 'ativo' : 'inativo';
    localStorage.setItem('modo-tv', novoEstado);
    
    // Ajustar a visibilidade do cabeçalho do modo TV
    const tvHeader = document.querySelector('.tv-mode-header');
    if (tvHeader) {
        tvHeader.style.display = ativandoModoTV ? 'flex' : 'none';
    }
    
    // Ajustar o tamanho das colunas da tabela
    const table = document.getElementById('propostas-table');
    if (table) {
        if (ativandoModoTV) {
            // Aplicar classes específicas para o modo TV
            table.classList.add('tv-mode-table');
            
            // Aplicar classes às colunas específicas
            const headers = table.querySelectorAll('thead th');
            headers.forEach((header, index) => {
                const text = header.textContent.trim().toLowerCase();
                
                if (text.includes('data')) {
                    // Adicionar classe à coluna de data
                    header.classList.add('data-column');
                    
                    // Adicionar a mesma classe às células correspondentes
                    table.querySelectorAll(`tbody tr td:nth-child(${index + 1})`).forEach(cell => {
                        cell.classList.add('data-column');
                    });
                }
                
                if (text.includes('cedente')) {
                    // Adicionar classe à coluna de cedente
                    header.classList.add('cedente-column');
                    
                    // Adicionar a mesma classe às células correspondentes
                    table.querySelectorAll(`tbody tr td:nth-child(${index + 1})`).forEach(cell => {
                        cell.classList.add('cedente-column');
                    });
                }
            });
        } else {
            // Remover classes específicas do modo TV
            table.classList.remove('tv-mode-table');
            
            // Remover classes específicas das colunas
            table.querySelectorAll('.data-column, .cedente-column').forEach(cell => {
                cell.classList.remove('data-column', 'cedente-column');
            });
        }
    }
    
    // Não chamar nenhuma função adicional que possa estar causando problemas
    // Apenas forçar um redimensionamento simples
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 100);
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
        
        // Iniciar o relógio
        atualizarRelogioTV();
        if (TV_MODE.clockIntervalId) {
            clearInterval(TV_MODE.clockIntervalId);
        }
        TV_MODE.clockIntervalId = setInterval(atualizarRelogioTV, 1000);
    }
    
    console.log('Modo TV aprimorado configurado');
}

// Inicializar o modo TV quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o cabeçalho do modo TV existe, se não, criá-lo
    if (!document.querySelector('.tv-mode-header')) {
        const tvHeader = document.createElement('div');
        tvHeader.className = 'tv-mode-header';
        tvHeader.innerHTML = `
            <div class="tv-date-time">
                <div class="tv-date" id="tv-date">Data: --/--/----</div>
                <div class="tv-time" id="tv-time">Hora: --:--:--</div>
            </div>
            <div class="tv-font-controls">
                <span class="tv-font-size-label">Tamanho da fonte:</span>
                <button class="tv-font-button" id="decrease-font">-</button>
                <span class="tv-font-size-value" id="font-size-value">16</span>
                <button class="tv-font-button" id="increase-font">+</button>
            </div>
        `;
        
        // Inserir após o header
        const header = document.querySelector('header');
        if (header && header.nextSibling) {
            header.parentNode.insertBefore(tvHeader, header.nextSibling);
        } else {
            // Inserir no início do container se não encontrar o header
            const container = document.querySelector('.container');
            if (container && container.firstChild) {
                container.insertBefore(tvHeader, container.firstChild);
            } else {
                // Último recurso: adicionar ao body
                document.body.insertBefore(tvHeader, document.body.firstChild);
            }
        }
        
        console.log('Cabeçalho do modo TV criado');
    }
    
    // Configurar o modo TV
    configurarModoTVAprimorado();
});

// Função para interceptar e modificar a renderização da tabela no modo TV
function interceptarRenderizacaoTabela() {
    // Salvar a função original de renderização
    if (!window.renderizarTabelaOriginal) {
        window.renderizarTabelaOriginal = window.renderizarTabela;
    }
    
    // Substituir a função de renderização
    window.renderizarTabela = function(propostasFiltradas, novasPropostasIds = []) {
        console.log('Renderização interceptada - Modo TV:', document.body.classList.contains('tv-mode'));
        
        // Se estiver no modo TV, usar renderização específica
        if (document.body.classList.contains('tv-mode')) {
            renderizarTabelaModoTV(propostasFiltradas, novasPropostasIds);
        } else {
            // Usar renderização original
            window.renderizarTabelaOriginal(propostasFiltradas, novasPropostasIds);
        }
    };
}

// Função específica para renderizar tabela no modo TV (sem coluna de data)
function renderizarTabelaModoTV(propostasFiltradas, novasPropostasIds = []) {
    console.log('Renderizando tabela no modo TV');
    
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
    
    // Interceptar a renderização da tabela
    interceptarRenderizacaoTabela();
    
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
