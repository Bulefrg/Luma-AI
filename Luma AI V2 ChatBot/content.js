(function() {
  const styleId = 'ai-helper-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      :root{
        --bg: #f9f9f9;
        --panel-bg: #ffffff;
        --text: #111;
        --muted: #555;
        --accent: #6366f1;
        --bubble-ai: #fff;
        --bubble-user: #6366f1;
        --bubble-user-text: #fff;
        --control-bg: #eee;
        --border: #e0e0e0;
        --shadow: 0 20px 40px rgba(0,0,0,0.12);
      }
      [data-theme='dark']{
        --bg: #0f1724;
        --panel-bg: #0b1220;
        --text: #e6eef8;
        --muted: #98a0b3;
        --accent: #7c9aff;
        --bubble-ai: #0b1220;
        --bubble-user: #4f46e5;
        --bubble-user-text: #fff;
        --control-bg: #0f1724;
        --border: rgba(255,255,255,0.06);
        --shadow: 0 20px 40px rgba(2,6,23,0.6);
      }

      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');

      .ai-helper-window {
        position: fixed;
        top: 80px;
        right: 40px;
        width: 460px;
        max-height: 600px;
        display: flex;
        flex-direction: column;
        border-radius: 16px;
        box-shadow: var(--shadow);
        background: var(--bg);
        color: var(--text);
        font-family: 'JetBrains Mono', monospace;
        z-index: 2147483647;
        user-select: none;
        overflow: hidden;
        transition: transform 0.28s ease, opacity 0.28s ease, background 0.28s;
        border: 1px solid var(--border);
      }

      .ai-helper-header {
        display:flex;
        align-items:center;
        justify-content: space-between;
        padding: 10px 12px;
        cursor: grab;
        border-bottom: 1px solid var(--border);
        background: var(--panel-bg);
        gap:8px;
      }
      .ai-helper-title {
        font-weight:700;
        font-size:15px;
        color: var(--text);
        display:flex;
        align-items:center;
        gap:8px;
      }
      .ai-helper-controls {
        display:flex;
        gap:8px;
        align-items:center;
      }
      .ai-btn {
        width:36px;
        height:36px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        cursor:pointer;
        border-radius:10px;
        background: var(--control-bg);
        box-shadow: 0 0 8px rgba(0,0,0,0.03);
        transition: all 0.18s ease;
        border: 1px solid var(--border);
      }
      .ai-btn:hover {
        transform: translateY(-2px) scale(1.03);
      }
      .ai-btn:active { transform: scale(0.99); }

      .ai-content {
        padding: 12px;
        overflow-y: auto;
        gap:10px;
        display:flex;
        flex-direction:column;
        flex: 1 1 auto;
        scroll-behavior: smooth;
        background: transparent;
      }

      /* FAST BUTTONS - sticky above footer so they don't disappear */
      .ai-fast-buttons {
        display:flex;
        gap:8px;
        padding:8px 12px;
        overflow-x:auto;
        background: var(--panel-bg);
        border-top: 1px solid var(--border);
        flex-shrink: 0;
        position: sticky;
        bottom: 64px; /* sits above the footer */
        z-index: 3;
        scrollbar-width: thin;
      }
      .ai-fast-btn {
        padding:6px 12px;
        border-radius:14px;
        background: var(--control-bg);
        color:var(--text);
        font-size:13px;
        cursor:pointer;
        white-space: nowrap;
        transition: all 0.14s;
        box-shadow: 0 0 6px rgba(0,0,0,0.04);
        border: 1px solid var(--border);
      }
      .ai-fast-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(0,0,0,0.08);
      }

      .ai-bubble {
        max-width: 85%;
        padding:14px 18px;
        border-radius: 14px;
        line-height:1.5;
        font-size: 14px;
        word-break: break-word;
        position: relative;
        opacity:0;
        transform: translateY(8px);
        animation: bubbleAppear 0.22s forwards;
        box-sizing: border-box;
        padding-right: 46px; /* reserve space for copy button */
      }
      @keyframes bubbleAppear {
        to { opacity:1; transform: translateY(0); }
      }

      .ai-bubble.ai {
        align-self: flex-start;
        background: var(--bubble-ai);
        color: var(--text);
        box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        border: 1px solid var(--border);
      }
      .ai-bubble.user {
        align-self: flex-end;
        background: var(--bubble-user);
        color: var(--bubble-user-text);
        box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        border: 1px solid rgba(0,0,0,0.06);
      }

      /* copy button placed absolutely, small and accessible */
      .ai-bubble .copy-btn {
        position: absolute;
        bottom: 6px;
        right: 8px;
        width:28px;
        height:28px;
        display:flex;
        align-items:center;
        justify-content:center;
        cursor:pointer;
        opacity: 0.9;
        transition: transform 0.12s ease, opacity 0.12s;
        border-radius:6px;
        background: var(--control-bg);
        border: 1px solid var(--border);
      }
      .ai-bubble:hover .copy-btn { transform: scale(1.03); opacity:1; }
      .ai-bubble .copy-btn svg { width:14px; height:14px; fill: currentColor; color: var(--text); }

      .ai-footer {
        display:flex;
        gap:8px;
        align-items:center;
        padding:8px 10px;
        border-top: 1px solid var(--border);
        background: var(--panel-bg);
        font-size:13px;
        color: var(--muted);
        flex-shrink: 0;
      }
      .ai-footer input {
        flex:1;
        border:none;
        outline:none;
        background: rgba(255,255,255,0.02);
        border-radius: 12px;
        padding:8px 12px;
        color:var(--text);
        font-family: 'JetBrains Mono', monospace;
        transition: all 0.16s;
        border: 1px solid var(--border);
      }
      .ai-footer input::placeholder { color: var(--muted); }
      .ai-footer input:focus {
        box-shadow: 0 0 10px rgba(99,102,241,0.12);
      }
      .ai-footer button {
        cursor:pointer;
        padding:8px 12px;
        border:none;
        border-radius:10px;
        background:var(--accent);
        color:#fff;
        font-size:13px;
        box-shadow: 0 6px 20px rgba(99,102,241,0.14);
        transition: all 0.16s ease;
        border: none;
      }
      .ai-footer button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(99,102,241,0.18);
      }

      /* responsive tweaks */
      @media (max-width:520px) {
        .ai-helper-window { right: 12px; left: 12px; width: auto; top: 60px; }
        .ai-bubble { max-width: 100%; }
      }

      .ai-spinner {
        width:36px; height:36px;
        border-radius:50%;
        border:4px solid rgba(0,0,0,0.1);
        border-top-color: var(--accent);
        animation: spin 1s linear infinite;
        margin:12px auto;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
  }

  let currentHistory = [];

  function createWindow(initialMessage) {
    let win = document.getElementById('aiHelperWindow');
    if (!win) {
      win = document.createElement('div');
      win.id = 'aiHelperWindow';
      win.className = 'ai-helper-window';
      // set theme from storage
      const savedTheme = localStorage.getItem('aiHelperTheme') || 'light';
      if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme','dark');

      win.innerHTML = `
        <div class="ai-helper-header" role="banner">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="ai-helper-title" aria-hidden="true">AI Helper</div>
            <div style="font-size:12px;color:var(--muted)">— быстрые заметки</div>
          </div>
          <div class="ai-helper-controls" role="toolbar" aria-label="controls">
            <button class="ai-btn" id="themeToggle" title="Переключить тему" aria-pressed="false" aria-label="переключить тему"></button>
            <div class="ai-btn" id="aiMinBtn" title="Свернуть">—</div>
            <div class="ai-btn" id="aiCloseBtn" title="Закрыть">✕</div>
          </div>
        </div>
        <div class="ai-content" id="aiContent" role="log" aria-live="polite"></div>
        <div class="ai-fast-buttons" id="aiFastBtns" role="toolbar" aria-label="quick prompts"></div>
        <div class="ai-footer" role="form" aria-label="message input">
          <input type="text" id="aiInput" placeholder="Напишите сообщение..." aria-label="ввести сообщение"/>
          <button id="aiSendBtn" aria-label="отправить">→</button>
        </div>
      `;
      document.body.appendChild(win);

      const content = win.querySelector('#aiContent');
      const input = win.querySelector('#aiInput');
      const sendBtn = win.querySelector('#aiSendBtn');
      const fastBtnsContainer = win.querySelector('#aiFastBtns');

      document.getElementById('aiCloseBtn').onclick = () => win.remove();

      let minimized = false;
      document.getElementById('aiMinBtn').onclick = () => {
        minimized = !minimized;
        content.style.display = minimized ? 'none' : 'flex';
        document.querySelector('.ai-footer').style.display = minimized ? 'none' : 'flex';
        fastBtnsContainer.style.display = minimized ? 'none' : 'flex';
        document.getElementById('aiMinBtn').innerText = minimized ? '+' : '—';
      };

      // theme toggle setup
      const themeBtn = document.getElementById('themeToggle');
      function renderThemeIcon() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        themeBtn.innerHTML = isDark
          ? `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79z"/></svg>`
          : `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.8 1.8-1.8zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm8.83-18.37l-1.79 1.8 1.8 1.79 1.79-1.8-1.8-1.79zM17 13h3v-2h-3v2zM4.22 19.78l1.8-1.79-1.8-1.79-1.79 1.8 1.79 1.78zM12 7a5 5 0 100 10 5 5 0 000-10z"/></svg>`;
        themeBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      }
      function toggleTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('aiHelperTheme','light');
        } else {
          document.documentElement.setAttribute('data-theme','dark');
          localStorage.setItem('aiHelperTheme','dark');
        }
        renderThemeIcon();
      }
      themeBtn.onclick = toggleTheme;
      renderThemeIcon();

      enableDrag(win, win.querySelector('.ai-helper-header'));

      sendBtn.addEventListener('click', () => sendMessage(input.value));
      input.addEventListener('keydown', e => { if (e.key==='Enter') sendMessage(input.value); });

      // Быстрые подсказки (persistent and scrollable horizontally)
      const quickPrompts = [
        "Напиши краткий текст",
        "Сделай список идей",
        "Переведи на английский",
        "Сократи текст",
        "Объясни простыми словами",
        "Напиши что-то с мясом",
        "Сделай рецепт",
        "Поменяй тон"
      ];
      quickPrompts.forEach(text => {
        const btn = document.createElement('button');
        btn.className='ai-fast-btn';
        btn.type = 'button';
        btn.innerText=text;
        btn.onclick=()=> {
          input.value=text;
          input.focus();
        };
        fastBtnsContainer.appendChild(btn);
      });

      // accessibility: allow keyboard navigation to fast buttons
      fastBtnsContainer.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const focusables = Array.from(fastBtnsContainer.querySelectorAll('.ai-fast-btn'));
          const idx = focusables.indexOf(document.activeElement);
          const next = e.key==='ArrowRight' ? idx+1 : idx-1;
          if (focusables[next]) focusables[next].focus();
        }
      });
    }

    if(initialMessage) sendMessage(initialMessage);
    return win;
  }

  function enableDrag(win, handle) {
    let dragging=false, offsetX=0, offsetY=0;
    handle.addEventListener('mousedown', e=>{
      if(e.button!==0) return;
      dragging=true;
      offsetX = e.clientX - win.getBoundingClientRect().left;
      offsetY = e.clientY - win.getBoundingClientRect().top;
      handle.style.cursor='grabbing';
      e.preventDefault();
    });
    document.addEventListener('mousemove', e=>{
      if(!dragging) return;
      // constrain to viewport
      const left = Math.min(Math.max(e.clientX-offsetX, 8), window.innerWidth - win.offsetWidth - 8);
      const top = Math.min(Math.max(e.clientY-offsetY, 8), window.innerHeight - win.offsetHeight - 8);
      win.style.left = left+'px';
      win.style.top = top+'px';
      win.style.right='auto';
    });
    document.addEventListener('mouseup', ()=>{
      if(!dragging) return;
      dragging=false;
      handle.style.cursor='grab';
    });
  }

  function appendBubble(text,type='ai') {
    const content = document.getElementById('aiContent');
    const bubble = document.createElement('div');
    bubble.className = 'ai-bubble '+type;
    // preserve line breaks
    bubble.innerText = text;

    const copyBtn = document.createElement('button');
    copyBtn.className='copy-btn';
    copyBtn.type = 'button';
    copyBtn.title = 'Копировать';
    copyBtn.setAttribute('aria-label','копировать сообщение');
    copyBtn.innerHTML = `
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1z"></path>
        <path d="M20 5H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h12v14z"></path>
      </svg>
    `;
    copyBtn.onclick = async ()=> {
      try {
        await navigator.clipboard.writeText(text);
        // subtle feedback
        copyBtn.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:220});
      } catch (err) {
        console.error('copy failed',err);
      }
    };
    bubble.appendChild(copyBtn);

    content.appendChild(bubble);
    // keep scroll at bottom
    content.scrollTop = content.scrollHeight;
  }

  function sendMessage(msg) {
    if(!msg || !msg.trim()) return;
    appendBubble(msg,'user');
    currentHistory.push({role:'user', content: msg});
    const content = document.getElementById('aiContent');
    const spinner = document.createElement('div');
    spinner.className='ai-spinner';
    spinner.style.border = '4px solid rgba(0,0,0,0.08)';
    spinner.style.borderTopColor = 'var(--accent)';
    spinner.style.width = '36px';
    spinner.style.height = '36px';
    spinner.style.borderRadius = '50%';
    spinner.style.margin = '12px auto';
    content.appendChild(spinner);
    content.scrollTop = content.scrollHeight;

    // send message to background (same as original)
    try {
      chrome.runtime.sendMessage({type:'askAI', messages: currentHistory}, res=>{
        spinner.remove();
        if(res && res.ok) {
          appendBubble(res.response,'ai');
          currentHistory.push({role:'assistant', content: res.response});
        } else {
          appendBubble('Ошибка: '+(res?.response || 'нет ответа'),'ai');
        }
      });
    } catch (err) {
      // fallback when not in extension context
      setTimeout(()=>{
        spinner.remove();
        appendBubble('Локальный режим: ответ эмуляция','ai');
        currentHistory.push({role:'assistant', content: 'Локальный режим: ответ эмуляция'});
      }, 600);
    }

    document.getElementById('aiInput').value='';
  }

  function respondToSelection(selectedText) {
    currentHistory = [{role:'user', content:selectedText}];
    createWindow(selectedText);
  }

  // listen for selection messages (extension)
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(msg=>{
      if(msg && msg.type==='selection' && msg.text) respondToSelection(msg.text);
    });
  }

  // expose showAIResponse for manual calls
  window.showAIResponse = respondToSelection;

  // IMPORTANT: do NOT auto-create the window on load.
  // createWindow();  <-- removed so window appears only when user triggers it
})();
