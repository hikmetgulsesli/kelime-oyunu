import { useState, useCallback } from 'react';
import { GameState, TileState } from './types';
import { Keyboard } from './components/Keyboard/Keyboard';

function Header() {
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);

  return (
    <header className="bg-surface-dim flex justify-between items-center w-full px-4 h-16 max-w-2xl mx-auto sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowHelp(true)}
          className="text-on-surface hover:bg-surface-variant/20 transition-colors rounded-full p-2 cursor-pointer"
          aria-label="Yardım"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      <h1 className="text-2xl font-black tracking-widest text-on-surface font-headline">KELİME</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowStats(true)}
          className="text-primary hover:bg-surface-variant/20 transition-colors rounded-full p-2 cursor-pointer"
          aria-label="İstatistikler"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
        <button
          onClick={() => {}}
          className="text-on-surface hover:bg-surface-variant/20 transition-colors rounded-full p-2 cursor-pointer"
          aria-label="Ayarlar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
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
              className="mt-6 w-full py-3 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 transition-all"
            >
              KAPAT
            </button>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md">
          <div className="bg-surface-container-high w-full max-w-sm rounded-xl p-6 shadow-lg border border-outline-variant/10">
            <h2 className="text-xl font-bold text-on-surface mb-4">İstatistikler</h2>
            <div className="grid grid-cols-4 gap-4 text-center mb-6">
              <div>
                <div className="text-3xl font-bold text-on-surface">0</div>
                <div className="text-xs text-on-surface-variant">Oyun</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-on-surface">0</div>
                <div className="text-xs text-on-surface-variant">Kazanma %</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-on-surface">0</div>
                <div className="text-xs text-on-surface-variant">Seri</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-on-surface">0</div>
                <div className="text-xs text-on-surface-variant">En İyi</div>
              </div>
            </div>
            <button
              onClick={() => setShowStats(false)}
              className="w-full py-3 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 transition-all"
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

export default function App() {
  const [gameState] = useState<GameState>('IDLE');
  const [keyStates] = useState<Map<string, TileState>>(new Map());

  const handleKeyPress = useCallback((key: string) => {
    // Placeholder - will be implemented with useGame hook
    console.log('Key pressed:', key);
  }, []);

  const handleEnter = useCallback(() => {
    // Placeholder - will be implemented with useGame hook
    console.log('Enter pressed');
  }, []);

  const handleBackspace = useCallback(() => {
    // Placeholder - will be implemented with useGame hook
    console.log('Backspace pressed');
  }, []);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col overflow-hidden">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <GameGrid />
      </main>

      <Keyboard 
        onKeyPress={handleKeyPress}
        onEnter={handleEnter}
        onBackspace={handleBackspace}
        keyStates={keyStates}
      />

      {/* Game State Display (for development) */}
      <div className="fixed bottom-4 left-4 text-xs text-on-surface-variant">
        Durum: {gameState}
      </div>
    </div>
  );
}
