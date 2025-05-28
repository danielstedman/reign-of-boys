/**
 * Battle.js - Battle simulation logic
 */

const Battle = {
    // Battle configuration
    turnOrder: [],
    currentUnitIndex: 0,
    
    // Battle pacing multiplier (1 = normal, 0 = paused, <1 = faster)
    paceMultiplier: 1,
    _pausedTimeouts: [],

    // Battle ended flag
    ended: false,

    setPace: function(multiplier) {
        this.paceMultiplier = multiplier;
    },
    getPace: function() {
        return this.paceMultiplier;
    },
    pause: function() {
        this.paceMultiplier = 0;
    },
    resume: function(multiplier = 1) {
        this.paceMultiplier = multiplier;
    },
    
    // Battle statistics
    stats: {
        turns: 0,
        damageDealt: { Crown: 0, Horde: 0 },
        unitsKilled: { Crown: 0, Horde: 0 },
        criticalHits: { Crown: 0, Horde: 0 },
        movesExecuted: { Crown: 0, Horde: 0 }
    },
    
    // Start the battle phase
    startBattle: function() {
        console.log("Battle.startBattle called. Starting battle phase.");
        
        // Update UI
        document.getElementById('end-deployment').textContent = 'Next Turn';
        
        // Set game phase
        GameState.phase = 'battle';
        GameState.turn = 1;
        
        // Reset battle statistics
        this.resetStats();
        
        // Clear battle log and add battle start message
        UI.battleLog.clear();
        UI.battleLog.addEntry('<strong>Battle Phase Begins!</strong>', 'highlight');
        
        // Update unit roster to show battle units
        Deploy.updateBattleRoster();
        
        // Determine turn order (all units from both factions)
        this.determineTurnOrder();
        
        // Start first turn
        this.ended = false;
        this.executeTurn();
    },
    
    // Reset battle statistics
    resetStats: function() {
        this.stats = {
            turns: 0,
            damageDealt: { Crown: 0, Horde: 0 },
            unitsKilled: { Crown: 0, Horde: 0 },
            criticalHits: { Crown: 0, Horde: 0 },
            movesExecuted: { Crown: 0, Horde: 0 }
        };
    },
    
    // Determine turn order based on unit speed
    determineTurnOrder: function() {
        // Get all units
        const allUnits = GameState.getAllUnits();
        
        // Group units by move speed
        const speedGroups = {};
        allUnits.forEach(unit => {
            if (!speedGroups[unit.moveSpeed]) {
                speedGroups[unit.moveSpeed] = {
                    Crown: [],
                    Horde: []
                };
            }
            speedGroups[unit.moveSpeed][unit.faction].push(unit);
        });
        
        // Combine groups in order of move speed (highest to lowest)
        this.turnOrder = [];
        const speeds = Object.keys(speedGroups).map(Number).sort((a, b) => b - a);
        
        speeds.forEach(speed => {
            const group = speedGroups[speed];
            // Alternate between Crown and Horde units
            const maxLength = Math.max(group.Crown.length, group.Horde.length);
            for (let i = 0; i < maxLength; i++) {
                if (i < group.Crown.length) {
                    this.turnOrder.push(group.Crown[i]);
                }
                if (i < group.Horde.length) {
                    this.turnOrder.push(group.Horde[i]);
                }
            }
        });
        
        this.currentUnitIndex = 0;
        
        // Log turn order for debugging
        console.log('Turn order:', this.turnOrder.map(u => `${u.faction} ${u.type} (${u.moveSpeed} moves)`));
    },
    
    // Execute a unit's turn
    executeTurn: function() {
        if (this.ended) return;
        // Get current unit
        const currentUnit = this.turnOrder[this.currentUnitIndex];
        
        // Update unit roster to reflect any health changes
        Deploy.updateBattleRoster();
        
        // Check for victory
        const victor = GameState.checkVictory();
        if (victor) {
            this.endBattle(victor);
            return;
        }
        
        // Skip dead units
        if (!currentUnit || currentUnit.health <= 0) {
            this.nextUnit();
            return;
        }
        
        // Execute AI for unit with appropriate pacing
        this.pacedTimeout(() => {
            this.executeUnitAI(currentUnit);
        }, Pacing.battle.turnTransitionDelay);
    },
    
    // Move to next unit in turn order
    nextUnit: function() {
        if (this.ended) return;
        this.currentUnitIndex = (this.currentUnitIndex + 1) % this.turnOrder.length;
        
        // If we've gone through all units, start a new turn
        if (this.currentUnitIndex === 0) {
            GameState.turn++;
            this.stats.turns++;
        }
        
        // Execute next turn with a slight delay
        this.pacedTimeout(() => {
            this.executeTurn();
        }, Pacing.battle.turnTransitionDelay);
    },
    
    // Execute AI for a unit
    executeUnitAI: function(unit) {
        if (this.ended) return;
        // Find target
        const target = this.findTarget(unit);
        
        if (target) {
            // Check if target is in range
            const distance = this.calculateDistance(unit, target);
            
            if (distance <= unit.range) {
                // Attack target
                this.executeAttack(unit, target);
            } else {
                // Move toward target
                this.moveTowardTarget(unit, target);
            }
        } else {
            UI.battleLog.addEntry(`${unit.faction}'s ${unit.type} has no targets in sight.`);
            // Move to next unit after a short delay
            this.pacedTimeout(() => {
                this.nextUnit();
            }, Pacing.battle.movementDelay);
        }
    },
    
    // Find closest enemy unit
    findTarget: function(unit) {
        // Get enemy faction
        const enemyFaction = (unit.faction === 'Crown') ? 'Horde' : 'Crown';
        
        // Get enemy units
        const enemyUnits = GameState.units[enemyFaction].filter(u => u.health > 0);
        
        if (enemyUnits.length === 0) {
            return null;
        }
        
        // Find closest enemy
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        enemyUnits.forEach(enemy => {
            const distance = this.calculateDistance(unit, enemy);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });
        
        return closestEnemy;
    },
    
    // Calculate distance between two units
    calculateDistance: function(unitA, unitB) {
        const dx = unitA.x - unitB.x;
        const dy = unitA.y - unitB.y;
        return Math.sqrt(dx * dx + dy * dy); // Euclidean distance
    },
    
    // Helper to get 8 neighbors (plus center) for splash
    getSplashPositions: function(centerX, centerY) {
        const positions = [{ x: centerX, y: centerY }];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                const nx = centerX + dx;
                const ny = centerY + dy;
                if (nx >= 0 && nx < Board.config.size && ny >= 0 && ny < Board.config.size) {
                    positions.push({ x: nx, y: ny });
                }
            }
        }
        return positions;
    },
    
    // Helper to add a class for a short time
    _animateCell: function(cell, className, duration=300) {
        if (!cell) return;
        cell.classList.add(className);
        setTimeout(() => cell.classList.remove(className), duration);
    },
    // Helper to shake the screen
    _shakeScreen: function(duration=400) {
        const container = document.querySelector('.game-container');
        if (!container) return;
        container.classList.add('screen-shake');
        setTimeout(() => container.classList.remove('screen-shake'), duration);
    },
    
    // Execute attack between units
    executeAttack: function(attacker, defender) {
        if (this.ended) return;
        // Calculate damage (with some randomness)
        // TECHNICAL DEBT: Flat defense reduction for now; switch to percentage-based in future
        const baseDamage = Math.max(1, attacker.attack - (defender.defense || 0));
        const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
        const damage = Math.floor(baseDamage * randomFactor);
        // Check for critical hit (15% chance)
        const isCritical = Math.random() < 0.15;
        const finalDamage = isCritical ? Math.floor(damage * 1.5) : damage;
        // Update statistics
        this.stats.damageDealt[attacker.faction] += finalDamage;
        if (isCritical) {
            this.stats.criticalHits[attacker.faction]++;
        }
        // Determine animation duration
        let animationDuration = 500; // default for magic/melee
        let isRanged = false;
        let isSplash = false;
        let splashSprite = null;
        if (attacker.type === 'Archer' || attacker.type === 'Crossbowman') {
            isRanged = true;
            animationDuration = 300;
        }
        if (attacker.type === 'Wizard') {
            isSplash = true;
            splashSprite = 'fireball';
        } else if (attacker.type === 'Shaman') {
            isSplash = true;
            splashSprite = 'magic';
        }
        // Play attack animation first
        if (typeof Renderer !== 'undefined') {
            // White flash on defender cell
            const defenderCell = Board.getCell(defender.x, defender.y)?.element;
            this._animateCell(defenderCell, 'cell-flash', 250);
            if (isSplash && typeof Projectiles !== 'undefined') {
                // Use a fast glowing dot for the streak, then splash
                Projectiles.animateDotProjectile(attacker, defender, () => {
                    // After dot lands, show splash and proceed with damage
                    setTimeout(() => {
                        const splashPositions = this.getSplashPositions(defender.x, defender.y);
                        Projectiles.animateSplash(splashPositions, splashSprite);
                        setTimeout(() => {
                            // Apply splash damage
                            let killedUnits = [];
                            splashPositions.forEach((pos, idx) => {
                                const cell = Board.getCell(pos.x, pos.y);
                                if (cell && cell.unit) {
                                    let dmg = (pos.x === defender.x && pos.y === defender.y) ? finalDamage : Math.floor(finalDamage * 0.5);
                                    const wasKilled = cell.unit.takeDamage(dmg);
                                    Board.updateUnit(pos.x, pos.y);
                                    if (wasKilled) killedUnits.push(cell.unit);
                                }
                            });
                            Deploy.updateBattleRoster();
                            // Log
                            const attackerName = `${attacker.faction}'s ${attacker.type}`;
                            const defenderName = `${defender.faction}'s ${defender.type}`;
                            UI.battleLog.addEntry(
                                getBattleLogText('attack', { attacker: attackerName, defender: defenderName, damage: finalDamage }) +
                                ' <span style="color:#f80">(Splash!)</span>'
                            );
                            // Remove killed units
                            killedUnits.forEach(unit => {
                                Board.removeUnit(unit.x, unit.y);
                                GameState.removeUnit(unit.faction, unit);
                                this.stats.unitsKilled[attacker.faction]++;
                            });
                            Deploy.updateBattleRoster();
                            // Check for victory
                            const victor = GameState.checkVictory();
                            if (victor) {
                                this.endBattle(victor);
                                return;
                            }
                            // Hero promotion (10% chance on kill)
                            if (killedUnits.includes(defender) && !attacker.isHero && Math.random() < 0.1) {
                                setTimeout(() => {
                                    attacker.promoteToHero();
                                    Board.updateUnit(attacker.x, attacker.y);
                                    UI.battleLog.addEntry(`${attacker.faction}'s ${attacker.type} has been promoted to <strong>HERO</strong> status!`, 'highlight');
                                    Deploy.updateBattleRoster();
                                    setTimeout(() => {
                                        this.nextUnit();
                                    }, 500);
                                }, 500);
                            } else {
                                setTimeout(() => {
                                    this.nextUnit();
                                }, 500);
                            }
                        }, 250); // splash visual duration
                    }, 10); // minimal delay after dot lands
                });
            } else if (isRanged && typeof Projectiles !== 'undefined') {
                Projectiles.animateProjectile(attacker, defender);
                setTimeout(() => this._afterAttackNoSplash(attacker, defender, finalDamage, isCritical, animationDuration), animationDuration);
            } else {
                // Melee or other ranged units just flash, no projectile
                const attackerCell = Board.getCell(attacker.x, attacker.y)?.element;
                this._animateCell(attackerCell, 'melee-attack-flash', 150);
                setTimeout(() => this._afterAttackNoSplash(attacker, defender, finalDamage, isCritical, animationDuration), animationDuration);
            }
            if (typeof Renderer.animateUnitAttack === 'function') {
                Renderer.animateUnitAttack(attacker);
            }
            // Screen shake on crit
            if (isCritical) {
                this._shakeScreen(400);
            }
        }
    },
    
    // Helper for non-splash attacks (to keep code DRY)
    _afterAttackNoSplash: function(attacker, defender, finalDamage, isCritical, animationDuration) {
        // Apply damage
        const killed = defender.takeDamage(finalDamage);
        Board.updateUnit(defender.x, defender.y);
        Deploy.updateBattleRoster();
        const attackerName = `${attacker.faction}'s ${attacker.type}`;
        const defenderName = `${defender.faction}'s ${defender.type}`;
        if (killed) {
            this.stats.unitsKilled[attacker.faction]++;
            UI.battleLog.addEntry(
                getBattleLogText('kill', { attacker: attackerName, defender: defenderName }),
                'kill'
            );
            Board.removeUnit(defender.x, defender.y);
            GameState.removeUnit(defender.faction, defender);
            Deploy.updateBattleRoster();
            const victor = GameState.checkVictory();
            if (victor) {
                this.endBattle(victor);
                return;
            }
            if (!attacker.isHero && Math.random() < 0.1) {
                setTimeout(() => {
                    attacker.promoteToHero();
                    Board.updateUnit(attacker.x, attacker.y);
                    UI.battleLog.addEntry(`${attacker.faction}'s ${attacker.type} has been promoted to <strong>HERO</strong> status!`, 'highlight');
                    Deploy.updateBattleRoster();
                    setTimeout(() => {
                        this.nextUnit();
                    }, 500);
                }, 500);
            } else {
                setTimeout(() => {
                    this.nextUnit();
                }, 500);
            }
        } else if (isCritical) {
            UI.battleLog.addEntry(
                getBattleLogText('critical', { attacker: attackerName, defender: defenderName, damage: finalDamage }),
                'critical'
            );
            setTimeout(() => {
                this.nextUnit();
            }, 500);
        } else {
            UI.battleLog.addEntry(
                getBattleLogText('attack', { attacker: attackerName, defender: defenderName, damage: finalDamage })
            );
            this.pacedTimeout(() => {
                this.nextUnit();
            }, Pacing.battle.combatDelay);
        }
    },
    
    // Move unit toward target
    moveTowardTarget: function(unit, target) {
        if (this.ended) return;
        
        // Use the new movement system
        Movement.moveTowardTarget(unit, target, () => {
            // Update move statistics
            this.stats.movesExecuted[unit.faction]++;
            
            // Move to next unit after movement is complete
            this.nextUnit();
        });
    },
    
    // End the battle
    endBattle: function(victor) {
        if (this.ended) return;
        this.ended = true;
        // Set game phase to end
        GameState.phase = 'end';
        
        // Log victory message
        if (victor === 'draw') {
            UI.battleLog.addEntry('<strong>Battle ends in a draw! Both sides have been annihilated.</strong>', 'highlight');
        } else {
            UI.battleLog.addEntry(`<strong>${victor} is victorious!</strong>`, 'highlight');
        }
        
        // Update UI
        document.getElementById('end-deployment').textContent = 'New Game';
        
        // Show victory screen with a slight delay for dramatic effect
        setTimeout(() => {
            this.showVictoryScreen(victor);
        }, Pacing.effects.victoryScreenDelay);
    },
    
    // Show victory screen with battle statistics
    showVictoryScreen: function(victor) {
        // Create victory screen overlay
        const victoryScreen = document.createElement('div');
        victoryScreen.className = 'victory-screen';
        victoryScreen.innerHTML = `
            <div class="victory-content">
                <h1 class="victory-title">${victor === 'draw' ? 'MUTUAL DESTRUCTION' : victor.toUpperCase() + ' VICTORY'}</h1>
                <div class="victory-subtitle">${victor === 'draw' ? 'Both sides have been annihilated!' : victor + ' has conquered the battlefield!'}</div>
                
                <div class="battle-stats">
                    <h2>Battle Statistics</h2>
                    <div class="stats-grid">
                        <div class="stat-row">
                            <div class="stat-label">Turns:</div>
                            <div class="stat-value">${this.stats.turns}</div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label">Damage Dealt:</div>
                            <div class="stat-value crown">${this.stats.damageDealt.Crown}</div>
                            <div class="stat-value horde">${this.stats.damageDealt.Horde}</div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label">Units Killed:</div>
                            <div class="stat-value crown">${this.stats.unitsKilled.Crown}</div>
                            <div class="stat-value horde">${this.stats.unitsKilled.Horde}</div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label">Critical Hits:</div>
                            <div class="stat-value crown">${this.stats.criticalHits.Crown}</div>
                            <div class="stat-value horde">${this.stats.criticalHits.Horde}</div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label">Moves Executed:</div>
                            <div class="stat-value crown">${this.stats.movesExecuted.Crown}</div>
                            <div class="stat-value horde">${this.stats.movesExecuted.Horde}</div>
                        </div>
                    </div>
                </div>
                
                <button id="close-victory" class="pixel-button">Continue</button>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(victoryScreen);
        
        // Add event listener to close button
        document.getElementById('close-victory').addEventListener('click', function() {
            console.log('Continue button clicked');
            // Remove victory screen
            if (victoryScreen.parentNode) {
                victoryScreen.parentNode.removeChild(victoryScreen);
            }

            // Reset pacing to normal
            if (typeof Battle.resume === 'function') Battle.resume(1);

            // Reset game state
            if (typeof GameState.reset === 'function') GameState.reset();

            // Clear the board
            if (typeof Board.clear === 'function') Board.clear();

            // Clear the battle log
            if (UI && UI.battleLog && typeof UI.battleLog.clear === 'function') UI.battleLog.clear();

            // Show welcome screen
            if (UI && typeof UI.showScreen === 'function') UI.showScreen('welcome');

            // Defensive: try to clear any pending timeouts (best effort)
            if (window.__battleTimeouts) {
                window.__battleTimeouts.forEach(clearTimeout);
                window.__battleTimeouts = [];
            }
        });
    },

    // Helper for setTimeout that respects paceMultiplier
    pacedTimeout: function(fn, baseDelay) {
        if (this.paceMultiplier === 0) return; // Paused
        const delay = Math.max(1, Math.round(baseDelay * (1 / this.paceMultiplier)));
        return setTimeout(fn, delay);
    },

    // To tint the defender when healed, add a helper:
    onUnitHealed: function(unit) {
        const cell = Board.getCell(unit.x, unit.y)?.element;
        this._animateCell(cell, 'cell-heal', 500);
    }
};
