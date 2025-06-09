// Função para obter classe CSS baseada no status
function getStatusClass(status) {
    // Verificar se o status contém o texto específico (independente do número)
    if (status.includes("PAGO")) return "status-pago";
    if (status.includes("PENDÊNCIA")) return "status-pendencia";
    if (status.includes("DIGITANDO")) return "status-digitando";
    if (status.includes("AGUARD. ANÁLISE")) return "status-aguardando";
    if (status.includes("OPER. ANALISANDO")) return "status-analisando";
    if (status.includes("Q CERT. ASSINAT.")) return "status-assinatura";
    if (status.includes("CHECAGEM")) return "status-checagem";
    if (status.includes("POSTERGADO")) return "status-postergado";
    if (status.includes("CEDENTE DESISTIU")) return "status-desistiu";
    if (status.includes("RECUSADO")) return "status-recusado";
    if (status.includes("PENDÊNCIA")) return "status-pendencia";
    
    // Se não encontrou nenhuma correspondência, retornar string vazia
    console.warn("Nenhuma classe encontrada para status:", status);
    return "";
}

// Função para filtrar propostas
function filtrarPropostas() {
    return APP_STATE.propostas.filter(p => {
        // Filtro de status
        if (APP_STATE.filtroStatus !== 'todos' && p.statusAtual !== APP_STATE.filtroStatus) {
            return false;
        }
        
        // Filtro de cedente
        if (APP_STATE.filtroCedente && !p.cedente.toLowerCase().includes(APP_STATE.filtroCedente.toLowerCase())) {
            return false;
        }
        
        return true;
    });
}

// Função para ordenar propostas
function ordenarPropostas(propostas) {
    const ordenacao = APP_STATE.ordenacao;
    
    return [...propostas].sort((a, b) => {
        switch (ordenacao) {
            case 'numero_desc':
                return b.numero - a.numero;
            case 'numero_asc':
                return a.numero - b.numero;
                
            case 'hora_entrada_desc':
                return compareDates(b.horaEntrada, a.horaEntrada);
            case 'hora_entrada_asc':
                return compareDates(a.horaEntrada, b.horaEntrada);
                
            case 'status_asc':
                return a.pesoStatus - b.pesoStatus;
            case 'status_desc':
                return b.pesoStatus - a.pesoStatus;
                
            case 'data_desc':
                return compareDates(b.data, a.data);
            case 'data_asc':
                return compareDates(a.data, b.data);
                
            case 'cedente_asc':
                return a.cedente.localeCompare(b.cedente);
            case 'cedente_desc':
                return b.cedente.localeCompare(a.cedente);
                
            case 'tempo_total_desc':
                return compareNumbers(b.tempoTotal, a.tempoTotal);
            case 'tempo_total_asc':
                return compareNumbers(a.tempoTotal, b.tempoTotal);
                
            case 'analise_desc':
                return compareDates(b.horaAnalise, a.horaAnalise);
            case 'analise_asc':
                return compareDates(a.horaAnalise, b.horaAnalise);
                
            case 'checagem_desc':
                return compareDates(b.horaChecagem, a.horaChecagem);
            case 'checagem_asc':
                return compareDates(a.horaChecagem, b.horaChecagem);
                
            case 'certificacao_desc':
                return compareDates(b.horaCertifica, a.horaCertifica);
            case 'certificacao_asc':
                return compareDates(a.horaCertifica, b.horaCertifica);
                
            case 'pagamento_desc':
                return compareDates(b.horaPagamento, a.horaPagamento);

            case 'pagamento_asc':
                return compareDates(a.horaPagamento, b.horaPagamento);

            case 'pendencia_desc':
                return ordenarPorData(b.horaPendencia, a.horaPendencia);

            case 'pendencia_asc':
                return ordenarPorData(a.horaPendencia, b.horaPendencia);
                
            default:
                return 0;
        }
    });
}

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

// Abordagem alternativa para renderizar a tabela no modo TV
function renderizarTabelaModoTV(propostasFiltradas, novasPropostasIds = []) {
    const tbody = document.getElementById('propostas-body');
    if (!tbody) {
        console.error('Elemento tbody não encontrado');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (propostasFiltradas.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="10" class="no-data">Nenhuma proposta encontrada</td>`;
        tbody.appendChild(tr);
        return;
    }
    
    // Limpar quaisquer temporizadores existentes
    if (window.tempoRealTimers) {
        window.tempoRealTimers.forEach(timer => clearInterval(timer));
    }
    window.tempoRealTimers = [];
    
    console.log('Renderizando tabela no modo TV');
    
    propostasFiltradas.forEach(p => {
        const tr = document.createElement('tr');
        
        // Obter a classe de status e aplicar à linha
        const statusClass = getStatusClass(p.statusAtual);
        
        if (statusClass) {
            tr.className = statusClass;
        }
        
        tr.id = `proposta-${p.id}`;
        
        // Adiciona classe para animação se for uma nova proposta
        if (novasPropostasIds && novasPropostasIds.includes(p.id)) {
            tr.classList.add('new-row');
        }
        
        // Encontrar a entrada de checagem (status "CHECAGEM")
        const entradaChecagem = p.fluxoCompleto ? p.fluxoCompleto.find(f => f.STATUS_FLUXO === "CHECAGEM") : null;
        const horaChecagem = entradaChecagem ? entradaChecagem.DATA_HORA_ENTRADA : null;
        
        // Calcular o tempo até checagem (da entrada até checagem)
        const tempoAteChecagem = calcularTempoEmMinutos(p.horaEntrada, horaChecagem);
        
        // Criar um ID único para a célula de tempo total
        const tempoTotalId = `tempo-total-${p.id}`;
        
        // Verificar se há observações
        const temObservacoes = p.observacoes && p.observacoes.length > 0;
        
        // Adicionar classe para indicar que há observações
        const cedenteClass = temObservacoes ? 'has-observations' : '';
        
        // Adicionar classe para a célula de status para permitir clique
        const statusCellClass = 'status-cell';
        
        // LÓGICA CORRIGIDA PARA MODO TV: Determinar qual tempo mostrar na coluna QCERT
        let tempoParaCertificacao = null;
        
        if (p.horaCertifica) {
            if (p.horaComite) {
                // Se passou pelo COMITÊ, mostrar tempo do comitê até certificação
                tempoParaCertificacao = p.tempoComiteAteCertifica;
            } else if (p.horaAnalise) {
                // Se não passou pelo COMITÊ mas passou pela análise, mostrar tempo da análise até certificação
                tempoParaCertificacao = p.tempoAnaliseAteCertifica;
            } else {
                // Se não passou nem pelo comitê nem pela análise, mostrar tempo da entrada até certificação
                tempoParaCertificacao = p.tempoAteCertifica;
            }
        }
        
        // No modo TV, não incluímos a coluna de data
        tr.innerHTML = `
            <td class="text-center" id="${tempoTotalId}">${formatarTempo(p.tempoTotal, true, p.tempoEmTempoReal)}</td>
            <td class="text-center">${formatarHora(p.horaEntrada)}</td>
            <td class="text-center">${p.numero}</td>
            <td class="text-center cedente-cell ${cedenteClass}" data-proposta-id="${p.id}">${p.cedente}</td>
            <td class="text-center">${formatarHoraTempo(p.horaAnalise, p.tempoAteAnalise)}</td>
            <td class="text-center">${formatarHoraTempo(p.horaPendencia, p.tempoAnaliseAtePendencia)}</td>
            <td class="text-center">${formatarHoraTempo(horaChecagem, tempoAteChecagem)}</td>
            <td class="text-center">${formatarHoraTempo(p.horaCertifica, tempoParaCertificacao)}</td>
            <td class="text-center">${formatarHoraTempo(p.horaPagamento, p.tempoCertificaAtePagamento)}</td>
            <td class="text-center ${statusCellClass}" data-proposta-id="${p.id}">${p.statusSimplificado}</td>
        `;
        
        tbody.appendChild(tr);
        
        // Se o tempo está sendo calculado em tempo real, configurar um temporizador para atualizá-lo
        if (p.tempoEmTempoReal && p.horaEntrada) {
            const dataEntrada = new Date(p.horaEntrada);
            const timer = setInterval(() => {
                const agora = new Date();
                let tempoDecorrido = Math.floor((agora - dataEntrada) / (1000 * 60)); // Em minutos
                
                // Aplicar desconto de horário de almoço se necessário
                const horaEntrada = dataEntrada.getHours();
                const entrouAntesDas13 = horaEntrada < 13;
                const horaAtual = agora.getHours();
                const passouDas14 = horaAtual >= 14;
                
                if (entrouAntesDas13 && passouDas14) {
                    tempoDecorrido -= 60; // Descontar 1 hora
                }
                
                // Atualizar o elemento na tabela
                const tempoTotalCell = document.getElementById(tempoTotalId);
                if (tempoTotalCell) {
                    const excedido = tempoDecorrido > 150;
                    tempoTotalCell.innerHTML = formatarTempo(tempoDecorrido, true, true);
                }
            }, 60000); // Atualizar a cada minuto
            
            window.tempoRealTimers.push(timer);
        }
        
        // Adicionar event listeners após a renderização
        setTimeout(() => {
            // Event listener para a célula do cedente
            if (temObservacoes) {
                const cedenteCell = tbody.querySelector(`.cedente-cell[data-proposta-id="${p.id}"]`);
                if (cedenteCell) {
                    cedenteCell.addEventListener('click', (e) => {
                        e.stopPropagation();
                        mostrarObservacoes(p);
                    });
                }
            }
            
            // Event listener para a célula de status
            const statusCell = tbody.querySelector(`.status-cell[data-proposta-id="${p.id}"]`);
            if (statusCell) {
                statusCell.style.cursor = 'pointer';
                statusCell.title = 'Clique para ver o histórico de status';
                
                statusCell.addEventListener('click', (e) => {
                    e.stopPropagation();
                    mostrarHistoricoStatus(p);
                });
            }
        }, 0);
    });
    
    console.log(`Tabela no modo TV renderizada com ${propostasFiltradas.length} propostas.`);
}

// Função para renderizar tabela - CORRIGIDA
function renderizarTabela(propostasFiltradas, novasPropostasIds = []) {
    const tbody = document.getElementById('propostas-body');
    
    if (!tbody) {
        console.error('Elemento tbody não encontrado');
        return;
    }
    
    // Verificar se o cabeçalho da tabela tem a coluna de PENDÊNCIA
    const tabela = document.getElementById('propostas-table');
    if (tabela) {
        const cabecalho = tabela.querySelector('thead tr');
        if (cabecalho) {
            // Verificar se já existe a coluna de PENDÊNCIA
            const colunaPendencia = Array.from(cabecalho.querySelectorAll('th')).find(th => 
                th.textContent.includes('PENDÊNCIA')
            );
            
            // Se não existir, adicionar a coluna após ANALISTA AUTO
            if (!colunaPendencia) {
                const colunaAnalista = Array.from(cabecalho.querySelectorAll('th')).find(th => 
                    th.textContent.includes('ANALISTA AUTO')
                );
                
                if (colunaAnalista) {
                    const novaColuna = document.createElement('th');
                    novaColuna.className = 'sortable text-center';
                    novaColuna.setAttribute('data-sort', 'pendencia');
                    novaColuna.innerHTML = 'PENDÊNCIA<span class="sort-icon"></span>';
                    
                    colunaAnalista.insertAdjacentElement('afterend', novaColuna);
                    console.log("Coluna PENDÊNCIA adicionada ao cabeçalho da tabela");
                    
                    // Reconfigurar ordenação após adicionar coluna
                    configurarOrdenacaoPorCabecalho();
                }
            }
        }
    }
    
    // Limpar temporizadores existentes
    if (window.tempoRealTimers) {
        window.tempoRealTimers.forEach(timer => clearInterval(timer));
    }
    window.tempoRealTimers = [];
    
    // Limpar o corpo da tabela
    tbody.innerHTML = '';
    
    if (propostasFiltradas.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="11" class="no-data">Nenhuma proposta encontrada</td>`;
        tbody.appendChild(tr);
        return;
    }
    
    // Adicionar cada proposta à tabela
    propostasFiltradas.forEach(p => {
        // Obter a classe de status
        const statusClass = getStatusClass(p.statusAtual);
        
        // Criar a linha da tabela
        const tr = document.createElement('tr');
        tr.className = statusClass;
        tr.setAttribute('data-id', p.id);
        tr.id = `proposta-${p.id}`;
        
        // Verificar se é uma nova proposta
        if (novasPropostasIds && novasPropostasIds.includes(p.id)) {
            tr.classList.add('nova-proposta');
        }
        
        // Verificar se há observações
        const temObservacoes = p.observacoes && p.observacoes.length > 0;
        
        // Encontrar a entrada de checagem
        const entradaChecagem = p.fluxoCompleto ? p.fluxoCompleto.find(f => f.STATUS_FLUXO === "CHECAGEM") : null;
        const horaChecagem = entradaChecagem ? entradaChecagem.DATA_HORA_ENTRADA : null;
        const tempoAteChecagem = calcularTempoEmMinutos(p.horaEntrada, horaChecagem);
        
        // Criar ID único para tempo total (para atualização em tempo real)
        const tempoTotalId = `tempo-total-${p.id}`;
        
        // LÓGICA CORRIGIDA: Determinar qual tempo mostrar na coluna QCERT
        let tempoParaCertificacao = null;
        let horaOrigemCertificacao = null;
        
        if (p.horaCertifica) {
            if (p.horaComite) {
                // Se passou pelo COMITÊ, mostrar tempo do comitê até certificação
                tempoParaCertificacao = p.tempoComiteAteCertifica;
                horaOrigemCertificacao = p.horaComite;
            } else if (p.horaAnalise) {
                // Se não passou pelo COMITÊ mas passou pela análise, mostrar tempo da análise até certificação
                tempoParaCertificacao = p.tempoAnaliseAteCertifica;
                horaOrigemCertificacao = p.horaAnalise;
            } else {
                // Se não passou nem pelo comitê nem pela análise, mostrar tempo da entrada até certificação
                tempoParaCertificacao = p.tempoAteCertifica;
                horaOrigemCertificacao = p.horaEntrada;
            }
        }
        
        // Log para depuração
        if (p.horaCertifica) {
            console.log(`Proposta ${p.numero}: QCERT em ${formatarHora(p.horaCertifica)}, tempo desde ${p.horaComite ? 'COMITÊ' : (p.horaAnalise ? 'ANÁLISE' : 'ENTRADA')}: ${tempoParaCertificacao} min`);
        }
        
        // Adicionar células à linha - COM CLASSES PARA EVENT LISTENERS
        tr.innerHTML = `
            <td class="text-center tv-hide-column">${p.dataFormatada}</td>
            <td class="text-center" id="${tempoTotalId}">${formatarTempo(p.tempoTotal, true, p.tempoEmTempoReal)}</td>
            <td class="text-center">${formatarHora(p.horaEntrada)}</td>
            <td class="text-center">${p.numero}</td>
            <td class="cedente-cell ${temObservacoes ? 'has-observations' : ''}" data-proposta-id="${p.id}">${p.cedente}</td>
            <td class="text-center">${formatarHoraTempo(p.horaAnalise, p.tempoAteAnalise)}</td>
            <td class="text-center">${formatarHoraTempo(p.horaPendencia, p.tempoAnaliseAtePendencia)}</td>
            <td class="text-center">${formatarHoraTempo(horaChecagem, tempoAteChecagem)}</td>
            <td class="text-center">${formatarHoraTempo(p.horaCertifica, tempoParaCertificacao)}</td>
            <td class="text-center">${formatarHoraTempo(p.horaPagamento, p.tempoCertificaAtePagamento)}</td>
            <td class="text-center status-cell" data-proposta-id="${p.id}">${p.statusSimplificado}</td>
        `;
        
        // Adicionar a linha à tabela
        tbody.appendChild(tr);
        
        // Configurar timer para tempo real se necessário
        if (p.tempoEmTempoReal && p.horaEntrada) {
            const dataEntrada = new Date(p.horaEntrada);
            const timer = setInterval(() => {
                const agora = new Date();
                let tempoDecorrido = Math.floor((agora - dataEntrada) / (1000 * 60));
                
                // Aplicar desconto de horário de almoço se necessário
                const horaEntrada = dataEntrada.getHours();
                const entrouAntesDas13 = horaEntrada < 13;
                const horaAtual = agora.getHours();
                const passouDas14 = horaAtual >= 14;
                
                if (entrouAntesDas13 && passouDas14) {
                    tempoDecorrido -= 60;
                }
                
                const tempoTotalCell = document.getElementById(tempoTotalId);
                if (tempoTotalCell) {
                    tempoTotalCell.innerHTML = formatarTempo(tempoDecorrido, true, true);
                }
            }, 60000);
            
            window.tempoRealTimers.push(timer);
        }
    });
    
    // CONFIGURAR EVENT LISTENERS APÓS RENDERIZAR A TABELA
    configurarEventListenersTabela();
    
    console.log(`Tabela renderizada com ${propostasFiltradas.length} propostas.`);
}

// NOVA FUNÇÃO para configurar event listeners da tabela
function configurarEventListenersTabela() {
    console.log('Configurando event listeners da tabela...');
    
    // Event listeners para células de cedente (observações)
    document.querySelectorAll('.cedente-cell.has-observations').forEach(cell => {
        // Remover event listeners existentes para evitar duplicação
        cell.replaceWith(cell.cloneNode(true));
        
        // Pegar a nova referência após o clone
        const newCell = document.querySelector(`.cedente-cell[data-proposta-id="${cell.dataset.propostaId}"]`);
        
        if (newCell) {
            newCell.style.cursor = 'pointer';
            newCell.title = 'Clique para ver as observações';
            
            newCell.addEventListener('click', (e) => {
                e.stopPropagation();
                const propostaId = newCell.dataset.propostaId;
                const proposta = APP_STATE.propostas.find(p => p.id === propostaId);
                
                if (proposta) {
                    console.log('Clicou na célula do cedente:', proposta.cedente);
                    mostrarObservacoes(proposta);
                } else {
                    console.error('Proposta não encontrada:', propostaId);
                }
            });
        }
    });
    
    // Event listeners para células de status (histórico)
    document.querySelectorAll('.status-cell').forEach(cell => {
        // Remover event listeners existentes para evitar duplicação
        cell.replaceWith(cell.cloneNode(true));
        
        // Pegar a nova referência após o clone
        const newCell = document.querySelector(`.status-cell[data-proposta-id="${cell.dataset.propostaId}"]`);
        
        if (newCell) {
            newCell.style.cursor = 'pointer';
            newCell.title = 'Clique para ver o histórico de status';
            
            newCell.addEventListener('click', (e) => {
                e.stopPropagation();
                const propostaId = newCell.dataset.propostaId;
                const proposta = APP_STATE.propostas.find(p => p.id === propostaId);
                
                if (proposta) {
                    console.log('Clicou na célula de status:', proposta.statusSimplificado);
                    mostrarHistoricoStatus(proposta);
                } else {
                    console.error('Proposta não encontrada:', propostaId);
                }
            });
        }
    });
    
    console.log('Event listeners da tabela configurados.');
}

// Função para ajustar o cabeçalho da tabela no modo TV - com tooltip explicativo
function ajustarCabecalhoTabelaModoTV() {
    const thead = document.querySelector('#propostas-table thead');
    if (!thead) {
        console.error('Cabeçalho da tabela não encontrado');
        return;
    }
    
    const headerRow = thead.querySelector('tr');
    if (!headerRow) {
        console.error('Linha do cabeçalho não encontrada');
        return;
    }
    
    // Verificar se já está no formato do modo TV
    if (headerRow.classList.contains('tv-mode-header-row')) {
        console.log('Cabeçalho já está no formato do modo TV');
        return;
    }
    
    // Salvar o cabeçalho original se ainda não foi salvo
    if (!thead.getAttribute('data-original-html')) {
        thead.setAttribute('data-original-html', thead.innerHTML);
    }
    
    // Criar um novo cabeçalho para o modo TV com tooltip explicativo
    const newHeaderHTML = `
        <tr class="tv-mode-header-row">
            <th class="sortable text-center" data-sort="tempo_total">Tempo Total<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="hora_entrada">ENTRADA GER<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="numero">Nº<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="cedente">Cedente<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="analise">ANALISTA AUTO<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="pendencia">PENDÊNCIA<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="checagem">CHECAGEM<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="certificacao" title="Tempo desde a última etapa (Pendência ou Análise) até a Certificação">QCERT.<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="pagamento">PAGO<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="status">Status<span class="sort-icon"></span></th>
        </tr>
    `;
    
    thead.innerHTML = newHeaderHTML;
    
    // Reconfigurar a ordenação por clique nos cabeçalhos
    if (typeof configurarOrdenacaoPorCabecalho === 'function') {
        configurarOrdenacaoPorCabecalho();
    }
    
    console.log('Cabeçalho da tabela ajustado para o modo TV');
}

// Função para restaurar o cabeçalho original da tabela
function restaurarCabecalhoTabelaOriginal() {
    const thead = document.querySelector('#propostas-table thead');
    if (!thead) {
        console.error('Cabeçalho da tabela não encontrado');
        return;
    }
    
    // Restaurar o cabeçalho original se foi salvo
    const originalHTML = thead.getAttribute('data-original-html');
    if (originalHTML) {
        thead.innerHTML = originalHTML;
        
        // Reconfigurar a ordenação por clique nos cabeçalhos
        if (typeof configurarOrdenacaoPorCabecalho === 'function') {
            configurarOrdenacaoPorCabecalho();
        }
        
        console.log('Cabeçalho da tabela restaurado para o modo normal');
    }
}

// Função separada para alternar o modo TV (facilita a remoção do event listener)
function alternarModoTV() {
    console.log('Botão de modo TV clicado');
    document.body.classList.toggle('tv-mode');
    
    // Atualizar o texto do botão
    const botaoTV = document.getElementById('tv-mode-toggle');
    if (document.body.classList.contains('tv-mode')) {
        botaoTV.innerHTML = '<i class="fas fa-desktop"></i> Modo Normal';
    } else {
        botaoTV.innerHTML = '<i class="fas fa-tv"></i> Modo TV';
    }
    
    // Salvar a preferência
    const novoEstado = document.body.classList.contains('tv-mode') ? 'ativo' : 'inativo';
    localStorage.setItem('modo-tv', novoEstado);
    
    // Forçar um redimensionamento da tabela
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 100);
}

// Garantir que a função seja chamada quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', configurarModoTV);
} else {
    configurarModoTV();
}

// Função para mostrar as observações de uma proposta - sem estilização especial para comentários automáticos
function mostrarObservacoes(proposta) {
    console.log("Mostrando observações para:", proposta.id, proposta.cedente);
    console.log("Observações:", proposta.observacoes);
    
    // Remover qualquer tooltip existente
    const existingTooltip = document.querySelector('.observations-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
    
    // Criar o tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'observations-tooltip';
    tooltip.style.display = 'block'; // Garantir que esteja visível
    
    // Criar o cabeçalho do tooltip
    const header = document.createElement('div');
    header.className = 'observations-tooltip-header';
    
    const title = document.createElement('div');
    title.className = 'observations-tooltip-title';
    title.textContent = `Observações - ${proposta.cedente} (${proposta.numero})`;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'observations-tooltip-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip.remove();
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    tooltip.appendChild(header);
    
    // Adicionar as observações
    const content = document.createElement('div');
    content.className = 'observations-content';
    
    if (proposta.observacoes && proposta.observacoes.length > 0) {
        // Ordenar observações por data (mais recentes primeiro)
        const observacoesOrdenadas = [...proposta.observacoes].sort((a, b) => {
            if (!a.DATA_HORA || !b.DATA_HORA) return 0;
            return new Date(b.DATA_HORA) - new Date(a.DATA_HORA);
        });
        
        observacoesOrdenadas.forEach(obs => {
            const item = document.createElement('div');
            item.className = 'observation-item';
            
            const user = document.createElement('div');
            user.className = 'observation-user';
            user.textContent = obs.USUARIO || 'Desconhecido';
            
            const text = document.createElement('div');
            text.className = 'observation-text';
            text.textContent = obs.OBSERVACAO || '';
            
            item.appendChild(user);
            item.appendChild(text);
            content.appendChild(item);
        });
    } else {
        const noObs = document.createElement('div');
        noObs.textContent = 'Sem observações';
        content.appendChild(noObs);
    }
    
    tooltip.appendChild(content);
    
    // Adicionar o tooltip ao DOM
    document.body.appendChild(tooltip);
    
    // Posicionar o tooltip em relação à célula
    const cedenteCell = document.querySelector(`.cedente-cell[data-proposta-id="${proposta.id}"]`);
    if (cedenteCell) {
        // Obter as dimensões e posições
        const cellRect = cedenteCell.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Calcular a posição inicial (abaixo da célula)
        let top = cellRect.bottom + 10;
        let left = cellRect.left + (cellRect.width / 2) - (tooltipRect.width / 2);
        
        // Verificar se o tooltip sai da tela na parte inferior
        if (top + tooltipRect.height > viewportHeight) {
            // Posicionar acima da célula se não couber abaixo
            top = cellRect.top - tooltipRect.height - 10;
            
            // Se ainda estiver fora da tela, posicionar no topo da viewport com margem
            if (top < 0) {
                top = 10;
            }
        }
        
        // Verificar se o tooltip sai da tela à direita
        if (left + tooltipRect.width > viewportWidth) {
            left = viewportWidth - tooltipRect.width - 10;
        }
        
        // Verificar se o tooltip sai da tela à esquerda
        if (left < 0) {
            left = 10;
        }
        
        // Aplicar a posição
        tooltip.style.position = 'fixed';
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.maxHeight = `${viewportHeight - 40}px`; // Limitar altura máxima
        tooltip.style.overflowY = 'auto'; // Permitir rolagem se o conteúdo for muito grande
        
        console.log("Tooltip posicionado:", tooltip.style.top, tooltip.style.left);
        
        // Fechar o tooltip ao clicar fora dele
        setTimeout(() => {
            document.addEventListener('click', function closeTooltip(e) {
                if (!tooltip.contains(e.target) && !cedenteCell.contains(e.target)) {
                    tooltip.remove();
                    document.removeEventListener('click', closeTooltip);
                }
            });
        }, 100);
        
        // Fechar o tooltip ao pressionar ESC
        document.addEventListener('keydown', function escKeyHandler(e) {
            if (e.key === 'Escape') {
                tooltip.remove();
                document.removeEventListener('keydown', escKeyHandler);
            }
        });
    } else {
        console.error("Célula do cedente não encontrada:", proposta.id);
        tooltip.remove();
    }
}

// Função para mostrar o histórico de status de uma proposta - versão ultra compacta sem espaçamento
function mostrarHistoricoStatus(proposta) {
    // Remover qualquer tooltip existente
    const existingTooltip = document.querySelector('.status-history-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
    
    // Criar o tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'status-history-tooltip';
    tooltip.style.display = 'block';
    
    // Criar o cabeçalho do tooltip
    const header = document.createElement('div');
    header.className = 'status-history-tooltip-header';
    
    // Truncar o nome do cedente se for muito longo
    let nomeCedente = proposta.cedente;
    if (nomeCedente.length > 15) {
        nomeCedente = nomeCedente.substring(0, 13) + '...';
    }
    
    const title = document.createElement('div');
    title.className = 'status-history-tooltip-title';
    title.textContent = `${proposta.numero} - ${nomeCedente}`;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'status-history-tooltip-close';
    closeButton.innerHTML = '×';
    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip.remove();
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    tooltip.appendChild(header);
    
    // Adicionar o histórico de status
    const content = document.createElement('div');
    content.className = 'status-history-content';
    
    if (proposta.fluxoCompleto && proposta.fluxoCompleto.length > 0) {
        // Ordenar o fluxo por data/hora (mais antigo primeiro)
        const fluxoOrdenado = [...proposta.fluxoCompleto].sort((a, b) => {
            return new Date(a.DATA_HORA_ENTRADA) - new Date(b.DATA_HORA_ENTRADA);
        });
        
        // Criar uma lista simples em vez de tabela
        const historyList = document.createElement('div');
        historyList.className = 'history-list';
        
        // Adicionar cada entrada do fluxo
        let entradaAnterior = null;
        
        fluxoOrdenado.forEach((entrada, index) => {
            // Simplificar o status
            const statusSimplificado = simplificarStatus(entrada.STATUS_FLUXO);
            
            // Formatar a data/hora (apenas hora e minuto)
            const dataHora = formatarHora(entrada.DATA_HORA_ENTRADA);
            
            // Calcular o tempo desde a entrada anterior
            let tempoDesdeAnterior = '';
            if (entradaAnterior) {
                const tempoMinutos = calcularTempoEmMinutos(entradaAnterior.DATA_HORA_ENTRADA, entrada.DATA_HORA_ENTRADA);
                // Formato compacto para o tempo
                if (tempoMinutos < 60) {
                    tempoDesdeAnterior = `${tempoMinutos}m`;
                } else {
                    const horas = Math.floor(tempoMinutos / 60);
                    const min = tempoMinutos % 60;
                    tempoDesdeAnterior = min > 0 ? `${horas}h${min}m` : `${horas}h`;
                }
            } else {
                tempoDesdeAnterior = '-';
            }
            
            // Adicionar classe para destacar o status atual
            const isStatusAtual = index === fluxoOrdenado.length - 1;
            const statusClass = isStatusAtual ? 'status-atual' : '';
            
            // Criar um item de lista com formato compacto
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <span class="${statusClass}">${statusSimplificado}</span>
                <span>${dataHora}</span>
                <span>${tempoDesdeAnterior}</span>
            `;
            
            historyList.appendChild(item);
            
            // Atualizar a entrada anterior para o próximo cálculo
            entradaAnterior = entrada;
        });
        
        content.appendChild(historyList);
    } else {
        const noHistory = document.createElement('div');
        noHistory.className = 'no-history';
        noHistory.textContent = 'Sem histórico';
        content.appendChild(noHistory);
    }
    
    tooltip.appendChild(content);
    
    // Adicionar o tooltip ao DOM
    document.body.appendChild(tooltip);
    
    // Posicionar o tooltip em relação à célula
    const statusCell = document.querySelector(`.status-cell[data-proposta-id="${proposta.id}"]`);
    if (statusCell) {
        // Obter as dimensões e posições
        const cellRect = statusCell.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Calcular a posição inicial (abaixo da célula)
        let top = cellRect.bottom + 5;
        let left = cellRect.left + (cellRect.width / 2) - (tooltipRect.width / 2);
        
        // Verificar se o tooltip sai da tela na parte inferior
        if (top + tooltipRect.height > viewportHeight) {
            // Posicionar acima da célula se não couber abaixo
            top = cellRect.top - tooltipRect.height - 5;
            
            // Se ainda estiver fora da tela, posicionar no topo da viewport com margem
            if (top < 0) {
                top = 5;
            }
        }
        
        // Verificar se o tooltip sai da tela à direita
        if (left + tooltipRect.width > viewportWidth) {
            left = viewportWidth - tooltipRect.width - 5;
        }
        
        // Verificar se o tooltip sai da tela à esquerda
        if (left < 0) {
            left = 5;
        }
        
        // Aplicar a posição
        tooltip.style.position = 'fixed';
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.maxHeight = `${viewportHeight - 20}px`;
        tooltip.style.overflowY = 'auto';
        
        // Fechar o tooltip ao clicar fora dele
        setTimeout(() => {
            document.addEventListener('click', function closeTooltip(e) {
                if (!tooltip.contains(e.target) && !statusCell.contains(e.target)) {
                    tooltip.remove();
                    document.removeEventListener('click', closeTooltip);
                }
            });
        }, 0);
        
        // Fechar o tooltip ao pressionar ESC
        document.addEventListener('keydown', function escKeyHandler(e) {
            if (e.key === 'Escape') {
                tooltip.remove();
                document.removeEventListener('keydown', escKeyHandler);
            }
        });
    } else {
        console.error("Célula de status não encontrada:", proposta.id);
        tooltip.remove();
    }
}
