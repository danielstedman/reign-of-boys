/**
 * Movement.js - Handles unit movement and pathfinding
 */

const Movement = {
    // Calculate a simple path toward target (greedy approach)
    calculatePath: function(unit, target) {
        console.log(`Calculating path for ${unit.type} from (${unit.x},${unit.y}) to (${target.x},${target.y})`);
        const path = [];
        let currentX = unit.x;
        let currentY = unit.y;
        const remainingMoves = unit.moveSpeed;

        for (let i = 0; i < remainingMoves; i++) {
            // Calculate direction to target
            const dx = target.x - currentX;
            const dy = target.y - currentY;

            // Determine next step (prioritize larger difference)
            let nextX = currentX;
            let nextY = currentY;

            if (Math.abs(dx) > Math.abs(dy)) {
                nextX = currentX + Math.sign(dx);
            } else {
                nextY = currentY + Math.sign(dy);
            }

            // Check if next position is valid
            const cell = Board.getCell(nextX, nextY);
            if (!cell || cell.unit) {
                console.log(`Path blocked at (${nextX},${nextY})`);
                break; // Stop if we hit an obstacle
            }

            // Add step to path
            path.push({ x: nextX, y: nextY });
            currentX = nextX;
            currentY = nextY;

            // Stop if we've reached the target
            if (currentX === target.x && currentY === target.y) {
                console.log('Reached target position');
                break;
            }
        }

        console.log(`Calculated path:`, path);
        return path;
    },

    // Move unit along a path with animation
    moveUnitAlongPath: function(unit, path, onComplete) {
        if (!path || path.length === 0) {
            console.log('No path to move along');
            if (onComplete) onComplete();
            return;
        }

        console.log(`Moving ${unit.type} along path of length ${path.length}`);
        let currentStep = 0;

        const moveNextStep = () => {
            if (currentStep >= path.length) {
                console.log('Movement complete');
                if (onComplete) onComplete();
                return;
            }

            const nextPos = path[currentStep];
            console.log(`Moving to step ${currentStep + 1}/${path.length}: (${nextPos.x},${nextPos.y})`);
            
            // Remove unit from current position
            Board.removeUnit(unit.x, unit.y);
            
            // Update unit position
            unit.x = nextPos.x;
            unit.y = nextPos.y;
            
            // Place unit at new position
            Board.placeUnit(nextPos.x, nextPos.y, unit);

            // Move to next step after delay, respecting battle pace
            currentStep++;
            
            // Calculate delay based on battle pace
            // Each individual tile movement takes the same time, regardless of unit's move speed
            const baseDelay = Pacing.battle.movementDelay;
            const pacedDelay = Math.max(1, Math.round(baseDelay * (1 / Battle.getPace())));
            
            // Add a small delay between steps to make movement more visible
            setTimeout(moveNextStep, pacedDelay);
        };

        // Start movement
        moveNextStep();
    },

    // Move unit toward target (main entry point)
    moveTowardTarget: function(unit, target, onComplete) {
        console.log(`Starting movement for ${unit.type} toward target at (${target.x},${target.y})`);
        const path = this.calculatePath(unit, target);
        this.moveUnitAlongPath(unit, path, onComplete);
    }
}; 