/**
 * Serviço para renderização de observações em PDF
 * LAYOUT EM 3 COLUNAS COMPACTO: CEDENTE | STATUS | OBSERVAÇÕES
 * MÁXIMO 5 COMENTÁRIOS POR PÁGINA
 */

const ObservacoesCardService = {
    
    /**
     * Renderizar seção de observações (sempre em nova página)
     */
    renderizarSecaoObservacoes: function(doc, propostasFiltradas, startX, totalWidth) {
        console.log('\n📋 === INICIANDO SEÇÃO DE OBSERVAÇÕES ===');
        
        // Filtrar propostas PAGAS com observações
        const propostasComObservacoes = propostasFiltradas.filter(p => 
            p.statusSimplificado === 'PAGO' && 
            p.observacoes && 
            p.observacoes.length > 0
        );
        
        console.log(`📊 Propostas pagas com observações: ${propostasComObservacoes.length}`);
        
        if (propostasComObservacoes.length === 0) {
            console.log('ℹ️ Nenhuma proposta paga com observações - seção não adicionada');
            return;
        }
        
        // SEMPRE NOVA PÁGINA para observações
        doc.addPage();
        let yPos = 15; // Mais próximo da margem superior
        let contadorPorPagina = 0;
        
        console.log('📄 Nova página criada para observações');
        
        // TÍTULO DA SEÇÃO
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(44, 62, 80);
        doc.text('Observações Detalhadas (Propostas Pagas)', startX, yPos);
        yPos += 8;
        
        // CABEÇALHO DAS COLUNAS
        yPos = this.renderizarCabecalhoColunas(doc, yPos, startX, totalWidth);
        yPos += 3;
        
        // RENDERIZAR CADA PROPOSTA
        propostasComObservacoes.forEach((proposta, index) => {
            console.log(`📝 Renderizando observações ${index + 1}/${propostasComObservacoes.length}: ${proposta.numero}`);
            
            // Verificar se precisa de nova página (máximo 5 por página)
            if (contadorPorPagina >= 5) {
                doc.addPage();
                yPos = 15;
                contadorPorPagina = 0;
                
                // Recriar cabeçalho na nova página
                yPos = this.renderizarCabecalhoColunas(doc, yPos, startX, totalWidth);
                yPos += 3;
            }
            
            const resultado = this.renderizarPropostaColunas(doc, proposta, yPos, startX, totalWidth);
            yPos = resultado.yPos;
            contadorPorPagina++;
        });
        
        console.log('✅ Seção de observações concluída');
    },
    
    /**
     * Renderizar cabeçalho das colunas
     */
    renderizarCabecalhoColunas: function(doc, yPos, startX, totalWidth) {
        // Definir larguras das colunas FIXAS
        const coluna1Width = 50; // 50mm - Cedente
        const coluna2Width = 25; // 25mm - Status
        const coluna3Width = totalWidth - coluna1Width - coluna2Width; // Resto - Observações
        
        const coluna1X = startX;
        const coluna2X = startX + coluna1Width;
        const coluna3X = startX + coluna1Width + coluna2Width;
        
        // Fundo do cabeçalho
        doc.setFillColor(240, 240, 240);
        doc.rect(startX, yPos, totalWidth, 6, 'F');
        
        // Bordas das colunas
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(coluna2X, yPos, coluna2X, yPos + 6);
        doc.line(coluna3X, yPos, coluna3X, yPos + 6);
        
        // Borda do cabeçalho COMPLETA
        doc.rect(startX, yPos, totalWidth, 6);
        
        // Textos do cabeçalho
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 60);
        
        doc.text('CEDENTE', coluna1X + 1, yPos + 4);
        doc.text('STATUS', coluna2X + 1, yPos + 4);
        doc.text('OBSERVAÇÕES', coluna3X + 1, yPos + 4);
        
        return yPos + 6;
    },
    
    /**
     * Renderizar uma proposta em formato de colunas
     */
    renderizarPropostaColunas: function(doc, proposta, yPos, startX, totalWidth) {
        // Definir larguras das colunas FIXAS (mesmas do cabeçalho)
        const coluna1Width = 50;
        const coluna2Width = 25;
        const coluna3Width = totalWidth - coluna1Width - coluna2Width;
        
        const coluna1X = startX;
        const coluna2X = startX + coluna1Width;
        const coluna3X = startX + coluna1Width + coluna2Width;
        
        // Preparar dados
        const numeroProposta = proposta.numero || '';
        let nomeCedente = proposta.cedente || '';
        const status = proposta.statusSimplificado || '';
        const observacoesOrdenadas = this.ordenarObservacoesPorData(proposta.observacoes);
        
        // Truncar cedente para caber na coluna de 50mm
        if (nomeCedente.length > 35) {
            nomeCedente = nomeCedente.substring(0, 32) + '...';
        }
        
        // Preparar texto das observações COM MAIOR ESPAÇAMENTO
        let textoObservacoes = '';
        observacoesOrdenadas.forEach((obs, index) => {
            const usuario = obs.USUARIO || 'Desconhecido';
            const observacao = obs.OBSERVACAO || '';
            
            if (index > 0) textoObservacoes += '\n\n'; // DUAS quebras de linha para maior espaçamento
            textoObservacoes += `${usuario}: ${observacao}`;
        });
        
        // Calcular altura necessária baseada nas observações
        const maxWidthObs = coluna3Width - 2;
        const linhasObservacoes = doc.splitTextToSize(textoObservacoes, maxWidthObs);
        
        // Altura mais compacta - mínimo 25mm
        const alturaLinha = Math.max(25, linhasObservacoes.length * 3.2 + 8);
        
        // FUNDO ALTERNADO
        const isLinhaImpar = Math.floor(yPos / 30) % 2 === 0;
        if (isLinhaImpar) {
            doc.setFillColor(250, 250, 250);
            doc.rect(startX, yPos, totalWidth, alturaLinha, 'F');
        }
        
        // BORDAS COMPLETAS DAS COLUNAS
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        
        // Bordas verticais (colunas)
        doc.line(coluna2X, yPos, coluna2X, yPos + alturaLinha);
        doc.line(coluna3X, yPos, coluna3X, yPos + alturaLinha);
        
        // Bordas laterais (esquerda e direita)
        doc.line(startX, yPos, startX, yPos + alturaLinha); // Borda esquerda
        doc.line(startX + totalWidth, yPos, startX + totalWidth, yPos + alturaLinha); // Borda direita
        
        // Borda horizontal inferior
        doc.line(startX, yPos + alturaLinha, startX + totalWidth, yPos + alturaLinha);
        
        // COLUNA 1: CEDENTE (proposta + cedente na mesma linha)
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 60, 80);
        
        // Proposta e cedente na mesma linha
        const textoCedente = `${numeroProposta} - ${nomeCedente}`;
        
        // Quebrar o texto se necessário para caber na coluna
        const linhasColuna1 = doc.splitTextToSize(textoCedente, coluna1Width - 2);
        let yPosColuna1 = yPos + 4;
        
        for (let i = 0; i < linhasColuna1.length; i++) {
            doc.text(linhasColuna1[i], coluna1X + 1, yPosColuna1);
            yPosColuna1 += 3.5;
        }
        
        // COLUNA 2: STATUS
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        const corStatus = this.obterCorStatus(status);
        doc.setTextColor(corStatus[0], corStatus[1], corStatus[2]);
        doc.text(status, coluna2X + 1, yPos + 4);
        
        // COLUNA 3: OBSERVAÇÕES COM ESPAÇAMENTO MAIOR
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        let yPosObs = yPos + 4;
        for (let i = 0; i < linhasObservacoes.length; i++) {
            const linha = linhasObservacoes[i];
            doc.text(linha, coluna3X + 1, yPosObs);
            
            // Se a linha está vazia (quebra entre comentários), dar espaço extra
            if (linha.trim() === '') {
                yPosObs += 2; // Espaço extra para separar comentários
            } else {
                yPosObs += 3.2; // Espaçamento normal entre linhas
            }
        }
        
        return {
            yPos: yPos + alturaLinha,
            altura: alturaLinha
        };
    },
    
    /**
     * Ordenar observações por data (mais recentes primeiro)
     */
    ordenarObservacoesPorData: function(observacoes) {
        if (!observacoes || !Array.isArray(observacoes)) {
            return [];
        }
        
        return observacoes.slice().sort(function(a, b) {
            if (!a.DATA_HORA || !b.DATA_HORA) return 0;
            return new Date(b.DATA_HORA) - new Date(a.DATA_HORA);
        });
    },
    
    /**
     * Cores para status
     */
    obterCorStatus: function(status) {
        const cores = {
            'PAGO': [39, 174, 96],        // Verde
            'PENDÊNCIA': [52, 152, 219],  // Azul
            'RECUSADO': [231, 76, 60],    // Vermelho
            'POSTERGADO': [241, 196, 15], // Amarelo
            'CHECAGEM': [52, 152, 219],   // Azul
            'DIGITANDO': [155, 89, 182]   // Roxo
        };
        
        return cores[status] || [100, 100, 100];
    }
};

// Disponibilizar globalmente
window.ObservacoesCardService = ObservacoesCardService;

console.log('✅ ObservacoesCardService carregado - Layout com Bordas Completas');