// Event handlers para relatórios

// Configurar event listeners para relatórios
function configurarEventListenersRelatorios() {
    // Controle do dropdown de relatórios
    document.getElementById('report-button').addEventListener('click', function(event) {
        event.stopPropagation();
        document.querySelector('.report-dropdown-content').classList.toggle('show');
    });
    
    // Fechar o dropdown ao clicar em qualquer lugar fora dele
    document.addEventListener('click', function(event) {
        const dropdown = document.querySelector('.report-dropdown-content');
        if (dropdown.classList.contains('show') && !event.target.closest('.report-dropdown')) {
            dropdown.classList.remove('show');
        }
    });
    
    // Botão de PDF de fluxo de operações - CHAMANDO A FUNÇÃO CORRETA
    document.getElementById('pdf-flow-button').addEventListener('click', function() {
        document.querySelector('.report-dropdown-content').classList.remove('show');
        
        // Verificar se o ReportService existe e tem a função correta
        if (typeof ReportService !== 'undefined' && ReportService.gerarPDFFluxoOperacoes) {
            try {
                // Chamar a função que já existe no report-service.js
                ReportService.gerarPDFFluxoOperacoes();
                
            } catch (error) {
                console.error('Erro ao gerar PDF:', error);
                alert(`Erro ao gerar PDF: ${error.message}`);
            }
        } else {
            console.error('ReportService.gerarPDFFluxoOperacoes não encontrado');
            console.log('ReportService disponível:', typeof ReportService);
            console.log('Funções disponíveis:', ReportService ? Object.keys(ReportService) : 'N/A');
            alert('Erro: Função de geração de PDF não disponível');
        }
    });
    
    // Botão de observações
    document.getElementById('observations-button').addEventListener('click', function() {
        document.querySelector('.report-dropdown-content').classList.remove('show');
        
        if (typeof ReportService !== 'undefined' && ReportService.gerarRelatorioObservacoes) {
            ReportService.gerarRelatorioObservacoes();
        } else {
            console.error('Função de relatório de observações não encontrada');
            alert('Erro: Função de relatório de observações não disponível');
        }
    });
    
    // Fechar o dropdown ao pressionar ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            document.querySelector('.report-dropdown-content').classList.remove('show');
        }
    });
}

// Manipulador para o botão de relatório compacto
function handleRelatorioCompacto() {
    // Mostrar indicador de carregamento
    mostrarLoading('Gerando relatório compacto...');
    
    // Obter as propostas filtradas atuais
    const propostasFiltradas = filtrarPropostas();
    
    // Gerar o HTML do relatório
    const reportHTML = gerarRelatorioCompacto(propostasFiltradas);
    
    // Esconder indicador de carregamento
    esconderLoading();
    
    // Exibir o relatório em um modal
    mostrarModalRelatorio('Relatório Compacto', reportHTML);
}

// Função para mostrar o modal de relatório
function mostrarModalRelatorio(titulo, conteudoHTML) {
    const modal = document.querySelector('.report-modal');
    const modalTitle = modal.querySelector('.report-modal-title');
    const modalContent = modal.querySelector('.report-modal-content');
    
    modalTitle.textContent = titulo;
    
    // Adicionar o conteúdo do relatório
    const reportContainer = document.createElement('div');
    reportContainer.className = 'report-container';
    reportContainer.innerHTML = conteudoHTML;
    
    // Limpar conteúdo anterior
    modalContent.innerHTML = '';
    
    // Adicionar cabeçalho do modal
    const headerDiv = document.createElement('div');
    headerDiv.className = 'report-modal-header';
    headerDiv.innerHTML = `
        <h2 class="report-modal-title">${titulo}</h2>
        <button class="report-modal-close">&times;</button>
    `;
    
    modalContent.appendChild(headerDiv);
    modalContent.appendChild(reportContainer);
    
    // Adicionar botões de ação
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'report-actions';
    
    // Botão para imprimir
    const printButton = document.createElement('button');
    printButton.className = 'report-print';
    printButton.innerHTML = '<i class="fas fa-print"></i> Imprimir';
    printButton.addEventListener('click', () => {
        window.print();
    });
    
    // Botão para exportar como PDF
    const pdfButton = document.createElement('button');
    pdfButton.className = 'report-export';
    pdfButton.innerHTML = '<i class="fas fa-file-pdf"></i> Exportar PDF';
    pdfButton.addEventListener('click', () => {
        exportarPDF(titulo);
    });
    
    actionsDiv.appendChild(printButton);
    actionsDiv.appendChild(pdfButton);
    modalContent.appendChild(actionsDiv);
    
    // Exibir o modal
    modal.style.display = 'flex';
    
    // Adicionar manipulador para fechar o modal
    const closeButton = modalContent.querySelector('.report-modal-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
}

// Função auxiliar para mostrar indicador de carregamento
function mostrarLoading(mensagem) {
    const loading = document.querySelector('.loading-overlay');
    const loadingText = loading.querySelector('.loading-text');
    
    if (loadingText) {
        loadingText.textContent = mensagem || 'Carregando...';
    }
    
    loading.style.display = 'flex';
}

// Função auxiliar para esconder indicador de carregamento
function esconderLoading() {
    const loading = document.querySelector('.loading-overlay');
    loading.style.display = 'none';
}

// Adicionar a função de configuração ao carregamento da página
document.addEventListener('DOMContentLoaded', configurarEventListenersRelatorios);
console.log('ReportService disponível:', typeof ReportService !== 'undefined');
console.log('ReportService métodos:', ReportService ? Object.keys(ReportService) : 'não disponível');