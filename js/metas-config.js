// Configuração simples de metas
const META_MENSAL = 30000000; // 27 milhões - sempre fixo

// ===== AJUSTES MANUAIS DE DIAS ÚTEIS =====
// Para ajustar dias úteis específicos por mês/ano (feriados regionais, folgas, etc.)
// Formato: 'YYYY-MM': ajuste (positivo para adicionar, negativo para remover)
const AJUSTES_DIAS_UTEIS = {
    // Exemplos de uso:
    // '2024-01': -2,  // Janeiro 2024: remover 2 dias (2 feriados regionais)
    // '2024-02': -1,  // Fevereiro 2024: remover 1 dia (1 folga)
    // '2024-06': -3,  // Junho 2024: remover 3 dias (festa junina + folgas)
    // '2024-12': -2,  // Dezembro 2024: remover 2 dias (véspera de natal + ano novo)
    
    // ADICIONE SEUS AJUSTES AQUI:
     '2025-06': -1,  // Exemplo: remover 1 dia útil de junho 2025 - feriado 19/06
};

// Função para obter o nome do mês atual
function obterNomeMesAtual() {
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const agora = new Date();
    return meses[agora.getMonth()];
}

// Função para calcular dias úteis do mês atual
function calcularDiasUteisDoMes() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = agora.getMonth();
    
    // Primeiro e último dia do mês
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    
    let diasUteis = 0;
    const dataAtual = new Date(primeiroDia);
    
    // Contar todos os dias úteis do mês (segunda a sexta)
    while (dataAtual <= ultimoDia) {
        const diaSemana = dataAtual.getDay();
        // 1-5 = Segunda a Sexta (dias úteis)
        if (diaSemana >= 1 && diaSemana <= 5) {
            diasUteis++;
        }
        dataAtual.setDate(dataAtual.getDate() + 1);
    }
    
    // Aplicar ajustes manuais se existirem
    const chaveAjuste = `${ano}-${(mes + 1).toString().padStart(2, '0')}`;
    const ajuste = AJUSTES_DIAS_UTEIS[chaveAjuste] || 0;
    
    if (ajuste !== 0) {
        console.log(`📅 Ajuste manual aplicado para ${chaveAjuste}: ${ajuste > 0 ? '+' : ''}${ajuste} dias`);
        console.log(`📅 Dias úteis: ${diasUteis} (calculado) ${ajuste > 0 ? '+' : ''}${ajuste} (ajuste) = ${diasUteis + ajuste} (final)`);
    }
    
    return diasUteis + ajuste;
}

// Função para obter informações da meta
function obterInformacoesMeta() {
    const diasUteis = calcularDiasUteisDoMes();
    const metaDiaria = META_MENSAL / diasUteis;
    const mesAtual = obterNomeMesAtual();
    
    return {
        metaMensal: META_MENSAL,
        metaDiaria: metaDiaria,
        diasUteis: diasUteis,
        mesAtual: mesAtual
    };
}

// ===== FUNÇÃO AUXILIAR PARA FACILITAR AJUSTES =====
// Use esta função no console do navegador para calcular rapidamente os ajustes
function calcularAjusteDiasUteis(ano, mes, diasFeriados = 0, diasFolga = 0) {
    console.log(`\n📊 CALCULADORA DE AJUSTE - ${mes}/${ano}`);
    console.log(`🏖️  Dias de feriado regional: ${diasFeriados}`);
    console.log(`😴 Dias de folga extra: ${diasFolga}`);
    
    const totalAjuste = -(diasFeriados + diasFolga);
    const chave = `${ano}-${mes.toString().padStart(2, '0')}`;
    
    console.log(`\n✅ Adicione esta linha no objeto AJUSTES_DIAS_UTEIS:`);
    console.log(`'${chave}': ${totalAjuste},  // ${totalAjuste < 0 ? 'Remover' : 'Adicionar'} ${Math.abs(totalAjuste)} dia(s)`);
    console.log(`\nExemplo completo:`);
    console.log(`const AJUSTES_DIAS_UTEIS = {`);
    console.log(`    '${chave}': ${totalAjuste},  // ${new Date(ano, mes-1).toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'})}`);
    console.log(`};`);
    
    return totalAjuste;
}

// Tornar a função auxiliar global para uso no console
window.calcularAjusteDiasUteis = calcularAjusteDiasUteis;