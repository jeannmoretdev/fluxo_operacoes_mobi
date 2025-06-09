// Arquivo js/filtro-admin-sync.js - Sincroniza o filtro de usuário com o modo admin

(function() {
    console.log("Inicializando sincronização do filtro de usuário com o modo admin...");
    
    // Função para atualizar o filtro de usuário quando o modo admin mudar
    function sincronizarFiltroComModoAdmin() {
        // Verificar se o AdminMode está disponível
        if (!window.AdminMode || typeof window.AdminMode.adicionarListenerMudancaEstado !== 'function') {
            console.log("AdminMode não disponível ou não tem a função adicionarListenerMudancaEstado");
            return;
        }
        
        // Registrar listener para mudanças no modo admin
        window.AdminMode.adicionarListenerMudancaEstado(function(ativo) {
            console.log(`Modo admin mudou para: ${ativo ? 'ativo' : 'inativo'}`);
            
            // Verificar se a função de atualização do filtro está disponível
            if (typeof window.atualizarFiltroUsuario === 'function') {
                console.log("Atualizando filtro de usuário após mudança no modo admin");
                window.atualizarFiltroUsuario();
            } else {
                console.log("Função atualizarFiltroUsuario não disponível");
                
                // Tentar recriar o filtro
                recriarFiltroUsuario(ativo);
            }
        });
        
        console.log("Listener de mudança de estado do modo admin registrado");
    }
    
    // Função para recriar o filtro de usuário
    function recriarFiltroUsuario(modoAdminAtivo) {
        console.log("Tentando recriar o filtro de usuário");
        
        // Lista de usuários que sempre devem ser visíveis
        const USUARIOS_SEMPRE_VISIVEIS = ['BRUNNA', 'DAIANA', 'GABRIEL', 'CAROL'];
        
        // Obter o select de usuário
        const select = document.getElementById('usuario-filter');
        if (!select) {
            console.error("Select de usuário não encontrado");
            return;
        }
        
        // Salvar o valor selecionado atualmente
        const valorAtual = select.value;
        
        // Limpar as opções existentes
        while (select.options.length > 0) {
            select.remove(0);
        }
        
        // Adicionar opção padrão
        const defaultOption = document.createElement('option');
        defaultOption.value = 'todos';
        defaultOption.textContent = 'Todos os Usuários';
        select.appendChild(defaultOption);
        
        // Obter a lista atualizada de usuários
        let listaUsuarios = [];
        if (window.CedenteService && typeof CedenteService.obterTodosUsuarios === 'function') {
            listaUsuarios = CedenteService.obterTodosUsuarios();
            console.log(`Lista atualizada de usuários: ${listaUsuarios.length} usuários`);
        }
        
        // Filtrar a lista de usuários com base no modo admin
        const usuariosParaMostrar = modoAdminAtivo 
            ? listaUsuarios 
            : listaUsuarios.filter(usuario => USUARIOS_SEMPRE_VISIVEIS.includes(usuario));
        
        // Adicionar usuários ao select
        usuariosParaMostrar.sort().forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario;
            option.textContent = usuario;
            select.appendChild(option);
        });
        
        // Restaurar o valor selecionado, se possível
        if (valorAtual && (valorAtual === 'todos' || usuariosParaMostrar.includes(valorAtual))) {
            select.value = valorAtual;
        } else {
            select.value = 'todos';
        }
        
        console.log(`Filtro de usuário recriado com ${usuariosParaMostrar.length} opções`);
        
        // Disparar evento de mudança para aplicar o filtro
        const evento = new Event('change');
        select.dispatchEvent(evento);
    }
    
    // Inicializar quando o documento estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        // Esperar um pouco para garantir que o AdminMode e o CedenteService foram carregados
        setTimeout(sincronizarFiltroComModoAdmin, 3000);
    });
})();