// ============ 流程总览：基础设施（手机壳 / 状态驱动 / 假数据） ============
const { useState, useEffect, useRef, useMemo, useContext, useCallback } = React;
const W = window;

// —— 假 Store：actions 全部为 no-op，保证每一格画面冻结在指定状态 ——
const NOOP = new Proxy({}, { get: (t, k) => (typeof k === 'string' ? () => {} : undefined) });

function FakeStore({ state, children }) {
  const store = useMemo(() => ({ state, actions: NOOP }), [state]);
  return <W.StoreContext.Provider value={store}>{children}</W.StoreContext.Provider>;
}

// —— 状态栏 ——
function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="icons">
        <svg width="17" height="11" viewBox="0 0 16 10" fill="none" stroke="#111" strokeWidth="1.2">
          <rect x="0.6" y="6" width="2.6" height="3.4" fill="#111" stroke="none"></rect>
          <rect x="4.3" y="4" width="2.6" height="5.4" fill="#111" stroke="none"></rect>
          <rect x="8" y="2" width="2.6" height="7.4" fill="#111" stroke="none"></rect>
          <rect x="11.7" y="0.2" width="2.6" height="9.2" fill="none"></rect>
        </svg>
        <svg width="15" height="11" viewBox="0 0 14 10" fill="none" stroke="#111" strokeWidth="1.2">
          <path d="M1 3.4a9 9 0 0 1 12 0"></path>
          <path d="M3.2 5.6a6 6 0 0 1 7.6 0"></path>
          <circle cx="7" cy="8" r="0.9" fill="#111" stroke="none"></circle>
        </svg>
        <svg width="24" height="11" viewBox="0 0 22 10" fill="none" stroke="#111" strokeWidth="1.1">
          <rect x="0.6" y="0.6" width="17" height="8.8" rx="2.4"></rect>
          <rect x="2.4" y="2.4" width="10.5" height="5.2" fill="#111" stroke="none"></rect>
          <path d="M19.4 3.4v3.2" strokeLinecap="round"></path>
        </svg>
      </span>
    </div>
  );
}

// —— 底部 Tab（与 app.jsx 一致，但不可点击跳转） ——
const TABS = [
  { key: 'home', label: 'WHATSONG', icon: 'home' },
  { key: 'play', label: '玩法', icon: 'game' },
  { key: 'mine', label: '我的', icon: 'user' },
];
function TabBar({ active }) {
  return (
    <div className="tabbar">
      {TABS.map(t => (
        <div key={t.key} className={`tab-item ${active === t.key ? 'active' : ''}`}>
          <W.Icon name={t.icon} size={20} />
          <span className="t-label">{t.label}</span>
        </div>
      ))}
    </div>
  );
}

// —— 把组件"点"到某个内部状态：直接派发真实 DOM 事件，React 会照常响应 ——
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function q(root, sel) { return root.querySelector(sel); }
function qa(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
function byText(root, sel, text) {
  return qa(root, sel).find(n => (n.textContent || '').indexOf(text) >= 0);
}
function clickText(root, sel, text) {
  const b = byText(root, sel, text);
  if (b) { b.click(); return true; }
  return false;
}
function typeInto(root, sel, value) {
  const el = q(root, sel);
  if (!el) return false;
  const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement : window.HTMLInputElement;
  const setter = Object.getOwnPropertyDescriptor(proto.prototype, 'value').set;
  setter.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

// —— 每格独立的 Toast：让提示气泡显示在自己的手机里，而不是整页底部 ——
function LocalToast({ children }) {
  const [msg, setMsg] = useState(null);
  const show = useCallback((text) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 60000);
  }, []);
  return (
    <W.ToastContext.Provider value={show}>
      {children}
      {msg ? <div className="toast-host"><div className="toast">{msg}</div></div> : null}
    </W.ToastContext.Provider>
  );
}

// —— 单格：一个缩小的手机 + 编号 + 说明 ——
function Cell({ n, title, hint, isState, tab, script, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!script) return undefined;
    let dead = false;
    const run = async () => {
      await sleep(60);
      if (dead || !ref.current) return;
      try { await script(ref.current); } catch (e) { console.warn('[cell ' + n + ']', e); }
    };
    run();
    return () => { dead = true; };
  }, []);

  return (
    <div className="ov-cell">
      <div className={`ov-cap ${isState ? 'is-state' : ''}`}>
        <span className="n">{n}</span><span className="t">{title}</span>
      </div>
      <div className="ov-frame" ref={ref}>
        <div className="phone">
          <div className="phone-notch"></div>
          <StatusBar />
          <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <LocalToast>{children}</LocalToast>
          </div>
          {tab ? <TabBar active={tab} /> : null}
        </div>
      </div>
      <div className="ov-hint">{hint}</div>
    </div>
  );
}

// —— 分组 ——
function Section({ id, num, title, desc, note, children }) {
  return (
    <div className="ov-section" id={id}>
      <div className="ov-sec-head">
        <div className="ov-sec-num">{num}</div>
        <div className="ov-sec-title">{title}</div>
        <div className="ov-sec-desc">{desc}</div>
        <div className="ov-sec-line"></div>
      </div>
      {note ? <div className="ov-sec-note">{note}</div> : null}
      <div className="ov-grid">{children}</div>
    </div>
  );
}

Object.assign(window, {
  FakeStore, StatusBar, TabBar, Cell, Section,
  q, qa, byText, clickText, typeInto, sleep, NOOP,
});
