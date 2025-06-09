/**
 * Utilitários para geração de PDF - USANDO A MESMA BIBLIOTECA DO REPORT-SERVICE
 * Compatível com o sistema existente de relatórios
 */

(function() {
    'use strict';
    
    console.log('📄 Carregando utilitários PDF (compatível com report-service)...');
    
    // Verificar se jsPDF está disponível (mesma verificação do report-service)
    function verificarJsPDF() {
        return new Promise((resolve, reject) => {
            // Verificar se já está disponível
            if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
                console.log('✅ jsPDF já está disponível (window.jspdf.jsPDF)');
                resolve(window.jspdf.jsPDF);
                return;
            }
            
            if (typeof window.jsPDF !== 'undefined') {
                console.log('✅ jsPDF já está disponível (window.jsPDF)');
                resolve(window.jsPDF);
                return;
            }
            
            // Se não estiver disponível, rejeitar (o CDN deve estar carregado)
            reject(new Error('jsPDF não está carregado. Verifique se o CDN está funcionando.'));
        });
    }
    
    // Classe para geração de PDF (compatível com report-service)
    class PDFGenerator {
        constructor() {
            this.jsPDF = null;
            this.doc = null;
            this.pageWidth = 0;
            this.pageHeight = 0;
            this.margin = 10;
            this.lineHeight = 7;
            this.yPosition = 20;
        }
        
        async inicializar() {
            try {
                this.jsPDF = await verificarJsPDF();
                
                // Usar a mesma configuração do report-service
                this.doc = new this.jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });
                
                this.pageWidth = this.doc.internal.pageSize.getWidth();
                this.pageHeight = this.doc.internal.pageSize.getHeight();
                this.yPosition = this.margin + 10;
                
                console.log('✅ PDF inicializado com sucesso');
                return true;
            } catch (error) {
                console.error('❌ Erro ao inicializar PDF:', error);
                throw error;
            }
        }
        
        verificarNovaPagina(alturaNeccessaria = this.lineHeight) {
            if (this.yPosition + alturaNeccessaria > this.pageHeight - this.margin - 20) {
                this.doc.addPage();
                this.yPosition = this.margin + 10;
                return true;
            }
            return false;
        }
        
        adicionarTextoCentralizado(texto, tamanhoFonte = 12, negrito = false) {
            this.doc.setFontSize(tamanhoFonte);
            this.doc.setFont('helvetica', negrito ? 'bold' : 'normal');
            this.doc.setTextColor(44, 62, 80);
            
            const larguraTexto = this.doc.getTextWidth(texto);
            const x = (this.pageWidth - larguraTexto) / 2;
            
            this.verificarNovaPagina();
            this.doc.text(texto, x, this.yPosition);
            this.yPosition += this.lineHeight + 2;
        }
        
        adicionarTexto(texto, tamanhoFonte = 10, negrito = false, cor = null) {
            this.doc.setFontSize(tamanhoFonte);
            this.doc.setFont('helvetica', negrito ? 'bold' : 'normal');
            
            if (cor) {
                this.doc.setTextColor(cor[0], cor[1], cor[2]);
            } else {
                this.doc.setTextColor(52, 73, 94);
            }
            
            // Quebrar texto longo em múltiplas linhas
            const larguraMaxima = this.pageWidth - (this.margin * 2);
            const linhas = this.doc.splitTextToSize(texto, larguraMaxima);
            
            for (const linha of linhas) {
                this.verificarNovaPagina();
                this.doc.text(linha, this.margin, this.yPosition);
                this.yPosition += this.lineHeight;
            }
        }
        
        adicionarEspaco(linhas = 1) {
            this.yPosition += this.lineHeight * linhas;
        }
        
        adicionarLinhaSeparadora() {
            this.verificarNovaPagina(5);
            this.doc.setDrawColor(189, 195, 199);
            this.doc.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition);
            this.yPosition += 5;
        }
        
        adicionarTabela(dados, colunas, largurasColunas) {
            const startX = this.margin;
            const alturaLinha = 8;
            const alturaCabecalho = 10;
            
            // Verificar se há espaço para pelo menos o cabeçalho
            this.verificarNovaPagina(alturaCabecalho + alturaLinha);
            
            // Desenhar cabeçalho
            this.doc.setFillColor(236, 240, 241);
            this.doc.rect(startX, this.yPosition, this.pageWidth - (2 * this.margin), alturaCabecalho, 'F');
            
            this.doc.setFontSize(9);
            this.doc.setFont('helvetica', 'bold');
            this.doc.setTextColor(44, 62, 80);
            
            let xPos = startX + 3;
            colunas.forEach((coluna, i) => {
                this.doc.text(coluna, xPos, this.yPosition + 6);
                xPos += largurasColunas[i];
            });
            
            this.yPosition += alturaCabecalho;
            
            // Desenhar dados
            dados.forEach((item, index) => {
                this.verificarNovaPagina(alturaLinha);
                
                // Alternar cores de fundo
                if (index % 2 === 0) {
                    this.doc.setFillColor(248, 249, 250);
                    this.doc.rect(startX, this.yPosition, this.pageWidth - (2 * this.margin), alturaLinha, 'F');
                }
                
                this.doc.setFontSize(8);
                this.doc.setFont('helvetica', 'normal');
                this.doc.setTextColor(52, 73, 94);
                
                xPos = startX + 3;
                item.forEach((valor, i) => {
                    // Truncar texto se for muito longo
                    let textoTruncado = valor.toString();
                    const larguraMaxima = largurasColunas[i] - 6;
                    
                    while (this.doc.getTextWidth(textoTruncado) > larguraMaxima && textoTruncado.length > 3) {
                        textoTruncado = textoTruncado.substring(0, textoTruncado.length - 4) + '...';
                    }
                    
                    this.doc.text(textoTruncado, xPos, this.yPosition + 5);
                    xPos += largurasColunas[i];
                });
                
                this.yPosition += alturaLinha;
            });
        }
        
        adicionarRodape() {
            const totalPaginas = this.doc.internal.getNumberOfPages();
            
            for (let i = 1; i <= totalPaginas; i++) {
                this.doc.setPage(i);
                this.doc.setFontSize(8);
                this.doc.setFont('helvetica', 'normal');
                this.doc.setTextColor(127, 140, 141);
                
                // Número da página (centralizado)
                this.doc.text(`Página ${i} de ${totalPaginas}`, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
                
                // Nome do sistema (canto esquerdo)
                this.doc.text('Sistema de Fluxo de Propostas', this.margin, this.pageHeight - 10);
                
                // Data de geração (canto direito)
                const agora = new Date().toLocaleString('pt-BR');
                this.doc.text(agora, this.pageWidth - this.margin, this.pageHeight - 10, { align: 'right' });
            }
        }
        
        salvar(nomeArquivo) {
            this.adicionarRodape();
            this.doc.save(nomeArquivo);
            console.log(`✅ PDF salvo: ${nomeArquivo}`);
        }
    }
    
    // Funções de formatação (mesmas do utils.js)
    function formatarMoedaPDF(valor) {
        if (typeof window.formatarMoedaPersonalizada === 'function') {
            return window.formatarMoedaPersonalizada(valor, false);
        }
        
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }
    
    function formatarDataPDF(dataString) {
        if (typeof window.formatarData === 'function') {
            return window.formatarData(dataString);
        }
        
        try {
            const partes = dataString.split('-');
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        } catch (e) {
            return dataString;
        }
    }
    
    function formatarHoraPDF(dataHora) {
        if (typeof window.formatarHora === 'function') {
            return window.formatarHora(dataHora);
        }
        
        try {
            const data = new Date(dataHora);
            return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return '--:--';
        }
    }
    
    // Expor globalmente
    window.PDFUtils = {
        PDFGenerator,
        verificarJsPDF,
        formatarMoedaPDF,
        formatarDataPDF,
        formatarHoraPDF
    };
    
    console.log('✅ Utilitários PDF carregados (compatível com report-service)');
})();