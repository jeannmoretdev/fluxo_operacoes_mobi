// Modificar a função atualizarEstatisticas para usar async/await
async function atualizarEstatisticas(propostasFiltradas) {
    document.getElementById('total-propostas').textContent = propostasFiltradas.length;
    
    const propostasPagas = propostasFiltradas.filter(p => p.statusSimplificado === "PAGO");
    document.getElementById('total-pagas').textContent = propostasPagas.length;
    
    const propostasEmProcessamento = propostasFiltradas.filter(p => {
        const emProcessamento = 
            p.statusSimplificado !== "PAGO" && 
            p.statusSimplificado !== "CEDENTE DESISTIU" && 
            p.statusSimplificado !== "RECUSADO" &&
            p.statusSimplificado !== "POSTERGADO";
        return emProcessamento;
    });
    
    document.getElementById('total-processamento').textContent = propostasEmProcessamento.length;
    
    // Calcular tempo médio até pagamento
    const propostasComPagamento = propostasFiltradas.filter(p => p.tempoAtePagamento);
    const tempoTotal = propostasComPagamento.reduce((acc, p) => acc + p.tempoAtePagamento, 0);
    const tempoMedio = propostasComPagamento.length ? Math.round(tempoTotal / propostasComPagamento.length) : 0;
    document.getElementById('tempo-medio').textContent = formatarTempo(tempoMedio);
    
    // Calcular soma dos borderôs pagos (APENAS DO PERÍODO FILTRADO)
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
    
    // Atualizar borderôs pagos (do período filtrado)
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
    
    // NOVO: Atualizar valor acumulado do mês (INDEPENDENTE DOS FILTROS)
    if (typeof atualizarValorAcumuladoInterface === 'function') {
        try {
            await atualizarValorAcumuladoInterface();
        } catch (error) {
            console.error('Erro ao atualizar valor acumulado na interface:', error);
        }
    }
    
    console.log(`💰 Borderôs pagos (período filtrado): R$ ${somaValoresAprovados.toLocaleString('pt-BR', {minimumFractionDigits: 2})} (${contadorComValor} propostas)`);
}

// Função para atualizar a seção de operações excedidas
function atualizarOperacoesExcedidas() {
    console.log("Atualizando seção de operações excedidas com filtros aplicados");
    
    // Obter as propostas já filtradas
    const propostasFiltradas = filtrarPropostas();
    console.log(`Usando ${propostasFiltradas.length} propostas filtradas para operações excedidas`);
    
    // Filtrar apenas propostas PAGAS com tempo excedido
    const propostasExcedidas = propostasFiltradas.filter(p => 
        p.statusSimplificado === "PAGO" && 
        p.tempoTotalExcedido
    );
    
    console.log(`Encontradas ${propostasExcedidas.length} operações PAGAS com tempo excedido após aplicar filtros`);
    
    // Ordenar por tempo total (maior para menor)
    propostasExcedidas.sort((a, b) => b.tempoTotal - a.tempoTotal);
    
    // Obter o container
    const container = document.getElementById('excedido-container');
    const lista = document.getElementById('excedido-list');
    
    // Limpar a lista
    lista.innerHTML = '';
    
    // Verificar se há operações excedidas
    if (propostasExcedidas.length === 0) {
        // Se não houver, ocultar o container
        container.style.display = 'none';
        return;
    }
    
    // Se houver, mostrar o container
    container.style.display = 'block';
    
    // Adicionar cada operação excedida à lista
    propostasExcedidas.forEach(proposta => {
        // Criar o item da lista
        const item = document.createElement('div');
        item.className = 'observation-item';
        
        // Formatar o tempo total
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
        
        // Adicionar o item à lista
        lista.appendChild(item);
    });
    
    console.log(`Renderizadas ${propostasExcedidas.length} operações excedidas`);
}

// Expor a função globalmente
window.atualizarOperacoesExcedidas = atualizarOperacoesExcedidas;