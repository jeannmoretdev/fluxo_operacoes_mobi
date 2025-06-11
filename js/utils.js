// Atualizar a função simplificarStatus para reconhecer variações do comitê
function simplificarStatus(status) {
    // Verificar se é o status de pendência (várias variações)
    const statusUpper = status.toUpperCase();
    if (statusUpper.includes('PENDENCIA') || statusUpper.includes('PENDÊNCIA')) {
        return "PENDÊNCIA";
    }
    
    // Lógica existente para outros status
    if (/^\d+\s*-\s*/.test(status)) {
        return status.replace(/^\d+\s*-\s*/, '');
    }
    return status;
}

// Atualizar a função getPesoStatus para incluir o novo status
function getPesoStatus(status) {
    const pesos = {
        "DIGITANDO": 1,
        "AGUARD. ANÁLISE": 2,
        "OPER. ANALISANDO": 3,
        "PENDÊNCIA": 4,           // era COMITÊ
        "Q CERT. ASSINAT.": 5,
        "PAGO": 6,
        "CHECAGEM": 7,
        "POSTERGADO": 8,
        "CEDENTE DESISTIU": 9,
        "RECUSADO": 10,
        // "PENDÊNCIA": 11 - remover esta linha
    };
    
    return pesos[status] || 999;
}

// Modificar a função formatarTempo para NÃO adicionar asterisco automaticamente
function formatarTempo(minutos, destacar = false, tempoReal = false, tempoOriginal = null) {
    if (!minutos) return '--';
    
    minutos = parseInt(minutos);
    let resultado;
    
    if (minutos < 60) {
        resultado = `${minutos} min`;
    } else {
        const horas = Math.floor(minutos / 60);
        const min = minutos % 60;
        resultado = `${horas}h ${min}min`;
    }
    
    // Classes a serem aplicadas
    let classes = [];
    
    // Se o tempo exceder 2:30 horas (150 minutos) e destacar for true
    if (destacar && minutos > 150) {
        classes.push('tempo-excedido');
    }
    
    // Se o tempo está sendo calculado em tempo real
    if (tempoReal) {
        classes.push('tempo-em-tempo-real');
    }
    
    // REMOVER: Não adicionar asterisco aqui, será adicionado em formatarHoraTempo se necessário
    
    // Aplicar classes se houver alguma
    if (classes.length > 0) {
        return `<span class="${classes.join(' ')}" data-tempo-original="${tempoOriginal || minutos}" data-tempo-ajustado="${minutos}">${resultado}</span>`;
    }
    
    return resultado;
}

// Função para formatar data
function formatarData(dataString) {
    if (!dataString) return '--';
    
    try {
        const partes = dataString.split('-');
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    } catch (e) {
        console.error("Erro ao formatar data:", e);
        return dataString;
    }
}

// Função para formatar hora
function formatarHora(dataHoraString) {
    if (!dataHoraString) return '--';
    
    try {
        const data = new Date(dataHoraString);
        const hora = data.getHours().toString().padStart(2, '0');
        const minuto = data.getMinutes().toString().padStart(2, '0');
        return `${hora}:${minuto}`;
    } catch (e) {
        console.error("Erro ao formatar hora:", e);
        return dataHoraString;
    }
}

// Corrigir a função formatarHoraTempo para mostrar asterisco apenas quando houver desconto real
function formatarHoraTempo(hora, tempo, tempoOriginal = null) {
    if (!hora) return '--';
    
    const horaFormatada = formatarHora(hora);
    
    if (!tempo) {
        return horaFormatada;
    }
    
    // Verificar se houve desconto REAL (tempo original maior que tempo final)
    const houveDesconto = tempoOriginal && tempoOriginal > tempo;
    
    let tempoFormatado;
    if (houveDesconto) {
        // Criar span clicável com asterisco
        tempoFormatado = `<span class="tempo-com-desconto" data-tempo-original="${tempoOriginal}" data-tempo-ajustado="${tempo}" title="Clique para ver detalhes do tempo ajustado">${formatarTempo(tempo)}*</span>`;
    } else {
        tempoFormatado = formatarTempo(tempo);
    }
    
    // Retornar no formato: hora (tempo) - tudo na mesma linha
    return `${horaFormatada} (${tempoFormatado})`;
}

// Adicionar uma nova função específica para certificação:
function formatarHoraTempoEtapaAnterior(hora, tempoEtapaAnterior, tempoTotal) {
    if (!hora) return '<span class="empty-cell">--</span>';
    
    const horaFormatada = formatarHora(hora);
    
    // Usar tempo da etapa anterior se disponível, senão usar tempo total
    const tempo = tempoEtapaAnterior !== null ? tempoEtapaAnterior : tempoTotal;
    const tempoFormatado = tempo ? ` (${formatarTempo(tempo)})` : '';
    
    return `${horaFormatada}${tempoFormatado}`;
}

// Tornar a função global
window.formatarHoraTempoEtapaAnterior = formatarHoraTempoEtapaAnterior;

// Atualizar a função calcularTempoEmMinutos para usar a função correta
function calcularTempoEmMinutos(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) {
        return null;
    }
    
    // Verificar se a função de desconto existe, senão usar cálculo simples
    if (typeof calcularTempoComDescontoAlmoco === 'function') {
        return calcularTempoComDescontoAlmoco(dataInicio, dataFim);
    } else {
        // Fallback: cálculo simples sem desconto
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        return Math.round((fim - inicio) / (1000 * 60));
    }
}

// Manter a função original para compatibilidade
function calcularTempoComDescontoAlmoco(dataInicio, dataFim) {
    const resultado = calcularTempoComDescontoAlmocoDetalhado(dataInicio, dataFim);
    return resultado.tempoFinal;
}

// Função detalhada original (manter)
function calcularTempoComDescontoAlmocoDetalhado(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) {
        return { tempoFinal: null, tempoOriginal: null, houveDesconto: false };
    }
    
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    // Calcular tempo total em minutos
    let tempoTotalMinutos = Math.round((fim - inicio) / (1000 * 60));
    
    // Verificar se o período passou pelo horário de almoço (12:00 às 13:30)
    const horaInicio = inicio.getHours();
    const minutoInicio = inicio.getMinutes();
    const horaFim = fim.getHours();
    const minutoFim = fim.getMinutes();
    
    // Converter para minutos desde meia-noite para facilitar comparação
    const minutosInicioTotal = horaInicio * 60 + minutoInicio;
    const minutosFimTotal = horaFim * 60 + minutoFim;
    const inicioAlmoco = 12 * 60;      // 12:00 = 720 minutos
    const fimAlmoco = 13 * 60 + 30;    // 13:30 = 810 minutos
    
    // Verificar se o período passou pelo horário de almoço
    let descontoAlmoco = 0;
    
    // Caso 1: Iniciou antes das 12:00 e terminou depois das 13:30
    if (minutosInicioTotal < inicioAlmoco && minutosFimTotal > fimAlmoco) {
        descontoAlmoco = 60; // Desconta 1 hora (mesmo que o almoço seja 1h30)
    }
    // Caso 2: Iniciou antes das 12:00 e terminou entre 12:00 e 13:30
    else if (minutosInicioTotal < inicioAlmoco && minutosFimTotal >= inicioAlmoco && minutosFimTotal <= fimAlmoco) {
        const tempoNoAlmoco = minutosFimTotal - inicioAlmoco;
        descontoAlmoco = Math.min(60, tempoNoAlmoco);
    }
    // Caso 3: Iniciou entre 12:00 e 13:30 e terminou depois das 13:30
    else if (minutosInicioTotal >= inicioAlmoco && minutosInicioTotal < fimAlmoco && minutosFimTotal > fimAlmoco) {
        const tempoNoAlmoco = fimAlmoco - minutosInicioTotal;
        descontoAlmoco = Math.min(60, tempoNoAlmoco);
    }
    // Caso 4: Iniciou e terminou durante o horário de almoço (12:00 às 13:30)
    else if (minutosInicioTotal >= inicioAlmoco && minutosFimTotal <= fimAlmoco) {
        descontoAlmoco = Math.min(60, tempoTotalMinutos);
    }
    
    // Aplicar o desconto
    const tempoFinal = Math.max(0, tempoTotalMinutos - descontoAlmoco);
    
    return {
        tempoFinal: tempoFinal,
        tempoOriginal: tempoTotalMinutos,
        houveDesconto: descontoAlmoco > 0,
        descontoAplicado: descontoAlmoco
    };
}

// NOVA função com controle de desconto total
function calcularTempoComDescontoAlmocoControlado(dataInicio, dataFim, descontoJaAplicado = 0) {
    if (!dataInicio || !dataFim) {
        return { tempoFinal: null, tempoOriginal: null, houveDesconto: false, descontoAplicado: 0 };
    }
    
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    // Calcular tempo total em minutos
    let tempoTotalMinutos = Math.round((fim - inicio) / (1000 * 60));
    
    // Verificar quanto desconto ainda está disponível
    const descontoDisponivel = Math.max(0, 60 - descontoJaAplicado);
    
    if (descontoDisponivel <= 0) {
        // Se não há mais desconto disponível, retornar sem desconto
        return {
            tempoFinal: tempoTotalMinutos,
            tempoOriginal: tempoTotalMinutos,
            houveDesconto: false,
            descontoAplicado: 0
        };
    }
    
    // Verificar se o período passou pelo horário de almoço (12:00 às 13:30)
    const horaInicio = inicio.getHours();
    const minutoInicio = inicio.getMinutes();
    const horaFim = fim.getHours();
    const minutoFim = fim.getMinutes();
    
    // Converter para minutos desde meia-noite
    const minutosInicioTotal = horaInicio * 60 + minutoInicio;
    const minutosFimTotal = horaFim * 60 + minutoFim;
    const inicioAlmoco = 12 * 60;      // 12:00 = 720 minutos
    const fimAlmoco = 13 * 60 + 30;    // 13:30 = 810 minutos
    
    // Calcular quanto tempo foi passado durante o horário de almoço
    let tempoNoAlmoco = 0;
    
    // Caso 1: Iniciou antes das 12:00 e terminou depois das 13:30
    if (minutosInicioTotal < inicioAlmoco && minutosFimTotal > fimAlmoco) {
        tempoNoAlmoco = fimAlmoco - inicioAlmoco; // 90 minutos (1h30)
    }
    // Caso 2: Iniciou antes das 12:00 e terminou entre 12:00 e 13:30
    else if (minutosInicioTotal < inicioAlmoco && minutosFimTotal >= inicioAlmoco && minutosFimTotal <= fimAlmoco) {
        tempoNoAlmoco = minutosFimTotal - inicioAlmoco;
    }
    // Caso 3: Iniciou entre 12:00 e 13:30 e terminou depois das 13:30
    else if (minutosInicioTotal >= inicioAlmoco && minutosInicioTotal < fimAlmoco && minutosFimTotal > fimAlmoco) {
        tempoNoAlmoco = fimAlmoco - minutosInicioTotal;
    }
    // Caso 4: Iniciou e terminou durante o horário de almoço
    else if (minutosInicioTotal >= inicioAlmoco && minutosFimTotal <= fimAlmoco) {
        tempoNoAlmoco = minutosFimTotal - minutosInicioTotal;
    }
    
    // Calcular o desconto a ser aplicado
    let descontoCalculado = 0;
    if (tempoNoAlmoco > 0) {
        // Descontar no máximo 60 minutos, mesmo que o almoço seja 90 minutos
        descontoCalculado = Math.min(60, tempoNoAlmoco);
        
        // Limitar pelo desconto ainda disponível
        descontoCalculado = Math.min(descontoCalculado, descontoDisponivel);
    }
    
    // Aplicar o desconto
    const tempoFinal = Math.max(0, tempoTotalMinutos - descontoCalculado);
    
    return {
        tempoFinal: tempoFinal,
        tempoOriginal: tempoTotalMinutos,
        houveDesconto: descontoCalculado > 0,
        descontoAplicado: descontoCalculado
    };
}

// Função para processar todos os tempos de uma proposta com controle de desconto total
function processarTemposComDescontoControlado(proposta) {
    let descontoTotalAplicado = 0;
    const resultados = {};
    
    console.log(`\n=== PROCESSANDO PROPOSTA ${proposta.numero} ===`);
    
    // Lista de períodos em ordem CRONOLÓGICA (não de prioridade)
    const periodos = [
        { nome: 'tempoAteAnalise', inicio: proposta.horaEntrada, fim: proposta.horaAnalise, descricao: 'Entrada → Análise' },
        { nome: 'tempoAnaliseAtePendencia', inicio: proposta.horaAnalise, fim: proposta.horaPendencia, descricao: 'Análise → Pendência' },
        { nome: 'tempoAteChecagem', inicio: proposta.horaEntrada, fim: proposta.horaChecagem, descricao: 'Entrada → Checagem' },
        { nome: 'tempoEtapaAnteriorAteCertifica', inicio: proposta.horaPendencia || proposta.horaAnalise || proposta.horaEntrada, fim: proposta.horaCertifica, descricao: 'Etapa Anterior → Certificação' },
        { nome: 'tempoCertificaAtePagamento', inicio: proposta.horaCertifica, fim: proposta.horaPagamento, descricao: 'Certificação → Pagamento' }
    ];
    
    // Processar cada período
    periodos.forEach(periodo => {
        if (periodo.inicio && periodo.fim) {
            const resultado = calcularTempoComDescontoAlmocoControlado(
                periodo.inicio, 
                periodo.fim, 
                descontoTotalAplicado
            );
            
            resultados[periodo.nome] = resultado;
            
            // Log detalhado
            if (resultado.houveDesconto) {
                console.log(`${periodo.descricao}: ${formatarHora(periodo.inicio)} → ${formatarHora(periodo.fim)}`);
                console.log(`  Tempo original: ${resultado.tempoOriginal}min`);
                console.log(`  Desconto aplicado: ${resultado.descontoAplicado}min`);
                console.log(`  Tempo final: ${resultado.tempoFinal}min`);
                console.log(`  Desconto total acumulado: ${descontoTotalAplicado + resultado.descontoAplicado}min`);
                
                descontoTotalAplicado += resultado.descontoAplicado;
            } else {
                console.log(`${periodo.descricao}: ${formatarHora(periodo.inicio)} → ${formatarHora(periodo.fim)} (sem desconto)`);
            }
        } else {
            resultados[periodo.nome] = { 
                tempoFinal: null, 
                tempoOriginal: null, 
                houveDesconto: false, 
                descontoAplicado: 0 
            };
        }
    });
    
    // Calcular os tempos derivados (que não são períodos diretos)
    resultados.tempoAtePendencia = {
        tempoFinal: calcularTempoEmMinutosSimples(proposta.horaEntrada, proposta.horaPendencia),
        tempoOriginal: calcularTempoEmMinutosSimples(proposta.horaEntrada, proposta.horaPendencia),
        houveDesconto: false,
        descontoAplicado: 0
    };
    
    resultados.tempoAteCertifica = {
        tempoFinal: calcularTempoEmMinutosSimples(proposta.horaEntrada, proposta.horaCertifica),
        tempoOriginal: calcularTempoEmMinutosSimples(proposta.horaEntrada, proposta.horaCertifica),
        houveDesconto: false,
        descontoAplicado: 0
    };
    
    console.log(`TOTAL DE DESCONTO APLICADO: ${descontoTotalAplicado}min (máximo: 60min)`);
    console.log(`=== FIM PROCESSAMENTO PROPOSTA ${proposta.numero} ===\n`);
    
    return resultados;
}

// Função auxiliar para cálculo simples sem desconto
function calcularTempoEmMinutosSimples(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) {
        return null;
    }
    
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    return Math.round((fim - inicio) / (1000 * 60));
}

// Função para atualizar a hora da última atualização
function atualizarHoraAtualizacao() {
    const agora = new Date();
    const hora = agora.getHours().toString().padStart(2, '0');
    const minuto = agora.getMinutes().toString().padStart(2, '0');
    const segundo = agora.getSeconds().toString().padStart(2, '0');
    document.getElementById('update-time').textContent = `${hora}:${minuto}:${segundo}`;
}

// Função para gerar um array de datas entre dataInicio e dataFim
function gerarArrayDeDatas(dataInicio, dataFim) {
    const datas = [];
    const dataAtual = new Date(dataInicio);
    const dataFinal = new Date(dataFim);
    
    // Ajustar para início do dia
    dataAtual.setHours(0, 0, 0, 0);
    dataFinal.setHours(0, 0, 0, 0);
    
    while (dataAtual <= dataFinal) {
        datas.push(dataAtual.toISOString().split('T')[0]);
        dataAtual.setDate(dataAtual.getDate() + 1);
    }
    
    return datas;
}

// Função auxiliar para comparar datas, tratando valores nulos ou indefinidos
function compareDates(dateA, dateB) {
    // Se ambas as datas são nulas ou indefinidas, considere-as iguais
    if (!dateA && !dateB) return 0;
    
    // Se apenas dateA é nula ou indefinida, coloque-a no final
    if (!dateA) return 1;
    
    // Se apenas dateB é nula ou indefinida, coloque-a no final
    if (!dateB) return -1;
    
    // Se ambas são válidas, compare-as normalmente
    return new Date(dateA) - new Date(dateB);
}

// Função auxiliar para comparar números, tratando valores nulos ou indefinidos
function compareNumbers(numA, numB) {
    // Se ambos os números são nulos ou indefinidos, considere-os iguais
    if ((numA === null || numA === undefined) && (numB === null || numB === undefined)) return 0;
    
    // Se apenas numA é nulo ou indefinido, coloque-o no final
    if (numA === null || numA === undefined) return 1;
    
    // Se apenas numB é nulo ou indefinido, coloque-o no final
    if (numB === null || numB === undefined) return -1;
    
    // Se ambos são válidos, compare-os normalmente
    return numA - numB;
}

// Adicionar função para debug do cálculo de tempo até certificação
function debugTempoAteCertificacao(proposta) {
    if (!proposta.horaCertifica) {
        console.log(`Proposta ${proposta.numero}: Não tem certificação`);
        return;
    }
    
    console.log(`=== DEBUG Proposta ${proposta.numero} ===`);
    console.log(`Entrada: ${formatarHora(proposta.horaEntrada)}`);
    console.log(`Análise: ${proposta.horaAnalise ? formatarHora(proposta.horaAnalise) : 'Não passou'}`);
    console.log(`Comitê: ${proposta.horaComite ? formatarHora(proposta.horaComite) : 'Não passou'}`);
    console.log(`Certificação: ${formatarHora(proposta.horaCertifica)}`);
    
    if (proposta.horaComite) {
        const tempoComiteAteCert = calcularTempoEmMinutos(proposta.horaComite, proposta.horaCertifica);
        console.log(`Tempo COMITÊ → CERTIFICAÇÃO: ${formatarTempo(tempoComiteAteCert)}`);
    } else if (proposta.horaAnalise) {
        const tempoAnaliseAteCert = calcularTempoEmMinutos(proposta.horaAnalise, proposta.horaCertifica);
        console.log(`Tempo ANÁLISE → CERTIFICAÇÃO: ${formatarTempo(tempoAnaliseAteCert)}`);
    } else {
        const tempoEntradaAteCert = calcularTempoEmMinutos(proposta.horaEntrada, proposta.horaCertifica);
        console.log(`Tempo ENTRADA → CERTIFICAÇÃO: ${formatarTempo(tempoEntradaAteCert)}`);
    }
    
    console.log(`Valor usado na tabela: ${formatarTempo(proposta.tempoComiteAteCertifica)}`);
    console.log(`=== FIM DEBUG ===`);
}

// Tornar a função global para uso no console
window.debugTempoAteCertificacao = debugTempoAteCertificacao;

// Função auxiliar para verificar se um status é de comitê
function isStatusComite(status) {
    if (!status) return false;
    
    const statusUpper = status.toUpperCase();
    return statusUpper.includes('COMITE') || 
           statusUpper.includes('COMITÊ') || 
           statusUpper.match(/^\d+\s*-\s*COMIT[EÊ]$/);
}

// Função auxiliar para encontrar entrada de comitê no fluxo
function encontrarEntradaComite(fluxoCompleto) {
    if (!fluxoCompleto || !Array.isArray(fluxoCompleto)) return null;
    
    return fluxoCompleto.find(f => isStatusComite(f.STATUS_FLUXO));
}

// Função para formatar valores monetários com opção de formato compacto
function formatarMoedaPersonalizada(valor, compacto = false) {
    if (!valor || valor === 0) return 'R$ 0,00';
    
    // Se compacto = true, usar formato milhões para valores grandes
    if (compacto && Math.abs(valor) >= 1000000) {
        const milhoes = valor / 1000000;
        return `R$ ${milhoes.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}M`;
    }
    
    // Formato completo normal - sempre com 2 casas decimais
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
}

// Manter a função original para compatibilidade
function formatarMoeda(valor) {
    return formatarMoedaPersonalizada(valor, false);
}

// NOVA FUNÇÃO: Especificamente para formatação de metas (sempre 2 casas decimais)
function formatarMoedaMeta(valor, compacto = false) {
    if (!valor || valor === 0) return 'R$ 0,00';
    
    // Se compacto = true, usar formato milhões para valores grandes
    if (compacto && Math.abs(valor) >= 1000000) {
        const milhoes = valor / 1000000;
        return `R$ ${milhoes.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}M`;
    }
    
    // Formato completo normal - sempre com 2 casas decimais
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
}

// Tornar a nova função global
window.formatarMoedaMeta = formatarMoedaMeta;

// Função para obter informações do mês atual
function obterInformacoesMesAtual() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = agora.getMonth(); // 0-11
    
    // Primeiro e último dia do mês atual
    const primeiroDiaMes = new Date(ano, mes, 1);
    const ultimoDiaMes = new Date(ano, mes + 1, 0);
    
    // Formatação para strings
    const primeiroDiaMesStr = primeiroDiaMes.toISOString().split('T')[0]; // YYYY-MM-DD
    const ultimoDiaMesStr = ultimoDiaMes.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Nome do mês
    const nomesMeses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const nomeMes = nomesMeses[mes];
    
    return {
        ano: ano,
        mes: mes + 1, // 1-12 para facilitar comparações
        nomeMes: nomeMes,
        primeiroDia: primeiroDiaMes,
        ultimoDia: ultimoDiaMes,
        primeiroDiaStr: primeiroDiaMesStr,
        ultimoDiaStr: ultimoDiaMesStr,
        mesAnoStr: `${nomeMes}/${ano}`
    };
}

// Tornar a função global
window.obterInformacoesMesAtual = obterInformacoesMesAtual;

// Adicionar esta função no final do arquivo js/utils.js
function formatarDataHora(dataHoraString) {
    if (!dataHoraString) return '--:--';
    
    try {
        const data = new Date(dataHoraString);
        if (isNaN(data.getTime())) return '--:--';
        
        // Formatar data: DD/MM/YYYY
        const dia = data.getDate().toString().padStart(2, '0');
        const mes = (data.getMonth() + 1).toString().padStart(2, '0');
        const ano = data.getFullYear();
        
        // Formatar hora: HH:MM
        const horas = data.getHours().toString().padStart(2, '0');
        const minutos = data.getMinutes().toString().padStart(2, '0');
        
        return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
    } catch (error) {
        console.error("Erro ao formatar data e hora:", error);
        return '--:--';
    }
}

// Tornar a função global
window.formatarDataHora = formatarDataHora;

// Nova função para encontrar o maior período contínuo que passa pelo almoço
function encontrarMaiorPeriodoParaDesconto(proposta) {
    // Criar lista de todos os eventos em ordem cronológica
    const eventos = [];
    
    if (proposta.horaEntrada) eventos.push({ hora: proposta.horaEntrada, tipo: 'ENTRADA' });
    if (proposta.horaAnalise) eventos.push({ hora: proposta.horaAnalise, tipo: 'ANALISE' });
    if (proposta.horaPendencia) eventos.push({ hora: proposta.horaPendencia, tipo: 'PENDENCIA' });
    if (proposta.horaChecagem) eventos.push({ hora: proposta.horaChecagem, tipo: 'CHECAGEM' });
    if (proposta.horaCertifica) eventos.push({ hora: proposta.horaCertifica, tipo: 'CERTIFICACAO' });
    if (proposta.horaPagamento) eventos.push({ hora: proposta.horaPagamento, tipo: 'PAGAMENTO' });
    
    // Ordenar eventos por hora
    eventos.sort((a, b) => new Date(a.hora) - new Date(b.hora));
    
    console.log(`\n=== ANALISANDO PERÍODOS PARA DESCONTO - PROPOSTA ${proposta.numero} ===`);
    eventos.forEach((evento, index) => {
        console.log(`${index + 1}. ${evento.tipo}: ${formatarHora(evento.hora)}`);
    });
    
    let maiorPeriodo = null;
    let maiorTempo = 0;
    
    // Analisar cada período entre eventos consecutivos
    for (let i = 0; i < eventos.length - 1; i++) {
        const inicio = eventos[i].hora;
        const fim = eventos[i + 1].hora;
        const tempoMinutos = calcularTempoEmMinutosSimples(inicio, fim);
        
        // Verificar se este período passa pelo horário de almoço
        const passaPeloAlmoco = verificarSePassaPeloAlmoco(inicio, fim);
        
        console.log(`Período ${eventos[i].tipo} → ${eventos[i + 1].tipo}: ${formatarHora(inicio)} → ${formatarHora(fim)} (${tempoMinutos}min) - Passa pelo almoço: ${passaPeloAlmoco ? 'SIM' : 'NÃO'}`);
        
        if (passaPeloAlmoco && tempoMinutos > maiorTempo) {
            maiorTempo = tempoMinutos;
            maiorPeriodo = {
                inicio: inicio,
                fim: fim,
                tempoMinutos: tempoMinutos,
                descricao: `${eventos[i].tipo} → ${eventos[i + 1].tipo}`,
                tipoInicio: eventos[i].tipo,
                tipoFim: eventos[i + 1].tipo
            };
        }
    }
    
    if (maiorPeriodo) {
        console.log(`MAIOR PERÍODO PARA DESCONTO: ${maiorPeriodo.descricao} (${maiorPeriodo.tempoMinutos}min)`);
        console.log(`Horário: ${formatarHora(maiorPeriodo.inicio)} → ${formatarHora(maiorPeriodo.fim)}`);
    } else {
        console.log(`NENHUM PERÍODO PASSA PELO HORÁRIO DE ALMOÇO`);
    }
    
    console.log(`=== FIM ANÁLISE PERÍODOS ===\n`);
    
    return maiorPeriodo;
}

// Função para verificar se um período passa pelo horário de almoço
function verificarSePassaPeloAlmoco(dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    const horaInicio = inicio.getHours();
    const minutoInicio = inicio.getMinutes();
    const horaFim = fim.getHours();
    const minutoFim = fim.getMinutes();
    
    const minutosInicioTotal = horaInicio * 60 + minutoInicio;
    const minutosFimTotal = horaFim * 60 + minutoFim;
    const inicioAlmoco = 12 * 60;      // 12:00
    const fimAlmoco = 13 * 60 + 30;    // 13:30
    
    // Verifica se o período sobrepõe com o horário de almoço
    return (minutosInicioTotal < fimAlmoco && minutosFimTotal > inicioAlmoco);
}

// Nova função para processar tempos com desconto apenas no maior período
function processarTemposComDescontoUnicoPeriodo(proposta) {
    const resultados = {};
    
    // Encontrar o maior período que passa pelo almoço
    const periodoComDesconto = encontrarMaiorPeriodoParaDesconto(proposta);
    
    // Lista de todos os períodos para calcular
    const periodos = [
        { nome: 'tempoAteAnalise', inicio: proposta.horaEntrada, fim: proposta.horaAnalise, descricao: 'ENTRADA → ANALISE' },
        { nome: 'tempoAnaliseAtePendencia', inicio: proposta.horaAnalise, fim: proposta.horaPendencia, descricao: 'ANALISE → PENDENCIA' },
        { nome: 'tempoAtePendencia', inicio: proposta.horaEntrada, fim: proposta.horaPendencia, descricao: 'ENTRADA → PENDENCIA' },
        { nome: 'tempoAteChecagem', inicio: proposta.horaEntrada, fim: proposta.horaChecagem, descricao: 'ENTRADA → CHECAGEM' },
        { nome: 'tempoAteCertifica', inicio: proposta.horaEntrada, fim: proposta.horaCertifica, descricao: 'ENTRADA → CERTIFICACAO' },
        { nome: 'tempoEtapaAnteriorAteCertifica', inicio: proposta.horaPendencia || proposta.horaAnalise || proposta.horaEntrada, fim: proposta.horaCertifica, descricao: 'ETAPA_ANTERIOR → CERTIFICACAO' },
        { nome: 'tempoCertificaAtePagamento', inicio: proposta.horaCertifica, fim: proposta.horaPagamento, descricao: 'CERTIFICACAO → PAGAMENTO' }
    ];
    
    // Processar cada período
    periodos.forEach(periodo => {
        if (periodo.inicio && periodo.fim) {
            const tempoOriginal = calcularTempoEmMinutosSimples(periodo.inicio, periodo.fim);
            let tempoFinal = tempoOriginal;
            let houveDesconto = false;
            let descontoAplicado = 0;
            
            // Verificar se este período corresponde ao período que deve receber desconto
            let deveReceberDesconto = false;
            
            if (periodoComDesconto) {
                // Comparar horários exatos para identificar o período correto
                const inicioIgual = new Date(periodo.inicio).getTime() === new Date(periodoComDesconto.inicio).getTime();
                const fimIgual = new Date(periodo.fim).getTime() === new Date(periodoComDesconto.fim).getTime();
                
                deveReceberDesconto = inicioIgual && fimIgual;
                
                console.log(`Verificando período ${periodo.nome}:`);
                console.log(`  Período: ${formatarHora(periodo.inicio)} → ${formatarHora(periodo.fim)}`);
                console.log(`  Maior período: ${formatarHora(periodoComDesconto.inicio)} → ${formatarHora(periodoComDesconto.fim)}`);
                console.log(`  Deve receber desconto: ${deveReceberDesconto}`);
            }
            
            if (deveReceberDesconto) {
                // Calcular o desconto para este período
                const resultadoDesconto = calcularDescontoAlmoco(periodo.inicio, periodo.fim);
                tempoFinal = resultadoDesconto.tempoFinal;
                houveDesconto = resultadoDesconto.houveDesconto;
                descontoAplicado = resultadoDesconto.descontoAplicado;
                
                console.log(`✅ APLICANDO DESCONTO NO PERÍODO: ${periodo.nome}`);
                console.log(`  Tempo original: ${tempoOriginal}min`);
                console.log(`  Desconto aplicado: ${descontoAplicado}min`);
                console.log(`  Tempo final: ${tempoFinal}min`);
            } else {
                console.log(`⏸️ SEM DESCONTO: ${periodo.nome} (${tempoOriginal}min)`);
            }
            
            resultados[periodo.nome] = {
                tempoFinal: tempoFinal,
                tempoOriginal: tempoOriginal,
                houveDesconto: houveDesconto,
                descontoAplicado: descontoAplicado
            };
        } else {
            resultados[periodo.nome] = {
                tempoFinal: null,
                tempoOriginal: null,
                houveDesconto: false,
                descontoAplicado: 0
            };
        }
    });
    
    return resultados;
}

// Função para calcular desconto de almoço (máximo 1 hora)
function calcularDescontoAlmoco(dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    const tempoTotalMinutos = Math.round((fim - inicio) / (1000 * 60));
    
    const horaInicio = inicio.getHours();
    const minutoInicio = inicio.getMinutes();
    const horaFim = fim.getHours();
    const minutoFim = fim.getMinutes();
    
    const minutosInicioTotal = horaInicio * 60 + minutoInicio;
    const minutosFimTotal = horaFim * 60 + minutoFim;
    const inicioAlmoco = 12 * 60;      // 12:00
    const fimAlmoco = 13 * 60 + 30;    // 13:30
    
    let tempoNoAlmoco = 0;
    
    // Calcular quanto tempo foi passado durante o horário de almoço
    if (minutosInicioTotal < inicioAlmoco && minutosFimTotal > fimAlmoco) {
        // Período completo do almoço
        tempoNoAlmoco = fimAlmoco - inicioAlmoco; // 90 minutos
    } else if (minutosInicioTotal < inicioAlmoco && minutosFimTotal >= inicioAlmoco && minutosFimTotal <= fimAlmoco) {
        // Iniciou antes e terminou durante o almoço
        tempoNoAlmoco = minutosFimTotal - inicioAlmoco;
    } else if (minutosInicioTotal >= inicioAlmoco && minutosInicioTotal < fimAlmoco && minutosFimTotal > fimAlmoco) {
        // Iniciou durante e terminou depois do almoço
        tempoNoAlmoco = fimAlmoco - minutosInicioTotal;
    } else if (minutosInicioTotal >= inicioAlmoco && minutosFimTotal <= fimAlmoco) {
        // Todo o período foi durante o almoço
        tempoNoAlmoco = minutosFimTotal - minutosInicioTotal;
    }
    
    // Desconto máximo de 60 minutos (1 hora)
    const descontoAplicado = Math.min(60, tempoNoAlmoco);
    const tempoFinal = Math.max(0, tempoTotalMinutos - descontoAplicado);
    
    return {
        tempoFinal: tempoFinal,
        tempoOriginal: tempoTotalMinutos,
        houveDesconto: descontoAplicado > 0,
        descontoAplicado: descontoAplicado
    };
}