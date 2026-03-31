import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Tile } from './Tile';

describe('Tile', () => {
  it('renders empty tile correctly', () => {
    render(<Tile letter="" state="empty" />);
    const tile = screen.getByTestId('tile');
    expect(tile).toBeInTheDocument();
    expect(tile).toHaveAttribute('data-state', 'empty');
  });

  it('renders filled tile with letter', () => {
    render(<Tile letter="A" state="filled" />);
    const tile = screen.getByTestId('tile');
    expect(tile).toHaveTextContent('A');
    expect(tile).toHaveAttribute('data-state', 'filled');
  });

  it('renders correct state tile (green)', () => {
    render(<Tile letter="K" state="correct" />);
    const tile = screen.getByTestId('tile');
    expect(tile).toHaveTextContent('K');
    expect(tile).toHaveAttribute('data-state', 'correct');
  });

  it('renders present state tile (yellow)', () => {
    render(<Tile letter="A" state="present" />);
    const tile = screen.getByTestId('tile');
    expect(tile).toHaveTextContent('A');
    expect(tile).toHaveAttribute('data-state', 'present');
  });

  it('renders absent state tile (gray)', () => {
    render(<Tile letter="L" state="absent" />);
    const tile = screen.getByTestId('tile');
    expect(tile).toHaveTextContent('L');
    expect(tile).toHaveAttribute('data-state', 'absent');
  });

  it('renders Turkish characters correctly', () => {
    const turkishChars = ['Ç', 'Ğ', 'İ', 'Ö', 'Ş', 'Ü', 'ı'];
    
    turkishChars.forEach((char) => {
      cleanup(); // Clean up previous render
      render(<Tile letter={char} state="filled" />);
      const tile = screen.getByTestId('tile');
      expect(tile).toHaveTextContent(char);
    });
  });

  it('applies flip animation when isFlipping is true', () => {
    render(<Tile letter="A" state="filled" isFlipping={true} delay={0} />);
    const tile = screen.getByTestId('tile');
    expect(tile.style.animation).toContain('flip');
  });

  it('applies bounce animation when isBouncing is true', () => {
    render(<Tile letter="A" state="filled" isBouncing={true} delay={0} />);
    const tile = screen.getByTestId('tile');
    expect(tile.style.animation).toContain('bounce');
  });

  it('applies delay to animation', () => {
    render(<Tile letter="A" state="filled" isFlipping={true} delay={500} />);
    const tile = screen.getByTestId('tile');
    expect(tile.style.animation).toContain('500ms');
  });
});
