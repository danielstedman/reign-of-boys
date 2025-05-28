/**
 * spells.js - Handles all spell and special move logic for the game
 */

const Spells = {
    fireball: {
        name: "Fireball",
        cost: 20,
        description: "Deals 30 damage to a target and 10 to adjacent units.",
        cast: function(caster, target, gameState) {
            // Deal 30 damage to the main target
            if (target && typeof target.takeDamage === 'function') {
                target.takeDamage(30);
            }
            // Deal 10 damage to adjacent units (example logic)
            const adjacent = [
                {x: target.x+1, y: target.y}, {x: target.x-1, y: target.y},
                {x: target.x, y: target.y+1}, {x: target.x, y: target.y-1}
            ];
            adjacent.forEach(pos => {
                const unit = gameState.getUnitAt(pos.x, pos.y);
                if (unit && unit !== target && typeof unit.takeDamage === 'function') {
                    unit.takeDamage(10);
                }
            });
            // Optionally trigger visual effects here
        }
    },
    heal: {
        name: "Heal",
        cost: 15,
        description: "Restores 25 HP to a friendly unit.",
        cast: function(caster, target, gameState) {
            if (target && typeof target.heal === 'function') {
                target.heal(25);
                // Add to battle log with a unique style and procedural text
                if (typeof UI !== 'undefined' && UI.battleLog && typeof getBattleLogText === 'function') {
                    const casterName = `${caster.faction}'s ${caster.type}`;
                    const targetName = `${target.faction}'s ${target.type}`;
                    UI.battleLog.addEntry(
                        getBattleLogText('heal', { attacker: casterName, defender: targetName, heal: 25 }),
                        'heal'
                    );
                }
                // Tint the defender when healed
                if (typeof Battle !== 'undefined' && typeof Battle.onUnitHealed === 'function') {
                    Battle.onUnitHealed(target);
                }
            }
            // Optionally trigger visual effects here
        }
    },
    // Crown Specials
    lastStand: {
        name: 'Last Stand',
        description: 'If HP < 10, does double damage (10% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement double damage if HP < 10 (10% chance)
        }
    },
    quickShot: {
        name: 'Quick Shot',
        description: 'Attacks twice (10% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement double attack (10% chance)
        }
    },
    shieldBash: {
        name: 'Shield Bash',
        description: 'Stuns enemy for 1 turn (5% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement stun for 1 turn (5% chance)
        }
    },
    infernoSurge: {
        name: 'Inferno Surge',
        description: '3x3 AoE fire (10% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement 3x3 AoE fire (10% chance)
        }
    },
    divineShield: {
        name: 'Divine Shield',
        description: 'Blocks all damage once (5% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement block all damage once (5% chance)
        }
    },
    piercingBolt: {
        name: 'Piercing Bolt',
        description: 'Ignores enemy defense (10% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement ignore defense (10% chance)
        }
    },
    holyMend: {
        name: 'Holy Mend',
        description: 'Heals nearest ally 10 HP (15% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement heal nearest ally 10 HP (15% chance)
        }
    },
    blindingDust: {
        name: 'Blinding Dust',
        description: 'Reduces enemy accuracy (10% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement reduce enemy accuracy (10% chance)
        }
    },
    charge: {
        name: 'Charge',
        description: 'Charges +10 damage in straight line (15% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement +10 damage in straight line (15% chance)
        }
    },
    // Horde Specials
    roarOfBlood: {
        name: 'Roar of Blood',
        description: 'Boosts own attack next turn (10% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement attack boost next turn (10% chance)
        }
    },
    backstab: {
        name: 'Backstab',
        description: 'Crit hit if target is distracted (10% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement crit if target is distracted (10% chance)
        }
    },
    thickHide: {
        name: 'Thick Hide',
        description: 'Regenerates 7 HP (5% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement regen 7 HP (5% chance)
        }
    },
    spiritBurst: {
        name: 'Spirit Burst',
        description: '3x3 AoE magic (10% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement 3x3 AoE magic (10% chance)
        }
    },
    bloodFrenzy: {
        name: 'Blood Frenzy',
        description: 'Extra turn if HP < 50% (10% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement extra turn if HP < 50% (10% chance)
        }
    },
    howl: {
        name: 'Howl',
        description: 'Buffs ally speed (15% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement buff ally speed (15% chance)
        }
    },
    quakeSlam: {
        name: 'Quake Slam',
        description: 'AoE + knockback 1 tile (5% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement AoE + knockback 1 tile (5% chance)
        }
    },
    tricksterBlink: {
        name: 'Trickster Blink',
        description: 'Teleports 1 tile on hit (10% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement teleport 1 tile on hit (10% chance)
        }
    },
    lifesteal: {
        name: 'Lifesteal',
        description: 'Heals for damage dealt (10% chance)',
        cast: function(caster, target, gameState) {
            // TODO: Implement heal for damage dealt (10% chance)
        }
    }
};

// Utility: get spell by name
Spells.get = function(name) {
    return Spells[name];
}; 