// 多言語対応の翻訳データ
export type Language = 'en' | 'ja'

export const translations = {
  en: {
    // 共通
    loading: 'Loading...',
    error: 'An error occurred',
    noData: 'No data available',

    // カウントダウン
    countdownTitle: "Time until birthday of",
    daysLeft: 'days left!',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    noBirthdayData: 'No birthday data found',

    // 誕生日
    happyBirthday: 'Happy Birthday!',
    birthdayWish: 'Wishing you a wonderful birthday!',
    congratulations: '🎉 Congratulations! 🎉',
    allWishesComeTrue: 'May all your wishes come true!',

    // ケーキ
    useMicrophone: '🎤 Use Microphone',
    blowToMic: 'Blow into the microphone',
    blowCandles: '🌬️ Blow the candles!',

    // 言語
    language: 'Language',
    english: 'English',
    japanese: '日本語',

    // UIボタン
    viewAlbum: 'VIEW MEMORY ALBUM',
    sendMessage: 'SEND WISHES',
    bulletinBoard: 'WISH BOARD',
    memoryGame: 'MEMORY GAME',
    puzzleGame: 'PUZZLE',
    birthdayCalendar: 'BIRTHDAY CALENDAR',
    birthdayQuiz: 'BIRTHDAY QUIZ',
    birthdaySong: 'Happy Birthday Song',
    selectMusic: 'Select music',
    inviteFriends: 'INVITE FRIENDS',
    groupChat: 'GROUP CHAT',

    // ゲーム説明
    memoryGameInstructions: 'Flip cards to find matching pairs. Complete as fast as you can!',
    puzzleGameInstructions: 'Drag and drop pieces to complete the picture.',
    quizInstructions: 'Answer questions about your friends and family birthdays.',
    calendarInstructions: 'View everyone\'s birthdays throughout the year.',
    gameStart: 'Start',
    gameRestart: 'Play Again',
    gameScore: 'Score',
    gameTime: 'Time',
    gameWin: 'Congratulations! You won!',
    gameLose: 'Time\'s up! Try again!',

    // 通知
    notificationNewMessage: 'You have a new message!',
    notificationBirthdayToday: 'Today is your birthday!',
    notificationBirthdaySoon: 'Birthday coming soon!',
    notificationUploadSuccess: 'Upload successful!',
    notificationUploadFailed: 'Upload failed. Please try again.',
    notificationSaveSuccess: 'Saved successfully!',
    notificationSaveFailed: 'Save failed. Please try again.',
    notificationCopied: 'Copied!',
    notificationShared: 'Shared!',
  },
  ja: {
    // 共通
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    noData: 'データがありません',

    // カウントダウン
    countdownTitle: 'さんの誕生日まで',
    daysLeft: '日！',
    days: '日',
    hours: '時間',
    minutes: '分',
    seconds: '秒',
    noBirthdayData: '誕生日データが見つかりません',

    // 誕生日
    happyBirthday: 'お誕生日おめでとう！',
    birthdayWish: '素敵な誕生日をお過ごしください！',
    congratulations: '🎉 おめでとうございます！ 🎉',
    allWishesComeTrue: 'すべての願いが叶いますように！',

    // ケーキ
    useMicrophone: '🎤 マイクを使用する',
    blowToMic: 'マイクに向かって吹いてください',
    blowCandles: '🌬️ ろうそくを吹いて！',

    // 言語
    language: '言語',
    english: 'English',
    japanese: '日本語',

    // UIボタン
    viewAlbum: '思い出アルバム',
    sendMessage: 'お祝いメッセージ',
    bulletinBoard: 'お祝い掲示板',
    memoryGame: '記憶ゲーム',
    puzzleGame: 'パズル',
    birthdayCalendar: '誕生日カレンダー',
    birthdayQuiz: '誕生日クイズ',
    birthdaySong: 'お誕生日の歌',
    selectMusic: '音楽を選択',
    inviteFriends: '友達を招待',
    groupChat: 'グループチャット',

    // ゲーム説明
    memoryGameInstructions: 'カードをめくって同じペアを見つけてください。できるだけ早く完成させましょう！',
    puzzleGameInstructions: 'ピースをドラッグ＆ドロップして画像を完成させてください。',
    quizInstructions: '友達や家族の誕生日についての質問に答えてください。',
    calendarInstructions: '一年を通してみんなの誕生日を確認できます。',
    gameStart: 'スタート',
    gameRestart: 'もう一度',
    gameScore: 'スコア',
    gameTime: '時間',
    gameWin: 'おめでとうございます！勝ちました！',
    gameLose: '時間切れ！もう一度挑戦してください！',

    // 通知
    notificationNewMessage: '新しいメッセージがあります！',
    notificationBirthdayToday: '今日はあなたの誕生日です！',
    notificationBirthdaySoon: '誕生日がもうすぐです！',
    notificationUploadSuccess: 'アップロード成功！',
    notificationUploadFailed: 'アップロード失敗。もう一度お試しください。',
    notificationSaveSuccess: '保存しました！',
    notificationSaveFailed: '保存失敗。もう一度お試しください。',
    notificationCopied: 'コピーしました！',
    notificationShared: '共有しました！',
  },
} as const

export type TranslationKey = keyof typeof translations.en
