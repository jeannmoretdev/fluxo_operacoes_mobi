/**
 * Arquivo de teste para verificar se o sistema de PDF está funcionando
 * USANDO A MESMA BIBLIOTECA DO REPORT-SERVICE
 */

window.testePDF = function() {
    console.log('🧪 Iniciando teste do sistema de PDF (compatível com report-service)...');
    
    // Teste 1: Verificar se jsPDF está carregado (mesma verificação do report-service)
    if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
        console.error('❌ jsPDF não está carregado');
        console.log('💡 Verifique se o CDN do jsPDF está funcionando');
        return false;
    }
    
    const jsPDFClass = window.jspdf?.jsPDF || window.jsPDF;
    if (!jsPDFClass) {
        console.error('❌ Classe jsPDF não encontrada');
        return false;
    }
    
    console.log('✅ jsPDF carregado com sucesso');
    
    // Teste 2: Verificar se PDFUtils está carregado
    if (typeof window.PDFUtils === 'undefined') {
        console.error('❌ PDFUtils não está carregado');
        return false;
    }
    console.log('✅ PDFUtils carregado');
    
    // Teste 3: Tentar inicializar o gerador
    const { PDFGenerator } = window.PDFUtils;
    const pdfGen = new PDFGenerator();
    
    pdfGen.inicializar()
        .then(() => {
            console.log('✅ PDFGenerator inicializado com sucesso');
            
            // Teste 4: Gerar um PDF de teste completo
            pdfGen.adicionarTextoCentralizado('TESTE DO SISTEMA DE PDF', 18, true);
            pdfGen.adicionarEspaco(1);
            
            pdfGen.adicionarLinhaSeparadora();
            pdfGen.adicionarEspaco(0.5);
            
            pdfGen.adicionarTexto('INFORMAÇÕES DO TESTE', 14, true, [52, 152, 219]);
            pdfGen.adicionarEspaco(0.5);
            
            pdfGen.adicionarTexto('✅ Sistema de PDF funcionando corretamente!', 12);
            pdfGen.adicionarTexto('📄 Biblioteca jsPDF carregada com sucesso', 11);
            pdfGen.adicionarTexto('🔧 PDFUtils inicializado corretamente', 11);
            pdfGen.adicionarTexto(`📅 Data do teste: ${new Date().toLocaleString('pt-BR')}`, 11);
            pdfGen.adicionarTexto(`🌐 Navegador: ${navigator.userAgent.split(')')[0]})`, 10);
            
            pdfGen.adicionarEspaco(1);
            pdfGen.adicionarLinhaSeparadora();
            pdfGen.adicionarEspaco(0.5);
            
            // Teste de tabela
            pdfGen.adicionarTexto('TESTE DE TABELA', 12, true, [155, 89, 182]);
            pdfGen.adicionarEspaco(0.5);
            
            const dadosTabela = [
                ['1', 'Teste A', 'R$ 1.000,00'],
                ['2', 'Teste B', 'R$ 2.500,00'],
                ['3', 'Teste C', 'R$ 3.750,00']
            ];
            
            const colunas = ['#', 'Descrição', 'Valor'];
            const larguras = [20, 80, 40];
            
            pdfGen.adicionarTabela(dadosTabela, colunas, larguras);
            
            pdfGen.adicionarEspaco(1);
            pdfGen.adicionarTexto('🎉 Se você conseguir baixar este PDF, o sistema está 100% funcional!', 12, true, [39, 174, 96]);
            
            // Salvar arquivo de teste
            pdfGen.salvar('teste-sistema-pdf.pdf');
            
            console.log('✅ Teste concluído! PDF de teste gerado com sucesso.');
            
            // Mostrar notificação de sucesso
            mostrarNotificacaoTeste('🎉 Teste concluído! PDF baixado com sucesso!', 'success');
            
            return true;
        })
        .catch(error => {
            console.error('❌ Erro no teste:', error);
            mostrarNotificacaoTeste(`❌ Erro no teste: ${error.message}`, 'error');
            return false;
        });
};

/**
 * Função para mostrar notificação do teste
 */
function mostrarNotificacaoTeste(mensagem, tipo = 'info') {
    const cores = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    const notificacao = document.createElement('div');
    notificacao.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${cores[tipo]};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: 'Segoe UI', sans-serif;
        font-size: 14px;
        max-width: 400px;
        border-left: 4px solid rgba(255,255,255,0.3);
    `;
    
    notificacao.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            <div>
                <strong>Teste do Sistema PDF</strong><br>
                ${mensagem}
            </div>
        </div>
    `;
    
    document.body.appendChild(notificacao);
    
    // Remover após 6 segundos
    setTimeout(() => {
        if (document.body.contains(notificacao)) {
            document.body.removeChild(notificacao);
        }
    }, 6000);
}

/**
 * Teste específico para verificar compatibilidade com report-service
 */
window.testeCompatibilidadeReportService = function() {
    console.log('🔄 Testando compatibilidade com report-service...');
    
    // Verificar se as mesmas verificações do report-service funcionam
    const jsPDFClass = window.jspdf?.jsPDF || window.jsPDF;
    
    if (!jsPDFClass) {
        console.error('❌ Incompatível: jsPDF não encontrado da mesma forma que o report-service');
        return false;
    }
    
    try {
        // Tentar criar um documento da mesma forma que o report-service
        const doc = new jsPDFClass({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        doc.setFontSize(16);
        doc.text('Teste de Compatibilidade', 20, 30);
        doc.save('teste-compatibilidade.pdf');
        
        console.log('✅ Compatibilidade confirmada com report-service');
        mostrarNotificacaoTeste('✅ Sistema compatível com report-service!', 'success');
        return true;
        
    } catch (error) {
        console.error('❌ Erro de compatibilidade:', error);
        mostrarNotificacaoTeste(`❌ Erro de compatibilidade: ${error.message}`, 'error');
        return false;
    }
};

// Auto-executar informações quando o arquivo for carregado
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('📄 Sistema de teste PDF carregado.');
        console.log('🧪 Execute testePDF() no console para testar o sistema completo');
        console.log('🔄 Execute testeCompatibilidadeReportService() para testar compatibilidade');
        
        // Verificação automática básica
        if (typeof window.jspdf !== 'undefined' || typeof window.jsPDF !== 'undefined') {
            console.log('✅ jsPDF detectado automaticamente');
        } else {
            console.warn('⚠️ jsPDF não detectado. Verifique se o CDN está carregando');
        }
        
        if (typeof window.PDFUtils !== 'undefined') {
            console.log('✅ PDFUtils detectado automaticamente');
        } else {
            console.warn('⚠️ PDFUtils não detectado. Verifique se pdf-utils.js foi carregado');
        }
    }, 2000);
});