const birthdays = [
    {
        name: "Dũng",
        month: 12,
        day: 7,
        messages: [
            "🎉 Ê Dũng, sinh nhật vui quá nha mày! 🎉",
            "Chúc mày tuổi mới kiếm được thật nhiều tiền, yêu thật nhiều gái xinh nha ku!",
            "HAPPY BIRTHDAY thằng bạn vàng! Lớn thêm tuổi mà bớt khùng lại giùm tao nha!"
        ]
    },
    {
        name: "Thành",
        month: 2,
        day: 22,
        messages: [
            "🎂 Chúc mừng sinh nhật nha cu 🎂",
            "Chúc mày tuổi mới vui vẻ, thành công rực rỡ nha!",
            "HAPPY BIRTHDAY Thành, sống khỏe sống vui nha mày!"
        ]
    },
    {
        name: "Đức",
        month: 8,
        day: 19,
        messages: [
            "🎈 Đức ơi, sinh nhật mày tới rồi kìa, quẩy tung nóc đi nha! 🎈",
            "Chúc thằng bạn tao tuổi mới đẹp trai hơn tao, giàu hơn tao chút xíu thôi nha!",
            "Ê ku, chúc mày sinh nhật vui, bớt cà khịa tao để tao còn sống với!"
        ]
    },
    {
        name: "Tiển",
        month: 7,
        day: 26,
        messages: [
            "🎉 Tiển ơi, sinh nhật mày phải quẩy cho đã nha thằng khỉ! 🎉",
            "Chúc mày tuổi mới bớt lầy, bớt troll tao mà sống tử tế hơn nha!",
            "Sinh nhật vui nha ku, chúc mày năm nay thoát ế để tao đỡ phải chở mày đi chơi!"
        ]
    },
    {
        name: "Diệu",
        month: 8,
        day: 5,
        messages: [
            "🎂 Diệu xinh đẹp, sinh nhật vui nha nhỏ bạn! 🎂",
            "Chúc mày tuổi mới xinh hơn cả hoa hậu, yêu tao nhiều hơn nữa nha!",
            "Ê nhỏ, sinh nhật vui vẻ, chúc mày bớt đanh đá để tụi tao còn sống nha!"
        ]
    },
    {
        name: "Hiền",
        month: 12,
        day: 30,
        messages: [
            "🎈 Hiền ơi, sinh nhật mày quẩy tưng bừng luôn nha! 🎈",
            "Chúc nhỏ bạn tao tuổi mới vừa xinh vừa ngoan, bớt chửi tao nha mạy!",
            "Sinh nhật vui nha nhỏ, chúc mày năm nay kiếm được bồ ngon hơn bồ tao!"
        ]
    },
    {
        name: "Uyên",
        month: 12, 
        day: 29,  
        messages: [
            "🎉 Uyên ơi, sinh nhật mày tới rồi, quẩy banh nóc đi nha nhỏ! 🎉",
            "Chúc mày tuổi mới xinh như mộng, bớt lầy để tao còn chơi với mày nha!",
            "Ê nhỏ bạn, sinh nhật vui nha, chúc mày năm nay kiếm được bồ xịn hơn tao!"
        ]
    },
    {
        name: "Như",
        month: 12, 
        day: 12,  
        messages: [
            "🎉 Như ơi, sinh nhật mày tới rồi, quẩy banh nóc đi nha nhỏ! 🎉",
            "Chúc mày tuổi mới xinh như mộng, bớt lầy để tao còn chơi với mày nha!",
            "Ê nhỏ bạn, sinh nhật vui nha, chúc mày năm nay kiếm được bồ xịn hơn tao!"
        ]
    }
];

// Lấy ngẫu nhiên một message từ danh sách
function getRandomMessage(messages) {
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
}

// Kiểm tra xem có phải ngày sinh nhật không
function checkIfBirthday(date) {
    return birthdays.find(person => 
        date.getMonth() === person.month - 1 && 
        date.getDate() === person.day
    );
}

// Tìm sinh nhật tiếp theo
function findNextBirthday(currentDate) {
    let nearestPerson = null;
    let nearestDate = null;
    let smallestDiff = Infinity;

    for (const person of birthdays) {
        let birthday = new Date(currentDate.getFullYear(), person.month - 1, person.day);
        if (currentDate > birthday) {
            birthday = new Date(currentDate.getFullYear() + 1, person.month - 1, person.day);
        }

        const diff = birthday - currentDate;
        if (diff < smallestDiff) {
            smallestDiff = diff;
            nearestDate = birthday;
            nearestPerson = person;
        }
    }

    return { person: nearestPerson, date: nearestDate };
}

// Hiển thị đếm ngược
function displayCountdown(targetDate, person) {
    const now = new Date();
    const diff = targetDate - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        countdownElement.classList.remove('hidden');
        countdownElement.innerHTML = `
            <h1>Đếm Ngược Đến Sinh Nhật ${person.name}</h1>
            <div class="time">
                <span id="days">${days}</span> ngày
                <span id="hours">${hours}</span> giờ
                <span id="minutes">${minutes}</span> phút
                <span id="seconds">${seconds}</span> giây
            </div>
        `;
    }
}

// Cập nhật đếm ngược
function updateCountdownTime() {
    const now = new Date();
    const birthdayPerson = checkIfBirthday(now);

    if (!birthdayPerson) {
        const nextBirthday = findNextBirthday(now);
        if (nextBirthday.person) {
            displayCountdown(nextBirthday.date, nextBirthday.person);
        }
    }
}

// Kiểm tra và hiển thị sinh nhật ngay khi tải trang
function checkAndShowBirthdayOnLoad() {
    const now = new Date();
    const birthdayPerson = checkIfBirthday(now);

    if (birthdayPerson) {
        const today = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
        localStorage.setItem('lastBirthdayShown', today);
        localStorage.setItem('currentBirthday', birthdayPerson.name);
        showBirthdayContent(birthdayPerson);
    } else {
        localStorage.removeItem('lastBirthdayShown');
        localStorage.removeItem('currentBirthday');
        updateCountdownTime();
    }
}

// Hiển thị nội dung sinh nhật
function showBirthdayContent(birthdayPerson) {
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        countdownElement.classList.add('hidden');
    }

    const birthdayContent = document.getElementById('birthdayContent');
    if (birthdayContent) {
        birthdayContent.classList.remove('hidden');
    }

    const birthdayTitle = document.getElementById('birthdayTitle');
    if (birthdayTitle) {
        birthdayTitle.textContent = `Chúc Mừng Sinh Nhật ${birthdayPerson.name}!`;
        birthdayTitle.style.display = 'block';
        birthdayTitle.style.opacity = '1';
    }

    const message = getRandomMessage(birthdayPerson.messages);
    const birthdayMessage = document.getElementById('birthdayMessage');
    if (birthdayMessage) {
        birthdayMessage.textContent = message;
        birthdayMessage.style.display = 'block';
        birthdayMessage.style.opacity = '1';
        birthdayMessage.style.transform = 'translateY(0)';
    }

    document.getElementById('flame')?.style.opacity = '1';
    document.getElementById('micPermissionBtn')?.style.display = 'inline-block';
    document.querySelector('.countdown-container')?.style.display = 'none';
    document.querySelector('.cake-container')?.style.display = 'block';
    document.querySelector('.birthday-message')?.style.display = 'block';

    document.body.style.background = 'linear-gradient(135deg, #ffe6eb 0%, #ffb8c6 100%)';

    createBalloons();
    createConfetti();
    playBirthdayMusic();
}

// Thêm CSS động
const style = document.createElement('style');
style.textContent = `
    .countdown { transition: all 1s ease-in-out; }
    .birthday-title {
        font-family: 'Dancing Script', cursive;
        font-size: 3.5em;
        color: #ff6b81;
        text-shadow: 3px 3px 6px rgba(0,0,0,0.1);
        margin: 0;
        padding: 20px;
        animation: birthdayPop 1.5s ease-out;
    }
    @keyframes birthdayPop {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); opacity: 1; }
    }
    .balloon {
        position: absolute;
        z-index: 10;
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
        z-index: 1000;
    }
    @keyframes confettiFall {
        0% { transform: translateY(-100vh) rotate(0deg); }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Phát nhạc sinh nhật
function playBirthdayMusic() {
    const audio = new Audio('happy-birthday.mp3');
    audio.play().catch(e => {
        console.log('Auto-play prevented:', e);
        const playButton = document.getElementById('playMusic');
        if (playButton) playButton.textContent = '▶️';
    });
}

// Tạo bóng bay
function createBalloons() {
    const colors = ['#ff6b6b', '#7dd3fc', '#ffd166', '#a5d8ff', '#ffd3da', '#c2f0c2'];
    const balloonContainer = document.getElementById('balloonContainer') || document.body;

    balloonContainer.innerHTML = '';

    const positions = [
        {left: '5%', top: '10%'}, {left: '12%', top: '25%'}, {left: '8%', top: '60%'},
        {left: '20%', top: '80%'}, {left: '85%', top: '15%'}, {left: '92%', top: '30%'},
        {left: '88%', top: '65%'}, {left: '78%', top: '75%'}, {left: '30%', top: '5%'},
        {left: '70%', top: '8%'}, {left: '10%', top: '40%'}, {left: '90%', top: '45%'}
    ];

    positions.forEach((pos, i) => {
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

        balloon.style.left = pos.left;
        balloon.style.top = pos.top;

        const size = 70 + Math.random() * 30;
        balloon.style.width = size + 'px';
        balloon.style.height = Math.floor(size * 1.2) + 'px';

        balloon.style.opacity = 0.8;
        balloon.style.animation = `float ${Math.random() * 2 + 4}s ease-in-out infinite`;
        balloon.style.animationDelay = Math.random() * 5 + 's';
    });
}

// Tạo confetti
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = getRandomColor();
            confetti.style.opacity = 1;

            const animationDuration = Math.random() * 3 + 2;
            confetti.style.animation = `confettiFall ${animationDuration}s linear forwards`;

            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), animationDuration * 1000);
        }, i * 50);
    }
}

function getRandomColor() {
    const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#ff99c8', '#9b5de5', '#00bbf9'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Xử lý thổi nến
let blowProgress = 0;
let audioContext, analyser, microphone, javascriptNode;

document.getElementById('micPermissionBtn')?.addEventListener('click', function() {
    setupAudioAnalysis();
    this.style.display = 'none';
    document.getElementById('blowButton')?.style.display = 'inline-block';
    document.getElementById('audioFeedback')?.style.display = 'block';
    document.getElementById('progressContainer')?.style.display = 'block';
});

function setupAudioAnalysis() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Trình duyệt không hỗ trợ thu âm!');
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
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
            const canvasContext = canvas?.getContext('2d');
            if (canvas) {
                canvas.width = 300;
                canvas.height = 60;
            }

            javascriptNode.onaudioprocess = function() {
                const array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);

                let average = array.reduce((sum, val) => sum + val, 0) / array.length;

                if (canvasContext) {
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
                        canvasContext.fillRect(i * (barWidth + barSpacing), canvas.height - barHeight, barWidth, barHeight);
                    }
                }

                if (average > 15) {
                    blowProgress += (average / 100);
                    blowProgress = Math.min(blowProgress, 100);
                    updateBlowProgress();
                    if (blowProgress >= 100) {
                        blowOutCandle();
                        disconnectAudio();
                    }
                } else {
                    blowProgress -= 0.5;
                    blowProgress = Math.max(blowProgress, 0);
                    updateBlowProgress();
                }
            };
        })
        .catch(err => {
            console.error('Không thể truy cập microphone:', err);
            alert('Không thể truy cập microphone. Hãy thử lại.');
        });
}

function updateBlowProgress() {
    const progressBar = document.getElementById('blowProgress');
    if (progressBar) {
        progressBar.style.width = blowProgress + '%';
        progressBar.textContent = Math.round(blowProgress) + '%';
    }
}

function disconnectAudio() {
    if (javascriptNode) javascriptNode.disconnect();
    if (analyser) analyser.disconnect();
    if (microphone) microphone.disconnect();
    if (audioContext && audioContext.state !== 'closed') audioContext.close();
}

let buttonClickCount = 0;
document.getElementById('blowButton')?.addEventListener('click', function() {
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
    if (flame) flame.style.opacity = 0;

    document.getElementById('blowButton')?.style.display = 'none';
    document.getElementById('audioFeedback')?.style.display = 'none';
    document.getElementById('progressContainer')?.style.display = 'none';

    playSound();
    createMoreConfetti();

    const message = document.getElementById('birthdayMessage');
    if (message) {
        message.innerHTML = 'Chúc mừng sinh nhật! 🎉<br>Bạn đã thổi tắt nến thành công!<br>Hy vọng mọi điều ước của bạn sẽ thành hiện thực!';
        message.style.fontSize = '1.8em';
        message.style.color = '#ff4081';
        message.style.animation = 'pulse 2s infinite';
    }
}

function createMoreConfetti() {
    for (let i = 0; i < 5; i++) {
        setTimeout(createConfetti, i * 300);
    }
}

function playSound() {
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18A');
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const note = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18A');
                note.play().catch(e => console.log("Auto-play prevented:", e));
            }, i * 200);
        }
    } catch (e) {
        console.log("Sound play error:", e);
    }
}

// Photo Album
function initPhotoAlbum() {
    const albumBtn = document.getElementById('openAlbum');
    const memoryWall = document.getElementById('memoryWall');
    let isOpen = false;

    if (albumBtn && memoryWall) {
        albumBtn.addEventListener('click', () => {
            memoryWall.style.display = isOpen ? 'none' : 'block';
            if (!isOpen) loadSamplePhotos();
            isOpen = !isOpen;
        });

        memoryWall.addEventListener('click', (e) => {
            if (e.target === memoryWall) {
                memoryWall.style.display = 'none';
                isOpen = false;
            }
        });
    }
}

function loadSamplePhotos() {
    const gallery = document.getElementById('photoGallery');
    if (!gallery) return;

    gallery.innerHTML = '';
    const totalImages = 14;

    for (let i = 1; i <= totalImages; i++) {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';

        const img = document.createElement('img');
        img.className = 'memory-photo';
        img.src = `memory/${i}.jpg`;
        img.alt = `Birthday memory ${i}`;
        img.onerror = function() { this.src = '/api/placeholder/200/200'; };

        photoItem.appendChild(img);
        photoItem.addEventListener('click', () => openFullSizeImage(`memory/${i}.jpg`, i));
        gallery.appendChild(photoItem);
    }
}

function openFullSizeImage(imageUrl, imageNumber) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center; z-index: 9999;';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.cssText = 'max-width: 90%; max-height: 90vh; object-fit: contain;';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = 'position: absolute; top: 20px; right: 20px; font-size: 30px; color: white; background: none; border: none; cursor: pointer;';

    const caption = document.createElement('div');
    caption.textContent = `Hình ${imageNumber}`;
    caption.style.cssText = 'position: absolute; bottom: 20px; color: white; font-size: 18px; background: rgba(0,0,0,0.5); padding: 5px 15px; border-radius: 20px;';

    modal.appendChild(img);
    modal.appendChild(closeBtn);
    modal.appendChild(caption);

    modal.addEventListener('click', () => modal.remove());
    img.addEventListener('click', (e) => e.stopPropagation());
    document.body.appendChild(modal);
}

// Games
function initGames() {
    const memoryGameBtn = document.getElementById('startMemoryGame');
    const puzzleGameBtn = document.getElementById('startPuzzleGame');

    if (memoryGameBtn) memoryGameBtn.addEventListener('click', () => alert('Trò chơi trí nhớ sẽ bắt đầu!'));
    if (puzzleGameBtn) puzzleGameBtn.addEventListener('click', () => alert('Trò chơi ghép hình sẽ bắt đầu!'));
}

// Social Share
function initSocialShare() {
    const shareButtons = document.querySelectorAll('.share-button');
    shareButtons.forEach(button => {
        button.addEventListener('click', () => {
            const platform = button.dataset.platform;
            shareOnSocialMedia(platform);
        });
    });
}

function shareOnSocialMedia(platform) {
    const url = window.location.href;
    const text = 'Chúc mừng sinh nhật!';
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
        instagram: `https://instagram.com`
    };
    window.open(shareUrls[platform], '_blank');
}

// Music Player
function initMusicPlayer() {
    const playButton = document.getElementById('playMusic');
    if (!playButton) return;

    let isPlaying = false;
    let audio = new Audio('happy-birthday.mp3');

    playButton.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            playButton.textContent = '▶️';
        } else {
            audio.play().catch(e => console.log('Audio play failed:', e));
            playButton.textContent = '⏸️';
        }
        isPlaying = !isPlaying;
    });
}

// Khởi tạo khi trang tải
document.addEventListener('DOMContentLoaded', function() {
    checkAndShowBirthdayOnLoad(); // Kiểm tra và hiển thị sinh nhật trước tiên
    initPhotoAlbum();
    initGames();
    initSocialShare();
    initMusicPlayer();
    setInterval(updateCountdownTime, 1000); // Cập nhật đếm ngược sau cùng
});