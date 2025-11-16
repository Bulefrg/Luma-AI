// background.js

// Создаём пункт контекстного меню при установке
chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.contextMenus.create({
      id: "aiGenerate",
      title: "Спросить ИИ",
      contexts: ["selection"]
    });
  } catch (err) {
    console.error('contextMenus.create error:', err);
  }
});

// Клик по контекстному меню — отправляем текст в content script
chrome.contextMenus.onClicked.addListener((info, tab) => {
  try {
    // safety: убедимся, что у нас есть текст и id вкладки
    const text = (info && info.selectionText) ? String(info.selectionText).trim() : '';
    const tabId = tab && tab.id;

    if (!text) {
      console.warn('Context menu clicked but no selection text available.');
      return;
    }
    if (typeof tabId === 'undefined' || tabId === null) {
      console.warn('Context menu clicked but tab id is missing.');
      return;
    }

    // отправляем сообщение, но безопасно: проверяем chrome.runtime.lastError в callback
    chrome.tabs.sendMessage(tabId, { type: "selection", text }, (response) => {
      if (chrome.runtime.lastError) {
        // Нет content script в этой вкладке — логируем и можно при желании открыть панель расширения
        console.warn('sendMessage failed — content script not injected in tab:', chrome.runtime.lastError.message);
        // опционально: показать уведомление или открыть страницу расширения
        // chrome.notifications.create({...});
      } else {
        // при нормальном ответе (если нужен) можно обработать response
        // console.log('Content script responded:', response);
      }
    });

  } catch (err) {
    console.error('onClicked handler error:', err);
  }
});

// Обрабатываем запросы на общение с API
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Обрабатываем только тип askAI
  if (request && request.type === "askAI") {
    // URL вашего сервера Flask — убедитесь, что он корректен и доступен
    const API_URL = "https://4416fe51-f272-4ee6-96d1-7a26dbd66458-00-3h2l5s1mzmryx.janeway.replit.dev/api/chat";

    // валидация входных сообщений
    const messages = Array.isArray(request.messages) ? request.messages : [];

    // Используем async/await внутри IIFE для удобной обработки ошибок
    (async () => {
      try {
        const resp = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages })
        });

        // Если статус не 2xx — попробуем прочитать текст ошибки
        if (!resp.ok) {
          let text;
          try { text = await resp.text(); } catch (e) { text = resp.statusText; }
          sendResponse({ ok: false, response: `Сервер вернул ошибку ${resp.status}: ${text}` });
          return;
        }

        // Попытка распарсить JSON — с защитой на случай, если приходит не JSON
        let data;
        try {
          data = await resp.json();
        } catch (e) {
          const txt = await resp.text();
          sendResponse({ ok: false, response: "Не удалось распарсить ответ сервера: " + txt });
          return;
        }

        // Отправляем обратно в content script
        sendResponse({
          ok: true,
          response: data.response || data.error || "Пустой ответ от сервера"
        });

      } catch (err) {
        // сетевые ошибки, CORS и т.п.
        sendResponse({ ok: false, response: "Ошибка при запросе к API: " + err.toString() });
      }
    })();

    // Сообщаем Chrome, что ответ будет асинхронным
    return true;
  }

  // Можно обработать другие типы сообщений здесь...
});
