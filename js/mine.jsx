// ============ 我的：账户 / 回收站 / 标签管理 / 演唱记录 ============
const { useState, useEffect, useRef, useCallback, useContext, useMemo } = React;
function MinePage({ onOpenSub, onLogout }) {
  const { state } = useContext(StoreContext);
  const records = useRecords(state);
  const user = state.user;

  const typeLabel = { phone: '手机号', wechat: '微信', qq: 'QQ', guest: '游客' }[user?.type] || '';
  const totalSongs = state.playlists.reduce((n, p) => n + p.songs.length, 0);
  const totalTimes = state.playlists.reduce((n, p) => n + p.songs.reduce((m, x) => m + x.times, 0), 0);
  const singingCount = state.playlists.reduce((n, p) => n + p.songs.filter(x => x.times > 0).length, 0);

  return (
    <div className="screen">
      <div className="scroll-area">
        <div className="page-body">

          <div className="card pad" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <PhImg w={56} h={56} label="头像" radius={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row-flex" style={{ gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{user?.name || '未登录'}</span>
                <span className="tag-mini">{typeLabel}{user?.type === 'phone' ? ` ${user.phone.slice(0, 3)}****${user.phone.slice(-4)}` : ''}</span>
              </div>
              <div className="muted" style={{ marginTop: 3 }}>
                {user?.type === 'guest' ? '游客模式 · 本地暂存' : '已同步'}
                {' '}{state.playlists.length} 个歌单 / {totalSongs} 首歌曲 · 累计演唱 {totalTimes} 次
              </div>
            </div>
          </div>

          {user?.type === 'guest' ? (
            <div className="card pad" style={{ borderStyle: 'dashed', display: 'flex', gap: 10, alignItems: 'center' }}>
              <Icon name="clock" size={18} color="var(--ink-2)" />
              <span className="small-note" style={{ flex: 1 }}>本地记录仅保存在本机，登录账号后可同步到云端。</span>
              <button className="btn btn-sm btn-primary" onClick={onLogout}>登录并同步</button>
            </div>
          ) : null}

          <div className="card" style={{ overflow: 'hidden' }}>
            <button className="list-row" style={{ width: '100%' }} onClick={() => onOpenSub('trash')}>
              <Icon name="trash" size={16} color="var(--ink-2)" />
              <span style={{ flex: 1, textAlign: 'left', fontSize: 13 }}>回收站</span>
              <span className="muted mono">{state.trash.length} 项 · 30 天自动清理</span>
              <Icon name="chevron" size={14} color="#B9B9B9" />
            </button>
            <button className="list-row" style={{ width: '100%' }} onClick={() => onOpenSub('records')}>
              <Icon name="mic" size={16} color="var(--ink-2)" />
              <span style={{ flex: 1, textAlign: 'left', fontSize: 13 }}>我的演唱记录</span>
              <span className="muted mono">{singingCount} 首在唱</span>
              <Icon name="chevron" size={14} color="#B9B9B9" />
            </button>
          </div>

          <button className="btn btn-block btn-ghost-gray" style={{ marginTop: 4 }} onClick={onLogout}>
            <Icon name="logout" size={13} /> {user?.type === 'guest' ? '退出游客模式' : '退出登录'}
          </button>
          <div className="muted" style={{ textAlign: 'center' }}>WhatSong V1.0 · 线框原型</div>
        </div>
      </div>
    </div>
  );
}

// ============ 回收站 ============
function TrashPage({ onBack }) {
  const { state, actions } = useContext(StoreContext);
  const toast = useToast();
  const [purgeId, setPurgeId] = useState(null);
  const [restoreId, setRestoreId] = useState(null);
  const [confirmPurgeAll, setConfirmPurgeAll] = useState(false);

  const daysLeft = (t) => Math.max(0, 30 - Math.floor((Date.now() - t.deletedAt) / DAYS));
  const fmtDateTime = (ts) => {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const purgeItem = state.trash.find(t => t.id === purgeId) || null;
  const purgeSongCount = purgeItem?.kind === 'playlist' ? (purgeItem.data.songs?.length || 0) : 0;
  const purgeName = purgeItem?.data?.name || '';

  return (
    <div className="screen">
      <AppHeader title="回收站" sub={`存放删除内容，${state.trash.length} 项 · 30 天后自动清理`} onBack={onBack} />
      <div className="scroll-area">
        <div className="page-body">

          {state.trash.length === 0 ? (
            <div className="card pad" style={{ textAlign: 'center', borderStyle: 'dashed' }}>
              <div className="muted">回收站是空的</div>
            </div>
          ) : (
            <>
              <div className="row-flex" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn-sm btn-ghost-gray" onClick={() => setConfirmPurgeAll(true)}>
                  <Icon name="trash" size={11} /> 清空回收站
                </button>
              </div>
              {state.trash.map(t => (
                <div key={t.id} className="card pad" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <PhImg w={44} h={44} label="" radius={8} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {t.data.name}
                      {t.kind === 'playlist' ? '（整个歌单）' : ''}
                    </div>
                    <div className="muted">
                      {t.kind === 'playlist'
                        ? `含 ${t.data.songs?.length || 0} 首歌曲 · 删除于 ${fmtDateTime(t.deletedAt)}`
                        : `${t.data.artist} · ${t.data.duration} · 删除于 ${fmtDateTime(t.deletedAt)}`}
                    </div>
                    <span className="tag-mini mono">剩余 {daysLeft(t)} 天</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button className="btn btn-sm" onClick={() => setRestoreId(t.id)}>
                      <Icon name="restore" size={11} /> 还原
                    </button>
                    <button className="btn btn-sm btn-ghost-gray" onClick={() => setPurgeId(t.id)}>
                      彻底删除
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {purgeItem ? (
            <Modal title="彻底删除" center onClose={() => setPurgeId(null)}
              footer={<>
                <button className="btn" style={{ flex: 1 }} onClick={() => setPurgeId(null)}>取消</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                  actions.purgeTrash(purgeItem.id);
                  setPurgeId(null);
                  toast('已彻底删除，不可恢复');
                }}>确认彻底删除</button>
              </>}>
              <div className="muted" style={{ lineHeight: 1.7 }}>
                {purgeItem.kind === 'playlist'
                  ? `将永久删除歌单「${purgeItem.data.name}」及 ${purgeItem.data.songs?.length || 0} 首歌曲，无法恢复。`
                  : `将永久删除歌曲「${purgeItem.data.name}」，无法恢复。`}
              </div>
            </Modal>
          ) : null}

          {restoreId ? (() => {
            const item = state.trash.find(t => t.id === restoreId);
            if (!item) return null;
            return (
              <Modal title="确认还原" center onClose={() => setRestoreId(null)}
                footer={<>
                  <button className="btn" style={{ flex: 1 }} onClick={() => setRestoreId(null)}>取消</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                    actions.restoreTrash(restoreId);
                    setRestoreId(null);
                    toast(`「${item.data.name}」已还原`);
                  }}>确认还原</button>
                </>}>
                <div className="muted" style={{ lineHeight: 1.7 }}>
                  是否确认还原该项？还原后将回到「我的」列表。
                </div>
              </Modal>
            );
          })() : null}

          {confirmPurgeAll ? (
            <Modal title="确认清空回收站" center onClose={() => setConfirmPurgeAll(false)}
              footer={<>
                <button className="btn" style={{ flex: 1 }} onClick={() => setConfirmPurgeAll(false)}>取消</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                  actions.purgeAll();
                  setConfirmPurgeAll(false);
                  toast('回收站已清空');
                }}>确认清空</button>
              </>}>
              <div className="muted" style={{ lineHeight: 1.7 }}>
                是否确认清空回收站？清空后所有已删内容将永久删除，无法恢复。
              </div>
            </Modal>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ============ 标签管理核心内容（拖拽排序 / 点击编辑） ============
function TagManageContent({ onEditTag }) {
  const { state, actions } = useContext(StoreContext);
  const toast = useToast();
  const tags = state.tags;
  const [dragIdx, setDragIdx] = useState(-1);
  const rowRefs = useRef([]);
  const dragFrom = useRef(-1);
  const [showAdd, setShowAdd] = useState(false);
  const [newTag, setNewTag] = useState('');

  const persist = (next) => { actions.setTagsOrdered(next); };

  const hitIndex = (y) => rowRefs.current.findIndex(r => {
    if (!r) return false;
    const b = r.getBoundingClientRect();
    return y >= b.top && y <= b.bottom;
  });

  const startPress = (i) => (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.currentTarget.oncontextmenu = (ev) => ev.preventDefault();
    const startY = e.clientY;
    let longFired = false, movedFar = false;

    const timer = setTimeout(() => {
      longFired = true;
      dragFrom.current = i;
      setDragIdx(i);
    }, 380);

    const onMove = (ev) => {
      if (Math.abs(ev.clientY - startY) > 6 && !longFired) { clearTimeout(timer); movedFar = true; }
      if (!longFired) return;
      if (ev.cancelable) ev.preventDefault();
      const idx = hitIndex(ev.clientY);
      if (idx >= 0 && idx !== dragFrom.current) {
        const next = [...tags];
        const [item] = next.splice(dragFrom.current, 1);
        next.splice(idx, 0, item);
        dragFrom.current = idx;
        setDragIdx(idx);
        persist(next);
      }
    };
    const onCancel = () => {
      clearTimeout(timer);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      if (longFired) setDragIdx(-1);
    };
    const onUp = () => {
      clearTimeout(timer);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      if (longFired) { setDragIdx(-1); toast('标签顺序已保存'); }
    };
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card" style={{ overflow: 'hidden' }}>
        {tags.map((t, i) => (
          <div key={t}
            ref={el => { rowRefs.current[i] = el; }}
            className={`list-row ${dragIdx === i ? 'dragging' : ''}`}
            onPointerDown={startPress(i)}
            style={{ cursor: 'pointer', userSelect: 'none' }}>
            <Icon name="drag" size={15} color={dragIdx === i ? '#111' : '#B9B9B9'} />
            <span className="mono muted" style={{ fontSize: 10 }}>{String(i + 1).padStart(2, '0')}</span>
            <span className="tag-mini">#{t}</span>
            <span style={{ flex: 1 }}></span>
              <span className="muted" style={{ fontSize: 10 }}>
                {state.playlists.reduce((n, p) => n
                  + p.songs.reduce((m, x) => m + (x.tags.includes(t) ? 1 : 0), 0), 0)} 处使用
              </span>
            <button className="icon-btn" style={{ padding: 4, border: 'none', background: 'transparent' }}
              onPointerDown={e => e.stopPropagation()}
              onClick={() => { onEditTag && onEditTag(t); }}>
              <Icon name="edit" size={13} color="#B9B9B9" />
            </button>
          </div>
        ))}
      </div>

      {tags.length < 6 ? (
        <button className="btn btn-block" onClick={() => { setNewTag(''); setShowAdd(true); }}>
          <Icon name="plus" size={13} /> 添加标签
        </button>
      ) : null}

      {showAdd ? (
        <Modal title="添加标签" center onClose={() => setShowAdd(false)}
          footer={<>
            <button className="btn" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>取消</button>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={!newTag.trim() || tags.includes(newTag.trim())}
              onClick={() => {
                const name = newTag.trim();
                if (!name || tags.includes(name)) return;
                actions.addTag(name);
                setShowAdd(false);
                toast('标签已添加');
              }}>添加</button>
          </>}>
          <input className="field-input" value={newTag} maxLength={8} placeholder="输入标签名，最多 8 字"
            onChange={e => setNewTag(e.target.value)} autoFocus />
        </Modal>
      ) : null}
      <div className="muted" style={{ textAlign: 'center', lineHeight: 1.8, fontSize: 11 }}>
        提示：长按任一行约 0.5 秒进入拖拽状态，上下移动调整顺序；<br />
        轻点一行进入编辑（重命名 / 删除标签）。
      </div>
    </div>
  );
}

// ============ 标签管理页（整页，保留兼容） ============
function TagManagePage({ onBack }) {
  const [editTag, setEditTag] = useState(null);
  return (
    <div className="screen">
      <AppHeader title="标签管理" sub="长按拖拽排序 · 点击编辑标签" onBack={onBack} />
      <div className="scroll-area">
        <div className="page-body">
          <TagManageContent onEditTag={setEditTag} />
        </div>
      </div>
      {editTag ? (
        <EditTagModal tag={editTag} onClose={() => setEditTag(null)}
          onRename={(next) => { const { actions } = React.useContext(StoreContext); actions.renameTag(editTag, next); setEditTag(null); useToast()('标签已重命名，同步更新所有引用'); }}
          onDelete={() => { const { actions } = React.useContext(StoreContext); actions.deleteTag(editTag); setEditTag(null); useToast()(`标签「${editTag}」已删除`); }} />
      ) : null}
    </div>
  );
}

// ============ 标签管理弹窗 ============
function TagManageModal({ onClose }) {
  const { actions } = useContext(StoreContext);
  const toast = useToast();
  const [editTag, setEditTag] = useState(null);
  return (
    <>
      <Modal title="标签管理" onClose={onClose}>
        <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          <TagManageContent onEditTag={setEditTag} />
        </div>
      </Modal>
      {editTag ? (
        <EditTagModal tag={editTag} onClose={() => setEditTag(null)}
          onRename={(next) => { actions.renameTag(editTag, next); setEditTag(null); toast('标签已重命名，同步更新所有引用'); }}
          onDelete={() => { actions.deleteTag(editTag); setEditTag(null); toast(`标签「${editTag}」已删除`); }} />
      ) : null}
    </>
  );
}

function EditTagModal({ tag, onClose, onRename, onDelete }) {
  const [name, setName] = useState(tag);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  return (
    <>
      <Modal title="编辑标签" onClose={onClose}
        footer={<>
          <button className="btn" style={{ flex: 1 }} onClick={() => setConfirmDelete(true)}>
            <Icon name="trash" size={12} /> 删除标签
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} disabled={!name.trim() || name.trim() === tag}
            onClick={() => setConfirmSave(true)}>保存</button>
        </>}>
        <Field label="标签名称" hint="重命名将同步所有歌单与歌曲">
          <input className="field-input" value={name} maxLength={8} onChange={e => setName(e.target.value)} autoFocus />
        </Field>
      </Modal>

      {confirmDelete ? (
        <Modal title="确认删除标签" center onClose={() => setConfirmDelete(false)}
          footer={<>
            <button className="btn" style={{ flex: 1 }} onClick={() => setConfirmDelete(false)}>取消</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { onDelete(); setConfirmDelete(false); onClose(); }}>确认删除</button>
          </>}>
          <div className="muted" style={{ lineHeight: 1.7 }}>
            是否确认删除标签「{tag}」？所有歌曲上的该标签将一并移除。
          </div>
        </Modal>
      ) : null}

      {confirmSave ? (
        <Modal title="确认修改" center onClose={() => setConfirmSave(false)}
          footer={<>
            <button className="btn" style={{ flex: 1 }} onClick={() => setConfirmSave(false)}>取消</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { onRename(name.trim()); setConfirmSave(false); onClose(); }}>确认保存</button>
          </>}>
          <div className="muted" style={{ lineHeight: 1.7 }}>
            是否确认保存对标签「{tag}」的修改？
          </div>
        </Modal>
      ) : null}
    </>
  );
}

// ============ 我的演唱记录（演唱流水时间线） ============
function RecordsPage({ onBack, onOpenPlaylist }) {
  const { state, actions } = useContext(StoreContext);
  const toast = useToast();
  const records = useRecords(state);
  const [batchMode, setBatchMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleSel = (id) => setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  const allSelected = records.length > 0 && selected.length === records.length;

  // 累计演唱次数 = 所有歌曲 times 之和（与账户卡一致）
  const totalTimes = state.playlists.reduce((n, p) => n + p.songs.reduce((m, x) => m + x.times, 0), 0);

  const doDelete = () => {
    records.filter(r => selected.includes(r.id)).forEach(r => {
      actions.deleteFeedback(r.playlistId, r.songId, r.time);
    });
    toast(`已删除 ${selected.length} 条演唱记录`);
    setSelected([]); setBatchMode(false);
  };

  return (
    <div className="screen">
      <AppHeader title="我的演唱记录" sub={`共 ${records.length} 条记录 · 累计演唱 ${totalTimes} 次`}
        onBack={onBack}
        right={batchMode
          ? <button className="btn btn-sm" onClick={() => { setBatchMode(false); setSelected([]); }}>取消管理</button>
          : <button className="btn btn-sm" onClick={() => setBatchMode(true)}><Icon name="list" size={11} /> 管理</button>} />
      <div className="scroll-area">
        <div className="page-body">

          {batchMode ? (
            <div className="card pad row-flex" style={{ justifyContent: 'space-between' }}>
              <button className="row-flex" style={{ gap: 6 }} onClick={() => setSelected(allSelected ? [] : records.map(r => r.id))}>
                <span className={`cbx ${allSelected ? 'on' : ''}`}>{allSelected ? <Icon name="check" size={12} color="#fff" /> : null}</span>
                <span style={{ fontSize: 12 }}>全选（已选 {selected.length}）</span>
              </button>
              <button className="btn btn-sm" disabled={!selected.length} onClick={() => { if (selected.length) setConfirmDelete(true); }}>
                <Icon name="trash" size={11} /> 批量删除
              </button>
            </div>
          ) : null}

          {records.length === 0 ? (
            <div className="card pad" style={{ textAlign: 'center', borderStyle: 'dashed' }}>
              <div className="muted">还没有演唱记录，去歌曲详情或转盘里点一次「演唱反馈」吧</div>
            </div>
          ) : records.map((r, i) => (
            <div key={r.id} className="card song-item">
              {batchMode ? (
                <button className="cbx-btn" style={{ display: 'flex', padding: 0, marginTop: 2 }} onClick={() => toggleSel(r.id)}>
                  <span className={`cbx ${selected.includes(r.id) ? 'on' : ''}`}>
                    {selected.includes(r.id) ? <Icon name="check" size={12} color="#fff" /> : null}
                  </span>
                </button>
              ) : (
                <span className="mono" style={{ fontSize: 11, color: 'var(--ph)', paddingTop: 2, width: 20 }}>{String(i + 1).padStart(2, '0')}</span>
              )}
              <div className="s-main">
                <div className="s-name">{r.name}</div>
                <div className="s-sub">
                  {r.artist} · <span className="mono">{r.duration}</span> · 唱于 {new Date(r.time).toLocaleString('zh-CN', { hour12: false })}
                </div>
                {r.rating > 0 ? (
                  <div className="row-flex" style={{ marginTop: 4 }}>
                    <Stars value={r.rating} size={12} />
                    <span className="muted" style={{ fontSize: 10 }}>本次 {r.rating} 星 · 第 {r.times} 次</span>
                  </div>
                ) : null}
                <div className="s-tags">
                  {r.tags.map(t => <span key={t} className="tag-mini">#{t}</span>)}
                </div>
                {r.note ? (
                  <div className="s-note">「{r.note}」</div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {confirmDelete ? (
        <Modal title="确认删除" center onClose={() => setConfirmDelete(false)}
          footer={<>
            <button className="btn" style={{ flex: 1 }} onClick={() => setConfirmDelete(false)}>取消</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
              doDelete();
              setConfirmDelete(false);
            }}>确认并删除</button>
          </>}>
          <div className="muted" style={{ lineHeight: 1.7 }}>
            是否确认删除此条记录，记录删除将同步到该歌曲信息，后将不会出现在回收箱
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

Object.assign(window, { MinePage, TrashPage, TagManagePage, TagManageModal, EditTagModal, RecordsPage });
