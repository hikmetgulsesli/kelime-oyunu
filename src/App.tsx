import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, TileState, type Statistics } from './types/index';
import { StatisticsModal } from './components/StatisticsModal';
import { Toast, type ToastType } from './components/Toast';
import { Keyboard } from './components/Keyboard';

interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
}

function Header({ onStatsClick }: { onStatsClick: () => void }) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <header className="bg-surface-dim flex justify-between items-center w-full px-4 h-16 max-w-2xl mx-auto sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowHelp(true)}
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

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md">
          <div className="bg-surface-container-high w-full max-w-sm rounded-xl p-6 shadow-lg border border-outline-variant/10">
            <h2 className="text-xl font-bold text-on-surface mb-4">Nasıl Oynanır?</h2>
            <p className="text-on-surface-variant text-sm mb-4">
              5 harfli gizli kelimeyi 6 denemede bulun.
            </p>
            <div className="space-y-2 text-sm text-on-surface-variant">
              <p>🟩 Yeşil: Harf doğru yerde</p>
              <p>🟨 Sarı: Harf var ama yanlış yerde</p>
              <p>⬜ Gri: Harf yok</p>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full py-3 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 transition-all cursor-pointer"
            >
              KAPAT
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function Tile({ letter, state }: { letter: string; state: TileState }) {
  const stateClasses = {
    empty: 'bg-tile-empty border-2 border-tile-filled',
    filled: 'bg-tile-empty border-2 border-tile-filled text-on-surface',
    correct: 'bg-tile-correct text-white',
    present: 'bg-tile-present text-white',
    absent: 'bg-tile-absent text-white',
  };

  return (
    <div
      className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-2xl font-bold rounded-sm uppercase transition-all duration-300 ${stateClasses[state]}`}
    >
      {letter}
    </div>
  );
}

function GameGrid() {
  // Placeholder grid - will be managed by useGame hook later
  const grid = Array(6).fill(null).map(() =>
    Array(5).fill(null).map(() => ({ letter: '', state: 'empty' as TileState }))
  );

  return (
    <div className="grid grid-rows-6 gap-2">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-5 gap-2">
          {row.map((tile, colIndex) => (
            <Tile key={colIndex} letter={tile.letter} state={tile.state} />
          ))}
        </div>
      ))}
    </div>
  );
}

// Default statistics for initial state
const defaultStatistics: Statistics = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0],
  winPercentage: 0,
};

export default function App() {
  const [gameState] = useState<GameState>('IDLE');
  const [showStats, setShowStats] = useState(false);
  const [statistics, setStatistics] = useState<Statistics>(defaultStatistics);
  const [keyStates] = useState<Map<string, TileState>>(new Map());
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    isVisible: false,
  });
  const isFirstRender = useRef(true);

  // Load statistics from localStorage on mount
  useEffect(() => {
    if (!isFirstRender.current) return;
    isFirstRender.current = false;

    const stored = localStorage.getItem('kelime-oyunu-stats');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Use requestAnimationFrame to avoid synchronous setState
        requestAnimationFrame(() => {
          setStatistics({
            ...defaultStatistics,
            ...parsed,
          });
        });
      } catch (error) {
        console.error('Failed to parse statistics from localStorage:', error);
        requestAnimationFrame(() => {
          setStatistics(defaultStatistics);
        });
      }
    }
  }, []);

  // Expose showToast globally for game hook integration
  useEffect(() => {
    (window as unknown as { showToast?: (message: string, type: ToastType) => void }).showToast = (message: string, type: ToastType = 'info') => {
      setToast({ message, type, isVisible: true });
    };
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Keyboard event handlers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLetterPress = useCallback((_letter: string) => {
    // Placeholder - will be implemented with useGame hook
  }, []);

  const handleEnterPress = useCallback(() => {
    // Placeholder - will be implemented with useGame hook
  }, []);

  const handleBackspacePress = useCallback(() => {
    // Placeholder - will be implemented with useGame hook
  }, []);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col overflow-hidden">
      <Header onStatsClick={() => setShowStats(true)} />

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <GameGrid />
      </main>

      <div className="w-full max-w-lg mx-auto pb-6 px-2">
        <Keyboard
          onKeyPress={handleLetterPress}
          onEnter={handleEnterPress}
          onBackspace={handleBackspacePress}
          keyStates={keyStates}
        />
      </div>

      {/* Statistics Modal */}
      <StatisticsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        statistics={statistics}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Game State Display (for development) */}
      <div className="fixed bottom-4 left-4 text-xs text-on-surface-variant">
        Durum: {gameState}
      </div>
    </div>
  );
}
