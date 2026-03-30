import { useState, useEffect } from 'react';
import { GameState, TileState, Statistics } from './types';
import { useGame } from './hooks/useGame';

// Header Component
function Header({ 
  onStatsClick, 
  onHelpClick 
}: { 
  onStatsClick: () => void;
  onHelpClick: () => void;
}) {
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

// Tile Component
function Tile({ 
  letter, 
  state, 
  isFlipping = false,
  isBouncing = false,
  delay = 0 
}: { 
  letter: string; 
  state: TileState;
  isFlipping?: boolean;
  isBouncing?: boolean;
  delay?: number;
}) {
  const stateClasses = {
    empty: 'bg-surface-container-highest',
    filled: 'bg-surface-container-highest text-on-surface border-2 border-outline',
    correct: 'bg-primary text-on-primary',
    present: 'bg-secondary text-on-secondary',
    absent: 'bg-surface-variant text-on-surface-variant',
  };

  return (
    <div
      className={`w-[clamp(43px,12vw,58px)] h-[clamp(43px,12vw,58px)] flex items-center justify-center text-2xl font-bold rounded-sm uppercase transition-all duration-300 ${stateClasses[state]} ${
        isFlipping ? 'animate-flip' : ''
      } ${isBouncing ? 'animate-bounce-tile' : ''}`}
      style={{
        animationDelay: isFlipping || isBouncing ? `${delay}ms` : undefined,
      }}
      data-testid="tile"
      data-state={state}
    >
      {letter}
    </div>
  );
}

// Board Component
function Board({ 
  grid, 
  shakingRow,
  bouncingRow,
  flippingRow 
}: { 
  grid: { letter: string; state: TileState }[][];
  shakingRow?: number | null;
  bouncingRow?: number | null;
  flippingRow?: number | null;
}) {
  return (
    <div className="grid grid-rows-6 gap-2" data-testid="board">
      {grid.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`grid grid-cols-5 gap-2 ${shakingRow === rowIndex ? 'animate-shake' : ''}`}
          data-testid="row"
        >
          {row.map((tile, colIndex) => (
            <Tile
              key={colIndex}
              letter={tile.letter}
              state={tile.state}
              isFlipping={flippingRow === rowIndex}
              isBouncing={bouncingRow === rowIndex}
              delay={colIndex * 100}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Key Component
function Key({ 
  letter, 
  state = 'empty', 
  isWide = false, 
  onClick 
}: { 
  letter: string; 
  state?: TileState;
  isWide?: boolean;
  onClick: () => void;
}) {
  const stateClasses = {
    empty: 'bg-surface-container-highest text-on-surface',
    filled: 'bg-surface-container-highest text-on-surface border border-outline-variant',
    correct: 'bg-primary text-on-primary',
    present: 'bg-secondary text-on-secondary',
    absent: 'bg-surface-variant text-on-surface-variant',
  };

  const displayText = letter === 'ENTER' ? 'GÖNDER' 
    : letter === 'BACKSPACE' ? '⌫' 
    : letter;

  return (
    <button
      className={`flex items-center justify-center h-14 rounded-sm font-bold text-sm transition-all duration-100 ease-out select-none cursor-pointer hover:opacity-90 active:scale-95 ${stateClasses[state]} ${
        isWide ? 'flex-1 min-w-[3.5rem] px-2' : 'w-8 sm:w-10'
      }`}
      onClick={onClick}
      data-testid="key"
      data-key={letter}
      data-state={state}
      type="button"
    >
      {displayText}
    </button>
  );
}

// Keyboard Component
function Keyboard({ 
  onKeyPress, 
  keyboardState 
}: { 
  onKeyPress: (key: string) => void;
  keyboardState: Map<string, TileState>;
}) {
  const rows = [
    ['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', 'BACKSPACE'],
  ];

  const handleClick = (key: string) => {
    if (key === 'ENTER') {
      onKeyPress('Enter');
    } else if (key === 'BACKSPACE') {
      onKeyPress('Backspace');
    } else {
      onKeyPress(key);
    }
  };

  return (
    <div className="w-full max-w-[500px] mx-auto p-2 pb-8">
      <div className="flex flex-col gap-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1.5">
            {row.map((key) => (
              <Key
                key={key}
                letter={key}
                state={keyboardState.get(key) || 'empty'}
                isWide={key === 'ENTER' || key === 'BACKSPACE'}
                onClick={() => handleClick(key)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Toast Component
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

// Help Modal Component
function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md">
      <div className="bg-surface-container-high w-full max-w-sm rounded-xl p-6 shadow-lg border border-outline-variant/10 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-on-surface mb-4">Nasıl Oynanır?</h2>
        <p className="text-on-surface-variant text-sm mb-4">
          5 harfli gizli kelimeyi 6 denemede bulun.
        </p>
        <div className="space-y-3 text-sm text-on-surface-variant mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary text-on-primary flex items-center justify-center rounded-sm font-bold">A</div>
            <span>Yeşil: Harf doğru yerde</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-secondary text-on-secondary flex items-center justify-center rounded-sm font-bold">A</div>
            <span>Sarı: Harf var ama yanlış yerde</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-surface-variant text-on-surface-variant flex items-center justify-center rounded-sm font-bold">A</div>
            <span>Gri: Harf kelimede yok</span>
          </div>
        </div>
        <p className="text-on-surface-variant text-sm mb-4">
          Türkçe karakterler desteklenir: ç, ş, ğ, ü, ö, ı, İ
        </p>
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

// Statistics Modal Component
function StatisticsModal({ 
  statistics, 
  onClose, 
  gameState,
  targetWord,
  guessCount 
}: { 
  statistics: Statistics;
  onClose: () => void;
  gameState: GameState;
  targetWord: string;
  guessCount: number;
}) {
  const maxDistribution = Math.max(...statistics.guessDistribution, 1);
  
  // Calculate time until next word
  const [timeUntilNext, setTimeUntilNext] = useState('');
  
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilNext(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleShare = () => {
    const emoji = gameState === 'WIN' 
      ? statistics.guessDistribution.map((count, i) => 
          i === guessCount - 1 ? '🟩' : count > 0 ? '⬛' : '⬛'
        ).join('')
      : '⬛⬛⬛⬛⬛⬛';
    
    const text = `KELİME ${gameState === 'WIN' ? guessCount : 'X'}/6\n${emoji}`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

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

        {/* Guess Distribution */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-on-surface mb-2">Tahmin Dağılımı</h3>
          <div className="space-y-1">
            {statistics.guessDistribution.map((count, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant w-4">{i + 1}</span>
                <div className="flex-1 bg-surface-container-low rounded-sm h-5 overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 flex items-center justify-end px-1"
                    style={{ width: `${(count / maxDistribution) * 100}%` }}
                  >
                    {count > 0 && <span className="text-xs text-on-primary font-bold">{count}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Over Message */}
        {(gameState === 'WIN' || gameState === 'LOSE') && (
          <div className="border-t border-outline-variant/20 pt-4 mb-4">
            {gameState === 'WIN' ? (
              <div className="text-center">
                <p className="text-2xl font-bold text-primary mb-1">Tebrikler!</p>
                <p className="text-sm text-on-surface-variant">Kelimeyi {guessCount}. denemede buldun.</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-2xl font-bold text-error mb-1">Oyun Bitti</p>
                <p className="text-sm text-on-surface-variant">Kelime: <span className="font-bold text-on-surface">{targetWord}</span></p>
              </div>
            )}
          </div>
        )}

        {/* Next Word Timer & Share */}
        <div className="grid grid-cols-2 gap-4 items-center border-t border-outline-variant/20 pt-4">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-1">Sonraki Kelime</p>
            <p className="text-2xl font-bold font-headline tabular-nums">{timeUntilNext}</p>
          </div>
          <button 
            onClick={handleShare}
            className="bg-primary hover:brightness-110 active:scale-95 transition-all text-on-primary font-bold py-4 px-6 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>share</span>
            PAYLAŞ
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 text-on-surface-variant hover:text-on-surface transition-colors text-xs font-semibold tracking-widest uppercase cursor-pointer"
        >
          KAPAT
        </button>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const {
    state,
    grid,
    currentRow,
    keyboardState,
    statistics,
    addLetter,
    deleteLetter,
    submitGuess,
    targetWord,
    shakingRow,
    flippingRow,
    bouncingRow,
  } = useGame();

  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for game keys to avoid page scroll
      if (e.key === 'Enter' || e.key === 'Backspace' || /^[a-zA-ZçÇşŞğĞüÜöÖıİ]$/.test(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'Enter') {
        const result = submitGuess();
        if (!result.success && result.message) {
          setToast({ message: result.message, type: 'error' });
        }
      } else if (e.key === 'Backspace') {
        deleteLetter();
      } else if (/^[a-zA-ZçÇşŞğĞüÜöÖıİ]$/.test(e.key)) {
        addLetter(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addLetter, deleteLetter, submitGuess]);

  // Auto-show stats on win/lose
  useEffect(() => {
    if (state === 'WIN' || state === 'LOSE') {
      const timer = setTimeout(() => setShowStats(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleVirtualKeyPress = (key: string) => {
    if (key === 'Enter') {
      const result = submitGuess();
      if (!result.success && result.message) {
        setToast({ message: result.message, type: 'error' });
      }
    } else if (key === 'Backspace') {
      deleteLetter();
    } else {
      addLetter(key);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col overflow-hidden">
      <Header 
        onHelpClick={() => setShowHelp(true)}
        onStatsClick={() => setShowStats(true)}
      />
      
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <Board 
          grid={grid} 
          shakingRow={shakingRow}
          bouncingRow={bouncingRow}
          flippingRow={flippingRow}
        />
      </main>

      <Keyboard 
        onKeyPress={handleVirtualKeyPress}
        keyboardState={keyboardState}
      />

      {/* Modals */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      
      {showStats && (
        <StatisticsModal 
          statistics={statistics}
          onClose={() => setShowStats(false)}
          gameState={state}
          targetWord={targetWord}
          guessCount={currentRow + (state === 'WIN' ? 1 : 0)}
        />
      )}

      {/* Toast */}
      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'info'}
        visible={!!toast}
        onDismiss={() => setToast(null)}
      />
    </div>
  );
}
