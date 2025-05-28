/**
 * Script.js - Main entry point that ties everything together
 */

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Show welcome screen
    UI.showScreen('welcome');
    
    // Initialize welcome screen animations
    UI.initWelcomeAnimations();
    
    // Initialize event listeners
    initEventListeners();
    
    console.log('Reign of Boys initialized successfully!');
});

// Initialize all event listeners
function initEventListeners() {
    // Welcome screen buttons
    document.getElementById('single-player').addEventListener('click', function() {
        startGame('single', 'Crown', 'Horde');
    });
    
    document.getElementById('local-multiplayer').addEventListener('click', function() {
        startGame('local', 'Crown', 'Horde');
    });
    
    document.getElementById('remote-multiplayer').addEventListener('click', function() {
        alert('Remote 2-Player mode is coming soon!');
    });
    
    // No button event listeners here - all are now centralized in controls.js
}

// Start a new game
function startGame(gameMode, playerFaction, opponentFaction) {
    // Initialize game state
    GameState.init(gameMode, playerFaction, opponentFaction);
    
    // Show game board screen
    UI.showScreen('gameBoard');
    
    // Initialize game board
    Board.init();
    
    // Start deployment phase
    Deploy.initDeploymentPhase();
}
