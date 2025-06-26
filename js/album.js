// Biến toàn cục cho album
window.mediaFilesLoaded = false;  // Kiểm tra xem đã tải dữ liệu chưa
window.mediaFiles = [];  // Lưu trữ danh sách file đã tải
window.useLocalMedia = false;  // Kiểm soát việc sử dụng local media
window.isLoadingMedia = false;  // Ngăn tải file cùng lúc
window.mediaAlreadyLoaded = false;  // Theo dõi trạng thái tải

// Thêm CSS cho phần video
const albumStyle = document.createElement('style');
albumStyle.textContent = `
.photo-item {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.photo-item:hover {
    transform: scale(1.05);
    z-index: 2;
}

.photo-item-media {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.play-icon {
    transition: all 0.3s ease;
    pointer-events: auto;
}

.photo-item:hover .play-icon {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
}

/* Đảm bảo video trong modal hiển thị đúng */
#fullSizeMediaModal video {
    display: block;
    max-width: 90%;
    max-height: 80vh;
}

/* Đảm bảo các nút điều khiển hiển thị phía trên */
#fullSizeMediaModal button,
#fullSizeMediaModal .caption {
    z-index: 10002;
}
`;
document.head.appendChild(albumStyle);

// Khởi tạo Swiper
let swiperInstance = null;

// Lấy thống kê từ Supabase - có thể tùy chỉnh để lọc các file
async function getMediaStats(bucket) {
    try {
        let { data, error } = await supabase
            .storage
            .from(bucket)
            .list('', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' }
            });
        
        if (error) throw error;
        
        // Lọc bỏ file .emptyFolderPlaceholder
        data = data.filter(file => file.name !== '.emptyFolderPlaceholder');
        
        // Đếm số lượng ảnh và video
        const stats = {
            total: data.length,
            images: data.filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length,
            videos: data.filter(file => file.name.match(/\.(mp4|webm|mov|avi)$/i)).length,
            fileList: data
        };
        
        return stats;
    } catch (error) {
        console.error("Lỗi khi lấy thống kê media:", error);
        throw error;
    }
}

// Chức năng tải media ban đầu - dùng cho cả album và slideshow
async function loadAlbumMedia() {
    // Ngăn tải hai lần
    if (window.isLoadingMedia) {
        console.log("Đang trong quá trình tải, bỏ qua yêu cầu tải mới");
        return;
    }
    
    // Đánh dấu đang tải
    window.isLoadingMedia = true;
    
    const gallery = document.getElementById('photoGallery');
    const slideshowWrapper = document.getElementById('slideshowWrapper');
    
    // Xóa nội dung hiện tại
    gallery.innerHTML = '';
    
    // Hiển thị thông báo đang tải
    const loadingMsg = document.createElement('div');
    loadingMsg.textContent = 'Đang tải album...';
    loadingMsg.style.textAlign = 'center';
    loadingMsg.style.padding = '20px';
    loadingMsg.style.color = '#8B4513';
    loadingMsg.style.fontSize = '16px';
    gallery.appendChild(loadingMsg);
    
    try {
        // Thử lấy dữ liệu từ Supabase Storage
        const stats = await getMediaStats('media');
        console.log('Thống kê media:', stats);
        
        // Hiển thị thống kê vào gallery nhưng sẽ bị xóa sau khi tải xong
        const statsInfo = document.createElement('div');
        statsInfo.innerHTML = `<div style="text-align: center; padding: 5px; margin-bottom: 10px; background: #f8f8f8;">
            <strong>Thông kê Album:</strong> Tổng cộng ${stats.total} file (${stats.images} ảnh, ${stats.videos} video)
        </div>`;
        gallery.appendChild(statsInfo);
        
        // Lấy danh sách file từ Supabase
        const mediaFiles = stats.fileList;
        
        if (!mediaFiles || mediaFiles.length === 0) {
            console.log("Không có dữ liệu từ Supabase, chuyển sang local");
            loadFromLocal(gallery, slideshowWrapper, loadingMsg);
            return;
        }
        
        // Đánh dấu sử dụng Supabase
        window.useLocalMedia = false;
        
        // Lưu vào bộ nhớ đệm
        window.mediaFiles = mediaFiles.map(file => file.name);
        window.mediaFilesLoaded = true;
        
        // Xóa thông báo đang tải
        if (gallery.contains(loadingMsg)) {
            gallery.removeChild(loadingMsg);
        }
        
        // Hiển thị tất cả các file, loại bỏ file .emptyFolderPlaceholder
        mediaFiles.forEach(file => {
            if (file.name !== '.emptyFolderPlaceholder') {
                renderPhotoItem(file.name, gallery);
            }
        });
        
        // Thêm nút tải lên ở cuối
        addUploadButton(gallery);
        
        // Thêm thông tin thống kê vào đầu gallery (giữ lại)
        if (gallery.contains(statsInfo)) {
            gallery.removeChild(statsInfo);
        }
        gallery.insertBefore(statsInfo, gallery.firstChild);
        
        console.log(`Đã tải ${mediaFiles.length} file từ Supabase Storage`);
        
        // Nếu đang ở chế độ slideshow, render slideshow
        if (document.getElementById('slideshowContainer').style.display === 'block') {
            renderSlideshow();
        }
    } catch (error) {
        console.error('Lỗi khi tải ảnh từ Supabase:', error);
        loadFromLocal(gallery, slideshowWrapper, loadingMsg);
    } finally {
        // Xóa trạng thái đang tải
        window.isLoadingMedia = false;
    }
}

// Tải dữ liệu từ thư mục local (fallback khi Supabase lỗi)
function loadFromLocal(gallery, slideshowWrapper, loadingMsgElement) {
    // Đánh dấu sử dụng local media
    window.useLocalMedia = true;
    
    // Xóa thông báo đang tải
    if (loadingMsgElement && gallery.contains(loadingMsgElement)) {
        gallery.removeChild(loadingMsgElement);
    }
    
    // Thông báo chuyển sang local
    gallery.innerHTML = '<div style="text-align: center; padding: 10px; color: orange; margin-bottom: 15px; background-color: #fff3e0; border-radius: 5px;">Không thể kết nối tới Supabase. Hiển thị ảnh từ bộ nhớ cục bộ.</div>';
    
    // Danh sách đầy đủ các file ảnh và video trong thư mục memory
    const fileList = [
        '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', 
        '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg'
    ];
    
    // Hiển thị thông tin thống kê
    const imgCount = fileList.filter(f => f.endsWith('.jpg')).length;
    const vidCount = fileList.filter(f => f.endsWith('.mp4')).length;
    
    const statsInfo = document.createElement('div');
    statsInfo.innerHTML = `<div style="text-align: center; padding: 5px; margin-bottom: 10px; background: #f8f8f8;">
        <strong>Thống kê Album (Local):</strong> Tổng cộng ${fileList.length} file (${imgCount} ảnh, ${vidCount} video)
    </div>`;
    gallery.appendChild(statsInfo);
    
    // Lưu vào bộ nhớ đệm
    window.mediaFiles = [...fileList];
    window.mediaFilesLoaded = true;
    
    // Tải tất cả file local, bỏ qua file .emptyFolderPlaceholder
    fileList.forEach(file => {
        if (file !== '.emptyFolderPlaceholder') {
            renderPhotoItem(file, gallery);
        }
    });
    
    // Thêm nút tải lên ở cuối
    addUploadButton(gallery);
    
    // Di chuyển thống kê lên đầu
    if (gallery.contains(statsInfo)) {
        gallery.removeChild(statsInfo);
    }
    gallery.insertBefore(statsInfo, gallery.firstChild);
    
    // Nếu đang ở chế độ slideshow, render slideshow
    if (document.getElementById('slideshowContainer').style.display === 'block') {
        renderSlideshow();
    }
}

// Render một ảnh/video vào gallery
function renderPhotoItem(index, gallery) {
    // Bỏ qua file .emptyFolderPlaceholder
    if (index === '.emptyFolderPlaceholder') {
        return;
    }
    
    // Sử dụng directory listing để đọc tất cả các file
    const photoContainer = document.createElement('div');
    photoContainer.className = 'photo-item';
    photoContainer.dataset.mediaNumber = index;
    photoContainer.dataset.index = index;  // Thêm index để dễ truy xuất
    
    // Thêm nút tag
    const tagButton = document.createElement('button');
    tagButton.className = 'tag-button';
    tagButton.textContent = '+';
    tagButton.onclick = function(e) {
        e.stopPropagation();
        openTagModal(index);
    };
    photoContainer.appendChild(tagButton);
    
    // Xác định mediaPath dựa trên chế độ (local hoặc Supabase)
    let mediaPath;
    if (window.useLocalMedia) {
        // Sử dụng thư mục memory local
        mediaPath = `memory/${index}`;
    } else {
        // Lấy URL từ Supabase Storage
        const baseUrl = 'https://fmvqrwztdoyoworobsix.supabase.co/storage/v1/object/public/media/';
        mediaPath = `${baseUrl}${index}`;
    }
    
    // Lấy tags từ localStorage
    let mediaTags = JSON.parse(localStorage.getItem('mediaTags') || '{}');
    const mediaKey = `memory/${index}`;
    
    // Thêm hiển thị tags
    if (mediaTags[mediaKey] && mediaTags[mediaKey].length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'tags-container';
        
        mediaTags[mediaKey].forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });
        
        photoContainer.appendChild(tagsContainer);
    }
    
    // Tải ảnh/video
    if (index.endsWith('.mp4')) {
        // Xử lý video
        const video = document.createElement('video');
        video.className = 'photo-item-media';
        video.src = mediaPath;
        video.controls = false;
        video.muted = true;
        video.loop = true;
        video.preload = 'metadata';
        
        // Hiển thị video khi click
        photoContainer.addEventListener('click', () => {
            console.log("Video clicked, opening full size:", index);
            openFullSizeMedia(video.src, index, 'video');
        });
        
        // Hiển thị icon play
        const playIcon = document.createElement('div');
        playIcon.className = 'play-icon';
        playIcon.innerHTML = '▶️';
        playIcon.style.position = 'absolute';
        playIcon.style.top = '50%';
        playIcon.style.left = '50%';
        playIcon.style.transform = 'translate(-50%, -50%)';
        playIcon.style.fontSize = '30px';
        playIcon.style.opacity = '0.8';
        playIcon.style.textShadow = '0 0 5px rgba(0,0,0,0.5)';
        playIcon.style.cursor = 'pointer';
        playIcon.style.zIndex = '5'; // Make sure it's above the video
        
        // Thêm sự kiện click riêng cho icon play
        playIcon.addEventListener('click', (e) => {
            console.log("Play icon clicked, opening full size:", index);
            e.stopPropagation(); // Ngăn chặn lan truyền để không kích hoạt click của photoContainer
            openFullSizeMedia(video.src, index, 'video');
        });
        
        photoContainer.appendChild(playIcon);
        
        // Phát video khi hover
        photoContainer.addEventListener('mouseenter', () => {
            video.play().catch(e => console.log('Video autoplay failed'));
        });
        
        photoContainer.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
        
        video.addEventListener('ended', () => {
            photoContainer.classList.remove('active');
        });
        
        photoContainer.appendChild(video);
    } else {
        // Xử lý ảnh
        const img = document.createElement('img');
        img.className = 'photo-item-media';
        img.src = mediaPath;
        img.alt = 'Memory ' + index;
        img.loading = 'lazy';
        
        // Xử lý lỗi khi tải ảnh
        img.onerror = function() {
            console.error(`Không thể tải ảnh: ${mediaPath}`);
            // Hiển thị hình ảnh lỗi
            img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20fill%3D%22%23EEEEEE%22%20d%3D%22M0%200h400v300H0z%22%2F%3E%3Ctext%20fill%3D%22%23999999%22%20font-family%3D%22Arial%2CSans-serif%22%20font-size%3D%2230%22%20font-weight%3D%22bold%22%20dy%3D%22.3em%22%20x%3D%22200%22%20y%3D%22150%22%20text-anchor%3D%22middle%22%3EKhông%20tải%20được%20ảnh%3C%2Ftext%3E%3C%2Fsvg%3E';
        };
        
        // Hiển thị ảnh khi click
        photoContainer.addEventListener('click', () => {
            openFullSizeMedia(img.src, index, 'image');
        });
        
        photoContainer.appendChild(img);
    }
    
    gallery.appendChild(photoContainer);
}

function toggleSlideshowMode(enabled) {
    const slideshowContainer = document.getElementById('slideshowContainer');
    const photoGallery = document.getElementById('photoGallery');
    if (enabled) {
        photoGallery.style.display = 'none';
        slideshowContainer.style.display = 'block';
        
        // Khởi tạo slideshow dựa vào dữ liệu đã tải
        if (window.mediaFilesLoaded) {
            // Đã tải dữ liệu, hiển thị ngay
            console.log("Sử dụng dữ liệu đã tải để hiển thị slideshow");
            renderSlideshow();
        } else {
            // Chưa tải dữ liệu, cần tải từ server
            console.log("Cần tải dữ liệu trước khi hiển thị slideshow");
            loadAlbumMedia();
        }
    } else {
        photoGallery.style.display = 'grid';
        slideshowContainer.style.display = 'none';
        if (swiperInstance) {
            swiperInstance.destroy();
            swiperInstance = null;
        }
    }
}

// Hiển thị slideshow từ dữ liệu đã tải
function renderSlideshow() {
    const slideshowWrapper = document.getElementById('slideshowWrapper');
    slideshowWrapper.innerHTML = '';
    
    if (!window.mediaFilesLoaded || !window.mediaFiles || window.mediaFiles.length === 0) {
        console.error("Không có dữ liệu để hiển thị slideshow");
        return;
    }
    
    // Tạo slide cho mỗi file, bỏ qua file .emptyFolderPlaceholder
    window.mediaFiles.forEach(file => {
        if (file !== '.emptyFolderPlaceholder') {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slideshowWrapper.appendChild(slide);
            renderSlideItem(file, slide);
        }
    });

    // Khởi tạo Swiper
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

// Render một item vào slide
function renderSlideItem(index, slide) {
    // Bỏ qua file .emptyFolderPlaceholder
    if (index === '.emptyFolderPlaceholder') {
        return;
    }
    
    // Xác định mediaPath dựa trên chế độ (local hoặc Supabase)
    let mediaPath;
    if (window.useLocalMedia) {
        // Sử dụng thư mục memory local
        mediaPath = `memory/${index}`;
    } else {
        // Lấy URL từ Supabase Storage
        const baseUrl = 'https://fmvqrwztdoyoworobsix.supabase.co/storage/v1/object/public/media/';
        mediaPath = `${baseUrl}${index}`;
    }
    
    if (index.endsWith('.mp4')) {
        // Xử lý video
        const videoContainer = document.createElement('div');
        videoContainer.style.width = '100%';
        videoContainer.style.height = '100%';
        videoContainer.style.display = 'flex';
        videoContainer.style.justifyContent = 'center';
        videoContainer.style.alignItems = 'center';
        
        const video = document.createElement('video');
        video.className = 'memory-photo';
        video.src = mediaPath;
        video.controls = true;
        video.loop = true;
        video.style.maxHeight = '80vh';
        video.style.maxWidth = '100%';
        video.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        videoContainer.appendChild(video);
        
        slide.appendChild(videoContainer);
        
        // Tự động phát khi được hiển thị
        slide.addEventListener('transitionend', () => {
            if (slide.classList.contains('swiper-slide-active')) {
                video.play().catch(e => console.log('Video autoplay failed'));
            } else {
                video.pause();
            }
        });
    } else {
        // Xử lý ảnh
        const imgContainer = document.createElement('div');
        imgContainer.style.width = '100%';
        imgContainer.style.height = '100%';
        imgContainer.style.display = 'flex';
        imgContainer.style.justifyContent = 'center';
        imgContainer.style.alignItems = 'center';
        
        const img = document.createElement('img');
        img.className = 'memory-photo';
        img.src = mediaPath;
        img.alt = 'Memory ' + index;
        img.style.maxHeight = '80vh';
        img.style.maxWidth = '100%';
        img.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        imgContainer.appendChild(img);
        
        slide.appendChild(imgContainer);
    }
}

// Khởi tạo lưu trữ thẻ nếu chưa có
function initTags() {
    if (!localStorage.getItem('mediaTags')) {
        localStorage.setItem('mediaTags', JSON.stringify({}));
    }
}

// Mở modal xem ảnh/video full-size
function openFullSizeMedia(mediaUrl, mediaNumber, mediaType) {
    console.log(`Opening ${mediaType} in full size:`, mediaUrl);

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
        console.log("Creating video element for full-size view");
        mediaElement = document.createElement('video');
        mediaElement.src = mediaUrl;
        mediaElement.controls = true;
        mediaElement.autoplay = true;
        mediaElement.style.maxWidth = '90%';
        mediaElement.style.maxHeight = '80vh';
        mediaElement.style.objectFit = 'contain';
        mediaElement.style.zIndex = '10001';
        
        // Đảm bảo video có thể phát được
        mediaElement.addEventListener('loadedmetadata', () => {
            console.log("Video metadata loaded, trying to play");
            mediaElement.play().catch(e => console.error('Lỗi khi phát video:', e));
        });
        
        // Tạo nút phát/dừng phụ trợ
        const playPauseBtn = document.createElement('button');
        playPauseBtn.innerHTML = '⏸️';
        playPauseBtn.style.position = 'absolute';
        playPauseBtn.style.bottom = '100px';
        playPauseBtn.style.left = '50%';
        playPauseBtn.style.transform = 'translateX(-50%)';
        playPauseBtn.style.padding = '10px 20px';
        playPauseBtn.style.background = '#854D27';
        playPauseBtn.style.color = '#FFF9F3';
        playPauseBtn.style.border = '2px solid #D4B08C';
        playPauseBtn.style.cursor = 'pointer';
        playPauseBtn.style.borderRadius = '0';
        playPauseBtn.style.boxShadow = '2px 2px 0 #D4B08C';
        playPauseBtn.style.zIndex = '10002';
        
        playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (mediaElement.paused) {
                mediaElement.play();
                playPauseBtn.innerHTML = '⏸️';
            } else {
                mediaElement.pause();
                playPauseBtn.innerHTML = '▶️';
            }
        });
        
        modal.appendChild(playPauseBtn);
    } else {
        console.log("Creating image element for full-size view");
        mediaElement = document.createElement('img');
        mediaElement.src = mediaUrl;
        mediaElement.style.maxWidth = '90%';
        mediaElement.style.maxHeight = '80vh';
        mediaElement.style.objectFit = 'contain';
        mediaElement.style.zIndex = '10001';
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
    closeBtn.style.zIndex = '10002';
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (mediaType === 'video' && !mediaElement.paused) {
            mediaElement.pause();
        }
        modal.remove();
    });

    const caption = document.createElement('div');
    caption.textContent = `${mediaType === 'video' ? 'Video' : 'Hình'} ${mediaNumber}`;
    caption.style.position = 'absolute';
    caption.style.bottom = '20px';
    caption.style.color = 'white';
    caption.style.fontSize = '18px';
    caption.style.background = 'rgba(0,0,0,0.5)';
    caption.style.padding = '5px 15px';
    caption.style.borderRadius = '20px';
    caption.style.zIndex = '10002';

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
    tagBtn.style.zIndex = '10002';
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
        if (mediaType === 'video' && mediaElement && !mediaElement.paused) {
            mediaElement.pause();
        }
        modal.remove();
        console.log("Modal closed");
    });

    // Ngăn chặn sự kiện click trên phần tử media khỏi lan truyền đến modal
    mediaElement.addEventListener('click', (e) => {
        console.log("Media element clicked, preventing propagation");
        e.stopPropagation();
    });

    document.body.appendChild(modal);
    console.log(`${mediaType} modal opened`);
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
async function saveTags(mediaIndex, tagsInput) {
    try {
        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '').slice(0, 5); // Giới hạn 5 thẻ
        
        // Kiểm tra xem thẻ đã tồn tại chưa
        const { data: existingTags, error: fetchError } = await supabase
            .from('media_tags')
            .select('*')
            .eq('media_path', mediaIndex);
            
        if (fetchError) throw fetchError;
        
        if (existingTags && existingTags.length > 0) {
            // Cập nhật thẻ hiện có
            const { error: updateError } = await supabase
                .from('media_tags')
                .update({ tags: tags })
                .eq('media_path', mediaIndex);
                
            if (updateError) throw updateError;
        } else {
            // Tạo thẻ mới
            const { error: insertError } = await supabase
                .from('media_tags')
                .insert([{ media_path: mediaIndex, tags: tags }]);
                
            if (insertError) throw insertError;
        }
        
        console.log(`Đã lưu thẻ cho media ${mediaIndex}:`, tags);
        // Cập nhật lại giao diện album
        loadAlbumMedia();
    } catch (error) {
        console.error('Lỗi khi lưu thẻ vào Supabase:', error);
        alert('Không thể lưu thẻ. Vui lòng thử lại sau!');
        
        // Fallback to localStorage if Supabase fails
        const tagsData = JSON.parse(localStorage.getItem('mediaTags') || '{}');
        tagsData[mediaIndex] = tags;
        localStorage.setItem('mediaTags', JSON.stringify(tagsData));
        console.log(`Đã lưu thẻ vào localStorage cho media ${mediaIndex}:`, tags);
        // Cập nhật lại giao diện album
        loadAlbumMedia();
    }
}

// Hàm tìm kiếm ảnh/video theo thẻ
async function searchMediaByTag(query) {
    try {
        const photoGallery = document.getElementById('photoGallery');
        const mediaItems = photoGallery.querySelectorAll('.photo-item');
        const searchTerm = query.toLowerCase().trim();
        
        // Nếu không có từ khóa tìm kiếm, hiển thị tất cả
        if (searchTerm === '') {
            mediaItems.forEach(item => {
                item.style.display = 'block';
            });
            return;
        }
        
        // Lấy tất cả các thẻ từ Supabase
        const { data: tagData, error } = await supabase
            .from('media_tags')
            .select('*');
            
        if (error) throw error;
        
        // Tạo đối tượng mapping từ media_path sang tags
        const tagsMap = {};
        if (tagData) {
            tagData.forEach(item => {
                tagsMap[item.media_path] = item.tags;
            });
        }
        
        // Hiển thị/ẩn các item dựa trên thẻ
        mediaItems.forEach(item => {
            const mediaIndex = item.dataset.index;
            const tags = tagsMap[mediaIndex] || [];
            const matches = tags.some(tag => tag.toLowerCase().includes(searchTerm));
            item.style.display = matches ? 'block' : 'none';
        });
    } catch (error) {
        console.error('Lỗi khi tìm kiếm theo thẻ từ Supabase:', error);
        
        // Fallback to localStorage if Supabase fails
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
}

// Tạo nút tải lên ảnh/video
function addUploadButton(gallery) {
    const uploadContainer = document.createElement('div');
    uploadContainer.className = 'photo-item upload-item';
    
    // Tạo photo-item-media giống như các ảnh khác
    const mediaPlaceholder = document.createElement('div');
    mediaPlaceholder.className = 'photo-item-media';
    mediaPlaceholder.style.backgroundColor = '#f5f5f5';
    mediaPlaceholder.style.display = 'flex';
    mediaPlaceholder.style.flexDirection = 'column';
    mediaPlaceholder.style.justifyContent = 'center';
    mediaPlaceholder.style.alignItems = 'center';
    mediaPlaceholder.style.height = '100%';
    
    // Icon tải lên
    const uploadIcon = document.createElement('div');
    uploadIcon.innerHTML = '📤';
    uploadIcon.style.fontSize = '40px';
    uploadIcon.style.marginBottom = '10px';
    
    // Văn bản hướng dẫn
    const uploadText = document.createElement('div');
    uploadText.textContent = 'Tải lên';
    uploadText.style.color = '#854D27';
    uploadText.style.fontSize = '14px';
    uploadText.style.fontWeight = 'bold';
    
    // Input type="file" (ẩn)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'uploadMediaFile';
    fileInput.name = 'uploadMediaFile';
    fileInput.accept = 'image/*,video/*';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    
    // Thêm các phần tử con vào container
    mediaPlaceholder.appendChild(uploadIcon);
    mediaPlaceholder.appendChild(uploadText);
    uploadContainer.appendChild(mediaPlaceholder);
    uploadContainer.appendChild(fileInput);
    
    // Thêm hiệu ứng hover
    uploadContainer.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    uploadContainer.addEventListener('mouseenter', () => {
        uploadContainer.style.transform = 'scale(1.05)';
        uploadContainer.style.boxShadow = '6px 6px 15px rgba(139, 69, 19, 0.5)';
    });
    
    uploadContainer.addEventListener('mouseleave', () => {
        uploadContainer.style.transform = '';
        uploadContainer.style.boxShadow = '';
    });
    
    // Thêm viền đứt nét
    uploadContainer.style.border = '2px dashed #D4B08C';
    
    // Thêm sự kiện click
    uploadContainer.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Xử lý sự kiện khi chọn file
    fileInput.addEventListener('change', handleFileUpload);
    
    // Thêm vào gallery
    gallery.appendChild(uploadContainer);
}

// Xử lý tải file lên
async function handleFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Hiển thị thông báo đang tải
    const uploadStatus = document.createElement('div');
    uploadStatus.className = 'upload-status';
    uploadStatus.style.position = 'fixed';
    uploadStatus.style.top = '20px';
    uploadStatus.style.left = '50%';
    uploadStatus.style.transform = 'translateX(-50%)';
    uploadStatus.style.backgroundColor = '#FFF9F3';
    uploadStatus.style.border = '2px solid #D4B08C';
    uploadStatus.style.padding = '15px 20px';
    uploadStatus.style.zIndex = '10000';
    uploadStatus.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
    uploadStatus.textContent = `Đang tải lên ${files.length} file...`;
    document.body.appendChild(uploadStatus);
    
    try {
        // Kiểm tra kết nối Supabase
        if (!supabase) {
            throw new Error("Không thể kết nối tới Supabase");
        }
        
        // Tải file lên Supabase Storage hoặc lưu vào thư mục local
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = `upload_${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            
            // Cập nhật thông báo
            uploadStatus.textContent = `Đang tải lên (${i+1}/${files.length}): ${file.name}`;
            
            if (window.useLocalMedia) {
                // Lưu vào localStorage để demo
                console.log(`[Local] Đang lưu file: ${fileName}`);
                // Trong thực tế, cần lưu file vào thư mục server
                
                // Tạo URL cho file
                const fileUrl = URL.createObjectURL(file);
                console.log(`Đã tạo URL cho file: ${fileUrl}`);
                
                // Lưu URL vào localStorage để demo
                const localFiles = JSON.parse(localStorage.getItem('localUploadedFiles') || '[]');
                localFiles.push({
                    name: fileName,
                    url: fileUrl,
                    type: file.type
                });
                localStorage.setItem('localUploadedFiles', JSON.stringify(localFiles));
            } else {
                // Tải lên Supabase Storage
                const { data, error } = await supabase.storage
                    .from('media')
                    .upload(fileName, file);
                    
                if (error) throw error;
                console.log(`Đã tải lên Supabase: ${fileName}`);
            }
        }
        
        // Hiển thị thông báo thành công
        uploadStatus.textContent = `Đã tải lên ${files.length} file thành công!`;
        uploadStatus.style.backgroundColor = '#d4edda';
        uploadStatus.style.borderColor = '#c3e6cb';
        uploadStatus.style.color = '#155724';
        
        // Tự động ẩn thông báo sau 3 giây
        setTimeout(() => {
            uploadStatus.remove();
        }, 3000);
        
        // Tải lại album để hiển thị file mới
        loadAlbumMedia();
    } catch (error) {
        console.error('Lỗi khi tải file lên:', error);
        uploadStatus.textContent = `Lỗi: ${error.message || 'Không thể tải file lên'}`;
        uploadStatus.style.backgroundColor = '#f8d7da';
        uploadStatus.style.borderColor = '#f5c6cb';
        uploadStatus.style.color = '#721c24';
        
        // Tự động ẩn thông báo lỗi sau 5 giây
        setTimeout(() => {
            uploadStatus.remove();
        }, 5000);
    }
}

// Khởi tạo Album
function initPhotoAlbum() {
    // Khởi tạo lưu trữ thẻ nếu chưa có
    initTags();
    
    // Đăng ký sự kiện cho nút mở Album
    const openAlbumButton = document.getElementById('openAlbum');
    if (openAlbumButton) {
        openAlbumButton.addEventListener('click', showPhotoAlbum);
    }
    
    // Đăng ký sự kiện cho nút chuyển Slideshow
    const slideshowBtn = document.getElementById('slideshowBtn');
    if (slideshowBtn) {
        slideshowBtn.addEventListener('click', () => {
            toggleSlideshowMode(true);
        });
    }
    
    // Đăng ký sự kiện cho nút đóng Slideshow
    const closeSlideBtn = document.getElementById('closeSlideshow');
    if (closeSlideBtn) {
        closeSlideBtn.addEventListener('click', () => {
            toggleSlideshowMode(false);
        });
    }
    
    // Đăng ký sự kiện cho nút đóng Album
    const closeAlbumBtn = document.createElement('button');
    closeAlbumBtn.id = 'closeAlbum';
    closeAlbumBtn.textContent = 'Đóng Album';
    closeAlbumBtn.className = 'close-album-btn';
    closeAlbumBtn.style.position = 'absolute';
    closeAlbumBtn.style.top = '10px';
    closeAlbumBtn.style.right = '10px';
    closeAlbumBtn.style.padding = '10px 15px';
    closeAlbumBtn.style.background = '#854D27';
    closeAlbumBtn.style.color = '#FFF9F3';
    closeAlbumBtn.style.border = '2px solid #D4B08C';
    closeAlbumBtn.style.borderRadius = '0';
    closeAlbumBtn.style.cursor = 'pointer';
    closeAlbumBtn.style.zIndex = '1000';
    closeAlbumBtn.addEventListener('click', hidePhotoAlbum);
    
    const memoryWall = document.getElementById('memoryWall');
    if (memoryWall && !document.getElementById('closeAlbum')) {
        memoryWall.appendChild(closeAlbumBtn);
    }
    
    // Tải media vào album khi trang web tải xong
    loadAlbumMedia();

    // Đăng ký sự kiện cho thanh tìm kiếm
    const searchInput = document.getElementById('searchTags');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchMediaByTag(e.target.value);
        });
    }
}

// Hàm hiển thị album ảnh
function showPhotoAlbum() {
    console.log('Mở album ảnh');
    
    const memoryWall = document.getElementById('memoryWall');
    if (memoryWall) {
        // Đảm bảo CSS hoàn chỉnh
        memoryWall.style.position = 'fixed';
        memoryWall.style.top = '50%';
        memoryWall.style.left = '50%';
        memoryWall.style.transform = 'translate(-50%, -50%)';
        memoryWall.style.width = '80%';
        memoryWall.style.height = '80%';
        memoryWall.style.background = '#FFF9F3';
        memoryWall.style.border = '2px solid #D4B08C';
        memoryWall.style.zIndex = '2000';
        memoryWall.style.padding = '20px';
        memoryWall.style.overflowY = 'auto';
        memoryWall.style.boxShadow = '8px 8px 0 #D4B08C';
        
        // Hiệu ứng hiển thị
        memoryWall.style.display = 'block';
        memoryWall.style.opacity = '0'; 
        memoryWall.style.transition = 'opacity 0.3s ease';
        
        // Animation hiển thị
        setTimeout(() => {
            memoryWall.style.opacity = '1';
        }, 10);
    } else {
        console.error('Không tìm thấy phần tử #memoryWall');
    }
    
    // Tải lại dữ liệu media nếu cần
    loadAlbumMedia();
}

// Hàm ẩn album ảnh
function hidePhotoAlbum() {
    const memoryWall = document.getElementById('memoryWall');
    if (memoryWall) {
        memoryWall.style.opacity = '0';
        setTimeout(() => {
            memoryWall.style.display = 'none';
        }, 300);
    }
}

// Khởi chạy khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra tồn tại của các phần tử cần thiết trước khi khởi tạo
    if (document.getElementById('photoGallery')) {
        initPhotoAlbum();
    }
});
