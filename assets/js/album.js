
const AlbumConfig = {
    supabaseStorageUrl: '${SUPABASE_URL}/storage/v1/object/public/media/',
    mediaBucket: 'media',
    itemLimit: 100,
    itemOffset: 0,
    sortColumn: 'name',
    sortOrder: 'asc',
    cacheExpiryTime: 60000,
    defaultErrorTimeout: 5000,
    defaultSuccessTimeout: 3000,
    slideshowDelay: 3000,
    slideshowTransitionSpeed: 300
};



const AlbumState = {
    mediaFilesLoaded: false,
    mediaFiles: [],
    isLoadingMedia: false,
    cacheTime: 0,
    mediaTags: {},
    currentPage: 1,
    itemsPerPage: 20,
    observers: [],
    slideshow: {
        active: false,
        currentIndex: 0,
        timer: null,
        slides: [],
        isPlaying: false
    }
};


function cleanupResources() {

    if (AlbumState.observers.length > 0) {
        AlbumState.observers.forEach(observer => {
            if (observer && typeof observer.disconnect === 'function') {
                observer.disconnect();
            }
        });
        AlbumState.observers = [];
    }
    

    if (AlbumState.slideshow.timer) {
        clearTimeout(AlbumState.slideshow.timer);
        AlbumState.slideshow.timer = null;
    }
    

    invalidateCache();
}



let swiperInstance = null;

/**
 * Supabaseから統計を取得する - ファイルをフィルタリングできる
 * @param {string} bucket ストレージバケット名
 * @param {boolean} useCache キャッシュを使うかどうか
 * @returns {Promise<Object>} メディア統計
 */
async function getMediaStats(bucket = AlbumConfig.mediaBucket, useCache = true) {
    try {

        const now = Date.now();
        if (useCache && AlbumState.cacheTime > 0 && 
            (now - AlbumState.cacheTime < AlbumConfig.cacheExpiryTime) && 
            AlbumState.mediaFiles.length > 0) {
            
            return {
                total: AlbumState.mediaFiles.length,
                images: AlbumState.mediaFiles.filter(file => getFileType(file) === 'image').length,
                videos: AlbumState.mediaFiles.filter(file => getFileType(file) === 'video').length,
                fileList: AlbumState.mediaFiles.map(name => ({ name }))
            };
        }
        

        const { data, error } = await supabase
            .storage
            .from(bucket)
            .list('', {
                limit: AlbumConfig.itemLimit,
                offset: (AlbumState.currentPage - 1) * AlbumState.itemsPerPage,
                sortBy: { column: AlbumConfig.sortColumn, order: AlbumConfig.sortOrder }
            });
        
        if (error) throw error;
        

        const filteredData = data.filter(file => file.name !== '.emptyFolderPlaceholder');
        

        const stats = {
            total: filteredData.length,
            images: filteredData.filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length,
            videos: filteredData.filter(file => file.name.match(/\.(mp4|webm|mov|avi)$/i)).length,
            fileList: filteredData
        };
        

        AlbumState.cacheTime = now;
        
        return stats;
    } catch (error) {
        handleError(error, "メディア統計の取得エラー");
        throw error;
    }
}

/**
 * キャッシュをクリアする
 */
function invalidateCache() {
    AlbumState.cacheTime = 0;
    AlbumState.mediaFiles = [];
    AlbumState.mediaFilesLoaded = false;
}


const NotificationManager = {
    notifications: new Map(),
    
    create(id, type = 'info', options = {}) {

        this.remove(id);
        
        const defaultOptions = {
            position: 'bottom-center',
            autoHide: true,
            duration: 3000,
            showProgress: false
        };
        
        const config = { ...defaultOptions, ...options };
        
        const notification = createElementWithStyles('div', {}, { 
            id,
            className: `notification ${type} ${config.position}`
        });
        

        const textElement = createElementWithStyles('span', {}, {
            className: 'notification-text'
        });
        notification.appendChild(textElement);
        

        if (config.showProgress) {
            const progressContainer = createElementWithStyles('div', {}, {
                className: 'notification-progress'
            });
            
            const progressBar = createElementWithStyles('div', {}, { 
                className: 'progress-bar' 
            });
            
            progressContainer.appendChild(progressBar);
            notification.appendChild(progressContainer);
        }
        
        document.body.appendChild(notification);
        

        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        

        this.notifications.set(id, {
            element: notification,
            textElement,
            config,
            timeout: null
        });
        

        if (config.autoHide && config.duration > 0) {
            this.scheduleHide(id, config.duration);
        }
        
        return notification;
    },
    
    update(id, message, progress = -1) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        

        notification.textElement.textContent = message;
        

        if (progress >= 0) {
            const progressBar = notification.element.querySelector('.progress-bar');
            if (progressBar) {

                progressBar.className = progressBar.className.replace(/progress-bar-\d+/g, '').trim();

                const progressValue = Math.min(100, Math.max(0, Math.round(progress / 10) * 10));
                progressBar.classList.add(`progress-bar-${progressValue}`);
            }
        }
    },
    
    remove(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        

        if (notification.timeout) {
            clearTimeout(notification.timeout);
        }
        

        notification.element.classList.add('hide');
        notification.element.classList.remove('show');
        
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
        }, 300);
        
        this.notifications.delete(id);
    },
    
    scheduleHide(id, duration) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        notification.timeout = setTimeout(() => {
            this.remove(id);
        }, duration);
    },
    
    getPositionStyles(position) {

        return {};
    },
    
    getTypeStyles(type) {

        return {};
    }
};


function showLoadingProgress(message, progress = -1) {
    NotificationManager.create('albumLoading', 'info', {
        showProgress: progress >= 0,
        autoHide: false,
        position: 'bottom-center'
    });
    
    NotificationManager.update('albumLoading', message, progress);
    return document.getElementById('albumLoading');
}


function hideLoadingProgress() {
    NotificationManager.remove('albumLoading');
}


function checkSupabaseInitialized() {
    if (typeof supabase === 'undefined') {
        handleError(new Error('Supabaseが初期化されていません'), 'データベース接続エラー', true);
        return false;
    }
    return true;
}


async function loadAlbumMedia(forceRefresh = false) {

    if (AlbumState.isLoadingMedia) {
        return;
    }
    
    if (!checkSupabaseInitialized()) {
        return;
    }
    

    AlbumState.isLoadingMedia = true;
    
    const gallery = document.getElementById('photoGallery');
    const slideshowWrapper = document.getElementById('slideshowWrapper');
    

    showLoadingProgress('アルバムデータを読み込み中...', 10);
    

    if (forceRefresh) {
        gallery.innerHTML = '';
        invalidateCache();
    }
    
    try {

        const stats = await getMediaStats(AlbumConfig.mediaBucket, !forceRefresh);
        showLoadingProgress('データを受け取りました...', 40);
        

        let statsInfo = document.getElementById('mediaStatsInfo');
        if (!statsInfo) {
            statsInfo = createElementWithStyles('div', {}, { 
                id: 'mediaStatsInfo',
                className: 'media-stats-info'
            });
            statsInfo.innerHTML = `<strong>アルバム統計:</strong> 合計 ${stats.total} ファイル (${stats.images} 画像, ${stats.videos} 動画)`;
            
            if (gallery.firstChild) {
                gallery.insertBefore(statsInfo, gallery.firstChild);
            } else {
                gallery.appendChild(statsInfo);
            }
        } else {
            statsInfo.innerHTML = `<strong>アルバム統計:</strong> 合計 ${stats.total} ファイル (${stats.images} 画像, ${stats.videos} 動画)`;
        }
        

        const mediaFiles = stats.fileList;
        
        if (!mediaFiles || mediaFiles.length === 0) {
            const noDataMsg = createElementWithStyles('div', {}, {
                className: 'no-data-message'
            }, '画像や動画がありません。');
            
            gallery.appendChild(noDataMsg);
            hideLoadingProgress();
            AlbumState.isLoadingMedia = false;
            return;
        }
        

        AlbumState.mediaFiles = mediaFiles.map(file => file.name);
        AlbumState.mediaFilesLoaded = true;
        
        showLoadingProgress('メディアを表示中...', 70);
        

        const mediaItemsExist = gallery.querySelectorAll('.photo-item').length > 0;
        

        if (!mediaItemsExist || forceRefresh) {
            mediaFiles.forEach((file, index) => {
                if (file.name !== '.emptyFolderPlaceholder') {

                    setTimeout(() => {
                        renderPhotoItem(file.name, gallery);
                        

                        const progress = 70 + Math.floor(30 * (index + 1) / mediaFiles.length);
                        showLoadingProgress(`メディアを表示中 (${index+1}/${mediaFiles.length})...`, progress);
                        

                        if (index === mediaFiles.length - 1) {

                            addUploadButton(gallery);
                            hideLoadingProgress();
                        }
                    }, 0);
                }
            });
        } else {
            hideLoadingProgress();
        }
        

        if (document.getElementById('slideshowContainer').style.display === 'block') {
            renderSlideshow();
        }
    } catch (error) {
        handleError(error, 'Supabaseから画像読み込みエラー', true);
        
        const errorMsg = createElementWithStyles('div', {}, {
            className: 'error-message-inline'
        }, 'Supabaseからデータを読み込めません。しばらくしてからもう一度お試しください。');
        
        gallery.innerHTML = '';
        gallery.appendChild(errorMsg);
    } finally {

        AlbumState.isLoadingMedia = false;
    }
}


function getFileType(fileName) {
    if (fileName.match(/\.(mp4|webm|mov|avi)$/i)) {
        return 'video';
    } else {
        return 'image';
    }
}


function createMediaElement(mediaPath, fileName, mediaType) {
    if (mediaType === 'video') {

        const video = createElementWithStyles('video', {}, {
            className: 'photo-item-media',
            src: mediaPath,
            controls: false,
            muted: true,
            loop: true,
            preload: 'metadata'
        });
        
        return video;
    } else {

        const img = createElementWithStyles('img', {}, {
            className: 'photo-item-media',
            src: mediaPath,
            alt: `Memory ${fileName}`,
            loading: 'lazy'
        });
        

        img.onerror = function() {
            console.error(`画像を読み込めません: ${mediaPath}`);

            img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20fill%3D%22%23EEEEEE%22%20d%3D%22M0%200h400v300H0z%22%2F%3E%3Ctext%20fill%3D%22%23999999%22%20font-family%3D%22Arial%2CSans-serif%22%20font-size%3D%2230%22%20font-weight%3D%22bold%22%20dy%3D%22.3em%22%20x%3D%22200%22%20y%3D%22150%22%20text-anchor%3D%22middle%22%3E画像読込失敗%3C%2Ftext%3E%3C%2Fsvg%3E';
        };
        
        return img;
    }
}


async function getMediaTags(mediaPath) {
    try {
        if (!checkSupabaseInitialized()) {
            return [];
        }

        const { data, error } = await supabase
            .from('media_tags')
            .select('tags')
            .eq('media_path', mediaPath)
            .single();
            
        if (error) {

            if (error.code === 'PGRST116') {
                return [];
            }
            throw error;
        }
        
        return data?.tags || [];
    } catch (error) {
        handleError(error, `メディア ${mediaPath} のタグ取得エラー`);
        return [];
    }
}


async function saveMediaTags(mediaPath, tagsInput) {
    try {
        if (!checkSupabaseInitialized()) {
            return false;
        }


        const tags = tagsInput
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '')
            .slice(0, 5);
        

        const { data: existingTags, error: fetchError } = await supabase
            .from('media_tags')
            .select('*')
            .eq('media_path', mediaPath);
            
        if (fetchError) throw fetchError;
        
        let result;
        if (existingTags && existingTags.length > 0) {

            const { error: updateError } = await supabase
                .from('media_tags')
                .update({ tags: tags })
                .eq('media_path', mediaPath);
                
            if (updateError) throw updateError;
            result = true;
        } else {

            const { error: insertError } = await supabase
                .from('media_tags')
                .insert([{ media_path: mediaPath, tags: tags }]);
                
            if (insertError) throw insertError;
            result = true;
        }
        
        return result;
    } catch (error) {
        handleError(error, `メディア ${mediaPath} のタグ保存エラー`, true);
        return false;
    }
}


async function displayTags(container, mediaPath) {
    try {

        const tags = await getMediaTags(mediaPath);
        

        const existingTagsContainer = container.querySelector('.tags-container');
        if (existingTagsContainer) {
            container.removeChild(existingTagsContainer);
        }
        

        if (tags && tags.length > 0) {
            const tagsContainer = createElementWithStyles('div', {}, { className: 'tags-container' });
            
            tags.forEach(tag => {
                const tagElement = createElementWithStyles('span', {}, { className: 'tag' }, tag);
                tagsContainer.appendChild(tagElement);
            });
            
            container.appendChild(tagsContainer);
        }
    } catch (error) {
        handleError(error, `メディア ${mediaPath} のタグ表示エラー`);
    }
}


function renderPhotoItem(index, gallery) {

    if (index === '.emptyFolderPlaceholder') {
        return;
    }
    

    const photoContainer = createElementWithStyles('div', {}, {
        className: 'photo-item',
        'data-mediaNumber': index,
        'data-index': index
    });
    

    const tagButton = createElementWithStyles('button', {}, {
        className: 'tag-button',
    }, '+', (e) => {
        e.stopPropagation();
        openTagModal(index);
    });
    
    photoContainer.appendChild(tagButton);
    

    const mediaPath = getMediaPath(index);
    
    const mediaKey = `memory/${index}`;
    displayTags(photoContainer, mediaKey);
    
    const mediaType = getFileType(index);
    
    if (mediaType === 'video') {
        const video = createMediaElement(mediaPath, index, 'video');
        
        photoContainer.addEventListener('click', () => {
            openFullSizeMedia(video.src, index, 'video');
        });
        
        const playIcon = createElementWithStyles('div', {}, { className: 'play-icon play-icon-enhanced' }, '▶️', (e) => {
            e.stopPropagation(); 
            openFullSizeMedia(video.src, index, 'video');
        });
        
        photoContainer.appendChild(playIcon);
        
        photoContainer.addEventListener('mouseenter', () => {
            video.play().catch(e => console.log('動画の自動再生が失敗しました'));
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
        const img = createMediaElement(mediaPath, index, 'image');
        
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
        if (photoGallery) {
            photoGallery.classList.add('display-none');
            photoGallery.classList.remove('display-grid');
        }
        if (slideshowContainer) {
            slideshowContainer.classList.add('display-block');
            slideshowContainer.classList.remove('display-none');
        }
        
        AlbumState.slideshow.active = true;
        
        if (AlbumState.mediaFilesLoaded && AlbumState.mediaFiles.length > 0) {
            renderSlideshow();
        } else {
            showLoadingProgress("スライドショーのデータを読み込み中...");
            loadAlbumMedia(false, () => {
                hideLoadingProgress();
                renderSlideshow();
            });
        }
    } else {
        stopSlideshow();
        AlbumState.slideshow.active = false;
        
        if (slideshowContainer) {
            slideshowContainer.classList.add('display-none');
            slideshowContainer.classList.remove('display-block');
        }
        if (photoGallery) {
            photoGallery.classList.add('display-grid');
            photoGallery.classList.remove('display-none');
        }
    }
}

function renderSlideshow() {
    const slideshowContainer = document.getElementById('slideshowContainer');
    if (!slideshowContainer) {
        handleError(new Error("スライドショーのコンテナが見つかりません"), "スライドショー表示エラー");
        return;
    }

    slideshowContainer.innerHTML = '';
    
    if (!AlbumState.mediaFilesLoaded || !AlbumState.mediaFiles || AlbumState.mediaFiles.length === 0) {
        slideshowContainer.innerHTML = '<div class="error-message">スライドショーで表示するデータがありません</div>';
        return;
    }

    AlbumState.slideshow.slides = AlbumState.mediaFiles.filter(file => file !== '.emptyFolderPlaceholder');
    
    const slidesWrapper = document.createElement('div');
    slidesWrapper.className = 'slideshow-wrapper';
    slideshowContainer.appendChild(slidesWrapper);
    
    AlbumState.slideshow.slides.forEach((file, index) => {
        const slide = document.createElement('div');
        slide.className = 'slideshow-slide';
        if (index === 0) slide.classList.add('active'); 
        slidesWrapper.appendChild(slide);
        
        renderSlideItem(file, slide);
    });
    
    const prevButton = document.createElement('div');
    prevButton.className = 'slideshow-nav slideshow-prev';
    prevButton.innerHTML = '&#10094;';
    prevButton.addEventListener('click', () => navigateSlideshow('prev'));
    
    const nextButton = document.createElement('div');
    nextButton.className = 'slideshow-nav slideshow-next';
    nextButton.innerHTML = '&#10095;';
    nextButton.addEventListener('click', () => navigateSlideshow('next'));
    
    slideshowContainer.appendChild(prevButton);
    slideshowContainer.appendChild(nextButton);
    
    const pagination = document.createElement('div');
    pagination.className = 'slideshow-pagination';
    
    AlbumState.slideshow.slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'slideshow-dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        pagination.appendChild(dot);
    });
    
    const controls = document.createElement('div');
    controls.className = 'slideshow-controls';
    
    const playPauseBtn = document.createElement('button');
    playPauseBtn.className = 'slideshow-button';
    playPauseBtn.textContent = '一時停止';
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'slideshow-button';
    closeBtn.textContent = 'スライドショーを終了';
    closeBtn.addEventListener('click', () => toggleSlideshowMode(false));
    
    controls.appendChild(playPauseBtn);
    controls.appendChild(pagination);
    controls.appendChild(closeBtn);
    
    slideshowContainer.appendChild(controls);
    
    AlbumState.slideshow.currentIndex = 0;
    startSlideshow();
}

function renderSlideItem(fileName, slide) {
    if (!fileName || fileName === '.emptyFolderPlaceholder') {
        return;
    }
    
    const mediaPath = getMediaPath(fileName);
    const mediaType = getFileType(fileName);
    
    const mediaContainer = createElementWithStyles('div', {}, { className: 'media-container' });
    
    if (mediaType === 'video') {
        const video = createElementWithStyles('video', {}, {
            className: 'memory-photo',
            src: mediaPath,
            controls: true,
            loop: false,
            preload: 'metadata'
        });
        
        mediaContainer.appendChild(video);
        
        slide.addEventListener('transitionend', () => {
            if (slide.classList.contains('active')) {
                video.play().catch(e => console.log('動画の自動再生が失敗しました'));
            } else {
                video.pause();
                video.currentTime = 0;
            }
        });
    } else {
        const img = createElementWithStyles('img', {}, {
            className: 'memory-photo',
            src: mediaPath,
            alt: `Memory ${fileName}`,
            loading: 'lazy'
        });
        
        mediaContainer.appendChild(img);
    }
    
    slide.appendChild(mediaContainer);
}

function startSlideshow() {
    AlbumState.slideshow.isPlaying = true;
    
    if (AlbumState.slideshow.timer) {
        clearTimeout(AlbumState.slideshow.timer);
    }
    
    AlbumState.slideshow.timer = setTimeout(() => {
        navigateSlideshow('next');
    }, AlbumConfig.slideshowDelay);
}

function stopSlideshow() {
    AlbumState.slideshow.isPlaying = false;
    
    if (AlbumState.slideshow.timer) {
        clearTimeout(AlbumState.slideshow.timer);
        AlbumState.slideshow.timer = null;
    }
    
    const videos = document.querySelectorAll('#slideshowContainer video');
    videos.forEach(video => {
        video.pause();
        video.currentTime = 0;
    });
}

function togglePlayPause() {
    const playPauseBtn = document.querySelector('.slideshow-controls .slideshow-button:first-child');
    
    if (AlbumState.slideshow.isPlaying) {
        stopSlideshow();
        if (playPauseBtn) playPauseBtn.textContent = '再開';
    } else {
        startSlideshow();
        if (playPauseBtn) playPauseBtn.textContent = '一時停止';
    }
}

function navigateSlideshow(direction) {
    let currentIndex = AlbumState.slideshow.currentIndex;
    let newIndex;
    
    if (direction === 'next') {
        newIndex = (currentIndex + 1) % AlbumState.slideshow.slides.length;
    } else {
        newIndex = (currentIndex - 1 + AlbumState.slideshow.slides.length) % AlbumState.slideshow.slides.length;
    }
    
    goToSlide(newIndex);
}

function goToSlide(index) {
    AlbumState.slideshow.currentIndex = index;
    
    const slides = document.querySelectorAll('.slideshow-slide');
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    
    const dots = document.querySelectorAll('.slideshow-dot');
    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    const videos = document.querySelectorAll('#slideshowContainer video');
    videos.forEach((video, i) => {
        const slide = video.closest('.slideshow-slide');
        if (slide && slide.classList.contains('active')) {
            video.play().catch(e => console.log('動画の自動再生が失敗しました'));
        } else {
            video.pause();
            video.currentTime = 0;
        }
    });
    
    if (AlbumState.slideshow.isPlaying) {
        if (AlbumState.slideshow.timer) {
            clearTimeout(AlbumState.slideshow.timer);
        }
        
        AlbumState.slideshow.timer = setTimeout(() => {
            navigateSlideshow('next');
        }, AlbumConfig.slideshowDelay);
    }
}

function initTags() {
}

/**
 * @param {string} id 
 * @param {object} styles 
 * @returns {HTMLElement} 
 */
function createModal(id, styles = {}) {
    const existingModal = document.getElementById(id);
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = createElementWithStyles('div', {
        ...styles
    }, { id: id, className: 'modal-base' });
    
    document.body.appendChild(modal);
    
    return modal;
}

/**
 * @param {HTMLElement} parentElement 
 * @param {Function} closeHandler 
 * @returns {HTMLElement} 
 */
function createCloseButton(parentElement, closeHandler) {
    const closeBtn = createElementWithStyles('button', {}, { className: 'modal-close-button' }, '×', (e) => {
        e.stopPropagation();
        if (closeHandler) {
            closeHandler(e);
        } else {
            parentElement.remove();
        }
    });
    
    parentElement.appendChild(closeBtn);
    return closeBtn;
}

/**
 * @param {string} text 
 * @param {object} styles 
 * @param {Function} clickHandler 
 * @param {object} attributes 
 * @returns {HTMLElement} 
 */
function createButton(text, styles = {}, clickHandler = null, attributes = {}) {
    return createElementWithStyles('button', {
        ...styles
    }, { ...attributes, className: `button-default ${attributes.className || ''}`.trim() }, text, clickHandler);
}

/**
 * @param {string} mediaUrl 
 * @param {string} mediaNumber 
 * @param {string} mediaType 
 */
function openFullSizeMedia(mediaUrl, mediaNumber, mediaType) {
    const modal = createModal('fullSizeMediaModal');
    const modalContent = createElementWithStyles('div', {}, { className: 'modal-content' });
    let mediaElement;
    
    if (mediaType === 'video') {
        mediaElement = createElementWithStyles('video', {}, {
            className: 'fullsize-media',
            src: mediaUrl,
            controls: true,
            autoplay: true
        });
        
        mediaElement.addEventListener('loadedmetadata', () => {
            mediaElement.play().catch(e => handleError(e, 'ビデオ再生エラー'));
        });
        
        const playPauseBtn = createButton(
            '⏸️',
            {},
            (e) => {
                e.stopPropagation();
                if (mediaElement.paused) {
                    mediaElement.play();
                    playPauseBtn.innerHTML = '⏸️';
                } else {
                    mediaElement.pause();
                    playPauseBtn.innerHTML = '▶️';
                }
            }
        );
        
        playPauseBtn.classList.add('media-play-pause-btn');
        modal.appendChild(playPauseBtn);
    } else {
        mediaElement = createElementWithStyles('img', {}, {
            className: 'fullsize-media',
            src: mediaUrl,
            alt: `Memory ${mediaNumber}`
        });
    }

    createCloseButton(modal, () => {
        if (mediaType === 'video' && mediaElement && !mediaElement.paused) {
            mediaElement.pause();
        }
        modal.remove();
    });

    const caption = createElementWithStyles('div', {}, { className: 'caption media-caption' }, `${mediaType === 'video' ? 'ビデオ' : '画像'} ${mediaNumber}`);

    const tagBtn = createButton('タグ付け', {}, (e) => {
        e.stopPropagation();
        openTagModal(mediaNumber);
    }, { className: 'media-tag-btn' });

    modal.appendChild(mediaElement);
    modal.appendChild(caption);
    modal.appendChild(tagBtn);

    modal.addEventListener('click', () => {
        if (mediaType === 'video' && mediaElement && !mediaElement.paused) {
            mediaElement.pause();
        }
        modal.remove();
    });

    mediaElement.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

function openTagModal(mediaIndex) {
    const tagModal = createModal('tagModalCustom');
    tagModal.classList.add('display-flex');
    tagModal.dataset.mediaIndex = mediaIndex;
    
    const modalContent = createElementWithStyles('div', {}, { className: 'modal-content tag-modal-content' });
    
    const closeBtn = createCloseButton(modalContent, () => {
        tagModal.classList.add('display-none');
        tagModal.classList.remove('display-flex');
    });
    closeBtn.classList.add('tag-modal-close');
    
    const title = createElementWithStyles('h2', {}, { className: 'tag-modal-title' }, '画像/動画にタグ付け');
    
    const description = createElementWithStyles('p', {}, { className: 'tag-modal-description' }, 'タグをカンマで区切って入力してください（例：友達、誕生日）');
    
    const tagInput = createElementWithStyles('input', {}, {
        type: 'text',
        id: 'tagInputCustom',
        placeholder: 'タグを入力...',
        className: 'tag-input'
    });
    
    const submitBtn = createButton('タグを保存', {}, async () => {
        const tagsText = tagInput.value.trim();
        await saveTags(mediaIndex, tagsText);
        tagModal.classList.add('display-none');
        tagModal.classList.remove('display-flex');
        tagInput.value = '';
    }, { className: 'tag-submit-btn' });
    
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(title);
    modalContent.appendChild(description);
    modalContent.appendChild(tagInput);
    modalContent.appendChild(submitBtn);
    tagModal.appendChild(modalContent);
    
    getMediaTags(mediaIndex).then(tags => {
        if (tags && tags.length > 0) {
            tagInput.value = tags.join(', ');
        } else {
            tagInput.value = '';
        }
    }).catch(error => {
        handleError(error, '現在のタグ取得エラー');
        tagInput.value = '';
    });
    
    setTimeout(() => tagInput.focus(), 100);
}

async function searchMediaByTag(query) {
    try {
        if (!checkSupabaseInitialized()) {
            return;
        }
        
        const photoGallery = document.getElementById('photoGallery');
        const mediaItems = photoGallery.querySelectorAll('.photo-item');
        const searchTerm = query.toLowerCase().trim();
        
        if (searchTerm === '') {
            mediaItems.forEach(item => {
                item.classList.remove('search-hidden');
                item.classList.add('search-visible');
            });
            return;
        }
        
        const { data: tagData, error } = await supabase
            .from('media_tags')
            .select('*');
            
        if (error) throw error;
        
        const tagsMap = {};
        if (tagData) {
            tagData.forEach(item => {
                tagsMap[item.media_path] = item.tags;
            });
        }
        
        mediaItems.forEach(item => {
            const mediaIndex = item.dataset.index;
            const tags = tagsMap[mediaIndex] || [];
            const matches = tags.some(tag => tag.toLowerCase().includes(searchTerm));
            if (matches) {
                item.classList.remove('search-hidden');
                item.classList.add('search-visible');
            } else {
                item.classList.remove('search-visible');
                item.classList.add('search-hidden');
            }
        });
    } catch (error) {
        handleError(error, 'タグ検索エラー', true);
        
        const photoGallery = document.getElementById('photoGallery');
        const mediaItems = photoGallery.querySelectorAll('.photo-item');
        mediaItems.forEach(item => {
            item.classList.remove('search-hidden');
            item.classList.add('search-visible');
        });
    }
}

async function saveTags(mediaIndex, tagsInput) {
    const result = await saveMediaTags(mediaIndex, tagsInput);
    
    if (result) {
        const photoItem = document.querySelector(`.photo-item[data-index="${mediaIndex}"]`);
        if (photoItem) {
            await displayTags(photoItem, mediaIndex);
        }
    }
}

async function uploadMediaFile(file, fileName, statusElement) {
    try {
        if (!checkSupabaseInitialized()) {
            throw new Error("Supabaseに接続できません");
        }

        statusElement.textContent = `アップロード中: ${file.name}`;
        
        const maxSize = 10 * 1024 * 1024; 
        if (file.size > maxSize) {
            throw new Error(`ファイルサイズが大きすぎます (${(file.size/1024/1024).toFixed(2)}MB)。上限は${maxSize/1024/1024}MBです。`);
        }
        
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
        if (!validTypes.includes(file.type)) {
            throw new Error(`サポートされていないファイル形式です。JPEG、PNG、GIF、WebP、MP4、WebM、QuickTimeのみサポートしています。`);
        }
        
        const { data, error } = await supabase.storage
            .from(AlbumConfig.mediaBucket)
            .upload(fileName, file);
            
        if (error) throw error;
        
        return true;
    } catch (error) {
        handleError(error, `ファイル${fileName}のアップロードエラー`, true);
        return false;
    }
}

function createUploadStatusNotification() {
    const uploadId = `upload_${Date.now()}`;
    NotificationManager.create(uploadId, 'info', {
        position: 'top-center',
        autoHide: false
    });
    return uploadId;
}

function updateUploadStatus(uploadId, message, type = 'progress') {
    if (type === 'success') {
        NotificationManager.remove(uploadId);
        const successId = `${uploadId}_success`;
        NotificationManager.create(successId, 'success', {
            position: 'top-center',
            duration: AlbumConfig.defaultSuccessTimeout,
            autoHide: true
        });
        NotificationManager.update(successId, message);
    } else if (type === 'error') {
        NotificationManager.remove(uploadId);
        const errorId = `${uploadId}_error`;
        NotificationManager.create(errorId, 'error', {
            position: 'top-center',
            duration: AlbumConfig.defaultErrorTimeout,
            autoHide: true
        });
        NotificationManager.update(errorId, message);
    } else {
        NotificationManager.update(uploadId, message);
    }
}

async function handleFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const uploadId = createUploadStatusNotification();
    updateUploadStatus(uploadId, `アップロードの準備中... ${files.length}ファイル`);
    
    try {
        if (!checkSupabaseInitialized()) {
            throw new Error("Supabaseに接続できません");
        }
        
        let successCount = 0;
        let failedCount = 0;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = `upload_${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            
            updateUploadStatus(uploadId, `アップロード中 (${i+1}/${files.length}): ${file.name}`);
            
            const success = await uploadMediaFile(file, fileName, uploadId);
            
            if (success) {
                successCount++;
            } else {
                failedCount++;
            }
        }
        
        let message = `${successCount}ファイルのアップロードが完了したよ！`;
        if (failedCount > 0) {
            message += ` (${failedCount}ファイルは失敗したよ)`;
        }
        
        updateUploadStatus(uploadId, message, 'success');
        
        invalidateCache();
        loadAlbumMedia(true);
    } catch (error) {
        updateUploadStatus(uploadId, `エラー: ${error.message || 'ファイルをアップロードできないよ'}`, 'error');
    }
}

function addUploadButton(gallery) {
    const uploadContainer = createElementWithStyles('div', {}, {
        className: 'photo-item upload-item'
    });
    
    const mediaPlaceholder = createElementWithStyles('div', {}, {
        className: 'photo-item-media upload-placeholder'
    });
    
    const uploadIcon = createElementWithStyles('div', {}, { className: 'upload-icon' });
    uploadIcon.innerHTML = '<img src="assets/icon/upload.png" alt="Upload Icon">';
    
    const uploadText = createElementWithStyles('div', {}, { className: 'upload-text' }, 'アップロード');
    
    const fileInput = createElementWithStyles('input', {}, {
        type: 'file',
        id: 'uploadMediaFile',
        name: 'uploadMediaFile',
        accept: 'image/*,video/*',
        multiple: true,
        className: 'upload-file-input'
    });
    
    mediaPlaceholder.appendChild(uploadIcon);
    mediaPlaceholder.appendChild(uploadText);
    uploadContainer.appendChild(mediaPlaceholder);
    uploadContainer.appendChild(fileInput);
    
    uploadContainer.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handleFileUpload);
    
    gallery.appendChild(uploadContainer);
}

/**
 * @param {string} fileName 
 * @returns {string} 
 */
function getMediaPath(fileName) {
    return `${AlbumConfig.supabaseStorageUrl}${fileName}`;
}

/**
 * @param {Error} error 
 * @param {string} message 
 * @param {boolean} showToUser 
 */
function handleError(error, message, showToUser = false) {
    console.error(`${message}:`, error);
    
    if (showToUser) {
        const errorMessage = `エラー: ${error.message || message}`;
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        NotificationManager.create(errorId, 'error', {
            position: 'top-center',
            duration: AlbumConfig.defaultErrorTimeout,
            autoHide: true
        });
        NotificationManager.update(errorId, errorMessage);
    }
    
    return error; 
}

/**
 * @param {string} type 
 * @param {object} styles 
 * @param {object} attributes 
 * @param {string} textContent 
 * @param {Function} clickHandler 
 * @returns {HTMLElement} 
 */
function createElementWithStyles(type, styles = {}, attributes = {}, textContent = '', clickHandler = null) {
    const element = document.createElement(type);
    
    Object.entries(styles).forEach(([property, value]) => {
        element.style[property] = value;
    });
    
    Object.entries(attributes).forEach(([attr, value]) => {
        if (attr === 'className' || attr === 'class') {
            element.className = value;
        } else {
            element.setAttribute(attr, value);
        }
    });
    
    if (textContent) {
        element.textContent = textContent;
    }
    
    if (clickHandler) {
        element.addEventListener('click', clickHandler);
    }
    
    return element;
}

function initPhotoAlbum() {
    initTags();
    
    setupCloseButton();
    
    setupEventListeners();
    
    window.addEventListener('beforeunload', cleanupResources);
}

function setupCloseButton() {
    const memoryWall = document.getElementById('memoryWall');
    if (memoryWall && !document.getElementById('closeAlbum')) {
        const currentLang = localStorage.getItem('language') || 'ja';
        const t = translations && translations[currentLang] ? translations[currentLang] : translations['ja'];
        const closeAlbumBtn = createButton(t.closeAlbum || 'アルバムを閉じる', {}, hidePhotoAlbum, {
            id: 'closeAlbum',
            className: 'close-album-btn'
        });
        
        memoryWall.appendChild(closeAlbumBtn);
    }
}

function setupEventListeners() {
    const openAlbumButton = document.getElementById('openAlbum');
    if (openAlbumButton) {
        openAlbumButton.addEventListener('click', showPhotoAlbum);
    }
    
    const slideshowBtn = document.getElementById('slideshowBtn');
    if (slideshowBtn) {
        slideshowBtn.addEventListener('click', () => toggleSlideshowMode(true));
    }
    
    const closeSlideBtn = document.getElementById('closeSlideshow');
    if (closeSlideBtn) {
        closeSlideBtn.addEventListener('click', () => toggleSlideshowMode(false));
    }
    
    const searchInput = document.getElementById('searchTags');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            searchMediaByTag(e.target.value);
        }, 300));
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showPhotoAlbum() {
    const memoryWall = document.getElementById('memoryWall');
    if (!memoryWall) {
        console.error('メモリーウォールが見つからないよ');
        return;
    }
    
    memoryWall.classList.add('display-block');
    memoryWall.classList.remove('display-none');
    memoryWall.classList.add('fade-in');
    
    requestAnimationFrame(() => {
        memoryWall.classList.add('active');
    });
    
    if (!AlbumState.mediaFilesLoaded) {
        loadAlbumMedia();
    }
}

function hidePhotoAlbum() {
    const memoryWall = document.getElementById('memoryWall');
    if (memoryWall) {
        memoryWall.classList.add('fade-out', 'active');
        setTimeout(() => {
            memoryWall.classList.add('display-none');
            memoryWall.classList.remove('display-block');
            memoryWall.classList.remove('fade-in', 'fade-out', 'active');
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('photoGallery')) {
        initPhotoAlbum();
    }
    
    const albumVersionKey = 'albumVersion';
    const currentVersion = '1.2.0';
    const storedVersion = localStorage.getItem(albumVersionKey);
    
    if (storedVersion !== currentVersion) {
        invalidateCache();
        localStorage.setItem(albumVersionKey, currentVersion);
    }
});
