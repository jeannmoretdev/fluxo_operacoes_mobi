// Arquivo js/cedente-service.js - Serviço para gerenciar dados de cedentes e usuários

// Garantir que o objeto seja criado no escopo global
window.CedenteService = {
    // Armazenar o mapeamento de cedentes para usuários
    mapeamentoCedentesUsuarios: {},
    
    // Flag para controlar se a busca já foi realizada
    dadosCarregados: false,
    
    // Flag para controlar se uma busca está em andamento
    buscaEmAndamento: false,
    
    // Função para buscar dados de cedentes e usuários da API
    async buscarDadosCedentesUsuarios() {
        // Verificar se uma busca já está em andamento
        if (this.buscaEmAndamento) {
            console.log("Busca em andamento, ignorando nova solicitação");
            return this.mapeamentoCedentesUsuarios;
        }
        
        // Marcar que uma busca está em andamento
        this.buscaEmAndamento = true;
        
        try {
            // Usar a URL correta da API de cedentes
            const url = CONFIG.API_URL_CEDENTES || 'http://192.168.0.141:8101/sgm_cedente_gerente_usuario';
            console.log(`Buscando dados de cedentes e usuários da API: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro na requisição de cedentes: ${response.status}`);
            }
            
            const dados = await response.json();
            console.log(`Recebidos ${dados.length} registros de cedentes e usuários da API`);
            
            // Processar os dados para criar um mapeamento de cedentes para usuários
            this.processarDadosCedentesUsuarios(dados);
            
            // Marcar que os dados foram carregados
            this.dadosCarregados = true;
            
            // Disparar um evento personalizado para notificar que os dados foram carregados
            document.dispatchEvent(new CustomEvent('cedentesUsuariosCarregados'));
            
            // Exibir informações sobre os gerentes e usuários para depuração
            this.exibirInformacoesGerentes();
            
            return this.mapeamentoCedentesUsuarios;
        } catch (error) {
            console.error("Erro ao buscar dados de cedentes e usuários:", error);
            throw error;
        } finally {
            // Marcar que a busca não está mais em andamento
            this.buscaEmAndamento = false;
        }
    },
    
    // Processar os dados para criar um mapeamento de cedentes para usuários
    processarDadosCedentesUsuarios(dados) {
        // Limpar o mapeamento existente
        this.mapeamentoCedentesUsuarios = {};
        
        // Para cada item nos dados
        dados.forEach(item => {
            if (item.CEDENTE && Array.isArray(item.USUARIOS)) {
                // Armazenar o mapeamento de cedente para usuários
                this.mapeamentoCedentesUsuarios[item.CEDENTE] = {
                    gerente: item.GERENTE || 'Não especificado',
                    usuarios: [...item.USUARIOS]
                };
            }
        });
        
        console.log(`Mapeamento criado para ${Object.keys(this.mapeamentoCedentesUsuarios).length} cedentes`);
    },
    
    // Verificar se um cedente está associado a um usuário específico
    cedenteAssociadoAoUsuario(cedente, usuario) {
        // Se o usuário for "todos", retornar true
        if (usuario === 'todos') {
            return true;
        }
        
        // Se o cedente não estiver no mapeamento, retornar false
        if (!this.mapeamentoCedentesUsuarios[cedente]) {
            console.log(`Cedente não encontrado no mapeamento: ${cedente}`);
            return false;
        }
        
        // Verificar se o usuário está na lista de usuários do cedente
        const resultado = this.mapeamentoCedentesUsuarios[cedente].usuarios.includes(usuario);
        return resultado;
    },
    
    // Obter todos os usuários únicos de todos os cedentes
    obterTodosUsuarios() {
        const todosUsuarios = new Set();
        
        // Para cada cedente no mapeamento
        Object.values(this.mapeamentoCedentesUsuarios).forEach(info => {
            // Adicionar cada usuário ao conjunto
            info.usuarios.forEach(usuario => todosUsuarios.add(usuario));
        });
        
        // Converter o conjunto para array e ordenar
        const usuarios = Array.from(todosUsuarios).sort();
        console.log(`Total de usuários únicos: ${usuarios.length}`);
        return usuarios;
    },
    
    // Obter todos os gerentes únicos
    obterTodosGerentes() {
        const todosGerentes = new Set();
        
        // Para cada cedente no mapeamento
        Object.values(this.mapeamentoCedentesUsuarios).forEach(info => {
            if (info.gerente && info.gerente !== 'Não especificado') {
                todosGerentes.add(info.gerente);
            }
        });
        
        // Converter o conjunto para array e ordenar
        const gerentes = Array.from(todosGerentes).sort();
        console.log(`Total de gerentes únicos: ${gerentes.length}`);
        return gerentes;
    },
    
    // Exibir informações sobre gerentes e usuários para depuração
    exibirInformacoesGerentes() {
        console.log("=== INFORMAÇÕES DE GERENTES E USUÁRIOS ===");
        
        // Obter todos os gerentes
        const gerentes = this.obterTodosGerentes();
        console.log("Gerentes encontrados:", gerentes);
        
        // Obter todos os usuários
        const usuarios = this.obterTodosUsuarios();
        console.log("Usuários encontrados:", usuarios);
        
        // Exibir alguns exemplos de mapeamento
        const cedentes = Object.keys(this.mapeamentoCedentesUsuarios);
        if (cedentes.length > 0) {
            console.log("Exemplos de mapeamento:");
            
            // Exibir até 5 exemplos
            for (let i = 0; i < Math.min(5, cedentes.length); i++) {
                const cedente = cedentes[i];
                const info = this.mapeamentoCedentesUsuarios[cedente];
                console.log(`Cedente: ${cedente}, Gerente: ${info.gerente}, Usuários: ${info.usuarios.join(', ')}`);
            }
        }
        
        console.log("=== FIM DAS INFORMAÇÕES ===");
    },

    // Método para depuração do mapeamento
    depurarMapeamento() {
        console.log("=== DEPURAÇÃO DO MAPEAMENTO DE CEDENTES ===");
        
        // Verificar se o mapeamento existe
        if (!this.mapeamentoCedentesUsuarios) {
            console.error("Mapeamento não encontrado");
            return;
        }
        
        // Obter todos os cedentes
        const cedentes = Object.keys(this.mapeamentoCedentesUsuarios);
        console.log(`Total de cedentes no mapeamento: ${cedentes.length}`);
        
        // Obter todos os usuários únicos
        const todosUsuarios = this.obterTodosUsuarios();
        console.log(`Total de usuários únicos: ${todosUsuarios.length}`);
        console.log("Lista de usuários:", todosUsuarios);
        
        // Verificar cedentes por usuário
        todosUsuarios.forEach(usuario => {
            const cedentesDoUsuario = cedentes.filter(cedente => 
                this.mapeamentoCedentesUsuarios[cedente].usuarios.includes(usuario)
            );
            
            console.log(`Usuário "${usuario}" está associado a ${cedentesDoUsuario.length} cedentes`);
        });
        
        // Verificar se há cedentes sem usuários
        const cedentesSemUsuarios = cedentes.filter(cedente => 
            !this.mapeamentoCedentesUsuarios[cedente].usuarios || 
            this.mapeamentoCedentesUsuarios[cedente].usuarios.length === 0
        );
        
        if (cedentesSemUsuarios.length > 0) {
            console.warn(`Encontrados ${cedentesSemUsuarios.length} cedentes sem usuários associados`);
            console.warn("Lista de cedentes sem usuários:", cedentesSemUsuarios);
        }
        
        console.log("=== FIM DA DEPURAÇÃO ===");
    },

    // Método para testar a associação de cedentes a usuários
    testarAssociacao(usuario) {
        // Verificar se o mapeamento existe
        if (!this.mapeamentoCedentesUsuarios) {
            console.error("Mapeamento não encontrado");
            return;
        }
        
        // Obter todos os cedentes
        const cedentes = Object.keys(this.mapeamentoCedentesUsuarios);
        
        // Filtrar cedentes associados ao usuário
        const cedentesAssociados = cedentes.filter(cedente => 
            this.cedenteAssociadoAoUsuario(cedente, usuario)
        );
        
        console.log(`Usuário "${usuario}" está associado a ${cedentesAssociados.length} de ${cedentes.length} cedentes`);
        
        // Retornar os cedentes associados
        return cedentesAssociados;
    }
};

// Função para adicionar botão de atualização de cedentes
function adicionarBotaoAtualizarCedentes() {
    // Verificar se o botão já existe
    if (document.getElementById('atualizar-cedentes-btn')) {
        return;
    }
    
    // Criar o botão
    const botao = document.createElement('button');
    botao.id = 'atualizar-cedentes-btn';
    botao.className = 'update-cedentes-button';
    botao.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar Cedentes';
    botao.title = 'Atualizar dados de cedentes e usuários da API';
    
    // Adicionar estilo ao botão
    botao.style.position = 'absolute';
    botao.style.top = '10px';
    botao.style.right = '150px';
    botao.style.padding = '5px 10px';
    botao.style.backgroundColor = '#4CAF50';
    botao.style.color = 'white';
    botao.style.border = 'none';
    botao.style.borderRadius = '4px';
    botao.style.cursor = 'pointer';
    botao.style.zIndex = '1000';
    
    // Adicionar evento de clique
    botao.addEventListener('click', async function() {
        try {
            // Alterar o texto do botão para indicar que está atualizando
            botao.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
            botao.disabled = true;
            
            // Buscar dados da API
            await window.CedenteService.buscarDadosCedentesUsuarios();
            
            // Atualizar o filtro de usuário
            if (typeof window.atualizarFiltroUsuario === 'function') {
                window.atualizarFiltroUsuario();
            }
            
            // Restaurar o texto do botão
            botao.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar Cedentes';
            botao.disabled = false;
            
            // Mostrar mensagem de sucesso
            alert('Dados de cedentes atualizados com sucesso!');
        } catch (error) {
            console.error("Erro ao atualizar dados de cedentes:", error);
            
            // Restaurar o texto do botão
            botao.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar Cedentes';
            botao.disabled = false;
            
            // Mostrar mensagem de erro
            alert(`Erro ao atualizar dados de cedentes: ${error.message}`);
        }
    });
    
    // Adicionar o botão ao documento
    document.body.appendChild(botao);
}

// Inicializar o serviço quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando CedenteService...");
    
    // Adicionar botão para atualizar dados da API
    adicionarBotaoAtualizarCedentes();
    
    // Carregar dados da API uma vez no início
    setTimeout(async function() {
        try {
            await window.CedenteService.buscarDadosCedentesUsuarios();
            console.log("CedenteService inicializado com sucesso");
        } catch (error) {
            console.error("Erro ao inicializar CedenteService:", error);
        }
    }, 1000);
});

// Adicionar função para exibir informações de cedentes no console
window.exibirInformacoesCedentes = function() {
    console.log("=== INFORMAÇÕES COMPLETAS DE CEDENTES ===");
    
    if (!window.CedenteService.dadosCarregados) {
        console.log("Dados de cedentes ainda não foram carregados");
        return;
    }
    
    // Obter todos os gerentes
    const gerentes = window.CedenteService.obterTodosGerentes();
    console.log(`Total de gerentes: ${gerentes.length}`);
    console.log("Gerentes:", gerentes);
    
    // Obter todos os usuários
    const usuarios = window.CedenteService.obterTodosUsuarios();
    console.log(`Total de usuários: ${usuarios.length}`);
    console.log("Usuários:", usuarios);
    
    console.log("=== FIM DAS INFORMAÇÕES ===");
};

// Verificar se o CedenteService está disponível globalmente
console.log("CedenteService definido:", typeof window.CedenteService !== 'undefined');