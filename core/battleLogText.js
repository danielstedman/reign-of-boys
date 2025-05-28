// core/battleLogText.js

const BattleLogText = {
    attack: [
        "{attacker} attacks {defender} for {damage} damage!",
        "{attacker} slashes at {defender}, dealing {damage} damage!",
        "A mighty blow from {attacker}! {defender} takes {damage} damage.",
        "{attacker} swings at {defender}, inflicting {damage} damage."
    ],
    critical: [
        "CRITICAL! {attacker} devastates {defender} for {damage} damage!",
        "A perfect strike! {attacker} lands a critical hit on {defender} for {damage} damage!",
        "{defender} is rocked by a critical hit from {attacker}! ({damage} damage)"
    ],
    kill: [
        "{defender} is defeated! {attacker} stands victorious.",
        "{attacker}'s attack finishes off {defender}!",
        "{defender} falls in battle—{attacker} claims the victory!"
    ],
    heal: [
        "{attacker} restores {heal} HP to {defender}.",
        "A warm light surrounds {defender}—healed by {attacker}! (+{heal} HP)",
        "{attacker}'s prayer mends {defender}'s wounds (+{heal} HP)."
    ]
};

function getLogText(type, data) {
    const templates = BattleLogText[type];
    if (!templates || templates.length === 0) return '';
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template
        .replace('{attacker}', data.attacker)
        .replace('{defender}', data.defender)
        .replace('{damage}', data.damage)
        .replace('{heal}', data.heal);
}

// Export for use in battle.js, spells.js, etc.
window.getBattleLogText = getLogText; 