import { useState, useCallback } from 'react';
import { TileState } from '../../types';
import { Key } from '../Key/Key';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  keyStates?: Map<string, TileState>;
}

/**
 * Keyboard component - QWERTY Turkish virtual keyboard
 * 
 * Features:
 * - 3-row QWERTY layout with Turkish characters
 * - ENTER and BACKSPACE (⌫) keys
 * - Real-time color updates based on letter status
 * - Active animation on key press
 * 
 * Layout:
 * Row 1: Q W E R T Y U I O P
 * Row 2: A S D F G H J K L
 * Row 3: ENTER Z X C V B N M ⌫
 * 
 * Turkish characters: Ç, Ş, Ğ, Ü, Ö, İ, I
 */
export function Keyboard({ 
  onKeyPress, 
  onEnter, 
  onBackspace,
  keyStates = new Map()
}: KeyboardProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Turkish QWERTY layout
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', 'BACKSPACE'],
  ];

  const handleKeyClick = useCallback((key: string) => {
    // Set active state for animation
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 100);

    // Trigger appropriate action
    if (key === 'ENTER') {
      onEnter();
    } else if (key === 'BACKSPACE') {
      onBackspace();
    } else {
      onKeyPress(key);
    }
  }, [onKeyPress, onEnter, onBackspace]);

  const isWideKey = (key: string): boolean => {
    return key === 'ENTER' || key === 'BACKSPACE';
  };

  return (
    <div 
      className="w-full max-w-2xl mx-auto p-2"
      data-testid="keyboard"
    >
      <div className="flex flex-col gap-2">
        {rows.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className="flex justify-center gap-1.5"
            data-testid="keyboard-row"
          >
            {row.map((key) => (
              <Key
                key={key}
                letter={key}
                state={keyStates.get(key) || 'empty'}
                isWide={isWideKey(key)}
                onClick={() => handleKeyClick(key)}
                isActive={activeKey === key}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
