/**
 * Pacing.js - Game timing and animation speed configuration
 */

const Pacing = {
    // Battle phase timing
    battle: {
        movementDelay: 200,      // Increased from 50 to 200 for more visible movement
        combatDelay: 150,        // Fast for combat actions
        criticalEventDelay: 300, // Brief pause for dramatic events
        turnTransitionDelay: 80  // Quick transition between turns
    },

    // Deployment phase timing
    deployment: {
        unitPlaceDelay: 100,     // Delay when placing units
        highlightDelay: 200,     // Delay for highlighting valid moves
        errorFlashDelay: 300     // Delay for error feedback
    },

    // UI animation timing
    ui: {
        fadeInDelay: 200,        // Screen transitions
        fadeOutDelay: 200,
        buttonPressDelay: 100,   // Button feedback
        tooltipDelay: 300        // Tooltip display
    },

    // Effect timing
    effects: {
        damageNumberDuration: 500,    // How long damage numbers stay visible
        attackEffectDuration: 300,    // Duration of attack animations
        heroPromotionDuration: 1000,  // Duration of hero promotion effect
        victoryScreenDelay: 500       // Delay before showing victory screen
    }
}; 