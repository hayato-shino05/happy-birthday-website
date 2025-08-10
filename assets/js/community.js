function getSavedUsername() {
    return localStorage.getItem('birthdayChatUserName') || '';
}

function saveUsername(name) {
    if (name && name.trim() !== '') {
        localStorage.setItem('birthdayChatUserName', name.trim());
        return true;
    }
    return false;
}

window.saveUsername = saveUsername;
window.getSavedUsername = getSavedUsername;

// ユーティリティ関数：翻訳取得
function getTranslation() {
    const currentLang = localStorage.getItem('language') || 'ja';
    return translations && translations[currentLang] ? translations[currentLang] : translations['ja'];
}

// ユーティリティ関数：基本モーダル作成
function createBaseModal(modalId, modalClass) {
    let modal = document.getElementById(modalId);
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = modalClass;
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }
    
    return modal;
}

// ユーティリティ関数：モーダル閉じる処理追加
function addModalCloseHandler(modal, customCloseCallback) {
    const modalContent = modal.querySelector('.modal-content');
    let closeBtn = modalContent.querySelector('.modal-close');
    
    if (!closeBtn) {
        closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.className = 'modal-close';
        modalContent.insertBefore(closeBtn, modalContent.firstChild);
    }
    
    closeBtn.onclick = () => {
        modal.classList.remove('show');
        if (customCloseCallback) customCloseCallback();
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            if (customCloseCallback) customCloseCallback();
        }
    };
    
    return closeBtn;
}

// ユーティリティ関数：エラーハンドリング
function handleError(message, error, showAlert = true) {
    console.error(message, error);
    if (showAlert) {
        alert(message + (error?.message ? ': ' + error.message : ''));
    }
}

function initBulletinBoard() {
    console.log('掲示板を初期化中');
    const bulletinBtn = document.getElementById('bulletinBoardBtn');
    const bulletinModal = document.getElementById('bulletinBoardModal');
    const closeBulletinBoard = document.getElementById('closeBulletinBoard');
    const selectGiftBtn = document.getElementById('selectGiftBtn');
    const submitPost = document.getElementById('submitPost');
    
    if (!bulletinBtn) {
        handleError('掲示板ボタンが見つかりません', null, false);
        return;
    }
    
    if (!bulletinModal) {
        handleError('掲示板モーダルが見つかりません', null, false);
        return;
    }
    
    if (!closeBulletinBoard) {
        handleError('掲示板閉じるボタンが見つかりません', null, false);
        return;
    }
    
    bulletinBtn.addEventListener('click', () => {
        console.log('お祝い掲示板を開く');
        
        const userName = getSavedUsername();
        
        if (!userName) {
            console.log('ユーザー名がありません、名前入力モーダルを開く');
            openUserNameModalForBulletin();
        } else {
            console.log('ユーザー名があります、掲示板を開く');
            bulletinModal.classList.add('show');
        }
    });
    
    closeBulletinBoard.addEventListener('click', () => {
        console.log('お祝い掲示板を閉じる');
        bulletinModal.classList.remove('show');
    });
    
    bulletinModal.addEventListener('click', (e) => {
        if (e.target === bulletinModal) {
            bulletinModal.classList.remove('show');
        }
    });
    
    if (selectGiftBtn) {
        selectGiftBtn.addEventListener('click', () => {
            const userName = getSavedUsername();
            
            if (!userName) {
                openUserNameModalForGift();
            } else {
                openVirtualGiftModal(userName);
            }
        });
    }
    
    if (submitPost) {
        submitPost.addEventListener('click', () => {
            const selectedGiftDisplay = document.getElementById('selectedGiftDisplay');
            
            if (!selectedGiftDisplay || !selectedGiftDisplay.classList.contains('show')) {
                handleError('送信前にギフトを選択してください！');
                return;
            }
            
            const userName = getSavedUsername();
            if (!userName) {
                openUserNameModalForGift();
                return;
            }
            
            handleError('ギフトを正常に送信しました！', null, true);
            bulletinModal.classList.remove('show');
        });
    }
    
    console.log('お祝い掲示板の初期化完了');
}

function initCustomMessage() {
    const customMessageBtn = document.getElementById('customMessageBtn');
    const customMessageModal = document.getElementById('customMessageModal');
    const closeCustomMessage = document.getElementById('closeCustomMessage');
    const submitCustomMessage = document.getElementById('submitCustomMessage');
    
    customMessageBtn.addEventListener('click', () => {
        const userName = getSavedUsername();
        if (userName && document.getElementById('senderNameInput')) {
            document.getElementById('senderNameInput').value = userName;
        }
        
        customMessageModal.classList.add('show');
    });
    
    closeCustomMessage.addEventListener('click', () => {
        customMessageModal.classList.remove('show');
    });
    
    customMessageModal.addEventListener('click', (e) => {
        if (e.target === customMessageModal) {
            customMessageModal.classList.remove('show');
        }
    });
    
    let senderNameInput = document.getElementById('senderNameInput');
    if (!senderNameInput) {
        senderNameInput = document.createElement('input');
        senderNameInput.id = 'senderNameInput';
        senderNameInput.type = 'text';
        senderNameInput.placeholder = 'あなたのお名前...';
        senderNameInput.className = 'custom-message-sender-input';
        const modalContent = customMessageModal.querySelector('.modal-content');
        modalContent.insertBefore(senderNameInput, modalContent.children[2]);
        
        const savedUserName = getSavedUsername();
        if (savedUserName) {
            senderNameInput.value = savedUserName;
        }
    }

    submitCustomMessage.addEventListener('click', async () => {
        const customMessageInput = document.getElementById('customMessageInput');
        const senderNameInput = document.getElementById('senderNameInput');
        const messageText = customMessageInput.value.trim();
        let senderName = senderNameInput.value.trim();
        
        if (!messageText) {
            handleError('お祝いメッセージを入力してください！');
            return;
        }
        
        if (!senderName) {
            const savedUserName = getSavedUsername();
            if (savedUserName) {
                senderName = savedUserName;
            } else {
                senderName = '匿名';
            }
        } else {
            saveUsername(senderName);
        }
        
        const birthdayName = getCurrentBirthdayPerson();
        const saved = await saveCustomMessage(senderName, messageText, birthdayName);
        
        if (saved) {
            displayCustomMessage(`${messageText} - ${senderName}`);
            customMessageModal.classList.remove('show');
            customMessageInput.value = '';
        } else {
            handleError('お祝いメッセージを保存できません。後でもう一度お試しください！');
        }
    });

    let recordBtn = document.getElementById('recordMessageBtn');
    if (!recordBtn) {
        recordBtn = document.createElement('button');
        recordBtn.id = 'recordMessageBtn';
        const t = getTranslation();
        recordBtn.textContent = t.recordMessage || '🎤 お祝いメッセージを録音';
        recordBtn.className = 'record-message-btn';
        recordBtn.addEventListener('click', () => {
            customMessageModal.classList.remove('show');
            openRecordMessageModal();
        });
        const modalContent = customMessageModal.querySelector('.modal-content');
        modalContent.appendChild(recordBtn);
    }

    let videoBtn = document.getElementById('videoMessageBtn');
    if (!videoBtn) {
        videoBtn = document.createElement('button');
        videoBtn.id = 'videoMessageBtn';
        const t = getTranslation();
        videoBtn.textContent = t.recordVideo || '🎥 お祝いビデオ';
        videoBtn.className = 'video-message-btn';
        videoBtn.addEventListener('click', () => {
            customMessageModal.classList.remove('show');
            openVideoMessageModal();
        });
        const modalContent = customMessageModal.querySelector('.modal-content');
        modalContent.appendChild(videoBtn);
    }

    displaySavedAudioMessages();
}

function openRecordMessageModal() {
    const recordModal = createBaseModal('recordMessageModal', 'record-modal');
    const modalContent = recordModal.querySelector('.modal-content');
    
    // カスタム閉じる処理（録音停止）を追加
    addModalCloseHandler(recordModal, () => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
        });
    
    // 既存のコンテンツがない場合のみ作成
    if (!modalContent.querySelector('#recordBtn')) {
        const t = getTranslation();
        
        const title = document.createElement('h2');
        title.textContent = t.recordMessageTitle || 'お祝いメッセージを録音';
        title.className = 'modal-title';
        
        const recordControls = document.createElement('div');
        recordControls.className = 'record-controls';
        
        const recordBtn = document.createElement('button');
        recordBtn.id = 'recordBtn';
        recordBtn.textContent = t.recordStart || '⏺️ 録音開始';
        recordBtn.className = 'record-btn';
        recordBtn.addEventListener('click', toggleRecording);
        
        const statusText = document.createElement('div');
        statusText.id = 'recordingStatus';
        statusText.textContent = t.notRecorded || '未録音';
        statusText.className = 'recording-status';
        
        const audioPreview = document.createElement('audio');
        audioPreview.id = 'audioPreview';
        audioPreview.controls = true;
        audioPreview.className = 'audio-preview';
        
        const senderInput = document.createElement('input');
        senderInput.id = 'audioMessageSender';
        senderInput.type = 'text';
        senderInput.placeholder = t.yourNamePlaceholder || 'あなたのお名前...';
        senderInput.className = 'audio-sender-input';
        
        const saveBtn = document.createElement('button');
        saveBtn.id = 'saveAudioBtn';
        saveBtn.textContent = t.saveAudioMessage || '💾 お祝いメッセージを保存';
        saveBtn.className = 'save-audio-btn';
        saveBtn.addEventListener('click', saveAudioMessage);
        
        recordControls.appendChild(recordBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(recordControls);
        modalContent.appendChild(statusText);
        modalContent.appendChild(audioPreview);
        modalContent.appendChild(senderInput);
        modalContent.appendChild(saveBtn);
    }
    
    // リセット処理
    const recordBtn = document.getElementById('recordBtn');
    const audioPreview = document.getElementById('audioPreview');
    const senderInput = document.getElementById('audioMessageSender');
    const saveBtn = document.getElementById('saveAudioBtn');
    const statusText = document.getElementById('recordingStatus');
    const t = getTranslation();
    
    if (recordBtn) recordBtn.textContent = t.recordStart || '⏺️ 録音開始';
    if (audioPreview) {
    audioPreview.classList.remove('show');
    audioPreview.src = '';
    }
    if (senderInput) {
    senderInput.classList.remove('show');
    senderInput.value = '';
    }
    if (saveBtn) saveBtn.classList.remove('show');
    if (statusText) {
        statusText.textContent = t.notRecorded || '未録音';
    statusText.className = 'recording-status';
    }
    
    recordModal.classList.add('show');
}

function toggleRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    const recordBtn = document.getElementById('recordBtn');
    const audioPreview = document.getElementById('audioPreview');
    const statusText = document.getElementById('recordingStatus');
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        handleError('お使いのブラウザは録音に対応していません！');
        return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                audioUrl = URL.createObjectURL(audioBlob);
                audioPreview.src = audioUrl;
                audioPreview.classList.add('show');
                
                document.getElementById('audioMessageSender').classList.add('show');
                document.getElementById('saveAudioBtn').classList.add('show');
                
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorder.start();
            recordBtn.textContent = '⏹️ 録音停止';
            statusText.textContent = '⚫ 録音中...';
            statusText.className = 'recording-status recording';
        })
        .catch(error => {
            handleError('マイクにアクセスできません。アクセス許可を確認してもう一度お試しください', error);
        });
}

function stopRecording() {
    if (mediaRecorder) {
        mediaRecorder.stop();
        
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        const recordBtn = document.getElementById('recordBtn');
        const statusText = document.getElementById('recordingStatus');
        
        recordBtn.textContent = '⏺️ 新しい録音';
        statusText.textContent = '✅ 録音完了';
        statusText.className = 'recording-status completed';
    }
}

function saveAudioMessage() {
    const senderInput = document.getElementById('audioMessageSender');
    const senderName = senderInput.value.trim() || '匿名';
    
    if (!audioBlob) {
        handleError('保存する録音がありません！');
        return;
    }
    
    const statusText = document.getElementById('recordingStatus');
    if (statusText) {
        statusText.textContent = '音声をアップロード中...';
        statusText.className = 'recording-status uploading';
    }
    
    const birthdayPerson = localStorage.getItem('currentBirthday') || '共通';
    saveAudioMessageToSupabase(audioBlob, senderName, birthdayPerson)
        .then(success => {
            if (success) {
        document.getElementById('recordMessageModal').classList.remove('show');
        handleError('お祝い音声メッセージが正常に保存されました！', null, true);
        displaySavedAudioMessages();
            } else {
                if (statusText) {
                    statusText.textContent = '音声保存エラー';
                    statusText.className = 'recording-status error';
                }
                handleError('音声保存エラー');
            }
        })
        .catch(error => {
            handleError('音声の保存中にエラーが発生しました', error);
            if (statusText) {
                statusText.textContent = '音声保存エラー';
                statusText.className = 'recording-status error';
            }
        });
}

function displaySavedAudioMessages() {
    const birthdayPerson = localStorage.getItem('currentBirthday') || '共通';
    getAudioMessages(birthdayPerson)
        .then(messages => {
            if (messages && messages.length > 0) {
        let audioBtn = document.getElementById('viewAudioMessagesBtn');
        
        if (!audioBtn && document.getElementById('customMessageDisplay')) {
            audioBtn = document.createElement('button');
            audioBtn.id = 'viewAudioMessagesBtn';
            audioBtn.textContent = '🔊 お祝いを聞く';
            audioBtn.className = 'view-audio-messages-btn';
            
            audioBtn.addEventListener('click', () => {
                openAudioMessagesModal(birthdayPerson);
            });
            
            const customMessageDisplay = document.getElementById('customMessageDisplay');
            customMessageDisplay.appendChild(audioBtn);
        }
    }
        })
        .catch(error => {
            handleError('音声リスト取得エラー', error, false);
        });
}

function openAudioMessagesModal(birthdayPerson) {
    const audioModal = createBaseModal('audioMessagesModal', 'audio-messages-modal');
    const modalContent = audioModal.querySelector('.modal-content');
    
    // カスタム閉じる処理（全音声停止）を追加
    addModalCloseHandler(audioModal, () => {
            document.querySelectorAll('audio').forEach(audio => audio.pause());
        });
    
    // 既存のコンテンツがない場合のみ作成
    if (!modalContent.querySelector('#audioMessagesList')) {
        const t = getTranslation();
        
        const title = document.createElement('h2');
        title.textContent = birthdayPerson ? 
            (t.birthdayMessagesFor || '{person}へのお祝いメッセージ').replace('{person}', birthdayPerson) : 
            (t.birthdayMessages || 'お誕生日お祝いメッセージ');
        title.className = 'modal-title';
        
        const messagesList = document.createElement('div');
        messagesList.id = 'audioMessagesList';
        messagesList.className = 'audio-messages-list';
        
        modalContent.appendChild(title);
        modalContent.appendChild(messagesList);
    }
        
    audioModal.classList.add('show');
    
        const messagesList = document.getElementById('audioMessagesList');
    if (messagesList) {
        const t = getTranslation();
        messagesList.innerHTML = `<p id="audioLoadingMessage" class="audio-loading-message">${t.loadingAudioMessages || '音声メッセージを読み込み中...'}</p>`;
        
        getAudioMessages(birthdayPerson)
            .then(messages => {
                messagesList.innerHTML = '';
                
                if (!messages || messages.length === 0) {
                const noMessages = document.createElement('p');
                    noMessages.textContent = t.noAudioMessages || 'まだお祝い音声メッセージがありません。';
                noMessages.className = 'no-audio-messages';
                messagesList.appendChild(noMessages);
            } else {
                messages.forEach((message, index) => {
                    const messageItem = document.createElement('div');
                    messageItem.className = 'audio-message-item';
                    
                    const messageHeader = document.createElement('div');
                    messageHeader.className = 'audio-message-header';
                    
                    const senderName = document.createElement('span');
                    senderName.textContent = message.sender;
                    senderName.className = 'audio-sender-name';
                    
                    const timestamp = document.createElement('span');
                        timestamp.textContent = new Date(message.created_at).toLocaleString();
                    timestamp.className = 'audio-timestamp';
                    
                    messageHeader.appendChild(senderName);
                    messageHeader.appendChild(timestamp);
                    
                    const audioPlayer = document.createElement('audio');
                    audioPlayer.controls = true;
                    audioPlayer.className = 'audio-player';
                        audioPlayer.src = message.audio_data;
                    
                    messageItem.appendChild(messageHeader);
                    messageItem.appendChild(audioPlayer);
                    messagesList.appendChild(messageItem);
                });
            }
            })
            .catch(error => {
                handleError(t.audioMessagesError || '音声メッセージ取得エラー', error, false);
                messagesList.innerHTML = '';
                const errorMsg = document.createElement('p');
                errorMsg.textContent = (t.audioLoadError || '音声メッセージ読み込みエラー') + ': ' + error.message;
                errorMsg.className = 'audio-error-message';
                messagesList.appendChild(errorMsg);
            });
    }
}

function playAudioMessage(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
        handleError('音声を再生できません。もう一度お試しください', error);
    });
}

function displayCustomMessage(message) {
    const customMessageDisplay = document.getElementById('customMessageDisplay');
    if (customMessageDisplay) {
        customMessageDisplay.innerHTML = `
            <div class="message-bubble">
                <p>${message}</p>
            </div>
        `;
        customMessageDisplay.classList.add('show');
    }
}

// お祝いメッセージを表示
async function displaySavedCustomMessage() {
    try {
        // 誕生日のお祝いメッセージを表示する人を取得
        const birthdayPerson = getCurrentBirthdayPerson();
        
        // お祝いメッセージを取得
        const message = await getLatestCustomMessage(birthdayPerson);
        
        if (message) {
            displayCustomMessage(`${message.message} - ${message.sender}`);
        }
    } catch (error) {
        handleError('お祝いメッセージ表示エラー', error, false);
        
        // ローカルストレージからメッセージを取得
        const savedMessage = localStorage.getItem('customBirthdayMessage');
        if (savedMessage) {
            displayCustomMessage(savedMessage);
        }
    }
}

// 誕生日のお祝いメッセージを表示する人を取得
function getCurrentBirthdayPerson() {
    // デフォルトは友達
    return localStorage.getItem('birthdayPerson') || '友達';
}

// ビデオ録画処理のヘルパー関数
function handleVideoRecording() {
            const startButton = document.getElementById('startVideoBtn');
            const videoPreview = document.getElementById('videoPreview');
            const statusText = document.getElementById('videoRecordingStatus');
    const t = getTranslation();
            
    if (startButton.textContent.includes(t.recordStart || '録画開始')) {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            handleError(t.browserNotSupported || 'お使いのブラウザはビデオ録画に対応していません！');
                    return;
                }
                
                navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                    .then(stream => {
                        videoPreview.srcObject = stream;
                        
                        videoChunks = [];
                        videoRecorder = new MediaRecorder(stream, {
                            mimeType: 'video/webm;codecs=vp9,opus'
                        });
                        
                        videoRecorder.ondataavailable = event => {
                            if (event.data.size > 0) {
                                videoChunks.push(event.data);
                            }
                        };
                        
                        videoRecorder.onstop = () => {
                            videoBlob = new Blob(videoChunks, { type: 'video/webm' });
                            videoUrl = URL.createObjectURL(videoBlob);
                            
                            videoPreview.srcObject = null;
                            videoPreview.src = videoUrl;
                            videoPreview.muted = false;
                            videoPreview.play();
                            
                            document.getElementById('videoMessageSender').classList.add('show');
                            document.getElementById('saveVideoBtn').classList.add('show');
                        };
                        
                        videoRecorder.start();
                startButton.textContent = t.recordStop || '⏹️ 録画停止';
                statusText.textContent = t.recording || '⚫ ビデオ録画中...';
                        statusText.className = 'video-recording-status recording';
                    })
                    .catch(error => {
                handleError(t.cameraAccessError || 'カメラにアクセスできません。アクセス許可を確認してもう一度お試しください', error);
                    });
            } else {
                if (videoRecorder && videoRecorder.state === 'recording') {
                    videoRecorder.stop();
                    videoPreview.srcObject.getTracks().forEach(track => track.stop());
                    
            startButton.textContent = t.reRecord || '🔄 再録画';
            statusText.textContent = t.recordCompleted || '✅ ビデオ録画完了';
                    statusText.className = 'video-recording-status completed';
                }
    }
}

// ビデオメッセージモーダルを開く
function openVideoMessageModal() {
    const videoModal = createBaseModal('videoMessageModal', 'video-message-modal');
    const modalContent = videoModal.querySelector('.modal-content');
    
    // カスタム閉じる処理（ビデオストリーム停止）を追加
    addModalCloseHandler(videoModal, () => {
        const videoPreview = document.getElementById('videoPreview');
        if (videoPreview && videoPreview.srcObject) {
            videoPreview.srcObject.getTracks().forEach(track => track.stop());
            videoPreview.srcObject = null;
        }
        
        if (videoRecorder && videoRecorder.state === 'recording') {
            videoRecorder.stop();
        }
    });
    
    // 既存のコンテンツがない場合のみ作成
    if (!modalContent.querySelector('#startVideoBtn')) {
        const t = getTranslation();
        
        const title = document.createElement('h2');
        title.textContent = t.recordVideoTitle || 'お祝いビデオを録画';
        title.className = 'modal-title';
        
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        
        const videoPreview = document.createElement('video');
        videoPreview.id = 'videoPreview';
        videoPreview.width = 540;
        videoPreview.height = 360;
        videoPreview.className = 'video-preview';
        videoPreview.autoplay = true;
        videoPreview.muted = true;
        
        const recordControls = document.createElement('div');
        recordControls.className = 'video-record-controls';
        
        const startVideoBtn = document.createElement('button');
        startVideoBtn.id = 'startVideoBtn';
        startVideoBtn.textContent = t.recordStart || '⏺️ 録画開始';
        startVideoBtn.className = 'video-record-btn';
        startVideoBtn.addEventListener('click', handleVideoRecording);
        
        const statusText = document.createElement('div');
        statusText.id = 'videoRecordingStatus';
        statusText.textContent = t.notRecorded || '未録画';
        statusText.className = 'video-recording-status';
        
        const senderInput = document.createElement('input');
        senderInput.id = 'videoMessageSender';
        senderInput.type = 'text';
        senderInput.placeholder = t.yourNamePlaceholder || 'あなたのお名前...';
        senderInput.className = 'video-sender-input';
        
        const saveBtn = document.createElement('button');
        saveBtn.id = 'saveVideoBtn';
        saveBtn.textContent = t.saveVideo || '💾 ビデオ保存';
        saveBtn.className = 'video-save-btn';
        saveBtn.addEventListener('click', () => {
            const senderName = document.getElementById('videoMessageSender').value.trim() || 
                               (t.anonymous || '匿名');
            const videoName = (t.videoFromSender || '{sender}からのお祝いビデオ')
                              .replace('{sender}', senderName);
            
            saveVideoMessage(videoBlob, videoName, senderName);
        });
        
        videoContainer.appendChild(videoPreview);
        recordControls.appendChild(startVideoBtn);
        
        modalContent.appendChild(title);
        modalContent.appendChild(videoContainer);
        modalContent.appendChild(recordControls);
        modalContent.appendChild(statusText);
        modalContent.appendChild(senderInput);
        modalContent.appendChild(saveBtn);
    }
        
    // リセット処理
        const startButton = document.getElementById('startVideoBtn');
        const videoPreview = document.getElementById('videoPreview');
        const statusText = document.getElementById('videoRecordingStatus');
        const senderInput = document.getElementById('videoMessageSender');
        const saveBtn = document.getElementById('saveVideoBtn');
    const t = getTranslation();
        
    if (startButton) startButton.textContent = t.recordStart || '⏺️ 録画開始';
    if (videoPreview) {
        videoPreview.srcObject = null;
        videoPreview.src = '';
        videoPreview.muted = true;
    }
    if (statusText) {
        statusText.textContent = t.notRecorded || '未録画';
        statusText.className = 'video-recording-status';
    }
    if (senderInput) {
        senderInput.classList.remove('show');
        senderInput.value = '';
    }
    if (saveBtn) saveBtn.classList.remove('show');
    
    videoModal.classList.add('show');
}

let videoRecorder;
let videoChunks = [];
let videoBlob;
let videoUrl;

function saveVideoMessage(videoData, videoName, senderName) {
    if (!videoData) {
        handleError('保存するビデオがありません！');
        return;
    }
    
    if (videoData.size > 10 * 1024 * 1024) {
        handleError('ビデオが大きすぎます。短いビデオを録画してください（10MB未満）。');
        return;
    }
    
    const statusText = document.getElementById('videoRecordingStatus');
    if (statusText) {
        statusText.textContent = 'ビデオをアップロード中...';
        statusText.className = 'video-recording-status uploading';
    }
    
    const birthdayPerson = localStorage.getItem('currentBirthday') || '共通';
    
    saveVideoMessageToSupabase(videoData, videoName, senderName, birthdayPerson)
        .then(success => {
            if (success) {
        document.getElementById('videoMessageModal').classList.remove('show');
        const t = getTranslation();
        handleError(t.videoSavedAlert || 'お祝いビデオが正常に保存されました！', null, true);
        
        displaySavedVideoMessages();
            } else {
                if (statusText) {
                    statusText.textContent = 'ビデオ保存エラー！';
                    statusText.className = 'video-recording-status error';
                }
                handleError('ビデオを保存できません。後でもう一度お試しください。');
            }
        })
        .catch(error => {
            handleError('ビデオ保存エラー', error);
            if (statusText) {
                statusText.textContent = 'ビデオ保存エラー！';
                statusText.className = 'video-recording-status error';
            }
        });
}

function displaySavedVideoMessages() {
    const birthdayPerson = localStorage.getItem('currentBirthday') || '共通';
    getVideoMessages(birthdayPerson)
        .then(messages => {
            if (messages && messages.length > 0) {
        let videoBtn = document.getElementById('viewVideoMessagesBtn');
        
        if (!videoBtn && document.getElementById('customMessageDisplay')) {
            videoBtn = document.createElement('button');
            videoBtn.id = 'viewVideoMessagesBtn';
            const t = getTranslation();
            videoBtn.textContent = t.viewVideoMessages || '🎥 お祝いビデオを見る';
            videoBtn.className = 'view-video-messages-btn';
            
            videoBtn.addEventListener('click', () => {
                openVideoMessagesModal(birthdayPerson);
            });
            
            const customMessageDisplay = document.getElementById('customMessageDisplay');
            customMessageDisplay.appendChild(videoBtn);
        }
    }
        })
        .catch(error => {
            handleError('ビデオリスト取得エラー', error, false);
        });
}

function openVideoMessagesModal(birthdayPerson) {
    const videoModal = createBaseModal('videoMessagesModal', 'video-messages-modal');
    const modalContent = videoModal.querySelector('.modal-content');
    
    // カスタム閉じる処理（全ビデオ停止）を追加
    addModalCloseHandler(videoModal, () => {
            document.querySelectorAll('video').forEach(video => video.pause());
        });
    
    // 既存のコンテンツがない場合のみ作成
    if (!modalContent.querySelector('#videoMessagesList')) {
        const t = getTranslation();
        
        const title = document.createElement('h2');
        title.textContent = birthdayPerson ? 
            (t.birthdayVideoTitle || '{person}へのお祝いビデオ').replace('{person}', birthdayPerson) : 
            (t.recordVideo || 'お祝いビデオ');
        title.className = 'modal-title';
        
        const messagesList = document.createElement('div');
        messagesList.id = 'videoMessagesList';
        messagesList.className = 'video-messages-list';
        
        modalContent.appendChild(title);
        modalContent.appendChild(messagesList);
    }
        
    videoModal.classList.add('show');
    
    const messagesList = document.getElementById('videoMessagesList');
    if (messagesList) {
        const t = getTranslation();
        messagesList.innerHTML = `<p id="videoLoadingMessage" class="video-loading-message">${t.loadingVideos || 'ビデオを読み込み中...'}</p>`;
        
        getVideoMessages(birthdayPerson)
            .then(messages => {
                messagesList.innerHTML = '';
                
                if (!messages || messages.length === 0) {
                const noMessages = document.createElement('p');
                    noMessages.textContent = t.noVideoMessages || 'まだお祝いビデオがありません。';
                noMessages.className = 'video-no-messages';
                messagesList.appendChild(noMessages);
            } else {
                messages.forEach((message, index) => {
                    const messageItem = document.createElement('div');
                    messageItem.className = 'video-message-item';
                    
                    const messageHeader = document.createElement('div');
                    messageHeader.className = 'video-message-header';
                    
                    const senderName = document.createElement('span');
                    senderName.textContent = message.sender;
                    senderName.className = 'video-message-sender';
                    
                    const timestamp = document.createElement('span');
                    timestamp.textContent = new Date(message.created_at).toLocaleString();
                    timestamp.className = 'video-message-timestamp';
                    
                    messageHeader.appendChild(senderName);
                    messageHeader.appendChild(timestamp);
                    
                        const videoTitle = document.createElement('h3');
                        videoTitle.textContent = message.video_name || 
                                                (t.videoNumber || 'ビデオ #{number}').replace('{number}', index + 1);
                        videoTitle.className = 'video-message-title';
                    
                    const videoPlayer = document.createElement('video');
                    videoPlayer.controls = true;
                    videoPlayer.className = 'video-message-player';
                    videoPlayer.src = message.video_url;
                    videoPlayer.preload = 'metadata';
                    
                    messageItem.appendChild(messageHeader);
                        messageItem.appendChild(videoTitle);
                    messageItem.appendChild(videoPlayer);
                    messagesList.appendChild(messageItem);
                });
            }
            })
            .catch(error => {
                handleError(t.videoGetError || 'ビデオ取得エラー', error, false);
                messagesList.innerHTML = '';
                const errorMsg = document.createElement('p');
                errorMsg.textContent = (t.videoLoadError || 'ビデオ読み込みエラー') + ': ' + error.message;
                errorMsg.className = 'video-error-message';
                messagesList.appendChild(errorMsg);
            });
    }
}

function playVideoMessage(videoUrl) {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.controls = true;
    video.className = 'video-fullscreen-player';
    
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-fullscreen-container';
    
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '×';
    closeBtn.className = 'video-fullscreen-close';
    closeBtn.addEventListener('click', () => {
        video.pause();
        document.body.removeChild(videoContainer);
    });
    
    videoContainer.appendChild(video);
    videoContainer.appendChild(closeBtn);
    document.body.appendChild(videoContainer);
    
    video.play().catch(error => {
        handleError('ビデオを再生できません。もう一度お試しください', error);
    });
}

function initCommunityFeatures() {
    initBulletinBoard();
    
    initCustomMessage();
    
    setupChatRealtime();
    const container = document.querySelector('.container');
    
    if (container) {
        const chatButton = document.createElement('button');
        chatButton.id = 'openChatBtn';
        const t = getTranslation();
        chatButton.textContent = t.groupChat || '💬 グループチャット';
        chatButton.classList.add('feature-button', 'chat-button-fixed');
        
        chatButton.addEventListener('click', checkUserNameAndOpenChat);
        
        document.body.appendChild(chatButton);
        
        // 新しいボタンに現在の言語を適用
        const savedLang = localStorage.getItem('language') || 'ja';
        if (typeof updateDynamicButtonsLanguage !== 'undefined') {
            updateDynamicButtonsLanguage(savedLang);
        }
    }
}

function checkUserNameAndOpenChat() {
    const userName = localStorage.getItem('birthdayChatUserName');
    
    if (userName) {
        openChatRoomModal(userName);
    } else {
        openUserNameModal();
    }
}

function createUserNameModal(buttonText, onSubmit) {
    const userNameModal = createBaseModal('userNameModal', 'username-modal');
    const modalContent = userNameModal.querySelector('.modal-content');
    
    addModalCloseHandler(userNameModal);
    
    // 既存の要素があるかチェック
    let title = modalContent.querySelector('.modal-title');
    let userNameInput = modalContent.querySelector('#chatUserNameInput');
    let submitBtn = modalContent.querySelector('#userNameSubmitBtn');
    
    if (!title) {
        title = document.createElement('h2');
        title.textContent = 'お名前を入力してください';
        title.className = 'modal-title';
        modalContent.appendChild(title);
    }
        
    if (!userNameInput) {
        userNameInput = document.createElement('input');
        userNameInput.id = 'chatUserNameInput';
        userNameInput.type = 'text';
        userNameInput.placeholder = 'お名前...';
        userNameInput.className = 'form-input';
        modalContent.appendChild(userNameInput);
    }
        
    if (!submitBtn) {
        submitBtn = document.createElement('button');
        submitBtn.id = 'userNameSubmitBtn';
        submitBtn.className = 'btn-submit';
        modalContent.appendChild(submitBtn);
    }
    
    submitBtn.textContent = buttonText;
    
    // 既存のイベントリスナーを削除
    const newSubmitBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
    
    newSubmitBtn.addEventListener('click', () => {
        const userName = userNameInput.value.trim();
        
        if (userName) {
            saveUsername(userName);
            userNameModal.classList.remove('show');
            onSubmit(userName);
        } else {
            handleError('お名前を入力してください！');
        }
    });
    
        userNameInput.value = '';
    userNameModal.classList.add('show');
}

function openUserNameModal() {
    createUserNameModal('チャットに参加', (userName) => {
        openChatRoomModal(userName);
    });
}

// チャットメッセージ送信のヘルパー関数
function createChatSendHandler(userName, messageInput) {
    return () => {
        const messageText = messageInput.value.trim();
        
        if (messageText) {
            sendChatMessage(userName, messageText);
            messageInput.value = '';
        }
    };
}

// チャット最小化切り替えのヘルパー関数
function toggleChatMinimize(chatContent, chatInputArea, chatModal) {
    if (chatContent.classList.contains('u-hidden')) {
        chatContent.classList.remove('u-hidden');
        chatInputArea.classList.remove('u-hidden');
        chatModal.classList.add('chat-modal-expanded');
    } else {
        chatContent.classList.add('u-hidden');
        chatInputArea.classList.add('u-hidden');
        chatModal.classList.remove('chat-modal-expanded');
    }
}

// チャットルームモーダルを開く
function openChatRoomModal(userName) {
    let chatModal = document.getElementById('chatRoomModal');
    
    if (!chatModal) {
        // チャットモーダルは特殊構造のため直接作成
        chatModal = document.createElement('div');
        chatModal.id = 'chatRoomModal';
        chatModal.className = 'chat-modal';
        
        const t = getTranslation();
        
        const chatHeader = document.createElement('div');
        chatHeader.className = 'chat-header';
        
        const chatTitle = document.createElement('h3');
        chatTitle.textContent = t.groupChat || '誕生日グループチャット';
        chatTitle.className = 'chat-title';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.className = 'chat-btn';
        closeBtn.addEventListener('click', () => {
            chatModal.classList.remove('show');
        });
        
        const chatContent = document.createElement('div');
        chatContent.id = 'chatMessages';
        chatContent.className = 'chat-content';
        
        const chatInputArea = document.createElement('div');
        chatInputArea.className = 'chat-input-area';
        
        const minimizeBtn = document.createElement('span');
        minimizeBtn.textContent = '_';
        minimizeBtn.className = 'chat-btn chat-minimize';
        minimizeBtn.addEventListener('click', () => {
            toggleChatMinimize(chatContent, chatInputArea, chatModal);
        });
        
        const headerControls = document.createElement('div');
        headerControls.className = 'chat-controls';
        headerControls.appendChild(minimizeBtn);
        headerControls.appendChild(closeBtn);
        
        chatHeader.appendChild(chatTitle);
        chatHeader.appendChild(headerControls);
        
        const messageInput = document.createElement('input');
        messageInput.id = 'chatMessageInput';
        messageInput.type = 'text';
        messageInput.placeholder = t.messageInputPlaceholder || 'メッセージを入力...';
        messageInput.className = 'chat-message-input';
        
        const sendBtn = document.createElement('button');
        sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
        sendBtn.className = 'chat-send-btn';
        
        const sendHandler = createChatSendHandler(userName, messageInput);
        sendBtn.addEventListener('click', sendHandler);
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendHandler();
            }
        });
        
        chatInputArea.appendChild(messageInput);
        chatInputArea.appendChild(sendBtn);
        
        chatModal.appendChild(chatHeader);
        chatModal.appendChild(chatContent);
        chatModal.appendChild(chatInputArea);
        
        document.body.appendChild(chatModal);
        
        loadChatHistory();
    }
    
    chatModal.classList.add('show');
}

// チャットメッセージのDOE要素を作成する共通関数 - CSS classes使用版
function createMessageDiv(message, currentUserName) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    
    if (message.sender === currentUserName) {
        messageDiv.classList.add('chat-message--sender');
    } else {
        messageDiv.classList.add('chat-message--receiver');
    }
    
    const senderSpan = document.createElement('div');
    senderSpan.textContent = message.sender;
    senderSpan.className = 'chat-message__sender';
    
    const timeSpan = document.createElement('div');
    const msgTime = new Date(message.created_at);
    timeSpan.textContent = msgTime.toLocaleTimeString();
    timeSpan.className = 'chat-message__time';
    
    messageDiv.appendChild(senderSpan);
    messageDiv.appendChild(document.createTextNode(message.text));
    messageDiv.appendChild(timeSpan);
    
    return messageDiv;
}

async function loadChatHistory() {
    try {
    const chatMessages = document.getElementById('chatMessages');
    
        if (!chatMessages) return;
        
        chatMessages.innerHTML = '';
        
        const { data: messages, error } = await supabase
            .from('chat_messages')
            .select('*')
            .order('created_at', { ascending: true });
            
        if (error) throw error;
        
        if (messages && messages.length > 0) {
            const currentUserName = localStorage.getItem('birthdayChatUserName');
            
            messages.forEach(msg => {
                const messageDiv = createMessageDiv(msg, currentUserName);
                chatMessages.appendChild(messageDiv);
            });
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    } catch (error) {
        handleError('チャット履歴読み込みエラー', error, false);
        

        const chatMessages = document.getElementById('chatMessages');
        const messagesData = localStorage.getItem('birthdayChatMessages');
        
        if (chatMessages && messagesData) {
            const messages = JSON.parse(messagesData);
            
            const currentUserName = localStorage.getItem('birthdayChatUserName');
            messages.forEach(msg => {
                const messageDiv = createMessageDiv(msg, currentUserName);
                chatMessages.appendChild(messageDiv);
            });
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
}

async function sendChatMessage(sender, text) {
    try {
        const messageData = { 
            sender: sender,
            text: text,
            created_at: new Date().toISOString()
        };
        
        appendNewChatMessage(messageData);
        const { data, error } = await supabase
            .from('chat_messages')
            .insert([messageData]);
            
        if (error) throw error;
        
        return true;
    } catch (error) {
        handleError('メッセージ送信エラー', error, false);
        const chatMessages = JSON.parse(localStorage.getItem('birthdayChatMessages') || '[]');
        chatMessages.push({
            sender: sender,
            text: text,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('birthdayChatMessages', JSON.stringify(chatMessages));
        
        return false;
    }
}

function setupChatRealtime() {
    try {
        const chatChannel = supabase
            .channel('public:chat_messages')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                (payload) => {
                    appendNewChatMessage(payload.new);
                }
            )
            .subscribe();
            
        console.log('チャット用リアルタイムチャンネルを設定しました');
    } catch (error) {
        handleError('チャットリアルタイム設定エラー', error, false);
    }
}

function appendNewChatMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const currentUserName = localStorage.getItem('birthdayChatUserName');
    const messageDiv = createMessageDiv(message, currentUserName);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function initInviteFriends() {
    const container = document.querySelector('.container');
    
    if (container) {
        const inviteButton = document.createElement('button');
        inviteButton.id = 'inviteFriendsBtn';
        const t = getTranslation();
        inviteButton.textContent = t.inviteFriends || '👥 友達を招待';
        inviteButton.classList.add('feature-button', 'invite-button-fixed');
        
        inviteButton.addEventListener('click', openInviteModal);
        
        document.body.appendChild(inviteButton);
        
        // 新しいボタンに現在の言語を適用
        const savedLang = localStorage.getItem('language') || 'ja';
        if (typeof updateDynamicButtonsLanguage !== 'undefined') {
            updateDynamicButtonsLanguage(savedLang);
        }
    }
}

// 招待リンクコピーヘルパー関数
function createCopyHandler(linkInput, copyBtn) {
    const t = getTranslation();
    return () => {
            linkInput.select();
            document.execCommand('copy');
            copyBtn.textContent = t.copyComplete || '✓ コピー完了';
            setTimeout(() => {
                copyBtn.textContent = t.copyButton || '📋 コピー';
            }, 2000);
    };
}

// ソーシャルシェアボタン作成ヘルパー関数
function createSocialShareButtons(linkInput) {
        const socialShare = document.createElement('div');
        socialShare.className = 'social-share-container';
        
        const platforms = [
        { name: 'Facebook', icon: 'facebook-f', shareText: '一緒に誕生日をお祝いしましょう！' },
        { name: 'Twitter', icon: 'x-twitter', shareText: '一緒に誕生日をお祝いしましょう！' },
        { name: 'WhatsApp', icon: 'whatsapp', shareText: '一緒に誕生日をお祝いしましょう！ ' }
        ];
        
        platforms.forEach(platform => {
            const shareBtn = document.createElement('button');
            shareBtn.innerHTML = `<i class="fab fa-${platform.icon}"></i>`;
            shareBtn.className = `social-share-btn social-share-btn--${platform.name.toLowerCase()}`;
            shareBtn.title = `${platform.name}でシェア`;
            
            shareBtn.addEventListener('click', () => {
                const link = linkInput.value;
                let shareUrl = '';
                
                switch (platform.name) {
                    case 'Facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
                        break;
                    case 'Twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}&text=${encodeURIComponent(platform.shareText)}`;
                        break;
                    case 'WhatsApp':
                    shareUrl = `https://wa.me/?text=${encodeURIComponent(platform.shareText + link)}`;
                        break;
                }
                
                window.open(shareUrl, '_blank');
            });
            
            socialShare.appendChild(shareBtn);
        });
        
    return socialShare;
}

// メール招待セクション作成ヘルパー関数
function createEmailInviteSection() {
    const t = getTranslation();
        const emailSection = document.createElement('div');
        emailSection.className = 'email-invite-section';
        
        const emailLabel = document.createElement('div');
        emailLabel.textContent = t.emailInviteLabel || 'メールで招待状を送る：';
        emailLabel.className = 'email-invite-label';
        
        const emailInput = document.createElement('input');
        emailInput.id = 'inviteEmailInput';
        emailInput.type = 'email';
        emailInput.placeholder = t.emailPlaceholder || '受信者のメールアドレス...';
        emailInput.className = 'email-invite-input';
        
        const messageInput = document.createElement('textarea');
        messageInput.id = 'inviteMessageInput';
        messageInput.placeholder = t.messagePlaceholder2 || '個人メッセージ（任意）...';
        messageInput.className = 'email-invite-message';
        
        const sendEmailBtn = document.createElement('button');
        sendEmailBtn.textContent = t.sendInvite || '📧 招待状を送る';
        sendEmailBtn.className = 'email-send-btn';
        
        sendEmailBtn.addEventListener('click', () => {
            const email = emailInput.value.trim();
            const message = messageInput.value.trim();
            
            if (email) {
                sendInviteEmail(email, message);
                emailInput.value = '';
                messageInput.value = '';
            } else {
            handleError(t.enterEmailAlert || '受信者のメールアドレスを入力してください！');
            }
        });
        
        emailSection.appendChild(emailLabel);
        emailSection.appendChild(emailInput);
        emailSection.appendChild(messageInput);
        emailSection.appendChild(sendEmailBtn);
    
    return emailSection;
}

// 誕生日情報から説明文を生成するヘルパー関数
function createInviteDescription() {
    const t = getTranslation();
    const nextBirthdayPerson = localStorage.getItem('nextBirthdayPerson');
    const nextBirthdayDate = localStorage.getItem('nextBirthdayDate');
    
    let birthdayPersonName = t.specialPerson || '大切な人';
    let birthdayDateText = '';
    
    if (nextBirthdayPerson) {
        try {
            const person = JSON.parse(nextBirthdayPerson);
            birthdayPersonName = person.name || (t.specialPerson || '大切な人');
        } catch (e) {
            handleError(t.birthdayInfoError || '誕生日情報読み込みエラー', e, false);
        }
    }
    
    if (nextBirthdayDate) {
        try {
            const date = new Date(nextBirthdayDate);
            birthdayDateText = ` ${date.getMonth() + 1}月${date.getDate()}日に`;
        } catch (e) {
            handleError(t.birthdayDateError || '誕生日読み込みエラー', e, false);
        }
    }
    
    const description = document.createElement('p');
    description.textContent = (t.inviteDescription || '友達を招待して{name}の誕生日{date}一緒にお祝いしましょう！みんなで素敵な思い出を作り、心のこもったお祝いのメッセージを送りましょう。')
        .replace('{name}', birthdayPersonName)
        .replace('{date}', birthdayDateText);
    description.className = 'modal-description';
    
    return description;
}

function openInviteModal() {
    const inviteModal = createBaseModal('inviteModal', 'invite-modal');
    const modalContent = inviteModal.querySelector('.modal-content');
    
    addModalCloseHandler(inviteModal);
    
    // 既存のコンテンツがない場合のみ作成
    if (!modalContent.querySelector('.invite-link-section')) {
        const t = getTranslation();
        
        const title = document.createElement('h2');
        title.textContent = t.inviteModalTitle || '友達を招待して参加してもらいましょう';
        title.className = 'modal-title';
        
        const description = createInviteDescription();
        
        const linkSection = document.createElement('div');
        linkSection.className = 'invite-link-section';
        
        const linkLabel = document.createElement('div');
        linkLabel.textContent = t.inviteLink || '招待リンク：';
        linkLabel.className = 'invite-link-label';
        
        const linkDisplay = document.createElement('div');
        linkDisplay.className = 'invite-link-display';
        
        const linkInput = document.createElement('input');
        linkInput.id = 'inviteLinkInput';
        linkInput.type = 'text';
        linkInput.readOnly = true;
        linkInput.value = generateInviteLink();
        linkInput.className = 'invite-link-input';
        
        const copyBtn = document.createElement('button');
        copyBtn.textContent = t.copyButton || '📋 コピー';
        copyBtn.className = 'invite-copy-btn';
        copyBtn.addEventListener('click', createCopyHandler(linkInput, copyBtn));
        
        linkDisplay.appendChild(linkInput);
        linkDisplay.appendChild(copyBtn);
        
        const shareLabel = document.createElement('div');
        shareLabel.textContent = t.shareLabel || 'シェアする：';
        shareLabel.className = 'social-share-label';
        
        const socialShare = createSocialShareButtons(linkInput);
        const emailSection = createEmailInviteSection();
        
        linkSection.appendChild(linkLabel);
        linkSection.appendChild(linkDisplay);
        linkSection.appendChild(shareLabel);
        linkSection.appendChild(socialShare);
        
        modalContent.appendChild(title);
        modalContent.appendChild(description);
        modalContent.appendChild(linkSection);
        modalContent.appendChild(emailSection);
    }
    
    inviteModal.classList.add('show');
}

function generateInviteLink() {
    return window.location.href;
}

function sendInviteEmail(email, message) {
    const link = generateInviteLink();
    const subject = '誕生日お祝いに参加しませんか';
    const defaultMessage = 'こんにちは！\n\n誕生日のお祝いに一緒に参加しませんか？下記のリンクをクリックして参加してください：\n\n';
    const fullMessage = defaultMessage + link + (message ? '\n\n' + message : '');
    
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`;
    window.open(mailtoLink);
}

function openUserNameModalForGift() {
    createUserNameModal('確認', (userName) => {
        openVirtualGiftModal(userName);
    });
}

function openVirtualGiftModal(userName) {
    const virtualGiftModal = document.getElementById('virtualGiftModal');
    const giftSender = document.getElementById('giftSender');
    
    if (virtualGiftModal) {
        if (giftSender && userName) {
            giftSender.value = userName;
        }
        
        virtualGiftModal.classList.add('show');
        
        loadGiftList();
    } else {
        handleError('ギフト選択モーダルが見つかりません', null, false);
    }
}

function openUserNameModalForBulletin() {
    createUserNameModal('掲示板に参加', (userName) => {
        const bulletinModal = document.getElementById('bulletinBoardModal');
        if (bulletinModal) {
            bulletinModal.classList.add('show');
        }
    });
}
