// Lời chúc cá nhân
function initCustomMessage() {
    const customMessageBtn = document.getElementById('customMessageBtn');
    const customMessageModal = document.getElementById('customMessageModal');
    const closeCustomMessage = document.getElementById('closeCustomMessage');
    const submitCustomMessage = document.getElementById('submitCustomMessage');
    
    customMessageBtn.addEventListener('click', () => {
        customMessageModal.style.display = 'flex';
    });
    
    closeCustomMessage.addEventListener('click', () => {
        customMessageModal.style.display = 'none';
    });
    
    customMessageModal.addEventListener('click', (e) => {
        if (e.target === customMessageModal) {
            customMessageModal.style.display = 'none';
        }
    });
    
    // Thêm trường nhập tên người gửi
    let senderNameInput = document.getElementById('senderNameInput');
    if (!senderNameInput) {
        senderNameInput = document.createElement('input');
        senderNameInput.id = 'senderNameInput';
        senderNameInput.type = 'text';
        senderNameInput.placeholder = 'Nhập tên của bạn...';
        senderNameInput.style.width = '100%';
        senderNameInput.style.padding = '10px';
        senderNameInput.style.border = '2px solid #D4B08C';
        senderNameInput.style.borderRadius = '0';
        senderNameInput.style.marginBottom = '10px';
        senderNameInput.style.fontFamily = '\'Old Standard TT\', serif';
        senderNameInput.style.fontSize = '16px';
        senderNameInput.style.background = '#FFF9F3';
        senderNameInput.style.color = '#2C1810';
        const modalContent = customMessageModal.querySelector('.modal-content');
        modalContent.insertBefore(senderNameInput, modalContent.children[2]);
    }

    submitCustomMessage.addEventListener('click', () => {
        const customMessageInput = document.getElementById('customMessageInput');
        const senderNameInput = document.getElementById('senderNameInput');
        const messageText = customMessageInput.value.trim();
        const senderName = senderNameInput.value.trim() || 'Ẩn danh';
        
        if (messageText) {
            const messageWithSender = `${messageText} - ${senderName}`;
            localStorage.setItem('customBirthdayMessage', messageWithSender);
            displayCustomMessage(messageWithSender);
            customMessageModal.style.display = 'none';
            customMessageInput.value = '';
            senderNameInput.value = '';
        } else {
            alert('Vui lòng nhập lời chúc!');
        }
    });

    // Thêm nút ghi âm lời chúc vào modal
    let recordBtn = document.getElementById('recordMessageBtn');
    if (!recordBtn) {
        recordBtn = document.createElement('button');
        recordBtn.id = 'recordMessageBtn';
        recordBtn.textContent = '🎤 Ghi Âm Lời Chúc';
        recordBtn.style.padding = '10px 20px';
        recordBtn.style.background = '#854D27';
        recordBtn.style.color = '#FFF9F3';
        recordBtn.style.border = '2px solid #D4B08C';
        recordBtn.style.borderRadius = '0';
        recordBtn.style.cursor = 'pointer';
        recordBtn.style.fontSize = '1.1em';
        recordBtn.style.transition = 'all 0.3s';
        recordBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        recordBtn.style.textTransform = 'uppercase';
        recordBtn.style.letterSpacing = '1px';
        recordBtn.style.marginTop = '10px';
        recordBtn.addEventListener('click', () => {
            customMessageModal.style.display = 'none';
            openRecordMessageModal();
        });
        recordBtn.addEventListener('mouseover', () => {
            recordBtn.style.transform = 'translate(-2px, -2px)';
            recordBtn.style.boxShadow = '6px 6px 0 #D4B08C';
        });
        recordBtn.addEventListener('mouseout', () => {
            recordBtn.style.transform = 'none';
            recordBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        });
        const modalContent = customMessageModal.querySelector('.modal-content');
        modalContent.appendChild(recordBtn);
    }

    // Thêm nút gửi video chúc mừng vào modal
    let videoBtn = document.getElementById('videoMessageBtn');
    if (!videoBtn) {
        videoBtn = document.createElement('button');
        videoBtn.id = 'videoMessageBtn';
        videoBtn.textContent = '🎥 Video Chúc Mừng';
        videoBtn.style.padding = '10px 20px';
        videoBtn.style.background = '#854D27';
        videoBtn.style.color = '#FFF9F3';
        videoBtn.style.border = '2px solid #D4B08C';
        videoBtn.style.borderRadius = '0';
        videoBtn.style.cursor = 'pointer';
        videoBtn.style.fontSize = '1.1em';
        videoBtn.style.transition = 'all 0.3s';
        videoBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        videoBtn.style.textTransform = 'uppercase';
        videoBtn.style.letterSpacing = '1px';
        videoBtn.style.marginTop = '10px';
        videoBtn.addEventListener('click', () => {
            customMessageModal.style.display = 'none';
            openVideoMessageModal();
        });
        videoBtn.addEventListener('mouseover', () => {
            videoBtn.style.transform = 'translate(-2px, -2px)';
            videoBtn.style.boxShadow = '6px 6px 0 #D4B08C';
        });
        videoBtn.addEventListener('mouseout', () => {
            videoBtn.style.transform = 'none';
            videoBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        });
        const modalContent = customMessageModal.querySelector('.modal-content');
        modalContent.appendChild(videoBtn);
    }

    // Thêm nút nghe lời chúc ghi âm nếu có dữ liệu
    displaySavedAudioMessages();
}

// Mở modal ghi âm lời chúc
function openRecordMessageModal() {
    let recordModal = document.getElementById('recordMessageModal');
    
    if (!recordModal) {
        recordModal = document.createElement('div');
        recordModal.id = 'recordMessageModal';
        recordModal.style.position = 'fixed';
        recordModal.style.top = '0';
        recordModal.style.left = '0';
        recordModal.style.width = '100%';
        recordModal.style.height = '100%';
        recordModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        recordModal.style.display = 'none';
        recordModal.style.justifyContent = 'center';
        recordModal.style.alignItems = 'center';
        recordModal.style.zIndex = '1000';
        
        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.padding = '30px';
        modalContent.style.border = '3px solid #D4B08C';
        modalContent.style.boxShadow = '10px 10px 0 #D4B08C';
        modalContent.style.maxWidth = '500px';
        modalContent.style.width = '90%';
        modalContent.style.maxHeight = '90vh';
        modalContent.style.overflowY = 'auto';
        modalContent.style.position = 'relative';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '20px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            recordModal.style.display = 'none';
            // Dừng ghi âm nếu đang ghi
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
        });
        
        const title = document.createElement('h2');
        title.textContent = 'Ghi Âm Lời Chúc';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';
        
        const recordControls = document.createElement('div');
        recordControls.style.display = 'flex';
        recordControls.style.justifyContent = 'center';
        recordControls.style.gap = '10px';
        recordControls.style.marginBottom = '20px';
        
        const recordBtn = document.createElement('button');
        recordBtn.id = 'recordBtn';
        recordBtn.textContent = '⏺️ Bắt đầu ghi âm';
        recordBtn.style.padding = '10px 20px';
        recordBtn.style.background = '#854D27';
        recordBtn.style.color = '#FFF9F3';
        recordBtn.style.border = '2px solid #D4B08C';
        recordBtn.style.borderRadius = '0';
        recordBtn.style.cursor = 'pointer';
        recordBtn.style.fontSize = '1.1em';
        recordBtn.style.transition = 'all 0.3s';
        recordBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        recordBtn.addEventListener('click', toggleRecording);
        
        const statusText = document.createElement('div');
        statusText.id = 'recordingStatus';
        statusText.textContent = 'Chưa ghi âm';
        statusText.style.marginTop = '10px';
        statusText.style.color = '#854D27';
        statusText.style.fontStyle = 'italic';
        
        const audioPreview = document.createElement('audio');
        audioPreview.id = 'audioPreview';
        audioPreview.controls = true;
        audioPreview.style.width = '100%';
        audioPreview.style.marginTop = '20px';
        audioPreview.style.display = 'none';
        
        const senderInput = document.createElement('input');
        senderInput.id = 'audioMessageSender';
        senderInput.type = 'text';
        senderInput.placeholder = 'Nhập tên của bạn...';
        senderInput.style.width = '100%';
        senderInput.style.padding = '10px';
        senderInput.style.border = '2px solid #D4B08C';
        senderInput.style.borderRadius = '0';
        senderInput.style.marginTop = '20px';
        senderInput.style.fontFamily = '\'Old Standard TT\', serif';
        senderInput.style.fontSize = '16px';
        senderInput.style.background = '#FFF9F3';
        senderInput.style.color = '#2C1810';
        senderInput.style.display = 'none';
        
        const saveBtn = document.createElement('button');
        saveBtn.id = 'saveAudioBtn';
        saveBtn.textContent = '💾 Lưu Lời Chúc';
        saveBtn.style.padding = '10px 20px';
        saveBtn.style.background = '#854D27';
        saveBtn.style.color = '#FFF9F3';
        saveBtn.style.border = '2px solid #D4B08C';
        saveBtn.style.borderRadius = '0';
        saveBtn.style.cursor = 'pointer';
        saveBtn.style.fontSize = '1.1em';
        saveBtn.style.transition = 'all 0.3s';
        saveBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        saveBtn.style.marginTop = '20px';
        saveBtn.style.display = 'none';
        saveBtn.addEventListener('click', saveAudioMessage);
        
        recordControls.appendChild(recordBtn);
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(recordControls);
        modalContent.appendChild(statusText);
        modalContent.appendChild(audioPreview);
        modalContent.appendChild(senderInput);
        modalContent.appendChild(saveBtn);
        
        recordModal.appendChild(modalContent);
        document.body.appendChild(recordModal);
    }
    
    // Reset UI state
    const recordBtn = document.getElementById('recordBtn');
    const audioPreview = document.getElementById('audioPreview');
    const senderInput = document.getElementById('audioMessageSender');
    const saveBtn = document.getElementById('saveAudioBtn');
    const statusText = document.getElementById('recordingStatus');
    
    recordBtn.textContent = '⏺️ Bắt đầu ghi âm';
    audioPreview.style.display = 'none';
    audioPreview.src = '';
    senderInput.style.display = 'none';
    senderInput.value = '';
    saveBtn.style.display = 'none';
    statusText.textContent = 'Chưa ghi âm';
    statusText.style.color = '#854D27';
    
    recordModal.style.display = 'flex';
}

// Biến toàn cục cho việc ghi âm
let mediaRecorder;
let audioChunks = [];
let audioBlob;
let audioUrl;

// Bật/tắt ghi âm
function toggleRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording();
    } else {
        startRecording();
    }
}

// Bắt đầu ghi âm
function startRecording() {
    const recordBtn = document.getElementById('recordBtn');
    const statusText = document.getElementById('recordingStatus');
    
    audioChunks = [];
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Trình duyệt của bạn không hỗ trợ ghi âm!');
        return;
    }
    
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };
            
            mediaRecorder.onstop = () => {
                audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                audioUrl = URL.createObjectURL(audioBlob);
                
                const audioPreview = document.getElementById('audioPreview');
                const senderInput = document.getElementById('audioMessageSender');
                const saveBtn = document.getElementById('saveAudioBtn');
                
                audioPreview.src = audioUrl;
                audioPreview.style.display = 'block';
                senderInput.style.display = 'block';
                saveBtn.style.display = 'block';
            };
            
            mediaRecorder.start();
            recordBtn.textContent = '⏹️ Dừng ghi âm';
            statusText.textContent = '⚫ Đang ghi âm...';
            statusText.style.color = '#ff4081';
        })
        .catch(error => {
            console.error('Không thể truy cập microphone:', error);
            alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập và thử lại.');
        });
}

// Dừng ghi âm
function stopRecording() {
    if (mediaRecorder) {
        mediaRecorder.stop();
        
        // Dừng tất cả các track để tắt microphone
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        const recordBtn = document.getElementById('recordBtn');
        const statusText = document.getElementById('recordingStatus');
        
        recordBtn.textContent = '⏺️ Ghi âm mới';
        statusText.textContent = '✅ Đã ghi âm xong';
        statusText.style.color = '#4CAF50';
    }
}

// Lưu tin nhắn âm thanh
function saveAudioMessage() {
    const senderInput = document.getElementById('audioMessageSender');
    const senderName = senderInput.value.trim() || 'Ẩn danh';
    
    if (!audioBlob) {
        alert('Không có bản ghi âm để lưu!');
        return;
    }
    
    // Chuyển Blob thành Base64 để lưu vào localStorage
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = function() {
        const base64data = reader.result;
        
        // Lấy danh sách tin nhắn hiện có hoặc tạo mảng mới
        const audioMessages = JSON.parse(localStorage.getItem('birthdayAudioMessages') || '[]');
        
        // Thêm tin nhắn mới
        audioMessages.push({
            sender: senderName,
            audioData: base64data,
            timestamp: new Date().toISOString()
        });
        
        // Lưu lại danh sách
        localStorage.setItem('birthdayAudioMessages', JSON.stringify(audioMessages));
        
        // Đóng modal và hiển thị thông báo
        document.getElementById('recordMessageModal').style.display = 'none';
        alert('Lời chúc âm thanh đã được lưu thành công!');
        
        // Cập nhật hiển thị tin nhắn
        displaySavedAudioMessages();
    };
}

// Hiển thị tin nhắn âm thanh đã lưu
function displaySavedAudioMessages() {
    const messagesData = localStorage.getItem('birthdayAudioMessages');
    const birthdayPerson = localStorage.getItem('currentBirthday');
    
    if (messagesData && JSON.parse(messagesData).length > 0) {
        // Nếu có tin nhắn âm thanh, thêm nút để nghe
        let audioBtn = document.getElementById('viewAudioMessagesBtn');
        
        if (!audioBtn && document.getElementById('customMessageDisplay')) {
            audioBtn = document.createElement('button');
            audioBtn.id = 'viewAudioMessagesBtn';
            audioBtn.textContent = '🔊 Nghe Lời Chúc';
            audioBtn.style.padding = '10px 20px';
            audioBtn.style.background = '#854D27';
            audioBtn.style.color = '#FFF9F3';
            audioBtn.style.border = '2px solid #D4B08C';
            audioBtn.style.borderRadius = '0';
            audioBtn.style.cursor = 'pointer';
            audioBtn.style.fontSize = '1.1em';
            audioBtn.style.transition = 'all 0.3s';
            audioBtn.style.boxShadow = '4px 4px 0 #D4B08C';
            audioBtn.style.margin = '10px auto';
            audioBtn.style.display = 'block';
            
            audioBtn.addEventListener('click', () => {
                openAudioMessagesModal(birthdayPerson);
            });
            
            const customMessageDisplay = document.getElementById('customMessageDisplay');
            customMessageDisplay.appendChild(audioBtn);
        }
    }
}

// Mở modal hiển thị tin nhắn âm thanh
function openAudioMessagesModal(birthdayPerson) {
    let audioModal = document.getElementById('audioMessagesModal');
    
    if (!audioModal) {
        audioModal = document.createElement('div');
        audioModal.id = 'audioMessagesModal';
        audioModal.style.position = 'fixed';
        audioModal.style.top = '0';
        audioModal.style.left = '0';
        audioModal.style.width = '100%';
        audioModal.style.height = '100%';
        audioModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        audioModal.style.display = 'none';
        audioModal.style.justifyContent = 'center';
        audioModal.style.alignItems = 'center';
        audioModal.style.zIndex = '1000';
        
        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.padding = '30px';
        modalContent.style.border = '3px solid #D4B08C';
        modalContent.style.boxShadow = '10px 10px 0 #D4B08C';
        modalContent.style.maxWidth = '600px';
        modalContent.style.width = '90%';
        modalContent.style.maxHeight = '90vh';
        modalContent.style.overflowY = 'auto';
        modalContent.style.position = 'relative';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '20px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            audioModal.style.display = 'none';
            // Dừng tất cả audio đang phát
            document.querySelectorAll('audio').forEach(audio => audio.pause());
        });
        
        const title = document.createElement('h2');
        title.textContent = birthdayPerson ? `Lời Chúc Gửi Đến ${birthdayPerson}` : 'Lời Chúc Sinh Nhật';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';
        
        const messagesList = document.createElement('div');
        messagesList.id = 'audioMessagesList';
        messagesList.style.display = 'flex';
        messagesList.style.flexDirection = 'column';
        messagesList.style.gap = '15px';
        
        // Lấy và hiển thị tin nhắn
        const messagesData = localStorage.getItem('birthdayAudioMessages');
        if (messagesData) {
            const messages = JSON.parse(messagesData);
            
            if (messages.length === 0) {
                const noMessages = document.createElement('p');
                noMessages.textContent = 'Chưa có lời chúc âm thanh nào.';
                noMessages.style.textAlign = 'center';
                noMessages.style.fontStyle = 'italic';
                noMessages.style.color = '#854D27';
                messagesList.appendChild(noMessages);
            } else {
                messages.forEach((message, index) => {
                    const messageItem = document.createElement('div');
                    messageItem.style.background = '#F5E6D8';
                    messageItem.style.padding = '15px';
                    messageItem.style.borderLeft = '4px solid #D4B08C';
                    messageItem.style.borderRadius = '0 5px 5px 0';
                    
                    const messageHeader = document.createElement('div');
                    messageHeader.style.display = 'flex';
                    messageHeader.style.justifyContent = 'space-between';
                    messageHeader.style.marginBottom = '10px';
                    
                    const senderName = document.createElement('span');
                    senderName.textContent = message.sender;
                    senderName.style.fontWeight = 'bold';
                    senderName.style.color = '#2C1810';
                    
                    const timestamp = document.createElement('span');
                    timestamp.textContent = new Date(message.timestamp).toLocaleString();
                    timestamp.style.fontSize = '0.8em';
                    timestamp.style.color = '#854D27';
                    
                    messageHeader.appendChild(senderName);
                    messageHeader.appendChild(timestamp);
                    
                    const audioPlayer = document.createElement('audio');
                    audioPlayer.controls = true;
                    audioPlayer.style.width = '100%';
                    audioPlayer.src = message.audioData;
                    
                    messageItem.appendChild(messageHeader);
                    messageItem.appendChild(audioPlayer);
                    messagesList.appendChild(messageItem);
                });
            }
        } else {
            const noMessages = document.createElement('p');
            noMessages.textContent = 'Chưa có lời chúc âm thanh nào.';
            noMessages.style.textAlign = 'center';
            noMessages.style.fontStyle = 'italic';
            noMessages.style.color = '#854D27';
            messagesList.appendChild(noMessages);
        }
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(messagesList);
        
        audioModal.appendChild(modalContent);
        document.body.appendChild(audioModal);
    } else {
        // Cập nhật tiêu đề nếu modal đã tồn tại
        const title = audioModal.querySelector('h2');
        title.textContent = birthdayPerson ? `Lời Chúc Gửi Đến ${birthdayPerson}` : 'Lời Chúc Sinh Nhật';
        
        // Cập nhật danh sách tin nhắn
        const messagesList = document.getElementById('audioMessagesList');
        messagesList.innerHTML = '';
        
        const messagesData = localStorage.getItem('birthdayAudioMessages');
        if (messagesData) {
            const messages = JSON.parse(messagesData);
            
            if (messages.length === 0) {
                const noMessages = document.createElement('p');
                noMessages.textContent = 'Chưa có lời chúc âm thanh nào.';
                noMessages.style.textAlign = 'center';
                noMessages.style.fontStyle = 'italic';
                noMessages.style.color = '#854D27';
                messagesList.appendChild(noMessages);
            } else {
                messages.forEach((message, index) => {
                    const messageItem = document.createElement('div');
                    messageItem.style.background = '#F5E6D8';
                    messageItem.style.padding = '15px';
                    messageItem.style.borderLeft = '4px solid #D4B08C';
                    messageItem.style.borderRadius = '0 5px 5px 0';
                    
                    const messageHeader = document.createElement('div');
                    messageHeader.style.display = 'flex';
                    messageHeader.style.justifyContent = 'space-between';
                    messageHeader.style.marginBottom = '10px';
                    
                    const senderName = document.createElement('span');
                    senderName.textContent = message.sender;
                    senderName.style.fontWeight = 'bold';
                    senderName.style.color = '#2C1810';
                    
                    const timestamp = document.createElement('span');
                    timestamp.textContent = new Date(message.timestamp).toLocaleString();
                    timestamp.style.fontSize = '0.8em';
                    timestamp.style.color = '#854D27';
                    
                    messageHeader.appendChild(senderName);
                    messageHeader.appendChild(timestamp);
                    
                    const audioPlayer = document.createElement('audio');
                    audioPlayer.controls = true;
                    audioPlayer.style.width = '100%';
                    audioPlayer.src = message.audioData;
                    
                    messageItem.appendChild(messageHeader);
                    messageItem.appendChild(audioPlayer);
                    messagesList.appendChild(messageItem);
                });
            }
        } else {
            const noMessages = document.createElement('p');
            noMessages.textContent = 'Chưa có lời chúc âm thanh nào.';
            noMessages.style.textAlign = 'center';
            noMessages.style.fontStyle = 'italic';
            noMessages.style.color = '#854D27';
            messagesList.appendChild(noMessages);
        }
    }
    
    audioModal.style.display = 'flex';
}

// Phát tin nhắn âm thanh
function playAudioMessage(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
        console.error('Không thể phát âm thanh:', error);
        alert('Không thể phát âm thanh. Vui lòng thử lại.');
    });
}

// Hiển thị tin nhắn văn bản
function displayCustomMessage(message) {
    const customMessageDisplay = document.getElementById('customMessageDisplay');
    if (customMessageDisplay) {
        customMessageDisplay.innerHTML = `
            <div class="message-bubble">
                <p>${message}</p>
            </div>
        `;
        customMessageDisplay.style.opacity = 1;
    }
}

// Hiển thị tin nhắn văn bản đã lưu
function displaySavedCustomMessage() {
    const savedMessage = localStorage.getItem('customBirthdayMessage');
    if (savedMessage) {
        displayCustomMessage(savedMessage);
    }
}

// Mở modal ghi video
function openVideoMessageModal() {
    let videoModal = document.getElementById('videoMessageModal');
    
    if (!videoModal) {
        videoModal = document.createElement('div');
        videoModal.id = 'videoMessageModal';
        videoModal.style.position = 'fixed';
        videoModal.style.top = '0';
        videoModal.style.left = '0';
        videoModal.style.width = '100%';
        videoModal.style.height = '100%';
        videoModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        videoModal.style.display = 'none';
        videoModal.style.justifyContent = 'center';
        videoModal.style.alignItems = 'center';
        videoModal.style.zIndex = '1000';
        
        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.padding = '30px';
        modalContent.style.border = '3px solid #D4B08C';
        modalContent.style.boxShadow = '10px 10px 0 #D4B08C';
        modalContent.style.maxWidth = '600px';
        modalContent.style.width = '90%';
        modalContent.style.maxHeight = '90vh';
        modalContent.style.overflowY = 'auto';
        modalContent.style.position = 'relative';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '20px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            videoModal.style.display = 'none';
            
            // Dừng stream video nếu đang chạy
            const videoPreview = document.getElementById('videoPreview');
            if (videoPreview.srcObject) {
                videoPreview.srcObject.getTracks().forEach(track => track.stop());
                videoPreview.srcObject = null;
            }
            
            // Dừng ghi video nếu đang ghi
            if (videoRecorder && videoRecorder.state === 'recording') {
                videoRecorder.stop();
            }
        });
        
        const title = document.createElement('h2');
        title.textContent = 'Ghi Video Chúc Mừng';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';
        
        const videoContainer = document.createElement('div');
        videoContainer.style.marginBottom = '20px';
        
        const videoPreview = document.createElement('video');
        videoPreview.id = 'videoPreview';
        videoPreview.width = 540;
        videoPreview.height = 360;
        videoPreview.style.background = '#000';
        videoPreview.style.display = 'block';
        videoPreview.style.maxWidth = '100%';
        videoPreview.style.margin = '0 auto';
        videoPreview.autoplay = true;
        videoPreview.muted = true;
        
        const recordControls = document.createElement('div');
        recordControls.style.display = 'flex';
        recordControls.style.justifyContent = 'center';
        recordControls.style.gap = '10px';
        recordControls.style.marginTop = '20px';
        
        const startVideoBtn = document.createElement('button');
        startVideoBtn.id = 'startVideoBtn';
        startVideoBtn.textContent = '⏺️ Bắt đầu Ghi';
        startVideoBtn.style.padding = '10px 20px';
        startVideoBtn.style.background = '#854D27';
        startVideoBtn.style.color = '#FFF9F3';
        startVideoBtn.style.border = '2px solid #D4B08C';
        startVideoBtn.style.borderRadius = '0';
        startVideoBtn.style.cursor = 'pointer';
        startVideoBtn.style.fontSize = '1.1em';
        startVideoBtn.style.transition = 'all 0.3s';
        startVideoBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        startVideoBtn.addEventListener('click', () => {
            const startButton = document.getElementById('startVideoBtn');
            const videoPreview = document.getElementById('videoPreview');
            const statusText = document.getElementById('videoRecordingStatus');
            
            if (startButton.textContent.includes('Bắt đầu')) {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    alert('Trình duyệt của bạn không hỗ trợ ghi video!');
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
                            
                            // Hiển thị các control để lưu
                            document.getElementById('videoMessageSender').style.display = 'block';
                            document.getElementById('saveVideoBtn').style.display = 'block';
                        };
                        
                        videoRecorder.start();
                        startButton.textContent = '⏹️ Dừng Ghi';
                        statusText.textContent = '⚫ Đang ghi video...';
                        statusText.style.color = '#ff4081';
                    })
                    .catch(error => {
                        console.error('Không thể truy cập camera:', error);
                        alert('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập và thử lại.');
                    });
            } else {
                if (videoRecorder && videoRecorder.state === 'recording') {
                    videoRecorder.stop();
                    videoPreview.srcObject.getTracks().forEach(track => track.stop());
                    
                    startButton.textContent = '🔄 Ghi Lại';
                    statusText.textContent = '✅ Đã ghi video xong';
                    statusText.style.color = '#4CAF50';
                }
            }
        });
        
        const statusText = document.createElement('div');
        statusText.id = 'videoRecordingStatus';
        statusText.textContent = 'Chưa ghi video';
        statusText.style.marginTop = '10px';
        statusText.style.color = '#854D27';
        statusText.style.fontStyle = 'italic';
        statusText.style.textAlign = 'center';
        
        const senderInput = document.createElement('input');
        senderInput.id = 'videoMessageSender';
        senderInput.type = 'text';
        senderInput.placeholder = 'Nhập tên của bạn...';
        senderInput.style.width = '100%';
        senderInput.style.padding = '10px';
        senderInput.style.border = '2px solid #D4B08C';
        senderInput.style.borderRadius = '0';
        senderInput.style.marginTop = '20px';
        senderInput.style.fontFamily = '\'Old Standard TT\', serif';
        senderInput.style.fontSize = '16px';
        senderInput.style.background = '#FFF9F3';
        senderInput.style.color = '#2C1810';
        senderInput.style.display = 'none';
        
        const saveBtn = document.createElement('button');
        saveBtn.id = 'saveVideoBtn';
        saveBtn.textContent = '💾 Lưu Video';
        saveBtn.style.padding = '10px 20px';
        saveBtn.style.background = '#854D27';
        saveBtn.style.color = '#FFF9F3';
        saveBtn.style.border = '2px solid #D4B08C';
        saveBtn.style.borderRadius = '0';
        saveBtn.style.cursor = 'pointer';
        saveBtn.style.fontSize = '1.1em';
        saveBtn.style.transition = 'all 0.3s';
        saveBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        saveBtn.style.marginTop = '20px';
        saveBtn.style.display = 'none';
        saveBtn.addEventListener('click', () => {
            const senderName = document.getElementById('videoMessageSender').value.trim() || 'Ẩn danh';
            const videoName = `Video chúc mừng từ ${senderName}`;
            
            saveVideoMessage(videoBlob, videoName, senderName);
        });
        
        videoContainer.appendChild(videoPreview);
        recordControls.appendChild(startVideoBtn);
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(videoContainer);
        modalContent.appendChild(recordControls);
        modalContent.appendChild(statusText);
        modalContent.appendChild(senderInput);
        modalContent.appendChild(saveBtn);
        
        videoModal.appendChild(modalContent);
        document.body.appendChild(videoModal);
    } else {
        // Reset UI state
        const startButton = document.getElementById('startVideoBtn');
        const videoPreview = document.getElementById('videoPreview');
        const statusText = document.getElementById('videoRecordingStatus');
        const senderInput = document.getElementById('videoMessageSender');
        const saveBtn = document.getElementById('saveVideoBtn');
        
        startButton.textContent = '⏺️ Bắt đầu Ghi';
        videoPreview.srcObject = null;
        videoPreview.src = '';
        videoPreview.muted = true;
        statusText.textContent = 'Chưa ghi video';
        statusText.style.color = '#854D27';
        senderInput.style.display = 'none';
        senderInput.value = '';
        saveBtn.style.display = 'none';
    }
    
    videoModal.style.display = 'flex';
}

// Biến toàn cục cho việc ghi video
let videoRecorder;
let videoChunks = [];
let videoBlob;
let videoUrl;

// Lưu tin nhắn video
function saveVideoMessage(videoData, videoName, senderName) {
    // Chuyển Blob thành Base64 để lưu vào localStorage
    const reader = new FileReader();
    reader.readAsDataURL(videoData);
    reader.onloadend = function() {
        const base64data = reader.result;
        
        // Lấy danh sách tin nhắn hiện có hoặc tạo mảng mới
        const videoMessages = JSON.parse(localStorage.getItem('birthdayVideoMessages') || '[]');
        
        // Thêm tin nhắn mới
        videoMessages.push({
            sender: senderName,
            videoName: videoName,
            videoData: base64data,
            timestamp: new Date().toISOString()
        });
        
        // Lưu lại danh sách
        localStorage.setItem('birthdayVideoMessages', JSON.stringify(videoMessages));
        
        // Đóng modal và hiển thị thông báo
        document.getElementById('videoMessageModal').style.display = 'none';
        alert('Video chúc mừng đã được lưu thành công!');
        
        // Cập nhật hiển thị tin nhắn
        displaySavedVideoMessages();
    };
}

// Hiển thị tin nhắn video đã lưu
function displaySavedVideoMessages() {
    const messagesData = localStorage.getItem('birthdayVideoMessages');
    const birthdayPerson = localStorage.getItem('currentBirthday');
    
    if (messagesData && JSON.parse(messagesData).length > 0) {
        // Nếu có tin nhắn video, thêm nút để xem
        let videoBtn = document.getElementById('viewVideoMessagesBtn');
        
        if (!videoBtn && document.getElementById('customMessageDisplay')) {
            videoBtn = document.createElement('button');
            videoBtn.id = 'viewVideoMessagesBtn';
            videoBtn.textContent = '🎥 Xem Video Chúc Mừng';
            videoBtn.style.padding = '10px 20px';
            videoBtn.style.background = '#854D27';
            videoBtn.style.color = '#FFF9F3';
            videoBtn.style.border = '2px solid #D4B08C';
            videoBtn.style.borderRadius = '0';
            videoBtn.style.cursor = 'pointer';
            videoBtn.style.fontSize = '1.1em';
            videoBtn.style.transition = 'all 0.3s';
            videoBtn.style.boxShadow = '4px 4px 0 #D4B08C';
            videoBtn.style.margin = '10px auto';
            videoBtn.style.display = 'block';
            
            videoBtn.addEventListener('click', () => {
                openVideoMessagesModal(birthdayPerson);
            });
            
            const customMessageDisplay = document.getElementById('customMessageDisplay');
            customMessageDisplay.appendChild(videoBtn);
        }
    }
}

// Mở modal hiển thị tin nhắn video
function openVideoMessagesModal(birthdayPerson) {
    let videoModal = document.getElementById('videoMessagesModal');
    
    if (!videoModal) {
        videoModal = document.createElement('div');
        videoModal.id = 'videoMessagesModal';
        videoModal.style.position = 'fixed';
        videoModal.style.top = '0';
        videoModal.style.left = '0';
        videoModal.style.width = '100%';
        videoModal.style.height = '100%';
        videoModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        videoModal.style.display = 'none';
        videoModal.style.justifyContent = 'center';
        videoModal.style.alignItems = 'center';
        videoModal.style.zIndex = '1000';
        
        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.padding = '30px';
        modalContent.style.border = '3px solid #D4B08C';
        modalContent.style.boxShadow = '10px 10px 0 #D4B08C';
        modalContent.style.maxWidth = '80%';
        modalContent.style.width = '800px';
        modalContent.style.maxHeight = '90vh';
        modalContent.style.overflowY = 'auto';
        modalContent.style.position = 'relative';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '20px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            videoModal.style.display = 'none';
            // Dừng tất cả video đang phát
            document.querySelectorAll('video').forEach(video => video.pause());
        });
        
        const title = document.createElement('h2');
        title.textContent = birthdayPerson ? `Video Chúc Mừng Gửi Đến ${birthdayPerson}` : 'Video Chúc Mừng Sinh Nhật';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';
        
        const messagesList = document.createElement('div');
        messagesList.id = 'videoMessagesList';
        messagesList.style.display = 'flex';
        messagesList.style.flexDirection = 'column';
        messagesList.style.gap = '20px';
        
        // Lấy và hiển thị tin nhắn
        const messagesData = localStorage.getItem('birthdayVideoMessages');
        if (messagesData) {
            const messages = JSON.parse(messagesData);
            
            if (messages.length === 0) {
                const noMessages = document.createElement('p');
                noMessages.textContent = 'Chưa có video chúc mừng nào.';
                noMessages.style.textAlign = 'center';
                noMessages.style.fontStyle = 'italic';
                noMessages.style.color = '#854D27';
                messagesList.appendChild(noMessages);
            } else {
                messages.forEach((message, index) => {
                    const messageItem = document.createElement('div');
                    messageItem.style.background = '#F5E6D8';
                    messageItem.style.padding = '15px';
                    messageItem.style.borderLeft = '4px solid #D4B08C';
                    messageItem.style.borderRadius = '0 5px 5px 0';
                    
                    const messageHeader = document.createElement('div');
                    messageHeader.style.display = 'flex';
                    messageHeader.style.justifyContent = 'space-between';
                    messageHeader.style.marginBottom = '10px';
                    
                    const senderName = document.createElement('span');
                    senderName.textContent = message.sender;
                    senderName.style.fontWeight = 'bold';
                    senderName.style.color = '#2C1810';
                    
                    const timestamp = document.createElement('span');
                    timestamp.textContent = new Date(message.timestamp).toLocaleString();
                    timestamp.style.fontSize = '0.8em';
                    timestamp.style.color = '#854D27';
                    
                    messageHeader.appendChild(senderName);
                    messageHeader.appendChild(timestamp);
                    
                    const videoName = document.createElement('div');
                    videoName.textContent = message.videoName;
                    videoName.style.marginBottom = '10px';
                    videoName.style.fontStyle = 'italic';
                    
                    const videoPlayer = document.createElement('video');
                    videoPlayer.controls = true;
                    videoPlayer.style.width = '100%';
                    videoPlayer.style.maxHeight = '400px';
                    videoPlayer.style.background = '#000';
                    videoPlayer.src = message.videoData;
                    
                    messageItem.appendChild(messageHeader);
                    messageItem.appendChild(videoName);
                    messageItem.appendChild(videoPlayer);
                    messagesList.appendChild(messageItem);
                });
            }
        } else {
            const noMessages = document.createElement('p');
            noMessages.textContent = 'Chưa có video chúc mừng nào.';
            noMessages.style.textAlign = 'center';
            noMessages.style.fontStyle = 'italic';
            noMessages.style.color = '#854D27';
            messagesList.appendChild(noMessages);
        }
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(messagesList);
        
        videoModal.appendChild(modalContent);
        document.body.appendChild(videoModal);
    } else {
        // Cập nhật tiêu đề nếu modal đã tồn tại
        const title = videoModal.querySelector('h2');
        title.textContent = birthdayPerson ? `Video Chúc Mừng Gửi Đến ${birthdayPerson}` : 'Video Chúc Mừng Sinh Nhật';
        
        // Cập nhật danh sách tin nhắn
        const messagesList = document.getElementById('videoMessagesList');
        messagesList.innerHTML = '';
        
        const messagesData = localStorage.getItem('birthdayVideoMessages');
        if (messagesData) {
            const messages = JSON.parse(messagesData);
            
            if (messages.length === 0) {
                const noMessages = document.createElement('p');
                noMessages.textContent = 'Chưa có video chúc mừng nào.';
                noMessages.style.textAlign = 'center';
                noMessages.style.fontStyle = 'italic';
                noMessages.style.color = '#854D27';
                messagesList.appendChild(noMessages);
            } else {
                messages.forEach((message, index) => {
                    const messageItem = document.createElement('div');
                    messageItem.style.background = '#F5E6D8';
                    messageItem.style.padding = '15px';
                    messageItem.style.borderLeft = '4px solid #D4B08C';
                    messageItem.style.borderRadius = '0 5px 5px 0';
                    
                    const messageHeader = document.createElement('div');
                    messageHeader.style.display = 'flex';
                    messageHeader.style.justifyContent = 'space-between';
                    messageHeader.style.marginBottom = '10px';
                    
                    const senderName = document.createElement('span');
                    senderName.textContent = message.sender;
                    senderName.style.fontWeight = 'bold';
                    senderName.style.color = '#2C1810';
                    
                    const timestamp = document.createElement('span');
                    timestamp.textContent = new Date(message.timestamp).toLocaleString();
                    timestamp.style.fontSize = '0.8em';
                    timestamp.style.color = '#854D27';
                    
                    messageHeader.appendChild(senderName);
                    messageHeader.appendChild(timestamp);
                    
                    const videoName = document.createElement('div');
                    videoName.textContent = message.videoName;
                    videoName.style.marginBottom = '10px';
                    videoName.style.fontStyle = 'italic';
                    
                    const videoPlayer = document.createElement('video');
                    videoPlayer.controls = true;
                    videoPlayer.style.width = '100%';
                    videoPlayer.style.maxHeight = '400px';
                    videoPlayer.style.background = '#000';
                    videoPlayer.src = message.videoData;
                    
                    messageItem.appendChild(messageHeader);
                    messageItem.appendChild(videoName);
                    messageItem.appendChild(videoPlayer);
                    messagesList.appendChild(messageItem);
                });
            }
        } else {
            const noMessages = document.createElement('p');
            noMessages.textContent = 'Chưa có video chúc mừng nào.';
            noMessages.style.textAlign = 'center';
            noMessages.style.fontStyle = 'italic';
            noMessages.style.color = '#854D27';
            messagesList.appendChild(noMessages);
        }
    }
    
    videoModal.style.display = 'flex';
}

// Phát tin nhắn video
function playVideoMessage(videoUrl) {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.controls = true;
    video.style.width = '100%';
    video.style.maxHeight = '80vh';
    
    const videoContainer = document.createElement('div');
    videoContainer.style.position = 'fixed';
    videoContainer.style.top = '0';
    videoContainer.style.left = '0';
    videoContainer.style.width = '100%';
    videoContainer.style.height = '100%';
    videoContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    videoContainer.style.display = 'flex';
    videoContainer.style.justifyContent = 'center';
    videoContainer.style.alignItems = 'center';
    videoContainer.style.zIndex = '1100';
    
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '20px';
    closeBtn.style.right = '30px';
    closeBtn.style.fontSize = '40px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = '#fff';
    closeBtn.addEventListener('click', () => {
        video.pause();
        document.body.removeChild(videoContainer);
    });
    
    videoContainer.appendChild(video);
    videoContainer.appendChild(closeBtn);
    document.body.appendChild(videoContainer);
    
    video.play().catch(error => {
        console.error('Không thể phát video:', error);
        alert('Không thể phát video. Vui lòng thử lại.');
    });
}

// Khởi tạo tính năng cộng đồng
function initCommunityFeatures() {
    // Thêm nút Chat Nhóm vào trang
    const container = document.querySelector('.container');
    
    if (container) {
        const chatButton = document.createElement('button');
        chatButton.id = 'openChatBtn';
        chatButton.textContent = '💬 Chat Nhóm';
        chatButton.classList.add('feature-button');
        chatButton.style.position = 'fixed';
        chatButton.style.bottom = '20px';
        chatButton.style.right = '20px';
        chatButton.style.zIndex = '100';
        
        chatButton.addEventListener('click', checkUserNameAndOpenChat);
        
        document.body.appendChild(chatButton);
    }
}

// Kiểm tra tên người dùng và mở chat
function checkUserNameAndOpenChat() {
    const userName = localStorage.getItem('birthdayChatUserName');
    
    if (userName) {
        openChatRoomModal(userName);
    } else {
        openUserNameModal();
    }
}

// Mở modal nhập tên người dùng
function openUserNameModal() {
    let userNameModal = document.getElementById('userNameModal');
    
    if (!userNameModal) {
        userNameModal = document.createElement('div');
        userNameModal.id = 'userNameModal';
        userNameModal.style.position = 'fixed';
        userNameModal.style.top = '0';
        userNameModal.style.left = '0';
        userNameModal.style.width = '100%';
        userNameModal.style.height = '100%';
        userNameModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        userNameModal.style.display = 'none';
        userNameModal.style.justifyContent = 'center';
        userNameModal.style.alignItems = 'center';
        userNameModal.style.zIndex = '1000';
        
        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.padding = '30px';
        modalContent.style.border = '3px solid #D4B08C';
        modalContent.style.boxShadow = '10px 10px 0 #D4B08C';
        modalContent.style.maxWidth = '500px';
        modalContent.style.width = '90%';
        modalContent.style.position = 'relative';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '20px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            userNameModal.style.display = 'none';
        });
        
        const title = document.createElement('h2');
        title.textContent = 'Nhập Tên Của Bạn';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';
        
        const userNameInput = document.createElement('input');
        userNameInput.id = 'chatUserNameInput';
        userNameInput.type = 'text';
        userNameInput.placeholder = 'Tên của bạn...';
        userNameInput.style.width = '100%';
        userNameInput.style.padding = '10px';
        userNameInput.style.border = '2px solid #D4B08C';
        userNameInput.style.borderRadius = '0';
        userNameInput.style.marginBottom = '20px';
        userNameInput.style.fontFamily = '\'Old Standard TT\', serif';
        userNameInput.style.fontSize = '16px';
        userNameInput.style.background = '#FFF9F3';
        userNameInput.style.color = '#2C1810';
        
        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Vào Chat';
        submitBtn.style.padding = '10px 20px';
        submitBtn.style.background = '#854D27';
        submitBtn.style.color = '#FFF9F3';
        submitBtn.style.border = '2px solid #D4B08C';
        submitBtn.style.borderRadius = '0';
        submitBtn.style.cursor = 'pointer';
        submitBtn.style.fontSize = '1.1em';
        submitBtn.style.transition = 'all 0.3s';
        submitBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        submitBtn.style.display = 'block';
        submitBtn.style.margin = '0 auto';
        
        submitBtn.addEventListener('click', () => {
            const userName = document.getElementById('chatUserNameInput').value.trim();
            
            if (userName) {
                localStorage.setItem('birthdayChatUserName', userName);
                userNameModal.style.display = 'none';
                openChatRoomModal(userName);
            } else {
                alert('Vui lòng nhập tên của bạn!');
            }
        });
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(userNameInput);
        modalContent.appendChild(submitBtn);
        
        userNameModal.appendChild(modalContent);
        document.body.appendChild(userNameModal);
    }
    
    // Reset input field
    const userNameInput = document.getElementById('chatUserNameInput');
    if (userNameInput) {
        userNameInput.value = '';
    }
    
    userNameModal.style.display = 'flex';
}

// Mở modal phòng chat
function openChatRoomModal(userName) {
    let chatModal = document.getElementById('chatRoomModal');
    
    if (!chatModal) {
        chatModal = document.createElement('div');
        chatModal.id = 'chatRoomModal';
        chatModal.style.position = 'fixed';
        chatModal.style.bottom = '20px';
        chatModal.style.right = '20px';
        chatModal.style.width = '350px';
        chatModal.style.height = '500px';
        chatModal.style.backgroundColor = '#FFF9F3';
        chatModal.style.border = '3px solid #D4B08C';
        chatModal.style.boxShadow = '10px 10px 0 #D4B08C';
        chatModal.style.display = 'none';
        chatModal.style.flexDirection = 'column';
        chatModal.style.zIndex = '990';
        
        const chatHeader = document.createElement('div');
        chatHeader.style.background = '#854D27';
        chatHeader.style.color = '#FFF9F3';
        chatHeader.style.padding = '10px';
        chatHeader.style.display = 'flex';
        chatHeader.style.justifyContent = 'space-between';
        chatHeader.style.alignItems = 'center';
        
        const chatTitle = document.createElement('h3');
        chatTitle.textContent = 'Chat Nhóm Sinh Nhật';
        chatTitle.style.margin = '0';
        chatTitle.style.fontSize = '1.2em';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.fontSize = '24px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', () => {
            chatModal.style.display = 'none';
        });
        
        const minimizeBtn = document.createElement('span');
        minimizeBtn.textContent = '_';
        minimizeBtn.style.fontSize = '24px';
        minimizeBtn.style.fontWeight = 'bold';
        minimizeBtn.style.cursor = 'pointer';
        minimizeBtn.style.marginRight = '10px';
        minimizeBtn.style.lineHeight = '18px';
        minimizeBtn.addEventListener('click', () => {
            if (chatContent.style.display === 'none') {
                chatContent.style.display = 'flex';
                chatInput.style.display = 'flex';
                chatModal.style.height = '500px';
            } else {
                chatContent.style.display = 'none';
                chatInput.style.display = 'none';
                chatModal.style.height = 'auto';
            }
        });
        
        const headerControls = document.createElement('div');
        headerControls.appendChild(minimizeBtn);
        headerControls.appendChild(closeBtn);
        
        chatHeader.appendChild(chatTitle);
        chatHeader.appendChild(headerControls);
        
        const chatContent = document.createElement('div');
        chatContent.id = 'chatMessages';
        chatContent.style.flex = '1';
        chatContent.style.padding = '10px';
        chatContent.style.overflowY = 'auto';
        chatContent.style.display = 'flex';
        chatContent.style.flexDirection = 'column';
        chatContent.style.gap = '10px';
        
        const chatInput = document.createElement('div');
        chatInput.style.display = 'flex';
        chatInput.style.padding = '10px';
        chatInput.style.borderTop = '2px solid #D4B08C';
        
        const messageInput = document.createElement('input');
        messageInput.id = 'chatMessageInput';
        messageInput.type = 'text';
        messageInput.placeholder = 'Nhập tin nhắn...';
        messageInput.style.flex = '1';
        messageInput.style.padding = '10px';
        messageInput.style.border = '2px solid #D4B08C';
        messageInput.style.borderRight = 'none';
        messageInput.style.borderRadius = '0';
        messageInput.style.fontFamily = '\'Old Standard TT\', serif';
        messageInput.style.fontSize = '16px';
        messageInput.style.background = '#FFF9F3';
        messageInput.style.color = '#2C1810';
        
        const sendBtn = document.createElement('button');
        sendBtn.textContent = '📨';
        sendBtn.style.padding = '10px 15px';
        sendBtn.style.background = '#854D27';
        sendBtn.style.color = '#FFF9F3';
        sendBtn.style.border = '2px solid #D4B08C';
        sendBtn.style.borderRadius = '0';
        sendBtn.style.cursor = 'pointer';
        sendBtn.style.fontSize = '1.1em';
        
        // Xử lý gửi tin nhắn
        const sendMessage = () => {
            const messageText = messageInput.value.trim();
            
            if (messageText) {
                sendChatMessage(userName, messageText);
                messageInput.value = '';
            }
        };
        
        sendBtn.addEventListener('click', sendMessage);
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        chatInput.appendChild(messageInput);
        chatInput.appendChild(sendBtn);
        
        chatModal.appendChild(chatHeader);
        chatModal.appendChild(chatContent);
        chatModal.appendChild(chatInput);
        
        document.body.appendChild(chatModal);
        
        // Tải lịch sử chat
        loadChatHistory();
    }
    
    chatModal.style.display = 'flex';
}

// Tải lịch sử chat
function loadChatHistory() {
    const chatMessages = document.getElementById('chatMessages');
    const messagesData = localStorage.getItem('birthdayChatMessages');
    
    if (chatMessages) {
        chatMessages.innerHTML = '';
        
        if (messagesData) {
            const messages = JSON.parse(messagesData);
            
            messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.style.padding = '10px';
                messageDiv.style.borderRadius = '5px';
                messageDiv.style.maxWidth = '80%';
                messageDiv.style.wordBreak = 'break-word';
                
                if (msg.sender === localStorage.getItem('birthdayChatUserName')) {
                    messageDiv.style.alignSelf = 'flex-end';
                    messageDiv.style.background = '#D4B08C';
                    messageDiv.style.color = '#2C1810';
                } else {
                    messageDiv.style.alignSelf = 'flex-start';
                    messageDiv.style.background = '#F5E6D8';
                    messageDiv.style.color = '#2C1810';
                }
                
                const senderSpan = document.createElement('div');
                senderSpan.textContent = msg.sender;
                senderSpan.style.fontWeight = 'bold';
                senderSpan.style.marginBottom = '5px';
                senderSpan.style.fontSize = '0.9em';
                
                const timeSpan = document.createElement('div');
                timeSpan.textContent = new Date(msg.timestamp).toLocaleTimeString();
                timeSpan.style.fontSize = '0.7em';
                timeSpan.style.textAlign = 'right';
                timeSpan.style.marginTop = '5px';
                
                messageDiv.appendChild(senderSpan);
                messageDiv.appendChild(document.createTextNode(msg.text));
                messageDiv.appendChild(timeSpan);
                
                chatMessages.appendChild(messageDiv);
            });
            
            // Cuộn xuống tin nhắn mới nhất
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
}

// Gửi tin nhắn chat
function sendChatMessage(sender, text) {
    // Lấy danh sách tin nhắn hiện có hoặc tạo mảng mới
    const chatMessages = JSON.parse(localStorage.getItem('birthdayChatMessages') || '[]');
    
    // Thêm tin nhắn mới
    chatMessages.push({
        sender: sender,
        text: text,
        timestamp: new Date().toISOString()
    });
    
    // Lưu lại danh sách
    localStorage.setItem('birthdayChatMessages', JSON.stringify(chatMessages));
    
    // Cập nhật hiển thị
    loadChatHistory();
}

// Khởi tạo tính năng mời bạn bè
function initInviteFriends() {
    // Thêm nút Mời Bạn Bè vào trang
    const container = document.querySelector('.container');
    
    if (container) {
        const inviteButton = document.createElement('button');
        inviteButton.id = 'inviteFriendsBtn';
        inviteButton.textContent = '👥 Mời Bạn Bè';
        inviteButton.classList.add('feature-button');
        inviteButton.style.position = 'fixed';
        inviteButton.style.bottom = '70px';
        inviteButton.style.right = '20px';
        inviteButton.style.zIndex = '100';
        
        inviteButton.addEventListener('click', openInviteModal);
        
        document.body.appendChild(inviteButton);
    }
}

// Mở modal mời bạn bè
function openInviteModal() {
    let inviteModal = document.getElementById('inviteModal');
    
    if (!inviteModal) {
        inviteModal = document.createElement('div');
        inviteModal.id = 'inviteModal';
        inviteModal.style.position = 'fixed';
        inviteModal.style.top = '0';
        inviteModal.style.left = '0';
        inviteModal.style.width = '100%';
        inviteModal.style.height = '100%';
        inviteModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        inviteModal.style.display = 'none';
        inviteModal.style.justifyContent = 'center';
        inviteModal.style.alignItems = 'center';
        inviteModal.style.zIndex = '1000';
        
        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.padding = '30px';
        modalContent.style.border = '3px solid #D4B08C';
        modalContent.style.boxShadow = '10px 10px 0 #D4B08C';
        modalContent.style.maxWidth = '500px';
        modalContent.style.width = '90%';
        modalContent.style.position = 'relative';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '20px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            inviteModal.style.display = 'none';
        });
        
        const title = document.createElement('h2');
        title.textContent = 'Mời Bạn Bè Tham Gia';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';
        
        const description = document.createElement('p');
        description.textContent = 'Gửi lời mời đến bạn bè để cùng tham gia chúc mừng sinh nhật!';
        description.style.marginBottom = '20px';
        
        const linkSection = document.createElement('div');
        linkSection.style.marginBottom = '30px';
        
        const linkLabel = document.createElement('div');
        linkLabel.textContent = 'Đường dẫn mời:';
        linkLabel.style.fontWeight = 'bold';
        linkLabel.style.marginBottom = '10px';
        
        const linkDisplay = document.createElement('div');
        linkDisplay.style.display = 'flex';
        linkDisplay.style.marginBottom = '10px';
        
        const linkInput = document.createElement('input');
        linkInput.id = 'inviteLinkInput';
        linkInput.type = 'text';
        linkInput.readOnly = true;
        linkInput.value = generateInviteLink();
        linkInput.style.flex = '1';
        linkInput.style.padding = '10px';
        linkInput.style.border = '2px solid #D4B08C';
        linkInput.style.borderRight = 'none';
        linkInput.style.borderRadius = '0';
        linkInput.style.fontFamily = '\'Old Standard TT\', serif';
        linkInput.style.fontSize = '14px';
        linkInput.style.background = '#FFF9F3';
        linkInput.style.color = '#2C1810';
        
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋 Sao chép';
        copyBtn.style.padding = '10px 15px';
        copyBtn.style.background = '#854D27';
        copyBtn.style.color = '#FFF9F3';
        copyBtn.style.border = '2px solid #D4B08C';
        copyBtn.style.borderRadius = '0';
        copyBtn.style.cursor = 'pointer';
        copyBtn.style.fontSize = '0.9em';
        copyBtn.addEventListener('click', () => {
            linkInput.select();
            document.execCommand('copy');
            copyBtn.textContent = '✓ Đã sao chép';
            setTimeout(() => {
                copyBtn.textContent = '📋 Sao chép';
            }, 2000);
        });
        
        linkDisplay.appendChild(linkInput);
        linkDisplay.appendChild(copyBtn);
        
        const shareLabel = document.createElement('div');
        shareLabel.textContent = 'Chia sẻ qua:';
        shareLabel.style.fontWeight = 'bold';
        shareLabel.style.marginBottom = '10px';
        shareLabel.style.marginTop = '20px';
        
        const socialShare = document.createElement('div');
        socialShare.style.display = 'flex';
        socialShare.style.gap = '10px';
        socialShare.style.marginBottom = '20px';
        
        const platforms = [
            { name: 'Facebook', icon: 'facebook-f', color: '#1877f2' },
            { name: 'Twitter', icon: 'x-twitter', color: '#000000' },
            { name: 'WhatsApp', icon: 'whatsapp', color: '#25D366' }
        ];
        
        platforms.forEach(platform => {
            const shareBtn = document.createElement('button');
            shareBtn.innerHTML = `<i class="fab fa-${platform.icon}"></i>`;
            shareBtn.style.width = '40px';
            shareBtn.style.height = '40px';
            shareBtn.style.borderRadius = '50%';
            shareBtn.style.background = '#fff';
            shareBtn.style.border = `2px solid ${platform.color}`;
            shareBtn.style.color = platform.color;
            shareBtn.style.fontSize = '1.2em';
            shareBtn.style.cursor = 'pointer';
            shareBtn.style.display = 'flex';
            shareBtn.style.justifyContent = 'center';
            shareBtn.style.alignItems = 'center';
            shareBtn.title = `Chia sẻ qua ${platform.name}`;
            
            shareBtn.addEventListener('click', () => {
                const link = linkInput.value;
                let shareUrl = '';
                
                switch (platform.name) {
                    case 'Facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
                        break;
                    case 'Twitter':
                        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Tham gia chúc mừng sinh nhật với tôi!')}`;
                        break;
                    case 'WhatsApp':
                        shareUrl = `https://wa.me/?text=${encodeURIComponent('Tham gia chúc mừng sinh nhật với tôi! ' + link)}`;
                        break;
                }
                
                window.open(shareUrl, '_blank');
            });
            
            socialShare.appendChild(shareBtn);
        });
        
        const emailSection = document.createElement('div');
        
        const emailLabel = document.createElement('div');
        emailLabel.textContent = 'Gửi lời mời qua email:';
        emailLabel.style.fontWeight = 'bold';
        emailLabel.style.marginBottom = '10px';
        
        const emailInput = document.createElement('input');
        emailInput.id = 'inviteEmailInput';
        emailInput.type = 'email';
        emailInput.placeholder = 'Email người nhận...';
        emailInput.style.width = '100%';
        emailInput.style.padding = '10px';
        emailInput.style.border = '2px solid #D4B08C';
        emailInput.style.borderRadius = '0';
        emailInput.style.marginBottom = '10px';
        emailInput.style.fontFamily = '\'Old Standard TT\', serif';
        emailInput.style.fontSize = '16px';
        emailInput.style.background = '#FFF9F3';
        emailInput.style.color = '#2C1810';
        
        const messageInput = document.createElement('textarea');
        messageInput.id = 'inviteMessageInput';
        messageInput.placeholder = 'Tin nhắn cá nhân (tùy chọn)...';
        messageInput.style.width = '100%';
        messageInput.style.padding = '10px';
        messageInput.style.border = '2px solid #D4B08C';
        messageInput.style.borderRadius = '0';
        messageInput.style.marginBottom = '10px';
        messageInput.style.fontFamily = '\'Old Standard TT\', serif';
        messageInput.style.fontSize = '16px';
        messageInput.style.background = '#FFF9F3';
        messageInput.style.color = '#2C1810';
        messageInput.style.resize = 'vertical';
        messageInput.style.minHeight = '100px';
        
        const sendEmailBtn = document.createElement('button');
        sendEmailBtn.textContent = '📧 Gửi Lời Mời';
        sendEmailBtn.style.padding = '10px 20px';
        sendEmailBtn.style.background = '#854D27';
        sendEmailBtn.style.color = '#FFF9F3';
        sendEmailBtn.style.border = '2px solid #D4B08C';
        sendEmailBtn.style.borderRadius = '0';
        sendEmailBtn.style.cursor = 'pointer';
        sendEmailBtn.style.fontSize = '1.1em';
        sendEmailBtn.style.transition = 'all 0.3s';
        sendEmailBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        sendEmailBtn.style.display = 'block';
        sendEmailBtn.style.margin = '0 auto';
        
        sendEmailBtn.addEventListener('click', () => {
            const email = emailInput.value.trim();
            const message = messageInput.value.trim();
            
            if (email) {
                sendInviteEmail(email, message);
                emailInput.value = '';
                messageInput.value = '';
            } else {
                alert('Vui lòng nhập email người nhận!');
            }
        });
        
        emailSection.appendChild(emailLabel);
        emailSection.appendChild(emailInput);
        emailSection.appendChild(messageInput);
        emailSection.appendChild(sendEmailBtn);
        
        linkSection.appendChild(linkLabel);
        linkSection.appendChild(linkDisplay);
        linkSection.appendChild(shareLabel);
        linkSection.appendChild(socialShare);
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(description);
        modalContent.appendChild(linkSection);
        modalContent.appendChild(emailSection);
        
        inviteModal.appendChild(modalContent);
        document.body.appendChild(inviteModal);
    }
    
    inviteModal.style.display = 'flex';
}

// Tạo liên kết mời
function generateInviteLink() {
    return window.location.href;
}

// Gửi email mời
function sendInviteEmail(email, message) {
    const link = generateInviteLink();
    const subject = 'Lời mời tham gia chúc mừng sinh nhật';
    const defaultMessage = 'Chào bạn,\n\nMình mời bạn tham gia để cùng chúc mừng sinh nhật! Hãy nhấn vào liên kết dưới đây để tham gia:\n\n';
    const fullMessage = defaultMessage + link + (message ? '\n\n' + message : '');
    
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`;
    window.open(mailtoLink);
}
