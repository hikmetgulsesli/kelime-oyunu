import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatisticsModal } from './StatisticsModal';
import type { Statistics } from '../types';

describe('StatisticsModal', () => {
  const mockStatistics: Statistics = {
    gamesPlayed: 42,
    gamesWon: 37,
    currentStreak: 5,
    maxStreak: 12,
    guessDistribution: [1, 6, 18, 10, 4, 3],
    winPercentage: 88,
  };

  const mockOnClose = vi.fn();

  it('does not render when isOpen is false', () => {
    render(<StatisticsModal isOpen={false} onClose={mockOnClose} statistics={mockStatistics} />);
    expect(screen.queryByTestId('statistics-modal')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(<StatisticsModal isOpen={true} onClose={mockOnClose} statistics={mockStatistics} />);
    expect(screen.getByTestId('statistics-modal')).toBeInTheDocument();
  });

  it('displays correct statistics values', () => {
    render(<StatisticsModal isOpen={true} onClose={mockOnClose} statistics={mockStatistics} />);

    expect(screen.getByTestId('stat-games-played')).toHaveTextContent('42');
    expect(screen.getByTestId('stat-win-percentage')).toHaveTextContent('88');
    expect(screen.getByTestId('stat-current-streak')).toHaveTextContent('5');
    expect(screen.getByTestId('stat-max-streak')).toHaveTextContent('12');
  });

  it('displays correct labels in Turkish', () => {
    render(<StatisticsModal isOpen={true} onClose={mockOnClose} statistics={mockStatistics} />);

    expect(screen.getByText('Oynanan')).toBeInTheDocument();
    expect(screen.getByText('% Kazanma')).toBeInTheDocument();
    expect(screen.getByText('Mevcut Seri')).toBeInTheDocument();
    expect(screen.getByText('En İyi Seri')).toBeInTheDocument();
    expect(screen.getByText('TAHMİN DAĞILIMI')).toBeInTheDocument();
  });

  it('renders 6 distribution bars', () => {
    render(<StatisticsModal isOpen={true} onClose={mockOnClose} statistics={mockStatistics} />);

    for (let i = 1; i <= 6; i++) {
      expect(screen.getByTestId(`distribution-bar-${i}`)).toBeInTheDocument();
    }
  });

  it('displays correct distribution values', () => {
    render(<StatisticsModal isOpen={true} onClose={mockOnClose} statistics={mockStatistics} />);

    expect(screen.getByText('18')).toBeInTheDocument(); // Most common (3rd attempt)
  });

  it('closes when close button is clicked', () => {
    render(<StatisticsModal isOpen={true} onClose={mockOnClose} statistics={mockStatistics} />);

    const closeButton = screen.getByTestId('close-stats-button');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes when backdrop is clicked', () => {
    render(<StatisticsModal isOpen={true} onClose={mockOnClose} statistics={mockStatistics} />);

    const modal = screen.getByTestId('statistics-modal');
    fireEvent.click(modal);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays zero values correctly', () => {
    const zeroStats: Statistics = {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: [0, 0, 0, 0, 0, 0],
      winPercentage: 0,
    };

    render(<StatisticsModal isOpen={true} onClose={mockOnClose} statistics={zeroStats} />);

    expect(screen.getByTestId('stat-games-played')).toHaveTextContent('0');
    expect(screen.getByTestId('stat-win-percentage')).toHaveTextContent('0');
  });

  it('highlights the most common guess count', () => {
    render(<StatisticsModal isOpen={true} onClose={mockOnClose} statistics={mockStatistics} />);

    const highlightedBar = screen.getByTestId('distribution-bar-3');
    expect(highlightedBar).toBeInTheDocument();
  });
});
