// Arquivo js/cedente-init.js - Inicialização do CedenteService

// Verificar se o CedenteService já foi inicializado
if (typeof window.CedenteService === 'undefined') {
    console.log("Inicializando CedenteService globalmente...");
    
    // Criar o objeto CedenteService no escopo global
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
                const url = window.CONFIG?.API_URL_CEDENTES || 'http://192.168.0.141:8101/sgm_cedente_gerente_usuario';
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
                return false;
            }
            
            // Verificar se o usuário está na lista de usuários do cedente
            return this.mapeamentoCedentesUsuarios[cedente].usuarios.includes(usuario);
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
            return Array.from(todosUsuarios).sort();
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
            return Array.from(todosGerentes).sort();
        }
    };
    
    console.log("CedenteService inicializado globalmente");
} else {
    console.log("CedenteService já está definido globalmente");
}

// Verificar se o CedenteService está disponível
console.log("CedenteService disponível:", typeof window.CedenteService !== 'undefined');