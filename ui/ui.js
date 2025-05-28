/**
 * UI.js - DOM manipulation helpers and UI management
 */

// UI Management
const UI = {
    // Screen management
    screens: {
        welcome: document.getElementById('welcome-screen'),
        gameBoard: document.getElementById('game-board-screen')
    },
    
    // Show a specific screen and hide others
    showScreen: function(screenId) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        this.screens[screenId].classList.add('active');
    },
    
    // Battle log management
    battleLog: {
        container: document.getElementById('battle-log'),
        
        // Auto-scroll lock state
        _autoScroll: true,
        
        // Add entry to battle log with optional styling
        addEntry: function(text, type = 'normal') {
            const entry = document.createElement('div');
            entry.className = `log-entry log-${type}`;
            entry.innerHTML = text;
            this.container.appendChild(entry);
            setTimeout(() => {
                this.container.scrollTop = this.container.scrollHeight;
            }, 0);
            
            // Apply visual effects based on entry type
            switch(type) {
                case 'kill':
                    entry.style.color = '#ff3333';
                    entry.style.fontWeight = 'bold';
                    entry.style.borderLeft = '3px solid #ff3333';
                    break;
                case 'critical':
                    entry.style.color = '#ffcc00';
                    entry.style.fontWeight = 'bold';
                    entry.style.borderLeft = '3px solid #ffcc00';
                    break;
                case 'highlight':
                    entry.style.color = '#33ccff';
                    entry.style.fontWeight = 'bold';
                    entry.style.borderLeft = '3px solid #33ccff';
                    break;
                case 'spell':
                    entry.style.color = '#cc33ff';
                    entry.style.fontWeight = 'bold';
                    entry.style.borderLeft = '3px solid #cc33ff';
                    break;
                case 'heal':
                    entry.style.color = '#33ff99';
                    entry.style.fontWeight = 'bold';
                    entry.style.borderLeft = '3px solid #33ff99';
                    break;
                default:
                    entry.style.borderLeft = '3px solid #666';
            }
        },
        
        // Clear the battle log
        clear: function() {
            this.container.innerHTML = '';
            this._autoScroll = true;
        }
    },
    
    // Unit roster management
    unitRoster: {
        container: document.getElementById('unit-roster'),
        
        // Update the unit roster display
        update: function(units) {
            this.container.innerHTML = '';
            
            if (!units || units.length === 0) {
                const emptyMsg = document.createElement('div');
                emptyMsg.textContent = 'No units deployed';
                this.container.appendChild(emptyMsg);
                return;
            }
            
            units.forEach(unit => {
                const unitElement = document.createElement('div');
                unitElement.className = 'roster-unit';
                unitElement.innerHTML = `
                    <div class="unit-icon ${unit.faction.toLowerCase()}">${unit.icon || unit.type[0]}</div>
                    <div class="unit-info">
                        <div class="unit-name">${unit.type}</div>
                        <div class="unit-stats">HP: ${unit.health}/${unit.maxHealth} | ATK: ${unit.attack}</div>
                    </div>
                `;
                this.container.appendChild(unitElement);
            });
        }
    },
    
    // Initialize welcome screen animations
    initWelcomeAnimations: function() {
        const animationArea = document.querySelector('.animation-area');
        
        // Create blood drip animations
        for (let i = 0; i < 10; i++) {
            const drip = document.createElement('div');
            drip.className = 'blood-drip';
            drip.style.left = `${Math.random() * 100}%`;
            drip.style.animationDelay = `${Math.random() * 3}s`;
            animationArea.appendChild(drip);
        }
    }
};

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize welcome screen
    UI.showScreen('welcome');
    UI.initWelcomeAnimations();
    
    // NOTE: All button event listeners are now centralized in controls.js
    // No button event listeners should be registered here to avoid conflicts

    // Battle pacing controls
    const paceButtons = document.querySelectorAll('.pace-btn');
    function setPaceFromButton(btn) {
        paceButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const pace = btn.getAttribute('data-pace');
        if (pace === 'pause') {
            Battle.pause();
        } else {
            // Always resume, even if previously paused
            Battle.resume(parseFloat(pace));
            // If the game was paused, trigger the next action
            if (Battle.paceMultiplier > 0 && typeof Battle.turnOrder !== 'undefined' && Battle.turnOrder.length > 0) {
                // Try to continue the game loop if it was paused
                // Only call nextUnit if the game is in battle phase and not already running
                if (GameState.phase === 'battle') {
                    // This is a simple way to nudge the loop; adjust as needed for your game logic
                    Battle.nextUnit();
                }
            }
        }
    }
    paceButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            setPaceFromButton(this);
        });
    });
    // Set default to 1x
    const defaultBtn = document.querySelector('.pace-btn[data-pace="1"]');
    if (defaultBtn) setPaceFromButton(defaultBtn);

    // Auto-scroll lock state
    UI.battleLog._autoScroll = true;

    // Store previous pace multiplier for auto-pause/unpause
    let previousPaceMultiplier = 1;

    // Helper to show/hide the pause overlay
    function setPauseOverlay(visible) {
        const overlay = document.getElementById('pause-overlay');
        if (!overlay) return;
        overlay.style.display = visible ? 'flex' : 'none';
    }

    // Patch Battle.pause and Battle.resume to show/hide overlay
    if (typeof Battle !== 'undefined') {
        const origPause = Battle.pause;
        Battle.pause = function() {
            origPause.call(this);
            setPauseOverlay(true);
        };
        const origResume = Battle.resume;
        Battle.resume = function(multiplier = 1) {
            origResume.call(this, multiplier);
            setPauseOverlay(false);
        };
    }

    // Only handle scroll for pausing, not unpausing
    UI.battleLog.container.addEventListener('scroll', function() {
        const threshold = 40; // px from bottom
        const { scrollTop, scrollHeight, clientHeight } = UI.battleLog.container;
        const atBottom = (scrollHeight - clientHeight - scrollTop) < threshold;
        if (!atBottom) {
            if (typeof Battle !== 'undefined' && Battle.paceMultiplier !== 0) {
                previousPaceMultiplier = Battle.paceMultiplier;
                Battle.pause();
            }
            setPauseOverlay(true);
        }
    });
});
