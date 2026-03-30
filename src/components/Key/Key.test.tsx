import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Key } from './Key';

describe('Key', () => {
  it('renders regular letter key correctly', () => {
    render(<Key letter="A" onClick={() => {}} />);
    const key = screen.getByTestId('key');
    expect(key).toBeInTheDocument();
    expect(key).toHaveTextContent('A');
    expect(key).toHaveAttribute('data-key', 'A');
  });

  it('renders ENTER key with GÖNDER label', () => {
    render(<Key letter="ENTER" onClick={() => {}} isWide />);
    const key = screen.getByTestId('key');
    expect(key).toHaveTextContent('GÖNDER');
    expect(key).toHaveAttribute('data-key', 'ENTER');
  });

  it('renders BACKSPACE key with ⌫ label', () => {
    render(<Key letter="BACKSPACE" onClick={() => {}} isWide />);
    const key = screen.getByTestId('key');
    expect(key).toHaveTextContent('⌫');
    expect(key).toHaveAttribute('data-key', 'BACKSPACE');
  });

  it('renders Turkish characters correctly', () => {
    const turkishChars = ['Ç', 'Ş', 'Ğ', 'Ü', 'Ö', 'İ', 'I'];
    
    turkishChars.forEach((char) => {
      cleanup();
      render(<Key letter={char} onClick={() => {}} />);
      const key = screen.getByTestId('key');
      expect(key).toHaveTextContent(char);
    });
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Key letter="A" onClick={handleClick} />);
    const key = screen.getByTestId('key');
    
    fireEvent.click(key);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with empty state by default', () => {
    render(<Key letter="A" onClick={() => {}} />);
    const key = screen.getByTestId('key');
    expect(key).toHaveAttribute('data-state', 'empty');
  });

  it('renders with correct state (green)', () => {
    render(<Key letter="A" state="correct" onClick={() => {}} />);
    const key = screen.getByTestId('key');
    expect(key).toHaveAttribute('data-state', 'correct');
  });

  it('renders with present state (yellow)', () => {
    render(<Key letter="A" state="present" onClick={() => {}} />);
    const key = screen.getByTestId('key');
    expect(key).toHaveAttribute('data-state', 'present');
  });

  it('renders with absent state (gray)', () => {
    render(<Key letter="A" state="absent" onClick={() => {}} />);
    const key = screen.getByTestId('key');
    expect(key).toHaveAttribute('data-state', 'absent');
  });

  it('renders with filled state', () => {
    render(<Key letter="A" state="filled" onClick={() => {}} />);
    const key = screen.getByTestId('key');
    expect(key).toHaveAttribute('data-state', 'filled');
  });

  it('applies wide class for ENTER key', () => {
    render(<Key letter="ENTER" isWide onClick={() => {}} />);
    const key = screen.getByTestId('key');
    expect(key.className).toContain('flex-1');
  });

  it('applies wide class for BACKSPACE key', () => {
    render(<Key letter="BACKSPACE" isWide onClick={() => {}} />);
    const key = screen.getByTestId('key');
    expect(key.className).toContain('flex-1');
  });

  it('has regular width for letter keys', () => {
    render(<Key letter="A" onClick={() => {}} />);
    const key = screen.getByTestId('key');
    expect(key.className).toContain('w-8');
  });

  it('applies active state classes when isActive is true', () => {
    render(<Key letter="A" isActive onClick={() => {}} />);
    const key = screen.getByTestId('key');
    expect(key.className).toContain('scale-90');
  });

  it('has button type attribute', () => {
    render(<Key letter="A" onClick={() => {}} />);
    const key = screen.getByTestId('key');
    expect(key).toHaveAttribute('type', 'button');
  });
});
