// ============ 线框 UI 基础组件 ============
const { useState, useEffect, useRef, useCallback, useContext, useMemo } = React;

// —— 线性图标（统一 1.5px 描边线框风） ——
function Icon({ name, size = 18, color = 'currentColor', filled = false, sw }) {
  const p = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: sw || 1.5, strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { flex: `0 0 ${size}px` },
  };
  const paths = {
    search: <><circle cx="10.5" cy="10.5" r="6.5"></circle><line x1="15.5" y1="15.5" x2="21" y2="21"></line></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></>,
    back: <><polyline points="14 5 7 12 14 19"></polyline></>,
    close: <><line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line></>,
    printer: <><path d="M7 8V4h10v4"></path><rect x="4" y="8" width="16" height="8" rx="1"></rect><path d="M7 14h10v6H7z"></path></>,
    image: <><rect x="4" y="5" width="16" height="14" rx="1"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="M4 17l5-5 4 4 3-3 4 4"></path></>,
    disc: <><circle cx="12" cy="12" r="8.5"></circle><circle cx="12" cy="12" r="2"></circle></>,
    play: <><circle cx="12" cy="12" r="8.5"></circle><path d="M10.2 8.8l5 3.2-5 3.2z"></path></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5.5 11a6.5 6.5 0 0 0 13 0"></path><line x1="12" y1="17.5" x2="12" y2="21"></line></>,
    home: <><path d="M4 11l8-7 8 7"></path><path d="M6 10v10h12V10"></path></>,
    game: <><rect x="3" y="7" width="18" height="11" rx="4"></rect><line x1="8" y1="10" x2="8" y2="14"></line><line x1="6" y1="12" x2="10" y2="12"></line><circle cx="16" cy="11" r="0.8"></circle><circle cx="18" cy="13.5" r="0.8"></circle></>,
    user: <><circle cx="12" cy="8" r="4"></circle><path d="M4.5 20c1.2-3.5 4-5.5 7.5-5.5s6.3 2 7.5 5.5"></path></>,
    trash: <><path d="M4 7h16"></path><path d="M9 7V4h6v3"></path><path d="M6 7l1 14h10l1-14"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></>,
    restore: <><path d="M4 12a8 8 0 1 1 2.3 5.7"></path><polyline points="4 7 4 12 9 12"></polyline></>,
    edit: <><path d="M4 20h16"></path><path d="M14.5 3.5l6 6L9 21H4v-5z"></path></>,
    drag: <><circle cx="9" cy="6" r="1.3"></circle><circle cx="15" cy="6" r="1.3"></circle><circle cx="9" cy="12" r="1.3"></circle><circle cx="15" cy="12" r="1.3"></circle><circle cx="9" cy="18" r="1.3"></circle><circle cx="15" cy="18" r="1.3"></circle></>,
    chevron: <><polyline points="9 5 16 12 9 19"></polyline></>,
    check: <><polyline points="4.5 12.5 9.5 17.5 19.5 6.5"></polyline></>,
    phone: <><rect x="7" y="3" width="10" height="18" rx="2"></rect><circle cx="12" cy="18" r="0.9"></circle></>,
    wechat: <><path d="M9.5 4C5.9 4 3 6.5 3 9.6c0 1.8 1 3.4 2.5 4.4L5 16l2.6-1.3c.6.1 1.2.2 1.9.2h.4a5.4 5.4 0 0 1-.2-1.5c0-3.1 2.9-5.6 6.5-5.6h.6C16.3 5.6 13.2 4 9.5 4z"></path><path d="M21 13.4c0-2.6-2.5-4.7-5.4-4.7s-5.4 2.1-5.4 4.7 2.4 4.7 5.4 4.7c.5 0 1-.1 1.5-.2L19.5 19l-.5-1.6c1.2-.9 2-2.3 2-4z"></path></>,
    qq: <><path d="M12 3.5c-3.2 0-5 2.4-5 5.4 0 .7 0 1.4-.4 2-.7 1.2-1.6 1.7-1.6 3.2 0 1 .8 1.4 1.3 1.6.2.1.3.3.2.5-.3.8-.2 1.5.3 1.8.6.3 1.4 0 1.9-.2.3-.1.5 0 .6.2.3.7 1.1 1.2 2.7 1.2s2.4-.5 2.7-1.2c.1-.2.3-.3.6-.2.5.2 1.3.5 1.9.2.5-.3.6-1 .3-1.8-.1-.2 0-.4.2-.5.5-.2 1.3-.6 1.3-1.6 0-1.5-.9-2-1.6-3.2-.4-.6-.4-1.3-.4-2 0-3-1.8-5.4-5-5.4z"></path></>,
    tag: <><path d="M4 4h7l9 9-7 7-9-9z"></path><circle cx="8.5" cy="8.5" r="1.2"></circle></>,
    list: <><line x1="8" y1="6" x2="20" y2="6"></line><line x1="8" y1="12" x2="20" y2="12"></line><line x1="8" y1="18" x2="20" y2="18"></line><circle cx="4.5" cy="6" r="0.9"></circle><circle cx="4.5" cy="12" r="0.9"></circle><circle cx="4.5" cy="18" r="0.9"></circle></>,
    star: <path d="M12 3.2l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.7 6.6 19.7l1.2-6L3.3 9.5l6.1-.7z"></path>,
    note: <><path d="M6 3h9l4 4v14H6z"></path><path d="M15 3v4h4"></path><line x1="9" y1="12" x2="15" y2="12"></line><line x1="9" y1="16" x2="13" y2="16"></line></>,
    import: <><path d="M12 3v10"></path><polyline points="8 9 12 13 16 9"></polyline><path d="M4 17v3h16v-3"></path></>,
    book: <><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z"></path><path d="M9 3v18"></path></>,
    clock: <><circle cx="12" cy="12" r="8.5"></circle><polyline points="12 7 12 12 15.5 14"></polyline></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="1.5"></rect><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"></path></>,
    move: <><path d="M12 3v18"></path><path d="M3 12h18"></path><polyline points="7 21 12 16 17 21" transform="translate(0,-9) scale(1,0.001)" opacity="0"></polyline><polyline points="9 7 12 4 15 7"></polyline><polyline points="9 17 12 20 15 17"></polyline><polyline points="7 9 4 12 7 15"></polyline><polyline points="17 9 20 12 17 15"></polyline></>,
    camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4z"></path><circle cx="12" cy="13" r="3.5"></circle></>,
    logout: <><path d="M9 4H5v16h4"></path><path d="M14 8l4 4-4 4"></path><line x1="18" y1="12" x2="9" y2="12"></line></>,
    filter: <><line x1="4" y1="6" x2="20" y2="6"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="10" y1="18" x2="14" y2="18"></line></>,
    manage: <>
      <line x1="4" y1="6" x2="16" y2="6" strokeLinecap="round"></line>
      <line x1="4" y1="12" x2="15" y2="12" strokeLinecap="round"></line>
      <line x1="4" y1="18" x2="12" y2="18" strokeLinecap="round"></line>
      <polyline points="14,18 16.5,21 21,15.5" strokeLinecap="round" strokeLinejoin="round"></polyline>
    </>,
  };
  return <svg {...p} fill={filled && name === 'star' ? color : 'none'}>{paths[name] || null}</svg>;
}

// —— 灰色占位图（斜十字线框） ——
function PhImg({ w, h, label = '占位图', radius = 8, className = '' }) {
  const d = `M0 0 L${w} ${h} M${w} 0 L0 ${h}`;
  return (
    <div className={`ph-img ${className}`} style={{ width: w, height: h, borderRadius: radius }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <path d={d} stroke="#DEDEDE" strokeWidth="1" fill="none"></path>
      </svg>
      <span className="ph-cap">{label}</span>
    </div>
  );
}

// —— 星级（可交互） ——
function Stars({ value = 0, size = 14, onChange }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" disabled={!onChange}
          onClick={() => onChange && onChange(i)}
          style={{ display: 'flex', background: 'none', padding: 0, cursor: onChange ? 'pointer' : 'default' }}>
          <Icon name="star" size={size} color={i <= value ? '#111' : '#C9C9C9'} filled={i <= value} />
        </button>
      ))}
    </span>
  );
}

// —— 弹窗 ——
function Modal({ title, onClose, children, footer, center = false }) {
  return (
    <div className={`modal-mask ${center ? 'center' : ''}`} onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className="m-title">{title}</span>
          <button className="icon-btn" style={{ width: 28, height: 28, flex: '0 0 28px', borderRadius: 14 }} onClick={onClose}>
            <Icon name="close" size={14} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}

// —— Toast ——
const ToastContext = React.createContext(null);
function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const timer = useRef(null);
  const show = useCallback((text) => {
    setMsg(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2000);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      {msg ? <div className="toast-host"><div className="toast">{msg}</div></div> : null}
    </ToastContext.Provider>
  );
}
function useToast() { return useContext(ToastContext) || (() => {}); }

// —— 表单字段 ——
function Field({ label, hint, children }) {
  return (
    <div>
      <div className="field-label"><span>{label}</span>{hint ? <span className="muted">{hint}</span> : null}</div>
      {children}
    </div>
  );
}

// —— 顶部导航栏 ——
function AppHeader({ title, sub, onBack, right }) {
  return (
    <div className="app-header">
      {onBack ? (
        <button className="icon-btn" onClick={onBack}><Icon name="back" size={16} /></button>
      ) : (
        <span style={{ width: 12, display: 'inline-block', flex: '0 0 12px' }}></span>
      )}
      <div className="title" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {title ? <span>{title}</span> : null}
        {sub ? <span className="sub">{sub}</span> : null}
      </div>
      {right || <span style={{ width: 34, flex: '0 0 34px' }}></span>}
    </div>
  );
}

// —— 标签选择器（多选 chips） ——
function TagPicker({ all, value, onChange, hideCustom = false }) {
  const [custom, setCustom] = useState('');
  const toggle = (t) => {
    onChange(value.includes(t) ? value.filter(x => x !== t) : [...value, t]);
  };
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {all.map(t => (
          <button key={t} type="button" className={`chip ${value.includes(t) ? 'active' : ''}`} onClick={() => toggle(t)}>
            {value.includes(t) ? <Icon name="check" size={10} /> : <Icon name="tag" size={10} />}
            {t}
          </button>
        ))}
      </div>
      {!hideCustom ? (
        <div className="row-flex" style={{ marginTop: 8 }}>
          <input className="field-input" style={{ flex: 1 }} placeholder="输入新标签，回车添加"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && custom.trim()) { toggle(custom.trim()); setCustom(''); }
            }} />
          <button type="button" className="btn btn-sm" onClick={() => { if (custom.trim()) { toggle(custom.trim()); setCustom(''); } }}>
            <Icon name="plus" size={12} /> 添加
          </button>
        </div>
      ) : null}
    </div>
  );
}

Object.assign(window, {
  Icon, PhImg, Stars, Modal, ToastProvider, ToastContext, useToast,
  Field, AppHeader, TagPicker,
});
