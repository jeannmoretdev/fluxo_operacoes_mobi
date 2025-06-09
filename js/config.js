/**
 * Global configuration settings for the application.
 * Contains constants and state management for the entire application.
 */
// Arquivo js/config.js - Configurações da aplicação

// Definir CONFIG apenas se ainda não existir
if (typeof window.CONFIG === 'undefined') {
    window.CONFIG = {
        // URL da API de fluxo de propostas
        API_URL: 'http://192.168.0.141:8100/propostas_com_fluxo',
        
        // URL da API de cedentes, gerentes e usuários
        API_URL_CEDENTES: 'http://192.168.0.141:8101/sgm_cedente_gerente_usuario',
        
        // Intervalo de atualização automática em milissegundos (1 minutos)
        REFRESH_INTERVAL: 1 * 60 * 1000,
        
        // Tempo limite para considerar uma proposta como "em atraso" (em minutos)
        TEMPO_LIMITE_ATRASO: 150, // 2 horas e 30 minutos
        
        // Configurações de cache
        CACHE: {
            // Tempo de vida do cache de cedentes em milissegundos (1 hora)
            TTL_CEDENTES: 60 * 60 * 1000
        },
        
        // Configurações de debug
        DEBUG: {
            enabled: true,
            logLevel: 'info' // 'debug', 'info', 'warn', 'error'
        }
    };
    
    console.log("CONFIG definido globalmente");
}

// Ordem personalizada dos status (do início para o fim do fluxo)
const ORDEM_STATUS = [
    "DIGITANDO",                // 1 - DIGITANDO
    "AGUARD. ANÁLISE",          // 2 - AGUARD. ANÁLISE
    "OPER. ANALISANDO",         // 3 - OPER. ANALISANDO
    "PENDÊNCIA",                // 4 - PENDÊNCIA (era COMITÊ)
    "Q CERT. ASSINAT.",         // 5 - Q CERT. ASSINAT.
    "PAGO",                     // 6 - PAGO
    "CHECAGEM",                 // CHECAGEM
    "POSTERGADO",               // POSTERGADO
    "CEDENTE DESISTIU",         // CEDENTE DESISTIU
    "RECUSADO",                 // RECUSADO
    // "PENDÊNCIA" removido daqui pois agora está na posição 4
];

// Definir APP_STATE apenas se ainda não existir
if (typeof window.APP_STATE === 'undefined') {
    window.APP_STATE = {
        filtroStatus: 'todos',
        filtroCedente: '',
        ordenacao: 'data_desc',
        propostas: [],
        dataInicio: new Date(),
        dataFim: new Date(),
        buscaEmAndamento: false,
        atualizacaoAutomatica: true,
        intervalId: null,
        // Adicionar flag para o usuário selecionado
        usuarioSelecionado: 'todos',
        // Adicionar flags de controle
        verificandoAPI: false,
        // Adicionar flag de inicialização
        inicializado: false,
        somaValoresAprovados: 0
    };
    
    console.log("APP_STATE definido globalmente");
} else {
    console.log("APP_STATE já existe, mantendo o existente");
}

// Verificar se o APP_STATE está disponível globalmente
console.log("APP_STATE definido globalmente:", typeof window.APP_STATE !== 'undefined');