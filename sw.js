// sw.js (完成版)

// 集中タイマーの終了通知を管理するための変数
let focusTimerTimeout = null;

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
  if (!event.data) return; // データがなければ何もしない

  const command = event.data.command;

  // --- 1. クエスト通知の処理 (これは即時表示) ---
  if (command === 'showQuestNotification') {
    console.log("SW: 'showQuestNotification' を受信");
    const { title, body } = event.data;
    const tag = 'quest-status'; // クエスト通知用のタグ

    // event.waitUntil() で、この処理が終わるまでSWの生存を保証
    event.waitUntil(
      self.registration.getNotifications({ tag: tag })
        .then(notifications => {
          notifications.forEach(notification => notification.close()); // 古い通知を閉じる
        })
        .then(() => {
          // 新しい通知を表示
          return self.registration.showNotification(title, { 
            body: body,
            tag: tag, // 連続する通知を上書きするためのタグ
            icon: 'https://placehold.co/180x180/4f46e5/ffffff?text=Q'
          });
        })
    );
  }

  // --- 2. 集中タイマーの開始処理 (これは遅延通知) ---
  else if (command === 'startTimer') {
    console.log("SW: 'startTimer' を受信");
    const timeLeftInSeconds = event.data.timeLeft;
    
    // 既存のタイマーがあればキャンセル
    if (focusTimerTimeout) {
      clearTimeout(focusTimerTimeout);
    }
    
    console.log(`SW: 集中タイマーを ${timeLeftInSeconds} 秒後にセットしました。`);

    // ★★★
    //  setInterval ではなく setTimeout を使います 
    //  (これならSWがスリープしても、時間になればブラウザが起こしてくれます)
    // ★★★
    focusTimerTimeout = setTimeout(() => {
      console.log('SW: 集中タイマーが終了。通知を表示します。');
      self.registration.showNotification('集中モード 完了！', {
        body: 'お疲れ様でした！タイマーが終了しました。',
        tag: 'focus-complete', // 完了通知用のタグ
        icon: 'https://placehold.co/180x180/4f46e5/ffffff?text=Q'
      });
      focusTimerTimeout = null; // タイマーをクリア
    }, timeLeftInSeconds * 1000); // ミリ秒に変換
  }

  // --- 3. 集中タイマーの停止処理 ---
  else if (command === 'stopTimer') {
    console.log("SW: 'stopTimer' を受信");
    // ユーザーが手動でタイマーを停止した場合
    if (focusTimerTimeout) {
      clearTimeout(focusTimerTimeout); // 予約されていた通知をキャンセル
      focusTimerTimeout = null;
      console.log("SW: 予約されていた集中タイマーをキャンセルしました。");
    }
  }
});

// `showNotification` 関数は `setTimeout` のコールバック内で直接実行されるため、
// あなたのコードにあったグローバルな showNotification() 関数は削除しても大丈夫です。
