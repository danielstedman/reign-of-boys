/**
 * Factions.js - Faction definitions and metadata
 */

const Factions = {
    // Faction definitions
    factions: {
        Crown: {
            name: 'The Crown',
            description: 'Balanced, knightly order with strong frontline and magic',
            primaryColor: '#FFD700', // Gold
            secondaryColor: '#4169E1', // Royal Blue
            deploymentZone: 'bottom',
            specialAbility: 'Royal Decree: Once per battle, can grant a unit an extra action'
        },
        Horde: {
            name: 'The Horde',
            description: 'Aggressive melee attackers with bloodlust and brute strength',
            primaryColor: '#8B0000', // Dark Red
            secondaryColor: '#654321', // Dark Brown
            deploymentZone: 'top',
            specialAbility: 'Bloodlust: Units gain attack bonus after killing an enemy'
        },
        Undead: {
            name: 'The Undead',
            description: 'Swarming skeletons, necromancers, and death magic',
            primaryColor: '#663399', // Purple
            secondaryColor: '#2F4F4F', // Dark Slate Gray
            deploymentZone: 'top',
            specialAbility: 'Necromancy: Can resurrect fallen units as basic skeletons'
        },
        Wildbound: {
            name: 'The Wildbound',
            description: 'Beast-riders and druids with terrain-based abilities',
            primaryColor: '#006400', // Dark Green
            secondaryColor: '#8B4513', // Saddle Brown
            deploymentZone: 'top',
            specialAbility: 'Wild Affinity: Units gain bonuses when on natural terrain'
        },
        Skyborn: {
            name: 'The Skyborn',
            description: 'Aerial units focused on speed, evasion, and wind magic',
            primaryColor: '#87CEEB', // Sky Blue
            secondaryColor: '#FFFFFF', // White
            deploymentZone: 'top',
            specialAbility: 'Windborne: Units can move over obstacles and enemy units'
        },
        Swarm: {
            name: 'The Swarm',
            description: 'Zerg-style insectoid faction with spawning and mutation',
            primaryColor: '#9932CC', // Dark Orchid
            secondaryColor: '#556B2F', // Dark Olive Green
            deploymentZone: 'top',
            specialAbility: 'Mutation: Can evolve units during battle for different abilities'
        }
    },
    
    // Get faction by ID
    getFaction: function(factionId) {
        return this.factions[factionId];
    },
    
    // Get all faction IDs
    getAllFactionIds: function() {
        return Object.keys(this.factions);
    },
    
    // Get opposing faction
    getOpposingFaction: function(factionId) {
        // Default opposition is Crown vs Horde
        if (factionId === 'Crown') return 'Horde';
        return 'Crown';
    }
};
