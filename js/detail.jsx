// ============ 歌单详情页 ============
const { useState, useEffect, useRef, useCallback, useContext, useMemo } = React;
function DetailPage({ playlistId, onBack }) {
  const { state, actions } = useContext(StoreContext);
  const allTags = useAllTags(state);
  const toast = useToast();
  const playlist = state.playlists.find(p => p.id === playlistId);

  const [showAddSong, setShowAddSong] = useState(false);
  const [feedbackSong, setFeedbackSong] = useState(null);
  const [batchMode, setBatchMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [batchAction, setBatchAction] = useState(null); // 'copy' | 'move'
  const [receipt, setReceipt] = useState(false);       // 打印小票预览
  const [syncSong, setSyncSong] = useState(null);      // 提交反馈后：是否同步到所有歌单
  const [pendingFeedback, setPendingFeedback] = useState(null);
  const [editSong, setEditSong] = useState(null);      // 编辑歌曲信息

  if (!playlist) {
    return (
      <div className="screen">
        <AppHeader title="歌单详情" onBack={onBack} />
        <div className="scroll-area"><div className="page-body"><div className="card pad" style={{ textAlign: 'center' }}><span className="muted">歌单不存在或已删除</span></div></div></div>
      </div>
    );
  }

  if (receipt) {
    return <PrintReceiptPage playlist={playlist} onBack={() => setReceipt(false)} />;
  }

  const toggleSel = (id) =>
    setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  const allSelected = playlist.songs.length > 0 && selected.length === playlist.songs.length;
  const totalTimes = playlist.songs.reduce((m, x) => m + x.times, 0);

  const doBatchDelete = () => {
    actions.deleteSongs(playlist.id, selected);
    toast(`已删除 ${selected.length} 首歌曲（移入回收站）`);
    setSelected([]); setBatchMode(false);
  };
  const doBatchCopyMove = (targetId) => {
    if (batchAction === 'copy') { actions.copySongs(playlist.id, targetId, selected); toast(`已复制 ${selected.length} 首到目标歌单`); }
    else { actions.moveSongs(playlist.id, targetId, selected); toast(`已移动 ${selected.length} 首到目标歌单`); }
    setSelected([]); setBatchAction(null); setBatchMode(false);
  };

  return (
    <div className="screen" style={{ overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, background: '#fff', zIndex: 2 }}>
        <AppHeader
          onBack={onBack}
          right={batchMode
            ? <button className="btn btn-sm" onClick={() => { setBatchMode(false); setSelected([]); }}>取消管理</button>
            : <button className="btn btn-sm" onClick={() => setBatchMode(true)}><Icon name="list" size={11} /> 管理</button>} />

        <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card playlist-card">
            {playlist.cover ? (
              <img src={playlist.cover} className="p-cover" style={{ width: 74, height: 74, borderRadius: 8, objectFit: 'cover' }} alt="" />
            ) : (
              <PhImg w={74} h={74} className="p-cover" label="封面图" />
            )}
            <div className="p-main">
              <div className="p-name">{playlist.name}</div>
              <div className="p-meta">
                <span className="mono">{playlist.songs.length} 首</span>
                <span>累计演唱 <span className="mono">{totalTimes}</span> 次</span>
                <span>建于 {new Date(playlist.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
              <div className="muted">{playlist.note || '暂无备注'}</div>
              <div className="row-flex">
                <button className="btn btn-sm" onClick={() => setReceipt(true)}>
                  <Icon name="printer" size={11} /> 打印歌单小票
                </button>
                
              </div>
            </div>
          </div>

          {batchMode ? (
            <div className="card pad row-flex" style={{ justifyContent: 'space-between' }}>
              <button className="row-flex" style={{ gap: 6 }} onClick={() => setSelected(allSelected ? [] : playlist.songs.map(x => x.id))}>
                <span className={`cbx ${allSelected ? 'on' : ''}`}>
                  {allSelected ? <Icon name="check" size={12} color="#fff" /> : null}
                </span>
                <span style={{ fontSize: 12 }}>全选（已选 {selected.length}）</span>
              </button>
              <div className="row-flex" style={{ gap: 6 }}>
                <button className="btn btn-sm" disabled={!selected.length} onClick={() => setBatchAction('copy')}>
                  <Icon name="copy" size={11} /> 复制到
                </button>
                <button className="btn btn-sm" disabled={!selected.length} onClick={() => setBatchAction('move')}>
                  <Icon name="move" size={11} /> 移动
                </button>
                <button className="btn btn-sm" disabled={!selected.length} onClick={doBatchDelete}>
                  <Icon name="trash" size={11} /> 删除
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-block" onClick={() => setShowAddSong(true)}>
              <Icon name="plus" size={13} /> 添加歌曲
            </button>
          )}
        </div>
      </div>

      <div className="scroll-area" style={{ padding: '0 16px 28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {playlist.songs.length === 0 ? (
            <div className="card pad" style={{ textAlign: 'center', borderStyle: 'dashed' }}>
              <div className="muted">歌单还是空的，先添加一首歌吧</div>
            </div>
          ) : playlist.songs.map((x, i) => {
            const lastNote = lastFeedbackNote(x);
            return (
            <div key={x.id} className="card song-item">
              {batchMode ? (
                <button className="cbx-btn" style={{ display: 'flex', padding: 0, marginTop: 2 }} onClick={() => toggleSel(x.id)}>
                  <span className={`cbx ${selected.includes(x.id) ? 'on' : ''}`}>
                    {selected.includes(x.id) ? <Icon name="check" size={12} color="#fff" /> : null}
                  </span>
                </button>
              ) : (
                <span className="mono" style={{ fontSize: 11, color: 'var(--ph)', paddingTop: 2, width: 20 }}>{String(i + 1).padStart(2, '0')}</span>
              )}
              <div className="s-main">
                <div className="s-name">{x.name}</div>
                <div className="s-sub">
                  {x.artist} · <span className="mono">{x.duration}</span>
                  {x.times > 0 ? <> · 已唱 <span className="mono">{x.times}</span> 次</>
                    : ' · 还没唱过'}
                </div>
                {x.rating > 0 ? (
                  <div className="row-flex" style={{ marginTop: 4 }}>
                    <Stars value={x.rating} size={12} />
                    <span className="muted" style={{ fontSize: 10 }}>上次自评</span>
                  </div>
                ) : null}
                <div className="s-tags">
                  {x.tags.map(t => <span key={t} className="tag-mini">#{t}</span>)}
                </div>
                {lastNote ? (
                  <div className="s-note">「{lastNote}」</div>
                ) : null}
              </div>
              {!batchMode ? (
                <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 8, width: 88 }}>
                  <button className="btn btn-sm btn-primary" style={{ width: '100%' }} onClick={() => setFeedbackSong(x)}>
                    <Icon name="mic" size={11} /> 演唱反馈
                  </button>
                  <button className="btn btn-sm" style={{ width: '100%' }} onClick={() => setEditSong(x)}>
                    <Icon name="edit" size={11} /> 编辑
                  </button>
                </div>
              ) : null}
            </div>
            );
          })}
        </div>
      </div>

      {showAddSong ? (
        <AddSongModal allTags={allTags} onClose={() => setShowAddSong(false)}
          onSubmit={(data) => { actions.addSong(playlist.id, data); setShowAddSong(false); toast(`「${data.name}」已加入歌单`); }} />
      ) : null}

      {feedbackSong ? (
        <FeedbackModal song={feedbackSong} allTags={allTags} onClose={() => setFeedbackSong(null)}
          onSubmit={(fb) => {
            setPendingFeedback({ playlistId: playlist.id, songId: feedbackSong.id, song: feedbackSong, fb });
            setFeedbackSong(null);
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

      {batchAction ? (
        <Modal title={batchAction === 'copy' ? '复制到其他歌单' : '移动到其他歌单'} onClose={() => setBatchAction(null)}>
          <div className="muted" style={{ marginBottom: 10 }}>
            已选 {selected.length} 首歌曲，请选择目标歌单：
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {state.playlists.filter(p => p.id !== playlist.id).map(p => (
              <button key={p.id} className="list-row" style={{ width: '100%', textAlign: 'left' }} onClick={() => doBatchCopyMove(p.id)}>
                <PhImg w={36} h={36} label="" radius={6} />
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                  <span className="muted">{p.songs.length} 首</span>
                </span>
                <Icon name="chevron" size={14} color="#B9B9B9" />
              </button>
            ))}
          </div>
          {state.playlists.length <= 1 ? <div className="muted" style={{ textAlign: 'center', padding: 12 }}>暂无其他歌单可操作</div> : null}
        </Modal>
      ) : null}

      {editSong ? (
        <EditSongModal song={editSong} allTags={allTags} onClose={() => setEditSong(null)}
          onSubmit={(data) => {
            actions.updateSong({ name: editSong.name, artist: editSong.artist }, data);
            setEditSong(null);
            toast(`已更新歌曲「${data.name || editSong.name}」`);
          }} />
      ) : null}
    </div>
  );
}

// —— 添加歌曲表单 ——
function AddSongModal({ allTags, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [artist, setArtist] = useState('');
  const [duration, setDuration] = useState('');
  const [tags, setTags] = useState([]);
  const [times, setTimes] = useState(0);

  const valid = name.trim();

  return (
    <Modal title="添加歌曲" onClose={onClose}
      footer={<>
        <button className="btn" style={{ flex: 1 }} onClick={onClose}>取消</button>
        <button className="btn btn-primary" style={{ flex: 1 }} disabled={!valid}
          onClick={() => onSubmit({ name: name.trim(), artist: artist.trim() || '佚名歌手', duration: duration.trim() || '4:00', tags, times })}>
          保存
        </button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="歌名" hint="必填">
          <input className="field-input" placeholder="请输入歌曲名称" value={name} onChange={e => setName(e.target.value)} />
        </Field>
        <Field label="歌手">
          <input className="field-input" placeholder="请输入歌手名" value={artist} onChange={e => setArtist(e.target.value)} />
        </Field>
        <Field label="时长" hint="分:秒">
          <input className="field-input mono" placeholder="04:23" value={duration} onChange={e => setDuration(e.target.value)} />
        </Field>
        <Field label="自定义标签">
          <TagPicker all={allTags} value={tags} onChange={setTags} hideCustom />
        </Field>
        <Field label="演唱次数" hint="历史已唱次数，默认 0">
          <div className="row-flex">
            <button className="btn btn-sm" onClick={() => setTimes(t => Math.max(0, t - 1))}>－</button>
            <span className="mono" style={{ flex: 1, textAlign: 'center', fontSize: 16 }}>{times}</span>
            <button className="btn btn-sm" onClick={() => setTimes(t => t + 1)}>＋</button>
          </div>
        </Field>
      </div>
    </Modal>
  );
}

// —— 演唱反馈表单 ——
function FeedbackModal({ song, allTags, onClose, onSubmit }) {
  const [rating, setRating] = useState(song.rating || 3);
  const [note, setNote] = useState('');
  const [songTags, setSongTags] = useState([...song.tags]);

  const addTags = songTags.filter(t => !song.tags.includes(t));
  const removeTags = song.tags.filter(t => !songTags.includes(t));

  return (
    <Modal title="演唱反馈" onClose={onClose}
      footer={<>
        <button className="btn" style={{ flex: 1 }} onClick={onClose}>取消</button>
        <button className="btn btn-primary" style={{ flex: 1 }}
          onClick={() => onSubmit({ rating, note: note.trim(), addTags, removeTags })}>
          记录这次演唱（+1 次）
        </button>
      </>}>
      <div className="row-flex" style={{ marginBottom: 14 }}>
        <PhImg w={48} h={48} label="封面" radius={8} />
        <span>
          <span style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>{song.name}</span>
          <span className="muted">{song.artist} · 已唱 {song.times} 次 · {song.feedbacks.length} 条反馈</span>
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="历史演唱反馈" hint={`${song.feedbacks.length} 条记录`}>
          {song.feedbacks.length > 0 ? (
            <div className="card" style={{ padding: '4px 12px' }}>
              {[...song.feedbacks].reverse().map((f, idx) => (
                <div key={idx} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0',
                  borderTop: idx ? '1px dashed var(--line-2)' : 'none',
                }}>
                  <span style={{ flex: '0 0 auto', paddingTop: 1 }}><Stars value={f.rating} size={11} /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="muted" style={{ display: 'block' }}>
                      {new Date(f.time).toLocaleString('zh-CN', { hour12: false })}
                    </span>
                    {f.note ? <span style={{ display: 'block', fontSize: 11, marginTop: 1 }}>「{f.note}」</span> : null}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="muted">还没有演唱记录，提交第一条反馈吧</div>
          )}
        </Field>
        <Field label="演唱自评" hint={`${rating} / 5 星`}>
          <div style={{ padding: '2px 0' }}>
            <Stars value={rating} size={26} onChange={setRating} />
          </div>
        </Field>
        <Field label="标签调整" hint={addTags.length + removeTags.length > 0 ? `新增 ${addTags.length} · 移除 ${removeTags.length}` : '点击增删这首歌的标签'}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {allTags.map(t => (
              <button key={t} type="button"
                className={`chip ${songTags.includes(t) ? 'active' : ''}`}
                onClick={() => setSongTags(st => st.includes(t) ? st.filter(x => x !== t) : [...st, t])}>
                {songTags.includes(t) ? <Icon name="check" size={10} /> : <Icon name="tag" size={10} />}
                {t}
              </button>
            ))}
          </div>
        </Field>
        <Field label="演唱备注">
          <textarea className="field-input" rows={2} placeholder="这次哪里唱得好 / 哪里翻车了？" value={note} onChange={e => setNote(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

// —— 最近一条有内容的演唱备注 ——
function lastFeedbackNote(song) {
  const fb = song.feedbacks || [];
  for (let i = fb.length - 1; i >= 0; i--) {
    if (fb[i].note) return fb[i].note;
  }
  return '';
}

// —— 小票内容 ——
function ReceiptPaper({ playlist }) {
  const songs = playlist.songs || [];
  const totalTimes = songs.reduce((m, x) => m + x.times, 0);
  return (
    <div className="receipt">
      <div className="r-title">· 歌单小票 ·</div>
      <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--ph)' }}>WHATSONG RECEIPT</div>
      <div className="r-dash"></div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>歌单</span>
        <span style={{ fontWeight: 500 }}>{playlist.name}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>曲目</span>
        <span className="mono">{songs.length} 首</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>累计演唱</span>
        <span className="mono">{totalTimes} 次</span>
      </div>
      <div className="r-dash"></div>
      {songs.map((x, i) => (
        <div key={x.id} style={{ display: 'flex', gap: 6, lineHeight: 1.8 }}>
          <span style={{ width: 20, color: 'var(--ph)' }}>{String(i + 1).padStart(2, '0')}</span>
          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {x.name}
          </span>
          <span style={{ color: 'var(--ph)' }} className="mono">{x.times}</span>
        </div>
      ))}
      {songs.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--ph)', padding: '8px 0' }}>暂无歌曲</div>
      ) : null}
      <div className="r-dash"></div>
      <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--ph)' }}>
        {new Date().toLocaleDateString('zh-CN')} · {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--ph)', marginTop: 2 }}>
        — 谢谢演唱 —
      </div>
    </div>
  );
}

// —— 打印歌单小票页：打印机出纸动画 ——
function PrintReceiptPage({ playlist, onBack }) {
  const toast = useToast();
  const [phase, setPhase] = useState('idle'); // idle | printing | done

  const startPrint = () => {
    if (phase !== 'idle') return;
    setPhase('printing');
    setTimeout(() => setPhase('done'), 1000);
  };

  return (
    <div className="screen">
      <AppHeader title="打印歌单小票" sub={playlist.name} onBack={onBack} />
      <div className="scroll-area">
        <div className="page-body">
          <div className={`printer-stage ${phase}`}>
            <div className="printer">
              <div className="pr-paper-in"></div>
              <div className="pr-body">
                <div className="pr-vents">{[0, 1, 2].map(i => <i key={i}></i>)}</div>
                <div className="pr-row">
                  <span className="pr-brand">WS-PRINTER</span>
                  <span className="pr-light"></span>
                </div>
              </div>
              <div className="pr-mouth"></div>
            </div>
            <div className="pr-track">
              <div className="pr-track-inner">
                <ReceiptPaper playlist={playlist} />
              </div>
            </div>
            <div className="pr-status">
              {phase === 'idle' ? 'READY · 准备就绪' : phase === 'printing' ? 'PRINTING · 正在打印…' : 'DONE · 打印完成'}
            </div>
          </div>

          {phase === 'done' ? (
            <div className="muted" style={{ textAlign: 'center' }}>小票已进入预览状态，可上下滑动查看完整内容</div>
          ) : null}
        </div>
      </div>

      <div className="page-foot">
        {phase !== 'done' ? (
          <button className="btn btn-primary btn-block" disabled={phase === 'printing'} onClick={startPrint}>
            <Icon name="printer" size={12} /> {phase === 'printing' ? '正在打印…' : '开始打印'}
          </button>
        ) : (
          <button className="btn btn-block" onClick={() => toast('歌单小票已保存到相册')}>
            <Icon name="image" size={12} /> 保存歌单小票到相册
          </button>
        )}
      </div>
    </div>
  );
}

// ============ 所有歌曲页 ============
function AllSongsPage({ onBack }) {
  const { state, actions } = useContext(StoreContext);
  const allTags = useAllTags(state);
  const allSongs = useAllSongs(state);
  const totalTimes = allSongs.reduce((m, x) => m + x.times, 0);
  const toast = useToast();

  const [feedbackSong, setFeedbackSong] = useState(null);
  const [syncSong, setSyncSong] = useState(null);
  const [pendingFeedback, setPendingFeedback] = useState(null);
  const [receipt, setReceipt] = useState(false);
  const [editSong, setEditSong] = useState(null);

  const playlistsCount = state.playlists.length;
  const allSongsPlaylist = { name: '所有歌曲', songs: allSongs };

  // 从聚合歌曲找到第一个真实歌单中的歌曲实例（用于提交反馈）
  const findRealSong = (agg) => {
    for (const p of state.playlists) {
      const s = p.songs.find(x => x.name === agg.name && x.artist === agg.artist);
      if (s) return { playlistId: p.id, song: s };
    }
    return null;
  };

  const handleFeedbackSubmit = (fb) => {
    const real = findRealSong(feedbackSong);
    if (!real) return;
    setPendingFeedback({ playlistId: real.playlistId, songId: real.song.id, song: real.song, fb });
    setSyncSong({ name: feedbackSong.name, artist: feedbackSong.artist, rating: fb.rating, addTags: fb.addTags, removeTags: fb.removeTags });
    setFeedbackSong(null);
  };

  const confirmSync = () => {
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
  };

  const cancelSync = () => {
    if (pendingFeedback) {
      actions.addFeedback(pendingFeedback.playlistId, pendingFeedback.songId, pendingFeedback.fb);
      toast(`「${pendingFeedback.song.name}」已记录本次演唱`);
    }
    setPendingFeedback(null);
    setSyncSong(null);
  };

  if (receipt) {
    return <PrintReceiptPage playlist={allSongsPlaylist} onBack={() => setReceipt(false)} />;
  }

  return (
    <div className="screen" style={{ overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, background: '#fff', zIndex: 2 }}>
        <AppHeader onBack={onBack} />
        <div style={{ padding: '0 16px 14px' }}>
          <div className="card playlist-card">
            <div className="p-main">
              <div className="p-name">所有歌曲</div>
              <div className="p-meta">
                <span className="mono">{allSongs.length} 首</span>
                <span>累计演唱 <span className="mono">{totalTimes}</span> 次</span>
                <span>跨 {playlistsCount} 个歌单</span>
              </div>
              <div className="row-flex" style={{ marginTop: 8 }}>
                <button className="btn btn-sm" onClick={() => setReceipt(true)}>
                  <Icon name="printer" size={11} /> 打印歌单小票
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-area" style={{ padding: '0 16px 28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {allSongs.length === 0 ? (
            <div className="card pad" style={{ textAlign: 'center', borderStyle: 'dashed' }}>
              <div className="muted">还没有歌曲，去创建歌单添加吧</div>
            </div>
          ) : allSongs.map((x, i) => {
            const lastNote = lastFeedbackNote(x);
            return (
            <div key={x.id} className="card song-item">
              <span className="mono" style={{ fontSize: 11, color: 'var(--ph)', paddingTop: 2, width: 20 }}>{String(i + 1).padStart(2, '0')}</span>
              <div className="s-main">
                <div className="s-name">{x.name}</div>
                <div className="s-sub">
                  {x.artist} · <span className="mono">{x.duration}</span>
                  {x.times > 0 ? <> · 已唱 <span className="mono">{x.times}</span> 次</>
                    : ' · 还没唱过'}
                </div>
                {x.rating > 0 ? (
                  <div className="row-flex" style={{ marginTop: 4 }}>
                    <Stars value={x.rating} size={12} />
                    <span className="muted" style={{ fontSize: 10 }}>上次自评</span>
                  </div>
                ) : null}
                <div className="s-tags">
                  {x.tags.map(t => <span key={t} className="tag-mini">#{t}</span>)}
                </div>
                {lastNote ? (
                  <div className="s-note">「{lastNote}」</div>
                ) : null}
              </div>
              <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 8, width: 88 }}>
                <button className="btn btn-sm btn-primary" style={{ width: '100%' }} onClick={() => setFeedbackSong(x)}>
                  <Icon name="mic" size={11} /> 演唱反馈
                </button>
                <button className="btn btn-sm" style={{ width: '100%' }} onClick={() => setEditSong(x)}>
                  <Icon name="edit" size={11} /> 编辑
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {feedbackSong ? (
        <FeedbackModal song={feedbackSong} allTags={allTags} onClose={() => setFeedbackSong(null)}
          onSubmit={handleFeedbackSubmit} />
      ) : null}

      {syncSong ? (
        <Modal title="将同步到所有歌单" center onClose={cancelSync}
          footer={<> 
            <button className="btn" style={{ flex: 1 }} onClick={cancelSync}>仅记录本次</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmSync}>确认并同步</button>
          </>}>
          <div className="muted" style={{ lineHeight: 1.7 }}>
            「{syncSong.name}」本次演唱的评分和标签调整将同步到所有歌单中的同名歌曲，无需再次确认。
          </div>
        </Modal>
      ) : null}

      {editSong ? (
        <EditSongModal song={editSong} allTags={allTags} onClose={() => setEditSong(null)}
          onSubmit={(data) => {
            actions.updateSong({ name: editSong.name, artist: editSong.artist }, data);
            setEditSong(null);
            toast(`已更新歌曲「${data.name || editSong.name}」`);
          }} />
      ) : null}
    </div>
  );
}

// ============ 编辑歌曲信息弹窗 ============
function EditSongModal({ song, allTags, onClose, onSubmit }) {
  const [name, setName] = useState(song.name);
  const [artist, setArtist] = useState(song.artist || '');
  const [duration, setDuration] = useState(song.duration || '');
  const [tags, setTags] = useState(song.tags || []);
  const [times, setTimes] = useState(song.times || 0);
  const [confirm, setConfirm] = useState(false);

  const valid = name.trim();

  const handleSubmit = () => {
    setConfirm(true);
  };

  const doSubmit = () => {
    const data = {
      name: name.trim(),
      artist: artist.trim(),
      duration: duration.trim(),
      tags,
      times: Number(times) || 0,
    };
    onSubmit(data);
  };

  return (
    <>
      <Modal title="编辑歌曲信息" onClose={onClose}
        footer={<>
          <button className="btn" style={{ flex: 1 }} onClick={onClose}>取消</button>
          <button className="btn btn-primary" style={{ flex: 1 }} disabled={!valid} onClick={handleSubmit}>
            提交编辑
          </button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="歌曲名" hint="必填">
            <input className="field-input" value={name} onChange={e => setName(e.target.value)} />
          </Field>
          <Field label="歌手名">
            <input className="field-input" placeholder="未知歌手" value={artist} onChange={e => setArtist(e.target.value)} />
          </Field>
          <Field label="时长">
            <input className="field-input" placeholder="mm:ss" value={duration} onChange={e => setDuration(e.target.value)} />
          </Field>
          <Field label="标签">
            <TagPicker all={allTags} value={tags} onChange={setTags} hideCustom />
          </Field>
          <Field label="演唱次数">
            <input className="field-input" type="number" min="0" value={times} onChange={e => setTimes(e.target.value)} />
          </Field>
        </div>
      </Modal>

      {confirm ? (
        <Modal title="确认修改" center onClose={() => setConfirm(false)}
          footer={<>
            <button className="btn" style={{ flex: 1 }} onClick={() => setConfirm(false)}>取消</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={doSubmit}>确认保存</button>
          </>}>
          <div className="muted" style={{ lineHeight: 1.7 }}>
            是否确认保存修改？将同步更新所有歌单中该歌曲的信息。
          </div>
        </Modal>
      ) : null}
    </>
  );
}

Object.assign(window, { DetailPage, AddSongModal, FeedbackModal, PrintReceiptPage, ReceiptPaper, AllSongsPage, EditSongModal });
