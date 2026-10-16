import React, { useState, useEffect } from 'react';
import { Layers, PlusCircle, Database, Wifi, WifiOff } from 'lucide-react';

interface NavbarProps {
  currentTab: 'input' | 'decks' | 'study';
  onSelectTab: (tab: 'input' | 'decks') => void;
  onOpenBackup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenBackup }) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="app-container" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        {/* Brand */}
        <div
          onClick={() => onSelectTab('decks')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.25rem'
          }} className="font-jp">
            漢
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              KanjiFlash
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: -2 }}>
              Học Từ Vựng Nhật - Việt
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => onSelectTab('input')}
            className={`btn ${currentTab === 'input' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.875rem' }}
          >
            <PlusCircle size={17} />
            <span>Nhập liệu</span>
          </button>

          <button
            onClick={() => onSelectTab('decks')}
            className={`btn ${currentTab === 'decks' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.875rem' }}
          >
            <Layers size={17} />
            <span>Bộ thẻ</span>
          </button>

          <button
            onClick={onOpenBackup}
            className="btn btn-ghost"
            title="Sao lưu & Phục hồi dữ liệu JSON"
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.875rem' }}
          >
            <Database size={17} />
            <span className="hide-on-mobile">Sao lưu</span>
          </button>

          {/* Network status */}
          <div
            className={`badge ${isOnline ? 'badge-success' : 'badge-warning'}`}
            title={isOnline ? 'Đang kết nối Internet' : 'Đang ở chế độ Ngoại tuyến (Offline)'}
            style={{ marginLeft: '0.25rem', padding: '0.3rem 0.6rem' }}
          >
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span style={{ fontSize: '0.7rem' }}>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </nav>
      </div>
    </header>
  );
};
