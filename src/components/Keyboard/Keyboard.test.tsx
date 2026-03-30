import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Keyboard } from './Keyboard';
import { TileState } from '../../types';

describe('Keyboard', () => {
  it('renders keyboard container', () => {
    render(<Keyboard />);
    const keyboard = screen.getByTestId('keyboard');
    expect(keyboard).toBeInTheDocument();
  });

  it('renders 3 rows of keys', () => {
    render(<Keyboard />);
    const keys = screen.getAllByTestId('key');
    // Row 1: 12 keys, Row 2: 11 keys, Row 3: 2 wide + 9 letter = 11 keys
    // Total: 12 + 11 + 11 = 34 keys
    expect(keys.length).toBe(34);
  });

  it('renders row 1 with correct letters', () => {
    render(<Keyboard />);
    const row1Letters = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'];
    
    row1Letters.forEach(letter => {
      const key = screen.getByText(letter);
      expect(key).toBeInTheDocument();
    });
  });

  it('renders row 2 with correct letters', () => {
    render(<Keyboard />);
    const row2Letters = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'];
    
    row2Letters.forEach(letter => {
      const key = screen.getByText(letter);
      expect(key).toBeInTheDocument();
    });
  });

  it('renders row 3 with correct letters and special keys', () => {
    render(<Keyboard />);
    const row3Letters = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç'];
    
    // Check special keys
    expect(screen.getByText('GÖNDER')).toBeInTheDocument();
    expect(screen.getByText('⌫')).toBeInTheDocument();
    
    // Check letters
    row3Letters.forEach(letter => {
      const key = screen.getByText(letter);
      expect(key).toBeInTheDocument();
    });
  });

  it('renders all Turkish characters', () => {
    render(<Keyboard />);
    const turkishChars = ['Ç', 'Ş', 'Ğ', 'Ü', 'Ö', 'İ', 'I'];
    
    turkishChars.forEach(char => {
      const key = screen.getByText(char);
      expect(key).toBeInTheDocument();
    });
  });

  it('calls onLetterPress when a letter key is clicked', () => {
    const handleLetterPress = vi.fn();
    render(<Keyboard onLetterPress={handleLetterPress} />);
    
    const keyA = screen.getByText('A');
    fireEvent.click(keyA);
    
    expect(handleLetterPress).toHaveBeenCalledTimes(1);
    expect(handleLetterPress).toHaveBeenCalledWith('A');
  });

  it('calls onEnterPress when ENTER key is clicked', () => {
    const handleEnterPress = vi.fn();
    render(<Keyboard onEnterPress={handleEnterPress} />);
    
    const enterKey = screen.getByText('GÖNDER');
    fireEvent.click(enterKey);
    
    expect(handleEnterPress).toHaveBeenCalledTimes(1);
  });

  it('calls onBackspacePress when BACKSPACE key is clicked', () => {
    const handleBackspacePress = vi.fn();
    render(<Keyboard onBackspacePress={handleBackspacePress} />);
    
    const backspaceKey = screen.getByText('⌫');
    fireEvent.click(backspaceKey);
    
    expect(handleBackspacePress).toHaveBeenCalledTimes(1);
  });

  it('applies correct state to keys from keyStates map', () => {
    const keyStates = new Map<string, TileState>([
      ['A', 'correct'],
      ['B', 'present'],
      ['C', 'absent'],
    ]);
    
    render(<Keyboard keyStates={keyStates} />);
    
    const keyA = screen.getByText('A').closest('[data-testid="key"]');
    const keyB = screen.getByText('B').closest('[data-testid="key"]');
    const keyC = screen.getByText('C').closest('[data-testid="key"]');
    
    expect(keyA).toHaveAttribute('data-state', 'correct');
    expect(keyB).toHaveAttribute('data-state', 'present');
    expect(keyC).toHaveAttribute('data-state', 'absent');
  });

  it('renders keys with empty state when not in keyStates', () => {
    render(<Keyboard />);
    
    const keyA = screen.getByText('A').closest('[data-testid="key"]');
    expect(keyA).toHaveAttribute('data-state', 'empty');
  });

  it('handles multiple letter presses', () => {
    const handleLetterPress = vi.fn();
    render(<Keyboard onLetterPress={handleLetterPress} />);
    
    fireEvent.click(screen.getByText('K'));
    fireEvent.click(screen.getByText('A'));
    fireEvent.click(screen.getByText('L'));
    fireEvent.click(screen.getByText('E'));
    fireEvent.click(screen.getByText('M'));
    
    expect(handleLetterPress).toHaveBeenCalledTimes(5);
    expect(handleLetterPress).toHaveBeenNthCalledWith(1, 'K');
    expect(handleLetterPress).toHaveBeenNthCalledWith(2, 'A');
    expect(handleLetterPress).toHaveBeenNthCalledWith(3, 'L');
    expect(handleLetterPress).toHaveBeenNthCalledWith(4, 'E');
    expect(handleLetterPress).toHaveBeenNthCalledWith(5, 'M');
  });

  it('handles Turkish character presses', () => {
    const handleLetterPress = vi.fn();
    render(<Keyboard onLetterPress={handleLetterPress} />);
    
    fireEvent.click(screen.getByText('Ç'));
    fireEvent.click(screen.getByText('Ş'));
    fireEvent.click(screen.getByText('Ğ'));
    fireEvent.click(screen.getByText('Ü'));
    fireEvent.click(screen.getByText('Ö'));
    fireEvent.click(screen.getByText('İ'));
    fireEvent.click(screen.getByText('I'));
    
    expect(handleLetterPress).toHaveBeenCalledTimes(7);
    expect(handleLetterPress).toHaveBeenNthCalledWith(1, 'Ç');
    expect(handleLetterPress).toHaveBeenNthCalledWith(2, 'Ş');
    expect(handleLetterPress).toHaveBeenNthCalledWith(3, 'Ğ');
    expect(handleLetterPress).toHaveBeenNthCalledWith(4, 'Ü');
    expect(handleLetterPress).toHaveBeenNthCalledWith(5, 'Ö');
    expect(handleLetterPress).toHaveBeenNthCalledWith(6, 'İ');
    expect(handleLetterPress).toHaveBeenNthCalledWith(7, 'I');
  });

  it('updates key states when keyStates prop changes', () => {
    const { rerender } = render(<Keyboard />);
    
    const keyA = screen.getByText('A').closest('[data-testid="key"]');
    expect(keyA).toHaveAttribute('data-state', 'empty');
    
    const keyStates = new Map<string, TileState>([['A', 'correct']]);
    rerender(<Keyboard keyStates={keyStates} />);
    
    expect(keyA).toHaveAttribute('data-state', 'correct');
  });

  it('renders ENTER key with wide styling', () => {
    render(<Keyboard />);
    const enterKey = screen.getByText('GÖNDER').closest('[data-testid="key"]');
    expect(enterKey?.className).toContain('flex-1');
  });

  it('renders BACKSPACE key with wide styling', () => {
    render(<Keyboard />);
    const backspaceKey = screen.getByText('⌫').closest('[data-testid="key"]');
    expect(backspaceKey?.className).toContain('flex-1');
  });

  it('does not break when callbacks are not provided', () => {
    render(<Keyboard />);
    
    // Should not throw when clicking without handlers
    expect(() => {
      fireEvent.click(screen.getByText('A'));
      fireEvent.click(screen.getByText('GÖNDER'));
      fireEvent.click(screen.getByText('⌫'));
    }).not.toThrow();
  });
});
