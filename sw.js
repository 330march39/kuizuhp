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

    if (focusTimerTimeout) clearTimeout(focusTimerTimeout);
    
    // ★★★ 修正点 (1/2) ★★★
    // event.waitUntil と new Promise で、タイマーが完了するまでSWがスリープしないようにする
    event.waitUntil(
      new Promise(resolve => {
        focusTimerTimeout = setTimeout(() => {
          console.log('SW: 集中タイマーが終了。通知を表示します。');
          self.registration.showNotification(title, {
            body: body,
            tag: 'focus-complete',
            icon: 'https://placehold.co/180x180/4f46e5/ffffff?text=Q',
            renotify: true // (オプション) 通知が来たら音/バイブを鳴らす
          }).then(() => {
            focusTimerTimeout = null;
            resolve(); // 通知が完了したらPromiseを解決
          });
        }, timeLeft * 1000);
      })
    );
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

    if (questTimerTimeout) clearTimeout(questTimerTimeout);

    // ★★★ 修正点 (2/2) ★★★
    // こちらも同様に event.waitUntil と new Promise でラップする
    event.waitUntil(
      new Promise(resolve => {
        questTimerTimeout = setTimeout(() => {
          console.log('SW: クエストタイマーが終了。通知を表示します。');
          self.registration.showNotification(title, {
            body: body,
            tag: 'quest-step-complete',
            icon: 'https://placehold.co/180x180/4f46e5/ffffff?text=Q',
            renotify: true // (オプション) 通知が来たら音/バイブを鳴らす
          }).then(() => {
            questTimerTimeout = null;
            resolve(); // 通知が完了したらPromiseを解決
          });
        }, timeLeft * 1000);
      })
    );
  }

  // --- 4. クエストのタイマー停止 ---
  else if (command === 'questTimer_stop') {
    console.log("SW: クエストタイマーをキャンセル");
    if (questTimerTimeout) {
      clearTimeout(questTimerTimeout);
      questTimerTimeout = null;
    }
  }

  // --- 5. クエストの「即時」通知 (ここは変更なし、元々正しく waitUntil されていた) ---
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
