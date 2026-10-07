// ============ 流程总览：示例数据（与 js/data.jsx 种子一致，另加若干用于展示边界状态的样本） ============
const { daysAgo } = window;

let _gid = 900;
const gid = () => 'g' + (_gid++);

function mkSong(name, artist, duration, tags, times, rating, firstDaysAgo, lastNote) {
  const feedbacks = [];
  for (let i = 0; i < Math.min(times, 3); i++) {
    feedbacks.push({
      time: daysAgo(firstDaysAgo + i),
      rating: rating,
      note: i === Math.min(times, 3) - 1 && lastNote ? lastNote : '',
    });
  }
  return { id: gid(), name, artist, duration, tags, times, firstTime: daysAgo(firstDaysAgo), rating, feedbacks };
}

const SEED_PLAYLISTS = [
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
  {
    id: 'pl_4', name: '家庭局暖场备用', note: '还没想好放什么，先建个空单',
    tags: ['怀旧'], createdAt: daysAgo(5), songs: [],
  },
];

const SEED_TRASH = [
  { id: 'tr_1', kind: 'song', deletedAt: daysAgo(3), playlistId: 'pl_1',
    data: mkSong('红日', '李克勤', '5:01', ['粤语', '嗨歌'], 2, 3, 70, '') },
  { id: 'tr_2', kind: 'playlist', deletedAt: daysAgo(12),
    data: { id: 'pl_x', name: '2024 春节家庭局', note: '长辈爱点的老歌合集', tags: ['怀旧'],
      songs: [mkSong('漫步人生路', '邓丽君', '3:42', ['怀旧'], 3, 4, 100, ''),
              mkSong('月亮代表我的心', '邓丽君', '3:30', ['怀旧'], 2, 4, 100, '')] } },
];

const SEED_TAGS = ['粤语', '慢歌', '嗨歌', '说唱', '怀旧', '情歌对唱'];

const USER_PHONE = { type: 'phone', name: '用户 8000', phone: '13800138000' };
const USER_WECHAT = { type: 'wechat', name: '微信用户_8371' };
const USER_GUEST = { type: 'guest', name: '游客' };

// 组装一份完整的 store state（可覆盖任意字段）
function mkState(over) {
  return Object.assign({
    user: USER_PHONE,
    playlists: SEED_PLAYLISTS,
    tags: SEED_TAGS,
    trash: SEED_TRASH,
    guestPendingSync: false,
  }, over || {});
}

// 供演唱反馈弹窗使用的"丰富历史"歌曲样本
const SONG_WITH_HISTORY = SEED_PLAYLISTS[0].songs[0];   // 海阔天空 · 12 次
const SONG_FIRST_TIME = mkSong('起风了', '买辣椒也用券', '5:13', ['慢歌'], 0, 0, 0, '');

Object.assign(window, {
  SEED_PLAYLISTS, SEED_TRASH, SEED_TAGS,
  USER_PHONE, USER_WECHAT, USER_GUEST,
  mkState, SONG_WITH_HISTORY, SONG_FIRST_TIME, mkSong,
});
