// sw.js (修正版)

let notificationTimeout = null;

// メインのアプリからメッセージを受け取ったときの処理
self.addEventListener('message', (event) => {
    const { command, timeLeft } = event.data;

    if (command === 'startTimer') {
        // もし既存のタイマーがあればキャンセル
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
        }
        
        // 指定された時間後に showNotification を実行するタイマーをセット
        notificationTimeout = setTimeout(() => {
            showNotification();
        }, timeLeft * 1000); // ミリ秒に変換
    } 
    else if (command === 'stopTimer') {
        // 予約されていたタイマーをキャンセル
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
            notificationTimeout = null;
        }
    }
});

// 通知を表示する関数
const showNotification = () => {
    self.registration.showNotification('集中モード完了！', {
        body: 'お疲れ様でした！少し休憩しましょう。',
        icon: 'https://placehold.co/180x180/4f46e5/ffffff?text=Q'
    });
};
