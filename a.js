function loadSamplePhotos() {
    const gallery = document.getElementById('photoGallery');
    gallery.innerHTML = '';
    
    // Định nghĩa các định dạng file được hỗ trợ
    const supportedFormats = {
        images: ['.jpg', '.jpeg', '.png', '.gif'],
        videos: ['.mp4', '.webm']
    };
    
    const totalFiles = 50; // Giảm xuống chỉ 50 file để phù hợp với số lượng trong code thứ 2
    let loadedCount = 0;
    
    for (let i = 1; i <= totalFiles; i++) {
        tryLoadMedia(i, supportedFormats, gallery, function(success) {
            if (success) loadedCount++;
            
            // Nếu không có file nào được tải, hiển thị thông báo
            if (i === totalFiles && loadedCount === 0) {
                const noFiles = document.createElement('div');
                noFiles.className = 'no-files-message';
                noFiles.textContent = 'Không tìm thấy ảnh hoặc video trong album.';
                noFiles.style.padding = '20px';
                noFiles.style.textAlign = 'center';
                gallery.appendChild(noFiles);
            }
        });
    }
}

function tryLoadMedia(index, formats, gallery, callback) {
    const mediaItem = document.createElement('div');
    mediaItem.className = 'media-item';
    gallery.appendChild(mediaItem);
    
    // Tạo danh sách các định dạng cần thử
    const imageFormats = formats.images.map(ext => `memory/${index}${ext}`);
    const videoFormats = formats.videos.map(ext => `memory/${index}${ext}`);
    
    // Thử tải ảnh trước
    tryLoadImage(0);
    
    function tryLoadImage(imageIndex) {
        if (imageIndex >= imageFormats.length) {
            // Nếu không tìm thấy ảnh, thử tải video
            tryLoadVideo(0);
            return;
        }
        
        const img = new Image();
        img.onload = function() {
            // Ảnh tồn tại, hiển thị nó
            createImageElement(imageFormats[imageIndex], mediaItem, imageFormats[imageIndex]);
            callback(true);
        };
        
        img.onerror = function() {
            // Thử định dạng ảnh tiếp theo
            tryLoadImage(imageIndex + 1);
        };
        
        img.src = imageFormats[imageIndex];
    }
    
    function tryLoadVideo(videoIndex) {
        if (videoIndex >= videoFormats.length) {
            // Không tìm thấy cả ảnh và video, xóa mediaItem
            mediaItem.remove();
            callback(false);
            return;
        }
        
        const video = document.createElement('video');
        
        // Chỉ cần set src một lần và bắt sự kiện lỗi
        video.addEventListener('error', function() {
            // Thử định dạng video tiếp theo
            tryLoadVideo(videoIndex + 1);
        });
        
        // Nếu video có thể tải metadata (tồn tại), hiển thị nó
        video.addEventListener('loadedmetadata', function() {
            createVideoElement(videoFormats[videoIndex], mediaItem);
            callback(true);
        });
        
        // Thử tải video
        video.src = videoFormats[videoIndex];
        video.preload = 'metadata';
    }
}

function createImageElement(src, container, originalPath) {
    const img = document.createElement('img');
    img.className = 'memory-media';
    img.src = src;
    img.alt = `Memory ${container.children.length + 1}`;
    
    img.addEventListener('click', () => {
        openFullSizeMedia(originalPath, container.children.length + 1, 'image');
    });

    container.appendChild(img);
    
    // Fallback nếu ảnh không tồn tại
    img.onerror = function() {
        this.src = '/api/placeholder/200/200';
        this.onerror = null; // Ngăn chặn vòng lặp vô hạn
    };
}

function createVideoElement(src, container) {
    const video = document.createElement('video');
    video.className = 'memory-media';
    video.src = src;
    video.controls = true;
    video.muted = true; // Cần thiết cho mobile
    
    // Thêm preview thumbnail
    const thumbContainer = document.createElement('div');
    thumbContainer.className = 'video-thumbnail-container';
    
    // Icon play
    const playIcon = document.createElement('div');
    playIcon.className = 'play-icon';
    playIcon.innerHTML = '▶️';
    
    thumbContainer.appendChild(video);
    thumbContainer.appendChild(playIcon);
    
    thumbContainer.addEventListener('click', () => {
        openFullSizeMedia(src, container.children.length + 1, 'video');
    });

    container.appendChild(thumbContainer);
}

// Cập nhật hàm openFullSizeMedia để phù hợp với openFullSizeImage từ code thứ 2
function openFullSizeMedia(src, index, type) {
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
    
    if (type === 'image') {
        mediaElement = document.createElement('img');
        mediaElement.src = src;
    } else if (type === 'video') {
        mediaElement = document.createElement('video');
        mediaElement.src = src;
        mediaElement.controls = true;
        mediaElement.autoplay = true;
    }
    
    mediaElement.style.maxWidth = '90%';
    mediaElement.style.maxHeight = '90vh';
    mediaElement.style.objectFit = 'contain';

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
    caption.textContent = type === 'image' ? `Hình ${index}` : `Video ${index}`;
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
        modal.remove();
    });

    mediaElement.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.body.appendChild(modal);
}