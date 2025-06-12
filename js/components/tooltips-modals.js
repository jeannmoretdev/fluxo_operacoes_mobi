// Função para mostrar as observações de uma proposta
function mostrarObservacoes(proposta) {
    console.log("Mostrando observações para:", proposta.id, proposta.cedente);
    console.log("Observações:", proposta.observacoes);
    
    // Remover qualquer tooltip existente
    const existingTooltip = document.querySelector('.observations-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
    
    // Criar o tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'observations-tooltip';
    tooltip.style.display = 'block';
    
    // Criar o cabeçalho do tooltip
    const header = document.createElement('div');
    header.className = 'observations-tooltip-header';
    
    const title = document.createElement('div');
    title.className = 'observations-tooltip-title';
    title.textContent = `Observações - ${proposta.cedente} (${proposta.numero})`;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'observations-tooltip-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip.remove();
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    tooltip.appendChild(header);
    
    // Adicionar as observações
    const content = document.createElement('div');
    content.className = 'observations-content';
    
    if (proposta.observacoes && proposta.observacoes.length > 0) {
        // Ordenar observações por data (mais recentes primeiro)
        const observacoesOrdenadas = [...proposta.observacoes].sort((a, b) => {
            if (!a.DATA_HORA || !b.DATA_HORA) return 0;
            return new Date(b.DATA_HORA) - new Date(a.DATA_HORA);
        });
        
        observacoesOrdenadas.forEach(obs => {
            const item = document.createElement('div');
            item.className = 'observation-item';
            
            const user = document.createElement('div');
            user.className = 'observation-user';
            user.textContent = obs.USUARIO || 'Desconhecido';
            
            const text = document.createElement('div');
            text.className = 'observation-text';
            text.textContent = obs.OBSERVACAO || '';
            
            item.appendChild(user);
            item.appendChild(text);
            content.appendChild(item);
        });
    } else {
        const noObs = document.createElement('div');
        noObs.textContent = 'Sem observações';
        content.appendChild(noObs);
    }
    
    tooltip.appendChild(content);
    
    // Adicionar o tooltip ao DOM
    document.body.appendChild(tooltip);
    
    // Posicionar o tooltip em relação à célula
    const cedenteCell = document.querySelector(`.cedente-cell[data-proposta-id="${proposta.id}"]`);
    if (cedenteCell) {
        const cellRect = cedenteCell.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        let top = cellRect.bottom + 10;
        let left = cellRect.left + (cellRect.width / 2) - (tooltipRect.width / 2);
        
        if (top + tooltipRect.height > viewportHeight) {
            top = cellRect.top - tooltipRect.height - 10;
            if (top < 0) {
                top = 10;
            }
        }
        
        if (left + tooltipRect.width > viewportWidth) {
            left = viewportWidth - tooltipRect.width - 10;
        }
        
        if (left < 0) {
            left = 10;
        }
        
        tooltip.style.position = 'fixed';
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.maxHeight = `${viewportHeight - 40}px`;
        tooltip.style.overflowY = 'auto';
        
        // Fechar o tooltip ao clicar fora dele
        setTimeout(() => {
            document.addEventListener('click', function closeTooltip(e) {
                if (!tooltip.contains(e.target) && !cedenteCell.contains(e.target)) {
                    tooltip.remove();
                    document.removeEventListener('click', closeTooltip);
                }
            });
        }, 100);
        
        // Fechar o tooltip ao pressionar ESC
        document.addEventListener('keydown', function escKeyHandler(e) {
            if (e.key === 'Escape') {
                tooltip.remove();
                document.removeEventListener('keydown', escKeyHandler);
            }
        });
    } else {
        console.error("Célula do cedente não encontrada:", proposta.id);
        tooltip.remove();
    }
}

// Função para mostrar o histórico de status de uma proposta
function mostrarHistoricoStatus(proposta) {
    // Remover qualquer tooltip existente
    const existingTooltip = document.querySelector('.status-history-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
    
    // Criar o tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'status-history-tooltip';
    tooltip.style.display = 'block';
    
    // Criar o cabeçalho do tooltip
    const header = document.createElement('div');
    header.className = 'status-history-tooltip-header';
    
    let nomeCedente = proposta.cedente;
    if (nomeCedente.length > 15) {
        nomeCedente = nomeCedente.substring(0, 13) + '...';
    }
    
    const title = document.createElement('div');
    title.className = 'status-history-tooltip-title';
    title.textContent = `${proposta.numero} - ${nomeCedente}`;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'status-history-tooltip-close';
    closeButton.innerHTML = '×';
    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip.remove();
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    tooltip.appendChild(header);
    
    // Adicionar o histórico de status
    const content = document.createElement('div');
    content.className = 'status-history-content';
    
    if (proposta.fluxoCompleto && proposta.fluxoCompleto.length > 0) {
        const fluxoOrdenado = [...proposta.fluxoCompleto].sort((a, b) => {
            return new Date(a.DATA_HORA_ENTRADA) - new Date(b.DATA_HORA_ENTRADA);
        });
        
        const historyList = document.createElement('div');
        historyList.className = 'history-list';
        
        let entradaAnterior = null;
        
        fluxoOrdenado.forEach((entrada, index) => {
            const statusSimplificado = window.simplificarStatus ? 
                window.simplificarStatus(entrada.STATUS_FLUXO) : 
                entrada.STATUS_FLUXO;
            
            const dataHora = window.formatarHora ? 
                window.formatarHora(entrada.DATA_HORA_ENTRADA) :
                new Date(entrada.DATA_HORA_ENTRADA).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            
            let tempoDesdeAnterior = '';
            if (entradaAnterior) {
                const tempoMinutos = window.calcularTempoEmMinutos ?
                    window.calcularTempoEmMinutos(entradaAnterior.DATA_HORA_ENTRADA, entrada.DATA_HORA_ENTRADA) :
                    Math.floor((new Date(entrada.DATA_HORA_ENTRADA) - new Date(entradaAnterior.DATA_HORA_ENTRADA)) / (1000 * 60));
                
                if (tempoMinutos < 60) {
                    tempoDesdeAnterior = `${tempoMinutos}m`;
                } else {
                    const horas = Math.floor(tempoMinutos / 60);
                    const min = tempoMinutos % 60;
                    tempoDesdeAnterior = min > 0 ? `${horas}h${min}m` : `${horas}h`;
                }
            } else {
                tempoDesdeAnterior = '-';
            }
            
            const isStatusAtual = index === fluxoOrdenado.length - 1;
            const statusClass = isStatusAtual ? 'status-atual' : '';
            
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <span class="${statusClass}">${statusSimplificado}</span>
                <span>${dataHora}</span>
                <span>${tempoDesdeAnterior}</span>
            `;
            
            historyList.appendChild(item);
            entradaAnterior = entrada;
        });
        
        content.appendChild(historyList);
    } else {
        const noHistory = document.createElement('div');
        noHistory.className = 'no-history';
        noHistory.textContent = 'Sem histórico';
        content.appendChild(noHistory);
    }
    
    tooltip.appendChild(content);
    document.body.appendChild(tooltip);
    
    // Posicionar o tooltip
    const statusCell = document.querySelector(`.status-cell[data-proposta-id="${proposta.id}"]`);
    if (statusCell) {
        const cellRect = statusCell.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        let top = cellRect.bottom + 5;
        let left = cellRect.left + (cellRect.width / 2) - (tooltipRect.width / 2);
        
        if (top + tooltipRect.height > viewportHeight) {
            top = cellRect.top - tooltipRect.height - 5;
            if (top < 0) {
                top = 5;
            }
        }
        
        if (left + tooltipRect.width > viewportWidth) {
            left = viewportWidth - tooltipRect.width - 5;
        }
        
        if (left < 0) {
            left = 5;
        }
        
        tooltip.style.position = 'fixed';
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.maxHeight = `${viewportHeight - 20}px`;
        tooltip.style.overflowY = 'auto';
        
        // Fechar o tooltip ao clicar fora dele
        setTimeout(() => {
            document.addEventListener('click', function closeTooltip(e) {
                if (!tooltip.contains(e.target) && !statusCell.contains(e.target)) {
                    tooltip.remove();
                    document.removeEventListener('click', closeTooltip);
                }
            });
        }, 0);
        
        // Fechar o tooltip ao pressionar ESC
        document.addEventListener('keydown', function escKeyHandler(e) {
            if (e.key === 'Escape') {
                tooltip.remove();
                document.removeEventListener('keydown', escKeyHandler);
            }
        });
    } else {
        console.error("Célula de status não encontrada:", proposta.id);
        tooltip.remove();
    }
}

// Expor funções globalmente
window.mostrarObservacoes = mostrarObservacoes;
window.mostrarHistoricoStatus = mostrarHistoricoStatus;

console.log('✅ Tooltips e Modals carregados');