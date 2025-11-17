// sw.js (このコードで完全に置き換えてください)

let focusTimerTimeout = null; // 集中モード専用のタイマー
let questTimerTimeout = null; // クエスト専用のタイマー

/**
 * サービスワーカーがインストールされたときに呼ばれます。
 */
self.addEventListener('install', event => {
  console.log('SW: インストール');
  self.skipWaiting();
});

/**
 * サービスワーカーが有効化されたときに呼ばれます。
 */
self.addEventListener('activate', event => {
  console.log('SW: 有効化');
  event.waitUntil(self.clients.claim());
});

/**
 * メインのHTML/JSから 'postMessage' でメッセージを受け取ったときの処理
 */
self.addEventListener('message', event => {
  if (!event.data) return;
  const { command } = event.data;

  // --- 1. 集中モードのタイマー開始 ---
  if (command === 'focusTimer_start') {
    const { timeLeft, title, body } = event.data;
    console.log(`SW: 集中タイマーを ${timeLeft} 秒後にセット`);

    // 既存の「集中タイマー」だけをキャンセル
    if (focusTimerTimeout) clearTimeout(focusTimerTimeout);
    
    focusTimerTimeout = setTimeout(() => {
      console.log('SW: 集中タイマーが終了。通知を表示します。');
      self.registration.showNotification(title, {
        body: body,
        tag: 'focus-complete',
        icon: 'https://placehold.co/180x180/4f46e5/ffffff?text=Q'
      });
      focusTimerTimeout = null;
    }, timeLeft * 1000);
  } 

  // --- 2. 集中モードのタイマー停止 ---
  else if (command === 'focusTimer_stop') {
    console.log("SW: 集中タイマーをキャンセル");
    if (focusTimerTimeout) {
      clearTimeout(focusTimerTimeout);
      focusTimerTimeout = null;
    }
  } 

  // --- 3. クエストのタイマー開始 ---
  else if (command === 'questTimer_start') {
    const { timeLeft, title, body } = event.data;
    console.log(`SW: クエストタイマーを ${timeLeft} 秒後にセット`);

    // 既存の「クエストタイマー」だけをキャンセル
    if (questTimerTimeout) clearTimeout(questTimerTimeout);

    questTimerTimeout = setTimeout(() => {
      console.log('SW: クエストタイマーが終了。通知を表示します。');
      self.registration.showNotification(title, {
        body: body,
        tag: 'quest-step-complete', // クエスト用のタグ
        icon: 'https://placehold.co/180x180/4f46e5/ffffff?text=Q'
      });
      questTimerTimeout = null;
    }, timeLeft * 1000);
  }

  // --- 4. クエストのタイマー停止 ---
  else if (command === 'questTimer_stop') {
    console.log("SW: クエストタイマーをキャンセル");
    if (questTimerTimeout) {
      clearTimeout(questTimerTimeout);
      questTimerTimeout = null;
    }
  }

  // --- 5. クエストの「即時」通知 (変更なし) ---
  else if (command === 'showQuestNotification') {
    console.log("SW: 'showQuestNotification' を受信 (即時)");
    const { title, body } = event.data;
    const tag = 'quest-status-immediate'; 
    
    event.waitUntil(
      self.registration.getNotifications({ tag: tag })
        .then(notifications => {
          notifications.forEach(notification => notification.close());
        })
        .then(() => {
          return self.registration.showNotification(title, { 
            body: body,
            tag: tag,
            icon: 'https://placehold.co/180x180/4f46e5/ffffff?text=Q'
          });
        })
    );
  }
});
