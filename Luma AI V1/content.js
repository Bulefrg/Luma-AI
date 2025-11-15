(function() {
  // Стили
  const styleId = 'ai-helper-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .ai-helper-window {
        position: fixed;
        top: 100px;
        right: 50px;
        width: 360px;
        max-height: 400px;
        display: flex;
        flex-direction: column;
        border-radius: 14px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        background: linear-gradient(135deg,#0f1115 0%, #1a1f27 100%);
        color: #e6eef8;
        font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
        z-index: 2147483647;
        user-select: none;
        transition: transform 0.2s ease, opacity 0.2s ease;
        backdrop-filter: blur(8px);
      }
      .ai-helper-header {
        display:flex;
        align-items:center;
        justify-content: space-between;
        padding: 10px 12px;
        cursor: grab;
        background: rgba(255,255,255,0.02);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        transition: background 0.2s;
      }
      .ai-helper-header:hover { background: rgba(255,255,255,0.05); }
      .ai-helper-title {
        display:flex;
        align-items:center;
        gap:8px;
        font-weight:600;
        font-size:14px;
        color:#fff;
        text-shadow: 0 0 4px rgba(255,255,255,0.2);
      }
      .ai-helper-controls {
        display:flex;
        gap:6px;
        align-items:center;
      }
      .ai-btn {
        width:28px;
        height:28px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        cursor:pointer;
        border-radius:8px;
        background: rgba(255,255,255,0.05);
        transition: transform 0.2s, background 0.2s;
      }
      .ai-btn:hover { transform: scale(1.15); background: rgba(255,255,255,0.1); }
      .ai-btn:active { transform: scale(1.05); }
      .ai-content {
        padding: 10px;
        overflow-y: auto;
        gap:8px;
        display:flex;
        flex-direction:column;
        animation: fadeIn 0.3s ease;
      }
      .ai-bubble {
        max-width: 100%;
        padding:12px 16px;
        border-radius: 14px;
        line-height:1.4;
        font-size: 14px;
        opacity: 0;
        transform: translateY(10px);
        animation: fadeInUp 0.3s forwards;
      }
      .ai-bubble.ai {
        align-self: flex-start;
        background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02));
        color: #fff;
        border-radius: 14px 14px 14px 6px;
        box-shadow: 0 0 12px rgba(0,255,255,0.2);
      }
      .ai-bubble.user {
        align-self: flex-end;
        background: linear-gradient(180deg, rgba(99,102,241,0.25), rgba(99,102,241,0.15));
        color: #fff;
        border-radius: 14px 14px 6px 14px;
        box-shadow: 0 0 12px rgba(99,102,241,0.3);
      }
      @keyframes fadeInUp { to { opacity:1; transform:translateY(0); } }
      @keyframes fadeIn { from {opacity:0} to {opacity:1} }
      .ai-spinner {
        width:36px;
        height:36px;
        border-radius:50%;
        border:4px solid rgba(255,255,255,0.08);
        border-top-color: rgba(0,255,255,0.6);
        animation: spin 1s linear infinite;
        margin:12px auto;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .ai-footer {
        display:flex;
        gap:8px;
        align-items:center;
        padding:8px 12px;
        border-top: 1px solid rgba(255,255,255,0.02);
        background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00));
        font-size:12px;
        color: rgba(255,255,255,0.6);
      }
      .ai-copy-icon svg { width:18px; height:18px; fill:#fff; transition: fill 0.3s, transform 0.2s; }
      .ai-copy-icon.copied svg { fill: lime; transform: scale(1.2); }
      .ai-copy-icon.error svg { fill: red; transform: scale(1.2); }
      .ai-expand-hide { display:none; }
    `;
    document.head.appendChild(style);
  }

  function createWindow() {
    if (document.getElementById('aiHelperWindow')) return document.getElementById('aiHelperWindow');

    const win = document.createElement('div');
    win.id = 'aiHelperWindow';
    win.className = 'ai-helper-window';
    win.innerHTML = `
      <div class="ai-helper-header" id="aiHeader">
        <div class="ai-helper-title"><strong>AI</strong><span class="ai-small-meta">— ответ на выделение</span></div>
        <div class="ai-helper-controls">
          <div class="ai-btn" id="aiMinBtn" title="Свернуть/Развернуть">—</div>
          <div class="ai-btn" id="aiCopyBtn" title="Копировать">
          <span class="ai-copy-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 0.9-2 2v14c0 1.1 0.9 2 2 2h11c1.1 0 2-0.9 2-2V7c0-1.1-0.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          </span>


          </div>
          <div class="ai-btn" id="aiCloseBtn" title="Закрыть">✕</div>
        </div>
      </div>
      <div class="ai-content" id="aiContent">
        <div class="ai-spinner" id="aiSpinner"></div>
      </div>
      <div class="ai-footer" id="aiFooter">
        <div class="ai-small-meta" id="aiFooterText">Клик на крестик — закрыть. Перетащи окно, чтобы переместить.</div>
      </div>
    `;
    document.body.appendChild(win);

    chrome.storage.local.get(['aiHelperPos'], (res) => {
      if (res.aiHelperPos && typeof res.aiHelperPos === 'object') {
        const p = res.aiHelperPos;
        if (p.left !== undefined && p.top !== undefined) {
          win.style.left = p.left + 'px';
          win.style.top = p.top + 'px';
          win.style.right = 'auto';
        }
      }
    });

    const closeBtn = win.querySelector('#aiCloseBtn');
    const minBtn = win.querySelector('#aiMinBtn');
    const copyBtn = win.querySelector('#aiCopyBtn');
    const content = win.querySelector('#aiContent');

    closeBtn.addEventListener('click', () => win.remove());

    let minimized = false;
    minBtn.addEventListener('click', () => {
      minimized = !minimized;
      if (minimized) {
        content.classList.add('ai-expand-hide');
        win.style.height = '48px';
        minBtn.textContent = '+';
      } else {
        content.classList.remove('ai-expand-hide');
        win.style.height = '';
        minBtn.textContent = '—';
      }
    });

    copyBtn.addEventListener('click', () => {
      const bubbles = content.querySelectorAll('.ai-bubble.ai');
      let text = '';
      bubbles.forEach(b => { text += b.innerText + '\n\n'; });
      if (!text) text = content.innerText || '';
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.querySelector('.ai-copy-icon').classList.add('copied');
          setTimeout(() => copyBtn.querySelector('.ai-copy-icon').classList.remove('copied'), 900);
        }).catch(() => {
          copyBtn.querySelector('.ai-copy-icon').classList.add('error');
          setTimeout(() => copyBtn.querySelector('.ai-copy-icon').classList.remove('error'), 900);
        });
      }
    });

    enableDrag(win, win.querySelector('#aiHeader'));
    return win;
  }

  function enableDrag(win, handle) {
    let dragging = false, offsetX = 0, offsetY = 0;
    handle.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      dragging = true;
      offsetX = e.clientX - win.getBoundingClientRect().left;
      offsetY = e.clientY - win.getBoundingClientRect().top;
      handle.style.cursor = 'grabbing';
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      win.style.left = (e.clientX - offsetX) + 'px';
      win.style.top = (e.clientY - offsetY) + 'px';
      win.style.right = 'auto';
    });
    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      handle.style.cursor = 'grab';
      const rect = win.getBoundingClientRect();
      chrome.storage.local.set({ aiHelperPos: { left: Math.round(rect.left), top: Math.round(rect.top) } });
    });
  }

  function appendAIBubble(win, text) {
    const content = win.querySelector('#aiContent');
    const sp = content.querySelector('#aiSpinner');
    if (sp) sp.remove();
    const bubble = document.createElement('div');
    bubble.className = 'ai-bubble ai';
    bubble.innerText = text;
    content.appendChild(bubble);
    content.scrollTop = content.scrollHeight;
  }

  function showAIResponse(selectedText) {
    const win = createWindow();
    const content = win.querySelector('#aiContent');
    content.innerHTML = '<div class="ai-spinner" id="aiSpinner"></div>';
    if (win.querySelector('#aiFooterText')) win.querySelector('#aiFooterText').innerText = 'Запрос отправлен...';

    chrome.runtime.sendMessage({ type: 'askAI', message: selectedText }, res => {
      if (!res) return appendAIBubble(win, 'Ошибка: нет ответа от background.');
      if (res.ok) {
        appendAIBubble(win, res.response);
        if (win.querySelector('#aiFooterText')) win.querySelector('#aiFooterText').innerText = 'Готово — копировать или закрыть окно.';
      } else {
        appendAIBubble(win, res.response || 'Ошибка при запросе.');
        if (win.querySelector('#aiFooterText')) win.querySelector('#aiFooterText').innerText = 'Ошибка при запросе.';
      }
    });
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'selection' && msg.text) showAIResponse(msg.text);
  });

  window.showAIResponse = showAIResponse;
})();
