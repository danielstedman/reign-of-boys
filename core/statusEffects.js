/**
 * StatusEffects.js - Handles all status effect logic (Poison, Burn, Freeze, etc.)
 */

const StatusEffects = {
    // Apply a new effect to a unit
    apply: function(unit, effect) {
        // If effect of same type exists, refresh duration (or stack if desired)
        const existing = unit.effects.find(e => e.type === effect.type);
        if (existing) {
            existing.duration = effect.duration;
            existing.data = effect.data;
        } else {
            unit.effects.push({ ...effect });
        }
    },

    // Process all effects for a unit at the start of their turn
    processTurnStart: function(unit, gameState) {
        // Copy array in case effects are removed during iteration
        unit.effects.slice().forEach(effect => {
            if (this[effect.type] && typeof this[effect.type].onTurnStart === 'function') {
                this[effect.type].onTurnStart(unit, effect, gameState);
            }
            effect.duration--;
            if (effect.duration <= 0) {
                this.remove(unit, effect.type);
                if (this[effect.type] && typeof this[effect.type].onExpire === 'function') {
                    this[effect.type].onExpire(unit, effect, gameState);
                }
            }
        });
    },

    // Remove an effect from a unit
    remove: function(unit, type) {
        unit.effects = unit.effects.filter(e => e.type !== type);
    },

    // --- Effect Definitions ---
    Poison: {
        onTurnStart: function(unit, effect, gameState) {
            // Apply poison damage
            const damage = effect.data.damage;
            const wasKilled = unit.takeDamage(damage);
            // Log with green text
            if (typeof UI !== 'undefined' && UI.battleLog) {
                const attackerName = effect.data.sourceName || 'Poison';
                const defenderName = `${unit.faction}'s ${unit.type}`;
                UI.battleLog.addEntry(
                    `<span style='color:#33ff33'><strong>Poison:</strong> ${defenderName} takes ${damage} poison damage!</span>`,
                    'poison'
                );
            }
            // Optionally show a visual effect
            if (typeof Effects !== 'undefined' && typeof Effects.showDamageEffect === 'function') {
                Effects.showDamageEffect(unit.x, unit.y, damage);
            }
            // If unit dies, handle removal
            if (wasKilled && typeof Board !== 'undefined' && typeof GameState !== 'undefined') {
                Board.removeUnit(unit.x, unit.y);
                GameState.removeUnit(unit.faction, unit);
            }
        },
        onExpire: function(unit, effect, gameState) {
            // Optionally log expiration
        }
    }
}; 