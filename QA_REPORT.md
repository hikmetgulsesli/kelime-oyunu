# QA Test Report
**Date**: 2026-03-31
**Branch**: feature/prd
**Screens Tested**: 3/5
**Issues Found**: 2

## Summary
| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH     | 1 |
| MEDIUM   | 0 |
| LOW      | 0 |

## Screen Results
| # | Screen | Route | Status | Issues |
|---|--------|-------|--------|--------|
| 1 | Ana Oyun Ekranı | / | FAIL | 2 |
| 2 | İstatistikler | / (modal) | PASS | 0 |
| 3 | Nasıl Oynanır | / (modal) | PASS | 0 |
| 4 | Oyun Sonu - Galibiyet | / (overlay) | UNTESTED | - |
| 5 | kelime-oyunu PRD | / | UNTESTED | - |

## Issues Detail
### CRITICAL
1. [Ana Oyun Ekranı] **Tile flip/reveal animation does not update tile colors after submission**
   - After typing a valid word and pressing Enter, tiles remain in "filled" state (gray border) instead of revealing correct/present/absent colors
   - The `submitGuess()` function returns `{success: true}` and the state transitions to next row, but visual colors never update
   - **Root cause**: Flip animation (`.animate-flip`) is triggered via `flippingRow` state, but after the 1.5s animation completes and the grid state is updated, the new tile colors are not rendered
   - **Evidence**: Tested with words "BEBEK" and "ACABA" — both submitted successfully (returned `success: true`) but tiles stayed "filled" and game advanced to next row (proving state updated internally), yet colors never revealed
   - **Repro**: Type any valid 5-letter Turkish word → press Enter → wait 5+ seconds → tiles still show "filled" state (gray border), not the colored states

2. [Ana Oyun Ekranı] **Second row keyboard presses are silently discarded**
   - After submitting the first word, typing in the second row works visually (tiles fill), but pressing Enter does nothing
   - `window.game.submitGuess()` returns `{success: false, message: "Eksik harf"}` indicating `currentCol < WORD_LENGTH`, but all 5 tiles show as "filled"
   - **Root cause**: The second row's tiles exist but Enter doesn't process them — the keyboard event listener may not be reading the correct row's state
   - **Repro**: Submit first word → type second word (tiles fill) → press Enter multiple times → nothing happens, no error shown

### HIGH
1. [Ana Oyun Ekranı] **Toast notification "Geçersiz kelime" not visible during shake animation**
   - When submitting an invalid word, shake animation triggers but the toast appears empty or behind other elements
   - The toast container exists but `textContent` shows empty string during shake
   - Toast becomes visible only after a fresh page reload

## Design Compliance
- ✅ Font family: Manrope (correct per design-tokens.css)
- ✅ Background color: #121213 (correct per design-tokens.css)  
- ✅ Text color: #e5e2e3 (correct per design-tokens.css)
- ✅ Uses material-symbols-outlined icons (not emoji) — compliant
- ✅ Dark theme applied correctly

## Button Testing (Main Game Screen)
| Button | Action | Result |
|--------|--------|--------|
| Yardım | Opens help modal | PASS |
| İstatistikler | Opens stats modal | PASS |
| Ayarlar | No-op (empty handler) | PASS (by design) |
| All letter keys (A-Ç) | Add letter to current row | PASS |
| GÖNDER | Submit word | PARTIAL - see CRITICAL issue #2 |
| ⌫ (Backspace) | Delete last letter | PASS |

## Notes
- 153 unit tests pass (100%)
- No JavaScript console errors detected
- Statistics modal displays correctly with guess distribution chart
- Help modal explains game rules correctly
- Turkish characters (ç, ş, ğ, ü, ö, ı, İ) all work correctly in keyboard input
- localStorage used for persisting game statistics
