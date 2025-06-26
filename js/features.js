// Biến toàn cục cho microphone
let blowProgress = 0;
let audioContext, analyser, microphone, javascriptNode;

// Phân tích âm thanh cho tính năng thổi nến
function setupAudioAnalysis() {
    // Đã bỏ tính năng thổi nến bằng micro
    // Gọi trực tiếp hàm thổi tắt nến
    if (typeof blowOutCandle === 'function') {
        blowOutCandle();
    }
}

// Cập nhật hiển thị tiến trình thổi nến
function updateBlowProgress() {
    // Đã bỏ tính năng thổi nến bằng micro
}

// Ngắt kết nối âm thanh khi hoàn thành
function disconnectAudio() {
    // Đã bỏ tính năng thổi nến bằng micro
}

// Xử lý khi thổi tắt nến
function blowOutCandle() {
    // Xử lý với bánh 2D
    const flames = document.querySelectorAll('.flame');
    if (flames && flames.length > 0) {
        // Tắt từng ngọn lửa với hiệu ứng
        flames.forEach((flame, index) => {
            setTimeout(() => {
                flame.style.opacity = '0';
                flame.style.transform = 'translateX(-50%) scale(0.1)';
                flame.style.boxShadow = 'none';
                
                // Tạo hiệu ứng khói
                createSmokeEffect2D(flame);
            }, index * 200);
        });
    }

    // Xử lý với bánh 3D nếu có
    if (window.cakeSceneElements) {
        const { candleGroup } = window.cakeSceneElements;
        
        // Tạo hiệu ứng tắt từng nến một với thời gian trễ
        candleGroup.children.forEach((child, index) => {
            if (child.name && child.name.startsWith('flame_')) {
                // Tạo hiệu ứng tắt nến với độ trễ cho từng nến
                setTimeout(() => {
                    child.visible = false;
                }, index * 300);
            }
        });
    }

    // Ẩn nút thổi nến với hiệu ứng
    const blowButton = document.getElementById('blowButton');
    if (blowButton) {
        blowButton.style.transition = 'all 0.5s ease';
        blowButton.style.opacity = '0';
        blowButton.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            blowButton.style.display = 'none';
        }, 500);
    }
    
    // Ẩn các phần tử feedback
    const audioFeedback = document.getElementById('audioFeedback');
    if (audioFeedback) {
        audioFeedback.style.display = 'none';
    }
    
    const progressContainer = document.getElementById('progressContainer');
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }

    // Phát âm thanh và hiệu ứng
    playSound();
    createMoreConfetti();

    // Hiển thị thông báo chúc mừng với animation
    const message = document.getElementById('birthdayMessage');
    if (message) {
        // Hiệu ứng biến mất từ từ
        message.style.transition = 'all 0.5s ease';
        message.style.opacity = '0';
        
        setTimeout(() => {
            message.innerHTML = 'Chúc mừng sinh nhật! 🎉<br>Bạn đã thổi tắt nến thành công!<br>Hy vọng mọi điều ước của bạn sẽ thành hiện thực! 🎂';
    message.style.fontSize = '1.8em';
    message.style.color = '#ff4081';
            message.classList.add('celebrating');
            
            // Hiệu ứng hiện ra từ từ
            setTimeout(() => {
                message.style.opacity = '1'; 
            }, 100);
        }, 500);
    }
    
    // Thêm hiệu ứng rung nhẹ cho bánh 2D
    const cake2D = document.querySelector('.cake-2d');
    if (cake2D) {
        cake2D.style.animation = 'none';
        setTimeout(() => {
            cake2D.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                cake2D.style.animation = 'float 3s ease-in-out infinite';
            }, 500);
        }, 10);
    }
}

// Tạo hiệu ứng khói cho bánh 2D
function createSmokeEffect2D(flameElement) {
    const parentCandle = flameElement.parentElement;
    const rect = flameElement.getBoundingClientRect();
    
    // Tạo 5 hạt khói
    for (let i = 0; i < 5; i++) {
        const smoke = document.createElement('div');
        smoke.className = 'smoke-particle';
        smoke.style.position = 'absolute';
        smoke.style.width = '8px';
        smoke.style.height = '8px';
        smoke.style.borderRadius = '50%';
        smoke.style.background = 'rgba(200, 200, 200, 0.5)';
        smoke.style.bottom = '100%';
        smoke.style.left = '50%';
        smoke.style.transform = 'translateX(-50%)';
        smoke.style.animation = 'smoke 2s ease-out forwards';
        smoke.style.animationDelay = (i * 0.2) + 's';
        
        parentCandle.appendChild(smoke);
        
        // Xóa hạt khói sau khi animation kết thúc
        setTimeout(() => {
            smoke.remove();
        }, 2000 + (i * 200));
    }
}

// Thêm animation cho bánh 2D
document.addEventListener('DOMContentLoaded', function() {
    // Thêm keyframes cho animation shake
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-5px) rotate(-5deg); }
            50% { transform: translateY(0) rotate(0deg); }
            75% { transform: translateY(-5px) rotate(5deg); }
            100% { transform: translateY(0) rotate(0deg); }
        }
    `;
    document.head.appendChild(style);
});

// Hàm tạo hiệu ứng khói khi nến tắt
function createSmokeEffect(x, y, z) {
    if (!window.cakeSceneElements) return;
    
    const { scene } = window.cakeSceneElements;
    
    const smokeParticles = [];
    const numParticles = 5;
    
    // Tạo các hạt khói
    for (let i = 0; i < numParticles; i++) {
        const smokeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const smokeMaterial = new THREE.MeshBasicMaterial({
            color: 0xdddddd,
            transparent: true,
            opacity: 0.7
        });
        
        const smokeParticle = new THREE.Mesh(smokeGeometry, smokeMaterial);
        smokeParticle.position.set(
            x + (Math.random() - 0.5) * 0.1,
            y + Math.random() * 0.05,
            z + (Math.random() - 0.5) * 0.1
        );
        
        smokeParticle.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.01,
                Math.random() * 0.02 + 0.01,
                (Math.random() - 0.5) * 0.01
            ),
            life: 2.0,  // seconds
            startTime: Date.now()
        };
        
        scene.add(smokeParticle);
        smokeParticles.push(smokeParticle);
    }
    
    // Hàm cập nhật vị trí và trạng thái các hạt khói
    function updateSmokeParticles() {
        const now = Date.now();
        let allDone = true;
        
        smokeParticles.forEach((particle, i) => {
            const elapsed = (now - particle.userData.startTime) / 1000;
            
            if (elapsed < particle.userData.life) {
                allDone = false;
                
                // Cập nhật vị trí
                particle.position.x += particle.userData.velocity.x;
                particle.position.y += particle.userData.velocity.y;
                particle.position.z += particle.userData.velocity.z;
                
                // Scale up
                const scale = 1 + elapsed * 0.5;
                particle.scale.set(scale, scale, scale);
                
                // Fade out
                particle.material.opacity = 0.7 * (1 - (elapsed / particle.userData.life));
                
                // Làm chậm dần
                particle.userData.velocity.y *= 0.98;
            } else if (particle.parent) {
                scene.remove(particle);
                particle.material.dispose();
                particle.geometry.dispose();
            }
        });
        
        if (!allDone) {
            requestAnimationFrame(updateSmokeParticles);
        }
    }
    
    updateSmokeParticles();
}

// Hàm tạo hiệu ứng rung cho đối tượng
function shakeObject(object) {
    if (!object) return;
    
    const originalPosition = object.position.clone();
    const originalRotation = object.rotation.clone();
    const shakeDuration = 1000; // ms
    const startTime = Date.now();
    
    function animateShake() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / shakeDuration;
        
        if (progress < 1) {
            // Tính toán độ rung giảm dần
            const intensity = 0.1 * (1 - progress);
            
            // Áp dụng rung ngẫu nhiên
            object.position.x = originalPosition.x + (Math.random() - 0.5) * intensity;
            object.position.z = originalPosition.z + (Math.random() - 0.5) * intensity;
            object.rotation.x = originalRotation.x + (Math.random() - 0.5) * intensity * 0.05;
            object.rotation.z = originalRotation.z + (Math.random() - 0.5) * intensity * 0.05;
            
            requestAnimationFrame(animateShake);
        } else {
            // Khôi phục vị trí ban đầu
            object.position.copy(originalPosition);
            object.rotation.copy(originalRotation);
        }
    }
    
    animateShake();
}

// Tạo hiệu ứng confetti
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

// Tạo nhiều hiệu ứng confetti hơn để ăn mừng
function createMoreConfetti() {
    for (let i = 0; i < 5; i++) {
        setTimeout(createConfetti, i * 300);
    }
}

// Hàm lấy màu ngẫu nhiên
function getRandomColor() {
    const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#ff99c8', '#9b5de5', '#00bbf9'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Phát âm thanh khi thổi tắt nến
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

// Album ảnh - Đã di chuyển sang album.js

// Thêm biến toàn cục để kiểm soát việc sử dụng local media
window.useLocalMedia = false;
// Theo dõi việc đã tải dữ liệu hay chưa
window.mediaAlreadyLoaded = false;

function loadSamplePhotos() {
    // Chức năng này đã được di chuyển sang album.js
    console.log("Chức năng album đã được di chuyển sang album.js");
    if (typeof initPhotoAlbum === 'function') {
        initPhotoAlbum();
    }
}

// Trò chơi và lịch sinh nhật
function initGames() {
    const memoryGameBtn = document.getElementById('startMemoryGame');
    const puzzleGameBtn = document.getElementById('startPuzzleGame');
    const calendarBtn = document.getElementById('openCalendar');
    const quizBtn = document.getElementById('startBirthdayQuiz');

    memoryGameBtn.addEventListener('click', startMemoryGame);
    puzzleGameBtn.addEventListener('click', startPuzzleGame);
    if (calendarBtn) {
        calendarBtn.addEventListener('click', openBirthdayCalendar);
    }
    if (quizBtn) {
        quizBtn.addEventListener('click', startBirthdayQuiz);
    }
}

// Hàm mở trò chơi đố vui sinh nhật
function startBirthdayQuiz() {
    let quizModal = document.getElementById('birthdayQuizModal');
    if (!quizModal) {
        quizModal = document.createElement('div');
        quizModal.id = 'birthdayQuizModal';
        quizModal.style.position = 'fixed';
        quizModal.style.top = '0';
        quizModal.style.left = '0';
        quizModal.style.width = '100%';
        quizModal.style.height = '100%';
        quizModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        quizModal.style.display = 'flex';
        quizModal.style.justifyContent = 'center';
        quizModal.style.alignItems = 'center';
        quizModal.style.zIndex = '10000';
        quizModal.style.display = 'none';

        const quizContainer = document.createElement('div');
        quizContainer.style.background = '#FFF9F3';
        quizContainer.style.border = '2px solid #D4B08C';
        quizContainer.style.borderRadius = '0';
        quizContainer.style.padding = '20px';
        quizContainer.style.width = '90%';
        quizContainer.style.maxWidth = '500px';
        quizContainer.style.maxHeight = '80vh';
        quizContainer.style.overflowY = 'auto';
        quizContainer.style.boxShadow = '8px 8px 0 #D4B08C';
        quizContainer.style.position = 'relative';
        quizContainer.style.textAlign = 'center';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            quizModal.style.display = 'none';
        });

        const title = document.createElement('h2');
        title.textContent = 'Đố Vui Sinh Nhật';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';

        const quizArea = document.createElement('div');
        quizArea.id = 'quizArea';
        quizArea.style.display = 'flex';
        quizArea.style.flexDirection = 'column';
        quizArea.style.gap = '10px';
        quizArea.style.margin = '20px auto';
        quizArea.style.width = '90%';

        const restartBtn = document.createElement('button');
        restartBtn.textContent = 'Chơi Lại';
        restartBtn.style.padding = '10px 20px';
        restartBtn.style.background = '#854D27';
        restartBtn.style.color = '#FFF9F3';
        restartBtn.style.border = '2px solid #D4B08C';
        restartBtn.style.borderRadius = '0';
        restartBtn.style.cursor = 'pointer';
        restartBtn.style.fontSize = '1.1em';
        restartBtn.style.transition = 'all 0.3s';
        restartBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        restartBtn.style.textTransform = 'uppercase';
        restartBtn.style.letterSpacing = '1px';
        restartBtn.addEventListener('click', () => {
            initBirthdayQuiz();
        });
        restartBtn.addEventListener('mouseover', () => {
            restartBtn.style.transform = 'translate(-2px, -2px)';
            restartBtn.style.boxShadow = '6px 6px 0 #D4B08C';
        });
        restartBtn.addEventListener('mouseout', () => {
            restartBtn.style.transform = 'none';
            restartBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        });

        quizContainer.appendChild(closeBtn);
        quizContainer.appendChild(title);
        quizContainer.appendChild(quizArea);
        quizContainer.appendChild(restartBtn);
        quizModal.appendChild(quizContainer);
        document.body.appendChild(quizModal);
    }
    quizModal.style.display = 'flex';
    initBirthdayQuiz();
}

// Hàm khởi tạo đố vui sinh nhật
function initBirthdayQuiz() {
    const quizArea = document.getElementById('quizArea');
    quizArea.innerHTML = '';
    
    // Kiểm tra danh sách sinh nhật
    if (typeof birthdays === 'undefined' || birthdays.length === 0) {
        const noDataMsg = document.createElement('p');
        noDataMsg.textContent = 'Không có dữ liệu sinh nhật để tạo câu hỏi.';
        noDataMsg.style.color = '#854D27';
        noDataMsg.style.fontStyle = 'italic';
        quizArea.appendChild(noDataMsg);
        return;
    }
    
    // Tạo danh sách câu hỏi từ danh sách sinh nhật
    let questions = [];
    birthdays.forEach(person => {
        questions.push({
            question: `Ngày sinh của ${person.name} là ngày nào?`,
            correctAnswer: `${person.day}/${person.month}`,
            options: [
                `${person.day}/${person.month}`,
                `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}`,
                `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}`,
                `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}`
            ]
        });
    });
    
    // Xáo trộn danh sách câu hỏi
    questions = questions.sort(() => Math.random() - 0.5).slice(0, 5); // Lấy 5 câu hỏi ngẫu nhiên
    
    let currentQuestionIndex = 0;
    let score = 0;
    
    // Hiển thị câu hỏi
function displayQuestion() {
        quizArea.innerHTML = '';
        if (currentQuestionIndex >= questions.length) {
            const resultMsg = document.createElement('p');
            resultMsg.textContent = `Đố vui hoàn tất! Điểm của bạn: ${score}/${questions.length}`;
            resultMsg.style.color = '#854D27';
            resultMsg.style.fontSize = '1.2em';
            resultMsg.style.fontWeight = 'bold';
            quizArea.appendChild(resultMsg);
            return;
        }
        
        const question = questions[currentQuestionIndex];
        const questionText = document.createElement('p');
        questionText.textContent = `${currentQuestionIndex + 1}. ${question.question}`;
        questionText.style.color = '#854D27';
        questionText.style.fontSize = '1.1em';
        questionText.style.marginBottom = '15px';
        quizArea.appendChild(questionText);
        
        // Xáo trộn các lựa chọn
        const shuffledOptions = question.options.sort(() => Math.random() - 0.5);
        shuffledOptions.forEach(option => {
            const optionBtn = document.createElement('button');
            optionBtn.textContent = option;
            optionBtn.style.padding = '10px 15px';
            optionBtn.style.margin = '5px';
            optionBtn.style.background = '#854D27';
            optionBtn.style.color = '#FFF9F3';
            optionBtn.style.border = '2px solid #D4B08C';
            optionBtn.style.borderRadius = '0';
            optionBtn.style.cursor = 'pointer';
            optionBtn.style.fontSize = '1em';
            optionBtn.style.transition = 'all 0.3s';
            optionBtn.style.boxShadow = '2px 2px 0 #D4B08C';
            optionBtn.addEventListener('click', () => {
                checkAnswer(option, question.correctAnswer);
            });
            optionBtn.addEventListener('mouseover', () => {
                optionBtn.style.transform = 'translate(-1px, -1px)';
                optionBtn.style.boxShadow = '3px 3px 0 #D4B08C';
            });
            optionBtn.addEventListener('mouseout', () => {
                optionBtn.style.transform = 'none';
                optionBtn.style.boxShadow = '2px 2px 0 #D4B08C';
            });
            quizArea.appendChild(optionBtn);
        });
    }
    
    // Kiểm tra câu trả lời
function checkAnswer(selected, correct) {
        if (selected === correct) {
            score++;
            alert('Đúng!');
        } else {
            alert(`Sai! Đáp án đúng là: ${correct}`);
        }
        currentQuestionIndex++;
        displayQuestion();
    }
    
    // Hiển thị câu hỏi đầu tiên
    displayQuestion();
}

// Hàm mở lịch sinh nhật
function openBirthdayCalendar() {
    let calendarModal = document.getElementById('birthdayCalendarModal');
    if (!calendarModal) {
        calendarModal = document.createElement('div');
        calendarModal.id = 'birthdayCalendarModal';
        calendarModal.style.position = 'fixed';
        calendarModal.style.top = '0';
        calendarModal.style.left = '0';
        calendarModal.style.width = '100%';
        calendarModal.style.height = '100%';
        calendarModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        calendarModal.style.display = 'flex';
        calendarModal.style.justifyContent = 'center';
        calendarModal.style.alignItems = 'center';
        calendarModal.style.zIndex = '10000';
        calendarModal.style.display = 'none';

        const calendarContainer = document.createElement('div');
        calendarContainer.style.background = '#FFF9F3';
        calendarContainer.style.border = '2px solid #D4B08C';
        calendarContainer.style.borderRadius = '0';
        calendarContainer.style.padding = '20px';
        calendarContainer.style.width = '90%';
        calendarContainer.style.maxWidth = '600px';
        calendarContainer.style.maxHeight = '80vh';
        calendarContainer.style.overflowY = 'auto';
        calendarContainer.style.boxShadow = '8px 8px 0 #D4B08C';
        calendarContainer.style.position = 'relative';
        calendarContainer.style.textAlign = 'center';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            calendarModal.style.display = 'none';
        });

        const title = document.createElement('h2');
        title.textContent = 'Lịch Sinh Nhật';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';

        const calendarView = document.createElement('div');
        calendarView.id = 'calendarView';
        calendarView.style.display = 'flex';
        calendarView.style.flexDirection = 'column';
        calendarView.style.gap = '10px';
        calendarView.style.margin = '20px auto';
        calendarView.style.width = '90%';

        calendarContainer.appendChild(closeBtn);
        calendarContainer.appendChild(title);
        calendarContainer.appendChild(calendarView);
        calendarModal.appendChild(calendarContainer);
        document.body.appendChild(calendarModal);
    }
    calendarModal.style.display = 'flex';
    displayBirthdayCalendar();
}

// Hàm hiển thị lịch sinh nhật
function displayBirthdayCalendar() {
    const calendarView = document.getElementById('calendarView');
    calendarView.innerHTML = '';
    
    // Lấy danh sách sinh nhật từ biến birthdays (được định nghĩa trong core.js)
    if (typeof birthdays === 'undefined') {
        const noDataMsg = document.createElement('p');
        noDataMsg.textContent = 'Không có dữ liệu sinh nhật để hiển thị.';
        noDataMsg.style.color = '#854D27';
        noDataMsg.style.fontStyle = 'italic';
        calendarView.appendChild(noDataMsg);
        return;
    }
    
    // Sắp xếp danh sách sinh nhật theo tháng và ngày
    const sortedBirthdays = birthdays.sort((a, b) => {
        if (a.month === b.month) {
            return a.day - b.day;
        }
        return a.month - b.month;
    });
    
    // Hiển thị danh sách sinh nhật
    const list = document.createElement('ul');
    list.style.listStyleType = 'none';
    list.style.padding = '0';
    list.style.textAlign = 'left';
    
    sortedBirthdays.forEach(person => {
        const listItem = document.createElement('li');
        listItem.style.padding = '10px';
        listItem.style.borderBottom = '1px solid #D4B08C';
        listItem.style.color = '#2C1810';
        listItem.textContent = `${person.name} - Ngày ${person.day} Tháng ${person.month}`;
        list.appendChild(listItem);
    });
    
    calendarView.appendChild(list);
}

function startMemoryGame() {
    // Tạo modal cho trò chơi trí nhớ
    let gameModal = document.getElementById('memoryGameModal');
    if (!gameModal) {
        gameModal = document.createElement('div');
        gameModal.id = 'memoryGameModal';
        gameModal.style.position = 'fixed';
        gameModal.style.top = '0';
        gameModal.style.left = '0';
        gameModal.style.width = '100%';
        gameModal.style.height = '100%';
        gameModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        gameModal.style.display = 'flex';
        gameModal.style.justifyContent = 'center';
        gameModal.style.alignItems = 'center';
        gameModal.style.zIndex = '10000';
        gameModal.style.display = 'none';

        const gameContainer = document.createElement('div');
        gameContainer.style.background = '#FFF9F3';
        gameContainer.style.border = '2px solid #D4B08C';
        gameContainer.style.borderRadius = '0';
        gameContainer.style.padding = '20px';
        gameContainer.style.width = '80%';
        gameContainer.style.maxWidth = '600px';
        gameContainer.style.boxShadow = '8px 8px 0 #D4B08C';
        gameContainer.style.position = 'relative';
        gameContainer.style.textAlign = 'center';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            gameModal.style.display = 'none';
        });

        const title = document.createElement('h2');
        title.textContent = 'Trò Chơi Trí Nhớ';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';

        const gameGrid = document.createElement('div');
        gameGrid.id = 'memoryGameGrid';
        gameGrid.style.display = 'grid';
        gameGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        gameGrid.style.gap = '10px';
        gameGrid.style.margin = '20px auto';
        gameGrid.style.width = '80%';

        const restartBtn = document.createElement('button');
        restartBtn.textContent = 'Chơi Lại';
        restartBtn.style.padding = '10px 20px';
        restartBtn.style.background = '#854D27';
        restartBtn.style.color = '#FFF9F3';
        restartBtn.style.border = '2px solid #D4B08C';
        restartBtn.style.borderRadius = '0';
        restartBtn.style.cursor = 'pointer';
        restartBtn.style.fontSize = '1.1em';
        restartBtn.style.transition = 'all 0.3s';
        restartBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        restartBtn.style.textTransform = 'uppercase';
        restartBtn.style.letterSpacing = '1px';
        restartBtn.addEventListener('click', () => {
            initMemoryGame();
        });
        restartBtn.addEventListener('mouseover', () => {
            restartBtn.style.transform = 'translate(-2px, -2px)';
            restartBtn.style.boxShadow = '6px 6px 0 #D4B08C';
        });
        restartBtn.addEventListener('mouseout', () => {
            restartBtn.style.transform = 'none';
            restartBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        });

        gameContainer.appendChild(closeBtn);
        gameContainer.appendChild(title);
        gameContainer.appendChild(gameGrid);
        gameContainer.appendChild(restartBtn);
        gameModal.appendChild(gameContainer);
        document.body.appendChild(gameModal);
    }
    gameModal.style.display = 'flex';
    initMemoryGame();
}

function initMemoryGame() {
    const grid = document.getElementById('memoryGameGrid');
    grid.innerHTML = '';
    
    // Danh sách các biểu tượng (8 cặp, tổng cộng 16 thẻ cho lưới 4x4)
    const symbols = ['🎂', '🎉', '🎁', '🎈', '🧁', '🍰', '🥳', '🎊', '🎂', '🎉', '🎁', '🎈', '🧁', '🍰', '🥳', '🎊'];
    let flippedCards = [];
    let matchedPairs = 0;
    
    // Xáo trộn mảng biểu tượng
    for (let i = symbols.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
    }
    
    // Tạo các thẻ
    symbols.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.style.width = '80px';
        card.style.height = '80px';
        card.style.background = '#854D27';
        card.style.border = '2px solid #D4B08C';
        card.style.display = 'flex';
        card.style.alignItems = 'center';
        card.style.justifyContent = 'center';
        card.style.cursor = 'pointer';
        card.style.fontSize = '0'; // Ẩn biểu tượng ban đầu
        card.style.transition = 'all 0.3s';
        card.style.boxShadow = '2px 2px 0 #D4B08C';
        card.dataset.symbol = symbol;
        card.classList.add('memory-card');
        
        card.addEventListener('click', () => {
            if (flippedCards.length < 2 && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
                card.style.background = '#FFF9F3';
                card.style.fontSize = '40px';
                card.textContent = symbol;
                card.classList.add('flipped');
                flippedCards.push(card);
                
                if (flippedCards.length === 2) {
                    setTimeout(() => {
                        const [card1, card2] = flippedCards;
                        if (card1.dataset.symbol === card2.dataset.symbol) {
                            card1.classList.add('matched');
                            card2.classList.add('matched');
                            matchedPairs++;
                            if (matchedPairs === symbols.length / 2) {
                                setTimeout(() => {
                                    alert('Chúc mừng! Bạn đã tìm hết các cặp!');
                                }, 300);
                            }
                        } else {
                            card1.style.background = '#854D27';
                            card1.style.fontSize = '0';
                            card1.textContent = '';
                            card1.classList.remove('flipped');
                            card2.style.background = '#854D27';
                            card2.style.fontSize = '0';
                            card2.textContent = '';
                            card2.classList.remove('flipped');
                        }
                        flippedCards = [];
                    }, 1000);
                }
            }
        });
        
        grid.appendChild(card);
    });
}

// Biến toàn cục để lưu trữ danh sách ảnh cho trò chơi ghép hình
let puzzleGameImages = [];
let isPuzzleImagesLoaded = false;

// Hàm tải danh sách ảnh từ media
async function loadPuzzleImages() {
    if (isPuzzleImagesLoaded && puzzleGameImages.length > 0) {
        return puzzleGameImages;
    }
    
    try {
        console.log("Đang tải ảnh cho trò chơi ghép hình...");
        
        // Nếu window.mediaFilesLoaded đã được định nghĩa và có giá trị true
        if (window.mediaFilesLoaded && window.mediaFiles && window.mediaFiles.length > 0) {
            // Lọc chỉ lấy các file ảnh từ mediaFiles
            const imageFiles = window.mediaFiles.filter(file => 
                file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            );
            
            if (imageFiles.length > 0) {
                console.log(`Đã tìm thấy ${imageFiles.length} ảnh từ media đã tải`);
                puzzleGameImages = imageFiles;
                isPuzzleImagesLoaded = true;
                return imageFiles;
            }
        }
        
        // Nếu không có mediaFiles hoặc không tìm thấy ảnh, thử tải từ Supabase
        console.log("Đang tải ảnh từ Supabase...");
        
        // Kiểm tra xem supabase đã được định nghĩa chưa
        if (typeof supabase !== 'undefined') {
            const { data, error } = await supabase
                .storage
                .from('media')
                .list('', {
                    limit: 100,
                    sortBy: { column: 'name', order: 'asc' }
                });
                
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Lọc các file ảnh
                const imageFiles = data
                    .filter(file => file.name !== '.emptyFolderPlaceholder')
                    .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
                    .map(file => file.name);
                
                if (imageFiles.length > 0) {
                    console.log(`Đã tìm thấy ${imageFiles.length} ảnh từ Supabase`);
                    puzzleGameImages = imageFiles;
                    isPuzzleImagesLoaded = true;
                    window.useLocalMedia = false;
                    return imageFiles;
                }
            }
        }
        
        // Fallback: Sử dụng danh sách ảnh local
        console.log("Sử dụng danh sách ảnh local");
        const localImages = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', 
                            '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg'];
        puzzleGameImages = localImages;
        isPuzzleImagesLoaded = true;
        window.useLocalMedia = true;
        return localImages;
    } catch (error) {
        console.error("Lỗi khi tải ảnh cho trò chơi ghép hình:", error);
        // Fallback: Sử dụng danh sách ảnh mặc định
        const defaultImages = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'];
        puzzleGameImages = defaultImages;
        isPuzzleImagesLoaded = true;
        window.useLocalMedia = true;
        return defaultImages;
    }
}

function startPuzzleGame() {
    // Tạo modal cho trò chơi ghép hình
    let puzzleModal = document.getElementById('puzzleGameModal');
    if (!puzzleModal) {
        puzzleModal = document.createElement('div');
        puzzleModal.id = 'puzzleGameModal';
        puzzleModal.style.position = 'fixed';
        puzzleModal.style.top = '0';
        puzzleModal.style.left = '0';
        puzzleModal.style.width = '100%';
        puzzleModal.style.height = '100%';
        puzzleModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        puzzleModal.style.display = 'flex';
        puzzleModal.style.justifyContent = 'center';
        puzzleModal.style.alignItems = 'center';
        puzzleModal.style.zIndex = '10000';
        puzzleModal.style.display = 'none';

        const puzzleContainer = document.createElement('div');
        puzzleContainer.style.background = '#FFF9F3';
        puzzleContainer.style.border = '2px solid #D4B08C';
        puzzleContainer.style.borderRadius = '0';
        puzzleContainer.style.padding = '20px';
        puzzleContainer.style.width = '90%';
        puzzleContainer.style.maxWidth = '800px';
        puzzleContainer.style.boxShadow = '8px 8px 0 #D4B08C';
        puzzleContainer.style.position = 'relative';
        puzzleContainer.style.textAlign = 'center';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            puzzleModal.style.display = 'none';
        });

        const title = document.createElement('h2');
        title.textContent = 'Trò Chơi Ghép Hình';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';

        const puzzleArea = document.createElement('div');
        puzzleArea.id = 'puzzleArea';
        puzzleArea.style.display = 'grid';
        puzzleArea.style.gridTemplateColumns = 'repeat(4, 1fr)';
        puzzleArea.style.gap = '2px';
        puzzleArea.style.margin = '20px auto';
        puzzleArea.style.width = '600px';
        puzzleArea.style.height = '300px';
        puzzleArea.style.border = '2px solid #D4B08C';
        puzzleArea.style.background = '#EEE';

        const piecesContainer = document.createElement('div');
        piecesContainer.id = 'piecesContainer';
        piecesContainer.style.display = 'flex';
        piecesContainer.style.flexWrap = 'wrap';
        piecesContainer.style.justifyContent = 'center';
        piecesContainer.style.marginTop = '20px';
        piecesContainer.style.width = '600px';
        piecesContainer.style.minHeight = '100px';
        piecesContainer.style.border = '2px solid #D4B08C';
        piecesContainer.style.padding = '10px';
        piecesContainer.style.background = '#FFF9F3';

        // Thêm thông tin hiện đang sử dụng hình ảnh nào
        const imageInfo = document.createElement('div');
        imageInfo.id = 'puzzleImageInfo';
        imageInfo.style.marginTop = '10px';
        imageInfo.style.fontSize = '14px';
        imageInfo.style.color = '#854D27';
        imageInfo.style.fontStyle = 'italic';
        
        const restartBtn = document.createElement('button');
        restartBtn.textContent = 'Đổi Ảnh Khác';
        restartBtn.style.padding = '10px 20px';
        restartBtn.style.background = '#854D27';
        restartBtn.style.color = '#FFF9F3';
        restartBtn.style.border = '2px solid #D4B08C';
        restartBtn.style.borderRadius = '0';
        restartBtn.style.cursor = 'pointer';
        restartBtn.style.fontSize = '1.1em';
        restartBtn.style.transition = 'all 0.3s';
        restartBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        restartBtn.style.textTransform = 'uppercase';
        restartBtn.style.letterSpacing = '1px';
        restartBtn.addEventListener('click', async () => {
            // Tải lại ảnh mới và khởi tạo lại trò chơi
            await loadPuzzleImages();
            initPuzzleGame();
        });
        restartBtn.addEventListener('mouseover', () => {
            restartBtn.style.transform = 'translate(-2px, -2px)';
            restartBtn.style.boxShadow = '6px 6px 0 #D4B08C';
        });
        restartBtn.addEventListener('mouseout', () => {
            restartBtn.style.transform = 'none';
            restartBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        });

        puzzleContainer.appendChild(closeBtn);
        puzzleContainer.appendChild(title);
        puzzleContainer.appendChild(puzzleArea);
        puzzleContainer.appendChild(piecesContainer);
        puzzleContainer.appendChild(imageInfo);
        puzzleContainer.appendChild(restartBtn);
        puzzleModal.appendChild(puzzleContainer);
        document.body.appendChild(puzzleModal);
    }
    
    // Hiển thị modal
    puzzleModal.style.display = 'flex';
    
    // Trước tiên tải danh sách ảnh, sau đó khởi tạo trò chơi
    loadPuzzleImages().then(() => {
        initPuzzleGame();
    }).catch(error => {
        console.error("Lỗi khi tải ảnh:", error);
        initPuzzleGame(); // Vẫn khởi tạo trò chơi với ảnh mặc định nếu có lỗi
    });
}

function initPuzzleGame() {
    const puzzleArea = document.getElementById('puzzleArea');
    const piecesContainer = document.getElementById('piecesContainer');
    const imageInfo = document.getElementById('puzzleImageInfo');
    
    if (!puzzleArea || !piecesContainer) return;
    
    puzzleArea.innerHTML = '';
    piecesContainer.innerHTML = '';
    
    // Chọn một ảnh ngẫu nhiên từ danh sách
    let imageFile = '1.jpg'; // Ảnh mặc định
    
    if (puzzleGameImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * puzzleGameImages.length);
        imageFile = puzzleGameImages[randomIndex];
    }
    
    // Xác định đường dẫn tới ảnh
    let imageUrl;
    if (window.useLocalMedia) {
        imageUrl = `memory/${imageFile}`;
    } else {
        const baseUrl = 'https://fmvqrwztdoyoworobsix.supabase.co/storage/v1/object/public/media/';
        imageUrl = `${baseUrl}${imageFile}`;
    }
    
    // Hiển thị thông tin ảnh đang được sử dụng
    if (imageInfo) {
        imageInfo.textContent = `Đang sử dụng ảnh: ${imageFile}`;
    }
    
    console.log("Trò chơi ghép hình sử dụng ảnh:", imageUrl);
    
    const gridCols = 4; // 4 cột để ưu tiên chiều ngang
    const gridRows = 2; // 2 hàng để giảm chiều dọc
    const totalPieces = gridCols * gridRows;
    // Điều chỉnh kích thước dựa trên kích thước màn hình, ưu tiên chiều ngang tối đa
    const containerWidth = Math.min(window.innerWidth * 0.9, 600);
    const containerHeight = Math.min(window.innerHeight * 0.4, containerWidth * 0.5); // Tỷ lệ 2:1 
    puzzleArea.style.width = containerWidth + 'px';
    puzzleArea.style.height = containerHeight + 'px';
    puzzleArea.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
    let pieceWidth = containerWidth / gridCols;
    let pieceHeight = containerHeight / gridRows;
    let pieces = [];
    let placedPieces = Array(totalPieces).fill(false);
    
    // Tạo một phần tử img tạm thời để kiểm tra ảnh
    const testImage = new Image();
    testImage.onload = () => {
        // Ảnh hợp lệ, tiếp tục tạo trò chơi
        createPuzzleGame(imageUrl);
    };
    testImage.onerror = () => {
        // Ảnh không tồn tại, sử dụng ảnh mặc định
        console.error("Không thể tải ảnh:", imageUrl);
        imageUrl = 'memory/1.jpg'; // Ảnh mặc định
        createPuzzleGame(imageUrl);
    };
    testImage.src = imageUrl;
    
    // Hàm tạo trò chơi ghép hình
    function createPuzzleGame(imgUrl) {
        // Tạo các ô trống trong khu vực ghép hình
        for (let i = 0; i < totalPieces; i++) {
            const slot = document.createElement('div');
            slot.style.width = pieceWidth + 'px';
            slot.style.height = pieceHeight + 'px';
            slot.style.border = '1px dashed #D4B08C';
            slot.dataset.index = i;
            slot.addEventListener('dragover', (e) => e.preventDefault());
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                const pieceId = e.dataTransfer.getData('text');
                const piece = document.getElementById(pieceId);
                if (piece && !placedPieces[slot.dataset.index]) {
                    const correctIndex = piece.dataset.correctIndex;
                    slot.appendChild(piece);
                    piece.style.position = 'static';
                    piece.style.width = '100%';
                    piece.style.height = '100%';
                    placedPieces[slot.dataset.index] = true;
                    piece.dataset.currentIndex = slot.dataset.index;
                    checkPuzzleCompletion();
                }
            });
            puzzleArea.appendChild(slot);
        }
        
        // Tạo các mảnh ghép
        for (let y = 0; y < gridRows; y++) {
            for (let x = 0; x < gridCols; x++) {
                const index = y * gridCols + x;
                const piece = document.createElement('div');
                piece.id = 'piece-' + index;
                piece.draggable = true;
                piece.style.width = pieceWidth + 'px';
                piece.style.height = pieceHeight + 'px';
                piece.style.backgroundImage = `url(${imgUrl})`;
                piece.style.backgroundSize = `${containerWidth}px ${containerHeight}px`;
                piece.style.backgroundPosition = `-${x * pieceWidth}px -${y * pieceHeight}px`;
                piece.style.border = '1px solid #D4B08C';
                piece.style.cursor = 'move';
                piece.dataset.correctIndex = index;
                piece.classList.add('puzzle-piece');
                piece.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text', piece.id);
                    if (piece.dataset.currentIndex !== undefined) {
                        placedPieces[piece.dataset.currentIndex] = false;
                    }
                });
                pieces.push(piece);
            }
        }
        
        // Xáo trộn các mảnh ghép
        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }
        
        // Đặt các mảnh ghép vào khu vực chứa
        pieces.forEach(piece => {
            piece.style.margin = '5px';
            piecesContainer.appendChild(piece);
        });
    }
}

function checkPuzzleCompletion() {
    const slots = document.querySelectorAll('#puzzleArea > div');
    let isComplete = true;
    let filledSlots = 0;
    for (let slot of slots) {
        const slotIndex = slot.dataset.index;
        const piece = slot.querySelector('.puzzle-piece');
        if (!piece || piece.dataset.correctIndex !== slotIndex) {
            isComplete = false;
        } else {
            filledSlots++;
        }
    }
    if (isComplete && filledSlots === slots.length) {
        setTimeout(() => {
            alert('Chúc mừng! Bạn đã hoàn thành ghép hình!');
        }, 300);
    }
}

// Chia sẻ mạng xã hội
function initSocialShare() {
    const shareButtons = document.querySelectorAll('.share-button');
    shareButtons.forEach(button => {
        button.addEventListener('click', () => {
            const platform = button.dataset.platform;
            shareOnSocialMedia(platform);
        });
    });
    
    const eCardBtn = document.getElementById('createECard');
    if (eCardBtn) {
        eCardBtn.addEventListener('click', openECardGenerator);
    }
}

// Hàm mở trình tạo thẻ chúc mừng điện tử
function openECardGenerator() {
    let eCardModal = document.getElementById('eCardModal');
    if (!eCardModal) {
        eCardModal = document.createElement('div');
        eCardModal.id = 'eCardModal';
        eCardModal.style.position = 'fixed';
        eCardModal.style.top = '0';
        eCardModal.style.left = '0';
        eCardModal.style.width = '100%';
        eCardModal.style.height = '100%';
        eCardModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        eCardModal.style.display = 'flex';
        eCardModal.style.justifyContent = 'center';
        eCardModal.style.alignItems = 'center';
        eCardModal.style.zIndex = '10000';
        eCardModal.style.display = 'none';

        const eCardContainer = document.createElement('div');
        eCardContainer.style.background = '#FFF9F3';
        eCardContainer.style.border = '2px solid #D4B08C';
        eCardContainer.style.borderRadius = '0';
        eCardContainer.style.padding = '20px';
        eCardContainer.style.width = '90%';
        eCardContainer.style.maxWidth = '500px';
        eCardContainer.style.maxHeight = '80vh';
        eCardContainer.style.overflowY = 'auto';
        eCardContainer.style.boxShadow = '8px 8px 0 #D4B08C';
        eCardContainer.style.position = 'relative';
        eCardContainer.style.textAlign = 'center';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            eCardModal.style.display = 'none';
        });

        const title = document.createElement('h2');
        title.textContent = 'Tạo Thẻ Chúc Mừng';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';

        const form = document.createElement('div');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.gap = '15px';
        form.style.marginBottom = '20px';

        const messageInput = document.createElement('textarea');
        messageInput.id = 'eCardMessage';
        messageInput.placeholder = 'Nhập lời chúc của bạn...';
        messageInput.style.width = '100%';
        messageInput.style.height = '100px';
        messageInput.style.padding = '10px';
        messageInput.style.border = '2px solid #D4B08C';
        messageInput.style.borderRadius = '0';
        messageInput.style.marginBottom = '20px';
        messageInput.style.fontFamily = '\'Old Standard TT\', serif';
        messageInput.style.fontSize = '16px';
        messageInput.style.background = '#FFF9F3';
        messageInput.style.color = '#2C1810';
        messageInput.style.resize = 'none';

        const imageSelect = document.createElement('select');
        imageSelect.id = 'eCardImage';
        imageSelect.style.width = '100%';
        imageSelect.style.padding = '10px';
        imageSelect.style.border = '2px solid #D4B08C';
        imageSelect.style.borderRadius = '0';
        imageSelect.style.fontFamily = '\'Old Standard TT\', serif';
        imageSelect.style.fontSize = '16px';
        imageSelect.style.background = '#FFF9F3';
        imageSelect.style.color = '#2C1810';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Chọn hình nền thẻ';
        imageSelect.appendChild(defaultOption);
        // Thêm các tùy chọn hình nền từ thư mục memory (giả định)
        for (let i = 1; i <= 5; i++) {
            const option = document.createElement('option');
            option.value = `memory/${i}.jpg`;
            option.textContent = `Hình nền ${i}`;
            imageSelect.appendChild(option);
        }

        const generateBtn = document.createElement('button');
        generateBtn.textContent = 'Tạo Thẻ và Chia Sẻ';
        generateBtn.style.padding = '10px 20px';
        generateBtn.style.background = '#854D27';
        generateBtn.style.color = '#FFF9F3';
        generateBtn.style.border = '2px solid #D4B08C';
        generateBtn.style.borderRadius = '0';
        generateBtn.style.cursor = 'pointer';
        generateBtn.style.fontSize = '1.1em';
        generateBtn.style.transition = 'all 0.3s';
        generateBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        generateBtn.style.textTransform = 'uppercase';
        generateBtn.style.letterSpacing = '1px';
        generateBtn.addEventListener('click', generateECard);
        generateBtn.addEventListener('mouseover', () => {
            generateBtn.style.transform = 'translate(-2px, -2px)';
            generateBtn.style.boxShadow = '6px 6px 0 #D4B08C';
        });
        generateBtn.addEventListener('mouseout', () => {
            generateBtn.style.transform = 'none';
            generateBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        });

        form.appendChild(messageInput);
        form.appendChild(imageSelect);
        form.appendChild(generateBtn);

        eCardContainer.appendChild(closeBtn);
        eCardContainer.appendChild(title);
        eCardContainer.appendChild(form);
        eCardModal.appendChild(eCardContainer);
        document.body.appendChild(eCardModal);
    }
    eCardModal.style.display = 'flex';
}

// Hàm tạo thẻ chúc mừng điện tử
function generateECard() {
    const message = document.getElementById('eCardMessage').value.trim();
    const imageUrl = document.getElementById('eCardImage').value;
    
    if (!message || !imageUrl) {
        alert('Vui lòng nhập lời chúc và chọn hình nền!');
        return;
    }
    
    // Tạo liên kết chia sẻ (giả định, có thể tích hợp API thực tế nếu cần)
    const encodedMessage = encodeURIComponent(message);
    const encodedImage = encodeURIComponent(imageUrl);
    const eCardLink = `${window.location.origin}/ecard?message=${encodedMessage}&image=${encodedImage}`;
    
    // Hiển thị liên kết để chia sẻ
    const modalContent = document.querySelector('#eCardModal .modal-content');
    const shareSection = document.createElement('div');
    shareSection.style.marginTop = '20px';
    shareSection.style.textAlign = 'center';
    shareSection.innerHTML = `
        <p style="margin-bottom: 10px; color: #854D27;">Sao chép liên kết để chia sẻ thẻ chúc mừng:</p>
        <input type="text" value="${eCardLink}" readonly style="width: 100%; padding: 10px; border: 2px solid #D4B08C; background: #FFF9F3; color: #2C1810; font-family: 'Old Standard TT', serif; font-size: 14px;">
        <button onclick="copyECardLink(this)" style="margin-top: 10px; padding: 8px 15px; background: #854D27; color: #FFF9F3; border: 2px solid #D4B08C; cursor: pointer; font-size: 1em; transition: all 0.3s; box-shadow: 4px 4px 0 #D4B08C;">Sao Chép Liên Kết</button>
    `;
    modalContent.appendChild(shareSection);
    
    // Xem trước thẻ chúc mừng
    const preview = document.createElement('div');
    preview.style.marginTop = '20px';
    preview.style.border = '2px solid #D4B08C';
    preview.style.padding = '10px';
    preview.style.backgroundImage = `url(${imageUrl})`;
    preview.style.backgroundSize = 'cover';
    preview.style.backgroundPosition = 'center';
    preview.style.height = '200px';
    preview.style.display = 'flex';
    preview.style.alignItems = 'center';
    preview.style.justifyContent = 'center';
    preview.style.color = '#FFF9F3';
    preview.style.textShadow = '1px 1px 2px #000';
    preview.style.fontFamily = '\'Old Standard TT\', serif';
    preview.style.fontSize = '16px';
    preview.style.textAlign = 'center';
    preview.textContent = message;
    modalContent.appendChild(preview);
    
    console.log(`Generated eCard with message: ${message} and image: ${imageUrl}`);
}

// Hàm sao chép liên kết thẻ chúc mừng
function copyECardLink(button) {
    const input = button.previousElementSibling;
    input.select();
    document.execCommand('copy');
    button.textContent = '✓ Đã Sao Chép';
    setTimeout(() => {
        button.textContent = 'Sao Chép Liên Kết';
    }, 2000);
}

function shareOnSocialMedia(platform) {
    const url = window.location.href;
    const birthdayPerson = localStorage.getItem('currentBirthday') || 'bạn thân';
    const text = encodeURIComponent(`Hội Mẹ Bầu Đơn Thân - Chúc mừng sinh nhật ${birthdayPerson}!`);
    
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        'x-twitter': `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
        instagram: `https://www.instagram.com/`, // Instagram không hỗ trợ chia sẻ URL trực tiếp qua web, chỉ mở trang
        whatsapp: `https://api.whatsapp.com/send?text=${text}%20${encodeURIComponent(url)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`,
        email: `mailto:?subject=${encodeURIComponent('Chúc mừng sinh nhật!')}&body=${text}%20${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        setTimeout(() => {
            alert('Cảm ơn bạn đã chia sẻ niềm vui sinh nhật!');
        }, 500);
    } else {
        alert('Nền tảng này hiện không được hỗ trợ.');
    }
}

// Trình phát nhạc
function initMusicPlayer() {
    const playButton = document.getElementById('playMusic');
    const musicPlayer = document.querySelector('.music-player');
    let isPlaying = false;
    let audio = new Audio('happy-birthday.mp3');
    let currentTrack = 'happy-birthday.mp3';

    // Thêm nút chọn nhạc nền
    let selectMusicBtn = document.getElementById('selectMusicBtn');
    if (!selectMusicBtn) {
        selectMusicBtn = document.createElement('button');
        selectMusicBtn.id = 'selectMusicBtn';
        selectMusicBtn.textContent = '🎵 Chọn Nhạc';
        selectMusicBtn.style.marginLeft = '10px';
        selectMusicBtn.style.padding = '8px 12px';
        selectMusicBtn.style.background = '#854D27';
        selectMusicBtn.style.color = '#FFF9F3';
        selectMusicBtn.style.border = '2px solid #D4B08C';
        selectMusicBtn.style.borderRadius = '0';
        selectMusicBtn.style.cursor = 'pointer';
        selectMusicBtn.style.boxShadow = '2px 2px 0 #D4B08C';
        selectMusicBtn.style.transition = 'transform 0.3s';
        selectMusicBtn.addEventListener('click', openMusicSelectionModal);
        selectMusicBtn.addEventListener('mouseover', () => {
            selectMusicBtn.style.transform = 'translate(-2px, -2px)';
            selectMusicBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        });
        selectMusicBtn.addEventListener('mouseout', () => {
            selectMusicBtn.style.transform = 'none';
            selectMusicBtn.style.boxShadow = '2px 2px 0 #D4B08C';
        });
        musicPlayer.appendChild(selectMusicBtn);
    }

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

    // Lưu trạng thái nhạc đang phát
    audio.addEventListener('ended', () => {
        playButton.textContent = '▶️';
        isPlaying = false;
    });

    // Hàm thay đổi nhạc nền
    window.changeMusicTrack = function(trackUrl, trackName) {
        audio.pause();
        playButton.textContent = '▶️';
        isPlaying = false;
        audio = new Audio(trackUrl);
        currentTrack = trackUrl;
        document.querySelector('.song-title').textContent = trackName || 'Nhạc nền tùy chỉnh';
        localStorage.setItem('selectedTrack', trackUrl);
        localStorage.setItem('selectedTrackName', trackName || 'Nhạc nền tùy chỉnh');
    };

    // Khôi phục nhạc đã chọn trước đó nếu có
    const savedTrack = localStorage.getItem('selectedTrack');
    const savedTrackName = localStorage.getItem('selectedTrackName');
    if (savedTrack) {
        audio = new Audio(savedTrack);
        currentTrack = savedTrack;
        document.querySelector('.song-title').textContent = savedTrackName || 'Nhạc nền tùy chỉnh';
    }
}

function openMusicSelectionModal() {
    let musicModal = document.getElementById('musicSelectionModal');
    if (!musicModal) {
        musicModal = document.createElement('div');
        musicModal.id = 'musicSelectionModal';
        musicModal.style.position = 'fixed';
        musicModal.style.top = '0';
        musicModal.style.left = '0';
        musicModal.style.width = '100%';
        musicModal.style.height = '100%';
        musicModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        musicModal.style.display = 'flex';
        musicModal.style.justifyContent = 'center';
        musicModal.style.alignItems = 'center';
        musicModal.style.zIndex = '10000';
        musicModal.style.display = 'none';

        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.border = '2px solid #D4B08C';
        modalContent.style.borderRadius = '0';
        modalContent.style.padding = '20px';
        modalContent.style.width = '80%';
        modalContent.style.maxWidth = '500px';
        modalContent.style.boxShadow = '8px 8px 0 #D4B08C';
        modalContent.style.position = 'relative';
        modalContent.style.textAlign = 'center';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            musicModal.style.display = 'none';
        });

        const title = document.createElement('h2');
        title.textContent = 'Chọn Nhạc Nền Sinh Nhật';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';

        const trackList = document.createElement('div');
        trackList.id = 'trackList';
        trackList.style.marginBottom = '20px';
        trackList.style.textAlign = 'left';
        trackList.style.maxHeight = '200px';
        trackList.style.overflowY = 'scroll';

        // Danh sách nhạc mẫu (có thể thay thế bằng file thực tế nếu có)
        const tracks = [
            { url: 'happy-birthday.mp3', name: 'Happy Birthday Song (Default)' },
            { url: 'https://www.bensound.com/bensound-music/bensound-slowmotion.mp3', name: 'Slow Motion' },
            { url: 'https://www.bensound.com/bensound-music/bensound-sunny.mp3', name: 'Sunny' }
        ];

        tracks.forEach(track => {
            const trackItem = document.createElement('div');
            trackItem.style.padding = '10px';
            trackItem.style.borderBottom = '1px solid #D4B08C';
            trackItem.style.cursor = 'pointer';
            trackItem.style.color = '#2C1810';
            trackItem.textContent = track.name;
            trackItem.addEventListener('click', () => {
                window.changeMusicTrack(track.url, track.name);
                musicModal.style.display = 'none';
            });
            trackList.appendChild(trackItem);
        });

        const uploadInput = document.createElement('input');
        uploadInput.type = 'file';
        uploadInput.accept = 'audio/mp3, audio/wav';
        uploadInput.style.width = '100%';
        uploadInput.style.padding = '10px 0';
        uploadInput.style.marginTop = '10px';
        uploadInput.style.border = '2px dashed #D4B08C';
        uploadInput.style.background = '#FFF9F3';
        uploadInput.style.color = '#2C1810';
        uploadInput.style.cursor = 'pointer';
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    window.changeMusicTrack(event.target.result, file.name);
                    musicModal.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });

        const uploadLabel = document.createElement('label');
        uploadLabel.textContent = 'Tải lên nhạc nền của bạn (MP3/WAV)';
        uploadLabel.style.display = 'block';
        uploadLabel.style.marginTop = '15px';
        uploadLabel.style.color = '#854D27';
        uploadLabel.style.fontSize = '1em';

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(trackList);
        modalContent.appendChild(uploadLabel);
        modalContent.appendChild(uploadInput);
        musicModal.appendChild(modalContent);
        document.body.appendChild(musicModal);
    }
    musicModal.style.display = 'flex';
}

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
    // Thêm nút xem video chúc mừng nếu có dữ liệu
    displaySavedVideoMessages();
}

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
        recordModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        recordModal.style.display = 'flex';
        recordModal.style.justifyContent = 'center';
        recordModal.style.alignItems = 'center';
        recordModal.style.zIndex = '10000';
        recordModal.style.display = 'none';

        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.border = '2px solid #D4B08C';
        modalContent.style.borderRadius = '0';
        modalContent.style.padding = '20px';
        modalContent.style.width = '80%';
        modalContent.style.maxWidth = '500px';
        modalContent.style.boxShadow = '8px 8px 0 #D4B08C';
        modalContent.style.position = 'relative';
        modalContent.style.textAlign = 'center';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            recordModal.style.display = 'none';
        });

        const title = document.createElement('h2');
        title.textContent = 'Ghi Âm Lời Chúc Sinh Nhật';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';

        const status = document.createElement('p');
        status.id = 'recordStatus';
        status.textContent = 'Nhấn nút để bắt đầu ghi âm...';
        status.style.color = '#2C1810';
        status.style.marginBottom = '20px';
        status.style.fontSize = '1.1em';

        const senderNameInputRecord = document.createElement('input');
        senderNameInputRecord.id = 'senderNameInputRecord';
        senderNameInputRecord.type = 'text';
        senderNameInputRecord.placeholder = 'Nhập tên của bạn...';
        senderNameInputRecord.style.width = '100%';
        senderNameInputRecord.style.padding = '10px';
        senderNameInputRecord.style.border = '2px solid #D4B08C';
        senderNameInputRecord.style.borderRadius = '0';
        senderNameInputRecord.style.marginBottom = '20px';
        senderNameInputRecord.style.fontFamily = '\'Old Standard TT\', serif';
        senderNameInputRecord.style.fontSize = '16px';
        senderNameInputRecord.style.background = '#FFF9F3';
        senderNameInputRecord.style.color = '#2C1810';

        const recordControl = document.createElement('button');
        recordControl.id = 'recordControl';
        recordControl.textContent = '🎤 Bắt Đầu Ghi Âm';
        recordControl.style.padding = '10px 20px';
        recordControl.style.background = '#854D27';
        recordControl.style.color = '#FFF9F3';
        recordControl.style.border = '2px solid #D4B08C';
        recordControl.style.borderRadius = '0';
        recordControl.style.cursor = 'pointer';
        recordControl.style.fontSize = '1.1em';
        recordControl.style.transition = 'all 0.3s';
        recordControl.style.boxShadow = '4px 4px 0 #D4B08C';
        recordControl.style.textTransform = 'uppercase';
        recordControl.style.letterSpacing = '1px';
        recordControl.addEventListener('click', toggleRecording);
        recordControl.addEventListener('mouseover', () => {
            recordControl.style.transform = 'translate(-2px, -2px)';
            recordControl.style.boxShadow = '6px 6px 0 #D4B08C';
        });
        recordControl.addEventListener('mouseout', () => {
            recordControl.style.transform = 'none';
            recordControl.style.boxShadow = '4px 4px 0 #D4B08C';
        });

        const saveBtn = document.createElement('button');
        saveBtn.id = 'saveRecording';
        saveBtn.textContent = 'Lưu Lời Chúc';
        saveBtn.style.padding = '10px 20px';
        saveBtn.style.background = '#854D27';
        saveBtn.style.color = '#FFF9F3';
        saveBtn.style.border = '2px solid #D4B08C';
        saveBtn.style.borderRadius = '0';
        saveBtn.style.cursor = 'pointer';
        saveBtn.style.fontSize = '1.1em';
        saveBtn.style.transition = 'all 0.3s';
        saveBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        saveBtn.style.textTransform = 'uppercase';
        saveBtn.style.letterSpacing = '1px';
        saveBtn.style.marginTop = '10px';
        saveBtn.style.display = 'none';
        saveBtn.addEventListener('click', saveAudioMessage);
        saveBtn.addEventListener('mouseover', () => {
            saveBtn.style.transform = 'translate(-2px, -2px)';
            saveBtn.style.boxShadow = '6px 6px 0 #D4B08C';
        });
        saveBtn.addEventListener('mouseout', () => {
            saveBtn.style.transform = 'none';
            saveBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        });

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(senderNameInputRecord);
        modalContent.appendChild(status);
        modalContent.appendChild(recordControl);
        modalContent.appendChild(saveBtn);
        recordModal.appendChild(modalContent);
        document.body.appendChild(recordModal);
    }
    recordModal.style.display = 'flex';
}

let mediaRecorder;
let audioChunks = [];
let isRecording = false;

function toggleRecording() {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
}

function startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Trình duyệt của bạn không hỗ trợ ghi âm!');
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            isRecording = true;
            audioChunks = [];

            mediaRecorder.addEventListener('dataavailable', event => {
                audioChunks.push(event.data);
            });

            const recordControl = document.getElementById('recordControl');
            const status = document.getElementById('recordStatus');
            recordControl.textContent = '⏹ Dừng Ghi Âm';
            status.textContent = 'Đang ghi âm...';
        })
        .catch(err => {
            console.error('Không thể truy cập microphone: ', err);
            alert('Không thể truy cập microphone. Hãy thử lại.');
        });
}

function stopRecording() {
    if (mediaRecorder) {
        mediaRecorder.stop();
        isRecording = false;

        mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            window.currentAudioMessage = audioUrl;

            const recordControl = document.getElementById('recordControl');
            const status = document.getElementById('recordStatus');
            const saveBtn = document.getElementById('saveRecording');
            recordControl.textContent = '🎤 Ghi Âm Lại';
            status.textContent = 'Ghi âm hoàn tất. Nghe thử bằng cách nhấn nút Lưu.';
            saveBtn.style.display = 'block';

            // Dừng stream để giải phóng microphone
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        });

        mediaRecorder = null;
    }
}

function saveAudioMessage() {
    if (window.currentAudioMessage) {
        const senderNameInput = document.getElementById('senderNameInputRecord');
        const senderName = senderNameInput.value.trim() || 'Ẩn danh';
        const birthdayPerson = localStorage.getItem('currentBirthday') || 'unknown';
        
        // Lấy blob từ URL
        fetch(window.currentAudioMessage)
            .then(res => res.blob())
            .then(async audioBlob => {
                // Hiển thị thông báo đang xử lý
                const status = document.getElementById('recordStatus');
                status.textContent = 'Đang tải lời chúc lên...';
                
                try {
                    // Lưu vào Supabase Storage
                    if (typeof saveAudioMessageToSupabase === 'function') {
                        const result = await saveAudioMessageToSupabase(audioBlob, senderName, birthdayPerson);
                        if (result) {
                            alert('Lời chúc ghi âm đã được lưu thành công!');
                            document.getElementById('recordMessageModal').style.display = 'none';
                            senderNameInput.value = '';
                            displaySavedAudioMessages();
                            return;
                        }
                    }
                    
                    // Fallback nếu không thể lưu vào Supabase
                    console.log("Không thể lưu vào Supabase, sử dụng localStorage");
        let audioMessages = JSON.parse(localStorage.getItem('audioMessages') || '{}');
        if (!audioMessages[birthdayPerson]) {
            audioMessages[birthdayPerson] = [];
        }
        audioMessages[birthdayPerson].push({ url: window.currentAudioMessage, sender: senderName });
        localStorage.setItem('audioMessages', JSON.stringify(audioMessages));
                    alert('Lời chúc ghi âm đã được lưu cục bộ!');
        document.getElementById('recordMessageModal').style.display = 'none';
        senderNameInput.value = '';
        displaySavedAudioMessages();
                } catch (error) {
                    console.error('Lỗi khi lưu tin nhắn âm thanh:', error);
                    alert('Đã xảy ra lỗi khi lưu tin nhắn âm thanh.');
                    status.textContent = 'Đã xảy ra lỗi. Vui lòng thử lại.';
                }
            });
    } else {
        alert('Không có bản ghi âm nào để lưu.');
    }
}

async function displaySavedAudioMessages() {
    const birthdayPerson = localStorage.getItem('currentBirthday') || 'unknown';
    let playAudioBtn = document.getElementById('playAudioMessagesBtn');
    const customMessageContainer = document.querySelector('.custom-message-container');
    
    // Thử lấy dữ liệu từ Supabase trước
    let hasMessages = false;
    
    try {
        if (typeof getAudioMessages === 'function' && typeof supabase !== 'undefined') {
            const messages = await getAudioMessages(birthdayPerson);
            if (messages && messages.length > 0) {
                hasMessages = true;
            }
        }
    } catch (error) {
        console.error('Không thể lấy tin nhắn âm thanh từ Supabase:', error);
    }
    
    // Kiểm tra dữ liệu local nếu không có dữ liệu từ Supabase
    if (!hasMessages) {
        const audioMessages = JSON.parse(localStorage.getItem('audioMessages') || '{}');
        const messages = audioMessages[birthdayPerson] || [];
        hasMessages = messages.length > 0;
    }
    
    if (hasMessages) {
        if (!playAudioBtn) {
            playAudioBtn = document.createElement('button');
            playAudioBtn.id = 'playAudioMessagesBtn';
            playAudioBtn.className = 'feature-button';
            playAudioBtn.textContent = '🎧 Nghe Lời Chúc Ghi Âm';
            playAudioBtn.style.marginTop = '10px';
            playAudioBtn.addEventListener('click', () => {
                openAudioMessagesModal(birthdayPerson);
            });
            customMessageContainer.appendChild(playAudioBtn);
        }
        playAudioBtn.style.display = 'block';
    } else if (playAudioBtn) {
        playAudioBtn.style.display = 'none';
    }
}

async function openAudioMessagesModal(birthdayPerson) {
    let audioModal = document.getElementById('audioMessagesModal');
    if (!audioModal) {
        audioModal = document.createElement('div');
        audioModal.id = 'audioMessagesModal';
        audioModal.style.position = 'fixed';
        audioModal.style.top = '0';
        audioModal.style.left = '0';
        audioModal.style.width = '100%';
        audioModal.style.height = '100%';
        audioModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        audioModal.style.display = 'flex';
        audioModal.style.justifyContent = 'center';
        audioModal.style.alignItems = 'center';
        audioModal.style.zIndex = '10000';
        audioModal.style.display = 'none';

        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.border = '2px solid #D4B08C';
        modalContent.style.borderRadius = '0';
        modalContent.style.padding = '20px';
        modalContent.style.width = '80%';
        modalContent.style.maxWidth = '500px';
        modalContent.style.boxShadow = '8px 8px 0 #D4B08C';
        modalContent.style.position = 'relative';
        modalContent.style.textAlign = 'center';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            audioModal.style.display = 'none';
        });

        const title = document.createElement('h2');
        title.textContent = 'Lời Chúc Ghi Âm';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';

        const audioList = document.createElement('div');
        audioList.id = 'audioMessagesList';
        audioList.style.marginBottom = '20px';
        audioList.style.textAlign = 'left';
        audioList.style.maxHeight = '300px';
        audioList.style.overflowY = 'scroll';

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(audioList);
        audioModal.appendChild(modalContent);
        document.body.appendChild(audioModal);
    }
    audioModal.style.display = 'flex';

    const audioList = document.getElementById('audioMessagesList');
    audioList.innerHTML = '';
    
    // Hiển thị thông báo đang tải
    const loadingMsg = document.createElement('p');
    loadingMsg.textContent = 'Đang tải lời chúc ghi âm...';
    loadingMsg.style.color = '#2C1810';
    audioList.appendChild(loadingMsg);
    
    let messagesLoaded = false;
    
    // Lấy tin nhắn từ Supabase
    try {
        if (typeof getAudioMessages === 'function' && typeof supabase !== 'undefined') {
            const supabaseMessages = await getAudioMessages(birthdayPerson);
            if (supabaseMessages && supabaseMessages.length > 0) {
                messagesLoaded = true;
                audioList.innerHTML = ''; // Xóa thông báo đang tải
                
                // Hiển thị tiêu đề phần Supabase
                const supabaseTitle = document.createElement('h3');
                supabaseTitle.textContent = 'Lời chúc trực tuyến';
                supabaseTitle.style.color = '#854D27';
                supabaseTitle.style.marginBottom = '10px';
                supabaseTitle.style.borderBottom = '1px solid #D4B08C';
                audioList.appendChild(supabaseTitle);
                
                // Hiển thị tin nhắn từ Supabase
                supabaseMessages.forEach((messageObj, index) => {
                    const audioItem = document.createElement('div');
                    audioItem.style.padding = '10px';
                    audioItem.style.borderBottom = '1px solid #D4B08C';
                    audioItem.style.cursor = 'pointer';
                    audioItem.style.color = '#2C1810';
                    audioItem.textContent = `Lời chúc ${index + 1} từ ${messageObj.sender}`;
                    audioItem.addEventListener('click', () => {
                        playAudioMessage(messageObj.audio_data);
                    });
                    audioList.appendChild(audioItem);
                });
            }
        }
    } catch (error) {
        console.error('Không thể lấy tin nhắn âm thanh từ Supabase:', error);
    }
    
    // Lấy tin nhắn từ localStorage
    const audioMessages = JSON.parse(localStorage.getItem('audioMessages') || '{}');
    const localMessages = audioMessages[birthdayPerson] || [];
    
    if (localMessages.length > 0) {
        if (messagesLoaded) {
            // Nếu đã có tin nhắn từ Supabase, thêm tiêu đề cho phần local
            const localTitle = document.createElement('h3');
            localTitle.textContent = 'Lời chúc cục bộ';
            localTitle.style.color = '#854D27';
            localTitle.style.marginTop = '20px';
            localTitle.style.marginBottom = '10px';
            localTitle.style.borderBottom = '1px solid #D4B08C';
            audioList.appendChild(localTitle);
        } else {
            // Nếu chưa có tin nhắn nào, xóa thông báo đang tải
            audioList.innerHTML = '';
            messagesLoaded = true;
        }
        
        // Hiển thị tin nhắn từ localStorage
        localMessages.forEach((messageObj, index) => {
            const audioItem = document.createElement('div');
            audioItem.style.padding = '10px';
            audioItem.style.borderBottom = '1px solid #D4B08C';
            audioItem.style.cursor = 'pointer';
            audioItem.style.color = '#2C1810';
            audioItem.textContent = `Lời chúc ${index + 1} từ ${messageObj.sender}`;
            audioItem.addEventListener('click', () => {
                playAudioMessage(messageObj.url);
            });
            audioList.appendChild(audioItem);
        });
    }
    
    // Nếu không có tin nhắn nào từ cả hai nguồn
    if (!messagesLoaded && localMessages.length === 0) {
        audioList.innerHTML = '';
        const noMessages = document.createElement('p');
        noMessages.textContent = 'Chưa có lời chúc ghi âm nào.';
        noMessages.style.color = '#2C1810';
        audioList.appendChild(noMessages);
    }
}

// Hiển thị lời chúc cá nhân
function displayCustomMessage(message) {
    const customMessageDisplay = document.getElementById('customMessageDisplay');
    if (customMessageDisplay) {
        customMessageDisplay.textContent = message;
        customMessageDisplay.style.display = 'block';
        // Reset opacity để hiệu ứng hoạt hình chạy lại
        customMessageDisplay.style.opacity = '0';
        customMessageDisplay.style.width = '0';
        setTimeout(() => {
            customMessageDisplay.style.opacity = '1';
            customMessageDisplay.style.width = '100%';
        }, 100);
    }
}

// Hiển thị lời chúc đã lưu
function displaySavedCustomMessage() {
    const savedMessage = localStorage.getItem('customBirthdayMessage');
    if (savedMessage) {
        displayCustomMessage(savedMessage);
    }
}

// Thiết lập event listener cho nút cho phép sử dụng microphone
document.addEventListener('DOMContentLoaded', function() {
    const micPermissionBtn = document.getElementById('micPermissionBtn');
    if (micPermissionBtn) {
        micPermissionBtn.addEventListener('click', function() {
            setupAudioAnalysis();
            this.style.display = 'none';
            document.getElementById('blowButton').style.display = 'inline-block';
            document.getElementById('audioFeedback').style.display = 'block';
            document.getElementById('progressContainer').style.display = 'block';
        });
    }

    // Thiết lập event listener cho nút thổi nến thủ công
    const blowButton = document.getElementById('blowButton');
    if (blowButton) {
        let buttonClickCount = 0;
        blowButton.addEventListener('click', function() {
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
    }

    // Khởi tạo tính năng mời bạn bè
    initInviteFriends();
    // Khởi tạo tính năng cộng đồng
    initCommunityFeatures();
    // Khởi tạo quà tặng ảo
    initVirtualGift();
});

// Khởi tạo quà tặng ảo
function initVirtualGift() {
    // Không cần tìm virtualGiftBtn nữa vì đã bỏ nút này
    // Chỉ cần đảm bảo modal và các phần tử liên quan vẫn hoạt động cho phần chọn quà trong bảng tin
    
    const virtualGiftModal = document.getElementById('virtualGiftModal');
    if (!virtualGiftModal) {
        console.error('Không tìm thấy phần tử #virtualGiftModal');
        return;
    }
    
    const closeVirtualGift = document.getElementById('closeVirtualGift');
    const submitGift = document.getElementById('submitGift');
    if (!closeVirtualGift || !submitGift) {
        console.error('Không tìm thấy phần tử closeVirtualGift hoặc submitGift');
        return;
    }
    
    let selectedGift = null;
    
    closeVirtualGift.addEventListener('click', () => {
        virtualGiftModal.style.display = 'none';
    });
    
    virtualGiftModal.addEventListener('click', (e) => {
        if (e.target === virtualGiftModal) {
            virtualGiftModal.style.display = 'none';
        }
    });
    
    submitGift.addEventListener('click', () => {
        const senderInput = document.getElementById('giftSender');
        const sender = senderInput ? senderInput.value.trim() || 'Ẩn danh' : 'Ẩn danh';
        
        if (selectedGift) {
            saveVirtualGift(sender, selectedGift);
            if (senderInput) senderInput.value = '';
            virtualGiftModal.style.display = 'none';
            alert('Quà tặng ảo đã được gửi!');
            displaySavedVirtualGifts();
        } else {
            alert('Vui lòng chọn một món quà!');
        }
    });
}

// Tải danh sách quà tặng ảo
function loadGiftList() {
    const giftListContainer = document.getElementById('giftList');
    giftListContainer.innerHTML = '';
    
    const gifts = [
        { id: 'flower', name: 'Hoa 🌸', emoji: '🌸' },
        { id: 'cake', name: 'Bánh Sinh Nhật 🎂', emoji: '🎂' },
        { id: 'gift', name: 'Hộp Quà 🎁', emoji: '🎁' },
        { id: 'balloon', name: 'Bóng Bay 🎈', emoji: '🎈' },
        { id: 'heart', name: 'Trái Tim ❤️', emoji: '❤️' }
    ];
    
    gifts.forEach(gift => {
        const giftItem = document.createElement('div');
        giftItem.className = 'gift-item';
        giftItem.style.padding = '10px';
        giftItem.style.margin = '5px';
        giftItem.style.border = '2px solid #D4B08C';
        giftItem.style.background = 'rgba(255, 249, 243, 0.5)';
        giftItem.style.cursor = 'pointer';
        giftItem.style.textAlign = 'center';
        giftItem.style.display = 'inline-block';
        giftItem.style.width = 'calc(33.33% - 10px)';
        giftItem.style.boxSizing = 'border-box';
        giftItem.innerHTML = `
            <span style="font-size: 2em;">${gift.emoji}</span>
            <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #854D27;">${gift.name}</p>
        `;
        giftItem.dataset.giftId = gift.id;
        giftItem.addEventListener('click', function() {
            document.querySelectorAll('.gift-item').forEach(item => item.style.background = 'rgba(255, 249, 243, 0.5)');
            this.style.background = 'rgba(133, 77, 39, 0.3)';
            window.selectedGift = gift;
        });
        giftListContainer.appendChild(giftItem);
    });
}

// Hàm lấy tên quà tặng từ id
function getGiftName(giftId) {
    const gifts = {
        'cake': 'Bánh Sinh Nhật',
        'balloon': 'Bong Bóng',
        'gift': 'Hộp Quà',
        'flower': 'Hoa',
        'chocolate': 'Chocolate',
        'card': 'Thiệp',
        'wine': 'Rượu Vang',
        'teddy': 'Gấu Bông',
        'heart': 'Trái Tim'
    };
    return gifts[giftId] || 'Quà Tặng';
}

// Hàm lấy biểu tượng emoji cho quà tặng
function getGiftEmoji(giftId) {
    const giftEmojis = {
        flower: '🌸',
        cake: '🎂',
        gift: '🎁',
        balloon: '🎈',
        heart: '❤️'
    };
    return giftEmojis[giftId] || '🎁';
}

// Lưu quà tặng ảo vào Supabase
async function saveVirtualGift(sender, gift) {
    try {
        if (sender && sender.trim()) {
            // Lưu tên người dùng nếu có
            saveUsername(sender);
        }
        
        const birthdayPerson = localStorage.getItem('currentBirthday') || 'unknown';
        
        // Lưu quà tặng ảo vào Supabase
        const giftData = { 
            sender: sender,
            gift_id: gift.id,
            birthday_person: birthdayPerson
        };
        
        const { error } = await supabase
            .from('virtual_gifts')
            .insert([giftData]);
            
        if (error) throw error;
        
        // Cập nhật hiển thị quà tặng
        await displaySavedVirtualGifts();
        
        // Cập nhật display trong Bảng tin chúc mừng
        const selectedGiftDisplay = document.getElementById('selectedGiftDisplay');
        if (selectedGiftDisplay) {
            selectedGiftDisplay.innerHTML = `Đã chọn: ${gift.emoji} ${gift.name}`;
            selectedGiftDisplay.style.display = 'block';
            selectedGiftDisplay.dataset.giftId = gift.id;
        }
        
        return true;
    } catch (error) {
        console.error('Lỗi khi lưu quà tặng:', error);
        
        // Fallback to localStorage if Supabase fails
    const birthdayPerson = localStorage.getItem('currentBirthday') || 'unknown';
    const now = new Date();
    const time = now.toLocaleString('vi-VN');
    const giftData = { sender, giftId: gift.id, giftName: gift.name, time };
    let virtualGifts = JSON.parse(localStorage.getItem('virtualGifts') || '{}');
    if (!virtualGifts[birthdayPerson]) {
        virtualGifts[birthdayPerson] = [];
    }
    virtualGifts[birthdayPerson].push(giftData);
    localStorage.setItem('virtualGifts', JSON.stringify(virtualGifts));
        
        // Cập nhật display trong Bảng tin chúc mừng
        const selectedGiftDisplay = document.getElementById('selectedGiftDisplay');
        if (selectedGiftDisplay) {
            selectedGiftDisplay.innerHTML = `Đã chọn: ${gift.emoji} ${gift.name}`;
            selectedGiftDisplay.style.display = 'block';
            selectedGiftDisplay.dataset.giftId = gift.id;
        }
        
        return false;
    }
}

// Hiển thị quà tặng ảo đã lưu
async function displaySavedVirtualGifts() {
    try {
    const birthdayPerson = localStorage.getItem('currentBirthday') || 'unknown';
        
        // Lấy danh sách quà tặng từ Supabase
        const { data: gifts, error } = await supabase
            .from('virtual_gifts')
            .select('*')
            .eq('birthday_person', birthdayPerson)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        // Cập nhật UI
    let viewGiftsBtn = document.getElementById('viewVirtualGiftsBtn');
    const customMessageContainer = document.querySelector('.custom-message-container');
    
        if (gifts && gifts.length > 0) {
        if (!viewGiftsBtn) {
            viewGiftsBtn = document.createElement('button');
            viewGiftsBtn.id = 'viewVirtualGiftsBtn';
            viewGiftsBtn.className = 'feature-button';
            viewGiftsBtn.textContent = '🎁 Xem Quà Tặng Ảo';
            viewGiftsBtn.addEventListener('click', () => {
                openVirtualGiftsModal(birthdayPerson);
            });
            customMessageContainer.appendChild(viewGiftsBtn);
        }
        viewGiftsBtn.style.display = 'block';
    } else if (viewGiftsBtn) {
        viewGiftsBtn.style.display = 'none';
    }
    } catch (error) {
        console.error('Lỗi khi hiển thị quà tặng:', error);
        
        // Fallback to localStorage if Supabase fails
    const birthdayPerson = localStorage.getItem('currentBirthday') || 'unknown';
    const virtualGifts = JSON.parse(localStorage.getItem('virtualGifts') || '{}');
    const gifts = virtualGifts[birthdayPerson] || [];
    let viewGiftsBtn = document.getElementById('viewVirtualGiftsBtn');
    const customMessageContainer = document.querySelector('.custom-message-container');
    
    if (gifts.length > 0) {
        if (!viewGiftsBtn) {
            viewGiftsBtn = document.createElement('button');
            viewGiftsBtn.id = 'viewVirtualGiftsBtn';
            viewGiftsBtn.className = 'feature-button';
            viewGiftsBtn.textContent = '🎁 Xem Quà Tặng Ảo';
            viewGiftsBtn.addEventListener('click', () => {
                openVirtualGiftsModal(birthdayPerson);
            });
            customMessageContainer.appendChild(viewGiftsBtn);
        }
        viewGiftsBtn.style.display = 'block';
    } else if (viewGiftsBtn) {
        viewGiftsBtn.style.display = 'none';
        }
    }
}

// Mở modal hiển thị danh sách quà tặng ảo đã nhận
async function openVirtualGiftsModal(birthdayPerson) {
    let giftsModal = document.getElementById('virtualGiftsModal');
    if (!giftsModal) {
        giftsModal = document.createElement('div');
        giftsModal.id = 'virtualGiftsModal';
        giftsModal.style.position = 'fixed';
        giftsModal.style.top = '0';
        giftsModal.style.left = '0';
        giftsModal.style.width = '100%';
        giftsModal.style.height = '100%';
        giftsModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        giftsModal.style.display = 'flex';
        giftsModal.style.justifyContent = 'center';
        giftsModal.style.alignItems = 'center';
        giftsModal.style.zIndex = '10000';
        giftsModal.style.display = 'none';

        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.border = '2px solid #D4B08C';
        modalContent.style.borderRadius = '0';
        modalContent.style.padding = '20px';
        modalContent.style.width = '80%';
        modalContent.style.maxWidth = '500px';
        modalContent.style.boxShadow = '8px 8px 0 #D4B08C';
        modalContent.style.position = 'relative';
        modalContent.style.textAlign = 'center';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            giftsModal.style.display = 'none';
        });

        const title = document.createElement('h2');
        title.textContent = 'Quà Tặng Ảo Đã Nhận';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = "'DM Serif Display', serif";

        const giftsList = document.createElement('div');
        giftsList.id = 'virtualGiftsList';
        giftsList.style.marginBottom = '20px';
        giftsList.style.textAlign = 'left';
        giftsList.style.maxHeight = '300px';
        giftsList.style.overflowY = 'scroll';

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(giftsList);
        giftsModal.appendChild(modalContent);
        document.body.appendChild(giftsModal);
    }
    giftsModal.style.display = 'flex';

    try {
        const giftsList = document.getElementById('virtualGiftsList');
        giftsList.innerHTML = '';
        
        // Lấy danh sách quà tặng từ Supabase
        const { data: gifts, error } = await supabase
            .from('virtual_gifts')
            .select('*')
            .eq('birthday_person', birthdayPerson)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        if (gifts && gifts.length > 0) {
            gifts.forEach((giftObj) => {
                const giftItem = document.createElement('div');
                giftItem.style.padding = '10px';
                giftItem.style.borderBottom = '1px solid #D4B08C';
                giftItem.style.color = '#2C1810';
                
                // Format thời gian
                const createdAt = new Date(giftObj.created_at);
                const formattedTime = createdAt.toLocaleString('vi-VN');
                
                giftItem.innerHTML = `
                    <span style="font-size: 1.5em;">${getGiftEmoji(giftObj.gift_id)}</span>
                    <span>${getGiftName(giftObj.gift_id)} từ ${giftObj.sender}</span>
                    <small>(${formattedTime})</small>
                `;
                giftsList.appendChild(giftItem);
            });
        } else {
            const noGifts = document.createElement('p');
            noGifts.textContent = 'Chưa có quà tặng ảo nào.';
            noGifts.style.color = '#2C1810';
            giftsList.appendChild(noGifts);
        }
    } catch (error) {
        console.error('Lỗi khi hiển thị quà tặng:', error);
        
        // Fallback to localStorage if Supabase fails
    const giftsList = document.getElementById('virtualGiftsList');
    giftsList.innerHTML = '';
    const virtualGifts = JSON.parse(localStorage.getItem('virtualGifts') || '{}');
    const gifts = virtualGifts[birthdayPerson] || [];
    if (gifts.length > 0) {
        gifts.forEach((giftObj, index) => {
            const giftItem = document.createElement('div');
            giftItem.style.padding = '10px';
            giftItem.style.borderBottom = '1px solid #D4B08C';
            giftItem.style.color = '#2C1810';
            giftItem.innerHTML = `
                <span style="font-size: 1.5em;">${getGiftEmoji(giftObj.giftId)}</span>
                <span>${giftObj.giftName} từ ${giftObj.sender}</span>
                <small>(${giftObj.time})</small>
            `;
            giftsList.appendChild(giftItem);
        });
    } else {
        const noGifts = document.createElement('p');
        noGifts.textContent = 'Chưa có quà tặng ảo nào.';
        noGifts.style.color = '#2C1810';
        giftsList.appendChild(noGifts);
    }
}
}

// Trình phát nhạc
function initMusicPlayer() {
    const playButton = document.getElementById('playMusic');
    const musicPlayer = document.querySelector('.music-player');
    let isPlaying = false;
    let audio = new Audio('happy-birthday.mp3');
    let currentTrack = 'happy-birthday.mp3';

    // Thêm nút chọn nhạc nền
    let selectMusicBtn = document.getElementById('selectMusicBtn');
    if (!selectMusicBtn) {
        selectMusicBtn = document.createElement('button');
        selectMusicBtn.id = 'selectMusicBtn';
        selectMusicBtn.textContent = '🎵 Chọn Nhạc';
        selectMusicBtn.style.marginLeft = '10px';
        selectMusicBtn.style.padding = '8px 12px';
        selectMusicBtn.style.background = '#854D27';
        selectMusicBtn.style.color = '#FFF9F3';
        selectMusicBtn.style.border = '2px solid #D4B08C';
        selectMusicBtn.style.borderRadius = '0';
        selectMusicBtn.style.cursor = 'pointer';
        selectMusicBtn.style.boxShadow = '2px 2px 0 #D4B08C';
        selectMusicBtn.style.transition = 'transform 0.3s';
        selectMusicBtn.addEventListener('click', openMusicSelectionModal);
        selectMusicBtn.addEventListener('mouseover', () => {
            selectMusicBtn.style.transform = 'translate(-2px, -2px)';
            selectMusicBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        });
        selectMusicBtn.addEventListener('mouseout', () => {
            selectMusicBtn.style.transform = 'none';
            selectMusicBtn.style.boxShadow = '2px 2px 0 #D4B08C';
        });
        musicPlayer.appendChild(selectMusicBtn);
    }

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

    // Lưu trạng thái nhạc đang phát
    audio.addEventListener('ended', () => {
        playButton.textContent = '▶️';
        isPlaying = false;
    });

    // Hàm thay đổi nhạc nền
    window.changeMusicTrack = function(trackUrl, trackName) {
        audio.pause();
        playButton.textContent = '▶️';
        isPlaying = false;
        audio = new Audio(trackUrl);
        currentTrack = trackUrl;
        document.querySelector('.song-title').textContent = trackName || 'Nhạc nền tùy chỉnh';
        localStorage.setItem('selectedTrack', trackUrl);
        localStorage.setItem('selectedTrackName', trackName || 'Nhạc nền tùy chỉnh');
    };

    // Khôi phục nhạc đã chọn trước đó nếu có
    const savedTrack = localStorage.getItem('selectedTrack');
    const savedTrackName = localStorage.getItem('selectedTrackName');
    if (savedTrack) {
        audio = new Audio(savedTrack);
        currentTrack = savedTrack;
        document.querySelector('.song-title').textContent = savedTrackName || 'Nhạc nền tùy chỉnh';
    }
}

function openMusicSelectionModal() {
    let musicModal = document.getElementById('musicSelectionModal');
    if (!musicModal) {
        musicModal = document.createElement('div');
        musicModal.id = 'musicSelectionModal';
        musicModal.style.position = 'fixed';
        musicModal.style.top = '0';
        musicModal.style.left = '0';
        musicModal.style.width = '100%';
        musicModal.style.height = '100%';
        musicModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        musicModal.style.display = 'flex';
        musicModal.style.justifyContent = 'center';
        musicModal.style.alignItems = 'center';
        musicModal.style.zIndex = '10000';
        musicModal.style.display = 'none';

        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.border = '2px solid #D4B08C';
        modalContent.style.borderRadius = '0';
        modalContent.style.padding = '20px';
        modalContent.style.width = '80%';
        modalContent.style.maxWidth = '500px';
        modalContent.style.boxShadow = '8px 8px 0 #D4B08C';
        modalContent.style.position = 'relative';
        modalContent.style.textAlign = 'center';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            musicModal.style.display = 'none';
        });

        const title = document.createElement('h2');
        title.textContent = 'Chọn Nhạc Nền Sinh Nhật';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';

        const trackList = document.createElement('div');
        trackList.id = 'trackList';
        trackList.style.marginBottom = '20px';
        trackList.style.textAlign = 'left';
        trackList.style.maxHeight = '200px';
        trackList.style.overflowY = 'scroll';

        // Danh sách nhạc mẫu (có thể thay thế bằng file thực tế nếu có)
        const tracks = [
            { url: 'happy-birthday.mp3', name: 'Happy Birthday Song (Default)' },
            { url: 'https://www.bensound.com/bensound-music/bensound-slowmotion.mp3', name: 'Slow Motion' },
            { url: 'https://www.bensound.com/bensound-music/bensound-sunny.mp3', name: 'Sunny' }
        ];

        tracks.forEach(track => {
            const trackItem = document.createElement('div');
            trackItem.style.padding = '10px';
            trackItem.style.borderBottom = '1px solid #D4B08C';
            trackItem.style.cursor = 'pointer';
            trackItem.style.color = '#2C1810';
            trackItem.textContent = track.name;
            trackItem.addEventListener('click', () => {
                window.changeMusicTrack(track.url, track.name);
                musicModal.style.display = 'none';
            });
            trackList.appendChild(trackItem);
        });

        const uploadInput = document.createElement('input');
        uploadInput.type = 'file';
        uploadInput.accept = 'audio/mp3, audio/wav';
        uploadInput.style.width = '100%';
        uploadInput.style.padding = '10px 0';
        uploadInput.style.marginTop = '10px';
        uploadInput.style.border = '2px dashed #D4B08C';
        uploadInput.style.background = '#FFF9F3';
        uploadInput.style.color = '#2C1810';
        uploadInput.style.cursor = 'pointer';
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    window.changeMusicTrack(event.target.result, file.name);
                    musicModal.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });

        const uploadLabel = document.createElement('label');
        uploadLabel.textContent = 'Tải lên nhạc nền của bạn (MP3/WAV)';
        uploadLabel.style.display = 'block';
        uploadLabel.style.marginTop = '15px';
        uploadLabel.style.color = '#854D27';
        uploadLabel.style.fontSize = '1em';

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(trackList);
        modalContent.appendChild(uploadLabel);
        modalContent.appendChild(uploadInput);
        musicModal.appendChild(modalContent);
        document.body.appendChild(musicModal);
    }
    musicModal.style.display = 'flex';
}

// Tính năng mời bạn bè
function initInviteFriends() {
    // Kiểm tra xem nút mời bạn bè đã tồn tại chưa, nếu chưa thì tạo mới
    let inviteBtn = document.getElementById('inviteFriendsBtn');
    const customMessageContainer = document.querySelector('.custom-message-container');
    if (!inviteBtn) {
        inviteBtn = document.createElement('button');
        inviteBtn.id = 'inviteFriendsBtn';
        inviteBtn.className = 'feature-button';
        inviteBtn.textContent = '📩 Mời Bạn Bè';
        customMessageContainer.appendChild(inviteBtn);
    }

    inviteBtn.addEventListener('click', () => {
        openInviteModal();
    });

    // Kiểm tra tham số mời trong URL
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');
    if (inviteCode) {
        // Tăng số lượng người tham gia qua lời mời (mô phỏng)
        let inviteCount = parseInt(localStorage.getItem('inviteCount') || '0', 10);
        inviteCount++;
        localStorage.setItem('inviteCount', inviteCount.toString());
        alert(`Bạn đã tham gia qua lời mời! Số người tham gia: ${inviteCount}`);
    }
}

// Hàm lấy tên người có sinh nhật gần nhất hoặc hôm nay
function getNextBirthdayPerson() {
    const currentBirthday = localStorage.getItem('currentBirthday');
    if (currentBirthday) {
        return currentBirthday;
    }
    if (typeof findNextBirthday === 'function') {
        const now = new Date();
        const nextBirthday = findNextBirthday(now);
        return nextBirthday.person ? nextBirthday.person.name : 'người thân yêu';
    }
    return 'người thân yêu';
}

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
        inviteModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        inviteModal.style.display = 'flex';
        inviteModal.style.justifyContent = 'center';
        inviteModal.style.alignItems = 'center';
        inviteModal.style.zIndex = '10000';
        inviteModal.style.display = 'none';

        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.border = '2px solid #D4B08C';
        modalContent.style.borderRadius = '0';
        modalContent.style.padding = '20px';
        modalContent.style.width = '80%';
        modalContent.style.maxWidth = '500px';
        modalContent.style.boxShadow = '8px 8px 0 #D4B08C';
        modalContent.style.position = 'relative';
        modalContent.style.textAlign = 'center';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.fontSize = '30px';
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

        const inviteLink = document.createElement('input');
        inviteLink.id = 'inviteLink';
        inviteLink.type = 'text';
        inviteLink.readOnly = true;
        inviteLink.style.width = '100%';
        inviteLink.style.padding = '10px';
        inviteLink.style.border = '2px solid #D4B08C';
        inviteLink.style.borderRadius = '0';
        inviteLink.style.marginBottom = '10px';
        inviteLink.style.fontFamily = '\'Old Standard TT\', serif';
        inviteLink.style.fontSize = '14px';
        inviteLink.style.background = '#FFF9F3';
        inviteLink.style.color = '#2C1810';
        inviteLink.value = generateInviteLink();

        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Sao Chép Liên Kết';
        copyBtn.style.padding = '8px 15px';
        copyBtn.style.background = '#854D27';
        copyBtn.style.color = '#FFF9F3';
        copyBtn.style.border = '2px solid #D4B08C';
        copyBtn.style.borderRadius = '0';
        copyBtn.style.cursor = 'pointer';
        copyBtn.style.fontSize = '1em';
        copyBtn.style.transition = 'all 0.3s';
        copyBtn.style.boxShadow = '3px 3px 0 #D4B08C';
        copyBtn.style.marginBottom = '20px';
        copyBtn.addEventListener('click', () => {
            inviteLink.select();
            document.execCommand('copy');
            alert('Đã sao chép liên kết mời!');
        });
        copyBtn.addEventListener('mouseover', () => {
            copyBtn.style.transform = 'translate(-2px, -2px)';
            copyBtn.style.boxShadow = '5px 5px 0 #D4B08C';
        });
        copyBtn.addEventListener('mouseout', () => {
            copyBtn.style.transform = 'none';
            copyBtn.style.boxShadow = '3px 3px 0 #D4B08C';
        });

        const inviteMessage = document.createElement('textarea');
        inviteMessage.id = 'inviteMessage';
        inviteMessage.placeholder = 'Nhập lời mời của bạn...';
        inviteMessage.style.width = '100%';
        inviteMessage.style.height = '100px';
        inviteMessage.style.padding = '10px';
        inviteMessage.style.border = '2px solid #D4B08C';
        inviteMessage.style.borderRadius = '0';
        inviteMessage.style.marginBottom = '10px';
        inviteMessage.style.fontFamily = '\'Old Standard TT\', serif';
        inviteMessage.style.fontSize = '16px';
        inviteMessage.style.background = '#FFF9F3';
        inviteMessage.style.color = '#2C1810';
        const birthdayPerson = localStorage.getItem('currentBirthday') || getNextBirthdayPerson();
        inviteMessage.value = `Hãy tham gia chúc mừng sinh nhật ${birthdayPerson} cùng Hội Mẹ Bầu Đơn Thân!`;

        const emailInput = document.createElement('input');
        emailInput.id = 'emailInput';
        emailInput.type = 'email';
        emailInput.placeholder = 'Nhập email người nhận...';
        emailInput.style.width = '100%';
        emailInput.style.padding = '10px';
        emailInput.style.border = '2px solid #D4B08C';
        emailInput.style.borderRadius = '0';
        emailInput.style.marginBottom = '20px';
        emailInput.style.fontFamily = '\'Old Standard TT\', serif';
        emailInput.style.fontSize = '16px';
        emailInput.style.background = '#FFF9F3';
        emailInput.style.color = '#2C1810';

        const sendBtn = document.createElement('button');
        sendBtn.textContent = 'Gửi Lời Mời';
        sendBtn.style.padding = '10px 20px';
        sendBtn.style.background = '#854D27';
        sendBtn.style.color = '#FFF9F3';
        sendBtn.style.border = '2px solid #D4B08C';
        sendBtn.style.borderRadius = '0';
        sendBtn.style.cursor = 'pointer';
        sendBtn.style.fontSize = '1.1em';
        sendBtn.style.transition = 'all 0.3s';
        sendBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        sendBtn.style.textTransform = 'uppercase';
        sendBtn.style.letterSpacing = '1px';
        sendBtn.addEventListener('click', () => {
            const email = emailInput.value.trim();
            const message = inviteMessage.value.trim();
            if (email && message) {
                sendInviteEmail(email, message);
                inviteModal.style.display = 'none';
                emailInput.value = '';
                const birthdayPerson = localStorage.getItem('currentBirthday') || getNextBirthdayPerson();
                inviteMessage.value = `Hãy tham gia chúc mừng sinh nhật ${birthdayPerson} cùng Hội Mẹ Bầu Đơn Thân!`;
            } else {
                alert('Vui lòng nhập email và lời mời!');
            }
        });
        sendBtn.addEventListener('mouseover', () => {
            sendBtn.style.transform = 'translate(-2px, -2px)';
            sendBtn.style.boxShadow = '6px 6px 0 #D4B08C';
        });
        sendBtn.addEventListener('mouseout', () => {
            sendBtn.style.transform = 'none';
            sendBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        });

        const stats = document.createElement('p');
        stats.id = 'inviteStats';
        stats.style.marginTop = '20px';
        stats.style.color = '#854D27';
        stats.style.fontSize = '1.1em';
        stats.textContent = `Số người tham gia qua lời mời: ${localStorage.getItem('inviteCount') || '0'}`;

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(inviteLink);
        modalContent.appendChild(copyBtn);
        modalContent.appendChild(inviteMessage);
        modalContent.appendChild(emailInput);
        modalContent.appendChild(sendBtn);
        modalContent.appendChild(stats);
        inviteModal.appendChild(modalContent);
        document.body.appendChild(inviteModal);
    }
    inviteModal.style.display = 'flex';
    // Cập nhật số liệu thống kê
    document.getElementById('inviteStats').textContent = `Số người tham gia qua lời mời: ${localStorage.getItem('inviteCount') || '0'}`;
}

function generateInviteLink() {
    // Tạo mã mời ngẫu nhiên (trong thực tế, điều này nên được tạo phía máy chủ)
    const inviteCode = Math.random().toString(36).substring(2, 7);
    return `${window.location.origin}${window.location.pathname}?invite=${inviteCode}`;
}

function sendInviteEmail(email, message) {
    // Mô phỏng gửi email (trong thực tế, điều này cần được thực hiện phía máy chủ)
    const subject = encodeURIComponent('Lời Mời Tham Gia Chúc Mừng Sinh Nhật');
    const body = encodeURIComponent(`${message}\n\nTruy cập liên kết: ${document.getElementById('inviteLink').value}`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    // Ghi nhận hành động gửi lời mời
    let inviteSentCount = parseInt(localStorage.getItem('inviteSentCount') || '0', 10);
    inviteSentCount++;
    localStorage.setItem('inviteSentCount', inviteSentCount.toString());
    alert(`Đã gửi lời mời đến ${email}! Số lời mời đã gửi: ${inviteSentCount}`);
}

// Tạo hiệu ứng bóng bay cho trang
function createBalloons() {
    const balloonContainer = document.getElementById('balloonContainer');
    if (!balloonContainer) {
        console.error('Không tìm thấy phần tử #balloonContainer');
        return;
    }
    
    const colors = ['#FF4081', '#536DFE', '#4CAF50', '#FFC107', '#9C27B0', '#F44336'];
    const totalBalloons = 15;
    
    for (let i = 0; i < totalBalloons; i++) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.style.background = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.left = `${Math.random() * 100}%`;
        balloon.style.animationDuration = `${Math.random() * 5 + 5}s`;
        balloon.style.animationDelay = `${Math.random() * 3}s`;
        balloonContainer.appendChild(balloon);
    }
}

// Khởi tạo các tính năng
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra tồn tại của các hàm trước khi gọi
    try {
        if (typeof createBalloons === 'function') createBalloons();
        if (typeof initPhotoAlbum === 'function') initPhotoAlbum();
        if (typeof initGames === 'function') initGames();
        if (typeof initSocialShare === 'function') initSocialShare();
        if (typeof initMusicPlayer === 'function') initMusicPlayer();
    
    // Các tính năng từ community.js
    if (typeof initCustomMessage === 'function') initCustomMessage();
    if (typeof initCommunityFeatures === 'function') initCommunityFeatures();
    if (typeof initInviteFriends === 'function') initInviteFriends();
    
    // Cập nhật hiển thị tin nhắn lưu trữ nếu có
    if (typeof displaySavedCustomMessage === 'function') displaySavedCustomMessage();
    } catch (error) {
        console.error('Lỗi khi khởi tạo các tính năng:', error);
    }
});

// Khai báo hàm saveUsername nếu chưa có trong file
function saveUsername(name) {
    if (typeof window.saveUsername === 'function') {
        // Nếu hàm đã được định nghĩa ở nơi khác (js/community.js), gọi lại hàm đó
        return window.saveUsername(name);
    }
    
    if (name && name.trim() !== '') {
        localStorage.setItem('birthdayChatUserName', name.trim());
        return true;
    }
    return false;
}

function playAudioMessage(audioUrl) {
    let audioPlayer = document.getElementById('audioMessagePlayer');
    if (!audioPlayer) {
        audioPlayer = document.createElement('audio');
        audioPlayer.id = 'audioMessagePlayer';
        audioPlayer.controls = true;
        audioPlayer.style.width = '100%';
        audioPlayer.style.marginTop = '10px';
        const audioList = document.getElementById('audioMessagesList');
        audioList.appendChild(audioPlayer);
    }
    audioPlayer.src = audioUrl;
    audioPlayer.play().catch(e => console.log('Audio play failed:', e));
}