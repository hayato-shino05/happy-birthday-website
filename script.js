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
            const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`; // Fix: Add 1 to month
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
    init3DCake(); // Khởi tạo bánh sinh nhật 3D

    playBirthdayMusic();
    
    // Hiển thị lời chúc cá nhân hóa nếu có
    displaySavedCustomMessage();
}

// Hàm khởi tạo bánh sinh nhật 3D
function init3DCake() {
    const cakeContainer = document.querySelector('.cake-container');
    cakeContainer.innerHTML = ''; // Xóa SVG cũ

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

// Hàm xác định mùa và lễ hội dựa trên ngày tháng
function detectSeasonAndFestival() {
    const now = new Date();
    const month = now.getMonth() + 1; // Tháng từ 1-12
    const date = now.getDate();
    let theme = 'default';
    
    // Xác định mùa
    if (month >= 3 && month <= 5) theme = 'spring';
    else if (month >= 6 && month <= 8) theme = 'summer';
    else if (month >= 9 && month <= 11) theme = 'autumn';
    else theme = 'winter';
    
    // Xác định lễ hội
    if (month === 12 && date >= 20 && date <= 25) theme = 'christmas';
    else if (month === 1 || month === 2) theme = 'tet';
    else if (month === 10 && date >= 28 && date <= 31) theme = 'halloween';
    
    return theme;
}

// Hàm áp dụng giao diện theo mùa và lễ hội
function applyTheme(theme) {
    const body = document.body;
    const countdown = document.querySelector('.countdown');
    const container = document.querySelector('.container');
    
    // Xóa các class giao diện cũ
    body.classList.remove('spring', 'summer', 'autumn', 'winter', 'christmas', 'tet', 'halloween', 'hanami', 'obon', 'tsukimi');
    if (countdown) {
        countdown.classList.remove('spring', 'summer', 'autumn', 'winter', 'christmas', 'tet', 'halloween', 'hanami', 'obon', 'tsukimi');
    }
    
    // Thêm class giao diện mới
    body.classList.add(theme);
    if (countdown) {
        countdown.classList.add(theme);
    }
    
    // Xóa các hiệu ứng cũ
    const oldOverlay = document.querySelector('.theme-overlay');
    if (oldOverlay) oldOverlay.remove();
    const oldEffects = document.querySelectorAll('.theme-effect');
    oldEffects.forEach(effect => effect.remove());
    const oldThemeIndicator = document.querySelector('.theme-indicator');
    if (oldThemeIndicator) oldThemeIndicator.remove();
    
    // Thêm hình ảnh nền và hiệu ứng theo chủ đề
    const overlay = document.createElement('div');
    overlay.className = 'theme-overlay';
    body.insertBefore(overlay, body.firstChild); // Đảm bảo overlay ở đầu để không che các phần tử khác
    
    // Tạo hiệu ứng động
    switch(theme) {
        case 'spring':
        case 'hanami':
            console.log('Creating falling petals for', theme);
            createFallingPetals(40, theme); // Tăng số lượng hoa anh đào rơi
            break;
        case 'summer':
        case 'obon':
            console.log('Creating floating lanterns for', theme);
            createFloatingLanterns(20, theme); // Tăng số lượng đèn lồng nổi
            createFireflies(15, theme); // Thêm đom đóm cho mùa hè
            break;
        case 'autumn':
        case 'tsukimi':
            console.log('Creating falling leaves for', theme);
            createFallingLeaves(40, theme); // Tăng số lượng lá rơi
            break;
        case 'winter':
            console.log('Creating falling snow for', theme);
            createFallingSnow(80, theme); // Tăng số lượng tuyết rơi
            break;
        case 'christmas':
            console.log('Creating Christmas effects for', theme);
            createFallingSnow(50, theme);
            createChristmasLights(20, theme); // Tăng số lượng đèn Giáng Sinh
            break;
        case 'tet':
            console.log('Creating fireworks for', theme);
            createFireworks(10, theme); // Tăng số lượng pháo hoa
            break;
        case 'halloween':
            console.log('Creating ghosts for', theme);
            createGhosts(10, theme); // Tăng số lượng ma Halloween
            createBats(10, theme); // Thêm dơi cho Halloween
            break;
    }
    
    // Thêm chỉ báo chủ đề để kiểm tra
    const themeIndicator = document.createElement('div');
    themeIndicator.className = 'theme-indicator';
    themeIndicator.textContent = `Current Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`;
    themeIndicator.style.position = 'fixed';
    themeIndicator.style.top = '60px';
    themeIndicator.style.left = '20px';
    themeIndicator.style.background = 'rgba(0, 0, 0, 0.5)';
    themeIndicator.style.color = 'white';
    themeIndicator.style.padding = '5px 10px';
    themeIndicator.style.borderRadius = '5px';
    themeIndicator.style.zIndex = '1000';
    body.appendChild(themeIndicator);
    
    console.log(`Applied theme: ${theme}`);
}

// Hàm tạo hiệu ứng đom đóm cho mùa hè
function createFireflies(count, theme) {
    for (let i = 0; i < count; i++) {
        const firefly = document.createElement('div');
        firefly.className = 'theme-effect firefly';
        firefly.style.left = `${Math.random() * 80 + 10}vw`;
        firefly.style.top = `${Math.random() * 60 + 20}vh`;
        firefly.style.width = '3px';
        firefly.style.height = '3px';
        firefly.style.backgroundColor = '#FFFF00';
        firefly.style.borderRadius = '50%';
        firefly.style.position = 'fixed';
        firefly.style.opacity = '0.8';
        firefly.style.zIndex = '1';
        firefly.style.boxShadow = '0 0 5px rgba(255, 255, 0, 0.7)';
        firefly.style.animation = `blink ${Math.random() * 1.5 + 1}s ease-in-out infinite, float ${Math.random() * 2 + 2}s ease-in-out infinite`;
        firefly.style.animationDelay = `${Math.random() * 2}s, ${Math.random() * 2}s`;
        document.body.appendChild(firefly);
    }
}

// Hàm tạo hiệu ứng dơi cho Halloween
function createBats(count, theme) {
    for (let i = 0; i < count; i++) {
        const bat = document.createElement('div');
        bat.className = 'theme-effect bat';
        bat.style.left = `${Math.random() * 80 + 10}vw`;
        bat.style.top = `${Math.random() * 30 + 10}vh`;
        bat.style.width = `${Math.random() * 20 + 10}px`;
        bat.style.height = `${Math.random() * 10 + 5}px`;
        bat.style.backgroundColor = '#000';
        bat.style.borderRadius = '50% 50% 0 0';
        bat.style.position = 'fixed';
        bat.style.opacity = '0.7';
        bat.style.zIndex = '1';
        bat.style.animation = `fly ${Math.random() * 3 + 3}s ease-in-out infinite`;
        bat.style.animationDelay = `${Math.random() * 3}s`;
        document.body.appendChild(bat);
    }
}

// Hàm tạo hiệu ứng hoa anh đào rơi
function createFallingPetals(count, theme) {
    for (let i = 0; i < count; i++) {
        const petal = document.createElement('div');
        petal.className = 'theme-effect petal';
        petal.style.left = `${Math.random() * 100}vw`;
        petal.style.top = `${Math.random() * -50}vh`;
        petal.style.width = `${Math.random() * 10 + 5}px`;
        petal.style.height = `${Math.random() * 10 + 5}px`;
        petal.style.backgroundColor = theme === 'hanami' ? '#FF9EB5' : '#FF9EB5';
        petal.style.borderRadius = '50%';
        petal.style.position = 'fixed';
        petal.style.opacity = '0.7';
        petal.style.zIndex = '1';
        petal.style.animation = `fall ${Math.random() * 5 + 5}s linear infinite`;
        petal.style.animationDelay = `${Math.random() * 5}s`;
        document.body.appendChild(petal);
    }
}

// Hàm tạo hiệu ứng lá rơi
function createFallingLeaves(count, theme) {
    for (let i = 0; i < count; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'theme-effect leaf';
        leaf.style.left = `${Math.random() * 100}vw`;
        leaf.style.top = `${Math.random() * -50}vh`;
        leaf.style.width = `${Math.random() * 15 + 5}px`;
        leaf.style.height = `${Math.random() * 10 + 5}px`;
        leaf.style.backgroundColor = theme === 'tsukimi' ? '#FFA500' : '#FFA500';
        leaf.style.borderRadius = '0 50% 0 50%';
        leaf.style.position = 'fixed';
        leaf.style.opacity = '0.8';
        leaf.style.zIndex = '1';
        leaf.style.animation = `fall ${Math.random() * 5 + 5}s linear infinite, sway ${Math.random() * 2 + 2}s ease-in-out infinite`;
        leaf.style.animationDelay = `${Math.random() * 5}s, ${Math.random() * 2}s`;
        document.body.appendChild(leaf);
    }
}

// Hàm tạo hiệu ứng tuyết rơi
function createFallingSnow(count, theme) {
    for (let i = 0; i < count; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'theme-effect snowflake';
        snowflake.style.left = `${Math.random() * 100}vw`;
        snowflake.style.top = `${Math.random() * -50}vh`;
        snowflake.style.width = `${Math.random() * 5 + 2}px`;
        snowflake.style.height = `${Math.random() * 5 + 2}px`;
        snowflake.style.backgroundColor = '#FFF';
        snowflake.style.borderRadius = '50%';
        snowflake.style.position = 'fixed';
        snowflake.style.opacity = `${Math.random() * 0.5 + 0.3}`;
        snowflake.style.zIndex = '1';
        snowflake.style.animation = `fall ${Math.random() * 5 + 5}s linear infinite`;
        snowflake.style.animationDelay = `${Math.random() * 5}s`;
        document.body.appendChild(snowflake);
    }
}

// Hàm tạo hiệu ứng đèn lồng nổi
function createFloatingLanterns(count, theme) {
    for (let i = 0; i < count; i++) {
        const lantern = document.createElement('div');
        lantern.className = 'theme-effect lantern';
        lantern.style.left = `${Math.random() * 80 + 10}vw`;
        lantern.style.top = `${Math.random() * 60 + 20}vh`;
        lantern.style.width = `${Math.random() * 20 + 10}px`;
        lantern.style.height = `${Math.random() * 30 + 15}px`;
        lantern.style.backgroundColor = theme === 'obon' ? '#FF4500' : '#FF4500';
        lantern.style.borderRadius = '10%';
        lantern.style.position = 'fixed';
        lantern.style.opacity = '0.6';
        lantern.style.zIndex = '1';
        lantern.style.boxShadow = '0 0 10px rgba(255, 69, 0, 0.5)';
        lantern.style.animation = `float ${Math.random() * 3 + 3}s ease-in-out infinite`;
        lantern.style.animationDelay = `${Math.random() * 3}s`;
        document.body.appendChild(lantern);
    }
}

// Hàm tạo hiệu ứng đèn Giáng Sinh
function createChristmasLights(count, theme) {
    for (let i = 0; i < count; i++) {
        const light = document.createElement('div');
        light.className = 'theme-effect christmas-light';
        light.style.left = `${Math.random() * 80 + 10}vw`;
        light.style.top = `${Math.random() * 30}vh`;
        light.style.width = '10px';
        light.style.height = '10px';
        light.style.backgroundColor = ['#FF0000', '#00FF00', '#FFFF00'][Math.floor(Math.random() * 3)];
        light.style.borderRadius = '50%';
        light.style.position = 'fixed';
        light.style.opacity = '0.8';
        light.style.zIndex = '1';
        light.style.boxShadow = '0 0 5px rgba(255, 255, 255, 0.5)';
        light.style.animation = `blink ${Math.random() * 1 + 1}s ease-in-out infinite`;
        light.style.animationDelay = `${Math.random() * 2}s`;
        document.body.appendChild(light);
    }
}

// Hàm tạo hiệu ứng pháo hoa
function createFireworks(count, theme) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'theme-effect firework';
            firework.style.left = `${Math.random() * 80 + 10}vw`;
            firework.style.top = `${Math.random() * 50 + 20}vh`;
            firework.style.width = '5px';
            firework.style.height = '5px';
            firework.style.backgroundColor = ['#FF0000', '#FFD700', '#00FF00'][Math.floor(Math.random() * 3)];
            firework.style.borderRadius = '50%';
            firework.style.position = 'fixed';
            firework.style.opacity = '1';
            firework.style.zIndex = '1';
            firework.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
            firework.style.animation = `explode 2s ease-out forwards`;
            document.body.appendChild(firework);
            
            setTimeout(() => firework.remove(), 2000);
        }, Math.random() * 5000);
    }
    // Lặp lại pháo hoa sau 10 giây
    setTimeout(() => createFireworks(count, theme), 10000);
}

// Hàm tạo hiệu ứng ma Halloween
function createGhosts(count, theme) {
    for (let i = 0; i < count; i++) {
        const ghost = document.createElement('div');
        ghost.className = 'theme-effect ghost';
        ghost.style.left = `${Math.random() * 80 + 10}vw`;
        ghost.style.top = `${Math.random() * 60 + 20}vh`;
        ghost.style.width = `${Math.random() * 30 + 20}px`;
        ghost.style.height = `${Math.random() * 40 + 30}px`;
        ghost.style.backgroundColor = theme === 'halloween' ? '#FFF' : '#FFF';
        ghost.style.borderRadius = '50% 50% 0 0';
        ghost.style.position = 'fixed';
        ghost.style.opacity = '0.5';
        ghost.style.zIndex = '1';
        ghost.style.animation = `float ${Math.random() * 5 + 5}s ease-in-out infinite`;
        ghost.style.animationDelay = `${Math.random() * 5}s`;
        document.body.appendChild(ghost);
    }
}

// Hàm xác định mùa và lễ hội dựa trên ngày tháng
function detectSeasonAndFestival() {
    const now = new Date();
    const month = now.getMonth() + 1; // Tháng từ 1-12
    const date = now.getDate();
    let theme = 'default';
    
    // Xác định mùa
    if (month >= 3 && month <= 5) theme = 'spring';
    else if (month >= 6 && month <= 8) theme = 'summer';
    else if (month >= 9 && month <= 11) theme = 'autumn';
    else theme = 'winter';
    
    // Xác định lễ hội
    if (month === 12 && date >= 20 && date <= 25) theme = 'christmas';
    else if (month === 1 || month === 2) theme = 'tet';
    else if (month === 10 && date >= 28 && date <= 31) theme = 'halloween';
    // Các lễ hội Nhật Bản
    else if (month === 3 || month === 4) theme = 'hanami'; // Lễ hội ngắm hoa anh đào
    else if (month === 8 && date >= 13 && date <= 15) theme = 'obon'; // Lễ hội Obon
    else if (month === 9 || month === 10) theme = 'tsukimi'; // Lễ hội ngắm trăng
    
    return theme;
}

// Dữ liệu đa ngôn ngữ
const translations = {
    vi: {
        title: "Chúc Mừng Sinh Nhật",
        countdownTitle: "Đếm Ngược Đến Sinh Nhật",
        days: "Ngày",
        hours: "Giờ",
        minutes: "Phút",
        seconds: "Giây",
        blowButton: "Thổi nến!",
        micPermission: "Cho phép sử dụng microphone",
        birthdayMessageDefault: "Chúc mừng sinh nhật bạn! Hy vọng ngày hôm nay của bạn tràn đầy niềm vui và hạnh phúc!",
        birthdayMessageSuccess: "Chúc mừng sinh nhật! 🎉<br>Bạn đã thổi tắt nến thành công!<br>Hy vọng mọi điều ước của bạn sẽ thành hiện thực!",
        albumButton: "📸 Xem Album Kỷ niệm",
        memoryGame: "🎮 Trò chơi Trí nhớ",
        puzzleGame: "🧩 Ghép hình",
        songTitle: "Happy Birthday Song"
    },
    en: {
        title: "Happy Birthday",
        countdownTitle: "Countdown to Birthday",
        days: "Days",
        hours: "Hours",
        minutes: "Minutes",
        seconds: "Seconds",
        blowButton: "Blow the Candles!",
        micPermission: "Allow Microphone Access",
        birthdayMessageDefault: "Happy Birthday! Wishing you a day full of joy and happiness!",
        birthdayMessageSuccess: "Happy Birthday! 🎉<br>You've successfully blown out the candles!<br>May all your wishes come true!",
        albumButton: "📸 View Memory Album",
        memoryGame: "🎮 Memory Game",
        puzzleGame: "🧩 Puzzle Game",
        songTitle: "Happy Birthday Song"
    }
};

// Hàm áp dụng ngôn ngữ
function applyLanguage(lang) {
    const elements = {
        birthdayTitle: document.getElementById('birthdayTitle'),
        countdown: document.getElementById('countdown'),
        blowButton: document.getElementById('blowButton'),
        micPermissionBtn: document.getElementById('micPermissionBtn'),
        birthdayMessage: document.getElementById('birthdayMessage'),
        openAlbum: document.getElementById('openAlbum'),
        startMemoryGame: document.getElementById('startMemoryGame'),
        startPuzzleGame: document.getElementById('startPuzzleGame'),
        songTitle: document.querySelector('.song-title')
    };
    
    if (elements.birthdayTitle) elements.birthdayTitle.textContent = translations[lang].title;
    if (elements.blowButton) elements.blowButton.textContent = translations[lang].blowButton;
    if (elements.micPermissionBtn) elements.micPermissionBtn.textContent = translations[lang].micPermission;
    if (elements.birthdayMessage && !elements.birthdayMessage.innerHTML.includes('<br>')) {
        elements.birthdayMessage.textContent = translations[lang].birthdayMessageDefault;
    }
    if (elements.openAlbum) elements.openAlbum.textContent = translations[lang].albumButton;
    if (elements.startMemoryGame) elements.startMemoryGame.textContent = translations[lang].memoryGame;
    if (elements.startPuzzleGame) elements.startPuzzleGame.textContent = translations[lang].puzzleGame;
    if (elements.songTitle) elements.songTitle.textContent = translations[lang].songTitle;
    
    localStorage.setItem('language', lang);
    console.log(`Applied language: ${lang}`);
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
    
    // Áp dụng giao diện theo mùa và lễ hội
    const theme = detectSeasonAndFestival();
    applyTheme(theme);
    
    // Áp dụng ngôn ngữ
    const savedLang = localStorage.getItem('language') || 'vi';
    document.getElementById('languageSelect').value = savedLang;
    applyLanguage(savedLang);
    
    // Sự kiện thay đổi ngôn ngữ
    document.getElementById('languageSelect').addEventListener('change', function() {
        applyLanguage(this.value);
        // Cập nhật lại countdown nếu đang hiển thị
        const nextBirthday = findNextBirthday(new Date());
        if (nextBirthday.person) {
            displayCountdown(nextBirthday.date, nextBirthday.person);
        }
    });
    
    // Khởi tạo tính năng lời chúc cá nhân hóa
    initCustomMessage();
    displaySavedCustomMessage();
});

// Hàm khởi tạo tính năng lời chúc cá nhân hóa
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
    
    submitCustomMessage.addEventListener('click', () => {
        const customMessageInput = document.getElementById('customMessageInput');
        const messageText = customMessageInput.value.trim();
        
        if (messageText) {
            localStorage.setItem('customBirthdayMessage', messageText);
            displayCustomMessage(messageText);
            customMessageModal.style.display = 'none';
            customMessageInput.value = '';
        } else {
            alert('Vui lòng nhập lời chúc!');
        }
    });
}

// Hàm hiển thị lời chúc cá nhân hóa với hiệu ứng
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

// Hàm hiển thị lời chúc đã lưu khi tải trang
function displaySavedCustomMessage() {
    const savedMessage = localStorage.getItem('customBirthdayMessage');
    if (savedMessage) {
        displayCustomMessage(savedMessage);
    }
}

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
    const photoGallery = document.getElementById('photoGallery');
    let isOpen = false;
    let isSlideshowMode = false;
    let swiperInstance = null;

    albumBtn.addEventListener('click', () => {
        if (!isOpen) {
            memoryWall.style.display = 'block';
            loadSamplePhotos();
            isOpen = true;
        } else {
            memoryWall.style.display = 'none';
            isOpen = false;
            if (isSlideshowMode) {
                toggleSlideshowMode(false);
                isSlideshowMode = false;
            }
        }
    });

    memoryWall.addEventListener('click', (e) => {
        if (e.target === memoryWall) {
            memoryWall.style.display = 'none';
            isOpen = false;
            if (isSlideshowMode) {
                toggleSlideshowMode(false);
                isSlideshowMode = false;
            }
        }
    });

    // Thêm nút chuyển đổi chế độ slideshow
    const toggleSlideshowBtn = document.createElement('button');
    toggleSlideshowBtn.textContent = 'Xem Slideshow';
    toggleSlideshowBtn.className = 'feature-button';
    toggleSlideshowBtn.style.position = 'absolute';
    toggleSlideshowBtn.style.top = '10px';
    toggleSlideshowBtn.style.right = '10px';
    toggleSlideshowBtn.addEventListener('click', () => {
        isSlideshowMode = !isSlideshowMode;
        toggleSlideshowMode(isSlideshowMode);
        if (isSlideshowMode) {
            toggleSlideshowBtn.textContent = 'Xem Lưới';
        } else {
            toggleSlideshowBtn.textContent = 'Xem Slideshow';
        }
    });
    memoryWall.appendChild(toggleSlideshowBtn);

    // Đóng slideshow
    document.getElementById('closeSlideshow').addEventListener('click', () => {
        isSlideshowMode = false;
        toggleSlideshowMode(false);
        toggleSlideshowBtn.textContent = 'Xem Slideshow';
    });

    function toggleSlideshowMode(enabled) {
        const slideshowContainer = document.getElementById('slideshowContainer');
        if (enabled) {
            photoGallery.style.display = 'none';
            slideshowContainer.style.display = 'block';
            initSlideshow();
        } else {
            photoGallery.style.display = 'grid';
            slideshowContainer.style.display = 'none';
            if (swiperInstance) {
                swiperInstance.destroy();
                swiperInstance = null;
            }
        }
    }

    function initSlideshow() {
        const slideshowWrapper = document.getElementById('slideshowWrapper');
        slideshowWrapper.innerHTML = '';
        
        const totalMedia = 75; // Số lượng media items
        for (let i = 1; i <= totalMedia; i++) {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slideshowWrapper.appendChild(slide);
            loadMediaItemForSlideshow(i, slide);
        }

        if (swiperInstance) {
            swiperInstance.destroy();
        }
        swiperInstance = new Swiper('#slideshowContainer', {
            loop: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            }
        });
    }
}

function loadSamplePhotos() {
    const gallery = document.getElementById('photoGallery');
    gallery.innerHTML = '';
    
    const totalMedia = 75; // Number of media items
    
    for (let i = 1; i <= totalMedia; i++) {
        loadMediaItem(i, gallery);
    }
}

function loadMediaItem(index, gallery) {
    const videoPath = `memory/${index}.mp4`;
    const imagePath = `memory/${index}.jpg`;
    
    // Create container for media item
    const mediaItem = document.createElement('div');
    mediaItem.className = 'photo-item';
    mediaItem.style.position = 'relative';
    
    // Add to gallery immediately to preserve order
    gallery.appendChild(mediaItem);

    // First try to fetch the video to check if it exists
    fetch(videoPath, { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                // Video exists, display it
                const videoElement = document.createElement('video');
                videoElement.className = 'memory-photo';
                videoElement.src = videoPath;
                videoElement.muted = true;
                
                const playIcon = document.createElement('div');
                playIcon.className = 'play-icon';
                playIcon.innerHTML = '▶️';
                playIcon.style.position = 'absolute';
                playIcon.style.top = '50%';
                playIcon.style.left = '50%';
                playIcon.style.transform = 'translate(-50%, -50%)';
                playIcon.style.fontSize = '30px';
                playIcon.style.color = 'white';
                playIcon.style.textShadow = '0 0 5px rgba(0,0,0,0.7)';
                playIcon.style.zIndex = '2';
                
                mediaItem.innerHTML = '';
                mediaItem.appendChild(videoElement);
                mediaItem.appendChild(playIcon);
                
                mediaItem.addEventListener('click', () => {
                    openFullSizeMedia(videoPath, index, 'video');
                });
            } else {
                // Video doesn't exist, try image
                tryLoadImage();
            }
        })
        .catch(() => {
            // Error fetching video, try image
            tryLoadImage();
        });

    function tryLoadImage() {
        // Check if image exists
        fetch(imagePath, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    // Image exists
                    const img = document.createElement('img');
                    img.className = 'memory-photo';
                    img.src = imagePath;
                    img.alt = `Memory ${index}`;
                    
                    mediaItem.innerHTML = '';
                    mediaItem.appendChild(img);
                    
                    mediaItem.addEventListener('click', () => {
                        openFullSizeMedia(imagePath, index, 'image');
                    });
                } else {
                    // Image doesn't exist, use placeholder
                    usePlaceholder();
                }
            })
            .catch(() => {
                // Error fetching image, use placeholder
                usePlaceholder();
            });
    }

    function usePlaceholder() {
        const placeholder = document.createElement('img');
        placeholder.className = 'memory-photo';
        placeholder.src = '/api/placeholder/200/200';
        placeholder.alt = `Placeholder ${index}`;
        
        mediaItem.innerHTML = '';
        mediaItem.appendChild(placeholder);
        
        mediaItem.addEventListener('click', () => {
            openFullSizeMedia(placeholder.src, index, 'image');
        });
    }
}

function loadMediaItemForSlideshow(index, slide) {
    const videoPath = `memory/${index}.mp4`;
    const imagePath = `memory/${index}.jpg`;
    
    // First try to fetch the video to check if it exists
    fetch(videoPath, { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                // Video exists, display it
                const videoElement = document.createElement('video');
                videoElement.src = videoPath;
                videoElement.controls = true;
                videoElement.muted = true;
                
                slide.innerHTML = '';
                slide.appendChild(videoElement);
            } else {
                // Video doesn't exist, try image
                tryLoadImage();
            }
        })
        .catch(() => {
            // Error fetching video, try image
            tryLoadImage();
        });

    function tryLoadImage() {
        // Check if image exists
        fetch(imagePath, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    // Image exists
                    const img = document.createElement('img');
                    img.src = imagePath;
                    img.alt = `Memory ${index}`;
                    
                    slide.innerHTML = '';
                    slide.appendChild(img);
                } else {
                    // Image doesn't exist, use placeholder
                    usePlaceholder();
                }
            })
            .catch(() => {
                // Error fetching image, use placeholder
                usePlaceholder();
            });
    }

    function usePlaceholder() {
        const placeholder = document.createElement('img');
        placeholder.src = '/api/placeholder/800/600';
        placeholder.alt = `Placeholder ${index}`;
        
        slide.innerHTML = '';
        slide.appendChild(placeholder);
    }
}

function openFullSizeMedia(mediaUrl, mediaNumber, mediaType) {
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

    let mediaElement;
    
    if (mediaType === 'video') {
        mediaElement = document.createElement('video');
        mediaElement.src = mediaUrl;
        mediaElement.controls = true;
        mediaElement.autoplay = true;
        mediaElement.style.maxWidth = '90%';
        mediaElement.style.maxHeight = '80vh';
        mediaElement.style.objectFit = 'contain';
    } else {
        mediaElement = document.createElement('img');
        mediaElement.src = mediaUrl;
        mediaElement.style.maxWidth = '90%';
        mediaElement.style.maxHeight = '90vh';
        mediaElement.style.objectFit = 'contain';
    }

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
    caption.textContent = `${mediaType === 'video' ? 'Video' : 'Hình'} ${mediaNumber}`;
    caption.style.position = 'absolute';
    caption.style.bottom = '20px';
    caption.style.color = 'white';
    caption.style.fontSize = '18px';
    caption.style.background = 'rgba(0,0,0,0.5)';
    caption.style.padding = '5px 15px';
    caption.style.borderRadius = '20px';

    modal.appendChild(mediaElement);
    modal.appendChild(closeBtn);
    modal.appendChild(caption);

    modal.addEventListener('click', () => {
        // Nếu đang phát video, dừng video trước khi đóng modal
        if (mediaType === 'video' && !mediaElement.paused) {
            mediaElement.pause();
        }
        modal.remove();
    });

    mediaElement.addEventListener('click', (e) => {
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
    const text = 'Hội Mẹ Bầu Đơn Thân';
    
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
            personMonth: person.month, // Tháng thực tế (1-12)
            currentMonth: now.getMonth() + 1, // Chuyển về 1-12
            personDay: person.day,
            currentDay: now.getDate(),
            isMatch: (now.getMonth() + 1) === person.month && now.getDate() === person.day
        });
    });
}

// Gọi hàm debug khi trang load
document.addEventListener('DOMContentLoaded', function() {
    debugDate();
    // ... rest of the existing initialization code ...
});
