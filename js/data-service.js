// Função para mostrar o indicador de carregamento
/**
 * Exibe o indicador de carregamento na interface do usuário.
 * Altera o estilo do elemento 'loading-overlay' para 'flex', tornando-o visível.
 */
function mostrarCarregamento() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

// Função para esconder o indicador de carregamento
function esconderCarregamento() {
    document.getElementById('loading-overlay').style.display = 'none';
}

// Função para buscar dados de uma data específica
async function buscarDadosPorData(data) {
    try {
        const url = `${CONFIG.API_URL}?data=${data}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro na requisição para ${data}: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Erro ao buscar dados para ${data}:`, error);
        throw error;
    }
}

// Função para calcular tempo da etapa anterior até certificação (SEM desconto inicial)
function calcularTempoEtapaAnteriorParaCertificacao(proposta) {
    if (!proposta.horaCertifica) {
        return null;
    }
    
    // LÓGICA EXATA DO RELATÓRIO:
    // Se passou pela PENDÊNCIA, usar tempo da pendência até certificação
    if (proposta.horaPendencia) {
        return calcularTempoEmMinutosOriginal(proposta.horaPendencia, proposta.horaCertifica);
    }
    
    // Se NÃO passou pela pendência mas passou pela análise, usar tempo da análise até certificação
    if (proposta.horaAnalise) {
        return calcularTempoEmMinutosOriginal(proposta.horaAnalise, proposta.horaCertifica);
    }
    
    // Se não passou nem pela pendência nem pela análise, usar tempo da entrada até certificação
    return calcularTempoEmMinutosOriginal(proposta.horaEntrada, proposta.horaCertifica);
}

// Adicionar função para gerar comentários automáticos separados para propostas PAGAS com tempo excedido
function adicionarComentariosAutomaticos(propostas) {
    // Filtrar propostas PAGAS que excedem 2:30 horas e não têm comentários automáticos
    const propostasExcedidas = propostas.filter(p => {
        // Verificar se a proposta está PAGO
        const estaPaga = p.statusSimplificado === "PAGO";
        
        // Verificar se a proposta excede 2:30 horas (150 minutos)
        const excedeTempo = p.tempoTotal && p.tempoTotal > 150;
        
        // Verificar se já existem comentários automáticos sobre tempo excedido
        const temComentarioTempoExcedido = p.observacoes && p.observacoes.some(obs => 
            obs.USUARIO === 'GER' && 
            obs.OBSERVACAO && 
            obs.OBSERVACAO.includes('Tempo excedido')
        );
        
        const temComentarioHorarioEntrada = p.observacoes && p.observacoes.some(obs => 
            obs.USUARIO === 'GER' && 
            obs.OBSERVACAO && 
            obs.OBSERVACAO.includes('horário de puxar operação')
        );
        
        const temComentarioTempoCertificaPago = p.observacoes && p.observacoes.some(obs => 
            obs.USUARIO === 'GER' && 
            obs.OBSERVACAO && 
            obs.OBSERVACAO.includes('Tempo de QCertifica até Pago')
        );
        
        // Retornar true se está paga, excede tempo e falta pelo menos um dos comentários automáticos
        return estaPaga && excedeTempo && 
            (!temComentarioTempoExcedido || !temComentarioHorarioEntrada || !temComentarioTempoCertificaPago);
    });
    
    console.log(`Encontradas ${propostasExcedidas.length} propostas PAGAS com tempo excedido que precisam de comentários automáticos`);
    
    // Adicionar comentários automáticos a cada proposta excedida
    propostasExcedidas.forEach(p => {
        // Garantir que o array de observações existe
        if (!p.observacoes) {
            p.observacoes = [];
        }
        
        const agora = new Date().toISOString();
        
        // 1. Comentário sobre tempo excedido
        const temComentarioTempoExcedido = p.observacoes.some(obs => 
            obs.USUARIO === 'GER' && 
            obs.OBSERVACAO && 
            obs.OBSERVACAO.includes('Tempo excedido')
        );
        
        if (!temComentarioTempoExcedido) {
            const tempoFormatado = formatarTempo(p.tempoTotal);
            const comentarioTempoExcedido = {
                USUARIO: 'GER',
                OBSERVACAO: `Tempo excedido: ${tempoFormatado}`,
                DATA_HORA: agora
            };
            p.observacoes.push(comentarioTempoExcedido);
            console.log(`Adicionado comentário de tempo excedido à proposta ${p.numero}`);
        }
        
        // 2. Comentário sobre horário de entrada (se aplicável)
        if (p.horaEntrada) {
            const dataEntrada = new Date(p.horaEntrada);
            const horaEntrada = dataEntrada.getHours();
            const minutoEntrada = dataEntrada.getMinutes();
            
            const temComentarioHorarioEntrada = p.observacoes.some(obs => 
                obs.USUARIO === 'GER' && 
                obs.OBSERVACAO && 
                obs.OBSERVACAO.includes('horário de puxar operação')
            );
            
            if (horaEntrada < 10 && !temComentarioHorarioEntrada) {
                // Formatar a hora de entrada (HH:MM)
                const horaFormatada = `${horaEntrada.toString().padStart(2, '0')}:${minutoEntrada.toString().padStart(2, '0')}`;
                
                const comentarioHorarioEntrada = {
                    USUARIO: 'GER',
                    OBSERVACAO: `Entrou em horário de puxar operação às ${horaFormatada}`,
                    DATA_HORA: agora
                };
                p.observacoes.push(comentarioHorarioEntrada);
                console.log(`Adicionado comentário de horário de entrada à proposta ${p.numero}`);
            }
        }
        
        // 3. Comentário sobre tempo entre QCertifica e Pago (se aplicável)
        if (p.tempoCertificaAtePagamento) {
            const temComentarioTempoCertificaPago = p.observacoes.some(obs => 
                obs.USUARIO === 'GER' && 
                obs.OBSERVACAO && 
                obs.OBSERVACAO.includes('Tempo de QCertifica até Pago')
            );
            
            if (!temComentarioTempoCertificaPago) {
                const tempoCertificaAtePagamentoFormatado = formatarTempo(p.tempoCertificaAtePagamento);
                const comentarioTempoCertificaPago = {
                    USUARIO: 'GER',
                    OBSERVACAO: `Tempo da assinatura até o pagamento: ${tempoCertificaAtePagamentoFormatado}`,
                    DATA_HORA: agora
                };
                p.observacoes.push(comentarioTempoCertificaPago);
                console.log(`Adicionado comentário de tempo entre QCertifica e Pago à proposta ${p.numero}`);
            }
        }
        
        // 4. Comentário sobre status de COTAÇÃO (se aplicável)
        if (p.fluxoCompleto && Array.isArray(p.fluxoCompleto)) {
            // Procurar entradas de COTAÇÃO no fluxo completo
            const entradasCotacao = p.fluxoCompleto.filter(f => 
                f.STATUS_FLUXO === "COTAÇÃO" || f.STATUS_FLUXO === "COTACAO"
            );
            
            if (entradasCotacao.length > 0) {
                // Verificar se já existe comentário sobre COTAÇÃO
                const temComentarioCotacao = p.observacoes.some(obs => 
                    obs.USUARIO === 'GER' && 
                    obs.OBSERVACAO && 
                    obs.OBSERVACAO.includes('Status COTAÇÃO')
                );
                
                if (!temComentarioCotacao) {
                    // Calcular o tempo total em COTAÇÃO
                    let tempoTotalCotacao = 0;
                    
                    entradasCotacao.forEach(entrada => {
                        if (entrada.DATA_HORA_ENTRADA && entrada.DATA_HORA_SAIDA) {
                            const inicio = new Date(entrada.DATA_HORA_ENTRADA);
                            const fim = new Date(entrada.DATA_HORA_SAIDA);
                            const tempoMinutos = Math.round((fim - inicio) / (1000 * 60));
                            tempoTotalCotacao += tempoMinutos;
                        }
                    });
                    
                    // Formatar a hora de entrada na primeira COTAÇÃO
                    const primeiraEntrada = new Date(entradasCotacao[0].DATA_HORA_ENTRADA);
                    const horaEntrada = primeiraEntrada.getHours().toString().padStart(2, '0');
                    const minutoEntrada = primeiraEntrada.getMinutes().toString().padStart(2, '0');
                    const horaFormatada = `${horaEntrada}:${minutoEntrada}`;
                    
                    // Adicionar comentário
                    const comentarioCotacao = {
                        USUARIO: 'GER',
                        OBSERVACAO: `Status COTAÇÃO: Entrou às ${horaFormatada} e permaneceu por ${formatarTempo(tempoTotalCotacao)}`,
                        DATA_HORA: agora
                    };
                    p.observacoes.push(comentarioCotacao);
                    console.log(`Adicionado comentário de status COTAÇÃO à proposta ${p.numero}`);
                }
            }
            
            // 5. Comentário sobre status de CHECAGEM (se aplicável)
            const entradasChecagem = p.fluxoCompleto.filter(f => 
                f.STATUS_FLUXO === "CHECAGEM"
            );
            
            if (entradasChecagem.length > 0) {
                // Verificar se já existe comentário sobre CHECAGEM
                const temComentarioChecagem = p.observacoes.some(obs => 
                    obs.USUARIO === 'GER' && 
                    obs.OBSERVACAO && 
                    obs.OBSERVACAO.includes('Status CHECAGEM')
                );
                
                if (!temComentarioChecagem) {
                    // Calcular o tempo total em CHECAGEM
                    let tempoTotalChecagem = 0;
                    
                    entradasChecagem.forEach(entrada => {
                        if (entrada.DATA_HORA_ENTRADA && entrada.DATA_HORA_SAIDA) {
                            const inicio = new Date(entrada.DATA_HORA_ENTRADA);
                            const fim = new Date(entrada.DATA_HORA_SAIDA);
                            const tempoMinutos = Math.round((fim - inicio) / (1000 * 60));
                            tempoTotalChecagem += tempoMinutos;
                        }
                    });
                    
                    // Formatar a hora de entrada na primeira CHECAGEM
                    const primeiraEntrada = new Date(entradasChecagem[0].DATA_HORA_ENTRADA);
                    const horaEntrada = primeiraEntrada.getHours().toString().padStart(2, '0');
                    const minutoEntrada = primeiraEntrada.getMinutes().toString().padStart(2, '0');
                    const horaFormatada = `${horaEntrada}:${minutoEntrada}`;
                    
                    // Adicionar comentário
                    const comentarioChecagem = {
                        USUARIO: 'GER',
                        OBSERVACAO: `Status CHECAGEM: Entrou às ${horaFormatada} e permaneceu por ${formatarTempo(tempoTotalChecagem)}`,
                        DATA_HORA: agora
                    };
                    p.observacoes.push(comentarioChecagem);
                    console.log(`Adicionado comentário de status CHECAGEM à proposta ${p.numero}`);
                }
            }
        }
    });
    
    return propostas;
}

// Modificar a função buscarDados para reaplicar o filtro de usuário após a atualização
async function buscarDados() {
    // Verificar se já existe uma busca em andamento
    if (APP_STATE.buscaEmAndamento) {
        console.log('[INFO] Busca já em andamento, ignorando nova solicitação');
        return [];
    }
    
    // Marcar que uma busca está em andamento
    APP_STATE.buscaEmAndamento = true;
    mostrarCarregamento();
    
    try {
        const datas = gerarArrayDeDatas(APP_STATE.dataInicio, APP_STATE.dataFim);
        let todasPropostas = [];
        let erros = [];
        
        // Buscar dados para cada data no intervalo
        for (const data of datas) {
            try {
                const dadosData = await buscarDadosPorData(data);
                todasPropostas = todasPropostas.concat(dadosData);
            } catch (error) {
                erros.push(`Erro ao buscar dados para ${formatarData(data)}: ${error.message}`);
            }
        }
        
        // Se houver erros, exibir mensagem
        if (erros.length > 0) {
            document.getElementById('error-message').textContent = erros.join('. ');
            document.getElementById('error-message').style.display = 'block';
            setTimeout(() => {
                document.getElementById('error-message').style.display = 'none';
            }, 5000);
        }
        
        // Processar os dados obtidos
        let novasPropostas = processarDados(todasPropostas);
        
        // Adicionar comentários automáticos para propostas com tempo excedido
        novasPropostas = adicionarComentariosAutomaticos(novasPropostas);
        
        // Atualiza o array de propostas
        const idsAntigos = APP_STATE.propostas.map(p => p.id);
        const propostasNovas = novasPropostas.filter(p => !idsAntigos.includes(p.id));
        
        // Atualiza propostas existentes e adiciona novas
        APP_STATE.propostas = novasPropostas;
        
        // Aplicar o filtro de usuário atual, se houver
        const usuarioFiltro = document.getElementById('usuario-filter')?.value || 'todos';
        if (usuarioFiltro !== 'todos') {
            console.log(`Reaplicando filtro de usuário: ${usuarioFiltro}`);
        }
        
        return propostasNovas.map(p => p.id);
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        document.getElementById('error-message').textContent = `Erro ao buscar dados: ${error.message}`;
        document.getElementById('error-message').style.display = 'block';
        setTimeout(() => {
            document.getElementById('error-message').style.display = 'none';
        }, 5000);
        return [];
    } finally {
        APP_STATE.buscaEmAndamento = false;
        esconderCarregamento();
    }
}

// Modificar a função processarDados para incluir o cálculo do tempo no comitê
function processarDados(data) {
    console.log("Processando dados com desconto controlado de horário de almoço...");
    
    return data.map(item => {
        try {
            if (!item || !item.DATA || !item.NUMERO || !item.CEDENTE) {
                console.error("Item inválido:", item);
                return null;
            }
            
            const fluxoOriginal = Array.isArray(item.FLUXO) ? item.FLUXO : [];
            const observacoes = Array.isArray(item.OBSERVACOES) ? item.OBSERVACOES : [];
            
            // Corrigir inconsistências no fluxo
            let fluxo = [...fluxoOriginal];
            
            for (let i = 1; i < fluxo.length; i++) {
                const statusAtual = fluxo[i].STATUS_FLUXO;
                const statusAnterior = fluxo[i-1].STATUS_FLUXO;
                
                if (statusAtual === "2 - AGUARD. ANÁLISE" && statusAnterior === "3 - OPER. ANALISANDO") {
                    console.log(`Inconsistência detectada na proposta ${item.NUMERO}: Retrocesso removido.`);
                    fluxo.splice(i, 1);
                    i--;
                }
            }
            
            // Encontrar horários importantes
            const primeiraEntrada = fluxo.length > 0 ? fluxo[0].DATA_HORA_ENTRADA : null;
            const statusAtual = fluxo.length > 0 ? fluxo[fluxo.length - 1].STATUS_FLUXO : "Desconhecido";
            const statusSimplificado = simplificarStatus(statusAtual);
            
            // Status terminais
            const statusTerminais = ["PAGO", "POSTERGADO", "RECUSADO", "CEDENTE DESISTIU"];
            const isStatusTerminal = statusTerminais.includes(statusSimplificado);
            
            // Encontrar entradas específicas
            const entradaPagamento = fluxo.find(f => f.STATUS_FLUXO.includes("PAGO"));
            const horaPagamento = entradaPagamento ? entradaPagamento.DATA_HORA_ENTRADA : null;
            
            const entradaAnalise = fluxo.find(f => f.STATUS_FLUXO === "3 - OPER. ANALISANDO");
            const horaAnalise = entradaAnalise ? entradaAnalise.DATA_HORA_ENTRADA : null;
            
            const entradaPendencia = fluxo.find(f => {
                const status = f.STATUS_FLUXO.toUpperCase();
                return status.includes('PENDENCIA') || 
                    status.includes('PENDÊNCIA') || 
                    status === '4 - PENDÊNCIA' ||
                    status === '4 - PENDENCIA' ||
                    status.match(/^\d+\s*-\s*PEND[EÊ]NCIA$/);
            });
            const horaPendencia = entradaPendencia ? entradaPendencia.DATA_HORA_ENTRADA : null;
            
            const entradaChecagem = fluxo.find(f => f.STATUS_FLUXO === "CHECAGEM");
            const horaChecagem = entradaChecagem ? entradaChecagem.DATA_HORA_ENTRADA : null;
            
            const entradasCertificacao = fluxo
                .filter(f => f.STATUS_FLUXO.includes("Q CERT. ASSINAT."))
                .sort((a, b) => new Date(b.DATA_HORA_ENTRADA) - new Date(a.DATA_HORA_ENTRADA));
            
            const entradaCertifica = entradasCertificacao.length > 0 ? entradasCertificacao[0] : null;
            const horaCertifica = entradaCertifica ? entradaCertifica.DATA_HORA_ENTRADA : null;
            
            // Calcular tempos SEM desconto inicial
            const tempoAteAnalise = calcularTempoEmMinutosOriginal(primeiraEntrada, horaAnalise);
            const tempoAtePendencia = calcularTempoEmMinutosOriginal(primeiraEntrada, horaPendencia);
            const tempoAnaliseAtePendencia = calcularTempoEmMinutosOriginal(horaAnalise, horaPendencia);
            const tempoAteChecagem = calcularTempoEmMinutosOriginal(primeiraEntrada, horaChecagem);
            const tempoAteCertifica = calcularTempoEmMinutosOriginal(primeiraEntrada, horaCertifica);

            // Calcular tempo da etapa anterior até certificação
            const tempoEtapaAnteriorAteCertifica = calcularTempoEtapaAnteriorParaCertificacao({
                horaEntrada: primeiraEntrada,
                horaAnalise: horaAnalise,
                horaPendencia: horaPendencia,
                horaCertifica: horaCertifica
            });

            const tempoCertificaAtePagamento = calcularTempoEmMinutosOriginal(horaCertifica, horaPagamento);

            // CALCULAR TEMPO TOTAL
            let tempoTotal;
            if (isStatusTerminal) {
                const ultimaEntrada = fluxo[fluxo.length - 1].DATA_HORA_ENTRADA;
                tempoTotal = calcularTempoEmMinutosOriginal(primeiraEntrada, ultimaEntrada);
            } else {
                const agora = new Date();
                tempoTotal = calcularTempoEmMinutosOriginal(primeiraEntrada, agora);
            }

            // APLICAR DESCONTO DE ALMOÇO NO TEMPO TOTAL (se necessário)
            let tempoTotalOriginal = tempoTotal;
            if (tempoTotal && primeiraEntrada && horaPagamento) {
                const horaEntrada = new Date(primeiraEntrada).getHours();
                const horaPago = new Date(horaPagamento).getHours();
                
                // Se entrou antes das 13h, foi pago depois das 13h e tempo > 2:30h
                if (horaEntrada < 13 && horaPago >= 13 && tempoTotal > 150) {
                    tempoTotal = tempoTotal - 60; // Descontar 1 hora
                    console.log(`Desconto de almoço aplicado no tempo total da proposta ${item.NUMERO}: ${tempoTotalOriginal}min → ${tempoTotal}min`);
                }
            }

            // CALCULAR TEMPO ATÉ PAGAMENTO
            const tempoAtePagamento = calcularTempoEmMinutosOriginal(primeiraEntrada, horaPagamento);

            // FLAGS (usar o tempo total já com desconto aplicado)
            const tempoTotalExcedido = tempoTotal > 150;
            const tempoEmTempoReal = !isStatusTerminal;

            // Criar o objeto da proposta
            let propostaProcessada = {
                id: `${item.DATA}-${item.NUMERO}`,
                numero: item.NUMERO,
                cedente: item.CEDENTE,
                data: item.DATA,
                dataFormatada: formatarData(item.DATA),
                valorProposto: parseFloat(item.VLR_PROPOSTOS) || parseFloat(item.VALOR_PROPOSTO) || 0,
                valorAprovado: parseFloat(item.VLR_APR_DIR) || parseFloat(item.VLR_APROVADO) || parseFloat(item.VALOR_APROVADO) || 0,
                horaEntrada: primeiraEntrada,
                horaAnalise: horaAnalise,
                tempoAteAnalise: tempoAteAnalise,
                horaPendencia: horaPendencia,
                tempoAtePendencia: tempoAtePendencia,
                tempoAnaliseAtePendencia: tempoAnaliseAtePendencia,
                horaChecagem: horaChecagem,
                tempoAteChecagem: tempoAteChecagem,
                horaCertifica: horaCertifica,
                tempoAteCertifica: tempoAteCertifica,
                tempoEtapaAnteriorAteCertifica: tempoEtapaAnteriorAteCertifica,
                horaPagamento: horaPagamento,
                tempoCertificaAtePagamento: tempoCertificaAtePagamento,
                statusAtual: statusAtual,
                statusSimplificado: statusSimplificado,
                pesoStatus: getPesoStatus(statusSimplificado),
                tempoTotal: tempoTotal !== null ? Number(tempoTotal) : null,
                tempoTotalOriginal: tempoTotalOriginal !== null ? Number(tempoTotalOriginal) : null, // Guardar o original
                tempoTotalExcedido: tempoTotalExcedido,
                tempoEmTempoReal: tempoEmTempoReal,
                tempoAtePagamento: tempoAtePagamento !== null ? Number(tempoAtePagamento) : null,
                fluxoCompleto: fluxo,
                observacoes: observacoes
            };

            // APLICAR DESCONTO DE ALMOÇO NOS TEMPOS ESPECÍFICOS (períodos individuais)
            propostaProcessada = aplicarDescontoAlmocoNosTempos(propostaProcessada);

            return propostaProcessada;
            
        } catch (error) {
            console.error("Erro ao processar item:", error, item);
            return null;
        }
    }).filter(item => item !== null); // Remover itens que não puderam ser processados
}

// Adicionar a função calcularTempoEmMinutosOriginal (sem desconto de almoço)
function calcularTempoEmMinutosOriginal(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) {
        return null;
    }
    
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    return Math.round((fim - inicio) / (1000 * 60));
}

// Função simplificada para tempo real (mantém a lógica simples para os timers)
function calcularTempoComDescontoAlmoco(dataInicio, dataFim = null) {
    if (!dataInicio) return null;
    
    const inicio = new Date(dataInicio);
    const fim = dataFim ? new Date(dataFim) : new Date();
    
    let tempoDecorrido = Math.floor((fim - inicio) / (1000 * 60)); // Em minutos
    
    // Lógica simples para tempo real: se entrou antes das 13h e passou das 13h
    const horaEntrada = inicio.getHours();
    const entrouAntesDas13 = horaEntrada < 13;
    const horaAtual = fim.getHours();
    const minutoAtual = fim.getMinutes();
    const passouDas13 = horaAtual > 13 || (horaAtual === 13 && minutoAtual > 0);
    
    if (entrouAntesDas13 && passouDas13) {
        tempoDecorrido -= 60; // Descontar 1 hora
    }
    
    return tempoDecorrido;
}

// Tornar a função global para uso em outros arquivos
window.calcularTempoComDescontoAlmoco = calcularTempoComDescontoAlmoco;

// Modificar a função filtrarPropostas para incluir o filtro por usuário e torná-la global
window.filtrarPropostas = function() {
    // Obter os valores dos filtros
    const statusFiltro = document.getElementById('status-filter').value;
    const cedenteFiltro = document.getElementById('cedente-filter').value.toLowerCase();
    const usuarioFiltro = document.getElementById('usuario-filter')?.value || 'todos';
    
    // Log para depuração
    console.log(`Filtrando propostas - Status: ${statusFiltro}, Cedente: ${cedenteFiltro}, Usuário: ${usuarioFiltro}`);
    
    // Verificar se APP_STATE e APP_STATE.propostas existem
    if (!window.APP_STATE || !Array.isArray(window.APP_STATE.propostas)) {
        console.error("APP_STATE ou APP_STATE.propostas não estão disponíveis");
        return [];
    }
    
    // Filtrar as propostas com base nos critérios
    return window.APP_STATE.propostas.filter(proposta => {
        // Filtro de status
        const passaFiltroStatus = statusFiltro === 'todos' || proposta.statusAtual === statusFiltro || proposta.statusSimplificado === statusFiltro;
        
        // Filtro de cedente
        const passaFiltroCedente = cedenteFiltro === '' || proposta.cedente.toLowerCase().includes(cedenteFiltro);
        
        // Filtro de usuário
        let passaFiltroUsuario = true;
        if (usuarioFiltro !== 'todos' && window.CedenteService && typeof window.CedenteService.cedenteAssociadoAoUsuario === 'function') {
            passaFiltroUsuario = window.CedenteService.cedenteAssociadoAoUsuario(proposta.cedente, usuarioFiltro);
        }
        
        // Retornar true apenas se passar por todos os filtros
        return passaFiltroStatus && passaFiltroCedente && passaFiltroUsuario;
    });
};

// Tornar a função ordenarPropostas global
window.ordenarPropostas = function(propostas) {
    // Verificar se propostas é um array
    if (!Array.isArray(propostas)) {
        console.error("ordenarPropostas: propostas não é um array");
        return [];
    }
    
    // Obter o critério de ordenação atual
    const ordenacao = window.APP_STATE?.ordenacao || 'data_desc';
    
    // Criar uma cópia do array para não modificar o original
    const propostasOrdenadas = [...propostas];
    
    // Ordenar com base no critério selecionado
    switch (ordenacao) {
        case 'data_desc':
            propostasOrdenadas.sort((a, b) => new Date(b.data) - new Date(a.data));
            break;
        case 'data_asc':
            propostasOrdenadas.sort((a, b) => new Date(a.data) - new Date(b.data));
            break;
        case 'tempo_total_desc':
            propostasOrdenadas.sort((a, b) => (b.tempoTotal || 0) - (a.tempoTotal || 0));
            break;
        case 'tempo_total_asc':
            propostasOrdenadas.sort((a, b) => (a.tempoTotal || 0) - (b.tempoTotal || 0));
            break;
        case 'hora_entrada_desc':
            propostasOrdenadas.sort((a, b) => {
                if (!a.horaEntrada) return 1;
                if (!b.horaEntrada) return -1;
                return new Date(b.horaEntrada) - new Date(a.horaEntrada);
            });
            break;
        case 'hora_entrada_asc':
            propostasOrdenadas.sort((a, b) => {
                if (!a.horaEntrada) return 1;
                if (!b.horaEntrada) return -1;
                return new Date(a.horaEntrada) - new Date(b.horaEntrada);
            });
            break;
        case 'numero_desc':
            propostasOrdenadas.sort((a, b) => parseInt(b.numero) - parseInt(a.numero));
            break;
        case 'numero_asc':
            propostasOrdenadas.sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
            break;
        case 'cedente_asc':
            propostasOrdenadas.sort((a, b) => a.cedente.localeCompare(b.cedente));
            break;
        case 'cedente_desc':
            propostasOrdenadas.sort((a, b) => b.cedente.localeCompare(a.cedente));
            break;
        case 'analise_desc':
            propostasOrdenadas.sort((a, b) => {
                if (!a.horaAnalise) return 1;
                if (!b.horaAnalise) return -1;
                return new Date(b.horaAnalise) - new Date(a.horaAnalise);
            });
            break;
        case 'analise_asc':
            propostasOrdenadas.sort((a, b) => {
                if (!a.horaAnalise) return 1;
                if (!b.horaAnalise) return -1;
                return new Date(a.horaAnalise) - new Date(b.horaAnalise);
            });
            break;
        case 'checagem_desc':
            propostasOrdenadas.sort((a, b) => {
                if (!a.horaChecagem) return 1;
                if (!b.horaChecagem) return -1;
                return new Date(b.horaChecagem) - new Date(a.horaChecagem);
            });
            break;
        case 'checagem_asc':
            propostasOrdenadas.sort((a, b) => {
                if (!a.horaChecagem) return 1;
                if (!b.horaChecagem) return -1;
                return new Date(a.horaChecagem) - new Date(b.horaChecagem);
            });
            break;
        case 'certificacao_desc':
            propostasOrdenadas.sort((a, b) => {
                if (!a.horaCertifica) return 1;
                if (!b.horaCertifica) return -1;
                return new Date(b.horaCertifica) - new Date(a.horaCertifica);
            });
            break;
        case 'certificacao_asc':
            propostasOrdenadas.sort((a, b) => {
                if (!a.horaCertifica) return 1;
                if (!b.horaCertifica) return -1;
                return new Date(a.horaCertifica) - new Date(b.horaCertifica);
            });
            break;
        case 'pagamento_desc':
            propostasOrdenadas.sort((a, b) => {
                if (!a.horaPagamento) return 1;
                if (!b.horaPagamento) return -1;
                return new Date(b.horaPagamento) - new Date(a.horaPagamento);
            });
            break;
        case 'pagamento_asc':
            propostasOrdenadas.sort((a, b) => {
                if (!a.horaPagamento) return 1;
                if (!b.horaPagamento) return -1;
                return new Date(a.horaPagamento) - new Date(b.horaPagamento);
            });
            break;
        case 'status_asc':
            propostasOrdenadas.sort((a, b) => a.pesoStatus - b.pesoStatus);
            break;
        case 'status_desc':
            propostasOrdenadas.sort((a, b) => b.pesoStatus - a.pesoStatus);
            break;
        default:
            // Ordenação padrão por data (mais recente primeiro)
            propostasOrdenadas.sort((a, b) => new Date(b.data) - new Date(a.data));
    }
    
    return propostasOrdenadas;
};

// Tornar a função calcularSomaValoresAprovados global
window.calcularSomaValoresAprovados = calcularSomaValoresAprovados;

// Função específica para calcular soma dos valores aprovados (MODIFICADA)
function calcularSomaValoresAprovados(propostasFiltradas = null) {
    console.log('🧮 Calculando soma dos valores aprovados...');
    
    // Usar propostas filtradas se fornecidas, senão usar todas
    const propostas = propostasFiltradas || APP_STATE.propostas;
    
    // Filtrar apenas propostas PAGAS
    const propostasPagas = propostas.filter(p => p.statusSimplificado === 'PAGO');
    console.log(`📊 Propostas pagas encontradas: ${propostasPagas.length}`);
    
    // Calcular a soma
    let soma = 0;
    let contadorComValor = 0;
    
    propostasPagas.forEach(proposta => {
        // Tentar extrair valor de diferentes campos possíveis
        let valorAprovado = 0;
        
        // Lista de campos possíveis para valor aprovado
        const camposValor = ['VLR_APR_DIR', 'VLR_APROVADO', 'VALOR_APROVADO', 'valorAprovado'];
        
        for (const campo of camposValor) {
            if (proposta[campo] && parseFloat(proposta[campo]) > 0) {
                valorAprovado = parseFloat(proposta[campo]);
                break;
            }
        }
        
        if (valorAprovado > 0) {
            soma += valorAprovado;
            contadorComValor++;
            console.log(`💰 Proposta ${proposta.numero}: R$ ${valorAprovado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
        }
    });
    
    // Atualizar o estado
    APP_STATE.somaValoresAprovados = soma;
    
    console.log(`✅ Soma total: R$ ${soma.toLocaleString('pt-BR', {minimumFractionDigits: 2})} (${contadorComValor} propostas com valor)`);
    
    // Atualizar a interface
    atualizarInterfaceSoma();
    
    // Atualizar informações de metas (sem diferença)
    atualizarInformacoesMetas();
    
    return soma;
}

// Função para atualizar a interface com a soma
function atualizarInterfaceSoma() {
    const elementoSoma = document.getElementById('soma-valores-aprovados');
    if (elementoSoma) {
        // Usar formato completo para borderôs pagos
        const valorFormatado = formatarMoedaPersonalizada(APP_STATE.somaValoresAprovados, false);
        elementoSoma.textContent = valorFormatado;
        console.log(`🖥️ Interface atualizada: ${valorFormatado}`);
    } else {
        console.error('❌ Elemento soma-valores-aprovados não encontrado!');
    }
}

// Função para atualizar labels das metas
// Função para atualizar labels das metas
function atualizarLabelsMetas() {
    const metaInfo = obterInformacoesMeta();
    
    // Atualizar label da meta mensal
    const labelMetaMensal = document.getElementById('meta-mensal-label');
    if (labelMetaMensal) {
        labelMetaMensal.textContent = `Meta Mensal (${metaInfo.mesAtual})`;
        console.log(`Label meta mensal atualizado: Meta Mensal (${metaInfo.mesAtual})`);
    } else {
        console.error('Elemento meta-mensal-label não encontrado');
    }
    
    // Atualizar label da meta diária
    const labelMetaDiaria = document.getElementById('meta-diaria-label');
    if (labelMetaDiaria) {
        labelMetaDiaria.textContent = `Meta Diária (${metaInfo.diasUteis} dias úteis)`;
        console.log(`Label meta diária atualizado: Meta Diária (${metaInfo.diasUteis} dias úteis)`);
    } else {
        console.error('Elemento meta-diaria-label não encontrado');
    }
}

// Função para atualizar label dos borderôs com porcentagem
function atualizarLabelBorderos() {
    const metaInfo = obterInformacoesMeta();
    const valorAtual = APP_STATE.somaValoresAprovados;
    
    // Calcular porcentagem em relação à meta diária
    const porcentagem = metaInfo.metaDiaria > 0 ? (valorAtual / metaInfo.metaDiaria) * 100 : 0;
    
    // Atualizar label dos borderôs
    const labelBorderos = document.getElementById('borderos-label');
    if (labelBorderos) {
        labelBorderos.textContent = `Borderôs Pagos (${porcentagem.toFixed(0)}%)`;
        console.log(`Label borderôs atualizado: Borderôs Pagos (${porcentagem.toFixed(0)}%)`);
    } else {
        console.error('Elemento borderos-label não encontrado');
    }
    
    return porcentagem;
}


// Função para buscar dados do mês atual completo (APENAS para o acumulado)
async function buscarDadosMesAtualCompleto() {
    try {
        // Obter informações do mês atual
        const mesAtual = obterInformacoesMesAtual();

        console.log(`📅 [ACUMULADO] Buscando dados completos do mês: ${mesAtual.mesAnoStr} (${mesAtual.primeiroDiaStr} a ${mesAtual.ultimoDiaStr})`);
        
        // Gerar array de datas do mês inteiro
        const datasDoMes = gerarArrayDeDatas(mesAtual.primeiroDia, mesAtual.ultimoDia);

        console.log(`📋 [ACUMULADO] Buscando dados para ${datasDoMes.length} dias do mês`);
        
        let todasPropostasDoMes = [];
        let erros = [];
        
        // Buscar dados para cada data do mês
        for (const data of datasDoMes) {
            try {
                const dadosData = await buscarDadosPorData(data);
                todasPropostasDoMes = todasPropostasDoMes.concat(dadosData);
            } catch (error) {
                erros.push(`Erro ao buscar dados para ${formatarData(data)}: ${error.message}`);

                console.warn(`[ACUMULADO] Erro ao buscar dados para ${data}:`, error);
            }
        }
        
        // Log de erros se houver
        if (erros.length > 0) {

            console.warn(`[ACUMULADO] Erros ao buscar dados do mês: ${erros.length} erros`);
        }
        
        // Processar os dados obtidos
        const propostasProcessadas = processarDados(todasPropostasDoMes);
        

        console.log(`✅ [ACUMULADO] Dados do mês ${mesAtual.mesAnoStr} carregados: ${propostasProcessadas.length} propostas`);
        
        return {
            propostas: propostasProcessadas,
            mesInfo: mesAtual,
            erros: erros
        };
        
    } catch (error) {

        console.error('[ACUMULADO] Erro ao buscar dados do mês atual completo:', error);
        return {
            propostas: [],
            mesInfo: obterInformacoesMesAtual(),
            erros: [error.message]
        };
    }
}


// Função para calcular valor acumulado do mês atual (INDEPENDENTE dos filtros)
async function calcularValorAcumuladoMesAtual() {

    console.log('📊 [ACUMULADO] Calculando valor acumulado do mês atual...');
    
    try {
        // Buscar dados do mês inteiro (independente dos filtros)
        const dadosMes = await buscarDadosMesAtualCompleto();
        const propostas = dadosMes.propostas;
        const mesAtual = dadosMes.mesInfo;
        

        console.log(`📋 [ACUMULADO] Total de propostas do mês ${mesAtual.mesAnoStr}: ${propostas.length}`);
        
        // Filtrar apenas propostas PAGAS
        const propostasDoMesPagas = propostas.filter(proposta => {
            return proposta.statusSimplificado === 'PAGO';
        });
        

        console.log(`💳 [ACUMULADO] Propostas pagas do mês ${mesAtual.nomeMes}: ${propostasDoMesPagas.length}`);
        
        // Calcular a soma dos valores aprovados
        let valorAcumulado = 0;
        let contadorComValor = 0;
        
        propostasDoMesPagas.forEach(proposta => {
            // Tentar extrair valor de diferentes campos possíveis
            let valorAprovado = 0;
            
            // Lista de campos possíveis para valor aprovado
            const camposValor = ['VLR_APR_DIR', 'VLR_APROVADO', 'VALOR_APROVADO', 'valorAprovado'];
            
            for (const campo of camposValor) {
                if (proposta[campo] && parseFloat(proposta[campo]) > 0) {
                    valorAprovado = parseFloat(proposta[campo]);
                    break;
                }
            }
            
            if (valorAprovado > 0) {
                valorAcumulado += valorAprovado;
                contadorComValor++;

                // Log mais discreto para não poluir o console
                if (contadorComValor <= 5) {
                    console.log(`💰 [ACUMULADO] Proposta ${proposta.numero} (${proposta.data}): R$ ${valorAprovado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
                }
            }
        });
        

        if (contadorComValor > 5) {
            console.log(`💰 [ACUMULADO] ... e mais ${contadorComValor - 5} propostas`);
        }
        
        console.log(`✅ [ACUMULADO] Valor acumulado ${mesAtual.mesAnoStr}: R$ ${valorAcumulado.toLocaleString('pt-BR', {minimumFractionDigits: 2})} (${contadorComValor} propostas)`);
        
        return {
            valor: valorAcumulado,
            quantidade: contadorComValor,
            mesInfo: mesAtual,
            propostas: propostasDoMesPagas,
            totalPropostas: propostas.length,
            erros: dadosMes.erros
        };
        
    } catch (error) {

        console.error('[ACUMULADO] Erro ao calcular valor acumulado:', error);
        const mesAtual = obterInformacoesMesAtual();
        
        return {
            valor: 0,
            quantidade: 0,
            mesInfo: mesAtual,
            propostas: [],
            totalPropostas: 0,
            erros: [error.message]
        };
    }
}


// Função para atualizar APENAS a interface do valor acumulado
async function atualizarValorAcumuladoInterface() {
    try {
        console.log('🔄 [ACUMULADO] Atualizando interface do valor acumulado...');
        
        const acumulado = await calcularValorAcumuladoMesAtual();
        
        // Atualizar elemento na interface
        const elementoAcumulado = document.getElementById('valor-acumulado-mes');
        if (elementoAcumulado) {
            // ALTERADO: usar formato completo (false) ao invés de compacto (true)
            elementoAcumulado.textContent = formatarMoedaMeta(acumulado.valor, false);
            console.log(`🖥️ [ACUMULADO] Interface atualizada: ${formatarMoedaMeta(acumulado.valor, false)}`);
        } else {
            console.warn('[ACUMULADO] Elemento valor-acumulado-mes não encontrado no DOM');
        }
        
        // Atualizar label do acumulado
        const labelAcumulado = document.getElementById('valor-acumulado-label');
        if (labelAcumulado) {
            labelAcumulado.textContent = `Acumulado ${acumulado.mesInfo.mesAnoStr}`;
        }
        
        // Log de resumo (mantém compacto no console para não poluir)
        console.log(`📊 [ACUMULADO] ${acumulado.mesInfo.mesAnoStr}: ${formatarMoedaMeta(acumulado.valor, true)} (${acumulado.quantidade}/${acumulado.totalPropostas} pagas)`);
        
        return acumulado;
        
    } catch (error) {
        console.error('[ACUMULADO] Erro ao atualizar interface:', error);
        
        // Fallback: mostrar zero
        const elementoAcumulado = document.getElementById('valor-acumulado-mes');
        if (elementoAcumulado) {
            elementoAcumulado.textContent = 'R$ 0,00';
        }
        
        return null;
    }
}

// VOLTAR a função atualizarInformacoesMetas para ser SÍNCRONA (como era antes)
function atualizarInformacoesMetas() {
    console.log('📊 Atualizando informações de metas...');
    
    const metaInfo = obterInformacoesMeta();
    const valorAtual = APP_STATE.somaValoresAprovados;
    
    // Atualizar labels primeiro
    atualizarLabelsMetas();
    
    // Atualizar label dos borderôs com porcentagem
    const porcentagem = atualizarLabelBorderos();
    
    // Atualizar meta mensal (formato compacto com 2 casas decimais)
    const elementoMetaMensal = document.getElementById('meta-mensal');
    if (elementoMetaMensal) {
        elementoMetaMensal.textContent = formatarMoedaMeta(metaInfo.metaMensal, true);
    }
    
    // Atualizar meta diária (formato compacto)
    const elementoMetaDiaria = document.getElementById('meta-diaria');
    if (elementoMetaDiaria) {
        elementoMetaDiaria.textContent = formatarMoedaMeta(metaInfo.metaDiaria, true);
    }
    // NOVO: Atualizar valor acumulado do mês (de forma assíncrona, sem bloquear)
    if (typeof atualizarValorAcumuladoInterface === 'function') {
        // Executar de forma assíncrona para não bloquear o resto
        atualizarValorAcumuladoInterface().catch(error => {
            console.error('[ACUMULADO] Erro ao atualizar valor acumulado:', error);
        });
    }
    
    // Log para debug (sem aguardar o acumulado)
    console.log(`Meta mensal (${metaInfo.mesAtual}): ${formatarMoedaMeta(metaInfo.metaMensal, true)}`);
    console.log(`Meta diária: ${formatarMoedaMeta(metaInfo.metaDiaria, true)} (${metaInfo.diasUteis} dias úteis)`);
    console.log(`Valor atual (filtrado): ${formatarMoedaMeta(valorAtual, false)} (${porcentagem.toFixed(1)}% da meta diária)`);
}

// Tornar as funções globais
window.buscarDadosMesAtualCompleto = buscarDadosMesAtualCompleto;
window.calcularValorAcumuladoMesAtual = calcularValorAcumuladoMesAtual;
window.atualizarValorAcumuladoInterface = atualizarValorAcumuladoInterface;

// Função para aplicar desconto de almoço em períodos específicos (APENAS UMA VEZ)
function aplicarDescontoAlmocoNosTempos(proposta) {
    // Condição geral: entrou antes das 13h e foi paga depois das 13h
    if (!proposta.horaEntrada || !proposta.horaPagamento) return proposta;
    
    const horaEntrada = new Date(proposta.horaEntrada).getHours();
    const horaPagamento = new Date(proposta.horaPagamento).getHours();
    
    if (horaEntrada >= 13 || horaPagamento <= 13) {
        return proposta; // Não aplica desconto
    }
    
    console.log(`Analisando desconto de almoço para proposta ${proposta.numero}`);
    
    // Buscar qual período passou pelo horário de almoço (12h-14h) e durou mais de 1h
    const periodos = [
        {
            nome: 'tempoAteAnalise',
            inicio: proposta.horaEntrada,
            fim: proposta.horaAnalise,
            tempo: proposta.tempoAteAnalise
        },
        {
            nome: 'tempoAnaliseAtePendencia', 
            inicio: proposta.horaAnalise,
            fim: proposta.horaPendencia,
            tempo: proposta.tempoAnaliseAtePendencia
        },
        {
            nome: 'tempoEtapaAnteriorAteCertifica',
            inicio: proposta.horaPendencia || proposta.horaAnalise || proposta.horaEntrada,
            fim: proposta.horaCertifica,
            tempo: proposta.tempoEtapaAnteriorAteCertifica
        },
        {
            nome: 'tempoCertificaAtePagamento',
            inicio: proposta.horaCertifica,
            fim: proposta.horaPagamento,
            tempo: proposta.tempoCertificaAtePagamento
        }
    ];
    
    // Verificar cada período e aplicar desconto APENAS NO PRIMEIRO que atender aos critérios
    let descontoJaAplicado = false;
    
    for (const periodo of periodos) {
        if (descontoJaAplicado) break; // Sai do loop se já aplicou desconto
        
        if (periodo.inicio && periodo.fim && periodo.tempo && periodo.tempo >= 60) {
            const inicioData = new Date(periodo.inicio);
            const fimData = new Date(periodo.fim);
            
            const inicioHora = inicioData.getHours();
            const inicioMinuto = inicioData.getMinutes();
            const fimHora = fimData.getHours();
            const fimMinuto = fimData.getMinutes();
            
            // Converter para minutos para comparação mais precisa
            const inicioTotalMinutos = inicioHora * 60 + inicioMinuto;
            const fimTotalMinutos = fimHora * 60 + fimMinuto;
            const inicio12h = 12 * 60; // 12:00 = 720 minutos
            const fim14h = 14 * 60;    // 14:00 = 840 minutos
            
            // Verificar se a mudança de status aconteceu ENTRE 12h e 14h
            if (inicioTotalMinutos < fim14h && fimTotalMinutos > inicio12h) {
                // Salvar o tempo original se ainda não foi salvo
                if (!proposta[`${periodo.nome}Original`]) {
                    proposta[`${periodo.nome}Original`] = periodo.tempo;
                }
                
                // Aplicar desconto de 1 hora neste período específico
                proposta[periodo.nome] = periodo.tempo - 60;
                descontoJaAplicado = true; // Marcar que já aplicou desconto
                
                console.log(`Desconto aplicado APENAS no período ${periodo.nome}: ${periodo.tempo}min → ${periodo.tempo - 60}min (proposta ${proposta.numero})`);
                console.log(`Período: ${formatarHora(periodo.inicio)} → ${formatarHora(periodo.fim)}`);
            }
        }
    }
    
    if (!descontoJaAplicado) {
        console.log(`Nenhum período elegível para desconto encontrado na proposta ${proposta.numero}`);
    }
    
    return proposta;
}