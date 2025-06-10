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

// Modificar a função formatarTempo para indicar tempo em tempo real
function formatarTempo(minutos, destacar = false, tempoReal = false) {
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
    
    // Aplicar classes se houver alguma
    if (classes.length > 0) {
        return `<span class="${classes.join(' ')}">${resultado}</span>`;
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

// Função para formatar hora e tempo juntos - com depuração adicional
function formatarHoraTempo(hora, tempo) {
    if (!hora) return '<span class="empty-cell">--</span>';
    
    const horaFormatada = formatarHora(hora);
    const tempoFormatado = tempo ? ` (${formatarTempo(tempo)})` : '';
    
    return `${horaFormatada}${tempoFormatado}`;
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

// Função para calcular tempo entre duas datas em minutos - com depuração adicional
function calcularTempoEmMinutos(dataHoraInicio, dataHoraFim) {
    if (!dataHoraInicio || !dataHoraFim) {
        console.log("calcularTempoEmMinutos: Uma das datas é nula ou indefinida", { inicio: dataHoraInicio, fim: dataHoraFim });
        return null;
    }
    
    try {
        const inicio = new Date(dataHoraInicio);
        const fim = new Date(dataHoraFim);
        
        // Verificar se as datas são válidas
        if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
            console.error("Data inválida:", { inicio: dataHoraInicio, fim: dataHoraFim });
            return null;
        }
        
        // Calcular a diferença em milissegundos
        const diferencaMs = fim - inicio;
        
        // Verificar se a diferença é negativa (data de fim anterior à de início)
        if (diferencaMs < 0) {
            console.error("Diferença de tempo negativa:", { 
                inicio: dataHoraInicio, 
                fim: dataHoraFim,
                inicioFormatado: inicio.toLocaleString(),
                fimFormatado: fim.toLocaleString()
            });
            return 0;
        }
        
        // Converter para minutos e arredondar
        const minutos = Math.round(diferencaMs / (1000 * 60));
        
        // Log para depuração
        console.log(`Tempo entre ${inicio.toLocaleTimeString()} e ${fim.toLocaleTimeString()}: ${minutos} minutos`);
        
        return minutos;
    } catch (e) {
        console.error("Erro ao calcular tempo:", e, { inicio: dataHoraInicio, fim: dataHoraFim });
        return null;
    }
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