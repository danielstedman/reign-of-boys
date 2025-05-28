/**
 * Units.js - Unit creation and management
 *
 * NOTE: Defense is currently implemented as flat reduction (attack - defense, min 1).
 * TODO: Switch to percentage-based reduction for more nuanced scaling.
 */

const Units = {
    // Unit definitions by faction
    unitTypes: {
        Crown: [
            { type: 'Militia', icon: 'M', cost: 50, health: 20, attack: 6, defense: 2, range: 1, moveSpeed: 1, description: 'Basic infantry. Last Stand: If HP < 10, does double damage (10% chance)', spell: 'lastStand' },
            { type: 'Archer', icon: 'A', cost: 75, health: 25, attack: 7, defense: 1, range: 4, moveSpeed: 1, description: 'Ranged. Quick Shot: Attacks twice (10% chance)', spell: 'quickShot' },
            { type: 'Knight', icon: 'K', cost: 100, health: 45, attack: 7, defense: 4, range: 1, moveSpeed: 1, description: 'Frontline. Shield Bash: Stuns enemy for 1 turn (5% chance)', spell: 'shieldBash' },
            { type: 'Wizard', icon: 'W', cost: 150, health: 20, attack: 10, defense: 1, range: 4, moveSpeed: 1, description: 'Caster. Inferno Surge: 3x3 AoE fire (10% chance). Flies.', spell: 'infernoSurge', flies: true },
            { type: 'Paladin', icon: 'P', cost: 175, health: 50, attack: 8, defense: 5, range: 1, moveSpeed: 1, description: 'Tank. Divine Shield: Blocks all damage once (5% chance)', spell: 'divineShield' },
            { type: 'Crossbowman', icon: 'X', cost: 125, health: 30, attack: 9, defense: 1, range: 4, moveSpeed: 1, description: 'Ranged. Piercing Bolt: Ignores defense (10% chance)', spell: 'piercingBolt' },
            { type: 'Cleric', icon: 'C', cost: 175, health: 25, attack: 6, defense: 2, range: 5, moveSpeed: 1, description: 'Support. Holy Mend: Heals nearest ally 10 HP (15% chance)', spell: 'holyMend' },
            { type: 'Scout', icon: 'S', cost: 60, health: 18, attack: 5, defense: 1, range: 1, moveSpeed: 4, description: 'Fast. Blinding Dust: Reduces enemy accuracy (10% chance)', spell: 'blindingDust' },
            { type: 'Cavalry', icon: 'V', cost: 130, health: 35, attack: 10, defense: 3, range: 1, moveSpeed: 2, description: 'Mobile. Charge: +10 damage in straight line (15% chance)', spell: 'charge' }
        ],
        Horde: [
            { type: 'Orc', icon: 'O', cost: 60, health: 38, attack: 7, defense: 2, range: 1, moveSpeed: 1, description: 'Frontline. Roar of Blood: Boosts own attack next turn (10% chance)', spell: 'roarOfBlood' },
            { type: 'Goblin', icon: 'G', cost: 40, health: 15, attack: 4, defense: 1, range: 1, moveSpeed: 4, description: 'Fast. Backstab: Crit if target is distracted (10% chance)', spell: 'backstab' },
            { type: 'Troll', icon: 'T', cost: 100, health: 45, attack: 7, defense: 4, range: 2, moveSpeed: 1, description: 'Tank. Thick Hide: Regenerates 7 HP (5% chance)', spell: 'thickHide' },
            { type: 'Shaman', icon: 'S', cost: 140, health: 28, attack: 10, defense: 1, range: 4, moveSpeed: 1, description: 'Caster. Spirit Burst: 3x3 AoE magic (10% chance)', spell: 'spiritBurst' },
            { type: 'Berserker', icon: 'B', cost: 180, health: 40, attack: 10, defense: 2, range: 1, moveSpeed: 3, description: 'Aggressive. Blood Frenzy: Extra turn if HP < 50% (10% chance)', spell: 'bloodFrenzy' },
            { type: 'Wolfrider', icon: 'W', cost: 90, health: 30, attack: 8, defense: 2, range: 2, moveSpeed: 4, description: 'Mobile. Howl: Buffs ally speed (15% chance)', spell: 'howl' },
            { type: 'Ogre', icon: 'Q', cost: 160, health: 55, attack: 9, defense: 5, range: 1, moveSpeed: 2, description: 'Heavy. Quake Slam: AoE + knockback 1 tile (5% chance)', spell: 'quakeSlam' },
            { type: 'Imp', icon: 'I', cost: 70, health: 15, attack: 4, defense: 1, range: 3, moveSpeed: 2, description: 'Trickster. Trickster Blink: Teleports 1 tile on hit (10% chance). Flies. Water Adaptive.', spell: 'tricksterBlink', flies: true, waterAdaptive: true },
            { type: 'BloodBoy', icon: 'B', cost: 120, health: 30, attack: 8, defense: 2, range: 2, moveSpeed: 2, description: 'Vampiric. Lifesteal: Heals for damage dealt (10% chance)', spell: 'lifesteal' }
        ],
        Undead: [
            { type: 'Skeleton', icon: 'S', cost: 70, health: 60, attack: 20, range: 1, moveSpeed: 2, description: 'Cheap, fragile unit that can be summoned in numbers' },
            { type: 'Necromancer', icon: 'N', cost: 220, health: 80, attack: 35, range: 2, moveSpeed: 1, description: 'Master of death magic who can raise fallen units' },
            { type: 'Zombie', icon: 'Z', cost: 90, health: 100, attack: 15, range: 1, moveSpeed: 1, description: 'Slow but durable unit with moderate health' },
            { type: 'Wraith', icon: 'W', cost: 180, health: 70, attack: 40, range: 1, moveSpeed: 2, description: 'Spectral entity with high attack and phasing abilities' },
            { type: 'Bone Golem', icon: 'G', cost: 250, health: 170, attack: 30, range: 1, moveSpeed: 1, description: 'Massive construct of bones with high health' },
            { type: 'Banshee', icon: 'B', cost: 160, health: 60, attack: 45, range: 2, moveSpeed: 2, description: 'Wailing spirit with high damage ranged attacks' },
            { type: 'Death Knight', icon: 'K', cost: 280, health: 150, attack: 40, range: 1, moveSpeed: 2, description: 'Powerful undead warrior with excellent stats' },
            { type: 'Plague Bearer', icon: 'P', cost: 140, health: 90, attack: 20, range: 1, moveSpeed: 2, description: 'Spreads disease that damages nearby enemies over time' },
            { type: 'Lich', icon: 'L', cost: 300, health: 100, attack: 50, range: 3, moveSpeed: 1, description: 'Powerful undead mage with devastating ranged attacks' }
        ],
        Wildbound: [
            { type: 'Druid', icon: 'D', cost: 170, health: 90, attack: 25, range: 2, moveSpeed: 2, description: 'Nature spellcaster with terrain manipulation abilities' },
            { type: 'Bear Rider', icon: 'B', cost: 200, health: 140, attack: 35, range: 1, moveSpeed: 2, description: 'Powerful beast-mounted warrior with high health' },
            { type: 'Wolf Pack', icon: 'W', cost: 130, health: 80, attack: 30, range: 1, moveSpeed: 3, description: 'Fast pack hunters that gain bonuses when grouped' },
            { type: 'Treant', icon: 'T', cost: 220, health: 160, attack: 25, range: 1, moveSpeed: 1, description: 'Living tree with high health and forest affinity' },
            { type: 'Hawk Scout', icon: 'H', cost: 90, health: 60, attack: 15, range: 2, moveSpeed: 4, description: 'Extremely fast aerial scout with good visibility' },
            { type: 'Stag Archer', icon: 'A', cost: 150, health: 85, attack: 28, range: 3, moveSpeed: 2, description: 'Mounted archer with good range and mobility' },
            { type: 'Vine Weaver', icon: 'V', cost: 140, health: 70, attack: 20, range: 2, moveSpeed: 2, description: 'Support unit that can entangle enemies' },
            { type: 'Mammoth Rider', icon: 'M', cost: 280, health: 180, attack: 40, range: 1, moveSpeed: 1, description: 'Massive beast rider with very high health and attack' },
            { type: 'Beastmaster', icon: 'E', cost: 190, health: 100, attack: 30, range: 1, moveSpeed: 2, description: 'Commander unit that boosts beast units\' stats' }
        ],
        Skyborn: [
            { type: 'Wind Mage', icon: 'M', cost: 180, health: 75, attack: 35, range: 2, moveSpeed: 2, description: 'Aerial spellcaster with wind magic abilities' },
            { type: 'Harpy', icon: 'H', cost: 120, health: 70, attack: 25, range: 1, moveSpeed: 3, description: 'Fast flying unit with good mobility' },
            { type: 'Pegasus Knight', icon: 'P', cost: 200, health: 110, attack: 30, range: 1, moveSpeed: 3, description: 'Mounted flying warrior with good stats' },
            { type: 'Thunderbird', icon: 'T', cost: 230, health: 90, attack: 40, range: 2, moveSpeed: 2, description: 'Powerful storm bird with lightning attacks' },
            { type: 'Cloud Giant', icon: 'G', cost: 270, health: 160, attack: 35, range: 1, moveSpeed: 1, description: 'Massive aerial unit with high health and attack' },
            { type: 'Zephyr', icon: 'Z', cost: 100, health: 60, attack: 20, range: 1, moveSpeed: 4, description: 'Extremely fast air elemental with highest mobility' },
            { type: 'Sky Archer', icon: 'A', cost: 150, health: 80, attack: 30, range: 3, moveSpeed: 2, description: 'Ranged attacker with excellent visibility' },
            { type: 'Storm Caller', icon: 'S', cost: 190, health: 85, attack: 38, range: 2, moveSpeed: 2, description: 'Weather manipulator with area effect attacks' },
            { type: 'Phoenix', icon: 'X', cost: 300, health: 120, attack: 45, range: 2, moveSpeed: 3, description: 'Legendary bird that can resurrect once after death' }
        ],
        Swarm: [
            { type: 'Drone', icon: 'D', cost: 60, health: 50, attack: 15, range: 1, moveSpeed: 2, description: 'Basic worker unit that can evolve into other forms' },
            { type: 'Warrior', icon: 'W', cost: 120, health: 90, attack: 30, range: 1, moveSpeed: 2, description: 'Standard combat unit with balanced stats' },
            { type: 'Queen', icon: 'Q', cost: 250, health: 130, attack: 25, range: 1, moveSpeed: 1, description: 'Leader unit that can spawn new drones' },
            { type: 'Spitter', icon: 'S', cost: 140, health: 70, attack: 35, range: 3, moveSpeed: 2, description: 'Ranged attacker that fires acid at enemies' },
            { type: 'Broodlord', icon: 'B', cost: 200, health: 110, attack: 30, range: 2, moveSpeed: 2, description: 'Flying unit that can spawn smaller units' },
            { type: 'Tunneler', icon: 'T', cost: 150, health: 100, attack: 25, range: 1, moveSpeed: 3, description: 'Fast unit that can move through obstacles' },
            { type: 'Devourer', icon: 'V', cost: 180, health: 120, attack: 40, range: 1, moveSpeed: 2, description: 'Predator unit that gains strength from kills' },
            { type: 'Hivemind', icon: 'H', cost: 220, health: 80, attack: 30, range: 2, moveSpeed: 1, description: 'Psychic unit that boosts nearby swarm units' },
            { type: 'Behemoth', icon: 'M', cost: 300, health: 200, attack: 45, range: 1, moveSpeed: 1, description: 'Massive evolved form with extremely high stats' }
        ]
    },
    
    // Get units by faction
    getUnitsByFaction: function(faction) {
        return this.unitTypes[faction] || [];
    },
    
    // Create a new unit
    createUnit: function(type, faction, x, y) {
        // Find unit type definition
        const unitTypes = this.getUnitsByFaction(faction);
        const unitType = unitTypes.find(u => u.type === type);
        
        if (!unitType) {
            console.error(`Unit type ${type} not found for faction ${faction}`);
            return null;
        }
        
        // Create unit instance
        const unit = {
            ...unitType,
            faction: faction,
            x: x,
            y: y,
            health: unitType.health,
            maxHealth: unitType.health,
            isHero: false,
            effects: [],
            
            // Unit methods
            takeDamage: function(amount) {
                this.health = Math.max(0, this.health - amount);
                return this.health <= 0;
            },
            
            heal: function(amount) {
                this.health = Math.min(this.maxHealth, this.health + amount);
            },
            
            promoteToHero: function() {
                if (!this.isHero) {
                    this.isHero = true;
                    this.maxHealth = Math.floor(this.maxHealth * 1.5);
                    this.health = this.maxHealth;
                    this.attack = Math.floor(this.attack * 1.3);
                    return true;
                }
                return false;
            }
        };
        
        return unit;
    },
    
    // Get unit special abilities based on faction and type
    getUnitSpecialAbilities: function(faction, type) {
        const specialAbilities = {
            Crown: {
                'Militia': { name: 'Last Stand', description: 'If HP < 10, does double damage (10% chance)' },
                'Archer': { name: 'Quick Shot', description: 'Attacks twice (10% chance)' },
                'Knight': { name: 'Shield Bash', description: 'Stuns enemy for 1 turn (5% chance)' },
                'Wizard': { name: 'Inferno Surge', description: '3x3 AoE fire (10% chance)' },
                'Paladin': { name: 'Divine Shield', description: 'Blocks all damage once (5% chance)' },
                'Crossbowman': { name: 'Piercing Bolt', description: 'Ignores enemy defense (10% chance)' },
                'Cleric': { name: 'Holy Mend', description: 'Heals nearest ally 10 HP (15% chance)' },
                'Scout': { name: 'Blinding Dust', description: 'Reduces enemy accuracy (10% chance)' },
                'Cavalry': { name: 'Charge', description: 'Charges +10 damage in straight line (15% chance)' }
            },
            Horde: {
                'Orc': { name: 'Roar of Blood', description: 'Boosts own attack next turn (10% chance)' },
                'Goblin': { name: 'Backstab', description: 'Crit hit if target is distracted (10% chance)' },
                'Troll': { name: 'Thick Hide', description: 'Regenerates 7 HP (5% chance)' },
                'Shaman': { name: 'Spirit Burst', description: '3x3 AoE magic (10% chance)' },
                'Berserker': { name: 'Blood Frenzy', description: 'Extra turn if HP < 50% (10% chance)' },
                'Wolfrider': { name: 'Howl', description: 'Buffs ally speed (15% chance)' },
                'Ogre': { name: 'Quake Slam', description: 'AoE + knockback 1 tile (5% chance)' },
                'Imp': { name: 'Trickster Blink', description: 'Teleports 1 tile on hit (10% chance)' },
                'BloodBoy': { name: 'Lifesteal', description: 'Heals for damage dealt (10% chance)' }
            },
            Undead: {
                'Necromancer': { name: 'Raise Dead', description: 'Can resurrect a fallen unit as a skeleton' },
                'Wraith': { name: 'Phase', description: 'Can move through obstacles and enemy units' },
                'Lich': { name: 'Death Nova', description: 'Damages all nearby units when killed' }
            },
            Wildbound: {
                'Druid': { name: 'Nature\'s Blessing', description: 'Gains bonuses when on natural terrain' },
                'Wolf Pack': { name: 'Pack Tactics', description: 'Increased attack when adjacent to other Wolf Packs' },
                'Treant': { name: 'Root', description: 'Can immobilize an enemy unit for one turn' }
            },
            Skyborn: {
                'Wind Mage': { name: 'Gust', description: 'Can push enemy units away' },
                'Phoenix': { name: 'Rebirth', description: 'Resurrects once after being killed' },
                'Storm Caller': { name: 'Lightning Strike', description: 'Can attack multiple units in a line' }
            },
            Swarm: {
                'Drone': { name: 'Evolve', description: 'Can transform into another unit type' },
                'Queen': { name: 'Spawn', description: 'Can create new Drone units' },
                'Devourer': { name: 'Consume', description: 'Gains permanent stat bonuses from kills' }
            }
        };
        
        if (specialAbilities[faction] && specialAbilities[faction][type]) {
            return specialAbilities[faction][type];
        }
        
        return null;
    }
};
