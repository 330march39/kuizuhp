// sw.js (このコードで完全に置き換えてください)

let timerTimeout = null; // 予約された通知タイマーを管理する変数

/**
 * サービスワーカーがインストールされたときに呼ばれます。
 * 新しいバージョンが来たら、すぐに有効化（activate）するようにします。
 */
self.addEventListener('install', event => {
  console.log('SW: インストール');
  self.skipWaiting();
});

/**
 * サービスワーカーが有効化されたときに呼ばれます。
 * 即座にこのサービスワーカーがページを制御できるようにします。
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

  if (command === 'startTimer') {
    // (これは「未来の」通知を予約するコマンド)
    const { timeLeft, title, body } = event.data;
    
    // 既存のタイマー（通知予約）があればキャンセル
    if (timerTimeout) {
      clearTimeout(timerTimeout);
    }
    
    if (!timeLeft || timeLeft <= 0) {
      console.log('SW: startTimer の時間が指定されていません。');
      return; 
    }

    console.log(`SW: タイマーを ${timeLeft} 秒後にセット (Title: ${title})`);

    // 指定された時間後に通知を実行
    timerTimeout = setTimeout(() => {
      console.log('SW: タイマーが終了。通知を表示します。');
      // ★ 渡された title と body を使う。なければデフォルト
      self.registration.showNotification(title || '時間です！', {
        body: body || '設定した時間になりました。',
        tag: 'timer-complete', // タグで通知を上書き
        icon: 'https://placehold.co/180x180/4f46e5/ffffff?text=Q'
      });
      timerTimeout = null;
    }, timeLeft * 1000); // ミリ秒に変換
  } 

  else if (command === 'stopTimer') {
    // (これは「未来の」通知をキャンセルするコマンド)
    console.log("SW: 'stopTimer' を受信");
    if (timerTimeout) {
      clearTimeout(timerTimeout);
      timerTimeout = null;
      console.log("SW: 予約されていたタイマーをキャンセルしました。");
    }
  } 

  else if (command === 'showQuestNotification') {
    // (これは「今すぐ」通知を出すコマンド)
    console.log("SW: 'showQuestNotification' を受信 (即時)");
    const { title, body } = event.data;
    const tag = 'quest-status-immediate'; // 即時通知用のタグ
    
    event.waitUntil(
      self.registration.getNotifications({ tag: tag })
        .then(notifications => {
          // 古い即時通知を閉じる
          notifications.forEach(notification => notification.close());
        })
        .then(() => {
          // 新しい即時通知を表示
          return self.registration.showNotification(title, { 
            body: body,
            tag: tag,
            icon: 'https://placehold.co/180x180/4f46e5/ffffff?text=Q'
          });
        })
    );
  }
});
