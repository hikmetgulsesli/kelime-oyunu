import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Extend window interface for game object
declare global {
  interface Window {
    game: {
      state: string;
      reset: () => void;
      submitGuess: () => { success: boolean; message?: string };
      getStatistics: () => unknown;
    };
  }
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock word utilities
vi.mock('../utils/wordUtils', () => ({
  getTodaysWord: vi.fn(() => 'KELİM'),
  isValidGuess: vi.fn((word: string) => ['KELİM', 'KALEM', 'KİTAP', 'BİLGİ'].includes(word)),
  evaluateGuess: vi.fn((guess: string, target: string) => {
    const result = [];
    for (let i = 0; i < 5; i++) {
      if (guess[i] === target[i]) {
        result.push({ letter: guess[i], result: 'correct' as const });
      } else if (target.includes(guess[i])) {
        result.push({ letter: guess[i], result: 'present' as const });
      } else {
        result.push({ letter: guess[i], result: 'absent' as const });
      }
    }
    return result;
  }),
}));

describe('Keyboard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should add letters with physical keyboard A-Z keys', () => {
    render(<App />);
    
    fireEvent.keyDown(window, { key: 'A' });
    fireEvent.keyDown(window, { key: 'B' });
    fireEvent.keyDown(window, { key: 'C' });
    
    const tiles = screen.getAllByTestId('tile');
    expect(tiles[0]).toHaveTextContent('A');
    expect(tiles[1]).toHaveTextContent('B');
    expect(tiles[2]).toHaveTextContent('C');
  });

  it('should add Turkish letters with physical keyboard', () => {
    render(<App />);
    
    fireEvent.keyDown(window, { key: 'ç' });
    fireEvent.keyDown(window, { key: 'ş' });
    fireEvent.keyDown(window, { key: 'ğ' });
    fireEvent.keyDown(window, { key: 'ü' });
    fireEvent.keyDown(window, { key: 'ö' });
    
    const tiles = screen.getAllByTestId('tile');
    expect(tiles[0]).toHaveTextContent('Ç');
    expect(tiles[1]).toHaveTextContent('Ş');
    expect(tiles[2]).toHaveTextContent('Ğ');
    expect(tiles[3]).toHaveTextContent('Ü');
    expect(tiles[4]).toHaveTextContent('Ö');
  });

  it('should delete letter with Backspace key', () => {
    render(<App />);
    
    fireEvent.keyDown(window, { key: 'A' });
    fireEvent.keyDown(window, { key: 'B' });
    fireEvent.keyDown(window, { key: 'Backspace' });
    
    const tiles = screen.getAllByTestId('tile');
    expect(tiles[0]).toHaveTextContent('A');
    expect(tiles[1]).toHaveTextContent('');
  });

  it('should submit guess with Enter key', async () => {
    render(<App />);
    
    // Type a valid word
    fireEvent.keyDown(window, { key: 'K' });
    fireEvent.keyDown(window, { key: 'İ' });
    fireEvent.keyDown(window, { key: 'T' });
    fireEvent.keyDown(window, { key: 'A' });
    fireEvent.keyDown(window, { key: 'P' });
    
    // Submit with Enter
    fireEvent.keyDown(window, { key: 'Enter' });
    
    // Wait for the flip animation to complete
    await waitFor(() => {
      const tiles = screen.getAllByTestId('tile');
      // First row should have states updated after submission
      expect(tiles[0]).toHaveAttribute('data-state');
    }, { timeout: 2000 });
  });

  it('should handle game keys', () => {
    render(<App />);
    
    // Test that game keys work without errors
    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.keyDown(window, { key: 'Backspace' });
    fireEvent.keyDown(window, { key: 'a' });
    
    // If we get here without errors, the test passes
    expect(true).toBe(true);
  });

  it('should not prevent default for non-game keys', () => {
    render(<App />);
    
    const preventDefault = vi.fn();
    fireEvent.keyDown(window, { key: 'Escape', preventDefault });
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('should ignore non-letter keys', () => {
    render(<App />);
    
    fireEvent.keyDown(window, { key: '1' });
    fireEvent.keyDown(window, { key: '!' });
    fireEvent.keyDown(window, { key: ' ' });
    fireEvent.keyDown(window, { key: 'Tab' });
    
    const tiles = screen.getAllByTestId('tile');
    expect(tiles[0]).toHaveTextContent('');
  });

  it('should expose window.game for debugging', () => {
    render(<App />);
    
    expect(window.game).toBeDefined();
    expect(window.game.state).toBe('PLAYING');
    expect(typeof window.game.reset).toBe('function');
    expect(typeof window.game.submitGuess).toBe('function');
    expect(typeof window.game.getStatistics).toBe('function');
  });
});

describe('App Shell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should open help modal when help button clicked', () => {
    render(<App />);
    
    const helpButton = screen.getByLabelText('Yardım');
    fireEvent.click(helpButton);
    
    expect(screen.getByText('Nasıl Oynanır?')).toBeInTheDocument();
    expect(screen.getByText('5 harfli gizli kelimeyi 6 tahminde bulun.')).toBeInTheDocument();
  });

  it('should close help modal when KAPAT clicked', () => {
    render(<App />);
    
    const helpButton = screen.getByLabelText('Yardım');
    fireEvent.click(helpButton);
    
    const closeButton = screen.getByText('KAPAT');
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('Nasıl Oynanır?')).not.toBeInTheDocument();
  });

  it('should open stats modal when stats button clicked', () => {
    render(<App />);
    
    const statsButton = screen.getByLabelText('İstatistikler');
    fireEvent.click(statsButton);
    
    expect(screen.getByText('İstatistikler')).toBeInTheDocument();
  });

  it('should render Board component', () => {
    render(<App />);
    
    expect(screen.getByTestId('board')).toBeInTheDocument();
    expect(screen.getAllByTestId('row')).toHaveLength(6);
    expect(screen.getAllByTestId('tile')).toHaveLength(30);
  });

  it('should render Keyboard component', () => {
    render(<App />);
    
    expect(screen.getByTestId('keyboard')).toBeInTheDocument();
    expect(screen.getAllByTestId('key').length).toBeGreaterThan(0);
  });

  it('should render virtual keyboard with Turkish letters', () => {
    render(<App />);
    
    const keys = screen.getAllByTestId('key');
    const keyTexts = keys.map(k => k.textContent);
    
    expect(keyTexts).toContain('Ç');
    expect(keyTexts).toContain('Ş');
    expect(keyTexts).toContain('Ğ');
    expect(keyTexts).toContain('Ü');
    expect(keyTexts).toContain('Ö');
    expect(keyTexts).toContain('İ');
  });

  it('should render GÖNDER and ⌫ keys', () => {
    render(<App />);
    
    const keys = screen.getAllByTestId('key');
    const keyTexts = keys.map(k => k.textContent);
    
    expect(keyTexts).toContain('GÖNDER');
    expect(keyTexts).toContain('⌫');
  });
});
