// ============ 登录页 ============
const { useState, useEffect, useRef, useCallback, useContext, useMemo } = React;
function LoginPage({ onEnter }) {
  const { state, actions } = useContext(StoreContext);
  const toast = useToast();
  const [showAgree, setShowAgree] = useState(true);   // 进入即弹出协议弹窗
  const [agreeView, setAgreeView] = useState(null);    // 'privacy' | 'user'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const phoneValid = /^1\d{10}$/.test(phone);
  const codeValid = /^\d{4,6}$/.test(code);

  const sendCode = () => {
    if (!phoneValid) { toast('请输入 11 位手机号'); return; }
    setCodeSent(true);
    setCountdown(60);
    toast(`验证码已发送至 ${phone.slice(0, 3)}****${phone.slice(-4)}`);
  };

  const doLogin = (user, label) => {
    const hadGuestData = state.user && state.user.type === 'guest';
    actions.login(user);
    onEnter && onEnter();
    if (hadGuestData) {
      const count = state.playlists.reduce((n, p) => n + p.songs.length, 0);
      setTimeout(() => toast(`已同步本地 ${state.playlists.length} 个歌单 / ${count} 首歌曲`), 350);
    } else {
      setTimeout(() => toast(`${label}成功，欢迎回来`), 350);
    }
  };

  const loginByPhone = () => {
    if (!phoneValid) { toast('请输入 11 位手机号'); return; }
    if (!codeValid) { toast('请输入验证码'); return; }
    doLogin({ type: 'phone', name: `用户 ${phone.slice(-4)}`, phone }, '登录');
  };

  return (
    <div className="screen">
      <div className="scroll-area">
        <div className="login-hero">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="disc" size={34} />
            <div className="h1">WhatSong</div>
          </div>
          <div className="slogan">个人歌单记录册 · KTV 曲目管理</div>
          <div className="mono" style={{ fontSize: 10, color: '#B9B9B9', marginTop: 2 }}>
            WIREFLOW PROTOTYPE / V1.0 / 390×844
          </div>
        </div>

        <div className="login-form">
          <Field label="手机号">
            <input className="field-input" inputMode="numeric" maxLength={11}
              placeholder="请输入 11 位手机号" value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} />
          </Field>
          <Field label="验证码" hint={countdown > 0 ? `${countdown}s 后可重发` : null}>
            <div className="row-flex">
              <input className="field-input" style={{ flex: 1 }} inputMode="numeric" maxLength={6}
                placeholder="短信验证码" value={code} disabled={!codeSent}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))} />
              <button className="btn" style={{ flex: '0 0 96px' }} disabled={countdown > 0} onClick={sendCode}>
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            </div>
          </Field>
          <button className="btn btn-primary btn-block" onClick={loginByPhone}>登录 / 注册</button>

          <div className="divider" style={{ margin: '6px 0' }}></div>
          <div className="login-third">
            <button className="third-btn" onClick={() => doLogin({ type: 'wechat', name: '微信用户_8371' }, '微信登录')}>
              <Icon name="wechat" size={22} /> 微信登录
            </button>
            <button className="third-btn" onClick={() => doLogin({ type: 'qq', name: 'QQ用户_2366' }, 'QQ 登录')}>
              <Icon name="qq" size={22} /> QQ 登录
            </button>
          </div>

          <div className="divider" style={{ margin: '6px 0' }}></div>
          <div className="card pad" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="small-note" style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <Icon name="note" size={13} style={{ marginTop: 2 }} />
              <span>游客可临时保存歌单与演唱记录（仅存本机）。登录账号后，本地数据将自动同步至云端。</span>
            </div>
            <button className="btn btn-block" onClick={() => doLogin({ type: 'guest', name: '游客' }, '游客模式进入')}>
              <Icon name="play" size={13} /> 先逛逛（游客模式）
            </button>
          </div>

          <div className="muted" style={{ textAlign: 'center', marginTop: 4 }}>
            登录即代表同意
            <button style={{ textDecoration: 'underline', fontSize: 11, color: 'var(--ink-2)' }}
              onClick={() => setAgreeView('user')}>《用户协议》</button>与
            <button style={{ textDecoration: 'underline', fontSize: 11, color: 'var(--ink-2)' }}
              onClick={() => setAgreeView('privacy')}>《隐私政策》</button>
          </div>
        </div>
      </div>

      {agreeView ? <AgreementModal which={agreeView} onClose={() => setAgreeView(null)} /> : null}

      {showAgree ? (
        <div className="modal-mask center">
          <div className="modal">
            <div className="modal-head">
              <span className="m-title">欢迎使用 WhatSong</span>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <PhImg w={56} h={56} label="LOGO" />
                <div className="small-note" style={{ lineHeight: 1.7 }}>
                  在使用前，请阅读并同意
                  <button style={{ textDecoration: 'underline', color: 'var(--ink)', fontSize: 11 }}
                    onClick={() => setAgreeView('user')}>《用户协议》</button>与
                  <button style={{ textDecoration: 'underline', color: 'var(--ink)', fontSize: 11 }}
                    onClick={() => setAgreeView('privacy')}>《隐私政策》</button>。
                  我们将按最小必要原则收集你的歌单与演唱记录，用于跨设备同步。
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn" style={{ flex: 1 }} onClick={() => { setShowAgree(false); toast('需同意协议后才能使用核心功能'); }}>不同意</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setShowAgree(false)}>同意并继续</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AgreementModal({ which, onClose }) {
  const isPrivacy = which === 'privacy';
  return (
    <Modal title={isPrivacy ? '隐私政策' : '用户协议'} onClose={onClose}
      footer={<button className="btn btn-primary btn-block" onClick={onClose}>我已阅读</button>}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ph)', marginBottom: 8 }}>
        {isPrivacy ? 'PRIVACY POLICY · V2.3' : 'TERMS OF SERVICE · V2.3'}
      </div>
      <div className="small-note" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p><strong>一、信息收集</strong><br />为提供歌单管理与演唱记录功能，我们会收集你主动录入的歌曲信息、标签与演唱反馈；游客模式下以上数据仅保存在本机。</p>
        <p><strong>二、数据使用</strong><br />数据用于生成你的个人歌单、演唱统计与打印小票，不会用于个性化广告推荐。</p>
        <p><strong>三、数据存储与同步</strong><br />登录后数据加密存储并可在多设备间同步；你可以随时导出或删除全部数据。</p>
        <p><strong>四、其他</strong><br />本页为高保真线框原型，以上条款均为占位示意文本，不构成任何真实法律承诺。</p>
      </div>
    </Modal>
  );
}

Object.assign(window, { LoginPage, AgreementModal });
