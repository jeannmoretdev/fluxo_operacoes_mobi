// Função para mostrar as observações de uma proposta - sem estilização especial para comentários automáticos
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
    tooltip.style.display = 'block'; // Garantir que esteja visível
    
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
        // Obter as dimensões e posições
        const cellRect = cedenteCell.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Calcular a posição inicial (abaixo da célula)
        let top = cellRect.bottom + 10;
        let left = cellRect.left + (cellRect.width / 2) - (tooltipRect.width / 2);
        
        // Verificar se o tooltip sai da tela na parte inferior
        if (top + tooltipRect.height > viewportHeight) {
            // Posicionar acima da célula se não couber abaixo
            top = cellRect.top - tooltipRect.height - 10;
            
            // Se ainda estiver fora da tela, posicionar no topo da viewport com margem
            if (top < 0) {
                top = 10;
            }
        }
        
        // Verificar se o tooltip sai da tela à direita
        if (left + tooltipRect.width > viewportWidth) {
            left = viewportWidth - tooltipRect.width - 10;
        }
        
        // Verificar se o tooltip sai da tela à esquerda
        if (left < 0) {
            left = 10;
        }
        
        // Aplicar a posição
        tooltip.style.position = 'fixed';
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.maxHeight = `${viewportHeight - 40}px`; // Limitar altura máxima
        tooltip.style.overflowY = 'auto'; // Permitir rolagem se o conteúdo for muito grande
        
        console.log("Tooltip posicionado:", tooltip.style.top, tooltip.style.left);
        
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

// Função para mostrar o histórico de status de uma proposta - versão ultra compacta sem espaçamento
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
    
    // Truncar o nome do cedente se for muito longo
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
        // Ordenar o fluxo por data/hora (mais antigo primeiro)
        const fluxoOrdenado = [...proposta.fluxoCompleto].sort((a, b) => {
            return new Date(a.DATA_HORA_ENTRADA) - new Date(b.DATA_HORA_ENTRADA);
        });
        
        // Criar uma lista simples em vez de tabela
        const historyList = document.createElement('div');
        historyList.className = 'history-list';
        
        // Adicionar cada entrada do fluxo
        let entradaAnterior = null;
        
        fluxoOrdenado.forEach((entrada, index) => {
            // Simplificar o status
            const statusSimplificado = simplificarStatus(entrada.STATUS_FLUXO);
            
            // Formatar a data/hora (apenas hora e minuto)
            const dataHora = formatarHora(entrada.DATA_HORA_ENTRADA);
            
            // Calcular o tempo desde a entrada anterior
            let tempoDesdeAnterior = '';
            if (entradaAnterior) {
                const tempoMinutos = calcularTempoEmMinutos(entradaAnterior.DATA_HORA_ENTRADA, entrada.DATA_HORA_ENTRADA);
                // Formato compacto para o tempo
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
            
            // Adicionar classe para destacar o status atual
            const isStatusAtual = index === fluxoOrdenado.length - 1;
            const statusClass = isStatusAtual ? 'status-atual' : '';
            
            // Criar um item de lista com formato compacto
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <span class="${statusClass}">${statusSimplificado}</span>
                <span>${dataHora}</span>
                <span>${tempoDesdeAnterior}</span>
            `;
            
            historyList.appendChild(item);
            
            // Atualizar a entrada anterior para o próximo cálculo
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
    
    // Adicionar o tooltip ao DOM
    document.body.appendChild(tooltip);
    
    // Posicionar o tooltip em relação à célula
    const statusCell = document.querySelector(`.status-cell[data-proposta-id="${proposta.id}"]`);
    if (statusCell) {
        // Obter as dimensões e posições
        const cellRect = statusCell.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Calcular a posição inicial (abaixo da célula)
        let top = cellRect.bottom + 5;
        let left = cellRect.left + (cellRect.width / 2) - (tooltipRect.width / 2);
        
        // Verificar se o tooltip sai da tela na parte inferior
        if (top + tooltipRect.height > viewportHeight) {
            // Posicionar acima da célula se não couber abaixo
            top = cellRect.top - tooltipRect.height - 5;
            
            // Se ainda estiver fora da tela, posicionar no topo da viewport com margem
            if (top < 0) {
                top = 5;
            }
        }
        
        // Verificar se o tooltip sai da tela à direita
        if (left + tooltipRect.width > viewportWidth) {
            left = viewportWidth - tooltipRect.width - 5;
        }
        
        // Verificar se o tooltip sai da tela à esquerda
        if (left < 0) {
            left = 5;
        }
        
        // Aplicar a posição
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