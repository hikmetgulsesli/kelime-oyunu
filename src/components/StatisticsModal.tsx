import { useEffect, type MouseEvent } from 'react';
import type { Statistics } from '../types';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statistics: Statistics;
}

export function StatisticsModal({ isOpen, onClose, statistics }: StatisticsModalProps) {
  const maxDistribution = Math.max(...statistics.guessDistribution, 1);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleShare = async () => {
    const shareText = `Kelime Oyunu - ${statistics.gamesPlayed} oyun, %${statistics.winPercentage} kazanma oranı`;
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
      return;
    }
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // Clipboard write failed silently
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="statistics-modal-title"
      data-testid="statistics-modal"
    >
      <div className="bg-surface-container-high w-full max-w-md rounded-xl p-8 shadow-[0_-4px_40px_-10px_rgba(0,0,0,0.15)] flex flex-col gap-8 border border-white/5">
        <header className="flex flex-col gap-1">
          <h2 id="statistics-modal-title" className="text-xl font-bold tracking-tighter text-on-surface uppercase">İSTATİSTİKLER</h2>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="flex flex-col">
            <span className="text-3xl font-light text-on-surface" data-testid="stat-games-played">
              {statistics.gamesPlayed}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
              Oynanan
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-light text-on-surface" data-testid="stat-win-percentage">
              {statistics.winPercentage}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
              % Kazanma
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-light text-on-surface" data-testid="stat-current-streak">
              {statistics.currentStreak}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
              Mevcut Seri
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-light text-on-surface" data-testid="stat-max-streak">
              {statistics.maxStreak}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
              En İyi Seri
            </span>
          </div>
        </div>

        {/* Guess Distribution (Tahmin Dağılımı) */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[12px] font-bold tracking-widest text-on-surface uppercase">TAHMİN DAĞILIMI</h3>
          <div className="flex flex-col gap-2 w-full">
            {statistics.guessDistribution.map((count, index) => {
              const attemptNumber = index + 1;
              const widthPercentage = maxDistribution > 0 ? (count / maxDistribution) * 100 : 0;
              const isHighlighted = count > 0 && count === Math.max(...statistics.guessDistribution);

              return (
                <div key={attemptNumber} className="flex items-center gap-2" data-testid={`distribution-bar-${attemptNumber}`}>
                  <span className="w-3 text-[10px] font-bold text-on-surface-variant">{attemptNumber}</span>
                  <div className="flex-grow h-5 bg-surface-variant rounded-sm overflow-hidden flex items-center">
                    <div
                      className={`h-full flex items-center justify-end px-2 transition-all duration-500 ${
                        isHighlighted ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                      style={{ width: `${Math.max(widthPercentage, count > 0 ? 8 : 0)}%`, minWidth: count > 0 ? '20px' : '0' }}
                    >
                      <span className={`text-[10px] font-bold ${isHighlighted ? 'text-on-primary' : ''}`}>
                        {count > 0 ? count : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Action */}
        <div className="flex justify-between items-end gap-4 border-t border-white/5 pt-6">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">SONRAKİ KELİME</span>
            <span className="text-xl font-medium text-on-surface">00:00:00</span>
          </div>
          <div className="h-10 w-[1px] bg-white/10"></div>
          <button
            className="flex-grow bg-primary hover:bg-primary-container text-on-primary py-3 px-6 rounded-xl font-bold tracking-widest text-sm flex items-center justify-center gap-2 active:scale-98 transition-transform cursor-pointer"
            onClick={handleShare}
          >
            PAYLAŞ
            <span className="material-symbols-outlined text-sm">share</span>
          </button>
        </div>

        <button
          className="w-full text-[10px] font-bold tracking-[0.2em] text-on-surface-variant hover:text-on-surface transition-colors py-2 active:scale-95 cursor-pointer"
          onClick={onClose}
          data-testid="close-stats-button"
        >
          KAPAT
        </button>
      </div>
    </div>
  );
}
