/**
 * Controls.js - Game controls and user interactions
 */

// Game Controls Management
const Controls = {
    // Initialize all control buttons
    init: function() {
        // Welcome screen buttons
        this.setupWelcomeScreenControls();
        
        // Game board screen buttons
        this.setupGameBoardControls();
    },
    
    // Set up welcome screen button controls
    setupWelcomeScreenControls: function() {
        // Single Player button
        document.getElementById('single-player').addEventListener('click', function() {
            GameState.gameMode = 'single';
            GameState.playerFaction = 'Crown';
            GameState.opponentFaction = 'Horde';
            
            UI.showScreen('gameBoard');
            Board.init();
            Deploy.initDeploymentPhase();
        });
        
        // Local 2-Player button
        document.getElementById('local-multiplayer').addEventListener('click', function() {
            GameState.gameMode = 'local';
            GameState.playerFaction = 'Crown';
            GameState.opponentFaction = 'Horde';
            
            UI.showScreen('gameBoard');
            Board.init();
            Deploy.initDeploymentPhase();
        });
        
        // Remote 2-Player button
        document.getElementById('remote-multiplayer').addEventListener('click', function() {
            // This will be implemented later
            alert('Remote 2-Player mode is coming soon!');
        });
    },
    
    // Set up game board screen button controls
    setupGameBoardControls: function() {
        // End Deployment button
        document.getElementById('end-deployment').addEventListener('click', function() {
            if (GameState.phase === 'deployment') {
                // Call the endDeployment function to handle transition properly
                Deploy.endDeployment();
            } else if (GameState.phase === 'battle') {
                // Skip to next turn in battle phase
                Battle.nextUnit();
            } else if (GameState.phase === 'end') {
                // Start a new game
                UI.showScreen('welcome');
            }
        });
        
        // Return to Menu button
        document.getElementById('return-to-menu').addEventListener('click', function() {
            // Reset game state
            GameState.reset();
            
            // Clear the board
            Board.clear();
            
            // Clear the battle log
            UI.battleLog.clear();
            
            // Show welcome screen
            UI.showScreen('welcome');
        });
    }
};

// Initialize controls when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    Controls.init();
});
