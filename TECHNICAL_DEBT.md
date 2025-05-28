# Technical Debt Log

## 2024-06-09: Victory Screen 'Continue' Button Robust Reset

**Context:**
- Users reported that after a battle, clicking the 'Continue' button on the victory screen did not always work, especially after using 2x speed or Pause.
- The root cause was that the pacing multiplier (used for battle speed) could interfere with timeouts and game state, preventing a clean reset.

**Workaround Implemented:**
- The 'Continue' button now forcibly resets the game state, board, battle log, and pacing multiplier, and shows the welcome screen, regardless of previous state.
- Defensive checks and best-effort timeout clearing were added to ensure a fresh start.

**Technical Debt:**
- This is a workaround. Ideally, the game loop and UI should be fully decoupled from pacing state, and all timeouts/intervals should be tracked and cleared on reset.
- Consider refactoring the game loop and pacing logic for more robust state management in the future.

---

Add new entries below as technical debt or workarounds are discovered. 