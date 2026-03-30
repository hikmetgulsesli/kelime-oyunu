import { useState, useEffect, useCallback } from 'react';
import type { GameState, TileState, Statistics } from './types';
import { useGame } from './hooks/useGame';

// Toast component
interface ToastProps {
  message: string;
  type: 'info' | 'success' | 'error';
  visible: boolean;
  onDismiss: () => void;
}

function Toast({ message, type, visible, onDismiss }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDismiss, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);

  const bgColors = {
    info: 'bg-surface-container-high',
    success: 'bg-primary',
    error: 'bg-error-container',
  };

  const textColors = {
    info: 'text-on-surface',
    success: 'text-on-primary',
    error: 'text-on-error',
  };

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${bgColors[type]} ${textColors[type]} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      {message}
    </div>
  );
}

// Board component
interface BoardProps {
  grid: { letter: string; state: TileState }[][];
  currentRow: number;
  shakingRow?: number | null;
  bouncingRow?: number | null;
  flippingRow?: number | null;
}

function Board({ grid, shakingRow, bouncingRow, flippingRow }: BoardProps) {
  return (
    <div className="grid grid-rows-6 gap-2" data-testid="board">
      {grid.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`grid grid-cols-5 gap-2 ${shakingRow === rowIndex ? 'animate-shake' : ''}`}
          data-testid="row"
        >
          {row.map((tile, colIndex) => {
            const isFlipping = flippingRow === rowIndex;
            const isBouncing = bouncingRow === rowIndex;
            const delay = colIndex * 100;

            const stateClasses = {
              empty: 'bg-surface-container-highest',
              filled: 'bg-surface-container-highest text-on-surface border-2 border-outline',
              correct: 'bg-primary text-on-primary',
              present: 'bg-secondary text-on-secondary',
              absent: 'bg-surface-variant text-on-surface-variant',
            };

            return (
              <div
                key={colIndex}
                className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-2xl font-bold rounded-sm uppercase transition-all duration-300 ${stateClasses[tile.state]} ${
                  isFlipping ? 'animate-flip' : ''
                } ${isBouncing ? 'animate-bounce-tile' : ''}`}
                style={{
                  animationDelay: isFlipping || isBouncing ? `${delay}ms` : undefined,
                }}
                data-testid="tile"
                data-state={tile.state}
              >
                {tile.letter}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Keyboard component
interface KeyboardProps {
  onKeyPress: (key: string) => void;
  keyboardState: Map<string, TileState>;
}

function Keyboard({ onKeyPress, keyboardState }: KeyboardProps) {
  const rows = [
    ['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', 'BACKSPACE'],
  ];

  const getKeyState = (key: string): TileState => {
    if (key === 'ENTER' || key === 'BACKSPACE') return 'empty';
    return keyboardState.get(key) || 'empty';
  };

  const getKeyClasses = (key: string, state: TileState): string => {
    const baseClasses = 'flex items-center justify-center h-14 rounded-sm font-bold text-sm transition-all duration-100 ease-out select-none cursor-pointer hover:opacity-90 active:scale-95';
    
    const widthClasses = key === 'ENTER' || key === 'BACKSPACE'
      ? 'flex-1 min-w-[3.5rem] px-2'
      : 'w-8 sm:w-10';

    const stateClasses: Record<TileState, string> = {
      correct: 'bg-primary text-on-primary',
      present: 'bg-secondary text-on-secondary',
      absent: 'bg-surface-variant text-on-surface-variant',
      filled: 'bg-surface-container-highest text-on-surface border border-outline-variant',
      empty: 'bg-surface-container-highest text-on-surface',
    };

    return `${baseClasses} ${widthClasses} ${stateClasses[state]}`;
  };

  const getDisplayText = (key: string): string => {
    if (key === 'ENTER') return 'GÖNDER';
    if (key === 'BACKSPACE') return '⌫';
    return key;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-2 pb-24" data-testid="keyboard">
      <div className="flex flex-col gap-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1.5">
            {row.map((key) => {
              const state = getKeyState(key);
              return (
                <button
                  key={key}
                  onClick={() => onKeyPress(key)}
                  className={getKeyClasses(key, state)}
                  data-testid="key"
                  data-key={key}
                  data-state={state}
                  type="button"
                >
                  {getDisplayText(key)}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Statistics Modal component
interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statistics: {
    gamesPlayed: number;
    gamesWon: number;
    currentStreak: number;
    maxStreak: number;
    guessDistribution: number[];
    winPercentage: number;
  };
}

function StatisticsModal({ isOpen, onClose, statistics }: StatisticsModalProps) {
  if (!isOpen) return null;

  const maxDistribution = Math.max(...statistics.guessDistribution, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md">
      <div className="bg-surface-container-high w-full max-w-sm rounded-xl p-6 shadow-lg border border-outline-variant/10">
        <h2 className="text-xl font-bold text-on-surface mb-4">İstatistikler</h2>
        
        <div className="grid grid-cols-4 gap-4 text-center mb-6">
          <div>
            <div className="text-3xl font-bold text-on-surface">{statistics.gamesPlayed}</div>
            <div className="text-xs text-on-surface-variant">Oyun</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-on-surface">{statistics.winPercentage}</div>
            <div className="text-xs text-on-surface-variant">Kazanma %</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-on-surface">{statistics.currentStreak}</div>
            <div className="text-xs text-on-surface-variant">Seri</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-on-surface">{statistics.maxStreak}</div>
            <div className="text-xs text-on-surface-variant">En İyi</div>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-on-surface mb-3">Tahmin Dağılımı</h3>
        <div className="space-y-2 mb-6">
          {statistics.guessDistribution.map((count, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm text-on-surface-variant w-4">{index + 1}</span>
              <div className="flex-1 h-5 bg-surface-container rounded-sm overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(count / maxDistribution) * 100}%` }}
                />
              </div>
              <span className="text-sm text-on-surface w-6 text-right">{count}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 transition-all cursor-pointer"
        >
          KAPAT
        </button>
      </div>
    </div>
  );
}

// Help Modal component
interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md">
      <div className="bg-surface-container-high w-full max-w-sm rounded-xl p-6 shadow-lg border border-outline-variant/10 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-on-surface mb-4">Nasıl Oynanır?</h2>
        
        <p className="text-on-surface-variant text-sm mb-4">
          5 harfli gizli kelimeyi 6 tahminde bulun.
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-on-primary flex items-center justify-center font-bold rounded-sm">A</div>
            <span className="text-sm text-on-surface-variant">Yeşil: Harf doğru yerde</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary text-on-secondary flex items-center justify-center font-bold rounded-sm">B</div>
            <span className="text-sm text-on-surface-variant">Sarı: Harf var ama yanlış yerde</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-variant text-on-surface-variant flex items-center justify-center font-bold rounded-sm">C</div>
            <span className="text-sm text-on-surface-variant">Gri: Harf kelimede yok</span>
          </div>
        </div>

        <div className="text-sm text-on-surface-variant mb-6 space-y-2">
          <p>• Her tahmin 5 harfli bir kelime olmalı</p>
          <p>• Tahmininizi göndermek için GÖNDER tuşuna basın</p>
          <p>• Fiziksel klavyeyi de kullanabilirsiniz</p>
          <p>• Türkçe karakterler desteklenir: ç, ş, ğ, ü, ö, ı, i</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 transition-all cursor-pointer"
        >
          KAPAT
        </button>
      </div>
    </div>
  );
}

// Header component
interface HeaderProps {
  onHelpClick: () => void;
  onStatsClick: () => void;
}

function Header({ onHelpClick, onStatsClick }: HeaderProps) {
  return (
    <header className="bg-surface-dim flex justify-between items-center w-full px-4 h-16 max-w-2xl mx-auto sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={onHelpClick}
          className="text-on-surface hover:bg-surface-variant/20 transition-colors rounded-full p-2 cursor-pointer"
          aria-label="Yardım"
        >
          <span className="material-symbols-outlined text-2xl">help</span>
        </button>
      </div>
      <h1 className="text-2xl font-black tracking-widest text-on-surface font-headline">KELİME</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={onStatsClick}
          className="text-primary hover:bg-surface-variant/20 transition-colors rounded-full p-2 cursor-pointer"
          aria-label="İstatistikler"
        >
          <span className="material-symbols-outlined text-2xl">equalizer</span>
        </button>
        <button
          onClick={() => {}}
          className="text-on-surface hover:bg-surface-variant/20 transition-colors rounded-full p-2 cursor-pointer"
          aria-label="Ayarlar"
        >
          <span className="material-symbols-outlined text-2xl">settings</span>
        </button>
      </div>
    </header>
  );
}

// Main App component
export default function App() {
  const {
    state,
    grid,
    currentRow,
    keyboardState,
    addLetter,
    deleteLetter,
    submitGuess,
    reset,
    getStatistics,
    shakingRow,
    flippingRow,
    bouncingRow,
    toast,
    dismissToast,
  } = useGame();

  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [statistics, setStatistics] = useState(getStatistics());

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for game keys to avoid page scroll
      if (e.key === 'Enter' || e.key === 'Backspace' || /^[a-zA-ZçşğüöıÇŞĞÜÖİ]$/.test(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'Enter') {
        submitGuess();
      } else if (e.key === 'Backspace') {
        deleteLetter();
      } else if (/^[a-zA-ZçşğüöıÇŞĞÜÖİ]$/.test(e.key)) {
        addLetter(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addLetter, deleteLetter, submitGuess]);

  // Handle virtual keyboard
  const handleKeyPress = useCallback((key: string) => {
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      deleteLetter();
    } else {
      addLetter(key);
    }
  }, [addLetter, deleteLetter, submitGuess]);

  // Handle stats click
  const handleStatsClick = useCallback(() => {
    setStatistics(getStatistics());
    setShowStats(true);
  }, [getStatistics]);

  // Expose game state to window for debugging/testing
  useEffect(() => {
    (window as unknown as { game: {
      state: GameState;
      reset: () => void;
      submitGuess: () => { success: boolean; message?: string };
      getStatistics: () => Statistics;
    }}).game = {
      state,
      reset,
      submitGuess,
      getStatistics,
    };
  }, [state, reset, submitGuess, getStatistics]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col overflow-hidden">
      <Header onHelpClick={() => setShowHelp(true)} onStatsClick={handleStatsClick} />
      
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <Board 
          grid={grid} 
          currentRow={currentRow}
          shakingRow={shakingRow}
          flippingRow={flippingRow}
          bouncingRow={bouncingRow}
        />
      </main>

      <Keyboard onKeyPress={handleKeyPress} keyboardState={keyboardState} />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onDismiss={dismissToast}
        />
      )}

      {/* Modals */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <StatisticsModal 
        isOpen={showStats} 
        onClose={() => setShowStats(false)} 
        statistics={statistics}
      />

      {/* Game Over Overlay */}
      {(state === 'WIN' || state === 'LOSE') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md">
          <div className="bg-surface-container-high w-full max-w-sm rounded-xl p-8 shadow-lg border border-outline-variant/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
            <div className="text-center">
              <h2 className="text-5xl font-extrabold tracking-tighter text-on-surface mb-2 font-headline uppercase italic">
                {state === 'WIN' ? 'TEBRİKLER!' : 'BİTTİ'}
              </h2>
              <p className="text-on-surface-variant text-sm mb-8 font-medium">
                {state === 'WIN' 
                  ? `Kelimeyi ${currentRow + 1}. denemede buldun.` 
                  : `Doğru kelime: ${grid.flat().map(t => t.letter).join('')}`}
              </p>
              
              <button
                onClick={() => {
                  reset();
                  setShowStats(false);
                }}
                className="bg-primary hover:brightness-110 active:scale-95 transition-all text-on-primary font-bold py-4 px-6 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mx-auto"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>replay</span>
                YENİDEN OYNA
              </button>
            </div>
            <button 
              onClick={() => setShowStats(true)}
              className="mt-8 w-full py-3 text-on-surface-variant hover:text-on-surface transition-colors text-xs font-semibold tracking-widest uppercase"
            >
              İSTATİSTİKLERİ GÖR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
