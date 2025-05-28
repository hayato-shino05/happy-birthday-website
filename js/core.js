// Dữ liệu ngày sinh nhật
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
        message: "🎉 Ê Hiệp, sinh nhật vui quá nha mày! 🎉"
    },
    {
        name: "Thành",
        month: 2,
        day: 27,
        message: "🎂 Hội mẹ bầu đơn thân Chúc mừng sinh nhật bé Thành nha 🎂"
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
        message: "🎉 Ê Viện, sinh nhật vui quá nha mày! 🎉"
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

// Thêm CSS nội tuyến cần thiết
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
    .photo-item {
        position: relative;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.3s ease;
    }
    
    .photo-item:hover {
        transform: scale(1.05);
    }
    
    .photo-item:hover .play-icon {
        opacity: 1;
    }
    
    .play-icon {
        opacity: 0.7;
        transition: opacity 0.3s ease;
    }
    
    video.memory-photo {
        object-fit: cover;
        width: 100%;
        height: 100%;
    }
`;

document.head.appendChild(style);

// Kiểm tra xem có phải ngày sinh nhật không
function checkIfBirthday(date) {
    try {
        // Reset time to midnight
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        
        return birthdays.find(person => {
            // So sánh tháng thực tế (1-12) và ngày
            const monthMatch = (checkDate.getMonth() + 1) === person.month;
            const dayMatch = checkDate.getDate() === person.day;
            
            console.log(`Checking ${person.name}:`, {
                personMonth: person.month,
                currentMonth: checkDate.getMonth() + 1,
                monthMatch: monthMatch,
                personDay: person.day,
                currentDay: checkDate.getDate(),
                dayMatch: dayMatch
            });
            
            return monthMatch && dayMatch;
        });
    } catch (error) {
        console.error('Error in checkIfBirthday:', error);
        return null;
    }
}

// Tìm sinh nhật tiếp theo
function findNextBirthday(currentDate) {
    try {
        let nearestPerson = null;
        let nearestDate = null;
        let smallestDiff = Infinity;

        // Tạo một bản sao của mảng birthdays để không ảnh hưởng đến mảng gốc
        const birthdaysList = [...birthdays];

        for (const person of birthdaysList) {
            // Tạo ngày sinh nhật cho năm hiện tại
            let birthday = new Date(currentDate.getFullYear(), person.month - 1, person.day);
            
            // Nếu sinh nhật năm nay đã qua, tính cho năm sau
            if (currentDate > birthday) {
                birthday = new Date(currentDate.getFullYear() + 1, person.month - 1, person.day);
            }

            const diff = birthday - currentDate;
            console.log(`Checking ${person.name}:`, {
                birthday: birthday,
                diff: diff,
                currentSmallest: smallestDiff
            });

            if (diff < smallestDiff && diff >= 0) {
                smallestDiff = diff;
                nearestDate = birthday;
                nearestPerson = person;
                console.log(`New nearest person: ${person.name}`);
            }
        }

        console.log('Final nearest person:', nearestPerson?.name);
        return { person: nearestPerson, date: nearestDate };
    } catch (error) {
        console.error('Error finding next birthday:', error);
        return { person: null, date: null };
    }
}

// Hiển thị đếm ngược
function displayCountdown(targetDate, person) {
    try {
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
                    <div>
                        <span id="days">${days}</span>
                        <div>Ngày</div>
                    </div>
                    <div>
                        <span id="hours">${hours}</span>
                        <div>Giờ</div>
                    </div>
                    <div>
                        <span id="minutes">${minutes}</span>
                        <div>Phút</div>
                    </div>
                    <div>
                        <span id="seconds">${seconds}</span>
                        <div>Giây</div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error displaying countdown:', error);
    }
}

// Cập nhật thời gian đếm ngược
function updateCountdownTime() {
    try {
        const now = new Date();
        console.log('Current date:', now);
        
        // Reset time to midnight to avoid time-of-day issues
        now.setHours(0, 0, 0, 0);
        
        const birthdayPerson = checkIfBirthday(now);
        console.log('Birthday person found:', birthdayPerson);

        // Nếu hôm nay là sinh nhật
        if (birthdayPerson) {
            const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
            const lastShownDate = localStorage.getItem('lastBirthdayShown');
            console.log('Today:', today, 'Last shown:', lastShownDate);
            
            // Nếu chưa hiển thị sinh nhật hôm nay
            if (lastShownDate !== today) {
                console.log('Showing birthday content for:', birthdayPerson.name);
                localStorage.setItem('lastBirthdayShown', today);
                localStorage.setItem('currentBirthday', birthdayPerson.name);
                showBirthdayContent(birthdayPerson);
            }
        } else {
            // Xóa dữ liệu sinh nhật cũ
            localStorage.removeItem('lastBirthdayShown');
            localStorage.removeItem('currentBirthday');
            
            // Tìm và hiển thị đếm ngược đến sinh nhật tiếp theo
            const nextBirthday = findNextBirthday(now);
            if (nextBirthday.person) {
                displayCountdown(nextBirthday.date, nextBirthday.person);
            }
        }
    } catch (error) {
        console.error('Error in updateCountdownTime:', error);
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
        birthdayTitle.style.display = 'block';
        birthdayTitle.style.opacity = '1';
    }

    const birthdayMessage = document.getElementById('birthdayMessage');
    if (birthdayMessage) {
        birthdayMessage.textContent = birthdayPerson.message;
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

    createConfetti();
    init3DCake();

    playBirthdayMusic();
    
    // Hiển thị lời chúc cá nhân hóa nếu có
    displaySavedCustomMessage();
}

// Hàm khởi tạo bánh sinh nhật 3D
function init3DCake() {
    const cakeContainer = document.querySelector('.cake-container');
    cakeContainer.innerHTML = '';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, cakeContainer.clientWidth / cakeContainer.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(cakeContainer.clientWidth, cakeContainer.clientHeight);
    cakeContainer.appendChild(renderer.domElement);

    // Ánh sáng
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Tạo bánh sinh nhật (hình trụ 3 tầng)
    const cakeGroup = new THREE.Group();

    // Tầng 1 (dưới cùng)
    const tier1Geometry = new THREE.CylinderGeometry(5, 5, 2, 32);
    const tier1Material = new THREE.MeshPhongMaterial({ color: 0xf9e4b7 });
    const tier1 = new THREE.Mesh(tier1Geometry, tier1Material);
    tier1.position.y = 1;
    cakeGroup.add(tier1);

    // Tầng 2 (giữa)
    const tier2Geometry = new THREE.CylinderGeometry(3.5, 3.5, 2, 32);
    const tier2Material = new THREE.MeshPhongMaterial({ color: 0xf9e4b7 });
    const tier2 = new THREE.Mesh(tier2Geometry, tier2Material);
    tier2.position.y = 3.2;
    cakeGroup.add(tier2);

    // Tầng 3 (trên cùng)
    const tier3Geometry = new THREE.CylinderGeometry(2, 2, 2, 32);
    const tier3Material = new THREE.MeshPhongMaterial({ color: 0xf9e4b7 });
    const tier3 = new THREE.Mesh(tier3Geometry, tier3Material);
    tier3.position.y = 5.4;
    cakeGroup.add(tier3);

    // Tạo nến
    const candleGroup = new THREE.Group();
    const candleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 16);
    const candleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    
    const candle1 = new THREE.Mesh(candleGeometry, candleMaterial);
    candle1.position.set(-1, 6.5, 0);
    candleGroup.add(candle1);
    
    const candle2 = new THREE.Mesh(candleGeometry, candleMaterial);
    candle2.position.set(0, 6.5, 0);
    candleGroup.add(candle2);
    
    const candle3 = new THREE.Mesh(candleGeometry, candleMaterial);
    candle3.position.set(1, 6.5, 0);
    candleGroup.add(candle3);
    
    // Tạo ngọn lửa
    const flameGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
    const flameMaterial = new THREE.MeshPhongMaterial({ color: 0xff6b6b, emissive: 0xff6b6b, emissiveIntensity: 0.5 });
    
    const flame1 = new THREE.Mesh(flameGeometry, flameMaterial);
    flame1.position.set(-1, 7.2, 0);
    candleGroup.add(flame1);
    
    const flame2 = new THREE.Mesh(flameGeometry, flameMaterial);
    flame2.position.set(0, 7.2, 0);
    candleGroup.add(flame2);
    
    const flame3 = new THREE.Mesh(flameGeometry, flameMaterial);
    flame3.position.set(1, 7.2, 0);
    candleGroup.add(flame3);
    
    cakeGroup.add(candleGroup);
    scene.add(cakeGroup);

    camera.position.z = 10;

    // Tương tác chuột
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    cakeContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };
            const rotationSpeed = 0.005;
            cakeGroup.rotation.z += deltaMove.x * rotationSpeed;
            cakeGroup.rotation.x += deltaMove.y * rotationSpeed;
            previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        // Hiệu ứng nổi cho bánh
        cakeGroup.position.y = Math.sin(Date.now() * 0.001) * 0.5;
        renderer.render(scene, camera);
    }
    animate();

    // Xử lý thay đổi kích thước cửa sổ
    window.addEventListener('resize', () => {
        camera.aspect = cakeContainer.clientWidth / cakeContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(cakeContainer.clientWidth, cakeContainer.clientHeight);
    });
}

// Phát nhạc sinh nhật
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

// Debug function
function debugDate() {
    const now = new Date();
    console.log('Current Date:', {
        fullDate: now,
        month: now.getMonth() + 1, // Chuyển về 1-12
        date: now.getDate(),
        year: now.getFullYear()
    });
    
    const birthdayPerson = checkIfBirthday(now);
    console.log('Birthday Check Result:', birthdayPerson);
    
    // Kiểm tra tất cả sinh nhật
    birthdays.forEach(person => {
        console.log(`Checking ${person.name}:`, {
            personMonth: person.month,
            currentMonth: now.getMonth() + 1,
            personDay: person.day,
            currentDay: now.getDate(),
            isMatch: (now.getMonth() + 1) === person.month && now.getDate() === person.day
        });
    });
}

// Khởi tạo trang
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
    
    // Áp dụng giao diện theo mùa và lễ hội
    const theme = detectSeasonAndFestival();
    applyTheme(theme);
    
    // Áp dụng ngôn ngữ
    const savedLang = localStorage.getItem('language') || 'vi';
    document.getElementById('languageSelect').value = savedLang;
    applyLanguage(savedLang);
    
    // Khởi tạo tính năng lời chúc cá nhân hóa
    initCustomMessage();
    displaySavedCustomMessage();
    
    // Debug
    debugDate();
}); 