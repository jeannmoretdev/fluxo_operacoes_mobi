/**
 * Função de debug para testar renderização
 */
function testarRenderizacaoObservacoes() {
    console.log('🧪 === TESTE DE RENDERIZAÇÃO DE OBSERVAÇÕES ===');
    
    // Simular algumas observações para teste
    const propostaTeste = {
        numero: '12345',
        cedente: 'EMPRESA TESTE LTDA',
        statusSimplificado: 'PAGO',
        observacoes: [
            {
                USUARIO: 'GER',
                OBSERVACAO: 'Esta é uma observação de teste muito longa para verificar como o sistema quebra o texto e se está funcionando corretamente a renderização em múltiplas linhas.',
                DATA_HORA: '2024-01-15T10:30:00'
            },
            {
                USUARIO: 'ANALISTA',
                OBSERVACAO: 'Observação curta',
                DATA_HORA: '2024-01-15T11:00:00'
            },
            {
                USUARIO: 'GER',
                OBSERVACAO: 'Outra observação de teste para verificar se o sistema está controlando corretamente as páginas e não cortando o conteúdo.',
                DATA_HORA: '2024-01-15T11:30:00'
            }
        ]
    };
    
    // Criar PDF de teste
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Simular uma posição próxima ao final da página
    let yPos = 250; // Começar próximo ao limite para forçar quebra
    
    console.log(`🎯 Iniciando teste com yPos: ${yPos}mm (próximo ao limite)`);
    
    // Testar renderização
    if (window.ObservacoesCardService) {
        const resultado = window.ObservacoesCardService.renderizarSecaoObservacoes(
            doc, 
            [propostaTeste], 
            yPos, 
            20, 
            170
        );
        
        console.log(`✅ Teste concluído, yPos final: ${resultado}mm`);
        
        // Salvar PDF de teste
        doc.save('teste-observacoes-debug.pdf');
        console.log('💾 PDF de teste salvo como: teste-observacoes-debug.pdf');
    } else {
        console.error('❌ ObservacoesCardService não encontrado');
    }
}

// Disponibilizar globalmente para teste manual
window.testarRenderizacaoObservacoes = testarRenderizacaoObservacoes;