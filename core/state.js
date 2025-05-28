/**
 * State.js - Central game state management
 */

// Main game state object
const GameState = {
    // Game configuration
    gameMode: null, // 'single', 'local', 'remote'
    playerFaction: null, // 'Crown', 'Horde', etc.
    opponentFaction: null,
    
    // Game phase tracking
    phase: 'menu', // 'menu', 'deployment', 'battle', 'end'
    currentPlayer: null,
    turn: 0,
    
    // Unit tracking
    units: {
        Crown: [],
        Horde: []
    },
    
    // Points system for deployment
    points: {
        Crown: 1000,
        Horde: 1000
    },
    
    // Initialize game state
    init: function(gameMode, playerFaction, opponentFaction) {
        this.gameMode = gameMode;
        this.playerFaction = playerFaction;
        this.opponentFaction = opponentFaction;
        this.phase = 'deployment';
        this.currentPlayer = playerFaction;
        this.turn = 0;
        
        // Reset units
        this.units = {
            Crown: [],
            Horde: []
        };
        
        // Reset points
        this.points = {
            Crown: 1000,
            Horde: 1000
        };
    },
    
    // Reset game state
    reset: function() {
        this.gameMode = null;
        this.playerFaction = null;
        this.opponentFaction = null;
        this.phase = 'menu';
        this.currentPlayer = null;
        this.turn = 0;
        
        // Reset units
        this.units = {
            Crown: [],
            Horde: []
        };
        
        // Reset points
        this.points = {
            Crown: 1000,
            Horde: 1000
        };
    },
    
    // Switch current player
    switchPlayer: function() {
        this.currentPlayer = (this.currentPlayer === 'Crown') ? 'Horde' : 'Crown';
    },
    
    // Add unit to faction
    addUnit: function(faction, unit) {
        if (!this.units[faction]) {
            this.units[faction] = [];
        }
        
        this.units[faction].push(unit);
    },
    
    // Remove unit from faction
    removeUnit: function(faction, unit) {
        if (!this.units[faction]) {
            return false;
        }
        
        const index = this.units[faction].indexOf(unit);
        if (index !== -1) {
            this.units[faction].splice(index, 1);
            console.log(`Removed ${unit.type} from ${faction}. Units remaining: ${this.units[faction].length}`);
            return true;
        }
        
        return false;
    },
    
    // Get all units (both factions)
    getAllUnits: function() {
        return [...this.units.Crown, ...this.units.Horde];
    },
    
    // Check if a faction has any units left
    hasFactionUnits: function(faction) {
        const hasUnits = this.units[faction] && this.units[faction].length > 0;
        console.log(`${faction} has units: ${hasUnits} (${this.units[faction]?.length || 0} units)`);
        return hasUnits;
    },
    
    // Check for victory conditions
    checkVictory: function() {
        const crownHasUnits = this.hasFactionUnits('Crown');
        const hordeHasUnits = this.hasFactionUnits('Horde');
        
        console.log('Victory check:', {
            crownHasUnits,
            hordeHasUnits,
            crownUnits: this.units.Crown.length,
            hordeUnits: this.units.Horde.length
        });
        
        if (!crownHasUnits && !hordeHasUnits) {
            return 'draw';
        } else if (!crownHasUnits) {
            return 'Horde';
        } else if (!hordeHasUnits) {
            return 'Crown';
        }
        
        return null; // No winner yet
    }
};
