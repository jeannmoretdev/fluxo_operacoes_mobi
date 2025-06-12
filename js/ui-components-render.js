// Função para renderizar tabela - CORRIGIDA
function renderizarTabela(propostasFiltradas, novasPropostasIds = []) {
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
    
    if (propostasFiltradas.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="11" class="no-data">Nenhuma proposta encontrada</td>`;
        tbody.appendChild(tr);
        return;
    }
    
    // Adicionar cada proposta à tabela
    propostasFiltradas.forEach(p => {
        // Obter a classe de status
        const statusClass = getStatusClass(p.statusAtual);
        
        // Criar a linha da tabela
        const tr = document.createElement('tr');
        tr.className = statusClass;
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
        const tempoAteChecagem = calcularTempoEmMinutos(p.horaEntrada, horaChecagem);
        
        // Criar ID único para tempo total (para atualização em tempo real)
        const tempoTotalId = `tempo-total-${p.id}`;
        
        // Adicionar células à linha - USANDO formatarHoraTempo corrigida
        tr.innerHTML = `
            <td class="text-center tv-hide-column">${p.dataFormatada}</td>
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
        
        // Adicionar a linha à tabela
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
    
    // CONFIGURAR EVENT LISTENERS APÓS RENDERIZAR A TABELA
    configurarEventListenersTabela();
    
    console.log(`Tabela renderizada com ${propostasFiltradas.length} propostas.`);
}

// Abordagem alternativa para renderizar a tabela no modo TV - Continuação
function renderizarTabelaModoTV(propostasFiltradas, novasPropostasIds = []) {
    const tbody = document.getElementById('propostas-body');
    if (!tbody) {
        console.error('Elemento tbody não encontrado');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (propostasFiltradas.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="10" class="no-data">Nenhuma proposta encontrada</td>`;
        tbody.appendChild(tr);
        return;
    }
    
    // Limpar quaisquer temporizadores existentes
    if (window.tempoRealTimers) {
        window.tempoRealTimers.forEach(timer => clearInterval(timer));
    }
    window.tempoRealTimers = [];
    
    console.log('Renderizando tabela no modo TV');
    
    propostasFiltradas.forEach(p => {
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
        
        // Encontrar a entrada de checagem (status "CHECAGEM")
        const entradaChecagem = p.fluxoCompleto ? p.fluxoCompleto.find(f => f.STATUS_FLUXO === "CHECAGEM") : null;
        const horaChecagem = entradaChecagem ? entradaChecagem.DATA_HORA_ENTRADA : null;
        
        // Calcular o tempo até checagem (da entrada até checagem)
        const tempoAteChecagem = calcularTempoEmMinutos(p.horaEntrada, horaChecagem);
        
        // Criar um ID único para a célula de tempo total
        const tempoTotalId = `tempo-total-${p.id}`;
        
        // Verificar se há observações
        const temObservacoes = p.observacoes && p.observacoes.length > 0;
        
        // Adicionar classe para indicar que há observações
        const cedenteClass = temObservacoes ? 'has-observations' : '';
        
        // Adicionar classe para a célula de status para permitir clique
        const statusCellClass = 'status-cell';
        
        // No modo TV, não incluímos a coluna de data
        tr.innerHTML = `
            <td class="text-center" id="${tempoTotalId}">${formatarTempo(p.tempoTotal, true, p.tempoEmTempoReal)}</td>
            <td class="text-center">${formatarHora(p.horaEntrada)}</td>
            <td class="text-center">${p.numero}</td>
            <td class="text-center cedente-cell ${cedenteClass}" data-proposta-id="${p.id}">${p.cedente}</td>
            <td class="text-center">${formatarHoraTempo(p.horaAnalise, p.tempoAteAnalise, p.tempoAteAnaliseOriginal)}</td>
            <td class="text-center">${formatarHoraTempo(p.horaPendencia, p.tempoAnaliseAtePendencia, p.tempoAnaliseAtePendenciaOriginal)}</td>
            <td class="text-center">${formatarHoraTempo(horaChecagem, tempoAteChecagem, null)}</td>
            <td class="text-center">${formatarHoraTempo(p.horaCertifica, p.tempoEtapaAnteriorAteCertifica, p.tempoEtapaAnteriorAteCertificaOriginal)}</td>
            <td class="text-center">${formatarHoraTempo(p.horaPagamento, p.tempoCertificaAtePagamento, p.tempoCertificaAtePagamentoOriginal)}</td>
            <td class="text-center ${statusCellClass}" data-proposta-id="${p.id}">${p.statusSimplificado}</td>
        `;
        
        tbody.appendChild(tr);
        
        // Se o tempo está sendo calculado em tempo real, configurar um temporizador para atualizá-lo
        if (p.tempoEmTempoReal && p.horaEntrada) {
            const dataEntrada = new Date(p.horaEntrada);
            const timer = setInterval(() => {
                const agora = new Date();
                let tempoDecorrido = Math.floor((agora - dataEntrada) / (1000 * 60)); // Em minutos
                
                // Aplicar desconto de horário de almoço se necessário
                const horaEntrada = dataEntrada.getHours();
                const entrouAntesDas13 = horaEntrada < 13;
                const horaAtual = agora.getHours();
                const minutoAtual = agora.getMinutes();
                const passouDas13 = horaAtual > 13 || (horaAtual === 13 && minutoAtual > 0);
                
                if (entrouAntesDas13 && passouDas13) {
                    tempoDecorrido -= 60; // Descontar 1 hora
                }
                
                // Atualizar o elemento na tabela
                const tempoTotalCell = document.getElementById(tempoTotalId);
                if (tempoTotalCell) {
                    const excedido = tempoDecorrido > 150;
                    tempoTotalCell.innerHTML = formatarTempo(tempoDecorrido, true, true);
                }
            }, 60000); // Atualizar a cada minuto
            
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
    
    console.log(`Tabela no modo TV renderizada com ${propostasFiltradas.length} propostas.`);
}

// Função inteligente para decidir qual renderização usar
function renderizarTabelaInteligente(propostasFiltradas, novasPropostasIds = []) {
    if (document.body.classList.contains('tv-mode')) {
        // Modo TV
        if (typeof renderizarTabelaModoTVEspecifica === 'function') {
            renderizarTabelaModoTVEspecifica(propostasFiltradas, novasPropostasIds);
        } else if (typeof renderizarTabelaModoTV === 'function') {
            renderizarTabelaModoTV(propostasFiltradas, novasPropostasIds);
        } else {
            // Fallback para modo TV
            console.warn('Função modo TV não encontrada, usando renderização normal');
            renderizarTabela(propostasFiltradas, novasPropostasIds);
        }
    } else {
        // Modo normal - usar a função original
        renderizarTabela(propostasFiltradas, novasPropostasIds);
    }
}

// Disponibilizar globalmente
window.renderizarTabelaInteligente = renderizarTabelaInteligente;