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

// Áp dụng ngôn ngữ
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