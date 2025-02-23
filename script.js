const birthdays = [
    {
        name: "Dũng",
        month: 12,
        day: 7,
        message: "🎉 Ê Dũng, sinh nhật vui quá nha mày! 🎉"
    },
    {
        name: "Hiệp",
        month: 10,
        day: 2,
        message: "🎉 Ê Dũng, sinh nhật vui quá nha mày! 🎉"
    },
    {
        name: "Thành",
        month: 2,
        day: 27,
        message: "🎂 Chúc mừng sinh nhật nha cu 🎂"
    },
    {
        name: "Đức",
        month: 8,
        day: 19,
        message: "🎈 Đức ơi, sinh nhật mày tới rồi kìa, quẩy tung nóc đi nha! 🎈"
    },
    {
        name: "Tiển",
        month: 7,
        day: 26,
        message: "🎉 Tiển ơi, sinh nhật mày phải quẩy cho đã nha thằng khỉ! 🎉"
    },
    {
        name: "Viện",
        month: 6,
        day: 24,
        message: "🎉 Ê Dũng, sinh nhật vui quá nha mày! 🎉"
    },
    {
        name: "Diệu",
        month: 8,
        day: 5,
        message: "🎂 Diệu xinh đẹp, sinh nhật vui nha nhỏ bạn! 🎂"
    },
    {
        name: "Hiền",
        month: 5,
        day: 8,
        message: "🎈 Hiền ơi, sinh nhật mày quẩy tưng bừng luôn nha! 🎈"
    },
    {
        name: "Uyên",
        month: 11,
        day: 19,
        message: "🎉 Uyên ơi, sinh nhật mày tới rồi, quẩy banh nóc đi nha nhỏ! 🎈"
    },
    {
        name: "Như",
        month: 10,
        day: 12,
        message: "🎉 Như ơi, sinh nhật mày tới rồi, quẩy banh nóc đi nha nhỏ! 🎈"
    }
];

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
        
        // Nếu sinh nhật năm nay đã qua, tính cho năm sau
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

function updateCountdownTime() {
    const now = new Date();
    const birthdayPerson = checkIfBirthday(now);

    // Nếu hôm nay là sinh nhật
    if (birthdayPerson) {
        const today = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
        const lastShownDate = localStorage.getItem('lastBirthdayShown');
        
        // Nếu chưa hiển thị sinh nhật hôm nay hoặc đã hiển thị nhưng là ngày khác
        if (lastShownDate !== today) {
            localStorage.setItem('lastBirthdayShown', today);
            localStorage.setItem('currentBirthday', birthdayPerson.name);
            showBirthdayContent(birthdayPerson);
        } else {
            // Nếu đã hiển thị rồi, kiểm tra xem có phải đang hiển thị đúng người không
            const currentlyShowing = localStorage.getItem('currentBirthday');
            if (currentlyShowing === birthdayPerson.name) {
                showBirthdayContent(birthdayPerson);
            }
        }
    } else {
        // Xóa dữ liệu sinh nhật cũ nếu không còn là ngày sinh nhật
        localStorage.removeItem('lastBirthdayShown');
        localStorage.removeItem('currentBirthday');
        
        // Tìm và hiển thị đếm ngược đến sinh nhật tiếp theo
        const nextBirthday = findNextBirthday(now);
        if (nextBirthday.person) {
            displayCountdown(nextBirthday.date, nextBirthday.person);
        }
    }
}
// Add this CSS to your existing styles
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
    
    @keyframes birthdayPop {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); opacity: 1; }
    }
`;

document.head.appendChild(style);

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
        birthdayTitle.style.display = 'block';
        birthdayTitle.style.opacity = '1';
    }

    const birthdayMessage = document.getElementById('birthdayMessage');
    if (birthdayMessage) {
        birthdayMessage.textContent = birthdayPerson.message; // Use the single message directly
        birthdayMessage.style.display = 'block';
        birthdayMessage.style.opacity = '1';
        birthdayMessage.style.transform = 'translateY(0)';
    }

    document.getElementById('flame').style.opacity = '1';
    document.getElementById('micPermissionBtn').style.display = 'inline-block';
    document.querySelector('.countdown-container').style.display = 'none';
    document.querySelector('.cake-container').style.display = 'block';
    document.querySelector('.birthday-message').style.display = 'block';

    document.body.style.background = 'linear-gradient(135deg, #ffe6eb 0%, #ffb8c6 100%)';

    createBalloons();
    createConfetti();

    playBirthdayMusic();
}

function playBirthdayMusic() {
    const audio = new Audio('happy-birthday.mp3');
    audio.play().catch(e => {
        console.log('Auto-play prevented:', e);
        const playButton = document.getElementById('playMusic');
        if (playButton) {
            playButton.textContent = '▶️';
        }
    });
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo đếm ngược
    updateCountdownTime();
    
    // Cập nhật mỗi giây
    setInterval(updateCountdownTime, 1000);
    
    // Khởi tạo các tính năng khác
    initPhotoAlbum();
    initGames();
    initSocialShare();
    initMusicPlayer();
});

function createBalloons() {
    const colors = ['#ff6b6b', '#7dd3fc', '#ffd166', '#a5d8ff', '#ffd3da', '#c2f0c2'];
    const balloonContainer = document.getElementById('balloonContainer');

    // Clear any existing balloons
    balloonContainer.innerHTML = '';

    const positions = [
        {left: '5%', top: '10%'},      // Top left
        {left: '12%', top: '25%'},     // Left side
        {left: '8%', top: '60%'},      // Bottom left
        {left: '20%', top: '80%'},     // Bottom left
        {left: '85%', top: '15%'},     // Top right
        {left: '92%', top: '30%'},     // Right side
        {left: '88%', top: '65%'},     // Bottom right
        {left: '78%', top: '75%'},     // Bottom right
        {left: '30%', top: '5%'},      // Top
        {left: '70%', top: '8%'},      // Top
        {left: '10%', top: '40%'},     // Left middle
        {left: '90%', top: '45%'}      // Right middle
    ];

    for (let i = 0; i < positions.length; i++) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';

        // Create balloon SVG
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

        // Position based on predefined positions
        balloon.style.left = positions[i].left;
        balloon.style.top = positions[i].top;

        // Randomize size slightly
        const size = 70 + Math.random() * 30;
        balloon.style.width = size + 'px';
        balloon.style.height = Math.floor(size * 1.2) + 'px';

        // Animate with delay
        balloon.style.opacity = 0.8;
        balloon.style.animation = `float ${Math.random() * 2 + 4}s ease-in-out infinite`;
        balloon.style.animationDelay = Math.random() * 5 + 's';
    }
}

let blowProgress = 0;
let audioContext, analyser, microphone, javascriptNode;

// Event listener for microphone permission button
document.getElementById('micPermissionBtn').addEventListener('click', function() {
    setupAudioAnalysis();
    this.style.display = 'none';
    document.getElementById('blowButton').style.display = 'inline-block';
    document.getElementById('audioFeedback').style.display = 'block';
    document.getElementById('progressContainer').style.display = 'block';
});

// Audio analysis for blowing detection
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

            // Canvas setup for visualization
            const canvas = document.getElementById('audioFeedback');
            const canvasContext = canvas.getContext('2d');
            canvas.width = 300;
            canvas.height = 60;

            javascriptNode.onaudioprocess = function() {
                const array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);

                // Get average volume
                let average = 0;
                for (let i = 0; i < array.length; i++) {
                    average += array[i];
                }
                average = average / array.length;

                // Visualization
                canvasContext.clearRect(0, 0, canvas.width, canvas.height);

                // Gradient background
                const gradient = canvasContext.createLinearGradient(0, 0, canvas.width, 0);
                gradient.addColorStop(0, '#74ebd5');
                gradient.addColorStop(1, '#9face6');
                canvasContext.fillStyle = gradient;
                canvasContext.fillRect(0, 0, canvas.width, canvas.height);

                // Volume bars
                const barWidth = 3;
                const barSpacing = 1;
                const totalBars = Math.floor(canvas.width / (barWidth + barSpacing));

                for (let i = 0; i < totalBars; i++) {
                    const barHeight = (array[i] || 0) / 256 * canvas.height;

                    // Bar gradient
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

                // If loud enough, consider it as blowing and increase progress
                if (average > 15) {
                    blowProgress += (average / 100);
                    blowProgress = Math.min(blowProgress, 100);

                    updateBlowProgress();

                    if (blowProgress >= 100) {
                        blowOutCandle();
                        disconnectAudio();
                    }
                } else {
                    // Slowly decrease progress if not blowing
                    blowProgress -= 0.5;
                    blowProgress = Math.max(blowProgress, 0);
                    updateBlowProgress();
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
    if (javascriptNode) {
        javascriptNode.disconnect();
    }
    if (analyser) {
        analyser.disconnect();
    }
    if (microphone) {
        microphone.disconnect();
    }
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
    }
}

// Manual blow button (now requires 5 clicks)
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
    flame.style.opacity = 0;

    document.getElementById('blowButton').style.display = 'none';
    document.getElementById('audioFeedback').style.display = 'none';
    document.getElementById('progressContainer').style.display = 'none';

    playSound();
    createMoreConfetti();

    // New celebration message with animation
    const message = document.getElementById('birthdayMessage');
    message.innerHTML = 'Chúc mừng sinh nhật! 🎉<br>Bạn đã thổi tắt nến thành công!<br>Hy vọng mọi điều ước của bạn sẽ thành hiện thực!';
    message.style.fontSize = '1.8em';
    message.style.color = '#ff4081';

    // Animate the message
    message.style.animation = 'pulse 2s infinite';
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

            // Different shapes
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

            // Set animation
            const animationDuration = Math.random() * 3 + 2;
            confetti.style.animation = `confettiFall ${animationDuration}s linear forwards`;

            document.body.appendChild(confetti);

            // Remove after animation completes
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

function playSound() {
    try {
        // Create audio element for party sound - using simple beep sounds for now
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18A';

        // Play a short melody
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

// Check if it's birthday when page loads
/*window.onload = function() {
    updateCountdown();
    const now = new Date();
    if (now.getMonth() === birthdayMonth && now.getDate() === birthdayDay) {
        showBirthdayContent();
    }
    // Start the countdown timer
    setInterval(updateCountdown, 1000);
};*/

// Photo Album
function initPhotoAlbum() {
    const albumBtn = document.getElementById('openAlbum');
    const memoryWall = document.getElementById('memoryWall');
    let isOpen = false;

    albumBtn.addEventListener('click', () => {
        if (!isOpen) {
            memoryWall.style.display = 'block';
            loadSamplePhotos();
            isOpen = true;
        } else {
            memoryWall.style.display = 'none';
            isOpen = false;
        }
    });

    memoryWall.addEventListener('click', (e) => {
        if (e.target === memoryWall) {
            memoryWall.style.display = 'none';
            isOpen = false;
        }
    });
}

function loadSamplePhotos() {
    const gallery = document.getElementById('photoGallery');
    gallery.innerHTML = '';
    
    const totalImages = 50; // Số lượng ảnh trong thư mục memory

    for (let i = 1; i <= totalImages; i++) {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        
        const img = document.createElement('img');
        img.className = 'memory-photo';
        img.src = `memory/${i}.jpg`;
        img.alt = `Birthday memory ${i}`;
        
        img.onerror = function() {
            this.src = '/api/placeholder/200/200';
        };

        photoItem.appendChild(img);
        
        // Click để xem ảnh full size
        photoItem.addEventListener('click', () => {
            openFullSizeImage(`memory/${i}.jpg`, i);
        });

        gallery.appendChild(photoItem);
    }
}

function openFullSizeImage(imageUrl, imageNumber) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90vh';
    img.style.objectFit = 'contain';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '20px';
    closeBtn.style.right = '20px';
    closeBtn.style.fontSize = '30px';
    closeBtn.style.color = 'white';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.cursor = 'pointer';

    const caption = document.createElement('div');
    caption.textContent = `Hình ${imageNumber}`;
    caption.style.position = 'absolute';
    caption.style.bottom = '20px';
    caption.style.color = 'white';
    caption.style.fontSize = '18px';
    caption.style.background = 'rgba(0,0,0,0.5)';
    caption.style.padding = '5px 15px';
    caption.style.borderRadius = '20px';

    modal.appendChild(img);
    modal.appendChild(closeBtn);
    modal.appendChild(caption);

    modal.addEventListener('click', () => {
        modal.remove();
    });

    img.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.body.appendChild(modal);
}

// Games
function initGames() {
    const memoryGameBtn = document.getElementById('startMemoryGame');
    const puzzleGameBtn = document.getElementById('startPuzzleGame');

    memoryGameBtn.addEventListener('click', startMemoryGame);
    puzzleGameBtn.addEventListener('click', startPuzzleGame);
}

function startMemoryGame() {
    alert('Trò chơi trí nhớ sẽ bắt đầu!');
    // Implement game logic here
}

function startPuzzleGame() {
    alert('Trò chơi ghép hình sẽ bắt đầu!');
    // Implement game logic here
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

// Initialize all features
document.addEventListener('DOMContentLoaded', function() {
    initPhotoAlbum();
    initGames();
    initSocialShare();
    initMusicPlayer();
});


// Khởi tạo tất cả các tính năng khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo đồng hồ đếm ngược lần đầu
    updateCountdownTime();
    // Bắt đầu cập nhật đếm ngược mỗi giây
    setInterval(updateCountdownTime, 1000);
    
    // Kiểm tra sinh nhật khi tải trang
    const now = new Date();
    for (const person of birthdays) {
        if (now.getMonth() === person.month - 1 && now.getDate() === person.day) {
            showBirthdayContent(person.name);
            break;
        }
    }

    // Khởi tạo các tính năng khác
    initPhotoAlbum();
    initGames();
    initSocialShare();
    initMusicPlayer();
});
