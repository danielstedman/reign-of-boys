/**
 * Effects.js - Animations and visual effects
 */

const Effects = {
    // Initialize effects
    init: function() {
        // Set up any global effect listeners
        this.setupBloodEffects();
    },
    
    // Set up blood drip effects for welcome screen
    setupBloodEffects: function() {
        const animationArea = document.querySelector('.animation-area');
        if (!animationArea) return;
        
        // Clear existing effects
        animationArea.innerHTML = '';
        
        // Create blood drip animations
        for (let i = 0; i < 10; i++) {
            const drip = document.createElement('div');
            drip.className = 'blood-drip';
            drip.style.left = `${Math.random() * 100}%`;
            drip.style.animationDelay = `${Math.random() * 3}s`;
            animationArea.appendChild(drip);
        }
    },
    
    // Show attack animation
    showAttackEffect: function(sourceX, sourceY, targetX, targetY) {
        const sourceCell = document.querySelector(`.cell[data-x="${sourceX}"][data-y="${sourceY}"]`);
        const targetCell = document.querySelector(`.cell[data-x="${targetX}"][data-y="${targetY}"]`);
        
        if (!sourceCell || !targetCell) return;
        
        // Create attack line
        const line = document.createElement('div');
        line.className = 'attack-line';
        document.body.appendChild(line);
        
        // Calculate positions
        const sourceRect = sourceCell.getBoundingClientRect();
        const targetRect = targetCell.getBoundingClientRect();
        
        const sourceCenter = {
            x: sourceRect.left + sourceRect.width / 2,
            y: sourceRect.top + sourceRect.height / 2
        };
        
        const targetCenter = {
            x: targetRect.left + targetRect.width / 2,
            y: targetRect.top + targetRect.height / 2
        };
        
        // Position and rotate line
        const dx = targetCenter.x - sourceCenter.x;
        const dy = targetCenter.y - sourceCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        line.style.width = `${distance}px`;
        line.style.left = `${sourceCenter.x}px`;
        line.style.top = `${sourceCenter.y}px`;
        line.style.transform = `rotate(${angle}deg)`;
        
        // Animate and remove
        setTimeout(() => {
            line.remove();
        }, 300);
    },
    
    // Show damage effect on a cell
    showDamageEffect: function(x, y, amount) {
        const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        if (!cell) return;
        
        // Create damage number
        const damage = document.createElement('div');
        damage.className = 'damage-number';
        damage.textContent = amount;
        cell.appendChild(damage);
        
        // Animate and remove
        setTimeout(() => {
            damage.classList.add('fade-out');
            setTimeout(() => {
                damage.remove();
            }, 500);
        }, 500);
    },
    
    // Show hero promotion effect
    showHeroEffect: function(x, y) {
        const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        if (!cell) return;
        
        // Create hero effect
        const heroEffect = document.createElement('div');
        heroEffect.className = 'hero-effect';
        cell.appendChild(heroEffect);
        
        // Animate and remove
        setTimeout(() => {
            heroEffect.remove();
        }, 1000);
    },
    
    // Highlight a cell
    highlightCell: function(x, y, type = 'select') {
        const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        if (!cell) return;
        
        // Add highlight class
        cell.classList.add(`highlight-${type}`);
        
        // Return function to remove highlight
        return function() {
            cell.classList.remove(`highlight-${type}`);
        };
    }
};

// Initialize effects when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    Effects.init();
});
