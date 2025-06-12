// Função para renderizar tabela
function renderizarTabela(propostasFiltradas, novasPropostasIds = []) {
    console.log('📋 Renderizando tabela...');
    
    const tbody = document.getElementById('propostas-body');
    if (!tbody) {
        console.error('Elemento tbody não encontrado');
        return;
    }
    
    // Limpar temporizadores existentes
    if (window.tempoRealTimers) {
        window.tempoRealTimers.forEach(timer => clearInterval(timer));
    }
    window.tempoRealTimers = [];
    
    // Limpar o corpo da tabela
    tbody.innerHTML = '';
    
    if (!Array.isArray(propostasFiltradas) || propostasFiltradas.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="11" class="no-data">Nenhuma proposta encontrada</td>`;
        tbody.appendChild(tr);
        return;
    }
    
    // Verificar se está no modo TV
    const isModoTV = document.body.classList.contains('tv-mode');
    const colSpan = isModoTV ? 10 : 11;
    
    // Adicionar cada proposta à tabela
    propostasFiltradas.forEach(p => {
        // Obter a classe de status
        const statusClass = window.getStatusClass ? window.getStatusClass(p.statusAtual) : '';
        
        // Criar a linha da tabela
        const tr = document.createElement('tr');
        if (statusClass) {
            tr.className = statusClass;
        }
        tr.setAttribute('data-id', p.id);
        tr.id = `proposta-${p.id}`;
        
        // Verificar se é uma nova proposta
        if (novasPropostasIds && novasPropostasIds.includes(p.id)) {
            tr.classList.add('nova-proposta');
        }
        
        // Verificar se há observações
        const temObservacoes = p.observacoes && p.observacoes.length > 0;
        
        // Encontrar a entrada de checagem
        const entradaChecagem = p.fluxoCompleto ? p.fluxoCompleto.find(f => f.STATUS_FLUXO === "CHECAGEM") : null;
        const horaChecagem = entradaChecagem ? entradaChecagem.DATA_HORA_ENTRADA : null;
        
        // Funções auxiliares para formatação
        const formatarHora = window.formatarHora || ((hora) => {
            if (!hora) return '--';
            return new Date(hora).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        });
        
        const formatarTempo = window.formatarTempo || ((min, destacarTempoReal = false, emTempoReal = false) => {
            if (!min && min !== 0) return '--';
            const horas = Math.floor(min / 60);
            const mins = min % 60;
            const texto = horas > 0 ? `${horas}h ${mins}m` : `${mins} min`;
            
            if (emTempoReal && destacarTempoReal) {
                return `<span class="tempo-real">${texto}</span>`;
            }
            return texto;
        });
        
        const formatarHoraTempo = window.formatarHoraTempo || ((hora, tempo, tempoOriginal) => {
            if (!hora) return '--';
            
            const horaFormatada = formatarHora(hora);
            if (!tempo && tempo !== 0) return horaFormatada;
            
            const tempoFormatado = formatarTempo(tempo);
            return `${horaFormatada}<br><small>(${tempoFormatado})</small>`;
        });
        
        // Criar ID único para tempo total (para atualização em tempo real)
        const tempoTotalId = `tempo-total-${p.id}`;
        
        // Calcular tempo até checagem
        const calcularTempoEmMinutos = window.calcularTempoEmMinutos || ((inicio, fim) => {
            if (!inicio || !fim) return null;
            return Math.floor((new Date(fim) - new Date(inicio)) / (1000 * 60));
        });
        
        const tempoAteChecagem = calcularTempoEmMinutos(p.horaEntrada, horaChecagem);
        
        // Construir HTML da linha
        let htmlCells = '';
        
        // Coluna Data (oculta no modo TV)
        if (!isModoTV) {
            htmlCells += `<td class="text-center tv-hide-column">${p.dataFormatada || '--'}</td>`;
        }
        
        // Demais colunas
        htmlCells += `
            <td class="text-center" id="${tempoTotalId}">${formatarTempo(p.tempoTotal, true, p.tempoEmTempoReal)}</td>
            <td class="text-center">${formatarHora(p.horaEntrada)}</td>
            <td class="text-center">${p.numero}</td>
            <td class="cedente-cell ${temObservacoes ? 'has-observations' : ''}" data-proposta-id="${p.id}">${p.cedente}</td>
            <td class="text-center">${formatarHoraTempo(p.horaAnalise, p.tempoAteAnalise, p.tempoAteAnaliseOriginal)}</td>
            <td class="text-center">${formatarHoraTempo(p.horaPendencia, p.tempoAnaliseAtePendencia, p.tempoAnaliseAtePendenciaOriginal)}</td>
            <td class="text-center">${formatarHoraTempo(horaChecagem, tempoAteChecagem, null)}</td>
            <td class="text-center">${formatarHoraTempo(p.horaCertifica, p.tempoEtapaAnteriorAteCertifica, p.tempoEtapaAnteriorAteCertificaOriginal)}</td>
            <td class="text-center">${formatarHoraTempo(p.horaPagamento, p.tempoCertificaAtePagamento, p.tempoCertificaAtePagamentoOriginal)}</td>
            <td class="text-center status-cell" data-proposta-id="${p.id}">${p.statusSimplificado}</td>
        `;
        
        tr.innerHTML = htmlCells;
        tbody.appendChild(tr);
        
        // Configurar timer para tempo real se necessário
        if (p.tempoEmTempoReal && p.horaEntrada) {
            const dataEntrada = new Date(p.horaEntrada);
            const timer = setInterval(() => {
                const agora = new Date();
                let tempoDecorrido = Math.floor((agora - dataEntrada) / (1000 * 60));
                
                // Aplicar desconto de horário de almoço se necessário
                const horaEntrada = dataEntrada.getHours();
                const entrouAntesDas13 = horaEntrada < 13;
                const horaAtual = agora.getHours();
                const minutoAtual = agora.getMinutes();
                const passouDas13 = horaAtual > 13 || (horaAtual === 13 && minutoAtual > 0);
                
                if (entrouAntesDas13 && passouDas13) {
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
    
    // Configurar event listeners após renderizar
    setTimeout(() => {
        configurarEventListenersTabela();
    }, 100);
    
    console.log(`📋 Tabela renderizada com ${propostasFiltradas.length} propostas`);
}

// Função para configurar event listeners da tabela
function configurarEventListenersTabela() {
    console.log('🎛️ Configurando event listeners da tabela...');
    
    // Event listeners para células de cedente (observações)
    document.querySelectorAll('.cedente-cell.has-observations').forEach(cell => {
        // Remover event listeners existentes para evitar duplicação
        const newCell = cell.cloneNode(true);
        cell.parentNode.replaceChild(newCell, cell);
        
        newCell.style.cursor = 'pointer';
        newCell.title = 'Clique para ver as observações';
        
        newCell.addEventListener('click', (e) => {
            e.stopPropagation();
            const propostaId = newCell.dataset.propostaId;
            const proposta = window.APP_STATE?.propostas?.find(p => p.id === propostaId);
            
            if (proposta && typeof window.mostrarObservacoes === 'function') {
                window.mostrarObservacoes(proposta);
            } else {
                console.error('Proposta não encontrada ou função mostrarObservacoes não disponível:', propostaId);
            }
        });
    });
    
    // Event listeners para células de status (histórico)
    document.querySelectorAll('.status-cell').forEach(cell => {
        // Remover event listeners existentes para evitar duplicação
        const newCell = cell.cloneNode(true);
        cell.parentNode.replaceChild(newCell, cell);
        
        newCell.style.cursor = 'pointer';
        newCell.title = 'Clique para ver o histórico de status';
        
        newCell.addEventListener('click', (e) => {
            e.stopPropagation();
            const propostaId = newCell.dataset.propostaId;
            const proposta = window.APP_STATE?.propostas?.find(p => p.id === propostaId);
            
            if (proposta && typeof window.mostrarHistoricoStatus === 'function') {
                window.mostrarHistoricoStatus(proposta);
            } else {
                console.error('Proposta não encontrada ou função mostrarHistoricoStatus não disponível:', propostaId);
            }
        });
    });
    
    console.log('✅ Event listeners da tabela configurados');
}

// Expor funções globalmente
window.renderizarTabela = renderizarTabela;
window.configurarEventListenersTabela = configurarEventListenersTabela;

console.log('✅ Table Renderer carregado');