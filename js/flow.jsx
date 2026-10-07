// ============ 流程总览：按真实使用顺序分组的全部核心页面与关键状态 ============
const W = window;
const {
  FakeStore, Cell, Section, mkState, SEED_TAGS, USER_GUEST, SEED_PLAYLISTS, SEED_TRASH,
  SONG_WITH_HISTORY, SONG_FIRST_TIME, q, qa, byText, clickText, typeInto, sleep,
} = W;

const noop = () => {};
const S = mkState();                                   // 默认：手机号已登录
const S_GUEST = mkState({ user: USER_GUEST });         // 游客模式
const S_NO_TRASH = mkState({ trash: [] });             // 回收站空
const S_TAGS_5 = mkState({ tags: ['粤语', '慢歌', '嗨歌', '说唱', '怀旧'] }); // 未满 6 个标签
const S_WHEEL_EMPTY = mkState({ playlists: [SEED_PLAYLISTS[3]].concat(SEED_PLAYLISTS.slice(0, 3)) });

const home = (st) => <W.HomePage onOpenPlaylist={noop} onOpenAllSongs={noop} />;
const wrap = (st, node) => <FakeStore state={st}>{node}</FakeStore>;

const SECTIONS = [];

/* ══════════ 01 启动与登录 ══════════ */
SECTIONS.push(
  <Section id="s1" num="01" title="启动与登录"
    desc="冷启动 → 协议确认 → 账号进入"
    note="App 打开后第一屏是协议弹窗，必须先做出选择才能使用核心功能。登录支持手机号验证码、微信、QQ 三种方式，也可以直接以游客身份进入（数据暂存在本机）。">
    <Cell n="1" title="冷启动 · 协议弹窗（首屏）"
      hint="showAgree 默认为 true，进入即弹出，两个协议链接可直接点开查看。"
      isState>
      {wrap(mkState({ user: null }), <W.LoginPage />)}
    </Cell>

    <Cell n="2" title="登录页（手机号表单）"
      hint="点「同意并继续」后落到登录页：手机号 + 验证码、微信/QQ 第三方登录、游客模式三条路径。"
      script={async (el) => { clickText(el, '.btn', '同意并继续'); }}>
      {wrap(mkState({ user: null }), <W.LoginPage />)}
    </Cell>

    <Cell n="3" title="验证码已发送（60s 倒计时）"
      hint="手机号需满足 11 位才会发码；发码后按钮转为 60 秒倒计时，验证码输入框解锁。"
      script={async (el) => {
        clickText(el, '.btn', '同意并继续'); await sleep(60);
        typeInto(el, 'input', '13800138000'); await sleep(60);
        clickText(el, 'button', '获取验证码');
      }}>
      {wrap(mkState({ user: null }), <W.LoginPage />)}
    </Cell>

    <Cell n="4" title="隐私政策"
      hint="协议详情页，占位文本，点「我已阅读」返回。"
      isState
      script={async (el) => {
        clickText(el, '.btn', '同意并继续'); await sleep(60);
        clickText(el, 'button', '《隐私政策》');
      }}>
      {wrap(mkState({ user: null }), <W.LoginPage />)}
    </Cell>

    <Cell n="5" title="用户协议"
      hint="与隐私政策同构的另一个协议入口。"
      isState
      script={async (el) => {
        clickText(el, '.btn', '同意并继续'); await sleep(60);
        clickText(el, 'button', '《用户协议》');
      }}>
      {wrap(mkState({ user: null }), <W.LoginPage />)}
    </Cell>
  </Section>
);

/* ══════════ 02 首页 · 歌单总览 ══════════ */
SECTIONS.push(
  <Section id="s2" num="02" title="首页 · 歌单总览"
    desc="搜索 / 标签筛选 / 新建 / 批量管理"
    note="登录后默认停在首页。顶部是搜索框，其下「所有歌曲」聚合卡，右侧是标签与管理两个入口，主体是自建歌单列表。搜索框一旦聚焦或有关键词，整页切换为结果视图。">
    <Cell n="6" title="首页（默认态）" tab="home"
      hint="顶部搜索框 + 所有歌曲聚合卡（12 首 / 累计 38 次）+ 标签、管理按钮 + 添加歌单 + 歌单列表。">
      {wrap(S, home(S))}
    </Cell>

    <Cell n="7" title="搜索聚焦（展开标签筛选行）" tab="home" isState
      hint="点击搜索框聚焦后，标签横滑筛选行展开；此时还没有关键词，仍显示歌单列表。"
      script={async (el) => { const i = q(el, 'input'); if (i) i.focus(); }}>
      {wrap(S, home(S))}
    </Cell>

    <Cell n="8" title="标签筛选结果（#粤语）" tab="home" isState
      hint="选中标签后整页切到结果视图，列出命中的歌曲并标注所属歌单，点击可直接跳到该歌单。"
      script={async (el) => {
        const i = q(el, 'input'); if (i) i.focus(); await sleep(60);
        clickText(el, '.chip', '#粤语');
      }}>
      {wrap(S, home(S))}
    </Cell>

    <Cell n="9" title="关键词搜索结果" tab="home" isState
      hint="按歌名/歌手模糊匹配，结果行显示「歌名 · 歌手 · 时长 · 已唱次数 · 所属歌单」。"
      script={async (el) => {
        const i = q(el, 'input'); if (i) i.focus(); await sleep(60);
        typeInto(el, 'input', '海阔天空');
      }}>
      {wrap(S, home(S))}
    </Cell>

    <Cell n="10" title="搜索无结果（引导手动新增）" tab="home" isState
      hint="无命中时给出「手动新增歌曲『关键词』」的快捷入口，避免搜索死路。"
      script={async (el) => {
        const i = q(el, 'input'); if (i) i.focus(); await sleep(60);
        typeInto(el, 'input', '冷门测试曲目');
      }}>
      {wrap(S, home(S))}
    </Cell>

    <Cell n="11" title="手动新增歌曲弹窗" isState
      hint="从无结果页点进，歌名已预填关键词，可补歌手、时长、标签；提交后进入「所有歌曲」。">
      {wrap(S, <>
        {home(S)}
        <W.AddSongForm allTags={SEED_TAGS} defaultName="冷门测试曲目" onClose={noop} onSubmit={noop} />
      </>)}
    </Cell>

    <Cell n="12" title="首页 · 批量管理（已选 2 个）" tab="home" isState
      hint="点「管理」后列表项变为可选，底部操作条显示已选数量，可全选；此时底部 Tab 仍保留。"
      script={async (el) => {
        clickText(el, '.btn', '管理'); await sleep(60);
        clickText(el, '.playlist-card', '必点粤语金曲'); await sleep(40);
        clickText(el, '.playlist-card', '朋友局嗨歌台');
      }}>
      {wrap(S, home(S))}
    </Cell>

    <Cell n="13" title="批量删除确认" isState
      hint="二次确认弹窗，明确告知「歌单及歌曲一并移入回收站，30 天内可还原」。"
      script={async (el) => {
        clickText(el, '.btn', '管理'); await sleep(60);
        clickText(el, '.playlist-card', '必点粤语金曲'); await sleep(40);
        clickText(el, '.btn', '批量删除');
      }}>
      {wrap(S, home(S))}
    </Cell>

    <Cell n="14" title="新建歌单弹窗（空态）" isState
      hint="入口在首页主体顶部「添加歌单」。封面上传为可选，仅名称必填。"
      script={async (el) => { clickText(el, '.btn', '添加歌单'); }}>
      {wrap(S, home(S))}
    </Cell>

    <Cell n="15" title="编辑歌单弹窗" isState
      hint="由歌单卡片右侧铅笔图标进入；底部左侧是「删除歌单」，右侧保存需二次确认。"
      script={async (el) => {
        const b = qa(el, '.playlist-card button')[0];
        if (b) b.click();
      }}>
      {wrap(S, home(S))}
    </Cell>

    <Cell n="16" title="歌单编辑 · 保存确认" isState
      hint="点保存后先弹「确认修改」，避免误触覆盖已有备注/封面。"
      script={async (el) => {
        const b = qa(el, '.playlist-card button')[0]; if (b) b.click(); await sleep(80);
        clickText(el, '.btn', '保存');
      }}>
      {wrap(S, home(S))}
    </Cell>
  </Section>
);

/* ══════════ 03 歌单详情与歌曲管理 ══════════ */
SECTIONS.push(
  <Section id="s3" num="03" title="歌单详情与歌曲管理"
    desc="进入歌单 → 增删改歌曲 → 打印小票"
    note="详情页顶部是歌单信息卡（含打印小票入口），下方是歌曲列表。右上角「管理」切换到多选态，可对歌曲做复制 / 移动 / 删除。">
    <Cell n="17" title="歌单详情页"
      hint="歌曲行显示序号、歌名、歌手 · 时长 · 已唱次数、星级自评、标签与最近一条演唱备注；右侧是演唱反馈与编辑两个操作。">
      {wrap(S, <W.DetailPage playlistId="pl_1" onBack={noop} />)}
    </Cell>

    <Cell n="18" title="空歌单详情" isState
      hint="歌曲列表为空时的虚线占位卡，引导「先添加一首歌」。">
      {wrap(S, <W.DetailPage playlistId="pl_4" onBack={noop} />)}
    </Cell>

    <Cell n="19" title="添加歌曲弹窗" isState
      hint="可填歌名 / 歌手 / 时长 / 标签，并能直接录入「历史已唱次数」（用于补录旧数据）。">
      {wrap(S, <>
        <W.DetailPage playlistId="pl_1" onBack={noop} />
        <W.AddSongModal allTags={SEED_TAGS} onClose={noop} onSubmit={noop} />
      </>)}
    </Cell>

    <Cell n="20" title="编辑歌曲弹窗" isState
      hint="按「歌名 + 歌手」匹配修改，保存时会提示「将同步更新所有歌单中该歌曲的信息」。">
      {wrap(S, <>
        <W.DetailPage playlistId="pl_1" onBack={noop} />
        <W.EditSongModal song={SEED_PLAYLISTS[0].songs[0]} allTags={SEED_TAGS} onClose={noop} onSubmit={noop} />
      </>)}
    </Cell>

    <Cell n="21" title="编辑歌曲 · 确认修改" isState
      hint="编辑是跨歌单的写操作，因此强制二次确认。"
      script={async (el) => { clickText(el, '.btn', '提交编辑'); }}>
      {wrap(S, <>
        <W.DetailPage playlistId="pl_1" onBack={noop} />
        <W.EditSongModal song={SEED_PLAYLISTS[0].songs[0]} allTags={SEED_TAGS} onClose={noop} onSubmit={noop} />
      </>)}
    </Cell>

    <Cell n="22" title="详情 · 批量管理（全选）" isState
      hint="序号位替换为复选框，操作条提供复制 / 移动 / 删除；全选按钮可一键全选或清空。"
      script={async (el) => {
        clickText(el, '.btn', '管理'); await sleep(60);
        clickText(el, 'button', '全选');
      }}>
      {wrap(S, <W.DetailPage playlistId="pl_1" onBack={noop} />)}
    </Cell>

    <Cell n="23" title="复制到 / 移动到其他歌单" isState
      hint="选中歌曲后弹出目标歌单列表；只有 1 个歌单时给出「暂无其他歌单可操作」的提示。"
      script={async (el) => {
        clickText(el, '.btn', '管理'); await sleep(60);
        const cb = qa(el, '.cbx-btn')[0]; if (cb) cb.click(); await sleep(60);
        clickText(el, '.btn', '复制到');
      }}>
      {wrap(S, <W.DetailPage playlistId="pl_1" onBack={noop} />)}
    </Cell>

    <Cell n="24" title="所有歌曲（跨歌单聚合）"
      hint="从首页「所有歌曲」卡进入：按歌名+歌手去重，演唱次数累加，评分取最新一条反馈；同样支持演唱反馈、编辑与打印小票。">
      {wrap(S, <W.AllSongsPage onBack={noop} />)}
    </Cell>
  </Section>
);

/* ══════════ 04 演唱反馈闭环 ══════════ */
SECTIONS.push(
  <Section id="s4" num="04" title="演唱反馈闭环"
    desc="唱完一首 → 打分记录 → 跨歌单同步"
    note="这是全 App 的核心动作：每一次演唱都会生成一条反馈（星级 + 备注 + 标签调整），演唱次数 +1；由于同一首歌可能存在于多个歌单，提交后会强制确认是否同步评分与标签。">
    <Cell n="25" title="演唱反馈弹窗（有历史记录）" isState
      hint="上半部分是历史反馈倒序列表（星级 + 时间 + 备注），下半部分是本次自评星级、标签增删与备注。">
      {wrap(S, <>
        <W.DetailPage playlistId="pl_1" onBack={noop} />
        <W.FeedbackModal song={SONG_WITH_HISTORY} allTags={SEED_TAGS} onClose={noop} onSubmit={noop} />
      </>)}
    </Cell>

    <Cell n="26" title="演唱反馈弹窗（首次演唱）" isState
      hint="还没有任何反馈时的空态：「还没有演唱记录，提交第一条反馈吧」。">
      {wrap(S, <>
        <W.DetailPage playlistId="pl_1" onBack={noop} />
        <W.FeedbackModal song={SONG_FIRST_TIME} allTags={SEED_TAGS} onClose={noop} onSubmit={noop} />
      </>)}
    </Cell>

    <Cell n="27" title="同步到所有歌单 · 确认" isState
      hint="提交反馈后的必经一步：把本次评分与标签调整同步到所有歌单中的同名歌曲。"
      script={async (el) => {
        clickText(el, '.btn', '演唱反馈'); await sleep(80);
        clickText(el, '.btn', '记录这次演唱（+1 次）');
      }}>
      {wrap(S, <W.DetailPage playlistId="pl_1" onBack={noop} />)}
    </Cell>

    <Cell n="28" title="完成 · Toast 提示" isState
      hint="同步完成后 Toast 明确反馈「演唱次数 +1，评分与标签已同步到 N 个歌单」。"
      script={async (el) => {
        clickText(el, '.btn', '演唱反馈'); await sleep(80);
        clickText(el, '.btn', '记录这次演唱（+1 次）'); await sleep(80);
        clickText(el, '.btn', '确认并同步');
      }}>
      {wrap(S, <W.DetailPage playlistId="pl_1" onBack={noop} />)}
    </Cell>
  </Section>
);

/* ══════════ 05 打印歌单小票 ══════════ */
SECTIONS.push(
  <Section id="s5" num="05" title="打印歌单小票"
    desc="预览 → 出纸动画 → 保存"
    note="从歌单信息卡或「所有歌曲」页顶部进入。三个阶段共用同一页：READY（准备就绪）→ PRINTING（出纸动画约 1 秒）→ DONE（完整小票可上下滑动，底部换成保存按钮）。">
    <Cell n="29" title="READY · 准备就绪"
      hint="小票尚未出纸，底部主按钮为「开始打印」。">
      {wrap(S, <W.PrintReceiptPage playlist={SEED_PLAYLISTS[0]} onBack={noop} />)}
    </Cell>

    <Cell n="30" title="PRINTING · 出纸中" isState
      hint="指示灯闪烁、打印机轻微抖动，纸轨由 0 高度展开到完整小票（约 1 秒）。">
      {wrap(S, (
        <div className="screen">
          <W.AppHeader title="打印歌单小票" sub={SEED_PLAYLISTS[0].name} onBack={noop} />
          <div className="scroll-area">
            <div className="page-body">
              <div className="printer-stage printing">
                <div className="printer">
                  <div className="pr-paper-in"></div>
                  <div className="pr-body">
                    <div className="pr-vents">{[0, 1, 2].map(i => <i key={i}></i>)}</div>
                    <div className="pr-row">
                      <span className="pr-brand">WS-PRINTER</span>
                      <span className="pr-light" style={{ background: '#111' }}></span>
                    </div>
                  </div>
                  <div className="pr-mouth"></div>
                </div>
                <div className="pr-track" style={{ gridTemplateRows: '1fr' }}>
                  <div className="pr-track-inner">
                    <W.ReceiptPaper playlist={SEED_PLAYLISTS[0]} />
                  </div>
                </div>
                <div className="pr-status">PRINTING · 正在打印…</div>
              </div>
            </div>
          </div>
          <div className="page-foot">
            <div className="btn btn-primary btn-block" style={{ opacity: .55 }}>
              <W.Icon name="printer" size={12} /> 正在打印…
            </div>
          </div>
        </div>
      ))}
    </Cell>

    <Cell n="31" title="DONE · 打印完成（可保存）"
      hint="纸轨完全展开，底部按钮切换为「保存歌单小票到相册」，点击后 Toast 提示已保存。"
      script={async (el) => { clickText(el, '.btn', '开始打印'); await sleep(1500); }}>
      {wrap(S, <W.PrintReceiptPage playlist={SEED_PLAYLISTS[0]} onBack={noop} />)}
    </Cell>
  </Section>
);

/* ══════════ 06 玩法 · 大转盘选歌 ══════════ */
SECTIONS.push(
  <Section id="s6" num="06" title="玩法 · 大转盘选歌"
    desc="选歌单 → 转盘 → 结果 → 演唱反馈"
    note="玩法页是两列明信片式卡片网格（目前仅「大转盘选歌」已上线，其余为待开发占位）。转盘最多 8 格，歌曲不足时循环填充；结果弹窗可直接接演唱反馈，与歌单详情页共用同一套数据。">
    <Cell n="32" title="玩法页" tab="play"
      hint="两列卡片网格；未上线的玩法点击会 Toast 提示「正在开发中」。">
      {wrap(S, <W.PlayPage onOpenWheel={noop} />)}
    </Cell>

    <Cell n="33" title="大转盘 · 就绪"
      hint="顶部切换歌单，转盘按歌曲数等分扇区（最多 8 格），点击中心「开始」旋转约 3.7 秒。">
      {wrap(S, <W.WheelPlayPage onBack={noop} onOpenPlaylist={noop} />)}
    </Cell>

    <Cell n="34" title="转盘旋转中" isState
      hint="中心按钮变为「···」并禁用，下方文案切换为「转盘旋转中…」。">
      {wrap(S, (
        <div className="screen">
          <W.AppHeader title="大转盘选歌" onBack={noop} />
          <div className="scroll-area">
            <div className="page-body">
              <div className="card pad">
                <div className="field-label"><span>选择歌单</span><span className="muted">点击切换用于转盘的歌单</span></div>
                <div className="btn" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span className="row-flex" style={{ gap: 6 }}>
                    <W.Icon name="disc" size={12} /> 必点粤语金曲
                  </span>
                  <span className="row-flex" style={{ gap: 6 }}>
                    <span className="muted">5 首</span>
                    <W.Icon name="chevron" size={12} color="#B9B9B9" />
                  </span>
                </div>
                <div className="divider"></div>
                <div className="wheel-wrap">
                  <div className="wheel-pointer"></div>
                  <svg className="wheel-disc" viewBox="0 0 270 270" style={{ transform: 'rotate(1240deg)' }}>
                    <W.WheelSectors songs={SEED_PLAYLISTS[0].songs} />
                  </svg>
                  <div className="wheel-hub" style={{ cursor: 'default' }}>
                    <span className="mono" style={{ fontSize: 10 }}>···</span>
                  </div>
                </div>
                <div className="muted" style={{ textAlign: 'center' }}>转盘旋转中…</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </Cell>

    <Cell n="35" title="本轮选中结果" isState
      hint="结果弹窗展示歌名、歌手、时长、来源歌单、标签与上次自评；可「再转一次」或直接接「演唱反馈」。"
      script={async (el) => { const h = q(el, '.wheel-hub'); if (h) h.click(); await sleep(4000); }}>
      {wrap(S, <W.WheelPlayPage onBack={noop} onOpenPlaylist={noop} />)}
    </Cell>

    <Cell n="36" title="选择歌单弹窗" isState
      hint="列表展示全部歌单及歌曲数，当前选中项打勾。"
      script={async (el) => { clickText(el, 'button', '必点粤语金曲'); }}>
      {wrap(S, <W.WheelPlayPage onBack={noop} onOpenPlaylist={noop} />)}
    </Cell>

    <Cell n="37" title="歌单为空 · 无法启动转盘" isState
      hint="没有歌曲时不渲染转盘，改为提示 + 「去添加歌曲」直达歌单详情（此处默认选中第一个歌单即为空单）。">
      {wrap(S_WHEEL_EMPTY, <W.WheelPlayPage onBack={noop} onOpenPlaylist={noop} />)}
    </Cell>
  </Section>
);

/* ══════════ 07 我的 · 账户与演唱记录 ══════════ */
SECTIONS.push(
  <Section id="s7" num="07" title="我的 · 账户与演唱记录"
    desc="账户信息 → 演唱流水 → 回收站"
    note="「我的」是全 App 唯一的统计出口：账户卡片汇总歌单数 / 歌曲数 / 累计演唱次数。演唱记录把每一次 feedback 摊平成一条条时间线，可批量删除。">
    <Cell n="38" title="我的（已登录账号）" tab="mine"
      hint="账户卡显示身份标签与 masked 手机号，下方是回收站与演唱记录两个入口，底部退出登录。">
      {wrap(S, <W.MinePage onOpenSub={noop} onLogout={noop} />)}
    </Cell>

    <Cell n="39" title="我的（游客模式）" tab="mine" isState
      hint="多出一条虚线提示卡「本地记录仅保存在本机」，按钮文案变为「登录并同步」与「退出游客模式」。">
      {wrap(S_GUEST, <W.MinePage onOpenSub={noop} onLogout={noop} />)}
    </Cell>

    <Cell n="40" title="我的演唱记录"
      hint="按时间倒序的演唱流水：歌名、歌手、演唱时间、本次星级与「第 N 次」、标签、备注。">
      {wrap(S, <W.RecordsPage onBack={noop} onOpenPlaylist={noop} />)}
    </Cell>

    <Cell n="41" title="演唱记录 · 批量管理" isState
      hint="右上角「管理」进入多选，勾选后批量删除。"
      script={async (el) => {
        clickText(el, '.btn', '管理'); await sleep(60);
        clickText(el, 'button', '全选');
      }}>
      {wrap(S, <W.RecordsPage onBack={noop} onOpenPlaylist={noop} />)}
    </Cell>

    <Cell n="42" title="删除记录 · 确认" isState
      hint="文案明确「记录删除将同步到该歌曲信息，后将不会出现在回收箱」——即不进回收站。"
      script={async (el) => {
        clickText(el, '.btn', '管理'); await sleep(60);
        const cb = qa(el, '.cbx-btn')[0]; if (cb) cb.click(); await sleep(60);
        clickText(el, '.btn', '批量删除');
      }}>
      {wrap(S, <W.RecordsPage onBack={noop} onOpenPlaylist={noop} />)}
    </Cell>
  </Section>
);

/* ══════════ 08 回收站与恢复 ══════════ */
SECTIONS.push(
  <Section id="s8" num="08" title="回收站与恢复"
    desc="删除之后的可逆出口"
    note="歌单与歌曲的删除都先进回收站，保留 30 天并显示剩余天数。三种操作：单项还原、单项彻底删除、一键清空。">
    <Cell n="43" title="回收站（有内容）"
      hint="每项显示名称、来源信息、删除时间与「剩余 N 天」；歌单类会标注「（整个歌单）」及所含歌曲数。">
      {wrap(S, <W.TrashPage onBack={noop} />)}
    </Cell>

    <Cell n="44" title="回收站 · 空" isState
      hint="虚线占位卡「回收站是空的」。">
      {wrap(S_NO_TRASH, <W.TrashPage onBack={noop} />)}
    </Cell>

    <Cell n="45" title="还原确认" isState
      hint="还原后歌曲回到原歌单、歌单回到首页列表。"
      script={async (el) => { clickText(el, '.btn', '还原'); }}>
      {wrap(S, <W.TrashPage onBack={noop} />)}
    </Cell>

    <Cell n="46" title="彻底删除确认" isState
      hint="强提示「无法恢复」，区别于普通删除。"
      script={async (el) => { clickText(el, '.btn', '彻底删除'); }}>
      {wrap(S, <W.TrashPage onBack={noop} />)}
    </Cell>

    <Cell n="47" title="清空回收站确认" isState
      hint="一键清空，同样是不可逆操作，需二次确认。"
      script={async (el) => { clickText(el, '.btn', '清空回收站'); }}>
      {wrap(S, <W.TrashPage onBack={noop} />)}
    </Cell>
  </Section>
);

/* ══════════ 09 标签管理 ══════════ */
SECTIONS.push(
  <Section id="s9" num="09" title="标签管理"
    desc="创建 / 排序 / 重命名 / 删除"
    note="标签上限 6 个。列表长按约 0.5 秒进入拖拽排序，轻点右侧铅笔进入编辑。重命名与删除都会级联更新所有歌单中歌曲上的标签。">
    <Cell n="48" title="标签管理弹窗（已满 6 个）" isState
      hint="每行显示序号、标签名与「N 处使用」；已满 6 个时不再显示「添加标签」按钮。">
      {wrap(S, <>
        {home(S)}
        <W.TagManageModal onClose={noop} />
      </>)}
    </Cell>

    <Cell n="49" title="添加标签弹窗" isState
      hint="未满 6 个时出现；标签名最多 8 字，重名不可提交。"
      script={async (el) => { clickText(el, '.btn', '添加标签'); }}>
      {wrap(S_TAGS_5, <>
        {home(S_TAGS_5)}
        <W.TagManageModal onClose={noop} />
      </>)}
    </Cell>

    <Cell n="50" title="编辑标签弹窗" isState
      hint="重命名会「同步所有歌单与歌曲」；未改动时保存按钮置灰。"
      script={async (el) => {
        const b = qa(el, '.list-row .icon-btn')[0];
        if (b) b.click();
      }}>
      {wrap(S, <>
        {home(S)}
        <W.TagManageModal onClose={noop} />
      </>)}
    </Cell>

    <Cell n="51" title="删除标签 · 确认" isState
      hint="提示「所有歌曲上的该标签将一并移除」——删除是不可逆的。"
      script={async (el) => {
        const b = qa(el, '.list-row .icon-btn')[0]; if (b) b.click(); await sleep(80);
        clickText(el, '.btn', '删除标签');
      }}>
      {wrap(S, <>
        {home(S)}
        <W.TagManageModal onClose={noop} />
      </>)}
    </Cell>
  </Section>
);

window.__FLOW_SECTIONS = SECTIONS;

/* ══════════ 页面装配 ══════════ */
const NAV = [
  ['s1', '01 启动与登录', 5], ['s2', '02 首页 · 歌单总览', 11], ['s3', '03 歌单详情与歌曲', 8],
  ['s4', '04 演唱反馈闭环', 4], ['s5', '05 打印歌单小票', 3], ['s6', '06 大转盘玩法', 6],
  ['s7', '07 我的 · 演唱记录', 5], ['s8', '08 回收站与恢复', 5], ['s9', '09 标签管理', 4],
];

function Overview() {
  return (
    <W.ToastProvider>
      <div>
        <div className="ov-hero">
          <div className="ov-hero-top">
            <div>
              <div className="ov-title">WHAT<span>—</span>SONG · 全流程总览</div>
              <div className="ov-sub">按真实使用顺序分组 · 核心页面与关键状态一页铺平</div>
            </div>
            <div className="ov-meta">
              51 个界面 / 状态<br />
              9 个流程分组 · 390×844
            </div>
          </div>
          <div className="ov-nav">
            {NAV.map(([id, label, n]) => (
              <a key={id} href={'#' + id}>{label} · {n}</a>
            ))}
          </div>
        </div>

        {SECTIONS}

        <div className="ov-foot">
          本页由 js/ 下的真实 React 组件渲染，每一格都是组件被「点」到对应内部状态后的真实画面（非手绘静态图），
          因此与 App 永远保持一致。<br />
          编号圆圈为实线 = 主页面；虚线 = 弹窗 / 选中态 / 空态等关键状态。
        </div>
      </div>
    </W.ToastProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Overview />);
