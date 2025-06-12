// NOVA FUNÇÃO para configurar event listeners da tabela
function configurarEventListenersTabela() {
    console.log('Configurando event listeners da tabela...');
    
    // Event listeners para células de cedente (observações)
    document.querySelectorAll('.cedente-cell.has-observations').forEach(cell => {
        // Remover event listeners existentes para evitar duplicação
        cell.replaceWith(cell.cloneNode(true));
        
        // Pegar a nova referência após o clone
        const newCell = document.querySelector(`.cedente-cell[data-proposta-id="${cell.dataset.propostaId}"]`);
        
        if (newCell) {
            newCell.style.cursor = 'pointer';
            newCell.title = 'Clique para ver as observações';
            
            newCell.addEventListener('click', (e) => {
                e.stopPropagation();
                const propostaId = newCell.dataset.propostaId;
                const proposta = APP_STATE.propostas.find(p => p.id === propostaId);
                
                if (proposta) {
                    console.log('Clicou na célula do cedente:', proposta.cedente);
                    // VERIFICAR SE A FUNÇÃO EXISTE ANTES DE CHAMAR
                    if (typeof mostrarObservacoes === 'function') {
                        mostrarObservacoes(proposta);
                    } else {
                        console.error('Função mostrarObservacoes não encontrada');
                    }
                } else {
                    console.error('Proposta não encontrada:', propostaId);
                }
            });
        }
    });
    
    // Event listeners para células de status (histórico)
    document.querySelectorAll('.status-cell').forEach(cell => {
        // Remover event listeners existentes para evitar duplicação
        cell.replaceWith(cell.cloneNode(true));
        
        // Pegar a nova referência após o clone
        const newCell = document.querySelector(`.status-cell[data-proposta-id="${cell.dataset.propostaId}"]`);
        
        if (newCell) {
            newCell.style.cursor = 'pointer';
            newCell.title = 'Clique para ver o histórico de status';
            
            newCell.addEventListener('click', (e) => {
                e.stopPropagation();
                const propostaId = newCell.dataset.propostaId;
                const proposta = APP_STATE.propostas.find(p => p.id === propostaId);
                
                if (proposta) {
                    console.log('Clicou na célula de status:', proposta.statusSimplificado);
                    // VERIFICAR SE A FUNÇÃO EXISTE ANTES DE CHAMAR
                    if (typeof mostrarHistoricoStatus === 'function') {
                        mostrarHistoricoStatus(proposta);
                    } else {
                        console.error('Função mostrarHistoricoStatus não encontrada');
                    }
                } else {
                    console.error('Proposta não encontrada:', propostaId);
                }
            });
        }
    });
    
    console.log('Event listeners da tabela configurados.');
}

// Função para ajustar o cabeçalho da tabela no modo TV - com tooltip explicativo
function ajustarCabecalhoTabelaModoTV() {
    const thead = document.querySelector('#propostas-table thead');
    if (!thead) {
        console.error('Cabeçalho da tabela não encontrado');
        return;
    }
    
    const headerRow = thead.querySelector('tr');
    if (!headerRow) {
        console.error('Linha do cabeçalho não encontrada');
        return;
    }
    
    // Verificar se já está no formato do modo TV
    if (headerRow.classList.contains('tv-mode-header-row')) {
        console.log('Cabeçalho já está no formato do modo TV');
        return;
    }
    
    // Salvar o cabeçalho original se ainda não foi salvo
    if (!thead.getAttribute('data-original-html')) {
        thead.setAttribute('data-original-html', thead.innerHTML);
    }
    
    // Criar um novo cabeçalho para o modo TV com tooltip explicativo
    const newHeaderHTML = `
        <tr class="tv-mode-header-row">
            <th class="sortable text-center" data-sort="tempo_total">Tempo Total<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="hora_entrada">ENTRADA GER<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="numero">Nº<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="cedente">Cedente<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="analise">ANALISTA AUTO<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="pendencia">PENDÊNCIA<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="checagem">CHECAGEM<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="certificacao" title="Tempo desde a última etapa (Pendência ou Análise) até a Certificação">QCERT.<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="pagamento">PAGO<span class="sort-icon"></span></th>
            <th class="sortable text-center" data-sort="status">Status<span class="sort-icon"></span></th>
        </tr>
    `;
    
    thead.innerHTML = newHeaderHTML;
    
    // Reconfigurar a ordenação por clique nos cabeçalhos
    if (typeof configurarOrdenacaoPorCabecalho === 'function') {
        configurarOrdenacaoPorCabecalho();
    }
    
    console.log('Cabeçalho da tabela ajustado para o modo TV');
}

// Função para restaurar o cabeçalho original da tabela
function restaurarCabecalhoTabelaOriginal() {
    const thead = document.querySelector('#propostas-table thead');
    if (!thead) {
        console.error('Cabeçalho da tabela não encontrado');
        return;
    }
    
    // Restaurar o cabeçalho original se foi salvo
    const originalHTML = thead.getAttribute('data-original-html');
    if (originalHTML) {
        thead.innerHTML = originalHTML;
        
        // Reconfigurar a ordenação por clique nos cabeçalhos
        if (typeof configurarOrdenacaoPorCabecalho === 'function') {
            configurarOrdenacaoPorCabecalho();
        }
        
        console.log('Cabeçalho da tabela restaurado para o modo normal');
    }
}

// Função separada para alternar o modo TV (facilita a remoção do event listener)
function alternarModoTV() {
    console.log('Botão de modo TV clicado');
    document.body.classList.toggle('tv-mode');
    
    // Atualizar o texto do botão
    const botaoTV = document.getElementById('tv-mode-toggle');
    if (document.body.classList.contains('tv-mode')) {
        botaoTV.innerHTML = '<i class="fas fa-desktop"></i> Modo Normal';
    } else {
        botaoTV.innerHTML = '<i class="fas fa-tv"></i> Modo TV';
    }
    
    // Salvar a preferência
    const novoEstado = document.body.classList.contains('tv-mode') ? 'ativo' : 'inativo';
    localStorage.setItem('modo-tv', novoEstado);
    
    // Forçar um redimensionamento da tabela
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 100);
}

// Garantir que a função seja chamada quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', configurarModoTV);
} else {
    configurarModoTV();
}

// Função para configurar modo TV
function configurarModoTV() {
    console.log('Configurando modo TV...');
    
    // Verificar se o modo TV estava ativo
    const modoTVSalvo = localStorage.getItem('modo-tv');
    if (modoTVSalvo === 'ativo') {
        console.log('Ativando modo TV salvo');
        document.body.classList.add('tv-mode');
        
        // Aguardar um pouco para garantir que a tabela foi renderizada
        setTimeout(() => {
            ajustarCabecalhoTabelaModoTV();
        }, 100);
    }
    
    // Configurar o botão de alternância
    const botaoTV = document.getElementById('tv-mode-toggle');
    if (botaoTV) {
        // Remover event listeners existentes
        const novoBotao = botaoTV.cloneNode(true);
        botaoTV.parentNode.replaceChild(novoBotao, botaoTV);
        
        // Adicionar novo event listener
        novoBotao.addEventListener('click', alternarModoTV);
        
        // Atualizar o texto do botão
        if (document.body.classList.contains('tv-mode')) {
            novoBotao.innerHTML = '<i class="fas fa-desktop"></i> Modo Normal';
        } else {
            novoBotao.innerHTML = '<i class="fas fa-tv"></i> Modo TV';
        }
    }
    
    console.log('Modo TV configurado');
}