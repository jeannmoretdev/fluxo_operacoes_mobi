/**
 * Sistema de detalhamento do Acumulado do Mês
 * Permite visualizar lista detalhada de todas as operações pagas do mês atual
 */

(function() {
    'use strict';
    
    console.log('📊 Carregando sistema de detalhamento do Acumulado...');
    
    // Variáveis globais do módulo
    let acumuladoModal = null;
    let acumuladoData = [];
    let acumuladoDataOriginal = [];
    let filtroAtual = '';
    let ordenacaoAtual = 'data-desc';
    
    // Inicializar quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        inicializarAcumuladoDetail();
    });
    
    /**
     * Inicializa o sistema de detalhamento do acumulado
     */
    function inicializarAcumuladoDetail() {
        console.log('🚀 Inicializando sistema de detalhamento do Acumulado...');
        
        // Criar o modal
        criarModalAcumulado();
        
        // Configurar event listeners
        configurarEventListeners();
        
        console.log('✅ Sistema de detalhamento do Acumulado inicializado');
    }
    
    /**
     * Cria o modal de detalhamento do acumulado (ATUALIZADO com botão PDF)
     */
    function criarModalAcumulado() {
        // Verificar se o modal já existe
        if (document.getElementById('acumulado-modal')) {
            console.log('Modal de acumulado já existe');
            return;
        }
        
        const modalHTML = `
            <div id="acumulado-modal" class="acumulado-modal">
                <div class="acumulado-modal-content">
                    <div class="acumulado-modal-header">
                        <h2 class="acumulado-modal-title">
                            <i class="fas fa-chart-line"></i>
                            Detalhamento do Acumulado do Mês
                        </h2>
                        <button class="acumulado-modal-close" id="acumulado-modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="acumulado-modal-body">
                        <div class="acumulado-summary" id="acumulado-summary">
                            <!-- Resumo será inserido aqui -->
                        </div>
                        <div class="acumulado-controls">
                            <input type="text" 
                                id="acumulado-search" 
                                class="acumulado-search" 
                                placeholder="Buscar por cedente ou número da proposta...">
                            <select id="acumulado-sort" class="acumulado-sort">
                                <option value="data-desc">Data (mais recente)</option>
                                <option value="data-asc">Data (mais antiga)</option>
                                <option value="valor-desc">Valor (maior)</option>
                                <option value="valor-asc">Valor (menor)</option>
                                <option value="cedente-asc">Cedente (A-Z)</option>
                                <option value="cedente-desc">Cedente (Z-A)</option>
                            </select>
                        </div>
                        <div id="acumulado-content">
                            <!-- Conteúdo será inserido aqui -->
                        </div>
                    </div>
                    <div class="acumulado-modal-actions">
                        <button class="acumulado-pdf-button" id="acumulado-pdf-button">
                            <i class="fas fa-file-pdf"></i>
                            Baixar PDF
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        acumuladoModal = document.getElementById('acumulado-modal');
        
        console.log('📊 Modal de acumulado criado');
    }
    
    /**
     * Configura os event listeners (ATUALIZADO com PDF)
     */
    function configurarEventListeners() {
        // Event listener para o card de acumulado
        const acumuladoCard = document.querySelector('.stat-card.accumulated');
        if (acumuladoCard) {
            acumuladoCard.addEventListener('click', abrirModalAcumulado);
            console.log('🎯 Event listener do card de acumulado configurado');
        } else {
            console.warn('⚠️ Card de acumulado não encontrado');
        }
        
        // Event listener para fechar o modal
        document.addEventListener('click', function(e) {
            if (e.target.id === 'acumulado-modal-close' || e.target.closest('#acumulado-modal-close')) {
                fecharModalAcumulado();
            }
            
            if (e.target.id === 'acumulado-modal') {
                fecharModalAcumulado();
            }
            
            // Event listener para o botão PDF
            if (e.target.id === 'acumulado-pdf-button' || e.target.closest('#acumulado-pdf-button')) {
                gerarPDFAcumulado();
            }
        });
        
        // Event listener para ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && acumuladoModal && acumuladoModal.classList.contains('show')) {
                fecharModalAcumulado();
            }
        });
        
        // Event listeners para busca e ordenação
        document.addEventListener('input', function(e) {
            if (e.target.id === 'acumulado-search') {
                filtroAtual = e.target.value;
                aplicarFiltrosEOrdenacao();
            }
        });
        
        document.addEventListener('change', function(e) {
            if (e.target.id === 'acumulado-sort') {
                ordenacaoAtual = e.target.value;
                aplicarFiltrosEOrdenacao();
            }
        });
    }
    
    /**
     * Abre o modal de detalhamento do acumulado
     */
    async function abrirModalAcumulado() {
        console.log('📊 Abrindo modal de detalhamento do acumulado...');
        
        if (!acumuladoModal) {
            console.error('❌ Modal de acumulado não encontrado');
            return;
        }
        
        // Mostrar o modal
        acumuladoModal.classList.add('show');
        
        // Mostrar loading
        mostrarLoadingAcumulado();
        
        try {
            // Buscar dados do acumulado
            await carregarDadosAcumulado();
            
            // Renderizar o conteúdo
            renderizarAcumulado();
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados do acumulado:', error);
            mostrarErroAcumulado(error.message);
        }
    }
    
    /**
     * Fecha o modal de detalhamento do acumulado
     */
    function fecharModalAcumulado() {
        if (acumuladoModal) {
            acumuladoModal.classList.remove('show');
            console.log('📊 Modal de acumulado fechado');
        }
    }
    
    /**
     * Carrega os dados do acumulado do mês
     */
    async function carregarDadosAcumulado() {
        console.log('📈 Carregando dados do acumulado do mês...');
        
        try {
            // Usar a função existente para buscar dados do mês completo
            if (typeof window.calcularValorAcumuladoMesAtual === 'function') {
                const resultado = await window.calcularValorAcumuladoMesAtual();
                
                if (resultado && resultado.propostas) {
                    // Processar dados para o formato do modal
                    acumuladoDataOriginal = resultado.propostas.map(proposta => {
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
                    
                    // Fazer uma cópia para manipulação
                    acumuladoData = [...acumuladoDataOriginal];
                    
                    console.log(`✅ Dados do acumulado carregados: ${acumuladoData.length} operações`);
                } else {
                    throw new Error('Dados do acumulado não disponíveis');
                }
            } else {
                throw new Error('Função de cálculo do acumulado não disponível');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados do acumulado:', error);
            throw error;
        }
    }
    
    /**
     * Renderiza o conteúdo do modal
     */
    function renderizarAcumulado() {
        console.log('🎨 Renderizando modal de acumulado...');
        
        // Renderizar resumo
        renderizarResumoAcumulado();
        
        // Aplicar filtros e ordenação inicial
        aplicarFiltrosEOrdenacao();
        
        console.log('✅ Modal de acumulado renderizado');
    }
    
    /**
     * Renderiza o resumo do acumulado
     */
    function renderizarResumoAcumulado() {
        const summaryContainer = document.getElementById('acumulado-summary');
        if (!summaryContainer) return;
        
        // Calcular estatísticas
        const totalOperacoes = acumuladoDataOriginal.length;
        const valorTotal = acumuladoDataOriginal.reduce((acc, item) => acc + item.valor, 0);
        const valorMedio = totalOperacoes > 0 ? valorTotal / totalOperacoes : 0;
        
        // Obter informações do mês
        const agora = new Date();
        const mesAtual = agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const primeiroDia = new Date(agora.getFullYear(), agora.getMonth(), 1);
        const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
        
        // Calcular dias úteis do mês (aproximado)
        const diasDoMes = ultimoDia.getDate();
        const diasUteis = Math.floor(diasDoMes * 0.7); // Aproximação
        
        const summaryHTML = `
            <div class="acumulado-summary-item">
                <div class="acumulado-summary-label">Mês de Referência</div>
                <div class="acumulado-summary-value">${mesAtual}</div>
            </div>
            <div class="acumulado-summary-item">
                <div class="acumulado-summary-label">Total de Operações</div>
                <div class="acumulado-summary-value">${totalOperacoes}</div>
            </div>
            <div class="acumulado-summary-item">
                <div class="acumulado-summary-label">Valor Total</div>
                <div class="acumulado-summary-value">${formatarMoeda(valorTotal)}</div>
            </div>
            <div class="acumulado-summary-item">
                <div class="acumulado-summary-label">Valor Médio</div>
                <div class="acumulado-summary-value">${formatarMoeda(valorMedio)}</div>
            </div>
            <div class="acumulado-summary-item">
                <div class="acumulado-summary-label">Média Diária</div>
                <div class="acumulado-summary-value">${formatarMoeda(valorTotal / diasUteis)}</div>
            </div>
        `;
        
        summaryContainer.innerHTML = summaryHTML;
    }
    
    /**
     * Aplica filtros e ordenação aos dados
     */
    function aplicarFiltrosEOrdenacao() {
        console.log(`🔍 Aplicando filtros: "${filtroAtual}" | Ordenação: ${ordenacaoAtual}`);
        
        // Aplicar filtro de busca
        let dadosFiltrados = acumuladoDataOriginal;
        
        if (filtroAtual.trim()) {
            const termoBusca = filtroAtual.toLowerCase().trim();
            dadosFiltrados = acumuladoDataOriginal.filter(item => {
                return item.cedente.toLowerCase().includes(termoBusca) ||
                       item.numero.toString().includes(termoBusca);
            });
        }
        
        // Aplicar ordenação
        dadosFiltrados.sort((a, b) => {
            switch (ordenacaoAtual) {
                case 'data-desc':
                    return new Date(b.data) - new Date(a.data);
                case 'data-asc':
                    return new Date(a.data) - new Date(b.data);
                case 'valor-desc':
                    return b.valor - a.valor;
                case 'valor-asc':
                    return a.valor - b.valor;
                case 'cedente-asc':
                    return a.cedente.localeCompare(b.cedente);
                case 'cedente-desc':
                    return b.cedente.localeCompare(a.cedente);
                default:
                    return 0;
            }
        });
        
        // Atualizar dados filtrados
        acumuladoData = dadosFiltrados;
        
        // Renderizar lista
        renderizarListaAcumulado();
        
        console.log(`📋 Lista atualizada: ${acumuladoData.length} operações exibidas`);
    }
    
    /**
     * Renderiza a lista do acumulado
     */
    function renderizarListaAcumulado() {
        const contentContainer = document.getElementById('acumulado-content');
        if (!contentContainer) return;
        
        if (acumuladoData.length === 0) {
            const mensagem = filtroAtual.trim() ? 
                'Nenhuma operação encontrada com os filtros aplicados.' :
                'Nenhuma operação paga encontrada no mês atual.';
                
            contentContainer.innerHTML = `
                <div class="acumulado-empty">
                    <i class="fas fa-search"></i>
                    <p>${mensagem}</p>
                </div>
            `;
            return;
        }
        
        // Gerar HTML da lista
        let listHTML = '<div class="acumulado-list">';
        
        acumuladoData.forEach((item, index) => {
            const horaFormatada = item.horaPagamento ? 
                formatarHora(item.horaPagamento) : '--:--';
            
            const tempoFormatado = item.tempoTotal ? 
                formatarTempo(item.tempoTotal) : '--';
            
            listHTML += `
                <div class="acumulado-item" data-index="${index}">
                    <div class="acumulado-item-header">
                        <div class="acumulado-item-numero">
                            <i class="fas fa-file-alt"></i>
                            Proposta #${item.numero}
                        </div>
                        <div class="acumulado-item-valor">
                            ${formatarMoeda(item.valor)}
                        </div>
                    </div>
                    <div class="acumulado-item-body">
                        <div class="acumulado-item-info">
                            <div class="acumulado-info-item">
                                <i class="fas fa-building"></i>
                                <span class="acumulado-info-label">Cedente:</span>
                                <span class="acumulado-info-value">${item.cedente}</span>
                            </div>
                            <div class="acumulado-info-item">
                                <i class="fas fa-calendar"></i>
                                <span class="acumulado-info-label">Data:</span>
                                <span class="acumulado-info-value">${item.dataFormatada}</span>
                            </div>
                            <div class="acumulado-info-item">
                                <i class="fas fa-clock"></i>
                                <span class="acumulado-info-label">Hora Pagamento:</span>
                                <span class="acumulado-info-value">${horaFormatada}</span>
                            </div>
                            <div class="acumulado-info-item">
                                <i class="fas fa-stopwatch"></i>
                                <span class="acumulado-info-label">Tempo Total:</span>
                                <span class="acumulado-info-value">${tempoFormatado}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        listHTML += '</div>';
        
        // Adicionar informações de filtro se aplicável
        if (filtroAtual.trim()) {
            const infoFiltro = `
                <div class="acumulado-filter-info">
                    <i class="fas fa-filter"></i>
                    Mostrando ${acumuladoData.length} de ${acumuladoDataOriginal.length} operações
                    (filtro: "${filtroAtual}")
                </div>
            `;
            listHTML = infoFiltro + listHTML;
        }
        
        contentContainer.innerHTML = listHTML;
    }
    
    /**
     * Agrupa operações por data
     */
    function agruparPorData(operacoes) {
        const grupos = {};
        
        operacoes.forEach(operacao => {
            const data = operacao.data;
            if (!grupos[data]) {
                grupos[data] = [];
            }
            grupos[data].push(operacao);
        });
        
        // Ordenar as datas
        const datasOrdenadas = Object.keys(grupos).sort((a, b) => {
            if (ordenacaoAtual.includes('asc')) {
                return new Date(a) - new Date(b);
            } else {
                return new Date(b) - new Date(a);
            }
        });
        
        const gruposOrdenados = {};
        datasOrdenadas.forEach(data => {
            gruposOrdenados[data] = grupos[data];
        });
        
        return gruposOrdenados;
    }
    
    /**
     * Mostra o loading no modal
     */
    function mostrarLoadingAcumulado() {
        const contentContainer = document.getElementById('acumulado-content');
        if (!contentContainer) return;
        
        contentContainer.innerHTML = `
            <div class="acumulado-loading">
                <div class="acumulado-loading-spinner"></div>
                <p>Carregando dados do acumulado do mês...</p>
            </div>
        `;
        
        // Limpar resumo
        const summaryContainer = document.getElementById('acumulado-summary');
        if (summaryContainer) {
            summaryContainer.innerHTML = '';
        }
        
        // Limpar controles
        const searchInput = document.getElementById('acumulado-search');
        const sortSelect = document.getElementById('acumulado-sort');
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'data-desc';
        
        // Resetar variáveis
        filtroAtual = '';
        ordenacaoAtual = 'data-desc';
    }
    
    /**
     * Mostra erro no modal
     */
    function mostrarErroAcumulado(mensagem) {
        const contentContainer = document.getElementById('acumulado-content');
        if (!contentContainer) return;
        
        contentContainer.innerHTML = `
            <div class="acumulado-empty">
                <div class="acumulado-empty-icon">⚠️</div>
                <p>Erro ao carregar acumulado: ${mensagem}</p>
                <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #8e44ad; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Tentar Novamente
                </button>
            </div>
        `;
    }
    
    /**
     * Limpa o filtro de busca
     */
    function limparFiltro() {
        filtroAtual = '';
        const searchInput = document.getElementById('acumulado-search');
        if (searchInput) {
            searchInput.value = '';
        }
        aplicarFiltrosEOrdenacao();
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
     * Função para formatar data completa
     */
    function formatarDataCompleta(dataString) {
        try {
            const data = new Date(dataString + 'T00:00:00');
            return data.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (e) {
            return dataString;
        }
    }
    
    // Adicionar no final do arquivo, antes da exposição global

    /**
     * Gera PDF do acumulado do mês - VERSÃO PROFISSIONAL CORRIGIDA
     */
    async function gerarPDFAcumulado() {
        console.log('📄 Gerando PDF do acumulado do mês...');
        
        try {
            // Verificar se os utilitários PDF estão disponíveis
            if (typeof window.PDFUtils === 'undefined') {
                throw new Error('Sistema de relatórios não está disponível');
            }
            
            const { PDFGenerator, formatarMoedaPDF, formatarDataPDF, formatarHoraPDF } = window.PDFUtils;
            
            // Mostrar indicador de carregamento
            const botaoPDF = document.getElementById('acumulado-pdf-button');
            const textoOriginal = botaoPDF.innerHTML;
            botaoPDF.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando PDF...';
            botaoPDF.disabled = true;
            
            // Criar gerador de PDF
            const pdfGen = new PDFGenerator();
            await pdfGen.inicializar();
            
            // Cabeçalho principal
            pdfGen.adicionarTextoCentralizado('RELATORIO DO ACUMULADO DO MES', 18, true);
            pdfGen.adicionarEspaco(0.5);
            
            // Subtítulo com data
            const agora = new Date();
            const mesAtual = agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            pdfGen.adicionarTextoCentralizado(
                `Mes de ${mesAtual} - Gerado em: ${agora.toLocaleDateString('pt-BR')} as ${agora.toLocaleTimeString('pt-BR')}`, 
                10
            );
            pdfGen.adicionarEspaco(1);
            
            // Linha separadora
            pdfGen.adicionarLinhaSeparadora();
            pdfGen.adicionarEspaco(0.5);
            
            // Calcular estatísticas
            const totalOperacoes = acumuladoDataOriginal.length;
            const valorTotal = acumuladoDataOriginal.reduce((acc, item) => acc + item.valor, 0);
            const valorMedio = totalOperacoes > 0 ? valorTotal / totalOperacoes : 0;
            
            // Calcular informações do mês
            const primeiroDia = new Date(agora.getFullYear(), agora.getMonth(), 1);
            const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
            const diasDoMes = ultimoDia.getDate();
            const diaAtual = agora.getDate();
            const diasUteis = Math.floor(diasDoMes * 0.7); // Aproximação
            const diasUteisDecorridos = Math.floor(diaAtual * 0.7);
            
            // Resumo executivo - SEM SÍMBOLOS ESPECIAIS
            pdfGen.adicionarTexto('RESUMO EXECUTIVO', 14, true, [142, 68, 173]);
            pdfGen.adicionarEspaco(0.5);
            
            pdfGen.adicionarTexto(`Mes de referencia: ${mesAtual}`, 11);
            pdfGen.adicionarTexto(`Total de operacoes no mes: ${totalOperacoes}`, 11);
            pdfGen.adicionarTexto(`Valor total acumulado: ${formatarMoedaPDF(valorTotal)}`, 11, true);
            pdfGen.adicionarTexto(`Valor medio por operacao: ${formatarMoedaPDF(valorMedio)}`, 11);
            pdfGen.adicionarTexto(`Dias uteis estimados no mes: ${diasUteis}`, 10);
            pdfGen.adicionarTexto(`Dias uteis decorridos: ${diasUteisDecorridos}`, 10);
            
            if (diasUteisDecorridos > 0) {
                const mediaDiaria = valorTotal / diasUteisDecorridos;
                const projecaoMensal = mediaDiaria * diasUteis;
                pdfGen.adicionarTexto(`Media diaria atual: ${formatarMoedaPDF(mediaDiaria)}`, 11);
                pdfGen.adicionarTexto(`Projecao para o mes: ${formatarMoedaPDF(projecaoMensal)}`, 11, true);
            }
            
            // Calcular estatísticas adicionais
            if (totalOperacoes > 0) {
                const valores = acumuladoDataOriginal.map(item => item.valor).sort((a, b) => a - b);
                const valorMinimo = valores[0];
                const valorMaximo = valores[valores.length - 1];
                const mediana = valores.length % 2 === 0 
                    ? (valores[valores.length / 2 - 1] + valores[valores.length / 2]) / 2
                    : valores[Math.floor(valores.length / 2)];
                
                pdfGen.adicionarTexto(`Menor valor: ${formatarMoedaPDF(valorMinimo)}`, 10);
                pdfGen.adicionarTexto(`Valor mediano: ${formatarMoedaPDF(mediana)}`, 10);
                pdfGen.adicionarTexto(`Maior valor: ${formatarMoedaPDF(valorMaximo)}`, 10);
            }
            
            pdfGen.adicionarEspaco(1);
            pdfGen.adicionarLinhaSeparadora();
            pdfGen.adicionarEspaco(1);
            
            // NOVA SEÇÃO: ANÁLISE POR OPERADOR
            await adicionarAnalisePorOperador(pdfGen, valorTotal);
            
            // Verificar se há dados para mostrar
            if (acumuladoDataOriginal.length === 0) {
                pdfGen.adicionarTexto('NENHUMA OPERACAO ENCONTRADA', 14, true, [231, 76, 60]);
                pdfGen.adicionarEspaco(0.5);
                pdfGen.adicionarTexto('Nao foram encontradas operacoes para o mes atual.', 11);
                pdfGen.adicionarTexto('Verifique os dados e tente novamente.', 11);
            } else {
                // Análise por data
                pdfGen.adicionarTexto('DISTRIBUICAO POR DATA', 14, true, [52, 152, 219]);
                pdfGen.adicionarEspaco(0.5);
                
                // Agrupar por data
                const dadosAgrupados = agruparPorData(acumuladoDataOriginal);
                const datasOrdenadas = Object.keys(dadosAgrupados).sort((a, b) => {
                    return new Date(b) - new Date(a); // Mais recente primeiro
                });
                
                // Preparar dados para tabela de resumo por data
                const dadosTabelaData = datasOrdenadas.slice(0, 10).map(data => { // Mostrar apenas os 10 dias mais recentes
                    const operacoes = dadosAgrupados[data];
                    const valorTotalDia = operacoes.reduce((acc, op) => acc + op.valor, 0);
                    const dataFormatada = formatarDataCompleta(data);
                    
                    return [
                        dataFormatada,
                        operacoes.length.toString(),
                        formatarMoedaPDF(valorTotalDia),
                        formatarMoedaPDF(valorTotalDia / operacoes.length)
                    ];
                });
                
                // Cabeçalhos da tabela de datas
                const colunasDatas = ['Data', 'Qtd', 'Total', 'Media'];
                const largurasColunasDatas = [40, 25, 45, 45]; // Total: 155mm
                
                pdfGen.adicionarTabela(dadosTabelaData, colunasDatas, largurasColunasDatas);
                
                if (datasOrdenadas.length > 10) {
                    pdfGen.adicionarTexto(`... e mais ${datasOrdenadas.length - 10} dias com operacoes`, 9);
                }
                
                pdfGen.adicionarEspaco(1);
                pdfGen.adicionarLinhaSeparadora();
                pdfGen.adicionarEspaco(1);
                
                // Detalhamento das operações (usar dados filtrados se houver filtro)
                const dadosParaPDF = acumuladoData.length > 0 ? acumuladoData : acumuladoDataOriginal.slice(0, 50); // Limitar a 50 para não sobrecarregar
                
                pdfGen.adicionarTexto('DETALHAMENTO DAS OPERACOES', 14, true, [52, 152, 219]);
                
                // Se há filtro aplicado, mencionar
                if (filtroAtual.trim()) {
                    pdfGen.adicionarTexto(`FILTRO APLICADO: "${filtroAtual}"`, 10, true, [230, 126, 34]);
                }
                pdfGen.adicionarTexto(`ORDENACAO: ${getOrdenacaoTexto(ordenacaoAtual)}`, 10);
                
                if (acumuladoDataOriginal.length > 50 && dadosParaPDF.length === 50) {
                    pdfGen.adicionarTexto(`Mostrando as primeiras 50 operacoes de ${acumuladoDataOriginal.length} total`, 9, false, [230, 126, 34]);
                }
                
                pdfGen.adicionarEspaco(0.5);
                
                // Preparar dados para a tabela de operações
                const dadosTabelaOps = dadosParaPDF.map((item, index) => [
                    (index + 1).toString(),
                    item.numero.toString(),
                    item.cedente.length > 20 ? item.cedente.substring(0, 17) + '...' : item.cedente,
                    item.dataFormatada,
                    item.horaPagamento ? formatarHoraPDF(item.horaPagamento) : '--:--',
                    formatarMoedaPDF(item.valor)
                ]);
                
                // Cabeçalhos da tabela de operações
                const colunasOps = ['#', 'Proposta', 'Cedente', 'Data', 'Hora', 'Valor'];
                const largurasColunasOps = [15, 25, 55, 25, 25, 40]; // Total: 185mm
                
                pdfGen.adicionarTabela(dadosTabelaOps, colunasOps, largurasColunasOps);
                
                pdfGen.adicionarEspaco(1);
                
                // Análise por cedente
                const cedenteStats = {};
                acumuladoDataOriginal.forEach(item => {
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
                    pdfGen.adicionarTexto('RANKING DE CEDENTES', 12, true, [155, 89, 182]);
                    pdfGen.adicionarEspaco(0.5);
                    
                    // Ordenar cedentes por valor total (decrescente)
                    const cedentesOrdenados = cedentesUnicos
                        .map(cedente => ({
                            nome: cedente,
                            ...cedenteStats[cedente]
                        }))
                        .sort((a, b) => b.total - a.total)
                        .slice(0, 10); // Top 10
                    
                    cedentesOrdenados.forEach((cedente, index) => {
                        const percentual = ((cedente.total / valorTotal) * 100).toFixed(1);
                        const posicao = index === 0 ? '1o' : index === 1 ? '2o' : index === 2 ? '3o' : `${index + 1}o`;
                        
                        pdfGen.adicionarTexto(
                            `${posicao} ${cedente.nome}: ${cedente.count} ops - ${formatarMoedaPDF(cedente.total)} (${percentual}%)`,
                            10
                        );
                    });
                    
                    if (cedentesUnicos.length > 10) {
                        pdfGen.adicionarTexto(`... e mais ${cedentesUnicos.length - 10} cedentes`, 9);
                    }
                }
                
                // Análise de performance semanal
                if (acumuladoDataOriginal.length > 7) {
                    pdfGen.adicionarEspaco(1);
                    pdfGen.adicionarLinhaSeparadora();
                    pdfGen.adicionarEspaco(0.5);
                    pdfGen.adicionarTexto('PERFORMANCE SEMANAL', 12, true, [230, 126, 34]);
                    pdfGen.adicionarEspaco(0.5);
                    
                    // Agrupar por semana
                    const semanaStats = {};
                    acumuladoDataOriginal.forEach(item => {
                        const data = new Date(item.data);
                        const inicioSemana = new Date(data);
                        inicioSemana.setDate(data.getDate() - data.getDay()); // Domingo da semana
                        const chaveSemanaa = inicioSemana.toISOString().split('T')[0];
                        
                        if (!semanaStats[chaveSemanaa]) {
                            semanaStats[chaveSemanaa] = { count: 0, total: 0 };
                        }
                        semanaStats[chaveSemanaa].count++;
                        semanaStats[chaveSemanaa].total += item.valor;
                    });
                    
                    const semanasOrdenadas = Object.keys(semanaStats)
                        .sort((a, b) => new Date(b) - new Date(a))
                        .slice(0, 4); // Últimas 4 semanas
                    
                    semanasOrdenadas.forEach((semana, index) => {
                        const stats = semanaStats[semana];
                        const dataInicio = new Date(semana);
                        const dataFim = new Date(dataInicio);
                        dataFim.setDate(dataInicio.getDate() + 6);
                        
                        const semanaTexto = `${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}`;
                        pdfGen.adicionarTexto(
                            `${semanaTexto}: ${stats.count} operacoes - ${formatarMoedaPDF(stats.total)}`,
                            10
                        );
                    });
                }
            }
            
            // Salvar o arquivo
            const mesFormatado = mesAtual.replace(/\s+/g, '-').toLowerCase();
            const nomeArquivo = `acumulado-${mesFormatado}.pdf`;
            pdfGen.salvar(nomeArquivo);
            
            // Restaurar botão
            botaoPDF.innerHTML = textoOriginal;
            botaoPDF.disabled = false;
            
            // Mostrar notificação de sucesso
            mostrarNotificacao('PDF gerado com sucesso!', 'success');
            
            console.log(`✅ PDF gerado com sucesso: ${nomeArquivo}`);
            
        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);
            
            // Restaurar botão em caso de erro
            const botaoPDF = document.getElementById('acumulado-pdf-button');
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
            mostrarNotificacao(`Erro: ${mensagemErro}`, 'error');
        }
    }
    
    /**
     * NOVA FUNÇÃO: Adiciona análise por operador ao PDF
     */
    async function adicionarAnalisePorOperador(pdfGen, valorTotal) {
        console.log('📊 Adicionando análise por operador...');
        
        try {
            // Verificar se o CedenteService está disponível
            if (!window.CedenteService || typeof CedenteService.obterTodosUsuarios !== 'function') {
                console.log('CedenteService não disponível, pulando análise por operador');
                return;
            }
            
            pdfGen.adicionarTexto('ANALISE POR OPERADOR', 14, true, [46, 204, 113]);
            pdfGen.adicionarEspaco(0.5);
            
            // Obter lista de operadores
            const todosOperadores = CedenteService.obterTodosUsuarios();
            console.log(`Operadores encontrados: ${todosOperadores.length}`);
            
            // Calcular estatísticas por operador
            const operadorStats = {};
            
            // Inicializar stats para todos os operadores
            todosOperadores.forEach(operador => {
                operadorStats[operador] = {
                    count: 0,
                    total: 0,
                    cedentes: new Set(),
                    operacoes: []
                };
            });
            
            // Processar cada operação
            acumuladoDataOriginal.forEach(item => {
                // Verificar qual operador está associado a este cedente
                todosOperadores.forEach(operador => {
                    if (CedenteService.cedenteAssociadoAoUsuario(item.cedente, operador)) {
                        operadorStats[operador].count++;
                        operadorStats[operador].total += item.valor;
                        operadorStats[operador].cedentes.add(item.cedente);
                        operadorStats[operador].operacoes.push(item);
                    }
                });
            });
            
            // Filtrar operadores que têm operações
            const operadoresComOperacoes = todosOperadores.filter(op => operadorStats[op].count > 0);
            
            if (operadoresComOperacoes.length === 0) {
                pdfGen.adicionarTexto('Nenhuma operacao associada a operadores encontrada.', 10);
                pdfGen.adicionarEspaco(1);
                return;
            }
            
            // Ordenar operadores por valor total (decrescente)
            const operadoresOrdenados = operadoresComOperacoes
                .map(operador => ({
                    nome: operador,
                    ...operadorStats[operador],
                    cedentesCount: operadorStats[operador].cedentes.size
                }))
                .sort((a, b) => b.total - a.total);
            
            // Resumo geral por operador
            pdfGen.adicionarTexto('RESUMO POR OPERADOR:', 12, true);
            pdfGen.adicionarEspaco(0.3);
            
            operadoresOrdenados.forEach((operador, index) => {
                const percentual = ((operador.total / valorTotal) * 100).toFixed(1);
                const posicao = index + 1;
                
                pdfGen.adicionarTexto(
                    `${posicao}. ${operador.nome}: ${operador.count} operacoes - ${formatarMoedaPDF(operador.total)} (${percentual}%)`,
                    10
                );
                pdfGen.adicionarTexto(
                    `   Cedentes atendidos: ${operador.cedentesCount} - Media por operacao: ${formatarMoedaPDF(operador.total / operador.count)}`,
                    9
                );
            });
            
            pdfGen.adicionarEspaco(0.5);
            
            // Tabela detalhada por operador
            if (operadoresOrdenados.length > 0) {
                pdfGen.adicionarTexto('DETALHAMENTO POR OPERADOR:', 12, true);
                pdfGen.adicionarEspaco(0.3);
                
                // Preparar dados para tabela
                const dadosTabelaOperador = operadoresOrdenados.map((operador, index) => {
                    const percentual = ((operador.total / valorTotal) * 100).toFixed(1);
                    const mediaPorOp = operador.total / operador.count;
                    
                    return [
                        (index + 1).toString(),
                        operador.nome,
                        operador.count.toString(),
                        operador.cedentesCount.toString(),
                        formatarMoedaPDF(operador.total),
                        `${percentual}%`,
                        formatarMoedaPDF(mediaPorOp)
                    ];
                });
                
                // Cabeçalhos da tabela
                const colunasOperador = ['#', 'Operador', 'Ops', 'Ced', 'Total', '%', 'Media'];
                const largurasColunasOperador = [15, 35, 20, 20, 35, 20, 35]; // Total: 180mm
                
                pdfGen.adicionarTabela(dadosTabelaOperador, colunasOperador, largurasColunasOperador);
            }
            
            pdfGen.adicionarEspaco(0.5);
            
            // Análise detalhada dos top 3 operadores
            const top3Operadores = operadoresOrdenados.slice(0, 3);
            
            if (top3Operadores.length > 0) {
                pdfGen.adicionarTexto('TOP 3 OPERADORES - DETALHAMENTO:', 12, true);
                pdfGen.adicionarEspaco(0.3);
                
                top3Operadores.forEach((operador, index) => {
                    const posicao = index === 0 ? '1o LUGAR' : index === 1 ? '2o LUGAR' : '3o LUGAR';
                    
                    pdfGen.adicionarTexto(`${posicao}: ${operador.nome}`, 11, true, [52, 152, 219]);
                    
                    // Estatísticas do operador
                    const percentual = ((operador.total / valorTotal) * 100).toFixed(1);
                    const mediaPorOp = operador.total / operador.count;
                    
                    pdfGen.adicionarTexto(`Total de operacoes: ${operador.count}`, 9);
                    pdfGen.adicionarTexto(`Valor total: ${formatarMoedaPDF(operador.total)} (${percentual}% do total)`, 9);
                    pdfGen.adicionarTexto(`Cedentes atendidos: ${operador.cedentesCount}`, 9);
                    pdfGen.adicionarTexto(`Media por operacao: ${formatarMoedaPDF(mediaPorOp)}`, 9);
                    
                    // Top 3 cedentes do operador
                    const cedentesPorValor = {};
                    operador.operacoes.forEach(op => {
                        if (!cedentesPorValor[op.cedente]) {
                            cedentesPorValor[op.cedente] = { count: 0, total: 0 };
                        }
                        cedentesPorValor[op.cedente].count++;
                        cedentesPorValor[op.cedente].total += op.valor;
                    });
                    
                    const topCedentes = Object.keys(cedentesPorValor)
                        .map(cedente => ({
                            nome: cedente,
                            ...cedentesPorValor[cedente]
                        }))
                        .sort((a, b) => b.total - a.total)
                        .slice(0, 3);
                    
                    if (topCedentes.length > 0) {
                        pdfGen.adicionarTexto('Principais cedentes:', 9, true);
                        topCedentes.forEach((cedente, idx) => {
                            const percCedente = ((cedente.total / operador.total) * 100).toFixed(1);
                            pdfGen.adicionarTexto(
                                `  ${idx + 1}. ${cedente.nome}: ${cedente.count} ops - ${formatarMoedaPDF(cedente.total)} (${percCedente}%)`,
                                8
                            );
                        });
                    }
                    
                    pdfGen.adicionarEspaco(0.3);
                });
            }
            
            // Análise de distribuição
            pdfGen.adicionarTexto('ANALISE DE DISTRIBUICAO:', 12, true);
            pdfGen.adicionarEspaco(0.3);
            
            const totalOperacoes = acumuladoDataOriginal.length;
            const operacoesComOperador = operadoresOrdenados.reduce((acc, op) => acc + op.count, 0);
            const operacoesSemOperador = totalOperacoes - operacoesComOperador;
            
            pdfGen.adicionarTexto(`Total de operacoes: ${totalOperacoes}`, 10);
            pdfGen.adicionarTexto(`Operacoes com operador definido: ${operacoesComOperador} (${((operacoesComOperador/totalOperacoes)*100).toFixed(1)}%)`, 10);
            
            if (operacoesSemOperador > 0) {
                pdfGen.adicionarTexto(`Operacoes sem operador: ${operacoesSemOperador} (${((operacoesSemOperador/totalOperacoes)*100).toFixed(1)}%)`, 10, false, [230, 126, 34]);
            }
            
            pdfGen.adicionarEspaco(1);
            pdfGen.adicionarLinhaSeparadora();
            pdfGen.adicionarEspaco(1);
            
            console.log(`✅ Análise por operador adicionada: ${operadoresComOperacoes.length} operadores`);
            
        } catch (error) {
            console.error('❌ Erro ao adicionar análise por operador:', error);
            pdfGen.adicionarTexto('Erro ao carregar analise por operador.', 10, false, [231, 76, 60]);
            pdfGen.adicionarEspaco(1);
        }
    }
    
    /**
     * Converte código de ordenação em texto legível - CORRIGIDO
     */
    function getOrdenacaoTexto(ordenacao) {
        const textos = {
            'data-desc': 'Data (mais recente primeiro)',
            'data-asc': 'Data (mais antiga primeiro)',
            'valor-desc': 'Valor (maior primeiro)',
            'valor-asc': 'Valor (menor primeiro)',
            'cedente-asc': 'Cedente (A-Z)',
            'cedente-desc': 'Cedente (Z-A)',
            'numero-desc': 'Numero da proposta (decrescente)',
            'numero-asc': 'Numero da proposta (crescente)'
        };
        
        return textos[ordenacao] || ordenacao;
    }
    
    /**
     * Função auxiliar para mostrar notificações - CORRIGIDA
     */
    function mostrarNotificacao(mensagem, tipo = 'info') {
        const cores = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        
        const icones = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
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
        
        // Adicionar animação CSS se não existir
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
        
        notificacao.innerHTML = `${icones[tipo]} ${mensagem}`;
        document.body.appendChild(notificacao);
        
        // Remover após 4 segundos
        setTimeout(() => {
            notificacao.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(notificacao)) {
                   // Continuar a função mostrarNotificacao()

                document.body.removeChild(notificacao);
            }
        }, 300);
    }, 4000);
}

// Funções auxiliares para formatação (usar as existentes se disponíveis)
function formatarMoeda(valor) {
    if (typeof window.formatarMoedaPersonalizada === 'function') {
        return window.formatarMoedaPersonalizada(valor, false);
    }
    
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function formatarHora(dataHoraString) {
    if (typeof window.formatarHora === 'function') {
        return window.formatarHora(dataHoraString);
    }
    
    if (!dataHoraString) return '--:--';
    
    try {
        const data = new Date(dataHoraString);
        const hora = data.getHours().toString().padStart(2, '0');
        const minuto = data.getMinutes().toString().padStart(2, '0');
        return `${hora}:${minuto}`;
    } catch (e) {
        return '--:--';
    }
}

function formatarTempo(minutos) {
    if (typeof window.formatarTempo === 'function') {
        return window.formatarTempo(minutos);
    }
    
    if (!minutos) return '--';
    
    minutos = parseInt(minutos);
    
    if (minutos < 60) {
        return `${minutos} min`;
    } else {
        const horas = Math.floor(minutos / 60);
        const min = minutos % 60;
        return `${horas}h ${min}min`;
    }
}

/**
 * Função auxiliar para formatar data completa - CORRIGIDA
 */
function formatarDataCompleta(dataString) {
    try {
        const data = new Date(dataString);
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        const diaSemana = diasSemana[data.getDay()];
        
        return `${diaSemana}, ${data.toLocaleDateString('pt-BR')}`;
    } catch (e) {
        return dataString;
    }
}

/**
 * Função auxiliar para agrupar dados por data
 */
function agruparPorData(dados) {
    return dados.reduce((grupos, item) => {
        const data = item.data;
        if (!grupos[data]) {
            grupos[data] = [];
        }
        grupos[data].push(item);
        return grupos;
    }, {});
}

/**
 * Função auxiliar para obter informações do mês atual
 */
function obterInformacoesMesAtual() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = agora.getMonth();
    
    // Primeiro e último dia do mês
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    
    // Calcular dias úteis (aproximação: 70% dos dias do mês)
    const totalDias = ultimoDia.getDate();
    const diasUteis = Math.floor(totalDias * 0.7);
    
    // Dias úteis decorridos até hoje
    const diaAtual = agora.getDate();
    const diasUteisDecorridos = Math.floor(diaAtual * 0.7);
    
    return {
        ano,
        mes,
        mesNome: agora.toLocaleDateString('pt-BR', { month: 'long' }),
        primeiroDia,
        ultimoDia,
        totalDias,
        diasUteis,
        diaAtual,
        diasUteisDecorridos,
        percentualMesDecorrido: (diaAtual / totalDias) * 100
    };
}

/**
 * Função para calcular estatísticas avançadas
 */
function calcularEstatisticasAvancadas(dados) {
    if (!dados || dados.length === 0) {
        return {
            total: 0,
            count: 0,
            media: 0,
            mediana: 0,
            minimo: 0,
            maximo: 0,
            desvio: 0,
            quartil1: 0,
            quartil3: 0
        };
    }
    
    const valores = dados.map(item => item.valor).sort((a, b) => a - b);
    const count = valores.length;
    const total = valores.reduce((acc, val) => acc + val, 0);
    const media = total / count;
    
    // Mediana
    const mediana = count % 2 === 0 
        ? (valores[count / 2 - 1] + valores[count / 2]) / 2
        : valores[Math.floor(count / 2)];
    
    // Quartis
    const q1Index = Math.floor(count * 0.25);
    const q3Index = Math.floor(count * 0.75);
    const quartil1 = valores[q1Index];
    const quartil3 = valores[q3Index];
    
    // Desvio padrão
    const variancia = valores.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / count;
    const desvio = Math.sqrt(variancia);
    
    return {
        total,
        count,
        media,
        mediana,
        minimo: valores[0],
        maximo: valores[count - 1],
        desvio,
        quartil1,
        quartil3
    };
}

/**
 * Função para detectar outliers (valores discrepantes)
 */
function detectarOutliers(dados) {
    if (!dados || dados.length < 4) return [];
    
    const stats = calcularEstatisticasAvancadas(dados);
    const iqr = stats.quartil3 - stats.quartil1; // Intervalo interquartil
    const limiteSuperior = stats.quartil3 + (1.5 * iqr);
    const limiteInferior = stats.quartil1 - (1.5 * iqr);
    
    return dados.filter(item => 
        item.valor > limiteSuperior || item.valor < limiteInferior
    );
}

/**
 * Função para gerar insights automáticos
 */
function gerarInsights(dados) {
    const insights = [];
    
    if (!dados || dados.length === 0) {
        insights.push('Nenhum dado disponível para análise.');
        return insights;
    }
    
    const stats = calcularEstatisticasAvancadas(dados);
    const infoMes = obterInformacoesMesAtual();
    const outliers = detectarOutliers(dados);
    
    // Insight sobre volume
    if (stats.count > 50) {
        insights.push(`Alto volume de operações: ${stats.count} operações no mês.`);
    } else if (stats.count < 10) {
        insights.push(`Baixo volume de operações: apenas ${stats.count} operações no mês.`);
    }
    
    // Insight sobre valores
    if (stats.desvio > stats.media * 0.5) {
        insights.push('Alta variabilidade nos valores das operações.');
    }
    
    // Insight sobre outliers
    if (outliers.length > 0) {
        const percentualOutliers = (outliers.length / stats.count) * 100;
        insights.push(`${outliers.length} operações com valores discrepantes (${percentualOutliers.toFixed(1)}% do total).`);
    }
    
    // Insight sobre projeção
    if (infoMes.diasUteisDecorridos > 0) {
        const mediaDiaria = stats.total / infoMes.diasUteisDecorridos;
        const projecao = mediaDiaria * infoMes.diasUteis;
        const crescimento = ((projecao - stats.total) / stats.total) * 100;
        
        if (crescimento > 20) {
            insights.push(`Projeção indica crescimento de ${crescimento.toFixed(1)}% até o fim do mês.`);
        } else if (crescimento < -10) {
            insights.push(`Ritmo atual pode resultar em queda de ${Math.abs(crescimento).toFixed(1)}% no mês.`);
        }
    }
    
    return insights;
}

/**
 * Função para exportar dados em CSV
 */
function exportarCSV() {
    console.log('📊 Exportando dados em CSV...');
    
    try {
        // Verificar se há dados
        if (!acumuladoDataOriginal || acumuladoDataOriginal.length === 0) {
            mostrarNotificacao('Nenhum dado disponível para exportar.', 'warning');
            return;
        }
        
        // Cabeçalho do CSV
        const cabecalho = [
            'Numero',
            'Cedente', 
            'Data',
            'Hora_Pagamento',
            'Valor',
            'Tempo_Total_Minutos'
        ];
        
        // Dados do CSV
        const linhas = acumuladoDataOriginal.map(item => [
            item.numero,
            `"${item.cedente}"`, // Aspas para cedentes com vírgula
            item.data,
            item.horaPagamento ? formatarHora(item.horaPagamento) : '',
            item.valor.toFixed(2).replace('.', ','), // Formato brasileiro
            item.tempoTotal || ''
        ]);
        
        // Combinar cabeçalho e dados
        const csvContent = [cabecalho, ...linhas]
            .map(linha => linha.join(';'))
            .join('\n');
        
        // Criar e baixar arquivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            
            const agora = new Date();
            const mesAtual = agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            const nomeArquivo = `acumulado-${mesAtual.replace(/\s+/g, '-').toLowerCase()}.csv`;
            
            link.setAttribute('download', nomeArquivo);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            mostrarNotificacao('Arquivo CSV baixado com sucesso!', 'success');
            console.log(`✅ CSV exportado: ${nomeArquivo}`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao exportar CSV:', error);
        mostrarNotificacao('Erro ao exportar arquivo CSV.', 'error');
    }
}

// Expor funções globalmente se necessário
window.AcumuladoDetail = {
    abrirModal: abrirModalAcumulado,
    fecharModal: fecharModalAcumulado,
    gerarPDF: gerarPDFAcumulado,
    exportarCSV: exportarCSV,
    calcularEstatisticas: calcularEstatisticasAvancadas,
    gerarInsights: gerarInsights
};

console.log('✅ Sistema de detalhamento do Acumulado carregado completamente');

})();
