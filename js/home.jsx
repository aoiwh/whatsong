const { useState, useEffect, useRef, useCallback, useContext, useMemo } = React;
function HomePage({ onOpenPlaylist, onOpenAllSongs }) {
  const { state, actions } = useContext(StoreContext);
  const allTags = useAllTags(state);
  const allSongs = useAllSongs(state);
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [manualSong, setManualSong] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editPl, setEditPl] = useState(null);
  const [tagModalOpen, setTagModalOpen] = useState(false);

  const matched = useMemo(() => {
    const lower = query.trim().toLowerCase();
    const list = [];
    state.playlists.forEach(p => {
      p.songs.forEach(x => {
        const matchQuery = !lower || x.name.toLowerCase().includes(lower) || x.artist.toLowerCase().includes(lower);
        const matchTag = selectedTags.length === 0 || selectedTags.every(t => x.tags.includes(t));
        if (matchQuery && matchTag) {
          list.push({ ...x, playlistName: p.name, playlistId: p.id });
        }
      });
    });
    return list;
  }, [query, selectedTags, state.playlists]);

  const showResults = searching || query.trim() !== '' || selectedTags.length > 0;
  const showResultsContent = query.trim() !== '' || selectedTags.length > 0;
  const filtered = state.playlists;

  const totalSongs = allSongs.length;
  const totalTimes = useMemo(() => allSongs.reduce((m, x) => m + x.times, 0), [allSongs]);
  const topTags = allTags.slice(0, 3);

  const toggleSel = (id) => setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  const allSelected = filtered.length > 0 && selected.length === filtered.length;

  const toggleTag = (t) => {
    setSelectedTags(sel => sel.includes(t) ? sel.filter(x => x !== t) : [...sel, t]);
    setSearching(true);
  };

  return (
    <div className="screen" style={{ overflow: 'hidden' }}>
      {showResults ? (
        <div className="scroll-area">
          <div className="page-body">

            <div className="card pad">
              <div className="row-flex">
                <span style={{ display: 'flex', color: 'var(--ink-2)' }}><Icon name="search" size={16} /></span>
                <input style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13 }}
                  placeholder="搜索歌名 / 歌手，查看所在歌单"
                  value={query}
                  onFocus={() => setSearching(true)}
                  onChange={e => { setQuery(e.target.value); setSearching(true); }} />
                {query ? (
                  <button onClick={() => { setQuery(''); }} style={{ display: 'flex', color: 'var(--ph)' }}>
                    <Icon name="close" size={14} />
                  </button>
                ) : null}
              </div>

              <div className="tag-row" style={{ marginTop: 10 }}>
                {allTags.map(t => (
                  <button key={t} className={`chip ${selectedTags.includes(t) ? 'active' : ''}`} style={{ flex: '0 0 auto' }}
                    onClick={() => toggleTag(t)}>#{t}</button>
                ))}
              </div>

              <div style={{ marginTop: 10, borderTop: '1px dashed var(--line-2)', paddingTop: 10 }}>
                {showResultsContent ? (
                  matched.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div className="muted mono" style={{ marginBottom: 2 }}>
                         {query.trim()
                           ? (selectedTags.length > 0 ? `${selectedTags.map(t => `#${t}`).join(' ')} · 找到 ${matched.length} 首歌曲` : `找到 ${matched.length} 首歌曲`)
                           : `${selectedTags.map(t => `#${t}`).join(' ')} · 共 ${matched.length} 首歌曲`}
                       </div>
                      {matched.map(x => (
                        <button key={x.id} className="list-row" style={{ padding: '8px 4px', border: 'none', alignItems: 'center' }}
                          onClick={() => onOpenPlaylist(x.playlistId)}>
                          <span style={{ display: 'flex', color: 'var(--ink-2)' }}><Icon name="mic" size={14} /></span>
                          <span style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                            <span style={{ display: 'block', fontSize: 13, fontWeight: 500 }}>{x.name}</span>
                            <span className="muted">{x.artist} · {x.duration} · 已唱 {x.times} 次</span>
                          </span>
                          <span className="tag-mini">{x.playlistName}</span>
                          <Icon name="chevron" size={12} color="#B9B9B9" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '18px 0 14px' }}>
                      <div className="muted" style={{ margin: '0 0 10px' }}>
                         {query.trim()
                           ? `未找到「${query}」相关的歌曲记录`
                           : `标签「${selectedTags.join(' / ')}」下暂无歌曲记录`}
                       </div>
                      {query.trim() ? (
                        <button className="btn btn-sm" onClick={() => setManualSong(true)}>
                          <Icon name="plus" size={12} /> 手动新增歌曲「{query}」
                        </button>
                      ) : null}
                    </div>
                  )
                ) : null}

                <button className="btn btn-block" style={{ marginTop: 10 }} onClick={() => {
                  setQuery('');
                  setSelectedTags([]);
                  setSearching(false);
                  setManualSong(false);
                }}>
                  <Icon name="close" size={13} /> 退出搜索
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* 顶部固定区 */}
          <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14, flexShrink: 0 }}>
            <div className="card pad">
              <div className="row-flex">
                <span style={{ display: 'flex', color: 'var(--ink-2)' }}><Icon name="search" size={16} /></span>
                <input style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13 }}
                  placeholder="搜索歌名 / 歌手，查看所在歌单"
                  value={query}
                  onFocus={() => setSearching(true)}
                  onChange={e => { setQuery(e.target.value); setSearching(true); }} />
                {query ? (
                  <button onClick={() => { setQuery(''); }} style={{ display: 'flex', color: 'var(--ph)' }}>
                    <Icon name="close" size={14} />
                  </button>
                ) : null}
              </div>
              <div className="tag-row" style={{ marginTop: 10 }}>
                {allTags.map(t => (
                  <button key={t} className={`chip ${selectedTags.includes(t) ? 'active' : ''}`} style={{ flex: '0 0 auto' }}
                    onClick={() => toggleTag(t)}>#{t}</button>
                ))}
              </div>
            </div>

            <div className="row-flex" style={{ gap: 8, alignItems: 'stretch' }}>
              <div className="card playlist-card" style={{ flex: 1, cursor: 'pointer' }} onClick={onOpenAllSongs}>
                <div className="p-main">
                  <div className="p-name">所有歌曲</div>
                  <div className="p-meta" style={{
                    fontSize: 10,
                    gap: 6,
                    flexWrap: 'nowrap',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}>
                    <span className="mono">{totalSongs} 首</span>
                    <span>累计演唱 <span className="mono">{totalTimes}</span> 次</span>
                    <span>跨全部歌单</span>
                  </div>
                </div>
              </div>
              {batchMode
                ? <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                    <button className="btn btn-sm" style={{ height: 'auto', flex: 1 }} onClick={() => { setBatchMode(false); setSelected([]); }}>取消管理</button>
                  </div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button className="btn btn-sm" style={{ height: 'auto', flex: 1 }} onClick={() => setTagModalOpen(true)}><Icon name="tag" size={13} /> 标签</button>
                    <button className="btn btn-sm" style={{ height: 'auto', flex: 1 }} onClick={() => { setBatchMode(true); setSelected([]); }}><Icon name="list" size={11} /> 管理</button>
                  </div>}
            </div>

            {batchMode ? (
              <div className="card pad row-flex" style={{ alignItems: 'center' }}>
                <button className="row-flex" style={{ gap: 8 }} onClick={() => {
                  setSelected(allSelected ? [] : filtered.map(p => p.id));
                }}>
                  <span className={`cbx ${allSelected ? 'on' : ''}`}>
                    {allSelected ? <Icon name="check" size={12} color="#fff" /> : null}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>全选</span>
                </button>
                <span className="muted" style={{ flex: 1, textAlign: 'center', fontSize: 12 }}>已选 {selected.length} 个歌单</span>
                <button className="btn btn-sm btn-primary" disabled={!selected.length}
                  onClick={() => setConfirmDelete(true)}>
                  <Icon name="trash" size={11} /> 批量删除
                </button>
              </div>
            ) : (
              <button className="btn btn-block" onClick={() => setShowNewForm(true)}>
                <Icon name="plus" size={13} /> 添加歌单
              </button>
            )}
          </div>

          {/* 下方滚动区：自建歌单列表 */}
          <div className="scroll-area" style={{ padding: '14px 16px 28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filtered.map(p => {
                const times = p.songs.reduce((m, x) => m + x.times, 0);
                return (
                  <div key={p.id} className="card playlist-card" style={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (batchMode) { toggleSel(p.id); } else { onOpenPlaylist(p.id); }
                    }}>
                    {batchMode ? (
                      <span className={`cbx ${selected.includes(p.id) ? 'on' : ''}`} style={{ alignSelf: 'flex-start', marginTop: 26, flexShrink: 0 }}>
                        {selected.includes(p.id) ? <Icon name="check" size={12} color="#fff" /> : null}
                      </span>
                    ) : null}
                    {p.cover ? (
                      <img src={p.cover} className="p-cover" style={{ width: 74, height: 74, borderRadius: 8, objectFit: 'cover' }} alt="" />
                    ) : (
                      <PhImg w={74} h={74} className="p-cover" label="封面图" />
                    )}
                    <div className="p-main">
                      <div className="p-name">{p.name}</div>
                      <div className="p-meta" style={{
                        fontSize: 10,
                        gap: 6,
                        flexWrap: 'nowrap',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}>
                        <span className="mono">{p.songs.length} 首</span>
                        <span>累计演唱 <span className="mono">{times}</span> 次</span>
                        <span>建于 {new Date(p.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                      <div className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{p.note || '暂无备注'}</div>
                    </div>
                    {!batchMode ? (
                      <button style={{
                        width: 44,
                        alignSelf: 'stretch',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        background: 'transparent',
                        padding: 0,
                        cursor: 'pointer',
                      }} onClick={(e) => { e.stopPropagation(); setEditPl(p); }}>
                        <Icon name="edit" size={18} />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showNewForm ? (
            <NewPlaylistForm
              onClose={() => setShowNewForm(false)}
              onSubmit={(data) => { actions.addPlaylist(data); setShowNewForm(false); toast(`歌单「${data.name}」已创建`); }} />
          ) : null}

          {manualSong ? (
            <AddSongForm allTags={allTags}
              playlists={state.playlists}
              defaultName={query}
              onClose={() => setManualSong(false)}
              onSubmit={(song, playlistId) => {
                actions.addSong(playlistId, song);
                setManualSong(false);
                setQuery('');
                const pl = state.playlists.find(p => p.id === playlistId);
                toast(`「${song.name}」已加入「${pl?.name || '歌单'}」`);
              }} />
          ) : null}

          {editPl ? (
            <EditPlaylistForm playlist={editPl}
              onClose={() => setEditPl(null)}
              onSubmit={(data) => { actions.updatePlaylist(editPl.id, data); setEditPl(null); toast('已保存修改'); }}
              onDelete={() => {
                const n = actions.deletePlaylist(editPl.id);
                setEditPl(null);
                toast(`已删除歌单「${editPl.name}」（含 ${n} 首歌曲，已移入回收站）`);
              }} />
          ) : null}

          {confirmDelete ? (
            <ConfirmDialog title="确认删除歌单"
              message={`是否确认删除选中的 ${selected.length} 个歌单？歌单及其内所有歌曲将一并移入回收站，30 天内可还原。`}
              onCancel={() => setConfirmDelete(false)}
              onConfirm={() => {
                selected.forEach(id => actions.deletePlaylist(id));
                setSelected([]);
                setConfirmDelete(false);
                setBatchMode(false);
                toast(`已删除 ${selected.length} 个歌单（已移入回收站）`);
              }} />
          ) : null}

          {tagModalOpen ? <TagManageModal onClose={() => setTagModalOpen(false)} /> : null}
    </div>
  );
}

Object.assign(window, { HomePage, NewPlaylistForm, AddSongForm, EditPlaylistForm, ConfirmDialog });

// ============ 新建歌单表单 ============
function NewPlaylistForm({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [cover, setCover] = useState('');
  const fileRef = useRef(null);

  const valid = name.trim();

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCover(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <Modal title="新建歌单" onClose={onClose}
      footer={<>
        <button className="btn" style={{ flex: 1 }} onClick={onClose}>取消</button>
        <button className="btn btn-primary" style={{ flex: 1 }} disabled={!valid}
          onClick={() => onSubmit({ name: name.trim(), note: note.trim(), cover })}>
          创建
        </button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '4px 0 2px' }}>
          <button onClick={() => fileRef.current && fileRef.current.click()}
            style={{
              width: 56, height: 56, borderRadius: 8,
              border: '1px dashed var(--line-2)',
              background: cover ? 'transparent' : 'var(--bg-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', padding: 0, cursor: 'pointer',
            }}>
            {cover ? (
              <img src={cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            ) : (
              <Icon name="plus" size={16} color="#B9B9B9" />
            )}
          </button>
          <span className="muted" style={{ fontSize: 11 }}>{cover ? '点击更换封面' : '上传封面'}</span>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>
        <Field label="歌单名称" hint="必填">
          <input className="field-input" placeholder="例如：必点金曲" value={name} onChange={e => setName(e.target.value)} />
        </Field>
        <Field label="备注">
          <textarea className="field-input" rows={2} placeholder="写点什么，比如适用场景、曲风" value={note} onChange={e => setNote(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

// ============ 手动新增歌曲表单 ============
function AddSongForm({ allTags, playlists = [], defaultName = '', onClose, onSubmit }) {
  const [name, setName] = useState(defaultName);
  const [artist, setArtist] = useState('');
  const [duration, setDuration] = useState('');
  const [tags, setTags] = useState([]);
  const [playlistId, setPlaylistId] = useState(playlists[0]?.id || '');

  const valid = name.trim() && playlistId;

  return (
    <Modal title="手动新增歌曲" onClose={onClose}
      footer={<>
        <button className="btn" style={{ flex: 1 }} onClick={onClose}>取消</button>
        <button className="btn btn-primary" style={{ flex: 1 }} disabled={!valid}
          onClick={() => onSubmit({
            name: name.trim(),
            artist: artist.trim() || '佚名歌手',
            duration: duration.trim() || '4:00',
            tags,
            times: 0,
          }, playlistId)}>
          添加到歌单
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
        <Field label="加入歌单" hint="选择目标歌单">
          <div className="card" style={{ overflow: 'hidden' }}>
            {playlists.length === 0 ? (
              <div className="muted" style={{ padding: '10px 12px', textAlign: 'center' }}>还没有歌单，先去创建一个</div>
            ) : playlists.map(p => (
              <button key={p.id} className="list-row" style={{ width: '100%', textAlign: 'left', background: playlistId === p.id ? 'var(--bg-gray)' : '#fff' }}
                onClick={() => setPlaylistId(p.id)}>
                <span className={`cbx ${playlistId === p.id ? 'on' : ''}`}>
                  {playlistId === p.id ? <Icon name="check" size={10} color="#fff" /> : null}
                </span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                  <span className="muted">{p.songs.length} 首</span>
                </span>
              </button>
            ))}
          </div>
        </Field>
        <Field label="标签" hint="从已有标签中选择">
          <TagPicker all={allTags} value={tags} onChange={setTags} hideCustom={true} />
        </Field>
      </div>
    </Modal>
  );
}

// ============ 编辑歌单表单 ============
function EditPlaylistForm({ playlist, onClose, onSubmit, onDelete }) {
  const [name, setName] = useState(playlist.name);
  const [note, setNote] = useState(playlist.note || '');
  const [cover, setCover] = useState(playlist.cover || '');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const fileRef = useRef(null);

  const valid = name.trim();

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCover(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setShowSaveConfirm(true);
  };

  const confirmSave = () => {
    onSubmit({ name: name.trim(), note: note.trim(), cover });
    setShowSaveConfirm(false);
  };

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    onDelete();
    setShowConfirm(false);
  };

  return (
    <>
      <Modal title="编辑歌单" onClose={onClose}
        footer={<>
          <button className="btn" style={{ flex: 1, color: 'var(--danger, #e54847)' }} onClick={handleDelete}>
            <Icon name="trash" size={11} /> 删除歌单
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} disabled={!valid} onClick={handleSave}>
            保存
          </button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '4px 0 2px' }}>
            <button onClick={() => fileRef.current && fileRef.current.click()}
              style={{
                width: 56, height: 56, borderRadius: 8,
                border: '1px dashed var(--line-2)',
                background: cover ? 'transparent' : 'var(--bg-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', padding: 0, cursor: 'pointer',
              }}>
              {cover ? (
                <img src={cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              ) : (
                <Icon name="plus" size={16} color="#B9B9B9" />
              )}
            </button>
            <span className="muted" style={{ fontSize: 11 }}>{cover ? '点击更换封面' : '上传封面'}</span>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          </div>
          <Field label="歌单名称" hint="必填">
            <input className="field-input" value={name} onChange={e => setName(e.target.value)} />
          </Field>
          <Field label="备注">
            <textarea className="field-input" rows={2} value={note} onChange={e => setNote(e.target.value)} />
          </Field>
        </div>
      </Modal>

      {showSaveConfirm ? (
        <Modal title="确认修改" center onClose={() => setShowSaveConfirm(false)}
          footer={<> 
            <button className="btn" style={{ flex: 1 }} onClick={() => setShowSaveConfirm(false)}>取消</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmSave}>
              确认保存
            </button>
          </>}>
          <div className="muted" style={{ lineHeight: 1.7 }}>
            是否确认保存对歌单「{name.trim() || playlist.name}」的修改？
          </div>
        </Modal>
      ) : null}

      {showConfirm ? (
        <Modal title="确认删除歌单" center onClose={() => setShowConfirm(false)}
          footer={<>
            <button className="btn" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>取消</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmDelete}>
              确认删除
            </button>
          </>}>
          <div className="muted" style={{ lineHeight: 1.7 }}>
            是否确认删除歌单「{playlist.name}」？歌单及其内 {playlist.songs.length} 首歌曲将一并移入回收站，30 天内可还原。
          </div>
        </Modal>
      ) : null}
    </>
  );
}

// ============ 确认对话框 ============
function ConfirmDialog({ title, message, onCancel, onConfirm }) {
  return (
    <Modal title={title} center onClose={onCancel}
      footer={<>
        <button className="btn" style={{ flex: 1 }} onClick={onCancel}>取消</button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onConfirm}>确认</button>
      </>}>
      <div className="muted" style={{ lineHeight: 1.7 }}>{message}</div>
    </Modal>
  );
}
