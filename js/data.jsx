// ============ 数据层：WhatSong 歌单数据与操作 ============
const { useState, useEffect, createContext, useContext, useCallback, useMemo, useRef } = React;

let _uid = 100;
const nid = () => 'id_' + (_uid++);

const DAYS = 86400000;
const now = () => Date.now();
const daysAgo = (n) => now() - n * DAYS;

// —— 演唱记录（反馈）结构：{ time, rating, note } ——
function mkSong(name, artist, duration, tags, times, rating, firstDaysAgo, lastNote) {
  const feedbacks = [];
  for (let i = 0; i < Math.min(times, 3); i++) {
    feedbacks.push({
      time: daysAgo(firstDaysAgo + i),
      rating: rating,
      note: i === Math.min(times, 3) - 1 && lastNote ? lastNote : '',
    });
  }
  return {
    id: nid(), name, artist, duration, tags,
    times, firstTime: daysAgo(firstDaysAgo), rating, feedbacks,
  };
}

const seedPlaylists = () => [
  {
    id: 'pl_1', name: '必点粤语金曲', note: '老朋友的包厢保留曲目',
    tags: ['粤语', '怀旧'], createdAt: daysAgo(120),
    songs: [
      mkSong('海阔天空', 'Beyond 乐队', '5:24', ['粤语', '嗨歌'], 12, 5, 90, '副歌稳了，全场大合唱'),
      mkSong('千千阙歌', '陈慧娴', '4:42', ['粤语', '慢歌'], 8, 4, 80, '尾音有点抖，多练'),
      mkSong('喜欢你', '陈洁仪', '4:18', ['粤语', '慢歌'], 6, 4, 60, ''),
      mkSong('光辉岁月', 'Beyond 乐队', '5:26', ['粤语', '嗨歌'], 5, 3, 45, 'key 偏低更合适'),
      mkSong('富士山下', '陈奕迅', '4:37', ['粤语', '慢歌'], 3, 3, 30, ''),
    ],
  },
  {
    id: 'pl_2', name: '朋友局嗨歌台', note: '人多热闹时专供，节奏优先',
    tags: ['嗨歌', '说唱'], createdAt: daysAgo(66),
    songs: [
      mkSong('嘻唰唰', '花儿乐队', '3:38', ['嗨歌'], 9, 4, 50, '气氛组王牌'),
      mkSong('双截棍', '周杰伦', '3:21', ['说唱', '嗨歌'], 7, 3, 40, 'rap 段落还需要背词'),
      mkSong('爱情买卖', '慕容晓晓', '3:57', ['嗨歌'], 4, 2, 20, '纯搞笑场合点'),
    ],
  },
  {
    id: 'pl_3', name: '新歌试炼场', note: '最近想练的新歌，练熟后移入正式歌单',
    tags: ['慢歌'], createdAt: daysAgo(12),
    songs: [
      mkSong('孤勇者', '陈奕迅', '4:29', ['慢歌', '嗨歌'], 2, 3, 8, '高音区还差一口气'),
      mkSong('起风了', '买辣椒也用券', '5:13', ['慢歌'], 1, 4, 3, ''),
    ],
  },
];

const seedTrash = () => [
  {
    id: 'tr_1', kind: 'song', deletedAt: daysAgo(3), playlistId: 'pl_1',
    data: mkSong('红日', '李克勤', '5:01', ['粤语', '嗨歌'], 2, 3, 70, ''),
  },
  {
    id: 'tr_2', kind: 'playlist', deletedAt: daysAgo(12),
    data: { id: 'pl_x', name: '2024 春节家庭局', note: '长辈爱点的老歌合集', tags: ['怀旧'], songs: [] },
  },
];

function initialState() {
  return {
    user: null,            // {type:'phone'|'wechat'|'qq'|'guest', name, phone}
    playlists: seedPlaylists(),
    tags: ['粤语', '慢歌', '嗨歌', '说唱', '怀旧', '情歌对唱'],
    trash: seedTrash(),
    guestPendingSync: false, // 游客产生的本地数据，待登录后同步
  };
}

// ============ Store ============
const StoreContext = createContext(null);

function useStoreState() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('whatsong_state_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.playlists) return parsed;
      }
    } catch (e) {}
    return initialState();
  });

  useEffect(() => {
    try { localStorage.setItem('whatsong_state_v1', JSON.stringify(state)); } catch (e) {}
  }, [state]);

  const actions = useMemo(() => ({
    // —— 登录 / 游客 ——
    login(user) {
      setState(s => ({ ...s, user, guestPendingSync: false }));
    },
    logout() {
      setState(s => ({ ...s, user: null }));
    },
    markGuestActivity() {
      setState(s => s.user && s.user.type === 'guest' && !s.guestPendingSync
        ? { ...s, guestPendingSync: true } : s);
    },

    // —— 歌单 ——
    addPlaylist({ name, note, tags }) {
      const pl = { id: nid(), name, note: note || '', tags: tags || [], createdAt: now(), songs: [] };
      setState(s => ({ ...s, playlists: [...s.playlists, pl] }));
      return pl.id;
    },
    updatePlaylist(id, patch) {
      setState(s => ({ ...s, playlists: s.playlists.map(p => p.id === id ? { ...p, ...patch } : p) }));
    },
    deletePlaylist(id) {
      let songCount = 0;
      setState(s => {
        const pl = s.playlists.find(p => p.id === id);
        if (!pl) return s;
        songCount = pl.songs.length;
        return {
          ...s,
          playlists: s.playlists.filter(p => p.id !== id),
          trash: [...s.trash, { id: nid(), kind: 'playlist', deletedAt: now(), data: pl }],
        };
      });
      return songCount;
    },

    // —— 歌曲 ——
    addSong(playlistId, songData) {
      const song = {
        id: nid(), name: songData.name, artist: songData.artist,
        duration: songData.duration, tags: songData.tags || [],
        times: songData.times || 0, firstTime: songData.times > 0 ? now() : 0,
        rating: 0, feedbacks: [],
      };
      setState(s => {
        return {
          ...s,
          playlists: s.playlists.map(p => p.id === playlistId ? { ...p, songs: [...p.songs, song] } : p),
          tags: mergeTags(s.tags, song.tags),
        };
      });
      return song.id;
    },
    updateSong(ident, newData) {
      setState(s => {
        const newTagsSet = new Set(s.tags);
        if (newData.tags) newData.tags.forEach(t => newTagsSet.add(t));
        const newTags = [...newTagsSet];
        const playlists = s.playlists.map(p => ({
          ...p,
          songs: p.songs.map(x => {
            if (x.name !== ident.name || x.artist !== ident.artist) return x;
            return { ...x, ...newData };
          }),
        }));
        return { ...s, playlists, tags: newTags };
      });
    },
    deleteSongs(playlistId, songIds) {
      setState(s => ({
        ...s,
        playlists: s.playlists.map(p => {
          if (p.id !== playlistId) return p;
          const removed = p.songs.filter(x => songIds.includes(x.id));
          return { ...p, songs: p.songs.filter(x => !songIds.includes(x.id)) };
        }),
        trash: [
          ...s.trash.filter(t => !(t.kind === 'song' && t.playlistId === playlistId && songIds.includes(t.data.id))),
          ...(s.playlists.find(p => p.id === playlistId)?.songs || [])
            .filter(x => songIds.includes(x.id))
            .map(x => ({ id: nid(), kind: 'song', deletedAt: now(), playlistId, data: x })),
        ],
      }));
    },
    copySongs(fromId, toId, songIds) {
      setState(s => ({
        ...s,
        playlists: s.playlists.map(p => p.id === toId
          ? { ...p, songs: [...p.songs, ...cloneSongs(s.playlists.find(x => x.id === fromId).songs.filter(x => songIds.includes(x.id)))] }
          : p),
      }));
    },
    moveSongs(fromId, toId, songIds) {
      setState(s => {
        const from = s.playlists.find(p => p.id === fromId);
        const moving = from.songs.filter(x => songIds.includes(x.id));
        return {
          ...s,
          playlists: s.playlists.map(p => {
            if (p.id === fromId) return { ...p, songs: p.songs.filter(x => !songIds.includes(x.id)) };
            if (p.id === toId) return { ...p, songs: [...p.songs, ...cloneSongs(moving)] };
            return p;
          }),
        };
      });
    },

    // —— 演唱反馈 ——
    addFeedback(playlistId, songId, { rating, note, addTags, removeTags }) {
      setState(s => {
        return {
          ...s,
          playlists: s.playlists.map(p => p.id !== playlistId ? p : {
            ...p,
            songs: p.songs.map(x => {
              if (x.id !== songId) return x;
              const tags = [...new Set([...x.tags.filter(t => !removeTags.includes(t)), ...addTags])];
              return {
                ...x, tags, times: x.times + 1, rating,
                feedbacks: [...x.feedbacks, { time: now(), rating, note: note || '' }],
              };
            }),
          }),
          tags: mergeTags(s.tags, addTags),
        };
      });
    },

    // —— 删除单条演唱反馈 ——
    deleteFeedback(playlistId, songId, feedbackTime) {
      setState(s => ({
        ...s,
        playlists: s.playlists.map(p => p.id !== playlistId ? p : {
          ...p,
          songs: p.songs.map(x => {
            if (x.id !== songId) return x;
            const feedbacks = x.feedbacks.filter(f => f.time !== feedbackTime);
            const times = Math.max(0, x.times - 1);
            return { ...x, feedbacks, times };
          }),
        }),
      }));
    },

    // —— 同步演唱反馈到所有歌单（同名同歌手） ——
    syncFeedbackToAll({ name, artist, rating, addTags, removeTags }) {
      setState(s => {
        const add = addTags || [];
        const remove = removeTags || [];
        return {
          ...s,
          playlists: s.playlists.map(p => ({
            ...p,
            songs: p.songs.map(x => {
              if (x.name !== name || x.artist !== artist) return x;
              const tags = [...new Set([...x.tags.filter(t => !remove.includes(t)), ...add])];
              return { ...x, rating, tags };
            }),
          })),
          tags: mergeTags(s.tags, add),
        };
      });
    },

    // —— 标签 ——
    setTagsOrdered(tags) {
      setState(s => ({ ...s, tags }));
    },
    addTag(name) {
      setState(s => {
        if (!name || s.tags.includes(name)) return s;
        if (s.tags.length >= 6) return s;
        return { ...s, tags: [...s.tags, name] };
      });
    },
    renameTag(oldName, newName) {
      setState(s => ({
        ...s,
        tags: s.tags.map(t => t === oldName ? newName : t),
        playlists: s.playlists.map(p => ({
          ...p,
          songs: p.songs.map(x => ({ ...x, tags: x.tags.map(t => t === oldName ? newName : t) })),
        })),
      }));
    },
    deleteTag(name) {
      setState(s => ({
        ...s,
        tags: s.tags.filter(t => t !== name),
        playlists: s.playlists.map(p => ({
          ...p,
          songs: p.songs.map(x => ({ ...x, tags: x.tags.filter(t => t !== name) })),
        })),
      }));
    },

    // —— 回收站 ——
    restoreTrash(trashId) {
      setState(s => {
        const item = s.trash.find(t => t.id === trashId);
        if (!item) return s;
        const trash = s.trash.filter(t => t.id !== trashId);
        if (item.kind === 'playlist') {
          return { ...s, trash, playlists: [...s.playlists, item.data] };
        }
        return {
          ...s, trash,
          playlists: s.playlists.map(p => p.id === item.playlistId ? { ...p, songs: [...p.songs, item.data] } : p),
        };
      });
    },
    purgeTrash(trashId) {
      setState(s => ({ ...s, trash: s.trash.filter(t => t.id !== trashId) }));
    },
    purgeAll() {
      setState(s => ({ ...s, trash: [] }));
    },
  }), []);

  return { state, actions };
}

function cloneSongs(songs) {
  return songs.map(x => ({ ...x, id: nid(), feedbacks: x.feedbacks.map(f => ({ ...f })) }));
}
function mergeTags(base, incoming) {
  const set = new Set([...base, ...(incoming || [])]);
  return [...set];
}

// 全局标签池（含标签池与所有歌曲上出现过的标签）
function useAllTags(state) {
  return useMemo(() => {
    const set = new Set(state.tags);
    state.playlists.forEach(p => {
      p.songs.forEach(x => x.tags.forEach(t => set.add(t)));
    });
    return [...set];
  }, [state.tags, state.playlists]);
}

// 我的演唱记录：每次演唱 = 一条记录的时间线
function useRecords(state) {
  return useMemo(() => {
    const list = [];
    state.playlists.forEach(p => {
      p.songs.forEach(x => {
        (x.feedbacks || []).forEach(f => {
          list.push({
            id: `${f.time}_${x.id}`,
            time: f.time,
            rating: f.rating,
            note: f.note || '',
            songId: x.id,
            name: x.name,
            artist: x.artist,
            duration: x.duration,
            tags: x.tags,
            times: x.times,
            playlistId: p.id,
            playlistName: p.name,
          });
        });
      });
    });
    return list.sort((a, b) => b.time - a.time);
  }, [state.playlists]);
}

// 所有歌曲聚合：跨歌单按歌名+歌手去重
function useAllSongs(state) {
  return useMemo(() => {
    const map = new Map();
    state.playlists.forEach(p => {
      p.songs.forEach(x => {
        const key = `${x.name}__${x.artist}`;
        if (!map.has(key)) {
          map.set(key, {
            id: `__all__${key}`,
            name: x.name,
            artist: x.artist,
            duration: x.duration,
            times: 0,
            rating: 0,
            tags: [],
            feedbacks: [],
            playlistIds: [],
            playlistNames: [],
            _latestTime: 0,
          });
        }
        const agg = map.get(key);
        agg.times += x.times;
        agg.tags = [...new Set([...agg.tags, ...(x.tags || [])])];
        agg.feedbacks = agg.feedbacks.concat(x.feedbacks || []);
        agg.playlistIds.push(p.id);
        agg.playlistNames.push(p.name);
        // rating 取所有 feedbacks 里最新一条的 rating
        (x.feedbacks || []).forEach(f => {
          if (f.time > agg._latestTime) {
            agg._latestTime = f.time;
            agg.rating = f.rating;
          }
        });
      });
    });
    const list = [...map.values()];
    list.sort((a, b) => b.times - a.times);
    return list;
  }, [state.playlists]);
}

Object.assign(window, {
  useStoreState, StoreContext, useAllTags, useRecords, useAllSongs, nid, DAYS, daysAgo,
});
