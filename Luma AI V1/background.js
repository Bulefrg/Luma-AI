// Создаём пункт контекстного меню при установке
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "aiGenerate",
        title: "Спросить ИИ",
        contexts: ["selection"]
    });
});

// При клике — отправляем сообщение в content script на нужной вкладке,
// чтобы он показал окно и начал процесс.
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "aiGenerate" && info.selectionText) {
        chrome.tabs.sendMessage(tab.id, { type: "selection", text: info.selectionText });
    }
});

// Обрабатываем запросы на общение с API (делаем fetch из background — чтобы не было CORS)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "askAI") {
        // TODO: при необходимости замените URL на ваш сервер
        const API_URL = "https://4416fe51-f272-4ee6-96d1-7a26dbd66458-00-3h2l5s1mzmryx.janeway.replit.dev/api/chat";

        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: request.message })
        })
        .then(res => res.json())
        .then(data => {
            // отправляем обратно в content script
            sendResponse({ ok: true, response: data.response || data.error || "Пустой ответ от сервера" });
        })
        .catch(err => {
            sendResponse({ ok: false, response: "Ошибка: " + err.toString() });
        });

        // говорим chrome, что ответ асинхронный
        return true;
    }
});
