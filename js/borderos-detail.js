/**
 * Sistema de detalhamento dos Borderôs Pagos
 * Permite visualizar lista detalhada das operações pagas no período filtrado
 */

(function() {
    'use strict';
    
    console.log('📋 Carregando sistema de detalhamento de Borderôs Pagos...');
    
    // Variáveis globais do módulo
    let borderosModal = null;
    let borderosData = [];
    
    // Inicializar quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        inicializarBorderosDetail();
    });
    
    /**
     * Inicializa o sistema de detalhamento dos borderôs
     */
    function inicializarBorderosDetail() {
        console.log('🚀 Inicializando sistema de detalhamento de Borderôs Pagos...');
        
        // Criar o modal
        criarModalBorderos();
        
        // Configurar event listeners
        configurarEventListeners();
        
        console.log('✅ Sistema de detalhamento de Borderôs Pagos inicializado');
    }
    
    /**
     * Cria o modal de detalhamento dos borderôs (ATUALIZADO com botão PDF)
     */
    function criarModalBorderos() {
        // Verificar se o modal já existe
        if (document.getElementById('borderos-modal')) {
            console.log('Modal de borderôs já existe');
            return;
        }
        
        const modalHTML = `
            <div id="borderos-modal" class="borderos-modal">
                <div class="borderos-modal-content">
                    <div class="borderos-modal-header">
                        <h2 class="borderos-modal-title">
                            <i class="fas fa-money-bill-wave"></i>
                            Detalhamento dos Borderôs Pagos
                        </h2>
                        <button class="borderos-modal-close" id="borderos-modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="borderos-modal-body">
                        <div class="borderos-summary" id="borderos-summary">
                            <!-- Resumo será inserido aqui -->
                        </div>
                        <div id="borderos-content">
                            <!-- Conteúdo será inserido aqui -->
                        </div>
                    </div>
                    <div class="borderos-modal-actions">
                        <button class="borderos-pdf-button" id="borderos-pdf-button">
                            <i class="fas fa-file-pdf"></i>
                            Baixar PDF
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        borderosModal = document.getElementById('borderos-modal');
        
        console.log('📋 Modal de borderôs criado');
    }
    
    /**
     * Configura os event listeners (ATUALIZADO com PDF)
     */
    function configurarEventListeners() {
        // Event listener para o card de borderôs pagos
        const borderosCard = document.querySelector('.stat-card.money');
        if (borderosCard) {
            borderosCard.addEventListener('click', abrirModalBorderos);
            console.log('🎯 Event listener do card de borderôs configurado');
        } else {
            console.warn('⚠️ Card de borderôs não encontrado');
        }
        
        // Event listener para fechar o modal
        document.addEventListener('click', function(e) {
            if (e.target.id === 'borderos-modal-close' || e.target.closest('#borderos-modal-close')) {
                fecharModalBorderos();
            }
            
            if (e.target.id === 'borderos-modal') {
                fecharModalBorderos();
            }
            
            // NOVO: Event listener para o botão PDF
            if (e.target.id === 'borderos-pdf-button' || e.target.closest('#borderos-pdf-button')) {
                gerarPDFBorderos();
            }
        });
        
        // Event listener para ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && borderosModal && borderosModal.classList.contains('show')) {
                fecharModalBorderos();
            }
        });
    }
    
    /**
     * Abre o modal de detalhamento dos borderôs
     */
    async function abrirModalBorderos() {
        console.log('📋 Abrindo modal de detalhamento dos borderôs...');
        
        if (!borderosModal) {
            console.error('❌ Modal de borderôs não encontrado');
            return;
        }
        
        // Mostrar o modal
        borderosModal.classList.add('show');
        
        // Mostrar loading
        mostrarLoadingBorderos();
        
        try {
            // Buscar dados dos borderôs
            await carregarDadosBorderos();
            
            // Renderizar o conteúdo
            renderizarBorderos();
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados dos borderôs:', error);
            mostrarErroBorderos(error.message);
        }
    }
    
    /**
     * Fecha o modal de detalhamento dos borderôs
     */
    function fecharModalBorderos() {
        if (borderosModal) {
            borderosModal.classList.remove('show');
            console.log('📋 Modal de borderôs fechado');
        }
    }
    
    /**
     * Carrega os dados dos borderôs pagos
     */
    async function carregarDadosBorderos() {
        console.log('📊 Carregando dados dos borderôs pagos...');
        
        // Verificar se temos acesso aos dados da aplicação
        if (!window.APP_STATE || !Array.isArray(APP_STATE.propostas)) {
            throw new Error('Dados da aplicação não disponíveis');
        }
        
        // Obter propostas filtradas (usar a função global se disponível)
        let propostasFiltradas = [];
        if (typeof window.filtrarPropostas === 'function') {
            propostasFiltradas = window.filtrarPropostas();
        } else {
            // Fallback: usar todas as propostas
            propostasFiltradas = APP_STATE.propostas;
        }
        
        // Filtrar apenas propostas PAGAS
        const propostasPagas = propostasFiltradas.filter(proposta => {
            return proposta.statusSimplificado === 'PAGO';
        });
        
        console.log(`💰 Encontradas ${propostasPagas.length} propostas pagas no período filtrado`);
        
        // Processar dados para o formato do modal
        borderosData = propostasPagas.map(proposta => {
            // Extrair valor aprovado
            let valorAprovado = 0;
            const camposValor = ['VLR_APR_DIR', 'VLR_APROVADO', 'VALOR_APROVADO', 'valorAprovado'];
            
            for (const campo of camposValor) {
                if (proposta[campo] && parseFloat(proposta[campo]) > 0) {
                    valorAprovado = parseFloat(proposta[campo]);
                    break;
                }
            }
            
            return {
                numero: proposta.numero,
                cedente: proposta.cedente,
                data: proposta.data,
                dataFormatada: proposta.dataFormatada,
                valor: valorAprovado,
                horaPagamento: proposta.horaPagamento,
                tempoTotal: proposta.tempoTotal
            };
        });
        
        // Ordenar por data (mais recente primeiro)
        borderosData.sort((a, b) => new Date(b.data) - new Date(a.data));
        
        console.log(`✅ Dados dos borderôs processados: ${borderosData.length} registros`);
    }
    
    /**
     * Renderiza o conteúdo do modal
     */
    function renderizarBorderos() {
        console.log('🎨 Renderizando modal de borderôs...');
        
        // Renderizar resumo
        renderizarResumoBorderos();
        
        // Renderizar lista
        renderizarListaBorderos();
        
        console.log('✅ Modal de borderôs renderizado');
    }
    
    /**
     * Renderiza o resumo dos borderôs
     */
    function renderizarResumoBorderos() {
        const summaryContainer = document.getElementById('borderos-summary');
        if (!summaryContainer) return;
        
        // Calcular estatísticas
        const totalOperacoes = borderosData.length;
        const valorTotal = borderosData.reduce((acc, item) => acc + item.valor, 0);
        const valorMedio = totalOperacoes > 0 ? valorTotal / totalOperacoes : 0;
        
        // Obter período filtrado
        const dataInicio = APP_STATE.dataInicio ? formatarData(APP_STATE.dataInicio.toISOString().split('T')[0]) : '--';
        const dataFim = APP_STATE.dataFim ? formatarData(APP_STATE.dataFim.toISOString().split('T')[0]) : '--';
        
        const summaryHTML = `
            <div class="borderos-summary-item">
                <div class="borderos-summary-label">Período</div>
                <div class="borderos-summary-value">${dataInicio} a ${dataFim}</div>
            </div>
            <div class="borderos-summary-item">
                <div class="borderos-summary-label">Total de Operações</div>
                <div class="borderos-summary-value">${totalOperacoes}</div>
            </div>
            <div class="borderos-summary-item">
                <div class="borderos-summary-label">Valor Total</div>
                <div class="borderos-summary-value">${formatarMoeda(valorTotal)}</div>
            </div>
            <div class="borderos-summary-item">
                <div class="borderos-summary-label">Valor Médio</div>
                <div class="borderos-summary-value">${formatarMoeda(valorMedio)}</div>
            </div>
        `;
        
        summaryContainer.innerHTML = summaryHTML;
    }
    
    /**
     * Renderiza a lista de borderôs
     */
    function renderizarListaBorderos() {
        const contentContainer = document.getElementById('borderos-content');
        if (!contentContainer) return;
        
        if (borderosData.length === 0) {
            contentContainer.innerHTML = `
                <div class="borderos-empty">
                    <div class="borderos-empty-icon">💰</div>
                    <p>Nenhum borderô pago encontrado no período selecionado.</p>
                </div>
            `;
            return;
        }
        
        const listHTML = `
            <ul class="borderos-list">
                ${borderosData.map(item => `
                    <li class="borderos-item">
                        <div class="borderos-item-info">
                            <div class="borderos-item-cedente">${item.cedente}</div>
                            <div class="borderos-item-data">
                                <i class="fas fa-calendar"></i>
                                ${item.dataFormatada}
                                ${item.horaPagamento ? `• <i class="fas fa-clock"></i> ${formatarHora(item.horaPagamento)}` : ''}
                            </div>
                            <div class="borderos-item-numero">Proposta #${item.numero}</div>
                        </div>
                        <div class="borderos-item-valor">
                            ${formatarMoeda(item.valor)}
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
        
        contentContainer.innerHTML = listHTML;
    }
    
    /**
     * Mostra o loading no modal
     */
    function mostrarLoadingBorderos() {
        const contentContainer = document.getElementById('borderos-content');
        if (!contentContainer) return;
        
        contentContainer.innerHTML = `
            <div class="borderos-loading">
                <div class="borderos-loading-spinner"></div>
                <p>Carregando borderôs pagos...</p>
            </div>
        `;
        
        // Limpar resumo
        const summaryContainer = document.getElementById('borderos-summary');
        if (summaryContainer) {
            summaryContainer.innerHTML = '';
        }
    }
    
    /**
     * Mostra erro no modal
     */
    function mostrarErroBorderos(mensagem) {
        const contentContainer = document.getElementById('borderos-content');
        if (!contentContainer) return;
        
        contentContainer.innerHTML = `
            <div class="borderos-empty">
                <div class="borderos-empty-icon">⚠️</div>
                <p>Erro ao carregar borderôs: ${mensagem}</p>
                <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Tentar Novamente
                </button>
            </div>
        `;
    }
    
    /**
     * Função para formatar moeda (fallback se não existir)
     */
    function formatarMoeda(valor) {
        if (typeof window.formatarMoedaPersonalizada === 'function') {
            return window.formatarMoedaPersonalizada(valor, false);
        }
        
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }
    
    /**
     * Função para formatar hora (fallback se não existir)
     */
    function formatarHora(dataHora) {
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
    
    /**
     * Função para formatar data (fallback se não existir)
     */
    function formatarData(dataString) {
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
    
    /**
     * Gera PDF dos borderôs pagos - VERSÃO PROFISSIONAL
     */
    async function gerarPDFBorderos() {
        console.log('📄 Gerando PDF dos borderôs pagos...');
        
        try {
            // Verificar se os utilitários PDF estão disponíveis
            if (typeof window.PDFUtils === 'undefined') {
                throw new Error('Sistema de relatórios não está disponível');
            }
            
            const { PDFGenerator, formatarMoedaPDF, formatarDataPDF, formatarHoraPDF } = window.PDFUtils;
            
            // Mostrar indicador de carregamento
            const botaoPDF = document.getElementById('borderos-pdf-button');
            const textoOriginal = botaoPDF.innerHTML;
            botaoPDF.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando PDF...';
            botaoPDF.disabled = true;
            
            // Criar gerador de PDF
            const pdfGen = new PDFGenerator();
            await pdfGen.inicializar();
            
            // Cabeçalho principal
            pdfGen.adicionarTextoCentralizado('RELATÓRIO DE BORDERÔS PAGOS', 18, true);
            pdfGen.adicionarEspaco(0.5);
            
            // Subtítulo com data
            const agora = new Date();
            pdfGen.adicionarTextoCentralizado(
                `Gerado em: ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR')}`, 
                10
            );
            pdfGen.adicionarEspaco(1);
            
            // Linha separadora
            pdfGen.adicionarLinhaSeparadora();
            pdfGen.adicionarEspaco(0.5);
            
            // Calcular estatísticas
            const totalOperacoes = borderosData.length;
            const valorTotal = borderosData.reduce((acc, item) => acc + item.valor, 0);
            const valorMedio = totalOperacoes > 0 ? valorTotal / totalOperacoes : 0;
            
            // Obter período filtrado
            const dataInicio = APP_STATE.dataInicio ? 
                formatarDataPDF(APP_STATE.dataInicio.toISOString().split('T')[0]) : '--';
            const dataFim = APP_STATE.dataFim ? 
                formatarDataPDF(APP_STATE.dataFim.toISOString().split('T')[0]) : '--';
            
            // Resumo executivo
            pdfGen.adicionarTexto('RESUMO EXECUTIVO', 14, true, [52, 152, 219]);
            pdfGen.adicionarEspaco(0.5);
            
            pdfGen.adicionarTexto(`📅 Período analisado: ${dataInicio} a ${dataFim}`, 11);
            pdfGen.adicionarTexto(`📊 Total de operações pagas: ${totalOperacoes}`, 11);
            pdfGen.adicionarTexto(`💰 Valor total dos borderôs: ${formatarMoedaPDF(valorTotal)}`, 11, true);
            pdfGen.adicionarTexto(`📈 Valor médio por operação: ${formatarMoedaPDF(valorMedio)}`, 11);
            
            // Calcular estatísticas adicionais
            if (totalOperacoes > 0) {
                const valores = borderosData.map(item => item.valor).sort((a, b) => a - b);
                const valorMinimo = valores[0];
                const valorMaximo = valores[valores.length - 1];
                const mediana = valores.length % 2 === 0 
                    ? (valores[valores.length / 2 - 1] + valores[valores.length / 2]) / 2
                    : valores[Math.floor(valores.length / 2)];
                
                pdfGen.adicionarTexto(`📉 Menor valor: ${formatarMoedaPDF(valorMinimo)}`, 10);
                pdfGen.adicionarTexto(`📊 Valor mediano: ${formatarMoedaPDF(mediana)}`, 10);
                pdfGen.adicionarTexto(`📈 Maior valor: ${formatarMoedaPDF(valorMaximo)}`, 10);
            }
            
            pdfGen.adicionarEspaco(1);
            pdfGen.adicionarLinhaSeparadora();
            pdfGen.adicionarEspaco(1);
            
            // Verificar se há dados para mostrar
            if (borderosData.length === 0) {
                pdfGen.adicionarTexto('NENHUMA OPERAÇÃO ENCONTRADA', 14, true, [231, 76, 60]);
                pdfGen.adicionarEspaco(0.5);
                pdfGen.adicionarTexto('Não foram encontradas operações pagas no período selecionado.', 11);
                pdfGen.adicionarTexto('Verifique os filtros aplicados e tente novamente.', 11);
            } else {
                // Detalhamento das operações
                pdfGen.adicionarTexto('DETALHAMENTO DAS OPERAÇÕES PAGAS', 14, true, [52, 152, 219]);
                pdfGen.adicionarEspaco(1);
                
                // Preparar dados para a tabela
                const dadosTabela = borderosData.map((item, index) => [
                    (index + 1).toString(),
                    item.numero.toString(),
                    item.cedente.length > 25 ? item.cedente.substring(0, 22) + '...' : item.cedente,
                    item.dataFormatada,
                    item.horaPagamento ? formatarHoraPDF(item.horaPagamento) : '--:--',
                    formatarMoedaPDF(item.valor)
                ]);
                
                // Cabeçalhos da tabela
                const colunas = ['#', 'Proposta', 'Cedente', 'Data', 'Hora Pag.', 'Valor'];
                const largurasColunas = [15, 25, 60, 25, 25, 35]; // Total: 185mm (cabe na página)
                
                // Adicionar tabela
                pdfGen.adicionarTabela(dadosTabela, colunas, largurasColunas);
                
                pdfGen.adicionarEspaco(1);
                
                // Análise por cedente (se houver múltiplos cedentes)
                const cedenteStats = {};
                borderosData.forEach(item => {
                    if (!cedenteStats[item.cedente]) {
                        cedenteStats[item.cedente] = { count: 0, total: 0 };
                    }
                    cedenteStats[item.cedente].count++;
                    cedenteStats[item.cedente].total += item.valor;
                });
                
                const cedentesUnicos = Object.keys(cedenteStats);
                if (cedentesUnicos.length > 1) {
                    pdfGen.adicionarLinhaSeparadora();
                    pdfGen.adicionarEspaco(0.5);
                    pdfGen.adicionarTexto('ANÁLISE POR CEDENTE', 12, true, [155, 89, 182]);
                    pdfGen.adicionarEspaco(0.5);
                    
                    // Ordenar cedentes por valor total (decrescente)
                    const cedentesOrdenados = cedentesUnicos
                        .map(cedente => ({
                            nome: cedente,
                            ...cedenteStats[cedente]
                        }))
                        .sort((a, b) => b.total - a.total);
                    
                    cedentesOrdenados.forEach((cedente, index) => {
                        const percentual = ((cedente.total / valorTotal) * 100).toFixed(1);
                        pdfGen.adicionarTexto(
                            `${index + 1}. ${cedente.nome}: ${cedente.count} operações • ${formatarMoedaPDF(cedente.total)} (${percentual}%)`,
                            10
                        );
                    });
                }
                
                // Análise temporal (se houver dados de múltiplos dias)
                const datasUnicas = [...new Set(borderosData.map(item => item.dataFormatada))];
                if (datasUnicas.length > 1) {
                    pdfGen.adicionarEspaco(1);
                    pdfGen.adicionarLinhaSeparadora();
                    pdfGen.adicionarEspaco(0.5);
                    pdfGen.adicionarTexto('DISTRIBUIÇÃO TEMPORAL', 12, true, [230, 126, 34]);
                    pdfGen.adicionarEspaco(0.5);
                    
                    const dataStats = {};
                    borderosData.forEach(item => {
                        if (!dataStats[item.dataFormatada]) {
                            dataStats[item.dataFormatada] = { count: 0, total: 0 };
                        }
                        dataStats[item.dataFormatada].count++;
                        dataStats[item.dataFormatada].total += item.valor;
                    });
                    
                    // Ordenar por data
                    const datasOrdenadas = Object.keys(dataStats).sort((a, b) => {
                        const [diaA, mesA, anoA] = a.split('/');
                        const [diaB, mesB, anoB] = b.split('/');
                        return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB);
                    });
                    
                    datasOrdenadas.forEach(data => {
                        const stats = dataStats[data];
                        pdfGen.adicionarTexto(
                            `📅 ${data}: ${stats.count} operações • ${formatarMoedaPDF(stats.total)}`,
                            10
                        );
                    });
                }
            }
            
            // Salvar o arquivo
            const nomeArquivo = `borderos-pagos-${dataInicio.replace(/\//g, '-')}-a-${dataFim.replace(/\//g, '-')}.pdf`;
            pdfGen.salvar(nomeArquivo);
            
            // Restaurar botão
            botaoPDF.innerHTML = textoOriginal;
            botaoPDF.disabled = false;
            
            // Mostrar notificação de sucesso
            mostrarNotificacao('✅ PDF gerado com sucesso!', 'success');
            
            console.log(`✅ PDF gerado com sucesso: ${nomeArquivo}`);
            
        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);
            
            // Restaurar botão em caso de erro
            const botaoPDF = document.getElementById('borderos-pdf-button');
            if (botaoPDF) {
                botaoPDF.innerHTML = '<i class="fas fa-file-pdf"></i> Baixar PDF';
                botaoPDF.disabled = false;
            }
            
            // Mensagem de erro mais específica
            let mensagemErro = 'Erro desconhecido ao gerar PDF';
            
            if (error.message.includes('jsPDF não está carregado')) {
                mensagemErro = 'Biblioteca de PDF não foi carregada. Verifique sua conexão com a internet e recarregue a página.';
            } else if (error.message.includes('Sistema de relatórios')) {
                mensagemErro = 'Sistema de relatórios não foi inicializado. Recarregue a página e tente novamente.';
            }
            
            // Mostrar notificação de erro
            mostrarNotificacao(`❌ ${mensagemErro}`, 'error');
        }
    }
    
    /**
     * Função auxiliar para mostrar notificações
     */
    function mostrarNotificacao(mensagem, tipo = 'info') {
        const cores = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        
        const notificacao = document.createElement('div');
        notificacao.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${cores[tipo]};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: 'Segoe UI', sans-serif;
            font-size: 14px;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Adicionar animação CSS
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        notificacao.innerHTML = mensagem;
        document.body.appendChild(notificacao);
        
        // Remover após 4 segundos
        setTimeout(() => {
            notificacao.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(notificacao)) {
                    document.body.removeChild(notificacao);
                }
            }, 300);
        }, 4000);
    }
    
    // Expor funções globalmente se necessário
    window.BorderosDetail = {
        abrir: abrirModalBorderos,
        fechar: fecharModalBorderos,
        gerarPDF: gerarPDFBorderos
    };
    
    console.log('✅ Sistema de detalhamento de Borderôs Pagos carregado');
})();