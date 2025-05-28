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
    
    // Xác định lễ hội trước (ưu tiên lễ hội hơn mùa)
    // Lễ hội Giáng Sinh (Quốc tế)
    if (month === 12 && date >= 20 && date <= 25) theme = 'christmas';
    // Lễ hội Tết Nguyên Đán (Việt Nam) - thường rơi vào cuối tháng 1 hoặc đầu tháng 2
    else if ((month === 1 && date >= 20) || (month === 2 && date <= 15)) theme = 'tet';
    // Lễ hội Halloween (Quốc tế)
    else if (month === 10 && date >= 28 && date <= 31) theme = 'halloween';
    // Các lễ hội Nhật Bản (ưu tiên cao)
    else if (month === 3 || (month === 4 && date <= 15)) theme = 'hanami'; // Lễ hội ngắm hoa anh đào (tháng 3 đến giữa tháng 4)
    else if (month === 8 && date >= 13 && date <= 15) theme = 'obon'; // Lễ hội Obon (tháng 8, thường 13-15)
    else if ((month === 9 && date >= 15) || (month === 10 && date <= 15)) theme = 'tsukimi'; // Lễ hội ngắm trăng (tháng 9-10)
    
    // Nếu không có lễ hội, xác định mùa theo khí hậu Việt Nam
    if (theme === 'default') {
        if (month >= 2 && month <= 4) theme = 'spring'; // Xuân: Tháng 2-4
        else if (month >= 5 && month <= 7) theme = 'summer'; // Hè: Tháng 5-7
        else if (month >= 8 && month <= 10) theme = 'autumn'; // Thu: Tháng 8-10
        else theme = 'winter'; // Đông: Tháng 11-1
    }
    
    return theme;
}

// Hàm áp dụng giao diện theo mùa và lễ hội
function applyTheme(theme) {
    const body = document.body;
    const countdown = document.querySelector('.countdown');
    
    // Xóa tất cả hiệu ứng hiện có
    const themeEffects = document.querySelectorAll('.theme-effect');
    themeEffects.forEach(effect => effect.remove());
    
    // Xóa bóng bay
    const balloonContainer = document.getElementById('balloonContainer');
    if (balloonContainer) {
        balloonContainer.innerHTML = '';
    }
    
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
    
    // Chỉ áp dụng video background, không tạo hiệu ứng
    applyVideoBackground(theme, body);
    
    // Tạo các hiệu ứng theo chủ đề
    if (theme === 'autumn' || theme === 'tsukimi') {
        console.log('Creating falling leaves for', theme);
        createFallingLeaves(40, theme);
    } else if (theme === 'spring' || theme === 'hanami') {
        console.log('Creating falling petals for', theme);
        createFallingPetals(30, theme);
    } else if (theme === 'summer') {
        console.log('Creating heat wave and sun glare for', theme);
        createHeatWave(theme);
        createSunGlare(theme);
    } else if (theme === 'winter') {
        console.log('Creating falling snow for', theme);
        createFallingSnow(50, theme);
    } else if (theme === 'christmas') {
        console.log('Creating Christmas lights for', theme);
        createChristmasLights(30, theme);
    } else if (theme === 'tet') {
        console.log('Creating fireworks for', theme);
        createFireworks(5, theme);
    } else if (theme === 'halloween') {
        console.log('Creating bats and ghosts for', theme);
        createBats(10, theme);
        createGhosts(5, theme);
    } else if (theme === 'obon') {
        console.log('Creating floating lanterns for', theme);
        createFloatingLanterns(20, theme);
    }
    
    // Thêm chỉ báo chủ đề để kiểm tra
    const themeIndicator = document.createElement('div');
    themeIndicator.className = 'theme-indicator';
    let themeText = '';
    // Hiển thị tên mùa bằng tiếng Việt và giữ nguyên tên lễ hội bằng tiếng Anh
    if (theme === 'hanami') themeText = 'Hanami';
    else if (theme === 'obon') themeText = 'Obon';
    else if (theme === 'tsukimi') themeText = 'Tsukimi';
    else if (theme === 'christmas') themeText = 'Christmas';
    else if (theme === 'tet') themeText = 'Tet';
    else if (theme === 'halloween') themeText = 'Halloween';
    else if (theme === 'spring') themeText = 'Mùa Xuân';
    else if (theme === 'summer') themeText = 'Mùa Hè';
    else if (theme === 'autumn') themeText = 'Mùa Thu';
    else if (theme === 'winter') themeText = 'Mùa Đông';
    else themeText = theme.charAt(0).toUpperCase() + theme.slice(1);
    themeIndicator.textContent = `Chủ Đề Hiện Tại: ${themeText}`;
    themeIndicator.style.position = 'fixed';
    themeIndicator.style.top = '60px';
    themeIndicator.style.left = '20px';
    themeIndicator.style.background = 'rgba(0, 0, 0, 0.5)';
    themeIndicator.style.color = 'white';
    themeIndicator.style.padding = '5px 10px';
    themeIndicator.style.borderRadius = '5px';
    themeIndicator.style.zIndex = '1000';
    body.appendChild(themeIndicator);
    
    console.log(`Applied theme: ${theme} with corresponding effects`);
}

// Hàm áp dụng video background theo chủ đề
function applyVideoBackground(theme, body) {
    let videoSource = '';
    // Xác định video tương ứng với chủ đề
    switch(theme) {
        case 'spring':
            videoSource = 'video/spring.mp4';
            break;
        case 'summer':
            videoSource = 'video/summer.mp4';
            break;
        case 'autumn':
            videoSource = 'video/autumn.mp4';
            break;
        case 'winter':
            videoSource = 'video/winter.mp4';
            break;
        case 'hanami':
            // Luân phiên giữa 2 video hanami
            const lastHanamiUsed = localStorage.getItem('lastHanamiVideo') || 'hanami.mov';
            videoSource = lastHanamiUsed === 'hanami.mov' ? 'video/hanami-2.mp4' : 'video/hanami.mov';
            localStorage.setItem('lastHanamiVideo', videoSource);
            break;
        case 'christmas':
            videoSource = 'video/christmas.mp4';
            break;
        case 'tet':
            videoSource = 'video/tet.mp4';
            break;
        case 'halloween':
            videoSource = 'video/halloween.mp4';
            break;
        case 'obon':
            videoSource = 'video/obon.mp4';
            break;
        case 'tsukimi':
            videoSource = 'video/tsukimi.mp4';
            break;
        default:
            return; // Không áp dụng video cho các chủ đề khác nếu không có
    }

    // Kiểm tra xem file video có tồn tại không
    const fallbackVideoSources = {
        'christmas': 'https://cdn.pixabay.com/vimeo/403565117/snowfall-22544.mp4',
        'tet': 'https://cdn.pixabay.com/vimeo/567444566/lanterns-92722.mp4',
        'halloween': 'https://cdn.pixabay.com/vimeo/474265737/fog-54278.mp4',
        'obon': 'https://cdn.pixabay.com/vimeo/353997337/lanterns-14022.mp4',
        'tsukimi': 'https://cdn.pixabay.com/vimeo/330326136/moon-8312.mp4'
    };

    // Tạo phần tử video background
    const video = document.createElement('video');
    video.className = 'video-background';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.style.position = 'fixed';
    video.style.top = '0';
    video.style.left = '0';
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.zIndex = '-1';
    video.style.opacity = '1.0'; // Hiển thị video hoàn toàn không có lớp màu phủ

    // Thêm xử lý lỗi để sử dụng video dự phòng nếu cần
    video.onerror = function() {
        if (fallbackVideoSources[theme]) {
            console.log(`Video local không khả dụng, sử dụng video online: ${fallbackVideoSources[theme]}`);
            video.src = fallbackVideoSources[theme];
        }
    };

    // Đặt nguồn video
    video.src = videoSource;

    // Chèn video vào đầu body để làm background
    body.insertBefore(video, body.firstChild);
    console.log(`Applied video background for theme: ${theme} with source: ${videoSource}`);
}

// Hàm tạo hiệu ứng sóng nhiệt cho mùa hè
function createHeatWave(theme) {
    const heatWave = document.createElement('div');
    heatWave.className = 'theme-effect heat-wave';
    heatWave.style.position = 'fixed';
    heatWave.style.top = '0';
    heatWave.style.left = '0';
    heatWave.style.width = '100vw';
    heatWave.style.height = '100vh';
    heatWave.style.background = 'rgba(255, 255, 0, 0.05)';
    heatWave.style.opacity = '0.3';
    heatWave.style.zIndex = '1';
    heatWave.style.pointerEvents = 'none';
    heatWave.style.animation = 'heatWave 3s ease-in-out infinite';
    document.body.appendChild(heatWave);
    console.log('Created heat wave effect for', theme);
}

// Hàm tạo hiệu ứng ánh nắng cho mùa hè
function createSunGlare(theme) {
    for (let i = 0; i < 5; i++) {
        const glare = document.createElement('div');
        glare.className = 'theme-effect sun-glare';
        glare.style.position = 'fixed';
        glare.style.top = `${Math.random() * 30 + 10}vh`;
        glare.style.left = `${Math.random() * 80 + 10}vw`;
        const size = Math.random() * 100 + 50;
        glare.style.width = `${size}px`;
        glare.style.height = `${size}px`;
        glare.style.background = 'radial-gradient(circle, rgba(255, 255, 100, 0.3), transparent)';
        glare.style.opacity = `${Math.random() * 0.3 + 0.2}`;
        glare.style.zIndex = '1';
        glare.style.pointerEvents = 'none';
        glare.style.animation = `blink ${Math.random() * 2 + 2}s ease-in-out infinite`;
        glare.style.animationDelay = `${Math.random() * 3}s`;
        document.body.appendChild(glare);
    }
    console.log('Created sun glare effect for', theme);
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
    // Màu sắc lá mùa thu - thêm nhiều màu đỏ và cam
    const autumnColors = ['#FF4500', '#FF8C00', '#A52A2A', '#8B0000', '#CD5C5C', '#B22222', '#FF6347', '#DC143C', '#E25822', '#D2691E'];
    
    for (let i = 0; i < count; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'theme-effect leaf';
        leaf.style.left = `${Math.random() * 100}vw`;
        leaf.style.top = `${Math.random() * -50}vh`;
        
        // Tạo kích thước khác nhau cho lá
        const size = Math.random() * 15 + 5;
        leaf.style.width = `${size}px`;
        leaf.style.height = `${size * 0.8}px`;
        
        // Màu ngẫu nhiên từ bảng màu mùa thu
        leaf.style.backgroundColor = autumnColors[Math.floor(Math.random() * autumnColors.length)];
        
        // Hình dạng lá khác nhau - một số lá tròn, một số lá hình giọt nước
        const leafShapes = ['0 50% 0 50%', '50% 0 50% 50%', '50% 50% 0 50%', '30% 70% 70% 30%'];
        leaf.style.borderRadius = leafShapes[Math.floor(Math.random() * leafShapes.length)];
        
        leaf.style.position = 'fixed';
        leaf.style.opacity = `${Math.random() * 0.3 + 0.6}`; // Độ trong suốt thay đổi
        leaf.style.zIndex = '1';
        
        // Thêm hiệu ứng xoay và đung đưa
        const fallDuration = Math.random() * 8 + 7; // Thời gian rơi lâu hơn
        const swayDuration = Math.random() * 3 + 2; // Thời gian đung đưa
        leaf.style.animation = `fall ${fallDuration}s linear infinite, sway ${swayDuration}s ease-in-out infinite, rotate ${swayDuration * 1.5}s linear infinite`;
        leaf.style.animationDelay = `${Math.random() * 5}s, ${Math.random() * 2}s, ${Math.random() * 3}s`;
        
        document.body.appendChild(leaf);
    }
    
    // Thêm CSS cho hiệu ứng xoay nếu chưa có
    if (!document.getElementById('leaf-animations')) {
        const style = document.createElement('style');
        style.id = 'leaf-animations';
        style.textContent = `
            @keyframes fall {
                0% {
                    transform: translateY(0);
                }
                100% {
                    transform: translateY(100vh);
                }
            }
            
            @keyframes sway {
                0% {
                    transform: translateX(0px);
                }
                50% {
                    transform: translateX(20px);
                }
                100% {
                    transform: translateX(0px);
                }
            }
            
            @keyframes rotate {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
        `;
        document.head.appendChild(style);
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