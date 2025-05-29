const Hero = {
    // ... existing code ...

    // Promote a hero with animation
    promote: function(hero) {
        const cell = document.querySelector(`[data-x="${hero.x}"][data-y="${hero.y}"]`);
        if (!cell) return;

        // Add promotion animation class
        cell.classList.add('promoting');
        
        // Use paced timeout for promotion effect
        Battle.pacedTimeout(() => {
            // Update hero stats
            hero.level++;
            hero.maxHp += 2;
            hero.hp = hero.maxHp;
            hero.attack += 1;
            hero.defense += 1;
            
            // Remove promotion animation
            cell.classList.remove('promoting');
            
            // Show level up effect
            this._showLevelUpEffect(cell);
        }, 1000);
    },

    // Show level up effect
    _showLevelUpEffect: function(cell) {
        const effect = document.createElement('div');
        effect.className = 'level-up-effect';
        cell.appendChild(effect);
        
        // Use paced timeout for cleanup
        Battle.pacedTimeout(() => {
            effect.remove();
        }, 1000);
    }
    // ... existing code ...
};

window.Hero = Hero; 