const Attack = {
    // Helper to animate a projectile
    _animateProjectile: function(startCell, endCell, onComplete) {
        const projectile = document.createElement('div');
        projectile.className = 'projectile';
        startCell.appendChild(projectile);

        // Calculate path
        const startRect = startCell.getBoundingClientRect();
        const endRect = endCell.getBoundingClientRect();
        const startX = startRect.left + startRect.width / 2;
        const startY = startRect.top + startRect.height / 2;
        const endX = endRect.left + endRect.width / 2;
        const endY = endRect.top + endRect.height / 2;

        // Animate projectile
        projectile.style.left = startX + 'px';
        projectile.style.top = startY + 'px';
        
        // Use paced timeout for animation
        Battle.pacedTimeout(() => {
            projectile.style.left = endX + 'px';
            projectile.style.top = endY + 'px';
            
            // Use paced timeout for cleanup
            Battle.pacedTimeout(() => {
                projectile.remove();
                if (onComplete) onComplete();
            }, 100);
        }, 300);
    },

    // Helper to animate a melee attack
    _animateMelee: function(attackerCell, targetCell, onComplete) {
        const attacker = attackerCell.querySelector('.unit');
        if (!attacker) return;

        // Store original position
        const originalTransform = attacker.style.transform;
        
        // Calculate direction to target
        const attackerRect = attackerCell.getBoundingClientRect();
        const targetRect = targetCell.getBoundingClientRect();
        const dx = targetRect.left - attackerRect.left;
        const dy = targetRect.top - attackerRect.top;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const moveX = (dx / distance) * 20; // Move 20px towards target
        const moveY = (dy / distance) * 20;

        // Animate attack
        attacker.style.transform = `translate(${moveX}px, ${moveY}px)`;
        
        // Use paced timeout for return animation
        Battle.pacedTimeout(() => {
            attacker.style.transform = originalTransform;
            if (onComplete) onComplete();
        }, 200);
    },

    // Execute an attack with proper animations
    execute: function(attacker, target, onComplete) {
        const attackerCell = document.querySelector(`[data-x="${attacker.x}"][data-y="${attacker.y}"]`);
        const targetCell = document.querySelector(`[data-x="${target.x}"][data-y="${target.y}"]`);
        
        if (!attackerCell || !targetCell) {
            if (onComplete) onComplete();
            return;
        }

        // Choose animation based on attacker type
        if (attacker.range > 1) {
            this._animateProjectile(attackerCell, targetCell, onComplete);
        } else {
            this._animateMelee(attackerCell, targetCell, onComplete);
        }
    }
};

window.Attack = Attack; 