// Adicionar ao objeto ReportService existente
// Relatório de Fluxo de Operações
window.ReportService = window.ReportService || {};

ReportService.gerarRelatorioFluxoOperacoes = function() {
    // Obter propostas filtradas
    const propostasFiltradas = filtrarPropostas();
    
    // Ordenar por data de entrada (mais recente primeiro)
    propostasFiltradas.sort((a, b) => compareDates(b.data, a.data));
    
    // Gerar conteúdo do relatório
    const reportContent = document.getElementById('report-content');
    reportContent.innerHTML = '';
    
    // Adicionar cabeçalho do relatório
    const header = document.createElement('div');
    header.className = 'report-header';
    
    // Período do relatório
    const dataInicio = formatarData(APP_STATE.dataInicio.toISOString().split('T')[0]);
    const dataFim = formatarData(APP_STATE.dataFim.toISOString().split('T')[0]);
    
    header.innerHTML = `
        <div class="report-title">
            <h2>Relatório de Fluxo de Operações</h2>
            <p>Período: ${dataInicio} a ${dataFim}</p>
            <p>Total de operações: ${propostasFiltradas.length}</p>
        </div>
    `;
    
    reportContent.appendChild(header);
    
    // Se não houver propostas
    if (propostasFiltradas.length === 0) {
        const noData = document.createElement('div');
        noData.className = 'no-data';
        noData.textContent = 'Nenhuma operação encontrada no período selecionado.';
        reportContent.appendChild(noData);
        return;
    }
    
    // Calcular métricas de desempenho
    const metricas = this.calcularMetricasFluxo(propostasFiltradas);
    
    // Adicionar seção de métricas simplificada
    const metricasSection = document.createElement('div');
    metricasSection.className = 'report-section metrics-section';
    
    metricasSection.innerHTML = `
        <h3>Métricas de Desempenho</h3>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${formatarTempo(metricas.tempoMedioTotal)}</div>
                <div class="metric-label">Tempo Médio Total</div>
            </div>
        </div>
    `;
    
    reportContent.appendChild(metricasSection);
    
    // Adicionar gráfico de fluxo com layout melhorado
    const fluxoSection = document.createElement('div');
    fluxoSection.className = 'report-section';
    
    fluxoSection.innerHTML = `
        <h3>Visualização do Fluxo</h3>
        <div class="flow-chart-container">
            <div class="flow-chart">
                <div class="flow-step">
                    <div class="flow-icon"><i class="fas fa-file-import"></i></div>
                    <div class="flow-label">Entrada</div>
                    <div class="flow-count">${propostasFiltradas.length}</div>
                </div>
                <div class="flow-arrow">
                    <div class="flow-time">${formatarTempo(metricas.tempoMedioEntradaAnalise)}</div>
                    <i class="fas fa-arrow-right"></i>
                </div>
                <div class="flow-step">
                    <div class="flow-icon"><i class="fas fa-search"></i></div>
                    <div class="flow-label">Análise</div>
                    <div class="flow-count">${metricas.propostasComAnalise}</div>
                </div>
                <div class="flow-arrow">
                    <div class="flow-time">${formatarTempo(metricas.tempoMedioAnaliseCertificacao)}</div>
                    <i class="fas fa-arrow-right"></i>
                </div>
                <div class="flow-step">
                    <div class="flow-icon"><i class="fas fa-certificate"></i></div>
                    <div class="flow-label">Certif.</div>
                    <div class="flow-count">${metricas.propostasComCertificacao}</div>
                </div>
                <div class="flow-arrow">
                    <div class="flow-time">${formatarTempo(metricas.tempoMedioCertificacaoPagamento)}</div>
                    <i class="fas fa-arrow-right"></i>
                </div>
                <div class="flow-step">
                    <div class="flow-icon"><i class="fas fa-money-check-alt"></i></div>
                    <div class="flow-label">Pagto</div>
                    <div class="flow-count">${metricas.propostasComPagamento}</div>
                </div>
            </div>
        </div>
    `;
    
    reportContent.appendChild(fluxoSection);
    
    // Adicionar tabela detalhada
    const tableSection = document.createElement('div');
    tableSection.className = 'report-section';
    
    tableSection.innerHTML = `
        <h3>Detalhamento por Operação</h3>
    `;
    
    // Criar tabela para os dados detalhados
    const table = document.createElement('table');
    table.className = 'report-table flow-table';
    
    // Cabeçalhos da tabela - agora seguindo o mesmo formato do fluxo principal
    const headers = ['DATA', 'Tempo Total', 'ENTRADA GER', 'Nº', 'Cedente', 'ANALISTA AUTO', 'CHECAGEM', 'QCERT.', 'PAGO', 'Status'];
    // Ajustar larguras das colunas para corresponder ao formato do fluxo
    const colWidths = [20, 25, 25, 15, 50, 30, 30, 30, 30, 22];
    
    // Criar cabeçalho da tabela
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Criar corpo da tabela
    const tbody = document.createElement('tbody');
    
    // Adicionar linhas para cada proposta
    propostasFiltradas.forEach(p => {
        const row = document.createElement('tr');
        
        // Calcular tempos entre etapas
        const tempoEntradaAnalise = calcularTempoEntreEtapas(p.horaEntrada, p.horaAnalise);
        const tempoAnaliseCertificacao = calcularTempoEntreEtapas(p.horaAnalise, p.horaCertifica);
        const tempoCertificacaoPagamento = calcularTempoEntreEtapas(p.horaCertifica, p.horaPagamento);
        
        // DATA
        const tdData = document.createElement('td');
        tdData.textContent = p.dataFormatada;
        row.appendChild(tdData);
        
        // Tempo Total
        const tdTempoTotal = document.createElement('td');
        tdTempoTotal.textContent = formatarTempo(p.tempoTotal);
        if (p.tempoTotal > metricas.tempoMedioTotal * 1.5) {
            tdTempoTotal.classList.add('tempo-acima-media');
        }
        row.appendChild(tdTempoTotal);
        
        // ENTRADA GER
        const tdEntradaGer = document.createElement('td');
        tdEntradaGer.textContent = p.horaEntradaFormatada;
        row.appendChild(tdEntradaGer);
        
        // Número
        const tdNumero = document.createElement('td');
        tdNumero.textContent = p.numero;
        row.appendChild(tdNumero);
        
        // Cedente (truncar se for muito longo)
        const tdCedente = document.createElement('td');
        let cedente = p.cedente || '';
        if (cedente.length > 20) {
            cedente = cedente.substring(0, 17) + '...';
        }
        tdCedente.textContent = cedente;
        row.appendChild(tdCedente);
        
        // ANALISTA AUTO
        const tdAnalistaAuto = document.createElement('td');
        tdAnalistaAuto.textContent = p.horaAnaliseFormatada;
        row.appendChild(tdAnalistaAuto);
        
        // CHECAGEM
        const tdChecagem = document.createElement('td');
        tdChecagem.textContent = p.horaChecagemFormatada;
        row.appendChild(tdChecagem);
        
        // QCERT.
        const tdQcert = document.createElement('td');
        tdQcert.textContent = p.horaCertificaFormatada;
        row.appendChild(tdQcert);
        
        // PAGO
        const tdPago = document.createElement('td');
        tdPago.textContent = p.horaPagamentoFormatada;
        row.appendChild(tdPago);
        
        // Status
        const tdStatus = document.createElement('td');
        tdStatus.textContent = p.statusSimplificado;
        tdStatus.className = `status-cell status-${p.statusSimplificado.toLowerCase().replace(/\s+/g, '-')}`;
        row.appendChild(tdStatus);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    tableSection.appendChild(table);
    reportContent.appendChild(tableSection);
    
    // Atualizar o título do modal
    document.querySelector('.report-modal-title').textContent = 'Relatório de Fluxo de Operações';
    
    // Atualizar o botão de PDF para gerar o PDF de fluxo
    const pdfButton = document.getElementById('report-pdf');
    pdfButton.setAttribute('data-report-type', 'flow');
    
    // Exibir o modal
    document.getElementById('report-modal').style.display = 'flex';
};

// Função para calcular métricas de fluxo - versão simplificada
ReportService.calcularMetricasFluxo = function(propostas) {
    // Inicializar contadores
    let totalPropostas = propostas.length;
    let totalTempoTotal = 0;
    
    // Contadores para tempos entre etapas específicas
    let totalTempoEntradaAnalise = 0;
    let totalTempoAnaliseCertificacao = 0;
    let totalTempoCertificacaoPagamento = 0;
    
    let contadorEntradaAnalise = 0;
    let contadorAnaliseCertificacao = 0;
    let contadorCertificacaoPagamento = 0;
    
    // Contadores para propostas que completaram cada etapa
    let propostasComAnalise = 0;
    let propostasComCertificacao = 0;
    let propostasComPagamento = 0;
    
    // Calcular totais
    propostas.forEach(p => {
        // Tempo total da proposta (do início ao fim ou estado atual)
        if (p.tempoTotal) {
            totalTempoTotal += p.tempoTotal;
        }
        
        // Tempo entre Entrada e Análise
        if (p.horaEntrada && p.horaAnalise) {
            const tempo = calcularTempoEntreEtapas(p.horaEntrada, p.horaAnalise);
            totalTempoEntradaAnalise += tempo;
            contadorEntradaAnalise++;
        }
        
        // Tempo entre Análise e Certificação
        if (p.horaAnalise && p.horaCertifica) {
            const tempo = calcularTempoEntreEtapas(p.horaAnalise, p.horaCertifica);
            totalTempoAnaliseCertificacao += tempo;
            contadorAnaliseCertificacao++;
        }
        
        // Tempo entre Certificação e Pagamento
        if (p.horaCertifica && p.horaPagamento) {
            const tempo = calcularTempoEntreEtapas(p.horaCertifica, p.horaPagamento);
            totalTempoCertificacaoPagamento += tempo;
            contadorCertificacaoPagamento++;
        }
        
        // Contar propostas que chegaram a cada etapa
        if (p.horaAnalise) propostasComAnalise++;
        if (p.horaCertifica) propostasComCertificacao++;
        if (p.horaPagamento) propostasComPagamento++;
    });
    
    // Calcular médias
    const tempoMedioTotal = totalPropostas > 0 ? totalTempoTotal / totalPropostas : 0;
    
    // Tempos médios entre etapas específicas
    const tempoMedioEntradaAnalise = contadorEntradaAnalise > 0 ? totalTempoEntradaAnalise / contadorEntradaAnalise : 0;
    const tempoMedioAnaliseCertificacao = contadorAnaliseCertificacao > 0 ? totalTempoAnaliseCertificacao / contadorAnaliseCertificacao : 0;
    const tempoMedioCertificacaoPagamento = contadorCertificacaoPagamento > 0 ? totalTempoCertificacaoPagamento / contadorCertificacaoPagamento : 0;
    
    return {
        tempoMedioTotal,
        tempoMedioEntradaAnalise,
        tempoMedioAnaliseCertificacao,
        tempoMedioCertificacaoPagamento,
        propostasComAnalise,
        propostasComCertificacao,
        propostasComPagamento
    };
};

// Função auxiliar para calcular tempo entre etapas
function calcularTempoEntreEtapas(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) return 0;
    
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diferencaMs = fim - inicio;
    
    if (diferencaMs < 0) return 0;
    
    return Math.round(diferencaMs / (1000 * 60)); // Retorna em minutos
}

// Adicionar função para identificar o maior período com desconto no relatório
function identificarMaiorPeriodoComDescontoPDF(proposta) {
    const periodos = [];
    
    // Entrada -> Análise
    if (proposta.horaEntrada && proposta.horaAnalise) {
        const resultado = calcularDescontoAlmocoPDF(proposta.horaEntrada, proposta.horaAnalise);
        if (resultado.descontoAplicado) {
            periodos.push({
                tipoInicio: 'ENTRADA',
                tipoFim: 'ANALISE',
                tempoOriginal: resultado.tempoOriginal,
                tempoFinal: resultado.tempoFinal,
                desconto: resultado.tempoOriginal - resultado.tempoFinal
            });
        }
    }
    
    // Análise -> Pendência
    if (proposta.horaAnalise && proposta.horaPendencia) {
        const resultado = calcularDescontoAlmocoPDF(proposta.horaAnalise, proposta.horaPendencia);
        if (resultado.descontoAplicado) {
            periodos.push({
                tipoInicio: 'ANALISE',
                tipoFim: 'PENDENCIA',
                tempoOriginal: resultado.tempoOriginal,
                tempoFinal: resultado.tempoFinal,
                desconto: resultado.tempoOriginal - resultado.tempoFinal
            });
        }
    }
    
    // Entrada -> Checagem
    const entradaChecagem = proposta.fluxoCompleto ? proposta.fluxoCompleto.find(f => f.STATUS_FLUXO === "CHECAGEM") : null;
    const horaChecagem = entradaChecagem ? entradaChecagem.DATA_HORA_ENTRADA : null;
    
    if (proposta.horaEntrada && horaChecagem) {
        const resultado = calcularDescontoAlmocoPDF(proposta.horaEntrada, horaChecagem);
        if (resultado.descontoAplicado) {
            periodos.push({
                tipoInicio: 'ENTRADA',
                tipoFim: 'CHECAGEM',
                tempoOriginal: resultado.tempoOriginal,
                tempoFinal: resultado.tempoFinal,
                desconto: resultado.tempoOriginal - resultado.tempoFinal
            });
        }
    }
    
    // Certificação -> Pagamento
    if (proposta.horaCertifica && proposta.horaPagamento) {
        const resultado = calcularDescontoAlmocoPDF(proposta.horaCertifica, proposta.horaPagamento);
        if (resultado.descontoAplicado) {
            periodos.push({
                tipoInicio: 'CERTIFICACAO',
                tipoFim: 'PAGAMENTO',
                tempoOriginal: resultado.tempoOriginal,
                tempoFinal: resultado.tempoFinal,
                desconto: resultado.tempoOriginal - resultado.tempoFinal
            });
        }
    }
    
    // Retornar o período com maior tempo original (antes do desconto)
    if (periodos.length === 0) return null;
    
    return periodos.reduce((maior, atual) => 
        atual.tempoOriginal > maior.tempoOriginal ? atual : maior
    );
}

// Função auxiliar para calcular desconto de almoço no PDF
function calcularDescontoAlmocoPDF(horaInicio, horaFim) {
    if (!horaInicio || !horaFim) {
        return { tempoOriginal: 0, tempoFinal: 0, descontoAplicado: false };
    }
    
    const inicio = new Date(horaInicio);
    const fim = new Date(horaFim);
    
    // Calcular tempo original em minutos
    const tempoOriginalMs = fim - inicio;
    const tempoOriginal = Math.floor(tempoOriginalMs / (1000 * 60));
    
    // Verificar se precisa descontar horário de almoço
    const horaInicioNum = inicio.getHours();
    const horaFimNum = fim.getHours();
    const minutoFim = fim.getMinutes();
    
    // Condições para desconto:
    // 1. Iniciou antes das 13:00
    // 2. Terminou depois das 13:00 (ou exatamente 13:00 com minutos > 0)
    const iniciouAntesDas13 = horaInicioNum < 13;
    const terminouDepoisDas13 = horaFimNum > 13 || (horaFimNum === 13 && minutoFim > 0);
    
    if (iniciouAntesDas13 && terminouDepoisDas13) {
        const tempoFinal = tempoOriginal - 60; // Descontar 1 hora
        return {
            tempoOriginal: tempoOriginal,
            tempoFinal: Math.max(0, tempoFinal), // Não permitir tempo negativo
            descontoAplicado: true
        };
    }
    
    return {
        tempoOriginal: tempoOriginal,
        tempoFinal: tempoOriginal,
        descontoAplicado: false
    };
}

// Gerar PDF do relatório de fluxo de operações completo com observações
ReportService.gerarPDFFluxoOperacoes = function() {
    try {
        console.log("Iniciando geração do PDF completo...");
        
        // Mostrar indicador de carregamento
        mostrarCarregamento();
        
        // Obter propostas filtradas
        const propostasFiltradas = filtrarPropostas();
        console.log(`Propostas filtradas: ${propostasFiltradas.length}`);
        
        // Ordenar propostas
        const propostasOrdenadas = ordenarPropostas(propostasFiltradas);
        
        // CALCULAR A MÉDIA DOS TEMPOS TOTAIS DAS PROPOSTAS PAGAS
        const propostasPagas = propostasOrdenadas.filter(p => p.statusSimplificado === 'PAGO' && p.tempoTotal);
        const tempoTotalSoma = propostasPagas.reduce((acc, p) => acc + p.tempoTotal, 0);
        const tempoMedio = propostasPagas.length > 0 ? tempoTotalSoma / propostasPagas.length : 0;
        const limite50PorcentoMaior = tempoMedio * 1.5; // 50% maior que a média
        
        console.log(`Tempo médio das propostas pagas: ${formatarTempo(tempoMedio)}`);
        console.log(`Limite para sublinhado (50% maior): ${formatarTempo(limite50PorcentoMaior)}`);
        
        // Criar novo documento PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4');
        
        let yPos = 20;
        const startX = 10;
        const endX = 287; // Margem direita
        const totalWidth = endX - startX; // 277mm disponível
        
        // Título
        doc.setFontSize(18); // AUMENTADO de 16 para 18
        doc.setTextColor(44, 62, 80);
        doc.text('Relatório de Fluxo de Operações', startX, yPos);
        yPos += 10; // Aumentado de 8 para 10
        
                // PERÍODO E DATA DE GERAÇÃO NA MESMA LINHA
        const dataInicio = new Date(APP_STATE.dataInicio).toLocaleDateString('pt-BR');
        const dataFim = new Date(APP_STATE.dataFim).toLocaleDateString('pt-BR');
        const agora = new Date();
        const dataHoraGeracao = `${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`;
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        const textoPeriodoGeracao = `Período: ${dataInicio} a ${dataFim} | Gerado em: ${dataHoraGeracao}`;
        doc.text(textoPeriodoGeracao, startX, yPos);
        yPos += 10;

        
        // ESTATÍSTICAS CONSOLIDADAS (calculadas uma única vez) - MOVIDO PARA CIMA
        const totalPropostas = propostasOrdenadas.length;
        const totalPagas = propostasOrdenadas.filter(p => p.statusSimplificado === 'PAGO').length;
        const propostasComObservacoes = propostasOrdenadas.filter(p => p.observacoes && p.observacoes.length > 0);
        const propostasSublinhadas = propostasOrdenadas.filter(p => p.tempoTotal && p.tempoTotal > limite50PorcentoMaior).length;
        
        // Calcular tempo médio até pagamento
        const propostasComPagamento = propostasOrdenadas.filter(p => p.tempoAtePagamento);
        const tempoTotalPagamento = propostasComPagamento.reduce((acc, p) => acc + p.tempoAtePagamento, 0);
        const tempoMedioPagamento = propostasComPagamento.length ? Math.round(tempoTotalPagamento / propostasComPagamento.length) : 0;
        
        // ESTATÍSTICAS EM UMA LINHA SÓ
        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80);
        const textoEstatisticas = `Total: ${totalPropostas} | Pagas: ${totalPagas} | Tempo Médio: ${formatarTempo(tempoMedioPagamento)} | Sublinhadas: ${propostasSublinhadas} | Com observações: ${propostasComObservacoes.length}`;
        doc.text(textoEstatisticas, startX, yPos);
        yPos += 8;
        
        // FLUXO VISUAL COM MÉDIAS DOS TEMPOS - MOVIDO PARA CIMA DAS LEGENDAS
        doc.setFontSize(10);
        doc.setTextColor(44, 62, 80);
        doc.text('Fluxo Médio de Tempos:', startX, yPos);
        yPos += 6;
        
        // Calcular médias dos tempos para cada etapa
        const calcularMediaTempo = (propostas, campo) => {
            const temposValidos = propostas.filter(p => p[campo] && p[campo] > 0).map(p => p[campo]);
            return temposValidos.length > 0 ? Math.round(temposValidos.reduce((a, b) => a + b, 0) / temposValidos.length) : 0;
        };
        
        const mediaEntradaAnalise = calcularMediaTempo(propostasOrdenadas, 'tempoAteAnalise');
        const mediaAnalisePendencia = calcularMediaTempo(propostasOrdenadas, 'tempoAnaliseAtePendencia');
        const mediaEtapaAnteriorCertifica = calcularMediaTempo(propostasOrdenadas, 'tempoEtapaAnteriorAteCertifica');
        const mediaCertificaPagamento = calcularMediaTempo(propostasOrdenadas, 'tempoCertificaAtePagamento');
        
        // Linha do fluxo com tempos após as setas
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        
        let fluxoTexto = 'ENTRADA';
        if (mediaEntradaAnalise > 0) {
            fluxoTexto += ` => ${formatarTempo(mediaEntradaAnalise)} => `;
        } else {
            fluxoTexto += ' => ';
        }
        
        fluxoTexto += 'ANÁLISE';
        if (mediaAnalisePendencia > 0) {
            fluxoTexto += ` => ${formatarTempo(mediaAnalisePendencia)} => `;
        } else {
            fluxoTexto += ' => ';
        }
        
        fluxoTexto += 'PENDÊNCIA';
        if (mediaEtapaAnteriorCertifica > 0) {
            fluxoTexto += ` => ${formatarTempo(mediaEtapaAnteriorCertifica)} => `;
        } else {
            fluxoTexto += ' => ';
        }
        
        fluxoTexto += 'QCERT';
        if (mediaCertificaPagamento > 0) {
            fluxoTexto += ` => ${formatarTempo(mediaCertificaPagamento)} => `;
        } else {
            fluxoTexto += ' => ';
        }
        
        fluxoTexto += 'PAGO';
        
        doc.text(fluxoTexto, startX + 5, yPos);
        yPos += 10;
        
        // LEGENDAS AGORA FICAM ABAIXO DO FLUXO
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text('Legendas:', startX, yPos);
        yPos += 5;
        
        doc.setTextColor(100, 100, 100);
        doc.text('* Maior período com desconto de almoço (máx. 1h) | Número sublinhado: Tempo 50% acima da média', startX + 5, yPos);
        yPos += 4;
        doc.text(`Tempo médio (pagas): ${formatarTempo(tempoMedio)} | Limite sublinhado: ${formatarTempo(limite50PorcentoMaior)}`, startX + 5, yPos);
        yPos += 10;
        
        // CABEÇALHOS DA TABELA COMPACTOS
        const headers = ['DATA', 'TEMPO\nTOTAL', 'ENTRADA\nGER', 'Nº', 'CEDENTE', 'ANALISTA AUTO', 'PENDÊNCIA', 'CHECAGEM', 'QCERT.', 'PAGO', 'STATUS'];
        // Colunas mais compactas
        const colWidths = [18, 20, 18, 12, 38, 25, 25, 25, 25, 25, 22]; // Total: 253mm
        
        // Desenhar cabeçalho
        doc.setFillColor(52, 73, 94);
        doc.rect(startX, yPos, colWidths.reduce((a, b) => a + b, 0), 10, 'F'); // AUMENTADO de 8 para 10
        
        doc.setFontSize(8); // AUMENTADO de 7 para 8
        doc.setTextColor(255, 255, 255);
        
        let xPos = startX + 1;
        headers.forEach((header, i) => {
            const lines = header.split('\n');
            if (lines.length > 1) {
                doc.text(lines[0], xPos + 1, yPos + 4); // Ajustado para nova altura
                doc.text(lines[1], xPos + 1, yPos + 7); // Ajustado para nova altura
            } else {
                doc.text(header, xPos + 1, yPos + 6); // Centralizado na nova altura
            }
            xPos += colWidths[i];
        });
        
        yPos += 10; // AUMENTADO de 8 para 10
        
        // Processar cada proposta
        for (let i = 0; i < propostasOrdenadas.length; i++) {
            const p = propostasOrdenadas[i];
            
            // Verificar nova página
            if (yPos > 185) {
                doc.addPage();
                yPos = 20;
                
                // Redesenhar cabeçalho na nova página
                doc.setFillColor(52, 73, 94);
                doc.rect(startX, yPos, colWidths.reduce((a, b) => a + b, 0), 10, 'F'); // AUMENTADO
                
                doc.setFontSize(8); // AUMENTADO
                doc.setTextColor(255, 255, 255);
                
                let xPos = startX + 1;
                headers.forEach((header, i) => {
                    const lines = header.split('\n');
                    if (lines.length > 1) {
                        doc.text(lines[0], xPos + 1, yPos + 4);
                        doc.text(lines[1], xPos + 1, yPos + 7);
                    } else {
                        doc.text(header, xPos + 1, yPos + 6);
                    }
                    xPos += colWidths[i];
                });
                
                yPos += 10; // AUMENTADO
            }
            
            // Identificar maior período com desconto
            const maiorPeriodoComDesconto = identificarMaiorPeriodoComDescontoPDF(p);
            
            // Zebra striping
            if (i % 2 === 0) {
                doc.setFillColor(248, 249, 250);
                doc.rect(startX, yPos, colWidths.reduce((a, b) => a + b, 0), 6, 'F'); // AUMENTADO de 5 para 6
            }
            
            doc.setFontSize(7); // AUMENTADO de 6 para 7
            doc.setTextColor(52, 73, 94);
            
            xPos = startX + 1;
            
            // DATA
            doc.text(p.dataFormatada || '', xPos, yPos + 4); // Ajustado para nova altura
            xPos += colWidths[0];
            
            // TEMPO TOTAL
            const textoTempoTotal = formatarTempo(p.tempoTotal) || '--';
            doc.text(textoTempoTotal, xPos, yPos + 4);
            xPos += colWidths[1];
            
            // ENTRADA GER
            const textoEntrada = formatarHora(p.horaEntrada) || '--';
            doc.text(textoEntrada, xPos, yPos + 4);
            xPos += colWidths[2];
            
            // Nº - ADICIONAR SUBLINHADO SE NECESSÁRIO
            const numeroTexto = p.numero.toString();
            const deveSublinhar = p.tempoTotal && p.tempoTotal > limite50PorcentoMaior;
            
            if (deveSublinhar) {
                const numeroWidth = doc.getTextWidth(numeroTexto);
                doc.text(numeroTexto, xPos, yPos + 4);
                doc.line(xPos, yPos + 4.5, xPos + numeroWidth, yPos + 4.5);
            } else {
                doc.text(numeroTexto, xPos, yPos + 4);
            }
            xPos += colWidths[3];
            
            // CEDENTE
            let cedente = p.cedente || '';
            if (cedente.length > 28) {
                cedente = cedente.substring(0, 25) + '...';
            }
            doc.text(cedente, xPos, yPos + 4);
            xPos += colWidths[4];
            
            // ANALISTA AUTO - HORÁRIO E TEMPO NA MESMA LINHA
            let textoAnalista = '--';
            if (p.horaAnalise) {
                const tempoEntradaAnalise = calcularTempoEmMinutos(p.horaEntrada, p.horaAnalise);
                let tempoFinal = tempoEntradaAnalise;
                let asterisco = '';
                
                if (maiorPeriodoComDesconto && 
                    maiorPeriodoComDesconto.tipoInicio === 'ENTRADA' && 
                    maiorPeriodoComDesconto.tipoFim === 'ANALISE') {
                    const resultado = calcularDescontoAlmocoPDF(p.horaEntrada, p.horaAnalise);
                    tempoFinal = resultado.tempoFinal;
                    asterisco = '*';
                }
                
                const horaAnalise = formatarHora(p.horaAnalise);
                const tempoAnalise = formatarTempo(tempoFinal);
                textoAnalista = `${horaAnalise} (${tempoAnalise}${asterisco})`;
            }
            doc.text(textoAnalista, xPos, yPos + 4);
            xPos += colWidths[5];
            
            // PENDÊNCIA - HORÁRIO E TEMPO NA MESMA LINHA
            let textoPendencia = '--';
            if (p.horaPendencia) {
                const tempoAnalisePendencia = calcularTempoEmMinutos(p.horaAnalise, p.horaPendencia);
                let tempoFinal = tempoAnalisePendencia;
                let asterisco = '';
                
                if (maiorPeriodoComDesconto && 
                    maiorPeriodoComDesconto.tipoInicio === 'ANALISE' && 
                    maiorPeriodoComDesconto.tipoFim === 'PENDENCIA') {
                    const resultado = calcularDescontoAlmocoPDF(p.horaAnalise, p.horaPendencia);
                    tempoFinal = resultado.tempoFinal;
                    asterisco = '*';
                }
                
                const horaPendencia = formatarHora(p.horaPendencia);
                const tempoPendencia = formatarTempo(tempoFinal);
                textoPendencia = `${horaPendencia} (${tempoPendencia}${asterisco})`;
            }
            doc.text(textoPendencia, xPos, yPos + 4);
            xPos += colWidths[6];
            
            // CHECAGEM - HORÁRIO E TEMPO NA MESMA LINHA
            const entradaChecagem = p.fluxoCompleto ? p.fluxoCompleto.find(f => f.STATUS_FLUXO === "CHECAGEM") : null;
            const horaChecagem = entradaChecagem ? entradaChecagem.DATA_HORA_ENTRADA : null;
            
            let textoChecagem = '--';
            if (horaChecagem) {
                const tempoEntradaChecagem = calcularTempoEmMinutos(p.horaEntrada, horaChecagem);
                let tempoFinal = tempoEntradaChecagem;
                let asterisco = '';
                
                if (maiorPeriodoComDesconto && 
                    maiorPeriodoComDesconto.tipoInicio === 'ENTRADA' && 
                    maiorPeriodoComDesconto.tipoFim === 'CHECAGEM') {
                    const resultado = calcularDescontoAlmocoPDF(p.horaEntrada, horaChecagem);
                    tempoFinal = resultado.tempoFinal;
                    asterisco = '*';
                }
                
                const horaChecagemFormatada = formatarHora(horaChecagem);
                const tempoChecagem = formatarTempo(tempoFinal);
                textoChecagem = `${horaChecagemFormatada} (${tempoChecagem}${asterisco})`;
            }
            doc.text(textoChecagem, xPos, yPos + 4);
            xPos += colWidths[7];
            
            // QCERT - HORÁRIO E TEMPO NA MESMA LINHA
            let textoQCert = '--';
            if (p.horaCertifica) {
                const tempoEtapaAnterior = p.tempoEtapaAnteriorAteCertifica;
                let tempoFinal = tempoEtapaAnterior;
                let asterisco = '';
                
                // Determinar qual foi a etapa anterior para o desconto
                let horaInicio = null;
                if (p.horaPendencia) {
                    horaInicio = p.horaPendencia;
                } else if (p.horaAnalise) {
                    horaInicio = p.horaAnalise;
                } else {
                    horaInicio = p.horaEntrada;
                }
                
                if (maiorPeriodoComDesconto && horaInicio) {
                    const resultado = calcularDescontoAlmocoPDF(horaInicio, p.horaCertifica);
                    if (resultado.tempoOriginal === tempoEtapaAnterior) {
                        tempoFinal = resultado.tempoFinal;
                        asterisco = '*';
                    }
                }
                
                const horaCertifica = formatarHora(p.horaCertifica);
                const tempoCertifica = formatarTempo(tempoFinal);
                textoQCert = `${horaCertifica} (${tempoCertifica}${asterisco})`;
            }
            doc.text(textoQCert, xPos, yPos + 4);
            xPos += colWidths[8];
            
            // PAGO - HORÁRIO E TEMPO NA MESMA LINHA
            let textoPago = '--';
            if (p.horaPagamento) {
                const tempoCertificaPagamento = p.tempoCertificaAtePagamento;
                let tempoFinal = tempoCertificaPagamento;
                let asterisco = '';
                
                if (maiorPeriodoComDesconto && 
                    p.horaCertifica &&
                    maiorPeriodoComDesconto.tipoInicio === 'CERTIFICACAO' && 
                    maiorPeriodoComDesconto.tipoFim === 'PAGAMENTO') {
                    const resultado = calcularDescontoAlmocoPDF(p.horaCertifica, p.horaPagamento);
                    tempoFinal = resultado.tempoFinal;
                    asterisco = '*';
                }
                
                const horaPagamento = formatarHora(p.horaPagamento);
                const tempoPagamento = formatarTempo(tempoFinal);
                textoPago = `${horaPagamento} (${tempoPagamento}${asterisco})`;
            }
            doc.text(textoPago, xPos, yPos + 4);
            xPos += colWidths[9];
            
            // STATUS
            const status = p.statusSimplificado || '';
            doc.text(status, xPos, yPos + 4);
            
            yPos += 6; // AUMENTADO de 5 para 6
        }
        
        // ADICIONAR SEÇÃO DE OBSERVAÇÕES (sempre em nova página)
        if (typeof window.ObservacoesCardService !== 'undefined' && 
            typeof window.ObservacoesCardService.renderizarSecaoObservacoes === 'function') {
            
            console.log('📋 Adicionando seção de observações...');
            window.ObservacoesCardService.renderizarSecaoObservacoes(doc, propostasOrdenadas, startX, totalWidth);
        } else {
            console.warn('⚠️ ObservacoesCardService não disponível - seção de observações não adicionada');
        }
        
        // Salvar o PDF
        const nomeArquivo = `fluxo_operacoes_${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(nomeArquivo);
        
        console.log("PDF gerado com sucesso!");
        
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Erro ao gerar PDF. Verifique o console para mais detalhes.");
    } finally {
        esconderCarregamento();
    }
};

// Função auxiliar para calcular tempo médio entre análise e pendência
function calcularTempoMedioAnalisePendencia(propostas) {
    let totalTempo = 0;
    let contador = 0;
    
    propostas.forEach(p => {
        if (p.horaAnalise && p.horaPendencia) {
            const tempo = calcularTempoEmMinutos(p.horaAnalise, p.horaPendencia);
            if (tempo > 0) {
                totalTempo += tempo;
                contador++;
            }
        }
    });
    
    return contador > 0 ? totalTempo / contador : 0;
}

// Função auxiliar para calcular tempo médio entre pendência e certificação
function calcularTempoMedioPendenciaCertificacao(propostas) {
    let totalTempo = 0;
    let contador = 0;
    
    propostas.forEach(p => {
        if (p.horaPendencia && p.horaCertifica) {
            const tempo = calcularTempoEmMinutos(p.horaPendencia, p.horaCertifica);
            if (tempo > 0) {
                totalTempo += tempo;
                contador++;
            }
        }
    });
    
    return contador > 0 ? totalTempo / contador : 0;
}