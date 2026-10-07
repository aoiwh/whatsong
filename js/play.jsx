// ============ 玩法页：玩法卡片列表 + 大转盘选歌 ============
const { useState, useEffect, useRef, useCallback, useContext, useMemo } = React;

// —— 玩法清单：后续新增玩法在此追加一项即可，自动排成两列 ——
const PLAY_LIST = [
  { key: 'wheel', name: '大转盘选歌', desc: '选定歌单，让转盘替你决定下一首', ready: true },
];

function PlayPage({ onOpenWheel }) {
  const toast = useToast();

  return (
    <div className="screen">
      <div className="scroll-area">
        <div className="page-body">
          <div className="play-grid">
            {PLAY_LIST.map(m => m.ready ? (
              <button key={m.key} className="card play-card" onClick={() => onOpenWheel && onOpenWheel(m.key)}>
                <span className="postcard-cover">
                  <PhImg w={153} h={112} label={m.name} radius={6} className="postcard-img" />
                  <span className="postcard-stamp"><Icon name="disc" size={10} /></span>
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3, width: '100%' }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</span>
                  <span className="muted" style={{ textAlign: 'left' }}>{m.desc}</span>
                </span>
              </button>
            ) : (
              <button key={m.key} className="card play-card" onClick={() => toast(`「${m.name}」玩法正在开发中，敬请期待`)}>
                <span className="postcard-cover">
                  <span style={{ display: 'flex', width: '100%', height: 112, alignItems: 'center', justifyContent: 'center', color: 'var(--ph)', borderRadius: 6, border: '1px dashed var(--line-2)' }}>
                    <Icon name={m.icon} size={26} />
                  </span>
                  <span className="dev-badge postcard-badge">待开发</span>
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3, width: '100%' }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</span>
                  <span className="muted" style={{ textAlign: 'left' }}>{m.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// —— 大转盘选歌：从玩法卡片点入的具体页面 ——
function WheelPlayPage({ onBack, onOpenPlaylist }) {
  const { state, actions } = useContext(StoreContext);
  const toast = useToast();
  const allTags = useAllTags(state);

  const [playlistId, setPlaylistId] = useState(state.playlists[0]?.id || '');
  const playlist = state.playlists.find(p => p.id === playlistId);

  const [showPicker, setShowPicker] = useState(false);  // 歌单选择弹窗
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [feedbackSong, setFeedbackSong] = useState(null); // 结果页演唱反馈
  const [syncSong, setSyncSong] = useState(null);        // 是否同步到所有歌单
  const [pendingFeedback, setPendingFeedback] = useState(null);

  // 转盘最多 8 格；歌曲不足时循环填充
  const wheelSongs = playlist && playlist.songs.length > 0
    ? Array.from({ length: Math.max(2, Math.min(8, playlist.songs.length)) },
        (_, i) => playlist.songs[i % playlist.songs.length])
    : [];

  const spin = () => {
    if (spinning || wheelSongs.length === 0) return;
    const step = 360 / wheelSongs.length;
    const target = Math.floor(Math.random() * wheelSongs.length);
    const center = target * step + step / 2;
    let extra = 360 * 4 + ((-center - rotation) % 360 + 360) % 360;
    setSpinning(true);
    setRotation(rotation + extra);
    setTimeout(() => {
      setSpinning(false);
      setResult(wheelSongs[target]);
    }, 3700);
  };

  return (
    <div className="screen">
      <AppHeader title="大转盘选歌" onBack={onBack} />
      <div className="scroll-area">
        <div className="page-body">

          <div className="card pad">
            <div className="field-label"><span>选择歌单</span><span className="muted">点击切换用于转盘的歌单</span></div>
            <button className="btn" style={{ width: '100%', justifyContent: 'space-between' }}
              onClick={() => setShowPicker(true)}>
              <span className="row-flex" style={{ gap: 6 }}>
                <Icon name="disc" size={12} /> {playlist ? playlist.name : '未选择歌单'}
              </span>
              <span className="row-flex" style={{ gap: 6 }}>
                {playlist ? <span className="muted">{playlist.songs.length} 首</span> : null}
                <Icon name="chevron" size={12} color="#B9B9B9" />
              </span>
            </button>

            <div className="divider"></div>

            {wheelSongs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0 26px' }}>
                <div className="muted" style={{ margin: '0 0 12px' }}>这个歌单还没有歌曲，无法启动转盘</div>
                <button className="btn btn-sm" onClick={() => onOpenPlaylist(playlistId)}>去添加歌曲</button>
              </div>
            ) : (
              <>
                <div className="wheel-wrap">
                  <div className="wheel-pointer"></div>
                  <svg className="wheel-disc" viewBox="0 0 270 270"
                    style={{ transform: `rotate(${rotation}deg)` }}>
                    <WheelSectors songs={wheelSongs} />
                  </svg>
                  <button className="wheel-hub" onClick={spin} disabled={spinning}>
                    {spinning ? <span className="mono" style={{ fontSize: 10 }}>···</span> : <span>开始</span>}
                  </button>
                </div>
                <div className="muted" style={{ textAlign: 'center' }}>
                  {spinning ? '转盘旋转中…' : `共 ${wheelSongs.length} 格 · 点击「开始」随机选歌`}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {result && !spinning ? (
        <div className="modal-mask center" onClick={() => setResult(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 300 }}>
            <div className="modal-head"><span className="m-title">本轮选中</span></div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '8px 20px 20px' }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{result.name}</div>
              <div className="muted" style={{ marginTop: 2 }}>
                {result.artist} · <span className="mono">{result.duration}</span> · 来自「{playlist.name}」
              </div>
              <div className="s-tags" style={{ justifyContent: 'center', marginTop: 6 }}>
                {result.tags.map(t => <span key={t} className="tag-mini">#{t}</span>)}
              </div>
              <div className="row-flex" style={{ marginTop: 6, justifyContent: 'center' }}>
                <Stars value={result.rating} size={13} />
                <span className="muted">上次自评 · 已唱 {result.times} 次</span>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn" style={{ flex: 1 }} onClick={() => { setResult(null); spin(); }}>
                <Icon name="play" size={12} /> 再转一次
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setFeedbackSong(result)}>
                <Icon name="mic" size={12} /> 演唱反馈
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showPicker ? (
        <Modal title="选择歌单" onClose={() => setShowPicker(false)}>
          <div className="muted" style={{ marginBottom: 10 }}>上下滑动选择用于转盘的歌单</div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {state.playlists.map(p => (
              <button key={p.id} className="list-row" style={{ width: '100%', textAlign: 'left' }}
                onClick={() => { setPlaylistId(p.id); setResult(null); setShowPicker(false); }}>
                <PhImg w={36} h={36} label="" radius={6} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                  <span className="muted">{p.songs.length} 首{p.note ? ` · ${p.note}` : ''}</span>
                </span>
                {p.id === playlistId
                  ? <Icon name="check" size={14} />
                  : <Icon name="chevron" size={14} color="#B9B9B9" />}
              </button>
            ))}
            {state.playlists.length === 0
              ? <div className="muted" style={{ textAlign: 'center', padding: 12 }}>还没有歌单，先去首页创建一个吧</div> : null}
          </div>
        </Modal>
      ) : null}

      {feedbackSong ? (
        <FeedbackModal song={feedbackSong} allTags={allTags} onClose={() => setFeedbackSong(null)}
          onSubmit={(fb) => {
            setPendingFeedback({ playlistId: playlist.id, songId: feedbackSong.id, song: feedbackSong, fb });
            setFeedbackSong(null);
            setResult(null);
            setSyncSong({ name: feedbackSong.name, artist: feedbackSong.artist, rating: fb.rating, addTags: fb.addTags, removeTags: fb.removeTags });
          }} />
      ) : null}

      {syncSong ? (
        <Modal title="将同步到所有歌单" center onClose={() => {
          if (pendingFeedback) {
            actions.addFeedback(pendingFeedback.playlistId, pendingFeedback.songId, pendingFeedback.fb);
          }
          const count = state.playlists.filter(
            p => p.songs.some(x => x.name === syncSong.name && x.artist === syncSong.artist)
          ).length;
          actions.syncFeedbackToAll(syncSong);
          toast(pendingFeedback
            ? `「${pendingFeedback.song.name}」演唱次数 +1，评分与标签已同步到 ${count > 1 ? count : '其他'} 个歌单`
            : '已同步');
          setPendingFeedback(null);
          setSyncSong(null);
        }}
          footer={<>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
              if (pendingFeedback) {
                actions.addFeedback(pendingFeedback.playlistId, pendingFeedback.songId, pendingFeedback.fb);
              }
              const count = state.playlists.filter(
                p => p.songs.some(x => x.name === syncSong.name && x.artist === syncSong.artist)
              ).length;
              actions.syncFeedbackToAll(syncSong);
              toast(pendingFeedback
                ? `「${pendingFeedback.song.name}」演唱次数 +1，评分与标签已同步到 ${count > 1 ? count : '其他'} 个歌单`
                : '已同步');
              setPendingFeedback(null);
              setSyncSong(null);
            }}>确认并同步</button>
          </>}>
          <div className="muted" style={{ lineHeight: 1.7 }}>
            「{syncSong.name}」本次演唱的评分和标签调整将同步到所有歌单中的同名歌曲，无需再次确认。
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

// —— 转盘扇形 ——
function WheelSectors({ songs }) {
  const cx = 135, cy = 135, r = 132;
  const n = songs.length;
  const step = 360 / n;
  const pt = (deg, radius) => [
    cx + radius * Math.sin(deg * Math.PI / 180),
    cy - radius * Math.cos(deg * Math.PI / 180),
  ];
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke="#111" strokeWidth="1.5" />
      {songs.map((s, i) => {
        const a1 = i * step, a2 = (i + 1) * step;
        const [x1, y1] = pt(a1, r), [x2, y2] = pt(a2, r);
        const large = step > 180 ? 1 : 0;
        const mid = a1 + step / 2;
        const [tx, ty] = pt(mid, r * 0.68);
        return (
          <g key={i}>
            <path d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
              fill={i % 2 === 0 ? '#F4F4F4' : '#FFFFFF'} stroke="#111" strokeWidth="1" />
            <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
              fontSize="10" fill="#111" style={{ fontFamily: "'Noto Sans SC',sans-serif" }}>
              {s.name.length > 6 ? s.name.slice(0, 6) + '…' : s.name}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={r - 4} fill="none" stroke="#B9B9B9" strokeWidth="0.5" strokeDasharray="3 4" />
    </g>
  );
}

Object.assign(window, { PlayPage, WheelPlayPage, WheelSectors });
