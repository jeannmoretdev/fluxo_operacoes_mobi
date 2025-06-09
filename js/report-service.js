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
        const propostasOrdenadas = [...propostasFiltradas];
        
        // Calcular métricas de fluxo
        let metricas = {
            tempoMedioTotal: 0,
            tempoMedioEntradaAnalise: 0,
            tempoMedioAnalisePendencia: 0,
            tempoMedioPendenciaCertificacao: 0,
            propostasComAnalise: 0,
            propostasComPendencia: 0,
            propostasComCertificacao: 0,
            propostasComPagamento: 0
        };
        
        try {
            // Calcular tempo médio total
            let totalTempo = 0;
            let contadorTempo = 0;
            
            // Contadores para etapas
            let contadorAnalise = 0;
            let contadorPendencia = 0;
            let contadorCertificacao = 0;
            let contadorPagamento = 0;
            
            // Contadores para tempos entre etapas
            let totalTempoEntradaAnalise = 0;
            let totalTempoAnalisePendencia = 0;
            let totalTempoPendenciaCertificacao = 0;
            let totalTempoCertificacaoPagamento = 0;
            
            let contadorEntradaAnalise = 0;
            let contadorAnalisePendencia = 0;
            let contadorPendenciaCertificacao = 0;
            let contadorCertificacaoPagamento = 0;
            
            for (let i = 0; i < propostasOrdenadas.length; i++) {
                const p = propostasOrdenadas[i];
                
                if (p.tempoTotal) {
                    totalTempo += p.tempoTotal;
                    contadorTempo++;
                }
                
                // Contar propostas por etapa
                if (p.horaAnalise) contadorAnalise++;
                if (p.horaPendencia) contadorPendencia++;
                if (p.horaCertifica) contadorCertificacao++;
                if (p.horaPagamento) contadorPagamento++;
                
                // Calcular tempos entre etapas
                if (p.horaEntrada && p.horaAnalise) {
                    const tempo = calcularTempoEntreEtapas(p.horaEntrada, p.horaAnalise);
                    totalTempoEntradaAnalise += tempo;
                    contadorEntradaAnalise++;
                }
                
                if (p.horaAnalise && p.horaPendencia) {
                    const tempo = calcularTempoEntreEtapas(p.horaAnalise, p.horaPendencia);
                    totalTempoAnalisePendencia += tempo;
                    contadorAnalisePendencia++;
                }
                
                if (p.horaPendencia && p.horaCertifica) {
                    const tempo = calcularTempoEntreEtapas(p.horaPendencia, p.horaCertifica);
                    totalTempoPendenciaCertificacao += tempo;
                    contadorPendenciaCertificacao++;
                }
                
                if (p.horaCertifica && p.horaPagamento) {
                    const tempo = calcularTempoEntreEtapas(p.horaCertifica, p.horaPagamento);
                    totalTempoCertificacaoPagamento += tempo;
                    contadorCertificacaoPagamento++;
                }
            }
            
            // Calcular médias
            metricas.tempoMedioTotal = contadorTempo > 0 ? totalTempo / contadorTempo : 0;
            metricas.tempoMedioEntradaAnalise = contadorEntradaAnalise > 0 ? totalTempoEntradaAnalise / contadorEntradaAnalise : 0;
            metricas.tempoMedioAnalisePendencia = contadorAnalisePendencia > 0 ? totalTempoAnalisePendencia / contadorAnalisePendencia : 0;
            metricas.tempoMedioPendenciaCertificacao = contadorPendenciaCertificacao > 0 ? totalTempoPendenciaCertificacao / contadorPendenciaCertificacao : 0;
            metricas.tempoMedioCertificacaoPagamento = contadorCertificacaoPagamento > 0 ? totalTempoCertificacaoPagamento / contadorCertificacaoPagamento : 0;
            
            metricas.propostasComAnalise = contadorAnalise;
            metricas.propostasComPendencia = contadorPendencia;
            metricas.propostasComCertificacao = contadorCertificacao;
            metricas.propostasComPagamento = contadorPagamento;
            
            console.log("Métricas calculadas:", metricas);
        } catch (metricasError) {
            console.error("Erro ao calcular métricas:", metricasError);
        }
        
        // Período do relatório
        const dataInicio = formatarData(APP_STATE.dataInicio.toISOString().split('T')[0]);
        const dataFim = formatarData(APP_STATE.dataFim.toISOString().split('T')[0]);
        const hoje = new Date();
        const dataHoje = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${hoje.getFullYear()}`;
        
        // Criar documento PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        // Configurações de fonte e cores
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        
        // Título do relatório
        doc.text('Relatório de Fluxo de Operações', 149, 15, { align: 'center' });
        
        // Subtítulos
        doc.setFontSize(10);
        doc.setTextColor(52, 73, 94);
        doc.text(`Período: ${dataInicio} a ${dataFim}`, 149, 22, { align: 'center' });
        doc.text(`Gerado em: ${dataHoje}`, 149, 27, { align: 'center' });
        doc.text(`Total de operações: ${propostasOrdenadas.length}`, 149, 32, { align: 'center' });
        doc.text(`Tempo Médio Total: ${formatarTempo(metricas.tempoMedioTotal)}`, 149, 37, { align: 'center' });
        
        // Linha separadora
        doc.setDrawColor(189, 195, 199);
        doc.line(10, 42, 287, 42);
        
        // Posição Y atual
        let yPos = 50;
        
        // PARTE 1: VISUALIZAÇÃO DE FLUXO - ALTERADO PARA PENDÊNCIA
        console.log("Gerando visualização de fluxo...");
        
        // Título da seção
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Visualização do Fluxo', 10, yPos);
        
        yPos += 8;
        
        // Desenhar diagrama de fluxo - EM LINHA HORIZONTAL COMPACTA - ALTERADO PARA PENDÊNCIA
        const etapas = ['Entrada', 'Análise', 'Pendência', 'Certif.', 'Pagto'];
        const contagens = [
            propostasOrdenadas.length,
            metricas.propostasComAnalise,
            metricas.propostasComPendencia,
            metricas.propostasComCertificacao,
            metricas.propostasComPagamento
        ];
        const temposEntreEtapas = [
            formatarTempo(metricas.tempoMedioEntradaAnalise),
            formatarTempo(metricas.tempoMedioAnalisePendencia),
            formatarTempo(metricas.tempoMedioPendenciaCertificacao),
            formatarTempo(metricas.tempoMedioCertificacaoPagamento)
        ];
        
        // Configurações compactas para linha horizontal
        const etapaWidth = 35;
        const etapaHeight = 12;
        const arrowWidth = 25;
        const startX = 15;
        
        // Desenhar todas as etapas em linha
        for (let i = 0; i < etapas.length; i++) {
            const x = startX + (i * (etapaWidth + arrowWidth));
            
            // Desenhar caixa da etapa (retângulo compacto)
            doc.setFillColor(41, 128, 185);
            doc.setDrawColor(41, 128, 185);
            doc.rect(x, yPos, etapaWidth, etapaHeight, 'FD');
            
            // Nome da etapa e contagem na mesma linha
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            const textoEtapa = `${etapas[i]} (${contagens[i]})`;
            doc.text(textoEtapa, x + (etapaWidth / 2), yPos + (etapaHeight / 2) + 1, { align: 'center' });
            
            // Desenhar seta se não for a última etapa
            if (i < etapas.length - 1) {
                const arrowX = x + etapaWidth;
                const arrowY = yPos + (etapaHeight / 2);
                
                // Seta "=>" no centro
                doc.setFontSize(12);
                doc.setTextColor(52, 73, 94);
                doc.text("=>", arrowX + (arrowWidth / 2), arrowY + 1, { align: 'center' });
                
                // Tempo entre etapas (abaixo da seta)
                doc.setFontSize(12);
                doc.setTextColor(52, 73, 94);
                doc.text(temposEntreEtapas[i], arrowX + (arrowWidth / 2), arrowY + 6, { align: 'center' });
            }
        }
        
        yPos += etapaHeight + 8;
        
        // PARTE 2: TABELA DE FLUXO DE OPERAÇÕES - ALTERADO PARA PENDÊNCIA
        console.log("Gerando tabela de fluxo...");
        
        // Título da seção
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Detalhamento por Operação', 10, yPos);
        
        yPos += 8;
        
        // Cabeçalhos da tabela - ALTERADO COMITÊ PARA PENDÊNCIA
        const headers = ['DATA', 'Tempo Total', 'ENTRADA GER', 'Nº', 'Cedente', 'ANALISTA', 'PENDÊNCIA', 'CHECAGEM', 'QCERT.', 'PAGO', 'Status'];
        // Ajustar larguras das colunas para 11 colunas
        const colWidths = [18, 22, 22, 8, 35, 24, 24, 24, 24, 24, 30];
        
        // Desenhar cabeçalhos
        doc.setFillColor(236, 240, 241);
        doc.rect(startX, yPos, 287 - (2 * startX), 8, 'F');
        
        doc.setFontSize(8);
        doc.setTextColor(44, 62, 80);

        let xPos = startX + 3;
        headers.forEach((header, i) => {
            doc.text(header, xPos, yPos + 5);
            xPos += colWidths[i];
        });
        
        yPos += 8;
        
        // Adicionar linhas para cada proposta
        for (let i = 0; i < propostasOrdenadas.length; i++) {
            const p = propostasOrdenadas[i];
            
            // Verificar se precisa de nova página
            if (yPos > 180) {
                doc.addPage();
                yPos = 20;
                
                // Redesenhar cabeçalhos na nova página
                doc.setFillColor(236, 240, 241);
                doc.rect(startX, yPos, 287 - (2 * startX), 8, 'F');
                
                doc.setFontSize(8);
                doc.setTextColor(44, 62, 80);
                
                let xPos = startX + 3;
                headers.forEach((header, i) => {
                    doc.text(header, xPos, yPos + 5);
                    xPos += colWidths[i];
                });
                
                yPos += 8;
            }
            
            // Encontrar a entrada de checagem (status "CHECAGEM")
            const entradaChecagem = p.fluxoCompleto ? p.fluxoCompleto.find(f => f.STATUS_FLUXO === "CHECAGEM") : null;
            const horaChecagem = entradaChecagem ? entradaChecagem.DATA_HORA_ENTRADA : null;
            
            // Calcular tempos entre etapas
            const tempoEntradaAnalise = calcularTempoEmMinutos(p.horaEntrada, p.horaAnalise);
            const tempoEntradaChecagem = calcularTempoEmMinutos(p.horaEntrada, horaChecagem);
            const tempoAnaliseCertificacao = calcularTempoEmMinutos(p.horaAnalise, p.horaCertifica);
            const tempoCertificacaoPagamento = calcularTempoEmMinutos(p.horaCertifica, p.horaPagamento);
            
            // NOVO: Calcular tempo para pendência
            const tempoAnalisePendencia = calcularTempoEmMinutos(p.horaAnalise, p.horaPendencia);
            
            // Alternar cores de fundo para linhas (zebra striping)
            if (i % 2 === 0) {
                doc.setFillColor(245, 247, 250);
            } else {
                doc.setFillColor(255, 255, 255);
            }
            doc.rect(startX, yPos, 287 - (2 * startX), 7, 'F');
            
            // Dados da proposta
            doc.setFontSize(7);
            doc.setTextColor(52, 73, 94);
            
            xPos = startX + 3;
            
            // DATA
            doc.text(p.dataFormatada || '', xPos, yPos + 5);
            xPos += colWidths[0];
            
            // Tempo Total
            const textoTempoTotal = formatarTempo(p.tempoTotal) || '--';
            doc.text(textoTempoTotal, xPos, yPos + 5);
            xPos += colWidths[1];
            
            // ENTRADA GER
            const textoEntrada = formatarHora(p.horaEntrada) || '--';
            doc.text(textoEntrada, xPos, yPos + 5);
            xPos += colWidths[2];
            
            // Nº
            doc.text(p.numero.toString(), xPos, yPos + 5);
            xPos += colWidths[3];
            
            // Cedente (truncar se muito longo)
            let cedente = p.cedente || '';
            if (cedente.length > 20) {
                cedente = cedente.substring(0, 17) + '...';
            }
            doc.text(cedente, xPos, yPos + 5);
            xPos += colWidths[4];
            
            // ANALISTA
            let textoAnalista = '--';
            if (p.horaAnalise) {
                const horaAnalise = formatarHora(p.horaAnalise);
                const tempoAnalise = formatarTempo(tempoEntradaAnalise);
                textoAnalista = `${horaAnalise}(${tempoAnalise})`;
            }
            doc.text(textoAnalista, xPos, yPos + 5);
            xPos += colWidths[5];
            
            // PENDÊNCIA - NOVA COLUNA (substituindo COMITÊ)
            let textoPendencia = '--';
            if (p.horaPendencia) {
                const horaPendencia = formatarHora(p.horaPendencia);
                const tempoPendencia = formatarTempo(tempoAnalisePendencia);
                textoPendencia = `${horaPendencia}(${tempoPendencia})`;
            }
            doc.text(textoPendencia, xPos, yPos + 5);
            xPos += colWidths[6];
            
            // CHECAGEM
            let textoChecagem = '--';
            if (horaChecagem) {
                const horaChecagemFormatada = formatarHora(horaChecagem);
                const tempoChecagem = formatarTempo(tempoEntradaChecagem);
                textoChecagem = `${horaChecagemFormatada}(${tempoChecagem})`;
            }
            doc.text(textoChecagem, xPos, yPos + 5);
            xPos += colWidths[7];
            
            // QCERT.
            let textoCertificacao = '--';
            if (p.horaCertifica) {
                const horaCertifica = formatarHora(p.horaCertifica);
                let tempoCertifica;
                
                // LÓGICA CORRIGIDA: Se passou pela pendência, usar tempo da pendência até certificação
                // Se NÃO passou pela pendência, usar tempo da análise até certificação
                if (p.horaPendencia) {
                    // Passou pela pendência: usar tempo da pendência até certificação
                    const tempoPendenciaCertificacao = calcularTempoEmMinutos(p.horaPendencia, p.horaCertifica);
                    tempoCertifica = formatarTempo(tempoPendenciaCertificacao);
                } else if (p.horaAnalise) {
                    // NÃO passou pela pendência: usar tempo da análise até certificação
                    const tempoAnaliseCertificacao = calcularTempoEmMinutos(p.horaAnalise, p.horaCertifica);
                    tempoCertifica = formatarTempo(tempoAnaliseCertificacao);
                } else {
                    // Caso não tenha nem análise nem pendência, usar tempo total até certificação
                    const tempoTotalCertificacao = calcularTempoEmMinutos(p.horaEntrada, p.horaCertifica);
                    tempoCertifica = formatarTempo(tempoTotalCertificacao);
                }
                
                textoCertificacao = `${horaCertifica}(${tempoCertifica})`;
            }
            doc.text(textoCertificacao, xPos, yPos + 5);
            xPos += colWidths[8];
            
            // PAGO
            let textoPagamento = '--';
            if (p.horaPagamento) {
                const horaPagamento = formatarHora(p.horaPagamento);
                const tempoPagamento = formatarTempo(tempoCertificacaoPagamento);
                textoPagamento = `${horaPagamento}(${tempoPagamento})`;
            }
            doc.text(textoPagamento, xPos, yPos + 5);
            xPos += colWidths[9];
            
            // Status
            doc.text(p.statusSimplificado || '', xPos, yPos + 5);
            
            yPos += 7;
        }
        
        // PARTE 3: RELATÓRIO DE OBSERVAÇÕES EM FORMATO DE TABELA
        console.log("Adicionando página de comentários em formato de tabela...");
        
        // Adicionar nova página para os comentários
        doc.addPage();
        yPos = 20;
        
        // Título da seção de comentários
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text('Comentários dos Operadores', 149, yPos, { align: 'center' });
        
        yPos += 15;
        
        // Filtrar apenas propostas com observações E com status PAGO
        let propostasComObservacoes = [];
        try {
            propostasComObservacoes = propostasOrdenadas.filter(p => 
                p && 
                p.observacoes && 
                Array.isArray(p.observacoes) && 
                p.observacoes.length > 0 &&
                p.statusSimplificado === 'PAGO'
            );
            console.log(`Propostas PAGAS com observações: ${propostasComObservacoes.length}`);
        } catch (filterError) {
            console.error("Erro ao filtrar propostas:", filterError);
            propostasComObservacoes = [];
        }

        
        if (propostasComObservacoes.length === 0) {
            // Se não houver observações
            doc.setFontSize(12);
            doc.setTextColor(127, 140, 141);
            doc.text('Nenhuma observação encontrada.', 149, yPos, { align: 'center' });
        } else {
            // Cabeçalhos da tabela de observações
            const obsHeaders = ['Nº', 'Cedente', 'Status', 'Comentários'];
            const obsColWidths = [8, 50, 30, 177];
            const obsStartX = 10;
            const colMargin = 3;
            
            // Desenhar cabeçalhos
            doc.setFillColor(236, 240, 241);
            doc.rect(obsStartX, yPos, 287 - (2 * obsStartX), 8, 'F');
            
            doc.setFontSize(9);
            doc.setTextColor(44, 62, 80);

            // Posições X para cada coluna, considerando as margens
            const colX = [
                obsStartX + colMargin,
                obsStartX + obsColWidths[0] + colMargin,
                obsStartX + obsColWidths[0] + obsColWidths[1] + colMargin,
                obsStartX + obsColWidths[0] + obsColWidths[1] + obsColWidths[2] + colMargin
            ];
            
            // Desenhar os cabeçalhos nas posições corretas
            obsHeaders.forEach((header, i) => {
                doc.text(header, colX[i], yPos + 5);
            });

            yPos += 8;
            
            // Para cada proposta com observações
            for (let i = 0; i < propostasComObservacoes.length; i++) {
                const proposta = propostasComObservacoes[i];
                
                // Filtrar apenas observações de operadores (agora incluindo GER)
                let observacoesOperadores = [];
                try {
                    if (proposta.observacoes && Array.isArray(proposta.observacoes)) {
                        observacoesOperadores = proposta.observacoes.filter(obs => 
                            obs && obs.USUARIO && obs.USUARIO !== 'SISTEMA'
                        );
                    }
                } catch (obsError) {
                    console.error("Erro ao filtrar observações:", obsError);
                    observacoesOperadores = [];
                }
                
                // Pular se não houver observações de operadores
                if (observacoesOperadores.length === 0) {
                    continue;
                }
                
                // Preparar o texto dos comentários
                let comentariosTexto = '';
                try {
                    // Concatenar todos os comentários com o nome do usuário
                    observacoesOperadores.forEach((obs, index) => {
                        if (index > 0) {
                            comentariosTexto += '\n\n';
                        }
                        const observacao = obs.OBSERVACAO ? obs.OBSERVACAO.replace(/\\n/g, ' ') : '';
                        comentariosTexto += `${obs.USUARIO || 'Desconhecido'}: ${observacao}`;
                    });
                } catch (concatError) {
                    console.error("Erro ao concatenar comentários:", concatError);
                    comentariosTexto = "[Erro ao processar comentários]";
                }

                
                // Calcular altura necessária para o texto dos comentários
                const comentariosLinhas = doc.splitTextToSize(comentariosTexto, obsColWidths[3] - 6);
                const alturaComentarios = comentariosLinhas.length * 5 + 2;
                const alturaLinha = Math.max(7, alturaComentarios);
                
                // Verificar se precisa de nova página
                if (yPos + alturaLinha > 190) {
                    doc.addPage();
                    yPos = 20;
                    
                    // Redesenhar cabeçalhos na nova página
                    doc.setFillColor(236, 240, 241);
                    doc.rect(obsStartX, yPos, 287 - (2 * obsStartX), 8, 'F');
                    
                    doc.setFontSize(9);
                    doc.setTextColor(44, 62, 80);
                    
                    let obsXPos = obsStartX + 3;
                    obsHeaders.forEach((header, i) => {
                        doc.text(header, obsXPos, yPos + 5);
                        obsXPos += obsColWidths[i];
                    });
                    
                    yPos += 8;
                }
                
                // Alternar cores de fundo para linhas (zebra striping)
                if (i % 2 === 0) {
                    doc.setFillColor(245, 247, 250);
                } else {
                    doc.setFillColor(255, 255, 255);
                }
                doc.rect(obsStartX, yPos, 287 - (2 * obsStartX), alturaLinha, 'F');
                
                // Dados da proposta
                doc.setFontSize(8);
                doc.setTextColor(52, 73, 94);
                
                // Número
                doc.text(proposta.numero.toString(), obsStartX + 3, yPos + 5);
                
                // Cedente (truncar se for muito longo)
                let cedente = proposta.cedente || '';
                if (cedente.length > 40) {
                    cedente = cedente.substring(0, 37) + '...';
                }
                doc.text(cedente, obsStartX + obsColWidths[0] + 3, yPos + 5);
                
                // Status
                doc.text(proposta.statusSimplificado || '', obsStartX + obsColWidths[0] + obsColWidths[1] + 3, yPos + 5);
                
                // Comentários (com quebra de linha)
                try {
                    doc.text(comentariosLinhas, obsStartX + obsColWidths[0] + obsColWidths[1] + obsColWidths[2] + 3, yPos + 5);
                } catch (textError) {
                    console.error("Erro ao renderizar texto:", textError);
                    doc.text("[Erro ao exibir comentários]", obsStartX + obsColWidths[0] + obsColWidths[1] + obsColWidths[2] + 3, yPos + 5);
                }
                
                yPos += alturaLinha;
            }
        }
        
        // Adicionar numeração de páginas
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(127, 140, 141);
            doc.text(`Página ${i} de ${totalPages}`, 149, 200, { align: 'center' });
        }
        
        // Salvar o PDF
        const nomeArquivo = `relatorio_fluxo_${dataInicio.replace(/\//g, '')}_${dataFim.replace(/\//g, '')}.pdf`;
        doc.save(nomeArquivo);
        
        console.log("PDF gerado com sucesso!");
        
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert(`Erro ao gerar relatório: ${error.message}`);
    } finally {
        // Esconder indicador de carregamento
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