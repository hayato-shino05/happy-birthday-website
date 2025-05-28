 // Tạo bóng bay
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

// Biến toàn cục cho microphone
let blowProgress = 0;
let audioContext, analyser, microphone, javascriptNode;

// Phân tích âm thanh cho tính năng thổi nến
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

// Cập nhật thanh tiến trình thổi nến
function updateBlowProgress() {
    const progressBar = document.getElementById('blowProgress');
    progressBar.style.width = blowProgress + '%';
    progressBar.textContent = Math.round(blowProgress) + '%';
}

// Ngắt kết nối audio khi hoàn thành
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

// Xử lý khi thổi tắt nến
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

// Album ảnh
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

    // Thêm ô tìm kiếm thẻ trong Album
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.style.position = 'absolute';
    searchContainer.style.top = '10px';
    searchContainer.style.left = '10px';
    searchContainer.style.display = 'flex';
    searchContainer.style.gap = '10px';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'searchTagsInput';
    searchInput.placeholder = 'Tìm kiếm theo thẻ...';
    searchInput.style.padding = '8px 12px';
    searchInput.style.border = '2px solid #D4B08C';
    searchInput.style.borderRadius = '0';
    searchInput.style.background = '#FFF9F3';
    searchInput.style.color = '#2C1810';
    searchInput.style.fontFamily = '\'Old Standard TT\', serif';
    searchInput.style.boxShadow = '2px 2px 0 #D4B08C';
    searchInput.addEventListener('input', () => {
        searchMediaByTag(searchInput.value);
    });

    const clearSearchBtn = document.createElement('button');
    clearSearchBtn.textContent = 'Xóa';
    clearSearchBtn.className = 'feature-button';
    clearSearchBtn.style.padding = '8px 12px';
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchMediaByTag('');
    });

    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(clearSearchBtn);
    memoryWall.appendChild(searchContainer);

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

    // Khởi tạo lưu trữ thẻ nếu chưa có
    if (!localStorage.getItem('mediaTags')) {
        localStorage.setItem('mediaTags', JSON.stringify({}));
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
    mediaItem.dataset.index = index; // Lưu index để liên kết với thẻ
    
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

    // Hiển thị thẻ nếu có
    const tagsData = JSON.parse(localStorage.getItem('mediaTags') || '{}');
    if (tagsData[index] && tagsData[index].length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'tags-container';
        tagsContainer.style.position = 'absolute';
        tagsContainer.style.bottom = '0';
        tagsContainer.style.left = '0';
        tagsContainer.style.right = '0';
        tagsContainer.style.padding = '5px';
        tagsContainer.style.background = 'rgba(255, 249, 243, 0.8)';
        tagsContainer.style.overflow = 'hidden';
        tagsContainer.style.textOverflow = 'ellipsis';
        tagsContainer.style.whiteSpace = 'nowrap';
        tagsContainer.style.fontSize = '12px';
        tagsContainer.style.color = '#854D27';
        tagsContainer.textContent = '#' + tagsData[index].join(', #');
        mediaItem.appendChild(tagsContainer);
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
    // Đóng bất kỳ modal toàn màn hình nào đang mở trước đó
    const existingModal = document.getElementById('fullSizeMediaModal');
    if (existingModal) {
        existingModal.remove();
    }

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
    modal.id = 'fullSizeMediaModal'; // Thêm ID để dễ quản lý

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
        mediaElement.style.maxHeight = '80vh';
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

    // Thêm nút gắn thẻ
    const tagBtn = document.createElement('button');
    tagBtn.textContent = 'Gắn Thẻ';
    tagBtn.style.position = 'absolute';
    tagBtn.style.bottom = '60px';
    tagBtn.style.left = '50%';
    tagBtn.style.transform = 'translateX(-50%)';
    tagBtn.style.padding = '8px 15px';
    tagBtn.style.background = '#854D27';
    tagBtn.style.color = '#FFF9F3';
    tagBtn.style.border = '2px solid #D4B08C';
    tagBtn.style.cursor = 'pointer';
    tagBtn.style.borderRadius = '0';
    tagBtn.style.boxShadow = '2px 2px 0 #D4B08C';
    tagBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTagModal(mediaNumber);
    });

    modal.appendChild(mediaElement);
    modal.appendChild(closeBtn);
    modal.appendChild(caption);
    modal.appendChild(tagBtn);

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

    tagBtn.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.body.appendChild(modal);
}

// Hàm mở modal gắn thẻ
function openTagModal(mediaIndex) {
    // Tạo modal gắn thẻ mới
    let tagModal = document.getElementById('tagModalCustom');
    if (!tagModal) {
        tagModal = document.createElement('div');
        tagModal.id = 'tagModalCustom';
        tagModal.className = 'tag-modal';
        tagModal.style.position = 'fixed';
        tagModal.style.top = '0';
        tagModal.style.left = '0';
        tagModal.style.width = '100%';
        tagModal.style.height = '100%';
        tagModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        tagModal.style.display = 'flex';
        tagModal.style.justifyContent = 'center';
        tagModal.style.alignItems = 'center';
        tagModal.style.zIndex = '10000';
        tagModal.style.display = 'none'; // Ẩn mặc định

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
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
        closeBtn.id = 'closeTagModalCustom';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            tagModal.style.display = 'none';
        });

        const title = document.createElement('h2');
        title.textContent = 'Gắn Thẻ Hình Ảnh/Video';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';

        const description = document.createElement('p');
        description.textContent = 'Nhập các thẻ, cách nhau bằng dấu phẩy (ví dụ: bạn bè, sinh nhật)';
        description.style.marginBottom = '20px';

        const tagInput = document.createElement('input');
        tagInput.type = 'text';
        tagInput.id = 'tagInputCustom';
        tagInput.placeholder = 'Nhập thẻ...';
        tagInput.style.width = '100%';
        tagInput.style.padding = '10px';
        tagInput.style.border = '2px solid #D4B08C';
        tagInput.style.borderRadius = '0';
        tagInput.style.marginBottom = '20px';
        tagInput.style.fontFamily = '\'Old Standard TT\', serif';
        tagInput.style.fontSize = '16px';
        tagInput.style.background = '#FFF9F3';
        tagInput.style.color = '#2C1810';

        const submitBtn = document.createElement('button');
        submitBtn.id = 'submitTagsCustom';
        submitBtn.textContent = 'Lưu Thẻ';
        submitBtn.style.padding = '10px 20px';
        submitBtn.style.background = '#854D27';
        submitBtn.style.color = '#FFF9F3';
        submitBtn.style.border = '2px solid #D4B08C';
        submitBtn.style.borderRadius = '0';
        submitBtn.style.cursor = 'pointer';
        submitBtn.style.fontSize = '1.1em';
        submitBtn.style.transition = 'all 0.3s';
        submitBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        submitBtn.style.textTransform = 'uppercase';
        submitBtn.style.letterSpacing = '1px';
        submitBtn.addEventListener('click', () => {
            const currentMediaIndex = tagModal.dataset.mediaIndex; // Lấy mediaIndex từ dataset của modal
            const tagsText = tagInput.value.trim();
            saveTags(currentMediaIndex, tagsText); // Lưu thẻ, kể cả khi trống (sẽ xóa thẻ hiện có)
            tagModal.style.display = 'none';
            tagInput.value = '';
        });
        submitBtn.addEventListener('mouseover', () => {
            submitBtn.style.transform = 'translate(-2px, -2px)';
            submitBtn.style.boxShadow = '6px 6px 0 #D4B08C';
        });
        submitBtn.addEventListener('mouseout', () => {
            submitBtn.style.transform = 'none';
            submitBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        });

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(description);
        modalContent.appendChild(tagInput);
        modalContent.appendChild(submitBtn);
        tagModal.appendChild(modalContent);
        document.body.appendChild(tagModal);
    }

    // Hiển thị modal và điền dữ liệu
    tagModal.dataset.mediaIndex = mediaIndex;
    tagModal.style.display = 'flex';
    const tagInput = document.getElementById('tagInputCustom');
    // Hiển thị thẻ hiện tại nếu có
    const tagsData = JSON.parse(localStorage.getItem('mediaTags') || '{}');
    if (tagsData[mediaIndex] && tagsData[mediaIndex].length > 0) {
        tagInput.value = tagsData[mediaIndex].join(', ');
    } else {
        tagInput.value = '';
    }
}

// Hàm lưu thẻ
function saveTags(mediaIndex, tagsInput) {
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '').slice(0, 5); // Giới hạn 5 thẻ
    const tagsData = JSON.parse(localStorage.getItem('mediaTags') || '{}');
    tagsData[mediaIndex] = tags;
    localStorage.setItem('mediaTags', JSON.stringify(tagsData));
    console.log(`Saved tags for media ${mediaIndex}:`, tags);
    // Cập nhật lại giao diện album
    loadSamplePhotos();
}

// Hàm tìm kiếm ảnh/video theo thẻ
function searchMediaByTag(query) {
    const photoGallery = document.getElementById('photoGallery');
    const mediaItems = photoGallery.querySelectorAll('.photo-item');
    const tagsData = JSON.parse(localStorage.getItem('mediaTags') || '{}');
    const searchTerm = query.toLowerCase().trim();

    mediaItems.forEach(item => {
        const mediaIndex = item.dataset.index;
        const tags = tagsData[mediaIndex] || [];
        const matches = searchTerm === '' || tags.some(tag => tag.toLowerCase().includes(searchTerm));
        item.style.display = matches ? 'block' : 'none';
    });
}

// Trò chơi
function initGames() {
    const memoryGameBtn = document.getElementById('startMemoryGame');
    const puzzleGameBtn = document.getElementById('startPuzzleGame');

    memoryGameBtn.addEventListener('click', startMemoryGame);
    puzzleGameBtn.addEventListener('click', startPuzzleGame);
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
        puzzleContainer.style.maxWidth = '700px';
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
        puzzleArea.style.gridTemplateColumns = 'repeat(3, 1fr)';
        puzzleArea.style.gap = '2px';
        puzzleArea.style.margin = '20px auto';
        puzzleArea.style.width = '400px';
        puzzleArea.style.height = '400px';
        puzzleArea.style.border = '2px solid #D4B08C';
        puzzleArea.style.background = '#EEE';

        const piecesContainer = document.createElement('div');
        piecesContainer.id = 'piecesContainer';
        piecesContainer.style.display = 'flex';
        piecesContainer.style.flexWrap = 'wrap';
        piecesContainer.style.justifyContent = 'center';
        piecesContainer.style.marginTop = '20px';
        piecesContainer.style.width = '400px';
        piecesContainer.style.minHeight = '100px';
        piecesContainer.style.border = '2px solid #D4B08C';
        piecesContainer.style.padding = '10px';
        piecesContainer.style.background = '#FFF9F3';

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
        puzzleContainer.appendChild(restartBtn);
        puzzleModal.appendChild(puzzleContainer);
        document.body.appendChild(puzzleModal);
    }
    puzzleModal.style.display = 'flex';
    initPuzzleGame();
}

function initPuzzleGame() {
    const puzzleArea = document.getElementById('puzzleArea');
    const piecesContainer = document.getElementById('piecesContainer');
    puzzleArea.innerHTML = '';
    piecesContainer.innerHTML = '';
    
    // Sử dụng một hình ảnh mặc định từ thư mục memory
    const imageUrl = 'memory/1.jpg';
    const gridSize = 3; // Lưới 3x3
    let pieceWidth = 400 / gridSize;
    let pieceHeight = 400 / gridSize;
    let pieces = [];
    let placedPieces = Array(gridSize * gridSize).fill(false);
    
    // Tạo các ô trống trong khu vực ghép hình
    for (let i = 0; i < gridSize * gridSize; i++) {
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
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const index = y * gridSize + x;
            const piece = document.createElement('div');
            piece.id = 'piece-' + index;
            piece.draggable = true;
            piece.style.width = pieceWidth + 'px';
            piece.style.height = pieceHeight + 'px';
            piece.style.backgroundImage = `url(${imageUrl})`;
            piece.style.backgroundSize = `${400}px ${400}px`;
            piece.style.backgroundPosition = `-${x * pieceWidth}px -${y * pieceHeight}px`;
            piece.style.border = '1px solid #D4B08C';
            piece.style.cursor = 'move';
            piece.dataset.correctIndex = index;
            piece.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text', piece.id);
                if (piece.dataset.currentIndex) {
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

function checkPuzzleCompletion() {
    const pieces = document.querySelectorAll('#puzzleArea .puzzle-piece');
    let isComplete = true;
    for (let piece of pieces) {
        if (piece.dataset.correctIndex !== piece.dataset.currentIndex) {
            isComplete = false;
            break;
        }
    }
    if (isComplete) {
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
        // Lưu file âm thanh vào localStorage (giới hạn dung lượng, chỉ lưu URL tạm thời)
        const birthdayPerson = localStorage.getItem('currentBirthday') || 'unknown';
        let audioMessages = JSON.parse(localStorage.getItem('audioMessages') || '{}');
        if (!audioMessages[birthdayPerson]) {
            audioMessages[birthdayPerson] = [];
        }
        audioMessages[birthdayPerson].push({ url: window.currentAudioMessage, sender: senderName });
        localStorage.setItem('audioMessages', JSON.stringify(audioMessages));
        alert('Lời chúc ghi âm đã được lưu!');
        document.getElementById('recordMessageModal').style.display = 'none';
        senderNameInput.value = '';
        displaySavedAudioMessages();
    } else {
        alert('Không có bản ghi âm nào để lưu.');
    }
}

function displaySavedAudioMessages() {
    const birthdayPerson = localStorage.getItem('currentBirthday') || 'unknown';
    const audioMessages = JSON.parse(localStorage.getItem('audioMessages') || '{}');
    const messages = audioMessages[birthdayPerson] || [];
    let playAudioBtn = document.getElementById('playAudioMessagesBtn');
    const customMessageContainer = document.querySelector('.custom-message-container');
    
    if (messages.length > 0) {
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
    const audioMessages = JSON.parse(localStorage.getItem('audioMessages') || '{}');
    const messages = audioMessages[birthdayPerson] || [];
    if (messages.length > 0) {
        messages.forEach((messageObj, index) => {
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
    } else {
        const noMessages = document.createElement('p');
        noMessages.textContent = 'Chưa có lời chúc ghi âm nào.';
        noMessages.style.color = '#2C1810';
        audioList.appendChild(noMessages);
    }
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
});

function initCommunityFeatures() {
    // Thêm nút Phòng Chat Sinh Nhật
    let chatBtn = document.getElementById('chatRoomBtn');
    const customMessageContainer = document.querySelector('.custom-message-container');
    if (!chatBtn) {
        chatBtn = document.createElement('button');
        chatBtn.id = 'chatRoomBtn';
        chatBtn.className = 'feature-button';
        chatBtn.textContent = '💬 Phòng Chat Sinh Nhật';
        chatBtn.style.marginTop = '10px';
        chatBtn.addEventListener('click', () => {
            checkUserNameAndOpenChat();
        });
        customMessageContainer.appendChild(chatBtn);
    }
    chatBtn.style.display = 'block';
}

function checkUserNameAndOpenChat() {
    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) {
        openChatRoomModal(savedUserName);
    } else {
        openUserNameModal();
    }
}

function openUserNameModal() {
    let nameModal = document.getElementById('userNameModal');
    if (!nameModal) {
        nameModal = document.createElement('div');
        nameModal.id = 'userNameModal';
        nameModal.style.position = 'fixed';
        nameModal.style.top = '0';
        nameModal.style.left = '0';
        nameModal.style.width = '100%';
        nameModal.style.height = '100%';
        nameModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        nameModal.style.display = 'flex';
        nameModal.style.justifyContent = 'center';
        nameModal.style.alignItems = 'center';
        nameModal.style.zIndex = '10000';
        nameModal.style.display = 'none';

        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.border = '2px solid #D4B08C';
        modalContent.style.borderRadius = '0';
        modalContent.style.padding = '20px';
        modalContent.style.width = '80%';
        modalContent.style.maxWidth = '400px';
        modalContent.style.boxShadow = '8px 8px 0 #D4B08C';
        modalContent.style.position = 'relative';
        modalContent.style.textAlign = 'center';

        const title = document.createElement('h2');
        title.textContent = 'Nhập Tên Của Bạn';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';

        const nameInput = document.createElement('input');
        nameInput.id = 'userNameInput';
        nameInput.type = 'text';
        nameInput.placeholder = 'Tên của bạn...';
        nameInput.style.width = '100%';
        nameInput.style.padding = '10px';
        nameInput.style.border = '2px solid #D4B08C';
        nameInput.style.borderRadius = '0';
        nameInput.style.marginBottom = '20px';
        nameInput.style.fontFamily = '\'Old Standard TT\', serif';
        nameInput.style.fontSize = '16px';
        nameInput.style.background = '#FFF9F3';
        nameInput.style.color = '#2C1810';

        const saveNameBtn = document.createElement('button');
        saveNameBtn.textContent = 'Lưu Tên';
        saveNameBtn.style.padding = '10px 20px';
        saveNameBtn.style.background = '#854D27';
        saveNameBtn.style.color = '#FFF9F3';
        saveNameBtn.style.border = '2px solid #D4B08C';
        saveNameBtn.style.borderRadius = '0';
        saveNameBtn.style.cursor = 'pointer';
        saveNameBtn.style.fontSize = '1.1em';
        saveNameBtn.style.transition = 'all 0.3s';
        saveNameBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        saveNameBtn.style.textTransform = 'uppercase';
        saveNameBtn.style.letterSpacing = '1px';
        saveNameBtn.addEventListener('click', () => {
            const userName = nameInput.value.trim() || 'Ẩn danh';
            localStorage.setItem('userName', userName);
            nameModal.style.display = 'none';
            openChatRoomModal(userName);
        });
        saveNameBtn.addEventListener('mouseover', () => {
            saveNameBtn.style.transform = 'translate(-2px, -2px)';
            saveNameBtn.style.boxShadow = '6px 6px 0 #D4B08C';
        });
        saveNameBtn.addEventListener('mouseout', () => {
            saveNameBtn.style.transform = 'none';
            saveNameBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        });

        modalContent.appendChild(title);
        modalContent.appendChild(nameInput);
        modalContent.appendChild(saveNameBtn);
        nameModal.appendChild(modalContent);
        document.body.appendChild(nameModal);
    }
    nameModal.style.display = 'flex';
}

function openChatRoomModal(userName) {
    let chatModal = document.getElementById('chatRoomModal');
    if (!chatModal) {
        chatModal = document.createElement('div');
        chatModal.id = 'chatRoomModal';
        chatModal.style.position = 'fixed';
        chatModal.style.top = '0';
        chatModal.style.left = '0';
        chatModal.style.width = '100%';
        chatModal.style.height = '100%';
        chatModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        chatModal.style.display = 'flex';
        chatModal.style.justifyContent = 'center';
        chatModal.style.alignItems = 'center';
        chatModal.style.zIndex = '10000';
        chatModal.style.display = 'none';

        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.border = '2px solid #D4B08C';
        modalContent.style.borderRadius = '0';
        modalContent.style.padding = '20px';
        modalContent.style.width = '80%';
        modalContent.style.maxWidth = '600px';
        modalContent.style.boxShadow = '8px 8px 0 #D4B08C';
        modalContent.style.position = 'relative';
        modalContent.style.textAlign = 'center';
        modalContent.style.height = '80vh';
        modalContent.style.display = 'flex';
        modalContent.style.flexDirection = 'column';

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
            chatModal.style.display = 'none';
        });

        const title = document.createElement('h2');
        title.textContent = 'Phòng Chat Sinh Nhật';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';

        const chatHistory = document.createElement('div');
        chatHistory.id = 'chatHistory';
        chatHistory.style.flex = '1';
        chatHistory.style.overflowY = 'auto';
        chatHistory.style.border = '2px solid #D4B08C';
        chatHistory.style.padding = '10px';
        chatHistory.style.marginBottom = '20px';
        chatHistory.style.background = '#FFF9F3';
        chatHistory.style.textAlign = 'left';

        const messageInput = document.createElement('input');
        messageInput.id = 'chatMessageInput';
        messageInput.type = 'text';
        messageInput.placeholder = 'Nhập tin nhắn của bạn...';
        messageInput.style.width = '100%';
        messageInput.style.padding = '10px';
        messageInput.style.border = '2px solid #D4B08C';
        messageInput.style.borderRadius = '0';
        messageInput.style.marginBottom = '10px';
        messageInput.style.fontFamily = '\'Old Standard TT\', serif';
        messageInput.style.fontSize = '16px';
        messageInput.style.background = '#FFF9F3';
        messageInput.style.color = '#2C1810';

        const sendMessageBtn = document.createElement('button');
        sendMessageBtn.textContent = 'Gửi Tin Nhắn';
        sendMessageBtn.style.padding = '10px 20px';
        sendMessageBtn.style.background = '#854D27';
        sendMessageBtn.style.color = '#FFF9F3';
        sendMessageBtn.style.border = '2px solid #D4B08C';
        sendMessageBtn.style.borderRadius = '0';
        sendMessageBtn.style.cursor = 'pointer';
        sendMessageBtn.style.fontSize = '1.1em';
        sendMessageBtn.style.transition = 'all 0.3s';
        sendMessageBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        sendMessageBtn.style.textTransform = 'uppercase';
        sendMessageBtn.style.letterSpacing = '1px';
        sendMessageBtn.addEventListener('click', () => {
            const messageText = messageInput.value.trim();
            if (messageText) {
                sendChatMessage(userName, messageText);
                messageInput.value = '';
            }
        });
        sendMessageBtn.addEventListener('mouseover', () => {
            sendMessageBtn.style.transform = 'translate(-2px, -2px)';
            sendMessageBtn.style.boxShadow = '6px 6px 0 #D4B08C';
        });
        sendMessageBtn.addEventListener('mouseout', () => {
            sendMessageBtn.style.transform = 'none';
            sendMessageBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        });

        // Thêm sự kiện Enter để gửi tin nhắn
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const messageText = messageInput.value.trim();
                if (messageText) {
                    sendChatMessage(userName, messageText);
                    messageInput.value = '';
                }
            }
        });

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(chatHistory);
        modalContent.appendChild(messageInput);
        modalContent.appendChild(sendMessageBtn);
        chatModal.appendChild(modalContent);
        document.body.appendChild(chatModal);
    }
    chatModal.style.display = 'flex';
    loadChatHistory();
}

function loadChatHistory() {
    const birthdayPerson = localStorage.getItem('currentBirthday') || 'unknown';
    const chatHistory = document.getElementById('chatHistory');
    chatHistory.innerHTML = '';
    const chatMessages = JSON.parse(localStorage.getItem('chatMessages') || '{}');
    const messages = chatMessages[birthdayPerson] || [];
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.style.marginBottom = '10px';
        messageDiv.style.color = '#2C1810';
        messageDiv.textContent = `${msg.sender}: ${msg.text} (${msg.time})`;
        chatHistory.appendChild(messageDiv);
    });
    // Cuộn xuống cuối lịch sử chat
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function sendChatMessage(sender, text) {
    const birthdayPerson = localStorage.getItem('currentBirthday') || 'unknown';
    const now = new Date();
    const time = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const message = { sender, text, time };
    let chatMessages = JSON.parse(localStorage.getItem('chatMessages') || '{}');
    if (!chatMessages[birthdayPerson]) {
        chatMessages[birthdayPerson] = [];
    }
    chatMessages[birthdayPerson].push(message);
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    // Cập nhật lịch sử chat
    loadChatHistory();
}

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
        videoModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        videoModal.style.display = 'flex';
        videoModal.style.justifyContent = 'center';
        videoModal.style.alignItems = 'center';
        videoModal.style.zIndex = '10000';
        videoModal.style.display = 'none';

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
            videoModal.style.display = 'none';
        });

        const title = document.createElement('h2');
        title.textContent = 'Video Chúc Mừng Sinh Nhật';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';

        const senderNameInputVideo = document.createElement('input');
        senderNameInputVideo.id = 'senderNameInputVideo';
        senderNameInputVideo.type = 'text';
        senderNameInputVideo.placeholder = 'Nhập tên của bạn...';
        senderNameInputVideo.style.width = '100%';
        senderNameInputVideo.style.padding = '10px';
        senderNameInputVideo.style.border = '2px solid #D4B08C';
        senderNameInputVideo.style.borderRadius = '0';
        senderNameInputVideo.style.marginBottom = '20px';
        senderNameInputVideo.style.fontFamily = '\'Old Standard TT\', serif';
        senderNameInputVideo.style.fontSize = '16px';
        senderNameInputVideo.style.background = '#FFF9F3';
        senderNameInputVideo.style.color = '#2C1810';

        const uploadInput = document.createElement('input');
        uploadInput.type = 'file';
        uploadInput.accept = 'video/mp4, video/webm';
        uploadInput.style.width = '100%';
        uploadInput.style.padding = '10px 0';
        uploadInput.style.marginBottom = '10px';
        uploadInput.style.border = '2px dashed #D4B08C';
        uploadInput.style.background = '#FFF9F3';
        uploadInput.style.color = '#2C1810';
        uploadInput.style.cursor = 'pointer';
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 10 * 1024 * 1024) { // Giới hạn 10MB
                    alert('File video quá lớn. Vui lòng chọn file nhỏ hơn 10MB.');
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(event) {
                    saveVideoMessage(event.target.result, file.name, senderNameInputVideo.value.trim() || 'Ẩn danh');
                    videoModal.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });

        const uploadLabel = document.createElement('label');
        uploadLabel.textContent = 'Tải lên video (MP4/WebM, tối đa 10MB)';
        uploadLabel.style.display = 'block';
        uploadLabel.style.marginBottom = '10px';
        uploadLabel.style.color = '#854D27';
        uploadLabel.style.fontSize = '1em';

        const linkInput = document.createElement('input');
        linkInput.type = 'text';
        linkInput.id = 'videoLinkInput';
        linkInput.placeholder = 'Hoặc nhập liên kết video (YouTube, Vimeo...)';
        linkInput.style.width = '100%';
        linkInput.style.padding = '10px';
        linkInput.style.border = '2px solid #D4B08C';
        linkInput.style.borderRadius = '0';
        linkInput.style.marginBottom = '10px';
        linkInput.style.fontFamily = '\'Old Standard TT\', serif';
        linkInput.style.fontSize = '16px';
        linkInput.style.background = '#FFF9F3';
        linkInput.style.color = '#2C1810';

        const saveLinkBtn = document.createElement('button');
        saveLinkBtn.textContent = 'Lưu Liên Kết Video';
        saveLinkBtn.style.padding = '10px 20px';
        saveLinkBtn.style.background = '#854D27';
        saveLinkBtn.style.color = '#FFF9F3';
        saveLinkBtn.style.border = '2px solid #D4B08C';
        saveLinkBtn.style.borderRadius = '0';
        saveLinkBtn.style.cursor = 'pointer';
        saveLinkBtn.style.fontSize = '1.1em';
        saveLinkBtn.style.transition = 'all 0.3s';
        saveLinkBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        saveLinkBtn.style.textTransform = 'uppercase';
        saveLinkBtn.style.letterSpacing = '1px';
        saveLinkBtn.addEventListener('click', () => {
            const link = linkInput.value.trim();
            const senderName = senderNameInputVideo.value.trim() || 'Ẩn danh';
            if (link) {
                saveVideoMessage(link, 'Liên kết video', senderName);
                videoModal.style.display = 'none';
                linkInput.value = '';
                senderNameInputVideo.value = '';
            } else {
                alert('Vui lòng nhập liên kết video!');
            }
        });
        saveLinkBtn.addEventListener('mouseover', () => {
            saveLinkBtn.style.transform = 'translate(-2px, -2px)';
            saveLinkBtn.style.boxShadow = '6px 6px 0 #D4B08C';
        });
        saveLinkBtn.addEventListener('mouseout', () => {
            saveLinkBtn.style.transform = 'none';
            saveLinkBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        });

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(senderNameInputVideo);
        modalContent.appendChild(uploadLabel);
        modalContent.appendChild(uploadInput);
        modalContent.appendChild(linkInput);
        modalContent.appendChild(saveLinkBtn);
        videoModal.appendChild(modalContent);
        document.body.appendChild(videoModal);
    }
    videoModal.style.display = 'flex';
}

function saveVideoMessage(videoData, videoName, senderName) {
    const birthdayPerson = localStorage.getItem('currentBirthday') || 'unknown';
    let videoMessages = JSON.parse(localStorage.getItem('videoMessages') || '{}');
    if (!videoMessages[birthdayPerson]) {
        videoMessages[birthdayPerson] = [];
    }
    videoMessages[birthdayPerson].push({ url: videoData, name: videoName, sender: senderName });
    localStorage.setItem('videoMessages', JSON.stringify(videoMessages));
    alert('Video chúc mừng đã được lưu!');
    displaySavedVideoMessages();
}

function displaySavedVideoMessages() {
    const birthdayPerson = localStorage.getItem('currentBirthday') || 'unknown';
    const videoMessages = JSON.parse(localStorage.getItem('videoMessages') || '{}');
    const videos = videoMessages[birthdayPerson] || [];
    let playVideoBtn = document.getElementById('playVideoMessagesBtn');
    const customMessageContainer = document.querySelector('.custom-message-container');
    
    if (videos.length > 0) {
        if (!playVideoBtn) {
            playVideoBtn = document.createElement('button');
            playVideoBtn.id = 'playVideoMessagesBtn';
            playVideoBtn.className = 'feature-button';
            playVideoBtn.textContent = '🎥 Xem Video Chúc Mừng';
            playVideoBtn.style.marginTop = '10px';
            playVideoBtn.addEventListener('click', () => {
                openVideoMessagesModal(birthdayPerson);
            });
            customMessageContainer.appendChild(playVideoBtn);
        }
        playVideoBtn.style.display = 'block';
    } else if (playVideoBtn) {
        playVideoBtn.style.display = 'none';
    }
}

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
        videoModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        videoModal.style.display = 'flex';
        videoModal.style.justifyContent = 'center';
        videoModal.style.alignItems = 'center';
        videoModal.style.zIndex = '10000';
        videoModal.style.display = 'none';

        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.border = '2px solid #D4B08C';
        modalContent.style.borderRadius = '0';
        modalContent.style.padding = '20px';
        modalContent.style.width = '80%';
        modalContent.style.maxWidth = '600px';
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
            videoModal.style.display = 'none';
        });

        const title = document.createElement('h2');
        title.textContent = 'Video Chúc Mừng';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';

        const videoList = document.createElement('div');
        videoList.id = 'videoMessagesList';
        videoList.style.marginBottom = '20px';
        videoList.style.textAlign = 'left';
        videoList.style.maxHeight = '300px';
        videoList.style.overflowY = 'scroll';

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(videoList);
        videoModal.appendChild(modalContent);
        document.body.appendChild(videoModal);
    }
    videoModal.style.display = 'flex';

    const videoList = document.getElementById('videoMessagesList');
    videoList.innerHTML = '';
    const videoMessages = JSON.parse(localStorage.getItem('videoMessages') || '{}');
    const videos = videoMessages[birthdayPerson] || [];
    if (videos.length > 0) {
        videos.forEach((videoObj, index) => {
            const videoItem = document.createElement('div');
            videoItem.style.padding = '10px';
            videoItem.style.borderBottom = '1px solid #D4B08C';
            videoItem.style.cursor = 'pointer';
            videoItem.style.color = '#2C1810';
            videoItem.textContent = `Video ${index + 1} từ ${videoObj.sender}`;
            videoItem.addEventListener('click', () => {
                playVideoMessage(videoObj.url);
            });
            videoList.appendChild(videoItem);
        });
    } else {
        const noVideos = document.createElement('p');
        noVideos.textContent = 'Chưa có video chúc mừng nào.';
        noVideos.style.color = '#2C1810';
        videoList.appendChild(noVideos);
    }
}

function playVideoMessage(videoUrl) {
    let videoPlayerModal = document.getElementById('videoPlayerModal');
    if (!videoPlayerModal) {
        videoPlayerModal = document.createElement('div');
        videoPlayerModal.id = 'videoPlayerModal';
        videoPlayerModal.style.position = 'fixed';
        videoPlayerModal.style.top = '0';
        videoPlayerModal.style.left = '0';
        videoPlayerModal.style.width = '100%';
        videoPlayerModal.style.height = '100%';
        videoPlayerModal.style.backgroundColor = 'rgba(0,0,0,0.9)';
        videoPlayerModal.style.display = 'flex';
        videoPlayerModal.style.justifyContent = 'center';
        videoPlayerModal.style.alignItems = 'center';
        videoPlayerModal.style.zIndex = '9999';
        videoPlayerModal.style.display = 'none';

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
        closeBtn.addEventListener('click', () => {
            videoPlayerModal.style.display = 'none';
            const videoPlayer = document.getElementById('videoPlayer');
            if (videoPlayer) {
                videoPlayer.pause();
                videoPlayer.src = '';
            }
            const iframePlayer = document.getElementById('iframePlayer');
            if (iframePlayer) {
                iframePlayer.src = '';
            }
        });

        videoPlayerModal.appendChild(closeBtn);
        document.body.appendChild(videoPlayerModal);
    }
    videoPlayerModal.style.display = 'flex';

    // Xác định loại video (upload hay liên kết)
    if (videoUrl.startsWith('data:video') || videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm')) {
        let videoPlayer = document.getElementById('videoPlayer');
        if (!videoPlayer) {
            videoPlayer = document.createElement('video');
            videoPlayer.id = 'videoPlayer';
            videoPlayer.controls = true;
            videoPlayer.style.maxWidth = '90%';
            videoPlayer.style.maxHeight = '80vh';
            videoPlayer.style.objectFit = 'contain';
            videoPlayerModal.appendChild(videoPlayer);
        }
        // Xóa iframe nếu có
        const iframePlayer = document.getElementById('iframePlayer');
        if (iframePlayer) {
            iframePlayer.remove();
        }
        videoPlayer.src = videoUrl;
        videoPlayer.play().catch(e => console.log('Video play failed:', e));
    } else {
        // Giả sử đây là liên kết YouTube hoặc video nhúng khác
        let iframePlayer = document.getElementById('iframePlayer');
        if (!iframePlayer) {
            iframePlayer = document.createElement('iframe');
            iframePlayer.id = 'iframePlayer';
            iframePlayer.style.width = '90%';
            iframePlayer.style.height = '80vh';
            iframePlayer.style.maxWidth = '800px';
            iframePlayer.style.maxHeight = '450px';
            iframePlayer.style.border = 'none';
            videoPlayerModal.appendChild(iframePlayer);
        }
        // Xóa video player nếu có
        const videoPlayer = document.getElementById('videoPlayer');
        if (videoPlayer) {
            videoPlayer.remove();
        }
        // Chuyển đổi liên kết YouTube thành dạng nhúng nếu có
        let embedUrl = videoUrl;
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            const videoId = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('youtu.be/')[1]?.split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }
        iframePlayer.src = embedUrl;
    }
    videoPlayerModal.addEventListener('click', (e) => {
        if (e.target === videoPlayerModal) {
            videoPlayerModal.style.display = 'none';
            const videoPlayer = document.getElementById('videoPlayer');
            if (videoPlayer) {
                videoPlayer.pause();
                videoPlayer.src = '';
            }
            const iframePlayer = document.getElementById('iframePlayer');
            if (iframePlayer) {
                iframePlayer.src = '';
            }
        }
    });
}

// Tính năng mời bạn bè
function initInviteFriends() {
    // Kiểm tra xem nút mời bạn bè đã tồn tại chưa, nếu chưa thì tạo mới
    let inviteBtn = document.getElementById('inviteFriendsBtn');
    if (!inviteBtn) {
        inviteBtn = document.createElement('button');
        inviteBtn.id = 'inviteFriendsBtn';
        inviteBtn.className = 'feature-button';
        inviteBtn.textContent = '📩 Mời Bạn Bè';
        inviteBtn.style.position = 'fixed';
        inviteBtn.style.top = '80px';
        inviteBtn.style.right = '20px';
        inviteBtn.style.zIndex = '1000';
        document.body.appendChild(inviteBtn);
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
        const birthdayPerson = localStorage.getItem('currentBirthday') || 'bạn thân';
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
                const birthdayPerson = localStorage.getItem('currentBirthday') || 'bạn thân';
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