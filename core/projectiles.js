/**
 * Projectiles.js - Handles projectile animations and effects
 */

const Projectiles = {
    // Directional arrow sprites mapping
    arrowDirections: {
        '0,-1': 'arrow0',  // Up
        '1,-1': 'arrow1',  // Up-Right
        '1,0': 'arrow2',   // Right
        '1,1': 'arrow3',   // Down-Right
        '0,1': 'arrow4',   // Down
        '-1,1': 'arrow5',  // Down-Left
        '-1,0': 'arrow6',  // Left
        '-1,-1': 'arrow7'  // Up-Left
    },

    // Calculate direction between two points
    calculateDirection: function(x1, y1, x2, y2) {
        const dx = Math.sign(x2 - x1);
        const dy = Math.sign(y2 - y1);
        return `${dx},${dy}`;
    },

    // Get the appropriate arrow sprite for a direction
    getArrowSprite: function(direction) {
        return this.arrowDirections[direction] || 'arrow0';
    },

    // Animate a projectile from source to target
    animateProjectile: function(attacker, defender, sprite) {
        // Create projectile element
        const projectile = document.createElement('div');
        projectile.className = 'projectile';
        
        // Calculate direction
        const direction = this.calculateDirection(attacker.x, attacker.y, defender.x, defender.y);
        const arrowSprite = this.getArrowSprite(direction);
        
        // Get sprite path
        const spritePath = Renderer.assetPaths.effects[arrowSprite];
        
        if (spritePath) {
            projectile.style.backgroundImage = `url('${spritePath}')`;
            projectile.style.backgroundSize = 'contain';
            projectile.style.backgroundPosition = 'center';
            projectile.style.backgroundRepeat = 'no-repeat';
        }
        
        // Get start and end positions
        const attackerCell = document.querySelector(`.cell[data-x="${attacker.x}"][data-y="${attacker.y}"]`);
        const defenderCell = document.querySelector(`.cell[data-x="${defender.x}"][data-y="${defender.y}"]`);
        
        if (attackerCell && defenderCell) {
            const attackerRect = attackerCell.getBoundingClientRect();
            const defenderRect = defenderCell.getBoundingClientRect();
            
            const startX = attackerRect.left + attackerRect.width / 2;
            const startY = attackerRect.top + attackerRect.height / 2;
            const endX = defenderRect.left + defenderRect.width / 2;
            const endY = defenderRect.top + defenderRect.height / 2;
            
            // Position projectile
            projectile.style.position = 'absolute';
            projectile.style.left = `${startX}px`;
            projectile.style.top = `${startY}px`;
            projectile.style.width = '20px';
            projectile.style.height = '20px';
            projectile.style.zIndex = '1000';
            
            // Add to document
            document.body.appendChild(projectile);
            
            // Animate projectile
            const duration = 300; // ms - reduced from 500ms for faster arrows
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const currentX = startX + (endX - startX) * progress;
                const currentY = startY + (endY - startY) * progress;
                
                projectile.style.left = `${currentX}px`;
                projectile.style.top = `${currentY}px`;
                
                // Calculate angle for rotation
                const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
                projectile.style.transform = `rotate(${angle}deg)`;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Remove projectile after animation
                    setTimeout(() => {
                        document.body.removeChild(projectile);
                    }, 100);
                }
            };
            
            requestAnimationFrame(animate);
        }
    },

    // Animate a spell (magic or fireball) from source to target
    animateSpell: function(attacker, defender, sprite) {
        // Create spell element
        const spell = document.createElement('div');
        spell.className = 'spell-projectile';
        // Get sprite path
        const spritePath = Renderer.assetPaths.effects[sprite];
        if (spritePath) {
            spell.style.backgroundImage = `url('${spritePath}')`;
            spell.style.backgroundSize = 'contain';
            spell.style.backgroundPosition = 'center';
            spell.style.backgroundRepeat = 'no-repeat';
        }
        // Get start and end positions
        const attackerCell = document.querySelector(`.cell[data-x="${attacker.x}"][data-y="${attacker.y}"]`);
        const defenderCell = document.querySelector(`.cell[data-x="${defender.x}"][data-y="${defender.y}"]`);
        if (attackerCell && defenderCell) {
            const attackerRect = attackerCell.getBoundingClientRect();
            const defenderRect = defenderCell.getBoundingClientRect();
            const startX = attackerRect.left + attackerRect.width / 2;
            const startY = attackerRect.top + attackerRect.height / 2;
            const endX = defenderRect.left + defenderRect.width / 2;
            const endY = defenderRect.top + defenderRect.height / 2;
            // Position spell
            spell.style.position = 'absolute';
            spell.style.left = `${startX - 32}px`;
            spell.style.top = `${startY - 32}px`;
            spell.style.width = '64px';
            spell.style.height = '64px';
            spell.style.zIndex = '1000';
            document.body.appendChild(spell);
            // Animate spell
            const duration = 400; // ms
            const startTime = performance.now();
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const currentX = startX + (endX - startX) * progress - 32;
                const currentY = startY + (endY - startY) * progress - 32;
                spell.style.left = `${currentX}px`;
                spell.style.top = `${currentY}px`;
                // Calculate angle for rotation
                const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
                spell.style.transform = `rotate(${angle}deg)`;
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setTimeout(() => {
                        document.body.removeChild(spell);
                    }, 100);
                }
            };
            requestAnimationFrame(animate);
        }
    },

    // Animate splash effect on multiple squares
    animateSplash: function(positions, sprite) {
        const splashElements = [];
        positions.forEach(pos => {
            const cell = document.querySelector(`.cell[data-x="${pos.x}"][data-y="${pos.y}"]`);
            if (cell) {
                const splash = document.createElement('div');
                splash.className = 'splash-effect';
                const spritePath = Renderer.assetPaths.effects[sprite];
                if (spritePath) {
                    splash.style.backgroundImage = `url('${spritePath}')`;
                    splash.style.backgroundSize = 'contain';
                    splash.style.backgroundPosition = 'center';
                    splash.style.backgroundRepeat = 'no-repeat';
                }
                splash.style.position = 'absolute';
                splash.style.left = '0';
                splash.style.top = '0';
                splash.style.width = '32px';
                splash.style.height = '32px';
                splash.style.zIndex = '1200';
                splash.style.pointerEvents = 'none';
                cell.appendChild(splash);
                splashElements.push(splash);
            }
        });
        // Fade out and remove after 250ms
        setTimeout(() => {
            splashElements.forEach(splash => {
                splash.classList.add('splash-fade');
                setTimeout(() => {
                    if (splash.parentNode) splash.parentNode.removeChild(splash);
                }, 200);
            });
        }, 200);
    },

    // Animate a small, fast, glowing dot from source to target
    animateDotProjectile: function(attacker, defender, callback) {
        const dot = document.createElement('div');
        dot.className = 'dot-projectile';
        // Get start and end positions
        const attackerCell = document.querySelector(`.cell[data-x="${attacker.x}"][data-y="${attacker.y}"]`);
        const defenderCell = document.querySelector(`.cell[data-x="${defender.x}"][data-y="${defender.y}"]`);
        if (attackerCell && defenderCell) {
            const attackerRect = attackerCell.getBoundingClientRect();
            const defenderRect = defenderCell.getBoundingClientRect();
            const startX = attackerRect.left + attackerRect.width / 2 - 6;
            const startY = attackerRect.top + attackerRect.height / 2 - 6;
            const endX = defenderRect.left + defenderRect.width / 2 - 6;
            const endY = defenderRect.top + defenderRect.height / 2 - 6;
            dot.style.position = 'absolute';
            dot.style.left = `${startX}px`;
            dot.style.top = `${startY}px`;
            dot.style.width = '12px';
            dot.style.height = '12px';
            dot.style.zIndex = '1100';
            document.body.appendChild(dot);
            // Animate dot
            const duration = 120; // ms, very fast
            const startTime = performance.now();
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const currentX = startX + (endX - startX) * progress;
                const currentY = startY + (endY - startY) * progress;
                dot.style.left = `${currentX}px`;
                dot.style.top = `${currentY}px`;
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setTimeout(() => {
                        if (dot.parentNode) dot.parentNode.removeChild(dot);
                        if (typeof callback === 'function') callback();
                    }, 20);
                }
            };
            requestAnimationFrame(animate);
        } else {
            if (typeof callback === 'function') callback();
        }
    }
}; 