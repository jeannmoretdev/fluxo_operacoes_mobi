// Arquivo js/admin-mode.js - Controle de acesso para ferramentas administrativas

(function() {
    console.log("Inicializando controle de acesso administrativo...");
    
    // Senha para acesso administrativo (você pode alterar para uma senha mais segura)
    const ADMIN_PASSWORD = "admin123";
    
    // Estado do modo administrativo
    let modoAdminAtivo = false;
    
    // Lista de listeners para mudanças de estado
    const listenersEstado = [];
    
    // Lista completa de IDs dos botões de debug que devem ser controlados
    const idsBotoesDebug = [
        'teste-filtro-btn',
        'corrigir-filtro-btn',
        'cedente-diagnostico-btn',
        'restart-update-btn',
        'debug-btn',
        'verificar-modo-tv-btn',
        'atualizar-cedentes-btn',
        'verificar-cedentes-btn',
        'debug-cedentes-btn',
        'corrigir-cores-pago-btn'
    ];
    
    // Função para adicionar botão de modo administrativo
    function adicionarBotaoAdmin() {
        // Verificar se o botão já existe
        if (document.getElementById('admin-mode-btn')) {
            return;
        }
        
        // Criar o botão
        const botao = document.createElement('button');
        botao.id = 'admin-mode-btn';
        botao.className = 'admin-mode-button';
        botao.innerHTML = '<i class="fas fa-lock"></i>';
        botao.title = 'Modo Administrativo';
        
        // Adicionar estilo ao botão
        botao.style.position = 'fixed';
        botao.style.bottom = '10px';
        botao.style.left = '10px';
        botao.style.width = '40px';
        botao.style.height = '40px';
        botao.style.borderRadius = '50%';
        botao.style.backgroundColor = '#f8f9fa';
        botao.style.border = '1px solid #dee2e6';
        botao.style.color = '#495057';
        botao.style.fontSize = '16px';
        botao.style.cursor = 'pointer';
        botao.style.zIndex = '9999';
        botao.style.display = 'flex';
        botao.style.alignItems = 'center';
        botao.style.justifyContent = 'center';
        botao.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        botao.style.transition = 'all 0.3s ease';
        
        // Adicionar evento de clique
        botao.addEventListener('click', function() {
            if (modoAdminAtivo) {
                // Se o modo admin já está ativo, desativar
                desativarModoAdmin();
            } else {
                // Se não está ativo, solicitar senha
                solicitarSenhaAdmin();
            }
        });
        
        // Adicionar o botão ao documento
        document.body.appendChild(botao);
    }
    
    // Função para solicitar senha administrativa
    function solicitarSenhaAdmin() {
        const senha = prompt("Digite a senha administrativa:");
        
        if (senha === null) {
            // Usuário cancelou
            return;
        }
        
        if (senha === ADMIN_PASSWORD) {
            ativarModoAdmin();
        } else {
            alert("Senha incorreta!");
        }
    }
    
    // Função para ativar o modo administrativo
    function ativarModoAdmin() {
        modoAdminAtivo = true;
        
        // Atualizar o botão de admin
        const botaoAdmin = document.getElementById('admin-mode-btn');
        if (botaoAdmin) {
            botaoAdmin.innerHTML = '<i class="fas fa-unlock"></i>';
            botaoAdmin.style.backgroundColor = '#28a745';
            botaoAdmin.style.color = 'white';
            botaoAdmin.title = 'Desativar Modo Administrativo';
        }
        
        // Mostrar botões de debug
        mostrarBotoesDebug(true);
        
        // Notificar listeners
        notificarMudancaEstado();
        
        console.log("Modo administrativo ativado");
    }
    
    // Função para desativar o modo administrativo
    function desativarModoAdmin() {
        modoAdminAtivo = false;
        
        // Atualizar o botão de admin
        const botaoAdmin = document.getElementById('admin-mode-btn');
        if (botaoAdmin) {
            botaoAdmin.innerHTML = '<i class="fas fa-lock"></i>';
            botaoAdmin.style.backgroundColor = '#f8f9fa';
            botaoAdmin.style.color = '#495057';
            botaoAdmin.title = 'Modo Administrativo';
        }
        
        // Ocultar botões de debug
        mostrarBotoesDebug(false);
        
        // Notificar listeners
        notificarMudancaEstado();
        
        console.log("Modo administrativo desativado");
    }
    
    // Função para notificar listeners sobre mudança de estado
    function notificarMudancaEstado() {
        listenersEstado.forEach(listener => {
            try {
                listener(modoAdminAtivo);
            } catch (error) {
                console.error("Erro ao notificar listener:", error);
            }
        });
    }
    
    // Função para verificar se um botão é de debug
    function isBotaoDebug(btn) {
        if (!btn || btn.id === 'admin-mode-btn') {
            return false;
        }
        
        // Verificar se o botão está na lista de IDs conhecidos
        if (idsBotoesDebug.includes(btn.id)) {
            return true;
        }
        
        // Verificar se o botão tem um ID ou classe que sugere que é um botão de debug
        return (
            btn.id.includes('debug') || 
            btn.id.includes('teste') || 
            btn.id.includes('diagnostico') || 
            btn.id.includes('verificar') || 
            btn.id.includes('corrigir') ||        // ADICIONADO
            btn.className.includes('debug') ||
            btn.className.includes('teste') ||
            btn.className.includes('diagnostico') ||
            btn.className.includes('verificar') ||
            btn.className.includes('corrigir')    // ADICIONADO
        );
    }
    
    // Função para mostrar/ocultar botões de debug
    function mostrarBotoesDebug(mostrar) {
        console.log(`${mostrar ? 'Mostrando' : 'Ocultando'} botões de debug...`);
        
        // Primeiro, verificar os botões na lista de IDs conhecidos
        idsBotoesDebug.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                console.log(`Botão ${id} encontrado, ${mostrar ? 'mostrando' : 'ocultando'}`);
                btn.style.display = mostrar ? 'block' : 'none';
                btn.style.visibility = mostrar ? 'visible' : 'hidden';
            }
        });
        
        // FORÇAR OCULTAÇÃO ESPECÍFICA DOS BOTÕES CRÍTICOS
        const botoesEspeciais = ['corrigir-cores-pago-btn', 'verificar-modo-tv-btn'];
        botoesEspeciais.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                console.log(`Forçando ${mostrar ? 'exibição' : 'ocultação'} do botão ${id}`);
                btn.style.display = mostrar ? 'block' : 'none !important';
                btn.style.visibility = mostrar ? 'visible' : 'hidden !important';
                btn.style.opacity = mostrar ? '1' : '0';
                if (!mostrar) {
                    btn.setAttribute('hidden', 'true');
                } else {
                    btn.removeAttribute('hidden');
                }
            }
        });
        
        // Depois, procurar por outros botões de debug
        const todosBotoes = document.querySelectorAll('button');
        todosBotoes.forEach(btn => {
            if (isBotaoDebug(btn)) {
                console.log(`Botão ${btn.id || 'sem ID'} identificado como debug, ${mostrar ? 'mostrando' : 'ocultando'}`);
                btn.style.display = mostrar ? 'block' : 'none';
                btn.style.visibility = mostrar ? 'visible' : 'hidden';
            }
        });
    }
    
    // Função para observar novos botões de debug que possam ser adicionados dinamicamente
    function observarNovosBotoesDebug() {
        // Criar um observador de mutações
        const observer = new MutationObserver(function(mutations) {
            if (!modoAdminAtivo) {
                mutations.forEach(function(mutation) {
                    // Verificar se foram adicionados novos nós
                    if (mutation.addedNodes.length) {
                        mutation.addedNodes.forEach(function(node) {
                            // Verificar se o nó é um elemento e se é um botão
                            if (node.nodeType === 1 && node.tagName === 'BUTTON') {
                                if (isBotaoDebug(node)) {
                                    // Ocultar o botão se o modo admin não estiver ativo
                                    node.style.display = modoAdminAtivo ? 'block' : 'none';
                                }
                            }
                        });
                    }
                });
            }
        });
        
        // Configurar o observador para observar todo o documento
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Inicializar quando o documento estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        console.log("DOM carregado, inicializando controle de acesso administrativo");
        
        // Ocultar botões de debug imediatamente
        mostrarBotoesDebug(false);
        
        // FORÇAR OCULTAÇÃO ESPECÍFICA DOS BOTÕES CRÍTICOS
        setTimeout(function() {
            const botoesEspeciais = ['corrigir-cores-pago-btn', 'verificar-modo-tv-btn'];
            botoesEspeciais.forEach(id => {
                const btn = document.getElementById(id);
                if (btn && !modoAdminAtivo) {
                    console.log(`Forçando ocultação do botão ${id} na inicialização`);
                    btn.style.display = 'none !important';
                    btn.style.visibility = 'hidden !important';
                    btn.style.opacity = '0';
                    btn.setAttribute('hidden', 'true');
                }
            });
        }, 100);
        
        // Adicionar botão de modo administrativo
        adicionarBotaoAdmin();
        
        // Iniciar observação de novos botões
        observarNovosBotoesDebug();
        
        // Verificar novamente após mais tempo para garantir que todos os scripts foram carregados
        setTimeout(function() {
            mostrarBotoesDebug(false);
            
            // Verificação adicional específica para os botões especiais
            const botoesEspeciais = ['corrigir-cores-pago-btn', 'verificar-modo-tv-btn'];
            botoesEspeciais.forEach(id => {
                const btn = document.getElementById(id);
                if (btn && !modoAdminAtivo) {
                    console.log(`Verificação adicional: ocultando botão ${id}`);
                    btn.style.display = 'none !important';
                    btn.style.visibility = 'hidden !important';
                    btn.setAttribute('hidden', 'true');
                }
            });
            
            console.log("Verificação adicional de botões de debug concluída");
        }, 2000);
    });
    
    // Expor funções para uso global
    window.AdminMode = {
        ativar: function() {
            if (!modoAdminAtivo) {
                solicitarSenhaAdmin();
            }
        },
        desativar: function() {
            if (modoAdminAtivo) {
                desativarModoAdmin();
            }
        },
        alternar: function() {
            if (modoAdminAtivo) {
                desativarModoAdmin();
            } else {
                solicitarSenhaAdmin();
            }
        },
        isAtivo: function() {
            return modoAdminAtivo;
        },
        adicionarListenerMudancaEstado: function(listener) {
            if (typeof listener === 'function' && !listenersEstado.includes(listener)) {
                listenersEstado.push(listener);
                return true;
            }
            return false;
        },
        removerListenerMudancaEstado: function(listener) {
            const index = listenersEstado.indexOf(listener);
            if (index !== -1) {
                listenersEstado.splice(index, 1);
                return true;
            }
            return false;
        },
        // Função para depuração
        verificarBotoes: function() {
            const botoes = document.querySelectorAll('button');
            console.log("Botões na página:", botoes.length);
            
            botoes.forEach(btn => {
                console.log(`Botão: id=${btn.id}, class=${btn.className}, display=${btn.style.display}, isDebug=${isBotaoDebug(btn)}`);
            });
        }
    };
})();
