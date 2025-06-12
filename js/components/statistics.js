// Função para atualizar estatísticas
async function atualizarEstatisticas(propostasFiltradas) {
    console.log('📊 Atualizando estatísticas...');
    
    if (!Array.isArray(propostasFiltradas)) {
        console.error('atualizarEstatisticas: propostasFiltradas não é um array');
        return;
    }
    
    // Total de propostas
    const totalElement = document.getElementById('total-propostas');
    if (totalElement) {
        totalElement.textContent = propostasFiltradas.length;
    }
    
    // Propostas pagas
    const propostasPagas = propostasFiltradas.filter(p => p.statusSimplificado === "PAGO");
    const pagasElement = document.getElementById('total-pagas');
    if (pagasElement) {
        pagasElement.textContent = propostasPagas.length;
    }
    
    // Propostas em processamento
    const propostasEmProcessamento = propostasFiltradas.filter(p => {
        const emProcessamento = 
            p.statusSimplificado !== "PAGO" && 
            p.statusSimplificado !== "CEDENTE DESISTIU" && 
            p.statusSimplificado !== "RECUSADO" &&
            p.statusSimplificado !== "POSTERGADO";
        return emProcessamento;
    });
    
    const processamentoElement = document.getElementById('total-processamento');
    if (processamentoElement) {
        processamentoElement.textContent = propostasEmProcessamento.length;
    }
    
    // Tempo médio até pagamento
    const propostasComPagamento = propostasFiltradas.filter(p => p.tempoAtePagamento);
    const tempoTotal = propostasComPagamento.reduce((acc, p) => acc + p.tempoAtePagamento, 0);
    const tempoMedio = propostasComPagamento.length ? Math.round(tempoTotal / propostasComPagamento.length) : 0;
    
    const tempoMedioElement = document.getElementById('tempo-medio');
    if (tempoMedioElement) {
        const formatarTempo = window.formatarTempo || ((min) => {
            if (!min) return '0 min';
            const horas = Math.floor(min / 60);
            const mins = min % 60;
            return horas > 0 ? `${horas}h ${mins}m` : `${mins} min`;
        });
        tempoMedioElement.textContent = formatarTempo(tempoMedio);
    }
    
    // Calcular soma dos borderôs pagos
    let somaValoresAprovados = 0;
    let contadorComValor = 0;
    
    propostasPagas.forEach(proposta => {
        let valorAprovado = 0;
        const camposValor = ['VLR_APR_DIR', 'VLR_APROVADO', 'VALOR_APROVADO', 'valorAprovado'];
        
        for (const campo of camposValor) {
            if (proposta[campo] && parseFloat(proposta[campo]) > 0) {
                valorAprovado = parseFloat(proposta[campo]);
                break;
            }
        }
        
        if (valorAprovado > 0) {
            somaValoresAprovados += valorAprovado;
            contadorComValor++;
        }
    });
    
    // Atualizar borderôs pagos
    const elementoSoma = document.getElementById('soma-valores-aprovados');
    if (elementoSoma) {
        if (typeof formatarMoedaPersonalizada === 'function') {
            elementoSoma.textContent = formatarMoedaPersonalizada(somaValoresAprovados, false);
        } else {
            elementoSoma.textContent = `R$ ${somaValoresAprovados.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }
    }
    
    // Atualizar o estado global
    if (window.APP_STATE) {
        window.APP_STATE.somaValoresAprovados = somaValoresAprovados;
    }
    
    // Atualizar valor acumulado do mês
    if (typeof atualizarValorAcumuladoInterface === 'function') {
        try {
            await atualizarValorAcumuladoInterface();
        } catch (error) {
            console.error('Erro ao atualizar valor acumulado na interface:', error);
        }
    }
    
    console.log(` Estatísticas atualizadas: ${propostasFiltradas.length} total, ${propostasPagas.length} pagas, R$ ${somaValoresAprovados.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
}

// Função para atualizar operações excedidas
function atualizarOperacoesExcedidas() {
    console.log("⏰ Atualizando seção de operações excedidas...");
    
    // Obter as propostas já filtradas
    const propostasFiltradas = window.filtrarPropostas ? window.filtrarPropostas() : [];
    
    // Filtrar apenas propostas PAGAS com tempo excedido
    const propostasExcedidas = propostasFiltradas.filter(p => 
        p.statusSimplificado === "PAGO" && 
        p.tempoTotalExcedido
    );
    
    // Ordenar por tempo total (maior para menor)
    propostasExcedidas.sort((a, b) => (b.tempoTotal || 0) - (a.tempoTotal || 0));
    
    // Obter o container
    const container = document.getElementById('excedido-container');
    const lista = document.getElementById('excedido-list');
    
    if (!container || !lista) {
        console.warn('Container de operações excedidas não encontrado');
        return;
    }
    
    // Limpar a lista
    lista.innerHTML = '';
    
    // Verificar se há operações excedidas
    if (propostasExcedidas.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    // Se houver, mostrar o container
    container.style.display = 'block';
    
    // Adicionar cada operação excedida à lista
    propostasExcedidas.forEach(proposta => {
        const item = document.createElement('div');
        item.className = 'observation-item';
        
        const formatarTempo = window.formatarTempo || ((min) => {
            if (!min) return '--';
            const horas = Math.floor(min / 60);
            const mins = min % 60;
            return horas > 0 ? `${horas}h ${mins}m` : `${mins} min`;
        });
        
        const formatarDataHora = window.formatarDataHora || ((dataHora) => {
            if (!dataHora) return '--';
            return new Date(dataHora).toLocaleString('pt-BR');
        });
        
        const tempoFormatado = formatarTempo(proposta.tempoTotal);
        
        // Criar o conteúdo do item
        item.innerHTML = `
            <div class="observation-header">
                <span class="observation-number">Proposta #${proposta.numero}</span>
                <span class="observation-cedente">${proposta.cedente}</span>
                <span class="observation-time">Tempo Total: <strong>${tempoFormatado}</strong></span>
            </div>
            <div class="observation-details">
                <div class="observation-timestamps">
                    <span>Entrada: ${formatarDataHora(proposta.horaEntrada)}</span>
                    <span>Pagamento: ${formatarDataHora(proposta.horaPagamento)}</span>
                </div>
                ${proposta.observacoes && proposta.observacoes.length > 0 ? 
                    `<div class="observation-notes">
                        <h4>Observações:</h4>
                        <ul>
                            ${proposta.observacoes
                                .filter(obs => obs.USUARIO === 'GER' && obs.OBSERVACAO && obs.OBSERVACAO.includes('Tempo excedido'))
                                .map(obs => `<li>${obs.OBSERVACAO}</li>`)
                                .join('')}
                        </ul>
                    </div>` : ''}
            </div>
        `;
        
        lista.appendChild(item);
    });
    
    console.log(`⏰ Renderizadas ${propostasExcedidas.length} operações excedidas`);
}

// Expor funções globalmente
window.atualizarEstatisticas = atualizarEstatisticas;
window.atualizarOperacoesExcedidas = atualizarOperacoesExcedidas;

console.log('✅ Statistics carregado');