// ============ 应用外壳与导航 ============
const { useState } = React;
function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="icons">
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="#111" strokeWidth="1.2">
          <rect x="0.6" y="6" width="2.6" height="3.4" fill="#111" stroke="none"></rect>
          <rect x="4.3" y="4" width="2.6" height="5.4" fill="#111" stroke="none"></rect>
          <rect x="8" y="2" width="2.6" height="7.4" fill="#111" stroke="none"></rect>
          <rect x="11.7" y="0.2" width="2.6" height="9.2" fill="none"></rect>
        </svg>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="#111" strokeWidth="1.2">
          <path d="M1 3.4a9 9 0 0 1 12 0"></path>
          <path d="M3.2 5.6a6 6 0 0 1 7.6 0"></path>
          <circle cx="7" cy="8" r="0.9" fill="#111" stroke="none"></circle>
        </svg>
        <svg width="22" height="10" viewBox="0 0 22 10" fill="none" stroke="#111" strokeWidth="1.1">
          <rect x="0.6" y="0.6" width="17" height="8.8" rx="2.4"></rect>
          <rect x="2.4" y="2.4" width="10.5" height="5.2" fill="#111" stroke="none"></rect>
          <path d="M19.4 3.4v3.2" strokeLinecap="round"></path>
        </svg>
      </span>
    </div>
  );
}

const TABS = [
  { key: 'home', label: 'WHATSONG', icon: 'home' },
  { key: 'play', label: '玩法', icon: 'game' },
  { key: 'mine', label: '我的', icon: 'user' },
];;

function TabBar({ active, onChange }) {
  return (
    <div className="tabbar">
      {TABS.map(t => (
        <button key={t.key} className={`tab-item ${active === t.key ? 'active' : ''}`} onClick={() => onChange(t.key)}>
          <Icon name={t.icon} size={20} />
          <span className="t-label">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

function WhatSongApp() {
  const store = useStoreState();
  const [tab, setTab] = useState('home');
  const [overlay, setOverlay] = useState(null); // {type:'detail'|'trash'|'tags'|'records', playlistId?}

  const loggedIn = !!store.state.user;

  const openPlaylist = (playlistId) => setOverlay({ type: 'detail', playlistId });
  const openWheel = () => setOverlay({ type: 'wheel' });
  const openAllSongs = () => setOverlay({ type: 'all' });

  const renderScreen = () => {
    if (!loggedIn) return <LoginPage />;
    if (overlay?.type === 'detail') {
      return <DetailPage playlistId={overlay.playlistId} onBack={() => setOverlay(null)} />;
    }
    if (overlay?.type === 'wheel') return <WheelPlayPage onBack={() => setOverlay(null)} onOpenPlaylist={openPlaylist} />;
    if (overlay?.type === 'trash') return <TrashPage onBack={() => setOverlay(null)} />;
    if (overlay?.type === 'tags') return <TagManagePage onBack={() => setOverlay(null)} />;
    if (overlay?.type === 'records') {
      return <RecordsPage onBack={() => setOverlay(null)} onOpenPlaylist={openPlaylist} />;
    }
    if (overlay?.type === 'all') return <AllSongsPage onBack={() => setOverlay(null)} />;
    if (tab === 'home') return <HomePage onOpenPlaylist={openPlaylist} onOpenAllSongs={openAllSongs} />;
    if (tab === 'play') return <PlayPage onOpenWheel={openWheel} />;
    return <MinePage onOpenSub={(type) => setOverlay({ type })} onLogout={() => { store.actions.logout(); setOverlay(null); }} />;
  };

  const showTabBar = loggedIn && !overlay;

  return (
    <StoreContext.Provider value={store}>
      <StatusBar />
      {renderScreen()}
      {showTabBar ? <TabBar active={tab} onChange={(k) => { setTab(k); setOverlay(null); }} /> : null}
    </StoreContext.Provider>
  );
}

function App() {
  return (
    <ToastProvider>
      <WhatSongApp />
    </ToastProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
