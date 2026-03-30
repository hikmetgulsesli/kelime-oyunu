import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Keyboard } from './Keyboard';
import { TileState } from '../../types';

describe('Keyboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders keyboard with 3 rows', () => {
    render(
      <Keyboard 
        onKeyPress={() => {}} 
        onEnter={() => {}} 
        onBackspace={() => {}} 
      />
    );
    const rows = screen.getAllByTestId('keyboard-row');
    expect(rows).toHaveLength(3);
  });

  it('renders QWERTY layout in first row', () => {
    render(
      <Keyboard 
        onKeyPress={() => {}} 
        onEnter={() => {}} 
        onBackspace={() => {}} 
      />
    );
    const keys = screen.getAllByTestId('key');
    const firstRowKeys = keys.slice(0, 12); // Q W E R T Y U I O P Ğ Ü
    
    expect(firstRowKeys[0]).toHaveAttribute('data-key', 'Q');
    expect(firstRowKeys[1]).toHaveAttribute('data-key', 'W');
    expect(firstRowKeys[2]).toHaveAttribute('data-key', 'E');
    expect(firstRowKeys[3]).toHaveAttribute('data-key', 'R');
    expect(firstRowKeys[4]).toHaveAttribute('data-key', 'T');
    expect(firstRowKeys[5]).toHaveAttribute('data-key', 'Y');
    expect(firstRowKeys[6]).toHaveAttribute('data-key', 'U');
    expect(firstRowKeys[7]).toHaveAttribute('data-key', 'I');
    expect(firstRowKeys[8]).toHaveAttribute('data-key', 'O');
    expect(firstRowKeys[9]).toHaveAttribute('data-key', 'P');
    expect(firstRowKeys[10]).toHaveAttribute('data-key', 'Ğ');
    expect(firstRowKeys[11]).toHaveAttribute('data-key', 'Ü');
  });

  it('renders ASDFGHJKL row in second row', () => {
    render(
      <Keyboard 
        onKeyPress={() => {}} 
        onEnter={() => {}} 
        onBackspace={() => {}} 
      />
    );
    const keys = screen.getAllByTestId('key');
    const secondRowKeys = keys.slice(12, 23); // A S D F G H J K L Ş İ
    
    expect(secondRowKeys[0]).toHaveAttribute('data-key', 'A');
    expect(secondRowKeys[1]).toHaveAttribute('data-key', 'S');
    expect(secondRowKeys[2]).toHaveAttribute('data-key', 'D');
    expect(secondRowKeys[3]).toHaveAttribute('data-key', 'F');
    expect(secondRowKeys[4]).toHaveAttribute('data-key', 'G');
    expect(secondRowKeys[5]).toHaveAttribute('data-key', 'H');
    expect(secondRowKeys[6]).toHaveAttribute('data-key', 'J');
    expect(secondRowKeys[7]).toHaveAttribute('data-key', 'K');
    expect(secondRowKeys[8]).toHaveAttribute('data-key', 'L');
    expect(secondRowKeys[9]).toHaveAttribute('data-key', 'Ş');
    expect(secondRowKeys[10]).toHaveAttribute('data-key', 'İ');
  });

  it('renders ENTER and BACKSPACE in third row', () => {
    render(
      <Keyboard 
        onKeyPress={() => {}} 
        onEnter={() => {}} 
        onBackspace={() => {}} 
      />
    );
    const keys = screen.getAllByTestId('key');
    const thirdRowKeys = keys.slice(23); // ENTER Z X C V B N M Ö Ç BACKSPACE
    
    expect(thirdRowKeys[0]).toHaveAttribute('data-key', 'ENTER');
    expect(thirdRowKeys[0]).toHaveTextContent('GÖNDER');
    expect(thirdRowKeys[thirdRowKeys.length - 1]).toHaveAttribute('data-key', 'BACKSPACE');
    expect(thirdRowKeys[thirdRowKeys.length - 1]).toHaveTextContent('⌫');
  });

  it('renders Turkish characters', () => {
    render(
      <Keyboard 
        onKeyPress={() => {}} 
        onEnter={() => {}} 
        onBackspace={() => {}} 
      />
    );
    const turkishChars = ['Ç', 'Ş', 'Ğ', 'Ü', 'Ö', 'İ', 'I'];
    
    turkishChars.forEach((char) => {
      const key = screen.queryByText(char);
      expect(key).toBeInTheDocument();
    });
  });

  it('calls onKeyPress when letter key is clicked', () => {
    const handleKeyPress = vi.fn();
    render(
      <Keyboard 
        onKeyPress={handleKeyPress} 
        onEnter={() => {}} 
        onBackspace={() => {}} 
      />
    );
    
    const aKey = screen.getByText('A');
    fireEvent.click(aKey);
    
    expect(handleKeyPress).toHaveBeenCalledTimes(1);
    expect(handleKeyPress).toHaveBeenCalledWith('A');
  });

  it('calls onEnter when ENTER key is clicked', () => {
    const handleEnter = vi.fn();
    render(
      <Keyboard 
        onKeyPress={() => {}} 
        onEnter={handleEnter} 
        onBackspace={() => {}} 
      />
    );
    
    const enterKey = screen.getByText('GÖNDER');
    fireEvent.click(enterKey);
    
    expect(handleEnter).toHaveBeenCalledTimes(1);
  });

  it('calls onBackspace when BACKSPACE key is clicked', () => {
    const handleBackspace = vi.fn();
    render(
      <Keyboard 
        onKeyPress={() => {}} 
        onEnter={() => {}} 
        onBackspace={handleBackspace} 
      />
    );
    
    const backspaceKey = screen.getByText('⌫');
    fireEvent.click(backspaceKey);
    
    expect(handleBackspace).toHaveBeenCalledTimes(1);
  });

  it('updates key colors based on keyStates prop', () => {
    const keyStates = new Map<string, TileState>([
      ['A', 'correct'],
      ['B', 'present'],
      ['C', 'absent'],
    ]);
    
    render(
      <Keyboard 
        onKeyPress={() => {}} 
        onEnter={() => {}} 
        onBackspace={() => {}} 
        keyStates={keyStates}
      />
    );
    
    const aKey = screen.getByText('A');
    const bKey = screen.getByText('B');
    const cKey = screen.getByText('C');
    const dKey = screen.getByText('D');
    
    expect(aKey).toHaveAttribute('data-state', 'correct');
    expect(bKey).toHaveAttribute('data-state', 'present');
    expect(cKey).toHaveAttribute('data-state', 'absent');
    expect(dKey).toHaveAttribute('data-state', 'empty');
  });

  it('shows active animation when key is pressed', () => {
    vi.useFakeTimers();
    try {
      render(
        <Keyboard 
          onKeyPress={() => {}} 
          onEnter={() => {}} 
          onBackspace={() => {}} 
        />
      );
      
      const aKey = screen.getByText('A');
      
      // Click the key wrapped in act
      act(() => {
        fireEvent.click(aKey);
      });
      
      // Key should have active animation class immediately after click
      expect(aKey.className).toContain('scale-90');
      
      // Advance timers to let the animation timeout complete
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      // After timeout, animation class should be removed
      expect(aKey.className).not.toContain('scale-90');
    } finally {
      vi.useRealTimers();
    }
  });
});
