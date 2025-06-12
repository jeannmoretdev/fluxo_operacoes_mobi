// Função para obter classe CSS baseada no status
function getStatusClass(status) {
    // Verificar se o status contém o texto específico (independente do número)
    if (status.includes("PAGO")) return "status-pago";
    if (status.includes("PENDÊNCIA")) return "status-pendencia";
    if (status.includes("DIGITANDO")) return "status-digitando";
    if (status.includes("AGUARD. ANÁLISE")) return "status-aguardando";
    if (status.includes("OPER. ANALISANDO")) return "status-analisando";
    if (status.includes("Q CERT. ASSINAT.")) return "status-assinatura";
    if (status.includes("CHECAGEM")) return "status-checagem";
    if (status.includes("POSTERGADO")) return "status-postergado";
    if (status.includes("CEDENTE DESISTIU")) return "status-desistiu";
    if (status.includes("RECUSADO")) return "status-recusado";
    
    // Se não encontrou nenhuma correspondência, retornar string vazia
    console.warn("Nenhuma classe encontrada para status:", status);
    return "";
}

// Função para filtrar propostas
function filtrarPropostas() {
    return APP_STATE.propostas.filter(p => {
        // Filtro de status
        if (APP_STATE.filtroStatus !== 'todos' && p.statusAtual !== APP_STATE.filtroStatus) {
            return false;
        }
        
        // Filtro de cedente
        if (APP_STATE.filtroCedente && !p.cedente.toLowerCase().includes(APP_STATE.filtroCedente.toLowerCase())) {
            return false;
        }
        
        return true;
    });
}

// Função para ordenar propostas
function ordenarPropostas(propostas) {
    const ordenacao = APP_STATE.ordenacao;
    
    return [...propostas].sort((a, b) => {
        switch (ordenacao) {
            case 'numero_desc':
                return b.numero - a.numero;
            case 'numero_asc':
                return a.numero - b.numero;
                
            case 'hora_entrada_desc':
                return compareDates(b.horaEntrada, a.horaEntrada);
            case 'hora_entrada_asc':
                return compareDates(a.horaEntrada, b.horaEntrada);
                
            case 'status_asc':
                return a.pesoStatus - b.pesoStatus;
            case 'status_desc':
                return b.pesoStatus - a.pesoStatus;
                
            case 'data_desc':
                return compareDates(b.data, a.data);
            case 'data_asc':
                return compareDates(a.data, b.data);
                
            case 'cedente_asc':
                return a.cedente.localeCompare(b.cedente);
            case 'cedente_desc':
                return b.cedente.localeCompare(a.cedente);
                
            case 'tempo_total_desc':
                return compareNumbers(b.tempoTotal, a.tempoTotal);
            case 'tempo_total_asc':
                return compareNumbers(a.tempoTotal, b.tempoTotal);
                
            case 'analise_desc':
                return compareDates(b.horaAnalise, a.horaAnalise);
            case 'analise_asc':
                return compareDates(a.horaAnalise, b.horaAnalise);
                
            case 'checagem_desc':
                return compareDates(b.horaChecagem, a.horaChecagem);
            case 'checagem_asc':
                return compareDates(a.horaChecagem, b.horaChecagem);
                
            case 'certificacao_desc':
                return compareDates(b.horaCertifica, a.horaCertifica);
            case 'certificacao_asc':
                return compareDates(a.horaCertifica, b.horaCertifica);
                
            case 'pagamento_desc':
                return compareDates(b.horaPagamento, a.horaPagamento);

            case 'pagamento_asc':
                return compareDates(a.horaPagamento, b.horaPagamento);

            case 'pendencia_desc':
                return ordenarPorData(b.horaPendencia, a.horaPendencia);

            case 'pendencia_asc':
                return ordenarPorData(a.horaPendencia, b.horaPendencia);
                
            default:
                return 0;
        }
    });
}

// Função para formatar hora e tempo
function formatarHoraTempo(hora, tempo, tempoOriginal) {
    if (!hora) return '--';
    
    const horaFormatada = formatarHora(hora);
    if (!tempo) return horaFormatada;
    
    // Verificar se houve desconto
    const houveDesconto = tempoOriginal && tempoOriginal > tempo;
    const tempoFormatado = houveDesconto ? `${formatarTempo(tempo)}*` : formatarTempo(tempo);
    
    // USAR ESPAÇO EM VEZ DE <br> - TUDO NA MESMA LINHA
    return `${horaFormatada} (${tempoFormatado})`;
}

// Tornar a função global
window.formatarHoraTempo = formatarHoraTempo;

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
    document.body.appendChild(tooltip);
    
    // Posicionamento simplificado
    const cedenteCell = document.querySelector(`.cedente-cell[data-proposta-id="${proposta.id}"]`);
    if (cedenteCell) {
        const cellRect = cedenteCell.getBoundingClientRect();
        tooltip.style.position = 'fixed';
        tooltip.style.top = `${cellRect.bottom + 10}px`;
        tooltip.style.left = `${cellRect.left}px`;
        tooltip.style.maxHeight = '300px';
        tooltip.style.overflowY = 'auto';
        
        // Fechar ao clicar fora
        setTimeout(() => {
            document.addEventListener('click', function closeTooltip(e) {
                if (!tooltip.contains(e.target) && !cedenteCell.contains(e.target)) {
                    tooltip.remove();
                    document.removeEventListener('click', closeTooltip);
                }
            });
        }, 100);
    }
}

// Função para mostrar o histórico de status
function mostrarHistoricoStatus(proposta) {
    console.log("Mostrando histórico de status para:", proposta.numero);
    
    // Implementação simplificada
    const statusAtual = proposta.statusSimplificado || proposta.statusAtual;
    alert(`Histórico de Status da Proposta ${proposta.numero}\n\nStatus Atual: ${statusAtual}\n\n(Implementação completa em desenvolvimento)`);
}

// Expor as funções globalmente
window.mostrarObservacoes = mostrarObservacoes;
window.mostrarHistoricoStatus = mostrarHistoricoStatus;