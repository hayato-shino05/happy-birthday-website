// Set your birthday here (month is 0-indexed: 0 = January, 11 = December)
const birthdayMonth = 1;  // Tháng 1
const birthdayDay = 15;   // Ngày 15

// Add styles
const style = document.createElement('style');
style.textContent = `
    .countdown {
        transition: all 1s ease-in-out;
    }
    
    .birthday-title {
        font-family: 'Dancing Script', cursive;
        font-size: 3.5em;
        color: #ff6b81;
        text-shadow: 3px 3px 6px rgba(0,0,0,0.1);
        margin: 0;
        padding: 20px;
        animation: birthdayPop 1.5s ease-out;
    }

    .cake {
        position: relative;
        width: 250px;
        height: 200px;
        margin: 0 auto;
    }

    .cake-base {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 60px;
        background: linear-gradient(to right, #ff99b6, #ff6b81);
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .cake-middle {
        position: absolute;
        bottom: 60px;
        width: 80%;
        height: 50px;
        left: 10%;
        background: linear-gradient(to right, #ffb3c6, #ff8095);
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .cake-top {
        position: absolute;
        bottom: 110px;
        width: 60%;
        height: 40px;
        left: 20%;
        background: linear-gradient(to right, #ffc9d6, #ff99aa);
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .candle {
        position: absolute;
        bottom: 150px;
        left: 50%;
        transform: translateX(-50%);
        width: 10px;
        height: 30px;
        background: linear-gradient(to right, #fff, #ffd3d3);
        border-radius: 5px;
    }

    .flame {
        position: absolute;
        bottom: 180px;
        left: 50%;
        transform: translateX(-50%);
        width: 16px;
        height: 20px;
        background: #ffd700;
        border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
        animation: flicker 0.5s infinite alternate;
        transition: opacity 0.3s;
    }

    @keyframes flicker {
        0% { transform: translateX(-50%) scale(1); }
        100% { transform: translateX(-50%) scale(1.1); }
    }
    
    @keyframes birthdayPop {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); opacity: 1; }
    }

    .hidden {
        display: none !important;
    }

    .album-button {
        background: #ff6b81;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s;
        font-size: 16px;
        margin: 10px;
    }

    .album-button:hover {
        background: #ff8095;
        transform: scale(1.05);
    }

    .album-button.active {
        background: #ff99aa;
    }

    .balloon {
        position: fixed;
        width: 80px;
        height: 100px;
        transition: all 0.3s;
    }

    @keyframes float {
        0% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
        100% { transform: translateY(0); }
    }

    .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        background-color: #f00;
        pointer-events: none;
        opacity: 0;
    }

    @keyframes confettiFall {
        0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
`;
document.head.appendChild(style);

function updateCountdown() {
    const now = new Date();
    let birthday = new Date(now.getFullYear(), birthdayMonth, birthdayDay);

    if (now > birthday) {
        birthday = new Date(now.getFullYear() + 1, birthdayMonth, birthdayDay);
    }

    const diff = birthday - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const countdownElement = document.getElementById('countdown');

    if (now.getMonth() === birthdayMonth && now.getDate() === birthdayDay) {
        countdownElement.style.transform = 'scale(0)';
        countdownElement.style.opacity = '0';
        
        setTimeout(() => {
            countdownElement.style.display = 'none';
            showBirthdayContent();
            playBirthdayMusic();
        }, 1000);
    } else {
        countdownElement.innerHTML = `
            <div class="time">
                <span id="days">${days}</span> ngày
                <span id="hours">${hours}</span> giờ
                <span id="minutes">${minutes}</span> phút
                <span id="seconds">${seconds}</span> giây
            </div>
        `;
    }
}

function showBirthdayContent() {
    document.getElementById('countdown').classList.add('hidden');
    document.getElementById('birthdayContent').classList.remove('hidden');
    document.getElementById('flame').style.opacity = 1;
    document.getElementById('birthdayMessage').style.opacity = 1;
    document.getElementById('birthdayMessage').style.transform = 'translateY(0)';
    document.getElementById('micPermissionBtn').style.display = 'inline-block';
    document.querySelector('.countdown-container').style.display = 'none';
    document.querySelector('.cake-container').style.display = 'block';
    document.querySelector('.birthday-message').style.display = 'block';

    document.body.style.background = 'linear-gradient(135deg, #ffe6eb 0%, #ffb8c6 100%)';
    createBalloons();
    createConfetti();

    // Show birthday title
    const titleElement = document.createElement('h1');
    titleElement.className = 'birthday-title';
    titleElement.textContent = 'Chúc Mừng Sinh Nhật! 🎉';
    document.getElementById('birthdayContent').prepend(titleElement);
}

let blowProgress = 0;
let audioContext, analyser, microphone, javascriptNode;

document.getElementById('micPermissionBtn').addEventListener('click', function() {
    setupAudioAnalysis();
    this.style.display = 'none';
    document.getElementById('blowButton').style.display = 'inline-block';
    document.getElementById('audioFeedback').style.display = 'block';
    document.getElementById('progressContainer').style.display = 'block';
});

function setupAudioAnalysis() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Trình duyệt của bạn không hỗ trợ thu âm!');
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            microphone = audioContext.createMediaStreamSource(stream);
            javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

            analyser.smoothingTimeConstant = 0.8;
            analyser.fftSize = 1024;

            microphone.connect(analyser);
            analyser.connect(javascriptNode);
            javascriptNode.connect(audioContext.destination);

            const canvas = document.getElementById('audioFeedback');
            const canvasContext = canvas.getContext('2d');
            canvas.width = 300;
            canvas.height = 60;

            javascriptNode.onaudioprocess = function() {
                const array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);

                let average = 0;
                for (let i = 0; i < array.length; i++) {
                    average += array[i];
                }
                average = average / array.length;

                if (average > 10) {
                    blowProgress += (average / 50);
                    blowProgress = Math.min(blowProgress, 100);
                    updateBlowProgress();

                    if (blowProgress >= 100) {
                        blowOutCandle();
                        disconnectAudio();
                    }
                } else {
                    blowProgress -= 0.2;
                    blowProgress = Math.max(blowProgress, 0);
                    updateBlowProgress();
                }

                // Canvas visualization
                canvasContext.clearRect(0, 0, canvas.width, canvas.height);
                const gradient = canvasContext.createLinearGradient(0, 0, canvas.width, 0);
                gradient.addColorStop(0, '#74ebd5');
                gradient.addColorStop(1, '#9face6');
                canvasContext.fillStyle = gradient;
                canvasContext.fillRect(0, 0, canvas.width, canvas.height);

                const barWidth = 3;
                const barSpacing = 1;
                const totalBars = Math.floor(canvas.width / (barWidth + barSpacing));

                for (let i = 0; i < totalBars; i++) {
                    const barHeight = (array[i] || 0) / 256 * canvas.height;
                    const barGradient = canvasContext.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
                    barGradient.addColorStop(0, '#ff6b81');
                    barGradient.addColorStop(1, '#ff92a3');
                    canvasContext.fillStyle = barGradient;
                    canvasContext.fillRect(
                        i * (barWidth + barSpacing),
                        canvas.height - barHeight,
                        barWidth,
                        barHeight
                    );
                }
            };
        })
        .catch(function(err) {
            console.error('Không thể truy cập microphone: ', err);
            alert('Không thể truy cập microphone. Hãy thử lại.');
        });
}

function updateBlowProgress() {
    const progressBar = document.getElementById('blowProgress');
    progressBar.style.width = blowProgress + '%';
    progressBar.textContent = Math.round(blowProgress) + '%';
}

function disconnectAudio() {
    if (javascriptNode) javascriptNode.disconnect();
    if (analyser) analyser.disconnect();
    if (microphone) microphone.disconnect();
    if (audioContext && audioContext.state !== 'closed') audioContext.close();
}

let buttonClickCount = 0;
document.getElementById('blowButton').addEventListener('click', function() {
    buttonClickCount++;
    blowProgress += 20;
    updateBlowProgress();

    if (buttonClickCount >= 5) {
        blowOutCandle();
        disconnectAudio();
    } else {
        this.textContent = `Thổi mạnh hơn! (${buttonClickCount}/5)`;
    }
});

function blowOutCandle() {
    const flame = document.getElementById('flame');
    flame.style.animation = 'flicker 0.2s infinite alternate';
    
    setTimeout(() => {
        flame.style.opacity = 0;
        document.getElementById('blowButton').style.display = 'none';
        document.getElementById('audioFeedback').style.display = 'none';
        document.getElementById('progressContainer').style.display = 'none';
        
        playSound();
        createMoreConfetti();
        
        const message = document.getElementById('birthdayMessage');
        message.innerHTML = 'Chúc mừng sinh nhật! 🎉<br>Bạn đã thổi tắt nến thành công!<br>Hy vọng mọi điều ước của bạn sẽ thành hiện thực!';
        message.style.fontSize = '1.8em';
        message.style.color = '#ff4081';
        message.style.animation = 'pulse 2s infinite';
    }, 500);
}

function createConfetti() {
    const container = document.querySelector('.container');
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = getRandomColor();
            confetti.style.opacity = 1;

            if (i % 4 === 0) {
                confetti.style.borderRadius = '50%';
            } else if (i % 4 === 1) {
                confetti.style.width = '7px';
                confetti.style.height = '14px';
            } else if (i % 4 === 2) {
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.transform = 'rotate(45deg)';
            }

            const animationDuration = Math.random() * 3 + 2;
            confetti.style.animation = `confettiFall ${animationDuration}s linear forwards`;

            document.body.appendChild(confetti);

            setTimeout(() => {
                confetti.remove();
            }, animationDuration * 1000);
        }, i * 50);
    }
}

function createMoreConfetti() {
    for (let i = 0; i < 5; i++) {
        setTimeout(createConfetti, i * 300);
    }
}

function getRandomColor() {
    const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#ff99c8', '#9b5de5', '#00bbf9'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function playBirthdayMusic() {
    const audio = new Audio('happy-birthday.mp3');
    audio.loop = true;
    
    // Add play button for user interaction
    const playButton = document.createElement('button');
    playButton.className = 'album-button';
    playButton.innerHTML = '🎵 Phát nhạc';
    playButton.onclick = () => {
        if (audio.paused) {
            audio.play();
            playButton.innerHTML = '⏸️ Tạm dừng';
        } else {
            audio.pause();
            playButton.innerHTML = '🎵 Phát nhạc';
        }
    };
    document.body.appendChild(playButton);

    // Auto-play music
    audio.play().catch(e => {
        console.log('Auto-play prevented:', e);
        // Button will still be available for manual play
    });
}

function playSound() {
    try {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18A';

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const note = new Audio();
                note.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18A';
                note.play().catch(e => console.log("Auto-play prevented: ", e));
            }, i * 200);
        }
    } catch (e) {
        console.log("Sound play error: ", e);
    }
}

function initPhotoAlbum() {
    const albumBtn = document.getElementById('openAlbum');
    const memoryWall = document.getElementById('memoryWall');
    let isOpen = false;

    albumBtn.addEventListener('click', () => {
        if (!isOpen) {
            memoryWall.style.display = 'block';
            loadSamplePhotos();
            albumBtn.classList.add('active');
        } else {
            memoryWall.style.display = 'none';
            albumBtn.classList.remove('active');
        }
        isOpen = !isOpen;
    });

    memoryWall.addEventListener('click', (e) => {
        if (e.target === memoryWall) {
            memoryWall.style.display = 'none';
            albumBtn.classList.remove('active');
            isOpen = false;
        }
    });
}

function loadSamplePhotos() {
    const gallery = document.getElementById('photoGallery');
    gallery.innerHTML = '';

    for (let i = 0; i < 12; i++) {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.innerHTML = `
            <img src="/api/placeholder/200/200" alt="Birthday memory ${i + 1}">
        `;
        gallery.appendChild(photoItem);
    }
}

function createBalloons() {
    const colors = ['#ff6b6b', '#7dd3fc', '#ffd166', '#a5d8ff', '#ffd3da', '#c2f0c2'];
    const balloonContainer = document.getElementById('balloonContainer');

    balloonContainer.innerHTML = '';

    const positions = [
        {left: '5%', top: '10%'},
        {left: '12%', top: '25%'},
        {left: '8%', top: '60%'},
        {left: '20%', top: '80%'},
        {left: '85%', top: '15%'},
        {left: '92%', top: '30%'},
        {left: '88%', top: '65%'},
        {left: '78%', top: '75%'},
        {left: '30%', top: '5%'},
        {left: '70%', top: '8%'},
        {left: '10%', top: '40%'},
        {left: '90%', top: '45%'}
    ];

    for (let i = 0; i < positions.length; i++) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 50 60');
        svg.style.width = '100%';
        svg.style.height = '100%';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M25,1 C13,1 5,12 5,25 C5,38 13,47 25,47 C37,47 45,38 45,25 C45,12 37,1 25,1 Z');
        path.setAttribute('fill', colors[i % colors.length]);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('d', 'M25,47 C26,55 24,55 25,60');
        line.setAttribute('stroke', '#888');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('fill', 'none');

        svg.appendChild(path);
        svg.appendChild(line);
        balloon.appendChild(svg);
        balloonContainer.appendChild(balloon);

        balloon.style.left = positions[i].left;
        balloon.style.top = positions[i].top;

        const size = 70 + Math.random() * 30;
        balloon.style.width = size + 'px';
        balloon.style.height = Math.floor(size * 1.2) + 'px';

        balloon.style.opacity = 0.8;
        balloon.style.animation = `float ${Math.random() * 2 + 4}s ease-in-out infinite`;
        balloon.style.animationDelay = Math.random() * 5 + 's';
    }
}

window.onload = function() {
    updateCountdown();
    const now = new Date();
    if (now.getMonth() === birthdayMonth && now.getDate() === birthdayDay) {
        showBirthdayContent();
    }
    setInterval(updateCountdown, 1000);
    
    initPhotoAlbum();
    initGames();
    initSocialShare();
    initMusicPlayer();
};