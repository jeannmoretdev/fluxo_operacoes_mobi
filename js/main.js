// Função para alternar entre os temas de cores
function configurarAlternadorTema() {
    const botaoTema = document.getElementById('theme-toggle');
    if (!botaoTema) {
        console.warn('Botão de tema não encontrado');
        return;
    }
    
    console.log('Configurando alternador de tema');
    
    // Verificar se há uma preferência salva
    const temaSalvo = localStorage.getItem('tema-cores');
    if (temaSalvo === 'solido') {
        document.body.classList.add('tema-solido');
        botaoTema.querySelector('span').textContent = 'Cores Vibrantes';
    }
    
    botaoTema.addEventListener('click', function() {
        // Alternar a classe no body
        document.body.classList.toggle('tema-solido');
        
        // Atualizar o texto do botão
        const novoTexto = document.body.classList.contains('tema-solido') ? 'Cores Vibrantes' : 'Cores Suaves';
        this.querySelector('span').textContent = novoTexto;
        
        // Salvar a preferência
        const temaAtual = document.body.classList.contains('tema-solido') ? 'solido' : 'suave';
        localStorage.setItem('tema-cores', temaAtual);
        
        console.log('Tema alterado para:', temaAtual);
    });
}

// Função para verificar se a biblioteca jsPDF está carregada
function verificarDependencias() {
    if (typeof window.jspdf === 'undefined') {
        console.error('Biblioteca jsPDF não encontrada. Alguns recursos de relatório podem não funcionar.');
        // Tentar carregar a biblioteca novamente
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = function() {
            console.log('jsPDF carregado com sucesso.');
        };
        script.onerror = function() {
            console.error('Falha ao carregar jsPDF.');
        };
        document.head.appendChild(script);
    } else {
        console.log('jsPDF encontrado e pronto para uso.');
    }
}

// Função para inicializar a aplicação
async function inicializarApp() {
    console.log('Inicializando aplicação...');
    
    // Verificar dependências
    verificarDependencias();
    
    // Configurar todos os event listeners
    configurarEventListenersFiltros();
    configurarEventListenersAtualizacao();
    configurarEventListenersDatas();
    configurarOrdenacaoPorCabecalho();
    
    // Configurar o modo TV
    if (typeof configurarModoTV === 'function') {
        configurarModoTV();
    } else {
        console.warn('Função configurarModoTV não encontrada');
    }
    
    // Configurar o alternador de tema
    configurarAlternadorTema();
    
    // Atualizar labels das metas LOGO NO INÍCIO
    setTimeout(() => {
        if (typeof atualizarLabelsMetas === 'function') {
            atualizarLabelsMetas();
            console.log('Labels das metas atualizados na inicialização');
        } else {
            console.error('Função atualizarLabelsMetas não encontrada');
        }
        
        if (typeof atualizarLabelBorderos === 'function') {
            atualizarLabelBorderos();
            console.log('Label dos borderôs atualizado na inicialização');
        } else {
            console.error('Função atualizarLabelBorderos não encontrada');
        }
    }, 100);
    
    // Definir intervalo inicial (hoje)
    definirIntervaloRelativo(0);
    
    // Definir estado inicial da ordenação
    definirEstadoInicialOrdenacao();
    
    // Iniciar atualização automática
    iniciarAtualizacaoAutomatica();
    
    // Inicializar o serviço de cedentes
    try {
        if (window.CedenteService && typeof CedenteService.buscarDadosCedentesUsuarios === 'function') {
            await CedenteService.buscarDadosCedentesUsuarios();
            console.log("Serviço de cedentes inicializado com sucesso");
        }
    } catch (error) {
        console.error("Erro ao inicializar serviço de cedentes:", error);
    }
    
    // Aguardar um pouco para garantir que os dados foram carregados
    setTimeout(() => {
        if (typeof calcularSomaValoresAprovados === 'function') {
            calcularSomaValoresAprovados();
        }
        
        // Chamar novamente para garantir que os labels estão atualizados
        if (typeof atualizarLabelsMetas === 'function') {
            atualizarLabelsMetas();
        }
        
        if (typeof atualizarLabelBorderos === 'function') {
            atualizarLabelBorderos();
        }
    }, 2000); // Aguardar 2 segundos após a inicialização
    
    console.log('Aplicação inicializada');
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarApp);