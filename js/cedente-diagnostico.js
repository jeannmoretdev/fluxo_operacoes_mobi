// Arquivo js/cedente-diagnostico.js - Ferramenta de diagnóstico para cedentes e usuários

(function() {
    // Função para criar a interface de diagnóstico
    function criarInterfaceDiagnostico() {
        // Verificar se a interface já existe
        if (document.getElementById('cedente-diagnostico-modal')) {
            return;
        }
        
        // Criar o modal
        const modal = document.createElement('div');
        modal.id = 'cedente-diagnostico-modal';
        modal.className = 'diagnostico-modal';
        modal.style.display = 'none';
        
        // Estilo do modal
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        modal.style.zIndex = '10000';
        modal.style.overflow = 'auto';
        
        // Conteúdo do modal
        const modalContent = document.createElement('div');
        modalContent.className = 'diagnostico-modal-content';
        modalContent.style.backgroundColor = '#fff';
        modalContent.style.margin = '5% auto';
        modalContent.style.padding = '20px';
        modalContent.style.width = '90%';
        modalContent.style.maxWidth = '1200px';
        modalContent.style.borderRadius = '5px';
        modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        
        // Cabeçalho do modal
        const modalHeader = document.createElement('div');
        modalHeader.className = 'diagnostico-modal-header';
        modalHeader.style.display = 'flex';
        modalHeader.style.justifyContent = 'space-between';
        modalHeader.style.alignItems = 'center';
        modalHeader.style.marginBottom = '20px';
        modalHeader.style.borderBottom = '1px solid #ddd';
        modalHeader.style.paddingBottom = '10px';
        
        // Título do modal
        const modalTitle = document.createElement('h2');
        modalTitle.textContent = 'Diagnóstico de Cedentes e Usuários';
        modalTitle.style.margin = '0';
        
        // Botão de fechar
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.padding = '0 5px';
        closeButton.onclick = function() {
            modal.style.display = 'none';
        };
        
        // Adicionar elementos ao cabeçalho
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        
        // Corpo do modal
        const modalBody = document.createElement('div');
        modalBody.className = 'diagnostico-modal-body';
        
        // Seletor de usuário
        const userSelector = document.createElement('div');
        userSelector.className = 'user-selector';
        userSelector.style.marginBottom = '20px';
        
        const userLabel = document.createElement('label');
        userLabel.textContent = 'Selecione um usuário: ';
        userLabel.style.marginRight = '10px';
        
        const userSelect = document.createElement('select');
        userSelect.id = 'diagnostico-user-select';
        userSelect.style.padding = '5px';
        userSelect.style.borderRadius = '4px';
        userSelect.style.border = '1px solid #ddd';
        
        // Adicionar opção para todos os usuários
        const allOption = document.createElement('option');
        allOption.value = 'todos';
        allOption.textContent = 'Todos os Usuários';
        userSelect.appendChild(allOption);
        
        // Adicionar elementos ao seletor de usuário
        userSelector.appendChild(userLabel);
        userSelector.appendChild(userSelect);
        
        // Área de resultados
        const resultsArea = document.createElement('div');
        resultsArea.id = 'diagnostico-results';
        resultsArea.style.maxHeight = '500px';
        resultsArea.style.overflow = 'auto';
        resultsArea.style.border = '1px solid #ddd';
        resultsArea.style.borderRadius = '4px';
        resultsArea.style.padding = '10px';
        
        // Adicionar elementos ao corpo do modal
        modalBody.appendChild(userSelector);
        modalBody.appendChild(resultsArea);
        
        // Rodapé do modal
        const modalFooter = document.createElement('div');
        modalFooter.className = 'diagnostico-modal-footer';
        modalFooter.style.marginTop = '20px';
        modalFooter.style.borderTop = '1px solid #ddd';
        modalFooter.style.paddingTop = '10px';
        modalFooter.style.display = 'flex';
        modalFooter.style.justifyContent = 'space-between';
        
        // Botão para exportar resultados
        const exportButton = document.createElement('button');
        exportButton.textContent = 'Exportar Resultados';
        exportButton.style.padding = '8px 16px';
        exportButton.style.backgroundColor = '#4CAF50';
        exportButton.style.color = 'white';
        exportButton.style.border = 'none';
        exportButton.style.borderRadius = '4px';
        exportButton.style.cursor = 'pointer';
        exportButton.onclick = exportarResultados;
        
        // Botão para fechar o modal
        const closeModalButton = document.createElement('button');
        closeModalButton.textContent = 'Fechar';
        closeModalButton.style.padding = '8px 16px';
        closeModalButton.style.backgroundColor = '#f44336';
        closeModalButton.style.color = 'white';
        closeModalButton.style.border = 'none';
        closeModalButton.style.borderRadius = '4px';
        closeModalButton.style.cursor = 'pointer';
        closeModalButton.onclick = function() {
            modal.style.display = 'none';
        };
        
        // Adicionar botões ao rodapé
        modalFooter.appendChild(exportButton);
        modalFooter.appendChild(closeModalButton);
        
        // Montar o modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        modal.appendChild(modalContent);
        
        // Adicionar o modal ao documento
        document.body.appendChild(modal);
        
        // Adicionar event listener para fechar o modal ao clicar fora dele
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Adicionar event listener para o seletor de usuário
        userSelect.addEventListener('change', function() {
            mostrarCedentesPorUsuario(this.value);
        });
        
        // Preencher o seletor de usuários
        preencherSeletorUsuarios();
        
        return modal;
    }
    
    // Função para preencher o seletor de usuários
    function preencherSeletorUsuarios() {
        // Verificar se o CedenteService está disponível
        if (!window.CedenteService || typeof window.CedenteService.obterTodosUsuarios !== 'function') {
            console.error("CedenteService não está disponível ou não tem o método obterTodosUsuarios");
            return;
        }
        
        // Obter a lista de usuários
        const usuarios = window.CedenteService.obterTodosUsuarios();
        
        // Obter o seletor
        const userSelect = document.getElementById('diagnostico-user-select');
        if (!userSelect) {
            console.error("Seletor de usuários não encontrado");
            return;
        }
        
        // Limpar opções existentes (exceto a primeira)
        while (userSelect.options.length > 1) {
            userSelect.remove(1);
        }
        
        // Adicionar cada usuário ao seletor
        usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario;
            option.textContent = usuario;
            userSelect.appendChild(option);
        });
        
        console.log(`Adicionados ${usuarios.length} usuários ao seletor de diagnóstico`);
    }
    
    // Função para mostrar os cedentes associados a um usuário
    function mostrarCedentesPorUsuario(usuario) {
        // Verificar se o CedenteService está disponível
        if (!window.CedenteService || typeof window.CedenteService.mapeamentoCedentesUsuarios !== 'object') {
            console.error("CedenteService não está disponível ou não tem o mapeamento de cedentes");
            return;
        }
        
        // Obter a área de resultados
        const resultsArea = document.getElementById('diagnostico-results');
        if (!resultsArea) {
            console.error("Área de resultados não encontrada");
            return;
        }
        
        // Limpar resultados anteriores
        resultsArea.innerHTML = '';
        
        // Obter o mapeamento de cedentes
        const mapeamento = window.CedenteService.mapeamentoCedentesUsuarios;
        
        // Filtrar cedentes pelo usuário selecionado
        let cedentesFiltrados = [];
        
        if (usuario === 'todos') {
            // Mostrar todos os cedentes
            cedentesFiltrados = Object.keys(mapeamento);
        } else {
            // Filtrar cedentes pelo usuário
            cedentesFiltrados = Object.keys(mapeamento).filter(cedente => 
                mapeamento[cedente].usuarios.includes(usuario)
            );
        }
        
        // Ordenar cedentes alfabeticamente
        cedentesFiltrados.sort();
        
        // Criar tabela de resultados
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        
        // Cabeçalho da tabela
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Cedente', 'Gerente', 'Usuários'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.style.padding = '8px';
            th.style.backgroundColor = '#f2f2f2';
            th.style.borderBottom = '2px solid #ddd';
            th.style.textAlign = 'left';
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Corpo da tabela
        const tbody = document.createElement('tbody');
        
        cedentesFiltrados.forEach(cedente => {
            const row = document.createElement('tr');
            
            // Célula do cedente
            const tdCedente = document.createElement('td');
            tdCedente.textContent = cedente;
            tdCedente.style.padding = '8px';
            tdCedente.style.borderBottom = '1px solid #ddd';
            row.appendChild(tdCedente);
            
            // Célula do gerente
            const tdGerente = document.createElement('td');
            tdGerente.textContent = mapeamento[cedente].gerente || 'Não especificado';
            tdGerente.style.padding = '8px';
            tdGerente.style.borderBottom = '1px solid #ddd';
            row.appendChild(tdGerente);
            
            // Célula dos usuários
            const tdUsuarios = document.createElement('td');
            tdUsuarios.textContent = mapeamento[cedente].usuarios.join(', ');
            tdUsuarios.style.padding = '8px';
            tdUsuarios.style.borderBottom = '1px solid #ddd';
            
            // Destacar o usuário selecionado
            if (usuario !== 'todos' && mapeamento[cedente].usuarios.includes(usuario)) {
                tdUsuarios.innerHTML = tdUsuarios.textContent.replace(
                    usuario, 
                    `<span style="background-color: yellow; font-weight: bold;">${usuario}</span>`
                );
            }
            
            row.appendChild(tdUsuarios);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        
        // Adicionar a tabela à área de resultados
        resultsArea.appendChild(table);
        
        // Adicionar resumo
        const resumo = document.createElement('div');
        resumo.style.marginTop = '10px';
        resumo.style.padding = '10px';
        resumo.style.backgroundColor = '#f9f9f9';
        resumo.style.borderRadius = '4px';
        
        if (usuario === 'todos') {
            resumo.innerHTML = `<strong>Total de cedentes:</strong> ${cedentesFiltrados.length}`;
        } else {
            resumo.innerHTML = `<strong>Usuário:</strong> ${usuario}<br>
                               <strong>Total de cedentes associados:</strong> ${cedentesFiltrados.length}`;
        }
        
        resultsArea.appendChild(resumo);
    }
    
    // Função para exportar os resultados
    function exportarResultados() {
        // Obter a área de resultados
        const resultsArea = document.getElementById('diagnostico-results');
        if (!resultsArea) {
            console.error("Área de resultados não encontrada");
            return;
        }
        
        // Obter o usuário selecionado
        const userSelect = document.getElementById('diagnostico-user-select');
        const usuarioSelecionado = userSelect ? userSelect.value : 'todos';
        
        // Criar um objeto para armazenar os dados
        let dados = [];
        
        // Verificar se o CedenteService está disponível
        if (!window.CedenteService || typeof window.CedenteService.mapeamentoCedentesUsuarios !== 'object') {
            console.error("CedenteService não está disponível ou não tem o mapeamento de cedentes");
            return;
        }
        
        // Obter o mapeamento de cedentes
        const mapeamento = window.CedenteService.mapeamentoCedentesUsuarios;
        
        // Filtrar cedentes pelo usuário selecionado
        let cedentesFiltrados = [];
        
        if (usuarioSelecionado === 'todos') {
            // Mostrar todos os cedentes
            cedentesFiltrados = Object.keys(mapeamento);
        } else {
            // Filtrar cedentes pelo usuário
            cedentesFiltrados = Object.keys(mapeamento).filter(cedente => 
                mapeamento[cedente].usuarios.includes(usuarioSelecionado)
            );
        }
        
        // Ordenar cedentes alfabeticamente
        cedentesFiltrados.sort();
        
        // Preencher o array de dados
        cedentesFiltrados.forEach(cedente => {
            dados.push({
                Cedente: cedente,
                Gerente: mapeamento[cedente].gerente || 'Não especificado',
                Usuarios: mapeamento[cedente].usuarios.join(', ')
            });
        });
        
        // Converter para CSV
        let csv = 'Cedente,Gerente,Usuarios\n';
        
        dados.forEach(item => {
            // Escapar vírgulas nos campos
            const cedente = item.Cedente.includes(',') ? `"${item.Cedente}"` : item.Cedente;
            const gerente = item.Gerente.includes(',') ? `"${item.Gerente}"` : item.Gerente;
            const usuarios = item.Usuarios.includes(',') ? `"${item.Usuarios}"` : item.Usuarios;
            
            csv += `${cedente},${gerente},${usuarios}\n`;
        });
        
        // Criar um blob com o CSV
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        
        // Criar um link para download
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `cedentes_${usuarioSelecionado}_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        // Limpar
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    // Função para verificar o mapeamento de cedentes para usuários
    function verificarMapeamentoCedentes() {
        // Verificar se o CedenteService está disponível
        if (!window.CedenteService) {
            console.error("CedenteService não está disponível");
            return false;
        }
        
        // Verificar se o mapeamento existe
        if (!window.CedenteService.mapeamentoCedentesUsuarios) {
            console.error("Mapeamento de cedentes para usuários não encontrado");
            return false;
        }
        
        // Verificar se o mapeamento tem dados
        const mapeamento = window.CedenteService.mapeamentoCedentesUsuarios;
        const numCedentes = Object.keys(mapeamento).length;
        
        if (numCedentes === 0) {
            console.error("Mapeamento de cedentes está vazio");
            return false;
        }
        
        console.log(`Mapeamento de cedentes contém ${numCedentes} cedentes`);
        return true;
    }
    
    // Função para testar o filtro de usuário
    function testarFiltroUsuario(usuario) {
        // Verificar se o CedenteService está disponível
        if (!window.CedenteService || typeof window.CedenteService.cedenteAssociadoAoUsuario !== 'function') {
            console.error("CedenteService não está disponível ou não tem o método cedenteAssociadoAoUsuario");
            return;
        }
        
        // Verificar se APP_STATE está disponível
        if (!window.APP_STATE || !Array.isArray(window.APP_STATE.propostas)) {
            console.error("APP_STATE não está disponível ou não contém propostas");
            return;
        }
        
        // Obter todas as propostas
        const todasPropostas = window.APP_STATE.propostas;
        
        // Obter cedentes únicos
        const cedentesUnicos = [...new Set(todasPropostas.map(p => p.cedente))];
        
        console.log(`Total de cedentes únicos nas propostas: ${cedentesUnicos.length}`);
        
        // Verificar quais cedentes estão associados ao usuário
        const cedentesAssociados = cedentesUnicos.filter(cedente => 
            window.CedenteService.cedenteAssociadoAoUsuario(cedente, usuario)
        );
        
        console.log(`Cedentes associados ao usuário ${usuario}: ${cedentesAssociados.length}`);
        console.log("Lista de cedentes associados:", cedentesAssociados);
        
        // Verificar quais propostas passariam pelo filtro
        const propostasFiltradas = todasPropostas.filter(p => 
            window.CedenteService.cedenteAssociadoAoUsuario(p.cedente, usuario)
        );
        
        console.log(`Propostas que passariam pelo filtro para o usuário ${usuario}: ${propostasFiltradas.length} de ${todasPropostas.length}`);
        
        return {
            totalCedentes: cedentesUnicos.length,
            cedentesAssociados: cedentesAssociados,
            totalPropostas: todasPropostas.length,
            propostasFiltradas: propostasFiltradas.length
        };
    }
    
    // Função para adicionar botão de diagnóstico
    function adicionarBotaoDiagnostico() {
        // Verificar se o botão já existe
        if (document.getElementById('cedente-diagnostico-btn')) {
            return;
        }
        
        // Criar o botão
        const botao = document.createElement('button');
        botao.id = 'cedente-diagnostico-btn';
        botao.className = 'diagnostico-button';
        botao.innerHTML = '<i class="fas fa-stethoscope"></i> Diagnóstico de Cedentes';
        botao.title = 'Verificar mapeamento de cedentes para usuários';
        
        // Adicionar estilo ao botão
        botao.style.position = 'fixed';
        botao.style.bottom = '90px';
        botao.style.right = '10px';
        botao.style.padding = '5px 10px';
        botao.style.backgroundColor = '#4CAF50';
        botao.style.color = 'white';
        botao.style.border = 'none';
        botao.style.borderRadius = '4px';
        botao.style.cursor = 'pointer';
        botao.style.zIndex = '9999';
        
        // Adicionar evento de clique
        botao.addEventListener('click', function() {
            // Verificar se o mapeamento existe
            if (!verificarMapeamentoCedentes()) {
                alert('Erro: Mapeamento de cedentes não encontrado ou vazio. Verifique o console para mais detalhes.');
                return;
            }
            
            // Criar e mostrar a interface de diagnóstico
            const modal = criarInterfaceDiagnostico();
            modal.style.display = 'block';
            
            // Mostrar todos os cedentes inicialmente
            mostrarCedentesPorUsuario('todos');
        });
        
        // Adicionar o botão ao documento
        document.body.appendChild(botao);
    }
    
    // Função para corrigir o filtro de usuário
    function corrigirFiltroUsuario() {
        // Verificar se a função filtrarPropostas existe
        if (typeof window.filtrarPropostas !== 'function') {
            console.error("Função filtrarPropostas não encontrada");
            return;
        }
        
        // Fazer backup da função original
        const filtrarPropostasOriginal = window.filtrarPropostas;
        
        // Sobrescrever a função
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
                    
                    // Log para depuração
                    if (Math.random() < 0.01) { // Logar apenas 1% das verificações para não sobrecarregar o console
                        console.log(`Verificando cedente "${proposta.cedente}" para usuário "${usuarioFiltro}": ${passaFiltroUsuario ? 'PASSA' : 'NÃO PASSA'}`);
                    }
                }
                
                // Retornar true apenas se passar por todos os filtros
                return passaFiltroStatus && passaFiltroCedente && passaFiltroUsuario;
            });
        };
        
        console.log("Função filtrarPropostas corrigida para melhor diagnóstico");
    }
    
    // Inicializar quando o documento estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        // Esperar um pouco para garantir que o CedenteService esteja carregado
        setTimeout(function() {
            // Adicionar botão de diagnóstico
            adicionarBotaoDiagnostico();
            
            // Corrigir o filtro de usuário
            corrigirFiltroUsuario();
            
            console.log("Ferramenta de diagnóstico de cedentes inicializada");
        }, 3000);
    });
    
    // Expor funções para uso no console
    window.CedenteDiagnostico = {
        verificarMapeamento: verificarMapeamentoCedentes,
        testarFiltro: testarFiltroUsuario,
        mostrarInterface: function() {
            const modal = criarInterfaceDiagnostico();
            modal.style.display = 'block';
            mostrarCedentesPorUsuario('todos');
        }
    };
})();