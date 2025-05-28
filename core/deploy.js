/**
 * Deploy.js - Handles unit deployment phase
 */

const Deploy = {
    // Current selected unit type for deployment
    selectedUnitType: null,
    
    // Initialize the deployment phase
    initDeploymentPhase: function() {
        GameState.phase = 'deployment';
        
        // Set current player
        GameState.currentPlayer = 'Crown';
        
        // Update UI to show deployment phase
        document.getElementById('end-deployment').textContent = 'End Deployment';
        
        // Clear any existing units
        Board.clear();
        
        // Initialize unit selection UI
        this.initUnitSelectionUI();
        
        // Add initial message to battle log
        UI.battleLog.clear();
        UI.battleLog.addEntry(`<strong>Deployment Phase</strong>: ${GameState.currentPlayer} is deploying units.`);
        UI.battleLog.addEntry(`You have ${GameState.points[GameState.currentPlayer]} points to spend.`);
    },
    
    // Initialize unit selection UI
    initUnitSelectionUI: function() {
        const unitRoster = document.getElementById('unit-roster');
        const points = GameState.points[GameState.currentPlayer];
        unitRoster.innerHTML = `<h4>Select Units to Deploy</h4><div class="points-remaining">Points Remaining: <span id='points-remaining-value'>${points}</span></div>`;
        
        // Get units for current faction
        const factionUnits = Units.getUnitsByFaction(GameState.currentPlayer);
        
        // Track expanded card (for accordion behavior)
        let expandedIndex = null;
        
        // Create unit selection buttons
        factionUnits.forEach((unitType, idx) => {
            const unitButton = document.createElement('div');
            unitButton.className = 'unit-selection';
            unitButton.tabIndex = 0;
            
            // Get sprite path
            const spritePath = Renderer.assetPaths.units[GameState.currentPlayer][unitType.type];
            // Get special abilities
            const specialAbilities = Units.getUnitSpecialAbilities(GameState.currentPlayer, unitType.type);

            // Collapsed content (always shown)
            unitButton.innerHTML = `
                <div class="unit-icon ${GameState.currentPlayer.toLowerCase()}">
                    ${spritePath ? `<img src="${spritePath}" alt="${unitType.type}" class="unit-sprite">` : unitType.icon || unitType.type[0]}
                </div>
                <div class="unit-info">
                    <div class="unit-header-row">
                        <span class="unit-name">${unitType.type}</span>
                        <span class="unit-cost">Cost: ${unitType.cost} pts</span>
                        <button class="expand-toggle" aria-label="Show more info">&#x25BC;</button>
                    </div>
                    <div class="unit-details" style="display:none">
                        <div class="unit-stats">
                            HP: ${unitType.health} | ATK: ${unitType.attack} | DEF: ${unitType.defense || 0} | SPD: ${unitType.moveSpeed}
                        </div>
                        ${specialAbilities ? `
                            <div class="unit-special">
                                <span class="special-name">${specialAbilities.name}:</span>
                                <span class="special-desc">${specialAbilities.description}</span>
                            </div>
                        ` : ''}
                        <div class="unit-desc">${unitType.description}</div>
                    </div>
                </div>
            `;

            // Toggle expand/collapse for mobile (accordion style)
            const expandBtn = unitButton.querySelector('.expand-toggle');
            const detailsDiv = unitButton.querySelector('.unit-details');
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Collapse all others
                unitRoster.querySelectorAll('.unit-selection').forEach((el, i) => {
                    if (i !== idx) {
                        el.classList.remove('expanded');
                        el.querySelector('.unit-details').style.display = 'none';
                        el.querySelector('.expand-toggle').innerHTML = '&#x25BC;';
                    }
                });
                // Toggle this one
                const isExpanded = unitButton.classList.toggle('expanded');
                detailsDiv.style.display = isExpanded ? '' : 'none';
                expandBtn.innerHTML = isExpanded ? '&#x25B2;' : '&#x25BC;';
            });

            // Also allow clicking the card to select the unit
            unitButton.addEventListener('click', (e) => {
                // Only select if not clicking the expand button
                if (!e.target.classList.contains('expand-toggle')) {
                    this.selectUnitType(unitType);
                    document.querySelectorAll('.unit-selection').forEach(el => {
                        el.classList.remove('selected');
                    });
                    unitButton.classList.add('selected');
                }
            });

            unitRoster.appendChild(unitButton);
        });
    },
    
    // Select a unit type for deployment
    selectUnitType: function(unitType) {
        this.selectedUnitType = unitType;
        
        // Update battle log
        UI.battleLog.addEntry(`Selected ${unitType.type} for deployment (Cost: ${unitType.cost} pts)`);
    },
    
    // Place a unit on the board
    placeUnit: function(x, y) {
        // Check if a unit type is selected
        if (!this.selectedUnitType) {
            UI.battleLog.addEntry('Select a unit type first!', 'error');
            return false;
        }
        
        // Check if player has enough points
        if (GameState.points[GameState.currentPlayer] < this.selectedUnitType.cost) {
            UI.battleLog.addEntry(`Not enough points! You need ${this.selectedUnitType.cost} but have ${GameState.points[GameState.currentPlayer]}.`, 'error');
            return false;
        }
        
        // Create the unit
        const unit = Units.createUnit(
            this.selectedUnitType.type,
            GameState.currentPlayer,
            x, y
        );
        
        // Place unit on board
        if (Board.placeUnit(x, y, unit)) {
            // Deduct points
            GameState.points[GameState.currentPlayer] -= this.selectedUnitType.cost;
            
            // Add unit to game state
            GameState.addUnit(GameState.currentPlayer, unit);
            
            // Update battle log
            UI.battleLog.addEntry(`Deployed ${unit.type} at position (${x}, ${y}). ${GameState.points[GameState.currentPlayer]} points remaining.`);
            
            // Update points remaining in UI
            this.updatePointsRemaining();
            
            return true;
        }
        
        return false;
    },
    
    // End deployment phase for current player
    endDeployment: function() {
        console.log("Deploy.endDeployment called. Current game mode:", GameState.gameMode, "Current player:", GameState.currentPlayer);
        
        if (GameState.gameMode === 'local') {
            // Switch to other player for local 2-player
            if (GameState.currentPlayer === 'Crown') {
                console.log("Local 2-player: Switching to Horde player for deployment");
                GameState.currentPlayer = 'Horde';
                UI.battleLog.addEntry(`<strong>Deployment Phase</strong>: ${GameState.currentPlayer} is deploying units.`);
                UI.battleLog.addEntry(`You have ${GameState.points[GameState.currentPlayer]} points to spend.`);
                
                // Update unit selection UI for new faction
                this.initUnitSelectionUI();
                this.updatePointsRemaining();
            } else {
                console.log("Local 2-player: Both players deployed, starting battle phase");
                // Both players have deployed, start battle
                GameState.phase = 'battle';
                Battle.startBattle();
            }
        } else {
            console.log("Single player: AI deploying units");
            // For single player, AI deploys units
            this.aiDeploy();
            
            console.log("Single player: Starting battle phase");
            // Start battle
            GameState.phase = 'battle';
            Battle.startBattle();
            this.updatePointsRemaining();
        }
    },
    
    // AI deployment for single player mode
    aiDeploy: function() {
        GameState.currentPlayer = 'Horde';
        UI.battleLog.addEntry(`<strong>AI Deployment</strong>: ${GameState.currentPlayer} is deploying units.`);
        
        // Get units for AI faction
        const factionUnits = Units.getUnitsByFaction(GameState.currentPlayer);
        
        // Simple AI deployment strategy
        let pointsRemaining = GameState.points[GameState.currentPlayer];
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loops
        
        while (pointsRemaining > 0 && attempts < maxAttempts) {
            // Select random unit type weighted by cost
            const unitType = this.selectRandomUnitType(factionUnits, pointsRemaining);
            
            if (!unitType) break;
            
            // Select random position in top half of board
            const x = Math.floor(Math.random() * Board.config.size);
            const y = Math.floor(Math.random() * (Board.config.size / 2));
            
            // Create and place unit
            const unit = Units.createUnit(
                unitType.type,
                GameState.currentPlayer,
                x, y
            );
            
            if (Board.placeUnit(x, y, unit)) {
                // Deduct points
                pointsRemaining -= unitType.cost;
                GameState.points[GameState.currentPlayer] = pointsRemaining;
                
                // Add unit to game state
                GameState.addUnit(GameState.currentPlayer, unit);
                
                UI.battleLog.addEntry(`AI deployed ${unit.type} at position (${x}, ${y}).`);
            }
            
            attempts++;
        }
        
        UI.battleLog.addEntry(`AI deployment complete. ${pointsRemaining} points remaining.`);
        GameState.currentPlayer = 'Crown'; // Switch back to player
        this.updatePointsRemaining();
    },
    
    // Select random unit type weighted by cost
    selectRandomUnitType: function(unitTypes, maxCost) {
        // Filter units by cost
        const affordableUnits = unitTypes.filter(unit => unit.cost <= maxCost);
        
        if (affordableUnits.length === 0) {
            return null;
        }
        
        // Simple random selection
        return affordableUnits[Math.floor(Math.random() * affordableUnits.length)];
    },

    // Update unit roster during battle phase
    updateBattleRoster: function() {
        const unitRoster = document.getElementById('unit-roster');
        unitRoster.innerHTML = '<h4>Battle Units</h4>';
        
        // Get all units from both factions
        const allUnits = [...GameState.units.Crown, ...GameState.units.Horde];
        
        // Sort units by faction and then by type
        allUnits.sort((a, b) => {
            if (a.faction !== b.faction) {
                return a.faction === 'Crown' ? -1 : 1;
            }
            return a.type.localeCompare(b.type);
        });
        
        // Create unit elements (icon, name, health bar, and placeholder for effects)
        allUnits.forEach(unit => {
            const unitElement = document.createElement('div');
            unitElement.className = `battle-unit ${unit.faction.toLowerCase()}`;
            
            // Get sprite path
            const spritePath = Renderer.assetPaths.units[unit.faction][unit.type];
            // Calculate health percentage
            const healthPercent = (unit.health / unit.maxHealth) * 100;
            const healthColor = Renderer.getHealthBarColor(healthPercent/100);
            
            unitElement.innerHTML = `
                <div class="unit-header">
                    <div class="unit-icon ${unit.faction.toLowerCase()}">
                        ${spritePath ? `<img src="${spritePath}" alt="${unit.type}" class="unit-sprite">` : unit.icon || unit.type[0]}
                    </div>
                    <div class="unit-info">
                        <div class="unit-name">${unit.type} (${unit.faction})</div>
                        <!-- EFFECTS PLACEHOLDER: Add effect icons or text here if needed -->
                    </div>
                </div>
                <div class="health-bar-container">
                    <div class="health-bar" style="width: ${healthPercent}%; background-color: ${healthColor}"></div>
                </div>
                <div class="health-text">HP: ${unit.health}/${unit.maxHealth}</div>
            `;
            
            unitRoster.appendChild(unitElement);
        });
    },

    // Helper to update points remaining in the UI
    updatePointsRemaining: function() {
        const el = document.getElementById('points-remaining-value');
        if (el) el.textContent = GameState.points[GameState.currentPlayer];
    }
};
