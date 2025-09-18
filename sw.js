// sw.js

let timerInterval = null;
let timeLeft = 0;

// メインのアプリからメッセージを受け取ったときの処理
self.addEventListener('message', (event) => {
    const { command, timeLeft: time } = event.data;

    if (command === 'startTimer') {
        // もし既存のタイマーがあれば停止
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        timeLeft = time;
        
        // 1秒ごとに時間を減らすタイマーを開始
        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                // 時間が来たら通知を表示してタイマーを停止
                showNotification();
                clearInterval(timerInterval);
                timerInterval = null;
            }
        }, 1000);
    } else if (command === 'stopTimer') {
        // タイマーを停止
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
});

// 通知を表示する関数
const showNotification = () => {
    // self.registration.showNotification(タイトル, { オプション });
    self.registration.showNotification('集中モード完了！', {
        body: 'お疲れ様でした！少し休憩しましょう。',
        icon: 'https://placehold.co/180x180/4f46e5/ffffff?text=Q' // アイコン画像のURL
    });
};
