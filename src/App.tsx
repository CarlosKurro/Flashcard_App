import { useState, useEffect } from 'react';
import { Deck } from './types';
import { getAllDecks } from './storage/storageService';
import { Navbar } from './components/Navbar';
import { InputView } from './views/InputView';
import { DecksView } from './views/DecksView';
import { StudyView } from './views/StudyView';
import { BackupModal } from './components/BackupModal';

export function App() {
  const [currentTab, setCurrentTab] = useState<'input' | 'decks' | 'study'>('decks');
  const [studyDeckId, setStudyDeckId] = useState<string | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshDecks = async () => {
    try {
      const data = await getAllDecks();
      setDecks(data);
    } catch (err) {
      console.error('Error refreshing decks:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await refreshDecks();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleStartStudy = (deckId: string) => {
    setStudyDeckId(deckId);
    setCurrentTab('study');
  };

  const handleExitStudy = () => {
    setStudyDeckId(null);
    setCurrentTab('decks');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setStudyDeckId(null);
          setCurrentTab(tab);
        }}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      <main className="app-container" style={{ flex: 1, width: '100%' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
            Đang khởi động ứng dụng...
          </div>
        ) : (
          <>
            {currentTab === 'study' && studyDeckId ? (
              <StudyView
                deckId={studyDeckId}
                onExit={handleExitStudy}
                onCardsUpdated={refreshDecks}
              />
            ) : currentTab === 'input' ? (
              <InputView
                decks={decks}
                onRefreshDecks={refreshDecks}
                onNavigateToStudy={handleStartStudy}
                onNavigateToDecks={() => setCurrentTab('decks')}
              />
            ) : (
              <DecksView
                decks={decks}
                onRefreshDecks={refreshDecks}
                onStudyDeck={handleStartStudy}
                onNavigateToInput={() => setCurrentTab('input')}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '1.5rem 1rem',
        background: 'rgba(11, 15, 25, 0.95)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
      }}>
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
          <div>
            <strong>KanjiFlash PWA</strong> • Flashcard học từ vựng tiếng Nhật thông minh cho người Việt
          </div>
          <div>
            Dữ liệu lưu trữ cục bộ trên thiết bị (IndexedDB) • Hỗ trợ học thẻ hoàn toàn ngoại tuyến (Offline)
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
            OCR bởi Tesseract.js (Apache 2.0) • Nguồn từ điển: JMdict (EDRDG CC BY-SA 4.0) & Mazii API
          </div>
        </div>
      </footer>

      {/* Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataRestored={refreshDecks}
      />
    </div>
  );
}

export default App;
