// Gerenciador de tooltips de detalhes de tempo
class TempoTooltipManager {
    constructor() {
        this.tooltipAtivo = null;
        this.inicializar();
    }
    
    inicializar() {
        // Adicionar event listener para cliques em tempos com desconto
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tempo-com-desconto')) {
                e.preventDefault();
                e.stopPropagation();
                this.mostrarTooltip(e.target, e);
            } else if (!e.target.closest('.tempo-details-tooltip')) {
                this.fecharTooltip();
            }
        });
        
        // Fechar tooltip com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.fecharTooltip();
            }
        });
    }
    
    mostrarTooltip(elemento, evento) {
        // Fechar tooltip existente
        this.fecharTooltip();
        
        const tempoOriginal = parseInt(elemento.dataset.tempoOriginal);
        const tempoAjustado = parseInt(elemento.dataset.tempoAjustado);
        const desconto = tempoOriginal - tempoAjustado;
        
        // Criar tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tempo-details-tooltip';
        tooltip.innerHTML = this.criarConteudoTooltip(tempoOriginal, tempoAjustado, desconto);
        
        // Adicionar ao DOM
        document.body.appendChild(tooltip);
        
        // Posicionar tooltip
        this.posicionarTooltip(tooltip, evento);
        
        // Adicionar event listener para fechar
        const closeBtn = tooltip.querySelector('.tempo-details-tooltip-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.fecharTooltip());
        }
        
        this.tooltipAtivo = tooltip;
    }
    
    criarConteudoTooltip(tempoOriginal, tempoAjustado, desconto) {
        return `
            <div class="tempo-details-tooltip-header">
                <div class="tempo-details-tooltip-title">⏰ Ajuste de Tempo</div>
                <button class="tempo-details-tooltip-close">&times;</button>
            </div>
            <div class="tempo-details-content">
                <div class="tempo-detail-row">
                    <span class="tempo-detail-label">⏱️ Tempo Calculado:</span>
                    <span class="tempo-detail-value">${this.formatarTempo(tempoOriginal)}</span>
                </div>
                <div class="tempo-detail-row">
                    <span class="tempo-detail-label">✅ Tempo Ajustado:</span>
                    <span class="tempo-detail-value">${this.formatarTempo(tempoAjustado)}</span>
                </div>
                <div class="tempo-detail-desconto">
                    <div class="tempo-detail-row">
                        <span class="tempo-detail-label">🍽️ Desconto Aplicado:</span>
                        <span class="tempo-detail-value">-${this.formatarTempo(desconto)}</span>
                    </div>
                    <div class="tempo-detail-info">
                        Horário de almoço: 12:00 às 13:30<br>
                        <strong>Desconto máximo por proposta: 1 hora</strong><br>
                        <small>O desconto é aplicado proporcionalmente entre as etapas</small>
                    </div>
                </div>
            </div>
        `;
    }
    
    formatarTempo(minutos) {
        if (!minutos || minutos === 0) return '0 min';
        
        if (minutos < 60) {
            return `${minutos} min`;
        } else {
            const horas = Math.floor(minutos / 60);
            const min = minutos % 60;
            return min > 0 ? `${horas}h ${min}min` : `${horas}h`;
        }
    }
    
    posicionarTooltip(tooltip, evento) {
        // Obter dimensões
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Posição inicial baseada no clique
        let top = evento.clientY + 10;
        let left = evento.clientX - (tooltipRect.width / 2);
        
        // Verificar se sai da tela na parte inferior
        if (top + tooltipRect.height > viewportHeight) {
            top = evento.clientY - tooltipRect.height - 10;
        }
        
        // Verificar se sai da tela à direita
        if (left + tooltipRect.width > viewportWidth) {
            left = viewportWidth - tooltipRect.width - 10;
        }
        
        // Verificar se sai da tela à esquerda
        if (left < 0) {
            left = 10;
        }
        
        // Verificar se sai da tela no topo
        if (top < 0) {
            top = 10;
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }
    
    fecharTooltip() {
        if (this.tooltipAtivo) {
            this.tooltipAtivo.remove();
            this.tooltipAtivo = null;
        }
    }
}

// Inicializar o gerenciador quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.tempoTooltipManager = new TempoTooltipManager();
});