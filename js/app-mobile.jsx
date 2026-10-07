// ============ 应用外壳与导航（手机版，无模拟状态栏） ============
const { useState } = React;

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
