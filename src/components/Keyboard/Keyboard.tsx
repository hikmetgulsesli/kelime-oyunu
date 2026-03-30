import { useState, useCallback, useRef, useEffect } from 'react';
import { TileState } from '../../types';
import { Key } from '../Key/Key';

interface KeyboardProps {
  /** Current state of each key (correct, present, absent, etc.) */
  keyStates?: Map<string, TileState>;
  /** Callback when a letter key is pressed */
  onLetterPress?: (letter: string) => void;
  /** Callback when ENTER is pressed */
  onEnterPress?: () => void;
  /** Callback when BACKSPACE is pressed */
  onBackspacePress?: () => void;
}

/**
 * Keyboard component - Virtual QWERTY keyboard with Turkish characters
 * 
 * Layout:
 * - Row 1: Q W E R T Y U I O P
 * - Row 2: A S D F G H J K L
 * - Row 3: ENTER Z X C V B N M ⌫
 * 
 * Features:
 * - Turkish characters: Ç, Ş, Ğ, Ü, Ö, İ, I
 * - Keys update color based on game progress
 * - ENTER triggers submitGuess
 * - BACKSPACE (⌫) triggers deleteLetter
 * - Brief scale animation on key press
 */
export function Keyboard({
  keyStates = new Map(),
  onLetterPress,
  onEnterPress,
  onBackspacePress,
}: KeyboardProps) {
  // Track active keys for press animation
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  // Ref to track timeout IDs for cleanup on unmount
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach(clearTimeout);
    };
  }, []);

  // Turkish QWERTY layout
  const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'];
  const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'];
  const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç'];

  const handleKeyPress = useCallback((key: string, callback?: () => void) => {
    // Add to active keys for animation
    setActiveKeys(prev => new Set(prev).add(key));
    
    // Remove from active keys after animation
    const timerId = setTimeout(() => {
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, 100);
    timeoutIdsRef.current.push(timerId);

    // Call the callback
    callback?.();
  }, []);

  const handleLetterClick = (letter: string) => {
    handleKeyPress(letter, () => onLetterPress?.(letter));
  };

  const handleEnterClick = () => {
    handleKeyPress('ENTER', onEnterPress);
  };

  const handleBackspaceClick = () => {
    handleKeyPress('BACKSPACE', onBackspacePress);
  };

  const getKeyState = (letter: string): TileState => {
    return keyStates.get(letter) ?? 'empty';
  };

  return (
    <div 
      className="flex flex-col gap-1.5 w-full max-w-lg px-1"
      data-testid="keyboard"
    >
      {/* Row 1: Q W E R T Y U I O P Ğ Ü */}
      <div className="flex gap-1 justify-center">
        {row1.map((letter) => (
          <Key
            key={letter}
            letter={letter}
            state={getKeyState(letter)}
            onClick={() => handleLetterClick(letter)}
            isActive={activeKeys.has(letter)}
          />
        ))}
      </div>

      {/* Row 2: A S D F G H J K L Ş İ */}
      <div className="flex gap-1 justify-center">
        {row2.map((letter) => (
          <Key
            key={letter}
            letter={letter}
            state={getKeyState(letter)}
            onClick={() => handleLetterClick(letter)}
            isActive={activeKeys.has(letter)}
          />
        ))}
      </div>

      {/* Row 3: ENTER Z X C V B N M Ö Ç ⌫ */}
      <div className="flex gap-1 justify-center">
        <Key
          letter="ENTER"
          isWide
          onClick={handleEnterClick}
          isActive={activeKeys.has('ENTER')}
        />
        {row3.map((letter) => (
          <Key
            key={letter}
            letter={letter}
            state={getKeyState(letter)}
            onClick={() => handleLetterClick(letter)}
            isActive={activeKeys.has(letter)}
          />
        ))}
        <Key
          letter="BACKSPACE"
          isWide
          onClick={handleBackspaceClick}
          isActive={activeKeys.has('BACKSPACE')}
        />
      </div>
    </div>
  );
}
