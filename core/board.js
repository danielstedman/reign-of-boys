/**
 * Board.js - Game board generation and management
 */

const Board = {
    // Board configuration
    config: {
        size: 16,
        cellSize: 32
    },
    
    // Board state
    cells: [],
    
    // Initialize the game board
    init: function() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';
        this.cells = [];
        
        // Create the 16x16 grid (but do NOT assign terrain yet)
        for (let y = 0; y < this.config.size; y++) {
            const row = [];
            for (let x = 0; x < this.config.size; x++) {
                // Create cell element
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                // Do NOT set terrain yet
                // Mark deployable cells
                if (y >= this.config.size / 2) {
                    cell.classList.add('deployable');
                    cell.dataset.faction = 'Crown';
                    cell.addEventListener('click', function() {
                        if (GameState.phase === 'deployment' && 
                            GameState.currentPlayer === 'Crown') {
                            Deploy.placeUnit(x, y);
                        }
                    });
                } else {
                    cell.dataset.faction = 'Horde';
                    if (GameState.gameMode === 'local') {
                        cell.classList.add('deployable');
                        cell.addEventListener('click', function() {
                            if (GameState.phase === 'deployment' && 
                                GameState.currentPlayer === 'Horde') {
                                Deploy.placeUnit(x, y);
                            }
                        });
                    }
                }
                boardElement.appendChild(cell);
                row.push({
                    element: cell,
                    x: x,
                    y: y,
                    terrain: null, // will be set after
                    unit: null
                });
            }
            this.cells.push(row);
        }
        // Now assign terrain for all cells
        for (let y = 0; y < this.config.size; y++) {
            for (let x = 0; x < this.config.size; x++) {
                this.setRandomTerrain(this.cells[y][x].element);
            }
        }
        // Initialize renderer if available
        if (typeof Renderer !== 'undefined') {
            Renderer.init();
        }
    },
    
    // Set random terrain type for a cell
    setRandomTerrain: function(cell) {
        const terrainTypes = ['grass', 'sand', 'dirt'];
        const weights = [0.6, 0.25, 0.15]; // More grass, then sand, then dirt
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);

        // Improved neighbor-biased clustering
        let neighborTerrain = null;
        if (x > 0 && y > 0) {
            neighborTerrain = Math.random() < 0.5 ? this.cells[y][x-1].terrain : this.cells[y-1][x].terrain;
        } else if (x > 0) {
            neighborTerrain = this.cells[y][x-1].terrain;
        } else if (y > 0) {
            neighborTerrain = this.cells[y-1][x].terrain;
        }

        let terrainType;
        if (neighborTerrain && Math.random() < 0.9) { // 90% chance to copy neighbor
            terrainType = neighborTerrain;
        } else {
            // Weighted random selection as before
            let random = Math.random();
            let cumulativeWeight = 0;
            for (let i = 0; i < terrainTypes.length; i++) {
                cumulativeWeight += weights[i];
                if (random <= cumulativeWeight) {
                    terrainType = terrainTypes[i];
                    break;
                }
            }
        }
        cell.classList.add(terrainType);
        cell.dataset.terrain = terrainType;
        // Use renderer for terrain if available
        if (typeof Renderer !== 'undefined') {
            Renderer.renderTerrain(cell, terrainType);
        }
    },
    
    // Place a unit on the board
    placeUnit: function(x, y, unit) {
        const cell = this.getCell(x, y);
        
        if (!cell || cell.unit) {
            return false;
        }
        
        // Store unit reference
        cell.unit = unit;
        unit.x = x;
        unit.y = y;
        
        // Use renderer if available
        if (typeof Renderer !== 'undefined') {
            Renderer.renderUnit(unit, cell.element);
        } else {
            // Fallback to basic rendering
            const unitElement = document.createElement('div');
            unitElement.className = `unit ${unit.faction.toLowerCase()}`;
            unitElement.textContent = unit.icon || unit.type[0];
            
            // Add health bar
            const healthBar = document.createElement('div');
            healthBar.className = 'health-bar';
            healthBar.style.width = `${(unit.health / unit.maxHealth) * 100}%`;
            unitElement.appendChild(healthBar);
            
            // Add unit to cell
            cell.element.appendChild(unitElement);
        }
        
        return true;
    },
    
    // Remove a unit from the board
    removeUnit: function(x, y) {
        const cell = this.getCell(x, y);
        
        if (!cell || !cell.unit) {
            return false;
        }
        
        // Remove unit element
        const unitElement = cell.element.querySelector('.unit');
        if (unitElement) {
            cell.element.removeChild(unitElement);
        }
        
        // Clear unit reference
        cell.unit = null;
        
        return true;
    },
    
    // Update unit display (e.g., after taking damage)
    updateUnit: function(x, y) {
        const cell = this.getCell(x, y);
        
        if (!cell || !cell.unit) {
            return false;
        }
        
        // Use renderer if available
        if (typeof Renderer !== 'undefined') {
            Renderer.renderUnit(cell.unit, cell.element);
        } else {
            // Fallback to basic health bar update
            const healthBar = cell.element.querySelector('.health-bar');
            if (healthBar) {
                healthBar.style.width = `${(cell.unit.health / cell.unit.maxHealth) * 100}%`;
            }
        }
        
        return true;
    },
    
    // Get cell at coordinates
    getCell: function(x, y) {
        if (x < 0 || x >= this.config.size || y < 0 || y >= this.config.size) {
            return null;
        }
        
        return this.cells[y][x];
    },
    
    // Clear the board
    clear: function() {
        this.cells.forEach(row => {
            row.forEach(cell => {
                if (cell.unit) {
                    this.removeUnit(cell.x, cell.y);
                }
            });
        });
    }
};
