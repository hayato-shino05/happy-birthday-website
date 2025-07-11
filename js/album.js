// Album module cho happy-birthday-website

// Biến toàn cục lưu trữ thông tin album
let swiperInstance;

// Hàm lấy thống kê media
async function getMediaStats(bucket) {
    if (typeof getMediaStats === 'function' && typeof supabase !== 'undefined') {
        try {
            const stats = await window.getMediaStats(bucket);
            return stats;
        } catch (error) {
            // Lỗi khi lấy thống kê media
            return { total: 0, images: 0, videos: 0, error: true };
        }
    }
    return { total: 0, images: 0, videos: 0, error: true };
}

// Tải dữ liệu album
async function loadAlbumMedia() {
    // Kiểm tra xem đã tải hay chưa
    if (window.mediaFilesLoading) {
        // Đang trong quá trình tải, bỏ qua yêu cầu tải mới
        return;
    }
    
    // Đánh dấu đang tải
    window.mediaFilesLoading = true;
    
    // Lấy các phần tử DOM
    const gallery = document.getElementById('photoGallery');
    const slideshowWrapper = document.getElementById('slideshowWrapper');
    const loadingMsgElement = document.querySelector('.album-loading');
    
    if (!gallery) {
        window.mediaFilesLoading = false;
        return;
    }
    
    // Xóa nội dung cũ nếu có
    gallery.innerHTML = '';
    if (slideshowWrapper) slideshowWrapper.innerHTML = '';
    
    if (loadingMsgElement) {
        loadingMsgElement.textContent = 'Đang tải album...';
        loadingMsgElement.style.display = 'block';
    }

    try {
        // Tạo nút Upload nếu chưa có
        addUploadButton(gallery);
        
        // Kiểm tra thống kê media
        const stats = await getMediaStats('media');
        
        // Hiển thị thông tin
        // Thống kê media
        
        // Nếu có dữ liệu media từ Supabase
        if (stats && stats.total > 0 && !stats.error) {
            // Tải từ Supabase
            window.useLocalMedia = false;
            
            // Lấy danh sách file từ Supabase
            const { data: mediaFiles, error } = await supabase
                .storage
                .from('media')
                .list('', { sortBy: { column: 'name', order: 'asc' } });
            
            if (!error) {
                // Lọc bỏ các thư mục
                window.mediaFiles = mediaFiles
                    .filter(item => !item.metadata || item.metadata.mimetype)
                    .map(item => item.name);
                
                // Đánh dấu đã tải xong
                window.mediaFilesLoaded = true;
                
                // Hiển thị dữ liệu
                window.mediaFiles.forEach(file => renderPhotoItem(file, gallery));
                
                // Đã tải file từ Supabase Storage
                
                // Ẩn thông báo đang tải
                if (loadingMsgElement) {
                    loadingMsgElement.style.display = 'none';
                }
            } else {
                // Không thể tải từ Supabase, dùng local
                window.useLocalMedia = true;
                loadFromLocal(gallery, slideshowWrapper, loadingMsgElement);
            }
        } else {
            // Sử dụng dữ liệu local
            window.useLocalMedia = true;
            loadFromLocal(gallery, slideshowWrapper, loadingMsgElement);
        }
    } catch (error) {
        // Lỗi khi tải ảnh từ Supabase
        // Sử dụng local
        window.useLocalMedia = true;
        loadFromLocal(gallery, slideshowWrapper, loadingMsgElement);
    } finally {
        // Đánh dấu đã hoàn thành việc tải
        window.mediaFilesLoading = false;
    }
}

// Tải dữ liệu local
function loadFromLocal(gallery, slideshowWrapper, loadingMsgElement) {
    // Tạo danh sách ảnh mẫu
    const sampleMedia = [];
    
    // Thêm 10 ảnh mẫu
    for (let i = 1; i <= 10; i++) {
        sampleMedia.push(`${i}.jpg`);
    }
    
    // Thêm video mẫu
    sampleMedia.push('sample.mp4');
    
    // Lưu danh sách file vào biến toàn cục
    window.mediaFiles = sampleMedia;
    window.mediaFilesLoaded = true;
    
    // Hiển thị dữ liệu
    sampleMedia.forEach(file => renderPhotoItem(file, gallery));
    
    // Ẩn thông báo đang tải
    if (loadingMsgElement) {
        loadingMsgElement.style.display = 'none';
    }
}

// Hiển thị một mục ảnh/video
function renderPhotoItem(index, gallery) {
    // Tạo container cho ảnh/video
    const photoContainer = document.createElement('div');
    photoContainer.className = 'photo-item';
    
    // Thêm nút gắn thẻ
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
        // Lấy URL từ Supabase Storage sử dụng đường dẫn trực tiếp
        let baseUrl = 'https://fmvqrwztdoyoworobsix.supabase.co/storage/v1/object/public/media/';
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
            // Video clicked, opening full size
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
            // Play icon clicked, opening full size
            e.stopPropagation(); // Ngăn chặn lan truyền để không kích hoạt click của photoContainer
            openFullSizeMedia(video.src, index, 'video');
        });
        
        photoContainer.appendChild(playIcon);
        
        // Phát video khi hover
        photoContainer.addEventListener('mouseenter', () => {
            video.play().catch(e => {/* Video autoplay failed */});
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
            // Không thể tải ảnh
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
            // Sử dụng dữ liệu đã tải để hiển thị slideshow
            renderSlideshow();
        } else {
            // Chưa tải dữ liệu, cần tải từ server
            // Cần tải dữ liệu trước khi hiển thị slideshow
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
        // Không có dữ liệu để hiển thị slideshow
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
        // Lấy URL từ Supabase Storage sử dụng đường dẫn trực tiếp
        let baseUrl = 'https://fmvqrwztdoyoworobsix.supabase.co/storage/v1/object/public/media/';
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
                video.play().catch(e => {/* Video autoplay failed */});
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
        // Creating video element for full-size view
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
            // Video metadata loaded, trying to play
            mediaElement.play().catch(e => {/* Lỗi khi phát video: */});
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
        // Creating image element for full-size view
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
        // Modal closed
    });

    // Ngăn chặn sự kiện click trên phần tử media khỏi lan truyền đến modal
    mediaElement.addEventListener('click', (e) => {
        // Media element clicked, preventing propagation
        e.stopPropagation();
    });

    document.body.appendChild(modal);
    // Video modal opened
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
        
        // Đã lưu thẻ cho media
        loadAlbumMedia();
    } catch (error) {
        // Lỗi khi lưu thẻ vào Supabase
        alert('Không thể lưu thẻ. Vui lòng thử lại sau!');
        
        // Fallback to localStorage if Supabase fails
        const tagsData = JSON.parse(localStorage.getItem('mediaTags') || '{}');
        tagsData[mediaIndex] = tags;
        localStorage.setItem('mediaTags', JSON.stringify(tagsData));
        // Đã lưu thẻ vào localStorage cho media
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
        // Lỗi khi tìm kiếm theo thẻ từ Supabase
        
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
    uploadIcon.innerHTML = '<img src="assets/icon/upload.png" alt="Upload Icon" style="width: 100px; height: 100px;">';
    uploadIcon.style.fontSize = '40px';
    uploadIcon.style.marginBottom = '10px';
    
    // Văn bản hướng dẫn
    const uploadText = document.createElement('div');
    uploadText.textContent = 'Tải lên';
    uploadText.style.color = '#854D27';
    uploadText.style.fontSize = '20px';
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
                // Đang lưu file:
                
                // Trong thực tế, cần lưu file vào thư mục server
                
                // Tạo URL cho file
                const fileUrl = URL.createObjectURL(file);
                // Đã tạo URL cho file:
                
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
                // Đã tải lên Supabase:
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
        // Lỗi khi tải file lên:
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
    // Mở album ảnh
    
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
        // Không tìm thấy phần tử #memoryWall
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
