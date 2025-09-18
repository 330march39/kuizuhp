// sw.js

let timerTimeout;

self.addEventListener('message', (event) => {
  const { command, timeLeft } = event.data;

  if (command === 'startTimer') {
    // 既存のタイマーがあればクリア
    if (timerTimeout) {
      clearTimeout(timerTimeout);
    }

    // 新しいタイマーを設定
    timerTimeout = setTimeout(() => {
      self.registration.showNotification('集中モード完了！', {
        body: 'お疲れ様でした！少し休憩しましょう。',
        icon: 'https://placehold.co/192x192/4f46e5/ffffff?text=Q', // PWA用のアイコンサイズ
      });
    }, timeLeft * 1000); // ミリ秒に変換
  }

  if (command === 'stopTimer') {
    if (timerTimeout) {
      clearTimeout(timerTimeout);
      timerTimeout = null;
    }
  }
});
