
let blowProgress = 0;
let audioContext, analyser, microphone, javascriptNode;

function setupAudioAnalysis() {
    if (typeof blowOutCandle === 'function') {
        blowOutCandle();
    }
}

function updateBlowProgress() {
    // ブロー進捗の表示を更新
    const progressContainer = document.getElementById('progressContainer');
    if (progressContainer && blowProgress > 0) {
        progressContainer.classList.remove('hidden');
        const progressBar = progressContainer.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${blowProgress}%`;
        }
    }
}

function disconnectAudio() {
    // オーディオリソースのクリーンアップ
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(e => console.log('AudioContext close error:', e));
    }
    if (microphone) {
        microphone.disconnect();
        microphone = null;
    }
    if (javascriptNode) {
        javascriptNode.disconnect();
        javascriptNode = null;
    }
}

function blowOutCandle() {
    const flames = document.querySelectorAll('.flame');
    if (flames && flames.length > 0) {

        flames.forEach((flame, index) => {
            setTimeout(() => {
                flame.classList.add('flame-extinguish');
                
                createSmokeEffect2D(flame);
            }, index * 200);
        });
    }


    if (window.cakeSceneElements) {
        const { candleGroup } = window.cakeSceneElements;
        

        candleGroup.children.forEach((child, index) => {
            if (child.name && child.name.startsWith('flame_')) {

                setTimeout(() => {
                    child.visible = false;
                }, index * 300);
            }
        });
    }


    const blowButton = document.getElementById('blowButton');
    if (blowButton) {
        blowButton.classList.add('blow-button-hide');
        
        setTimeout(() => {
            blowButton.classList.add('blow-button-hidden');
        }, 500);
    }
    

    const audioFeedback = document.getElementById('audioFeedback');
    if (audioFeedback) {
        audioFeedback.classList.add('hidden');
    }
    
    const progressContainer = document.getElementById('progressContainer');
    if (progressContainer) {
        progressContainer.classList.add('hidden');
    }


    playSound();
    createMoreConfetti();


    const message = document.getElementById('birthdayMessage');
    if (message) {

        message.classList.add('fade-out');
        
        setTimeout(() => {
            message.innerHTML = 'お誕生日おめでとうございます！<br>ロウソクを消すことができました！<br>あなたの願いがすべて叶いますように！';
            message.classList.add('celebrating');
            message.classList.remove('fade-out');
            message.classList.add('fade-in');
        }, 500);
    }
    

    const cake2D = document.querySelector('.cake-2d');
    if (cake2D) {
        animateCake2D(cake2D);
    }
}

function animateCake2D(cakeElement) {
    cakeElement.style.animation = 'none';
    
    const resetAnimation = () => {
        cakeElement.style.animation = 'shake 0.5s ease';
    };
    
    const startFloating = () => {
        cakeElement.style.animation = 'float 3s ease-in-out infinite';
    };
    
    setTimeout(resetAnimation, 10);
    setTimeout(startFloating, 510);
}

function createSmokeEffect2D(flameElement) {
    const parentCandle = flameElement.parentElement;
    const rect = flameElement.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
        const smoke = document.createElement('div');
        smoke.className = 'smoke-particle';
        smoke.style.position = 'absolute';
        smoke.style.bottom = '100%';
        smoke.style.left = '50%';
        smoke.style.transform = 'translateX(-50%)';
        smoke.style.animationDelay = (i * 0.2) + 's';
        
        parentCandle.appendChild(smoke);
        

        setTimeout(() => {
            smoke.remove();
        }, 2000 + (i * 200));
    }
}

document.addEventListener('DOMContentLoaded', function() {
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

function createSmokeEffect(x, y, z) {
    if (!window.cakeSceneElements) return;
    
    const { scene } = window.cakeSceneElements;
    
    const smokeParticles = [];
    const numParticles = 5;
    

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
            life: 2.0, 
            startTime: Date.now()
        };
        
        scene.add(smokeParticle);
        smokeParticles.push(smokeParticle);
    }
    

    function updateSmokeParticles() {
        const now = Date.now();
        let allDone = true;
        
        smokeParticles.forEach((particle, i) => {
            const elapsed = (now - particle.userData.startTime) / 1000;
            
            if (elapsed < particle.userData.life) {
                allDone = false;
                

                particle.position.x += particle.userData.velocity.x;
                particle.position.y += particle.userData.velocity.y;
                particle.position.z += particle.userData.velocity.z;
                

                const scale = 1 + elapsed * 0.5;
                particle.scale.set(scale, scale, scale);
                

                particle.material.opacity = 0.7 * (1 - (elapsed / particle.userData.life));
                

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

function shakeObject(object) {
    if (!object) return;
    
    const originalPosition = object.position.clone();
    const originalRotation = object.rotation.clone();
    const shakeDuration = 1000; 
    const startTime = Date.now();
    
    function animateShake() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / shakeDuration;
        
        if (progress < 1) {

            const intensity = 0.1 * (1 - progress);
            

            object.position.x = originalPosition.x + (Math.random() - 0.5) * intensity;
            object.position.z = originalPosition.z + (Math.random() - 0.5) * intensity;
            object.rotation.x = originalRotation.x + (Math.random() - 0.5) * intensity * 0.05;
            object.rotation.z = originalRotation.z + (Math.random() - 0.5) * intensity * 0.05;
            
            requestAnimationFrame(animateShake);
        } else {

            object.position.copy(originalPosition);
            object.rotation.copy(originalRotation);
        }
    }
    
    animateShake();
}

function createConfetti() {
    const container = document.querySelector('.container');

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-particle';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = getRandomColor();

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

            const animationDuration = Math.random() * 3 + 2;
            confetti.style.animationDuration = animationDuration + 's';

            document.body.appendChild(confetti);

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

const AudioManager = {
    instances: [],
    
    createAudio(src, autoCleanup = true) {
        const audio = new Audio(src);
        this.instances.push(audio);
        
        if (autoCleanup) {
            audio.addEventListener('ended', () => this.removeAudio(audio));
        }
        
        return audio;
    },
    
    removeAudio(audio) {
        const index = this.instances.indexOf(audio);
        if (index > -1) {
            this.instances.splice(index, 1);
        }
    },
    
    cleanup() {
        this.instances.forEach(audio => {
            audio.pause();
            audio.src = '';
        });
        this.instances = [];
    }
};

function playSound() {
    try {
        const noteSrc = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18A';

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const note = AudioManager.createAudio(noteSrc);
                note.play().catch(e => console.log("自動再生が防止されました: ", e));
            }, i * 200);
        }
    } catch (e) {
        console.log("音声再生エラー: ", e);
    }
}



window.useLocalMedia = false;
window.mediaAlreadyLoaded = false;

function loadSamplePhotos() {
    console.log("アルバム機能はalbum.jsに移動されました");
    if (typeof initPhotoAlbum === 'function') {
        initPhotoAlbum();
    }
}

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

function startBirthdayQuiz() {
    let quizModal = document.getElementById('birthdayQuizModal');
    if (!quizModal) {
        quizModal = document.createElement('div');
        quizModal.id = 'birthdayQuizModal';
        quizModal.className = 'features-modal hidden';

        const quizContainer = document.createElement('div');
        quizContainer.className = 'features-modal-container quiz-modal-container';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'features-modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            quizModal.classList.add('hidden');
        });

        const title = document.createElement('h2');
        title.textContent = '誕生日の謎';
        title.className = 'features-modal-title';

        const quizArea = document.createElement('div');
        quizArea.id = 'quizArea';
        quizArea.className = 'quiz-area';

        const restartBtn = document.createElement('button');
        restartBtn.textContent = '再挑戦';
        restartBtn.className = 'quiz-restart-btn';
        restartBtn.addEventListener('click', () => {
            initBirthdayQuiz();
        });

        quizContainer.appendChild(closeBtn);
        quizContainer.appendChild(title);
        quizContainer.appendChild(quizArea);
        quizContainer.appendChild(restartBtn);
        quizModal.appendChild(quizContainer);
        document.body.appendChild(quizModal);
    }
    quizModal.classList.remove('hidden');
    initBirthdayQuiz();
}

function initBirthdayQuiz() {
    const quizArea = document.getElementById('quizArea');
    quizArea.innerHTML = '';
    

    if (typeof birthdays === 'undefined' || birthdays.length === 0) {
        const noDataMsg = document.createElement('p');
        noDataMsg.textContent = '誕生日データがないため、クイズを作成できません。';
        noDataMsg.className = 'quiz-no-data';
        quizArea.appendChild(noDataMsg);
        return;
    }
    

    let questions = [];
    birthdays.forEach(person => {
        questions.push({
            question: `${person.name}の誕生日はいつですか？`,
            correctAnswer: `${person.day}/${person.month}`,
            options: [
                `${person.day}/${person.month}`,
                `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}`,
                `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}`,
                `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}`
            ]
        });
    });
    
    questions = questions.sort(() => Math.random() - 0.5).slice(0, 5);
    
    let currentQuestionIndex = 0;
    let score = 0;
    
function displayQuestion() {
        quizArea.innerHTML = '';
        if (currentQuestionIndex >= questions.length) {
            const resultMsg = document.createElement('p');
            resultMsg.textContent = `クイズ完了！あなたのスコア: ${score}/${questions.length}`;
            resultMsg.className = 'quiz-result';
            quizArea.appendChild(resultMsg);
            return;
        }
        
        const question = questions[currentQuestionIndex];
        const questionText = document.createElement('p');
        questionText.textContent = `${currentQuestionIndex + 1}. ${question.question}`;
        questionText.className = 'quiz-question';
        quizArea.appendChild(questionText);
        

        const shuffledOptions = question.options.sort(() => Math.random() - 0.5);
        shuffledOptions.forEach(option => {
            const optionBtn = document.createElement('button');
            optionBtn.textContent = option;
            optionBtn.className = 'quiz-option-btn';
            optionBtn.addEventListener('click', () => {
                checkAnswer(option, question.correctAnswer);
            });
            quizArea.appendChild(optionBtn);
        });
    }
    

function checkAnswer(selected, correct) {
        if (selected === correct) {
            score++;
            alert('正解！');
        } else {
            alert(`不正解！正解は: ${correct}`);
        }
        currentQuestionIndex++;
        displayQuestion();
    }
    

    displayQuestion();
}

function openBirthdayCalendar() {
    let calendarModal = document.getElementById('birthdayCalendarModal');
    if (!calendarModal) {
        calendarModal = document.createElement('div');
        calendarModal.id = 'birthdayCalendarModal';
        calendarModal.className = 'features-modal hidden';

        const calendarContainer = document.createElement('div');
        calendarContainer.className = 'features-modal-container calendar-modal-container';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'features-modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            calendarModal.classList.add('hidden');
        });

        const title = document.createElement('h2');
        title.textContent = '誕生日カレンダー';
        title.className = 'features-modal-title';

        const calendarView = document.createElement('div');
        calendarView.id = 'calendarView';
        calendarView.className = 'calendar-view';

        calendarContainer.appendChild(closeBtn);
        calendarContainer.appendChild(title);
        calendarContainer.appendChild(calendarView);
        calendarModal.appendChild(calendarContainer);
        document.body.appendChild(calendarModal);
    }
    calendarModal.classList.remove('hidden');
    displayBirthdayCalendar();
}


function displayBirthdayCalendar() {
    const calendarView = document.getElementById('calendarView');
    calendarView.innerHTML = '';
    

    if (typeof birthdays === 'undefined') {
        const noDataMsg = document.createElement('p');
        noDataMsg.textContent = '表示する誕生日データがありません。';
        noDataMsg.className = 'calendar-no-data';
        calendarView.appendChild(noDataMsg);
        return;
    }
    

    const sortedBirthdays = birthdays.sort((a, b) => {
        if (a.month === b.month) {
            return a.day - b.day;
        }
        return a.month - b.month;
    });
    

    const list = document.createElement('ul');
    list.className = 'calendar-list';
    
    sortedBirthdays.forEach(person => {
        const listItem = document.createElement('li');
        listItem.className = 'calendar-list-item';
        listItem.textContent = `${person.name} - ${person.month}月${person.day}日`;
        list.appendChild(listItem);
    });
    
    calendarView.appendChild(list);
}

function startMemoryGame() {
    let gameModal = document.getElementById('memoryGameModal');
    if (!gameModal) {
        gameModal = document.createElement('div');
        gameModal.id = 'memoryGameModal';
        gameModal.className = 'features-modal hidden';

        const gameContainer = document.createElement('div');
        gameContainer.className = 'features-modal-container memory-game-container';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'features-modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            gameModal.classList.add('hidden');
        });

        const title = document.createElement('h2');
        title.textContent = '記憶ゲーム';
        title.className = 'features-modal-title';

        const gameGrid = document.createElement('div');
        gameGrid.id = 'memoryGameGrid';
        gameGrid.className = 'memory-game-grid';

        const restartBtn = document.createElement('button');
        restartBtn.textContent = '再挑戦';
        restartBtn.className = 'memory-restart-btn';
        restartBtn.addEventListener('click', () => {
            initMemoryGame();
        });

        gameContainer.appendChild(closeBtn);
        gameContainer.appendChild(title);
        gameContainer.appendChild(gameGrid);
        gameContainer.appendChild(restartBtn);
        gameModal.appendChild(gameContainer);
        document.body.appendChild(gameModal);
    }
    gameModal.classList.remove('hidden');
    initMemoryGame();
}

function initMemoryGame() {
    const grid = document.getElementById('memoryGameGrid');
    grid.innerHTML = '';
    

    const symbols = ['🎂', '🎉', '🎁', '🎈', '🧁', '🍰', '🥳', '🎊', '🎂', '🎉', '🎁', '🎈', '🧁', '🍰', '🥳', '🎊'];
    let flippedCards = [];
    let matchedPairs = 0;
    

    for (let i = symbols.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
    }
    

    symbols.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.symbol = symbol;
        
        card.addEventListener('click', () => {
            if (flippedCards.length < 2 && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
                card.textContent = symbol;
                card.classList.add('flipped');
                flippedCards.push(card);
                
                if (flippedCards.length === 2) {
                    setTimeout(() => {
                        matchedPairs = checkMemoryMatch(flippedCards, symbols.length, matchedPairs);
                    }, 1000);
                }
            }
        });
        
        grid.appendChild(card);
    });
}

function checkMemoryMatch(flippedCards, totalSymbols, currentMatchedPairs) {
                        const [card1, card2] = flippedCards;
    let newMatchedPairs = currentMatchedPairs;
    
                        if (card1.dataset.symbol === card2.dataset.symbol) {
        newMatchedPairs = handleMatchedCards(card1, card2, totalSymbols, currentMatchedPairs);
    } else {
        handleUnmatchedCards(card1, card2);
    }
    
    flippedCards.length = 0;
    return newMatchedPairs;
}

function handleMatchedCards(card1, card2, totalSymbols, currentMatchedPairs) {
                            card1.classList.add('matched');
                            card2.classList.add('matched');
    const newMatchedPairs = currentMatchedPairs + 1;
    
    if (newMatchedPairs === totalSymbols / 2) {
                                setTimeout(() => {
                                    alert('おめでとうございます！すべてのペアを見つけました！');
                                }, 300);
                            }
    
    return newMatchedPairs;
}

function handleUnmatchedCards(card1, card2) {
                            card1.textContent = '';
                            card1.classList.remove('flipped');
                            card2.textContent = '';
                            card2.classList.remove('flipped');
                        }

let puzzleGameImages = [];
let isPuzzleImagesLoaded = false;

async function loadPuzzleImages() {
    if (isPuzzleImagesLoaded && puzzleGameImages.length > 0) {
        return puzzleGameImages;
    }
    
    try {
        console.log('パズルゲーム用の画像を読み込み中...');
        

        if (window.mediaFilesLoaded && window.mediaFiles && window.mediaFiles.length > 0) {

            const imageFiles = window.mediaFiles.filter(file => 
                file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            );
            
            if (imageFiles.length > 0) {
                console.log(`メディアから${imageFiles.length}枚の画像を発見しました`);
                puzzleGameImages = imageFiles;
                isPuzzleImagesLoaded = true;
                return imageFiles;
            }
        }
        
        console.log('Supabaseから画像を読み込み中...');
        

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

                const imageFiles = data
                    .filter(file => file.name !== '.emptyFolderPlaceholder')
                    .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
                    .map(file => file.name);
                
                if (imageFiles.length > 0) {
                    console.log(`Supabaseから${imageFiles.length}枚の画像を発見しました`);
                    puzzleGameImages = imageFiles;
                    isPuzzleImagesLoaded = true;
                    window.useLocalMedia = false;
                    return imageFiles;
                }
            }
        }
        
        console.log('ローカル画像リストを使用します');
        const localImages = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', 
                            '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg'];
        puzzleGameImages = localImages;
        isPuzzleImagesLoaded = true;
        window.useLocalMedia = true;
        return localImages;
    } catch (error) {
        console.error('パズルゲーム用画像読み込みエラー:', error);
        const defaultImages = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'];
        puzzleGameImages = defaultImages;
        isPuzzleImagesLoaded = true;
        window.useLocalMedia = true;
        return defaultImages;
    }
}

function startPuzzleGame() {
    let puzzleModal = document.getElementById('puzzleGameModal');
    if (!puzzleModal) {
        puzzleModal = document.createElement('div');
        puzzleModal.id = 'puzzleGameModal';
        
        const puzzleContainer = document.createElement('div');
        puzzleContainer.className = 'puzzle-container';
        
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'features-modal-close';
        closeBtn.addEventListener('click', () => {
            puzzleModal.classList.remove('show');
        });
        
        const title = document.createElement('h2');
        title.textContent = 'パズルゲーム';
        title.className = 'puzzle-title';
        
        const puzzleArea = document.createElement('div');
        puzzleArea.id = 'puzzleArea';
        puzzleArea.className = 'puzzle-area';
        
        const piecesContainer = document.createElement('div');
        piecesContainer.id = 'piecesContainer';
        piecesContainer.className = 'puzzle-pieces-container';
        
        const imageInfo = document.createElement('div');
        imageInfo.id = 'puzzleImageInfo';
        imageInfo.className = 'puzzle-image-info';
        
        const restartBtn = document.createElement('button');
        restartBtn.textContent = '他の画像に変更';
        restartBtn.className = 'puzzle-restart-btn';
        restartBtn.addEventListener('click', async () => {
            await loadPuzzleImages();
            initPuzzleGame();
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
    
    puzzleModal.classList.add('show');
    

    loadPuzzleImages().then(() => {
        initPuzzleGame();
    }).catch(error => {
        console.error('画像読み込みエラー:', error);
        initPuzzleGame();
    });
}

function initPuzzleGame() {
    const puzzleArea = document.getElementById('puzzleArea');
    const piecesContainer = document.getElementById('piecesContainer');
    const imageInfo = document.getElementById('puzzleImageInfo');
    
    if (!puzzleArea || !piecesContainer) return;
    
    puzzleArea.innerHTML = '';
    piecesContainer.innerHTML = '';
    
    let imageFile = '1.jpg';
    
    if (puzzleGameImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * puzzleGameImages.length);
        imageFile = puzzleGameImages[randomIndex];
    }
    

    let imageUrl;
    if (window.useLocalMedia) {
        imageUrl = `memory/${imageFile}`;
    } else {
        const baseUrl = `${SUPABASE_URL}/storage/v1/object/public/media/`;
        imageUrl = `${baseUrl}${imageFile}`;
    }
    

    if (imageInfo) {
        imageInfo.textContent = `使用中の画像: ${imageFile}`;
    }
    
    console.log('パズルゲーム使用画像:', imageUrl);
    
    const gridCols = 4;
    const gridRows = 2;
    const totalPieces = gridCols * gridRows;

    const containerWidth = Math.min(window.innerWidth * 0.9, 600);
    const containerHeight = Math.min(window.innerHeight * 0.4, containerWidth * 0.5); 
    puzzleArea.style.width = containerWidth + 'px';
    puzzleArea.style.height = containerHeight + 'px';
    puzzleArea.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
    let pieceWidth = containerWidth / gridCols;
    let pieceHeight = containerHeight / gridRows;
    let pieces = [];
    let placedPieces = Array(totalPieces).fill(false);
    

    const testImage = new Image();
    testImage.onload = () => {

        createPuzzleGame(imageUrl);
    };
    testImage.onerror = () => {
        console.error('画像を読み込めません:', imageUrl);
        imageUrl = 'memory/1.jpg';
        createPuzzleGame(imageUrl);
    };
    testImage.src = imageUrl;
    
    function createPuzzleGame(imgUrl) {
        for (let i = 0; i < totalPieces; i++) {
            const slot = document.createElement('div');
            slot.className = 'puzzle-slot';
            slot.style.width = pieceWidth + 'px';
            slot.style.height = pieceHeight + 'px';
            slot.dataset.index = i;
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('drag-over');
            });
            slot.addEventListener('dragleave', () => {
                slot.classList.remove('drag-over');
            });
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
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
        

        for (let y = 0; y < gridRows; y++) {
            for (let x = 0; x < gridCols; x++) {
                const index = y * gridCols + x;
                const piece = document.createElement('div');
                piece.id = 'piece-' + index;
                piece.draggable = true;
                piece.className = 'puzzle-piece';
                piece.style.width = pieceWidth + 'px';
                piece.style.height = pieceHeight + 'px';
                piece.style.backgroundImage = `url(${imgUrl})`;
                piece.style.backgroundSize = `${containerWidth}px ${containerHeight}px`;
                piece.style.backgroundPosition = `-${x * pieceWidth}px -${y * pieceHeight}px`;
                piece.dataset.correctIndex = index;
                piece.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text', piece.id);
                    piece.classList.add('dragging');
                    if (piece.dataset.currentIndex !== undefined) {
                        placedPieces[piece.dataset.currentIndex] = false;
                    }
                });
                piece.addEventListener('dragend', () => {
                    piece.classList.remove('dragging');
                });
                pieces.push(piece);
            }
        }
        

        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }
        

        pieces.forEach(piece => {
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
            alert('おめでとうございます！パズルを完成しました！');
        }, 300);
    }
}

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

function openECardGenerator() {
    let eCardModal = document.getElementById('eCardModal');
    if (!eCardModal) {
        eCardModal = document.createElement('div');
        eCardModal.id = 'eCardModal';

        const eCardContainer = document.createElement('div');
        eCardContainer.className = 'ecard-container';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'modal-close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            eCardModal.classList.remove('show');
        });

        const title = document.createElement('h2');
        title.textContent = 'お祝いカードを作成';
        title.className = 'ecard-title';

        const form = document.createElement('div');
        form.className = 'ecard-form';

        const messageInput = document.createElement('textarea');
        messageInput.id = 'eCardMessage';
        messageInput.placeholder = 'お祝いのメッセージを入力してください...';
        messageInput.className = 'ecard-message-input';

        const imageSelect = document.createElement('select');
        imageSelect.id = 'eCardImage';
        imageSelect.className = 'ecard-message-input';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'カードの背景を選択';
        imageSelect.appendChild(defaultOption);

        for (let i = 1; i <= 5; i++) {
            const option = document.createElement('option');
            option.value = `memory/${i}.jpg`;
            option.textContent = `背景 ${i}`;
            imageSelect.appendChild(option);
        }

        const generateBtn = document.createElement('button');
        generateBtn.textContent = 'カードを作成してシェア';
        generateBtn.className = 'ecard-btn';
        generateBtn.addEventListener('click', generateECard);

        form.appendChild(messageInput);
        form.appendChild(imageSelect);
        form.appendChild(generateBtn);

        eCardContainer.appendChild(closeBtn);
        eCardContainer.appendChild(title);
        eCardContainer.appendChild(form);
        eCardModal.appendChild(eCardContainer);
        document.body.appendChild(eCardModal);
    }
    eCardModal.classList.add('show');
}

function generateECard() {
    const message = document.getElementById('eCardMessage').value.trim();
    const imageUrl = document.getElementById('eCardImage').value;
    
    if (!message || !imageUrl) {
        alert('お祝いメッセージを入力し、背景を選択してください！');
        return;
    }
    

    const encodedMessage = encodeURIComponent(message);
    const encodedImage = encodeURIComponent(imageUrl);
    const eCardLink = `${window.location.origin}/ecard?message=${encodedMessage}&image=${encodedImage}`;
    

    const modalContent = document.querySelector('#eCardModal .ecard-container');
    const shareSection = document.createElement('div');
    shareSection.className = 'ecard-share-section';
    shareSection.innerHTML = `
        <p class="ecard-share-text">お祝いカードをシェアするリンクをコピー:</p>
        <input type="text" value="${eCardLink}" readonly class="ecard-link-input">
        <button onclick="copyECardLink(this)" class="ecard-btn secondary">リンクをコピー</button>
    `;
    modalContent.appendChild(shareSection);
    
    const preview = document.createElement('div');
    preview.className = 'ecard-preview';
    preview.style.backgroundImage = `url(${imageUrl})`;
    preview.textContent = message;
    modalContent.appendChild(preview);
    
    console.log(`Generated eCard with message: ${message} and image: ${imageUrl}`);
}

function copyECardLink(button) {
    const input = button.previousElementSibling;
    input.select();
    document.execCommand('copy');
    button.textContent = '✓ コピー完了';
    setTimeout(() => {
        button.textContent = 'リンクをコピー';
    }, 2000);
}

function shareOnSocialMedia(platform) {
    const url = window.location.href;
    const birthdayPerson = localStorage.getItem('currentBirthday') || '大切な人';
    const text = encodeURIComponent(`${birthdayPerson}の誕生日おめでとうございます！`);
    
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        'x-twitter': `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
        instagram: `https://www.instagram.com/`,
        whatsapp: `https://api.whatsapp.com/send?text=${text}%20${encodeURIComponent(url)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`,
        email: `mailto:?subject=${encodeURIComponent('誕生日おめでとう！')}&body=${text}%20${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        setTimeout(() => {
            alert('誕生日の喜びをシェアしていただきありがとうございます！');
        }, 500);
    } else {
        alert('このプラットフォームは現在サポートされていません。');
    }
}

function initMusicPlayer() {
    const playButton = document.getElementById('playMusic');
    const musicPlayer = document.querySelector('.music-player');
    let isPlaying = false;
    let audio = AudioManager.createAudio('assets/audio/happy-birthday.mp3', false);
    let currentTrack = 'assets/audio/happy-birthday.mp3';

    let selectMusicBtn = document.getElementById('selectMusicBtn');
    if (!selectMusicBtn) {
        selectMusicBtn = document.createElement('button');
        selectMusicBtn.id = 'selectMusicBtn';
        const currentLang = localStorage.getItem('language') || 'ja';
        const t = translations && translations[currentLang] ? translations[currentLang] : translations['ja'];
        selectMusicBtn.textContent = t.selectMusic || '🎵 音楽選択';
        selectMusicBtn.className = 'music-select-btn';
        selectMusicBtn.addEventListener('click', openMusicSelectionModal);
        musicPlayer.appendChild(selectMusicBtn);
        
        // 新しいボタンに現在の言語を適用
        const savedLang = localStorage.getItem('language') || 'ja';
        if (typeof updateDynamicButtonsLanguage !== 'undefined') {
            updateDynamicButtonsLanguage(savedLang);
        }
    }

    playButton.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            playButton.textContent = '▶️';
        } else {
            audio.play().catch(e => console.log('音声再生失敗:', e));
            playButton.textContent = '⏸️';
        }
        isPlaying = !isPlaying;
    });

    audio.addEventListener('ended', () => {
        playButton.textContent = '▶️';
        isPlaying = false;
    });

    window.changeMusicTrack = function(trackUrl, trackName) {
        audio.pause();
        playButton.textContent = '▶️';
        isPlaying = false;
        AudioManager.removeAudio(audio);
        audio = AudioManager.createAudio(trackUrl, false);
        currentTrack = trackUrl;
        document.querySelector('.song-title').textContent = trackName || '背景音';
        localStorage.setItem('selectedTrack', trackUrl);
        localStorage.setItem('selectedTrackName', trackName || '背景音');
    };

    const savedTrack = localStorage.getItem('selectedTrack');
    const savedTrackName = localStorage.getItem('selectedTrackName');
    if (savedTrack) {
        AudioManager.removeAudio(audio);
        audio = AudioManager.createAudio(savedTrack, false);
        currentTrack = savedTrack;
        document.querySelector('.song-title').textContent = savedTrackName || '背景音';
    }
}

function openMusicSelectionModal() {
    let musicModal = document.getElementById('musicSelectionModal');
    if (!musicModal) {
        musicModal = document.createElement('div');
        musicModal.id = 'musicSelectionModal';

        const modalContent = document.createElement('div');
        modalContent.className = 'music-modal-content';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'modal-close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            musicModal.classList.remove('show');
        });

        const title = document.createElement('h2');
        title.textContent = '背景音選択';
        title.className = 'music-modal-title';

        const trackList = document.createElement('div');
        trackList.id = 'trackList';
        trackList.className = 'music-track-list';

        const tracks = [
            { url: 'assets/audio/happy-birthday.mp3', name: 'Happy Birthday Song (Default)' },
            { url: 'https://www.bensound.com/bensound-music/bensound-slowmotion.mp3', name: 'Slow Motion' },
            { url: 'https://www.bensound.com/bensound-music/bensound-sunny.mp3', name: 'Sunny' }
        ];

        tracks.forEach(track => {
            const trackItem = document.createElement('div');
            trackItem.className = 'music-track-item';
            trackItem.textContent = track.name;
            trackItem.addEventListener('click', () => {
                window.changeMusicTrack(track.url, track.name);
                musicModal.classList.remove('show');
            });
            trackList.appendChild(trackItem);
        });

        const uploadInput = document.createElement('input');
        uploadInput.type = 'file';
        uploadInput.accept = 'audio/mp3, audio/wav';
        uploadInput.className = 'music-upload-input';
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    window.changeMusicTrack(event.target.result, file.name);
                    musicModal.classList.remove('show');
                };
                reader.readAsDataURL(file);
            }
        });

        const uploadLabel = document.createElement('label');
        uploadLabel.textContent = '背景音をアップロード (MP3/WAV)';
        uploadLabel.className = 'music-upload-label';

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(trackList);
        modalContent.appendChild(uploadLabel);
        modalContent.appendChild(uploadInput);
        musicModal.appendChild(modalContent);
        document.body.appendChild(musicModal);
    }
    musicModal.classList.add('show');
}
function initCustomMessage() {
    const customMessageBtn = document.getElementById('customMessageBtn');
    const customMessageModal = document.getElementById('customMessageModal');
    const closeCustomMessage = document.getElementById('closeCustomMessage');
    const submitCustomMessage = document.getElementById('submitCustomMessage');
    
    customMessageBtn.addEventListener('click', () => {
        customMessageModal.classList.add('show');
    });
    
    closeCustomMessage.addEventListener('click', () => {
        customMessageModal.classList.remove('show');
    });
    
    customMessageModal.addEventListener('click', (e) => {
        if (e.target === customMessageModal) {
            customMessageModal.classList.remove('show');
        }
    });
    
    let senderNameInput = document.getElementById('senderNameInput');
    if (!senderNameInput) {
        senderNameInput = document.createElement('input');
        senderNameInput.id = 'senderNameInput';
        senderNameInput.type = 'text';
        senderNameInput.placeholder = '名前を入力してください...';
        senderNameInput.className = 'custom-message-input';
        const modalContent = customMessageModal.querySelector('.modal-content');
        modalContent.insertBefore(senderNameInput, modalContent.children[2]);
    }

    submitCustomMessage.addEventListener('click', () => {
        const customMessageInput = document.getElementById('customMessageInput');
        const senderNameInput = document.getElementById('senderNameInput');
        const messageText = customMessageInput.value.trim();
        const senderName = senderNameInput.value.trim() || '匿名';
        
        if (messageText) {
            const messageWithSender = `${messageText} - ${senderName}`;
            localStorage.setItem('customBirthdayMessage', messageWithSender);
            displayCustomMessage(messageWithSender);
            customMessageModal.classList.remove('show');
            customMessageInput.value = '';
            senderNameInput.value = '';
        } else {
            alert('メッセージを入力してください!');
        }
    });

    let recordBtn = document.getElementById('recordMessageBtn');
    if (!recordBtn) {
        recordBtn = document.createElement('button');
        recordBtn.id = 'recordMessageBtn';
        recordBtn.textContent = '🎤 語声を録音';
        recordBtn.className = 'record-message-btn';
        recordBtn.addEventListener('click', () => {
            customMessageModal.classList.remove('show');
            openRecordMessageModal();
        });
        const modalContent = customMessageModal.querySelector('.modal-content');
        modalContent.appendChild(recordBtn);
    }

    let videoBtn = document.getElementById('videoMessageBtn');
    if (!videoBtn) {
        videoBtn = document.createElement('button');
        videoBtn.id = 'videoMessageBtn';
        videoBtn.textContent = '🎥 ビデオメッセージ';
        videoBtn.className = 'video-message-btn';
        videoBtn.addEventListener('click', () => {
            customMessageModal.classList.remove('show');
            openVideoMessageModal();
        });
        const modalContent = customMessageModal.querySelector('.modal-content');
        modalContent.appendChild(videoBtn);
    }

    displaySavedAudioMessages();
    displaySavedVideoMessages();
}

function openRecordMessageModal() {
let recordModal = document.getElementById('recordMessageModal');
if (!recordModal) {
    recordModal = document.createElement('div');
    recordModal.id = 'recordMessageModal';
    recordModal.className = 'record-message-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'record-modal-content';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
        recordModal.classList.remove('show');
    });

    const title = document.createElement('h2');
    title.textContent = '';
    title.className = 'record-modal-title';

    const status = document.createElement('p');
    status.id = 'recordStatus';
    status.textContent = '';
    status.className = 'record-status';

    const senderNameInputRecord = document.createElement('input');
    senderNameInputRecord.id = 'senderNameInputRecord';
    senderNameInputRecord.type = 'text';
    senderNameInputRecord.placeholder = '';
    senderNameInputRecord.className = 'custom-message-input';

    const recordControl = document.createElement('button');
    recordControl.id = 'recordControl';
    recordControl.textContent = '';
    recordControl.className = 'record-btn';
    recordControl.addEventListener('click', toggleRecording);

        const saveBtn = document.createElement('button');
        saveBtn.id = 'saveRecording';
        saveBtn.textContent = '保存する';
        saveBtn.className = 'record-btn';
        saveBtn.classList.add('hidden');
        saveBtn.addEventListener('click', saveAudioMessage);

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(senderNameInputRecord);
        modalContent.appendChild(status);
        modalContent.appendChild(recordControl);
        modalContent.appendChild(saveBtn);
        recordModal.appendChild(modalContent);
        document.body.appendChild(recordModal);
    }
    recordModal.classList.add('show');
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
        alert('ブラウザが録音をサポートしていません!');
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
            recordControl.textContent = '⏹録音停止';
            status.textContent = '録音中...';
        })
        .catch(err => {
            console.error('マイクへのアクセスが許可されませんでした: ', err);
            alert('マイクへのアクセスが許可されませんでした。もう一度試してください。');
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
            recordControl.textContent = '🎤録音再開';
            status.textContent = '録音中...';
            saveBtn.classList.remove('hidden');

            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        });

        mediaRecorder = null;
    }
}

function saveAudioMessage() {
    if (window.currentAudioMessage) {
        const senderNameInput = document.getElementById('senderNameInputRecord');
        const senderName = senderNameInput.value.trim() || '匿名';
        const birthdayPerson = localStorage.getItem('currentBirthday') || 'unknown';
        
        fetch(window.currentAudioMessage)
            .then(res => res.blob())
            .then(async audioBlob => {
                const status = document.getElementById('recordStatus');
                status.textContent = '録音を保存しています...';
                
                try {
                    if (typeof saveAudioMessageToSupabase === 'function') {
                        const result = await saveAudioMessageToSupabase(audioBlob, senderName, birthdayPerson);
                        if (result) {
                            alert('録音を保存しました!');
                            document.getElementById('recordMessageModal').style.display = 'none';
                            senderNameInput.value = '';
                            displaySavedAudioMessages();
                            return;
                        }
                    }
                    
                    console.log("Supabaseへの保存に失敗しました、ローカルストレージを使用します");
        let audioMessages = JSON.parse(localStorage.getItem('audioMessages') || '{}');
        if (!audioMessages[birthdayPerson]) {
            audioMessages[birthdayPerson] = [];
        }
        audioMessages[birthdayPerson].push({ url: window.currentAudioMessage, sender: senderName });
        localStorage.setItem('audioMessages', JSON.stringify(audioMessages));
                    alert('録音を保存しました!');
        document.getElementById('recordMessageModal').style.display = 'none';
        senderNameInput.value = '';
        displaySavedAudioMessages();
                } catch (error) {
                    console.error('録音を保存する際にエラーが発生しました:', error);
                    alert('録音を保存する際にエラーが発生しました。');
                    status.textContent = '録音を保存する際にエラーが発生しました。';
                }
            });
    } else {
        alert('録音データがありません。');
    }
}

async function displaySavedAudioMessages() {
    const birthdayPerson = localStorage.getItem('currentBirthday') || 'unknown';
    let playAudioBtn = document.getElementById('playAudioMessagesBtn');
    const customMessageContainer = document.querySelector('.custom-message-container');
    
    let hasMessages = false;
    
    try {
        if (typeof getAudioMessages === 'function' && typeof supabase !== 'undefined') {
            const messages = await getAudioMessages(birthdayPerson);
            if (messages && messages.length > 0) {
                hasMessages = true;
            }
        }
    } catch (error) {
        console.error('Supabaseから音声メッセージを取得する際にエラーが発生しました:', error);
    }
    
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
            playAudioBtn.textContent = '🎧録音を聞く';
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
        audioModal.className = 'audio-messages-modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'audio-modal-content';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            audioModal.classList.remove('show');
        });

        const title = document.createElement('h2');
        title.textContent = '録音を聞く';
        title.className = 'audio-modal-title';

        const audioList = document.createElement('div');
        audioList.id = 'audioMessagesList';
        audioList.className = 'audio-messages-list';

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(audioList);
        audioModal.appendChild(modalContent);
        document.body.appendChild(audioModal);
    }
    audioModal.style.display = 'flex';

    const audioList = document.getElementById('audioMessagesList');
    audioList.innerHTML = '';
    
    const loadingMsg = document.createElement('p');
    loadingMsg.textContent = '録音を聞く...';
    loadingMsg.className = 'audio-loading-msg';
    audioList.appendChild(loadingMsg);
    
    let messagesLoaded = false;
    
    try {
        if (typeof getAudioMessages === 'function' && typeof supabase !== 'undefined') {
            const supabaseMessages = await getAudioMessages(birthdayPerson);
            if (supabaseMessages && supabaseMessages.length > 0) {
                messagesLoaded = true;
                audioList.innerHTML = ''; 
                
                const supabaseTitle = document.createElement('h3');
                supabaseTitle.textContent = 'オンラインの声';
                supabaseTitle.className = 'audio-section-title';
                audioList.appendChild(supabaseTitle);
                
                supabaseMessages.forEach((messageObj, index) => {
                    const audioItem = document.createElement('div');
                    audioItem.className = 'audio-message-item';
                    audioItem.textContent = `メッセージ ${index + 1} - ${messageObj.sender}さんから`;
                    audioItem.addEventListener('click', () => {
                        playAudioMessage(messageObj.audio_data);
                    });
                    audioList.appendChild(audioItem);
                });
            }
        }
    } catch (error) {
        console.error('Supabaseから音声メッセージを取得できませんでした:', error);
    }
    

    const audioMessages = JSON.parse(localStorage.getItem('audioMessages') || '{}');
    const localMessages = audioMessages[birthdayPerson] || [];
    
    if (localMessages.length > 0) {
        if (messagesLoaded) {

            const localTitle = document.createElement('h3');
            localTitle.textContent = 'ローカルメッセージ';
            localTitle.className = 'audio-section-title local-section';
            audioList.appendChild(localTitle);
        } else {

            audioList.innerHTML = '';
            messagesLoaded = true;
        }
        

        localMessages.forEach((messageObj, index) => {
            const audioItem = document.createElement('div');
            audioItem.className = 'audio-message-item';
            audioItem.textContent = `メッセージ ${index + 1} - ${messageObj.sender}さんから`;
            audioItem.addEventListener('click', () => {
                playAudioMessage(messageObj.url);
            });
            audioList.appendChild(audioItem);
        });
    }
    

    if (!messagesLoaded && localMessages.length === 0) {
        audioList.innerHTML = '';
        const noMessages = document.createElement('p');
        noMessages.textContent = '音声メッセージがまだありません。';
        noMessages.className = 'audio-no-messages';
        audioList.appendChild(noMessages);
    }
}


function displayCustomMessage(message) {
    const customMessageDisplay = document.getElementById('customMessageDisplay');
    if (customMessageDisplay) {
        customMessageDisplay.textContent = message;
        customMessageDisplay.classList.add('show');
        
        customMessageDisplay.classList.add('animate-in');
    }
}





document.addEventListener('DOMContentLoaded', function() {
    const micPermissionBtn = document.getElementById('micPermissionBtn');
    if (micPermissionBtn) {
        micPermissionBtn.addEventListener('click', function() {
            setupAudioAnalysis();
            this.classList.add('hidden');
            document.getElementById('blowButton').classList.remove('hidden');
            document.getElementById('audioFeedback').classList.remove('hidden');
            document.getElementById('progressContainer').classList.remove('hidden');
        });
    }


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
                this.textContent = `もっと強く吹いて！ (${buttonClickCount}/5)`;
            }
        });
    }

    initInviteFriends();
    initCommunityFeatures();
    initVirtualGift();
});


function initVirtualGift() {
    
    const virtualGiftModal = document.getElementById('virtualGiftModal');
    if (!virtualGiftModal) {
        console.error('virtualGiftModal要素が見つかりません');
        return;
    }
    
    const closeVirtualGift = document.getElementById('closeVirtualGift');
    const submitGift = document.getElementById('submitGift');
    if (!closeVirtualGift || !submitGift) {
        console.error('closeVirtualGiftまたはsubmitGift要素が見つかりません');
        return;
    }
    
    let selectedGift = null;
    
    closeVirtualGift.addEventListener('click', () => {
        virtualGiftModal.classList.remove('show');
    });
    
    virtualGiftModal.addEventListener('click', (e) => {
        if (e.target === virtualGiftModal) {
            virtualGiftModal.classList.remove('show');
        }
    });
    
    submitGift.addEventListener('click', () => {
        const senderInput = document.getElementById('giftSender');
        const sender = senderInput ? senderInput.value.trim() || '匿名' : '匿名';
        
        if (selectedGift) {
            saveVirtualGift(sender, selectedGift);
            if (senderInput) senderInput.value = '';
            virtualGiftModal.classList.remove('show');
            alert('バーチャルギフトを送信しました！');
            displaySavedVirtualGifts();
        } else {
            alert('ギフトを選択してください！');
        }
    });
}


function loadGiftList() {
    const giftListContainer = document.getElementById('giftList');
    giftListContainer.innerHTML = '';
    
    const gifts = [
        { id: 'flower', name: '花 🌸', emoji: '🌸' },
        { id: 'cake', name: '誕生日ケーキ 🎂', emoji: '🎂' },
        { id: 'gift', name: 'プレゼント 🎁', emoji: '🎁' },
        { id: 'balloon', name: '風船 🎈', emoji: '🎈' },
        { id: 'heart', name: 'ハート ❤️', emoji: '❤️' }
    ];
    
    gifts.forEach(gift => {
        const giftItem = document.createElement('div');
        giftItem.className = 'gift-item';
        giftItem.innerHTML = `
            <span class="gift-emoji">${gift.emoji}</span>
            <p class="gift-name">${gift.name}</p>
        `;
        giftItem.dataset.giftId = gift.id;
        giftItem.addEventListener('click', function() {
            document.querySelectorAll('.gift-item').forEach(item => item.classList.remove('selected'));
            this.classList.add('selected');
            window.selectedGift = gift;
        });
        giftListContainer.appendChild(giftItem);
    });
}

function getGiftName(giftId) {
    const gifts = {
        'cake': '誕生日ケーキ',
        'balloon': '風船',
        'gift': 'プレゼント',
        'flower': '花',
        'chocolate': 'チョコレート',
        'card': 'カード',
        'wine': 'ワイン',
        'teddy': 'ぬいぐるみ',
        'heart': 'ハート'
    };
    return gifts[giftId] || 'ギフト';
}

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

async function saveVirtualGift(sender, gift) {
    try {
        if (sender && sender.trim()) {
            saveUsername(sender);
        }
        
        const birthdayPerson = localStorage.getItem('currentBirthday') || 'unknown';
        const giftData = { 
            sender: sender,
            gift_id: gift.id,
            birthday_person: birthdayPerson
        };
        
        const { error } = await supabase
            .from('virtual_gifts')
            .insert([giftData]);
            
        if (error) throw error;
        
        await displaySavedVirtualGifts();
        
        const selectedGiftDisplay = document.getElementById('selectedGiftDisplay');
        if (selectedGiftDisplay) {
            selectedGiftDisplay.innerHTML = `選択: ${gift.emoji} ${gift.name}`;
            selectedGiftDisplay.classList.add('show');
            selectedGiftDisplay.dataset.giftId = gift.id;
        }
        
        return true;
    } catch (error) {
        console.error('ギフト保存エラー:', error);
        
    const birthdayPerson = localStorage.getItem('currentBirthday') || 'unknown';
    const now = new Date();
    const time = now.toLocaleString('ja-JP');
    const giftData = { sender, giftId: gift.id, giftName: gift.name, time };
    let virtualGifts = JSON.parse(localStorage.getItem('virtualGifts') || '{}');
    if (!virtualGifts[birthdayPerson]) {
        virtualGifts[birthdayPerson] = [];
    }
    virtualGifts[birthdayPerson].push(giftData);
    localStorage.setItem('virtualGifts', JSON.stringify(virtualGifts));
        
        const selectedGiftDisplay = document.getElementById('selectedGiftDisplay');
        if (selectedGiftDisplay) {
            selectedGiftDisplay.innerHTML = `選択: ${gift.emoji} ${gift.name}`;
            selectedGiftDisplay.classList.add('show');
            selectedGiftDisplay.dataset.giftId = gift.id;
        }
        
        return false;
    }
}

async function displaySavedVirtualGifts() {
    try {
    const birthdayPerson = localStorage.getItem('currentBirthday') || 'unknown';
        
        const { data: gifts, error } = await supabase
            .from('virtual_gifts')
            .select('*')
            .eq('birthday_person', birthdayPerson)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
    let viewGiftsBtn = document.getElementById('viewVirtualGiftsBtn');
    const customMessageContainer = document.querySelector('.custom-message-container');
    
        if (gifts && gifts.length > 0) {
        if (!viewGiftsBtn) {
            viewGiftsBtn = document.createElement('button');
            viewGiftsBtn.id = 'viewVirtualGiftsBtn';
            viewGiftsBtn.className = 'feature-button';
            viewGiftsBtn.textContent = '🎁 バーチャルギフトを見る';
            viewGiftsBtn.addEventListener('click', () => {
                openVirtualGiftsModal(birthdayPerson);
            });
            customMessageContainer.appendChild(viewGiftsBtn);
        }
        viewGiftsBtn.classList.add('show');
    } else if (viewGiftsBtn) {
        viewGiftsBtn.classList.remove('show');
    }
    } catch (error) {
        console.error('ギフトの表示エラー:', error);
        
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
            viewGiftsBtn.textContent = '🎁 バーチャルギフトを見る';
            viewGiftsBtn.addEventListener('click', () => {
                openVirtualGiftsModal(birthdayPerson);
            });
            customMessageContainer.appendChild(viewGiftsBtn);
        }
        viewGiftsBtn.classList.add('show');
    } else if (viewGiftsBtn) {
        viewGiftsBtn.classList.remove('show');
        }
    }
}

async function openVirtualGiftsModal(birthdayPerson) {
    let giftsModal = document.getElementById('virtualGiftsModal');
    if (!giftsModal) {
        giftsModal = document.createElement('div');
        giftsModal.id = 'virtualGiftsModal';
        giftsModal.className = 'virtual-gifts-modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'virtual-gifts-modal-content';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            giftsModal.classList.remove('show');
        });

        const title = document.createElement('h2');
        title.textContent = '受け取ったバーチャルギフト';
        title.className = 'virtual-gifts-modal-title';

        const giftsList = document.createElement('div');
        giftsList.id = 'virtualGiftsList';
        giftsList.className = 'virtual-gifts-list';

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
        
        const { data: gifts, error } = await supabase
            .from('virtual_gifts')
            .select('*')
            .eq('birthday_person', birthdayPerson)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        if (gifts && gifts.length > 0) {
            gifts.forEach((giftObj) => {
                const giftItem = document.createElement('div');
                giftItem.className = 'virtual-gift-display-item';
                
                const createdAt = new Date(giftObj.created_at);
                const formattedTime = createdAt.toLocaleString('ja-JP');
                
                giftItem.innerHTML = `
                    <span class="gift-display-emoji">${getGiftEmoji(giftObj.gift_id)}</span>
                    <span class="gift-display-text">${getGiftName(giftObj.gift_id)} from ${giftObj.sender}</span>
                    <small class="gift-display-time">(${formattedTime})</small>
                `;
                giftsList.appendChild(giftItem);
            });
        } else {
            const noGifts = document.createElement('p');
            noGifts.textContent = '受け取ったバーチャルギフトはありません。';
            noGifts.className = 'virtual-gifts-no-items';
            giftsList.appendChild(noGifts);
        }
    } catch (error) {
        console.error('ギフトの表示エラー:', error);
        
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
                <span>${giftObj.giftName} from ${giftObj.sender}</span>
                <small>(${giftObj.time})</small>
            `;
            giftsList.appendChild(giftItem);
        });
    } else {
        const noGifts = document.createElement('p');
        noGifts.textContent = '受け取ったバーチャルギフトはありません。';
        noGifts.style.color = '#2C1810';
        giftsList.appendChild(noGifts);
    }
}
}



function openMusicSelectionModal() {
    let musicModal = document.getElementById('musicSelectionModal');
    if (!musicModal) {
        musicModal = document.createElement('div');
        musicModal.id = 'musicSelectionModal';
        musicModal.className = 'music-selection-modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'music-modal-content';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            musicModal.classList.remove('show');
        });

        const title = document.createElement('h2');
        const currentLang = localStorage.getItem('language') || 'ja';
        const t = translations && translations[currentLang] ? translations[currentLang] : translations['ja'];
        title.textContent = t.selectMusic || '音楽を選ぶ';
        title.className = 'music-modal-title';

        const trackList = document.createElement('div');
        trackList.id = 'trackList';
        trackList.className = 'music-track-list';

        const tracks = [
            { url: 'assets/audio/happy-birthday.mp3', name: 'Happy Birthday Song (Default)' },
            { url: 'https://www.bensound.com/bensound-music/bensound-slowmotion.mp3', name: 'Slow Motion' },
            { url: 'https://www.bensound.com/bensound-music/bensound-sunny.mp3', name: 'Sunny' }
        ];

        tracks.forEach(track => {
            const trackItem = document.createElement('div');
            trackItem.className = 'music-track-item';
            trackItem.textContent = track.name;
            trackItem.addEventListener('click', () => {
                window.changeMusicTrack(track.url, track.name);
                musicModal.classList.remove('show');
            });
            trackList.appendChild(trackItem);
        });

        const uploadInput = document.createElement('input');
        uploadInput.type = 'file';
        uploadInput.accept = 'audio/mp3, audio/wav';
        uploadInput.className = 'music-upload-input';
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    window.changeMusicTrack(event.target.result, file.name);
                    musicModal.classList.remove('show');
                };
                reader.readAsDataURL(file);
            }
        });

        const uploadLabel = document.createElement('label');
        uploadLabel.textContent = '背景音をアップロード (MP3/WAV)';
        uploadLabel.className = 'music-upload-label';

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(trackList);
        modalContent.appendChild(uploadLabel);
        modalContent.appendChild(uploadInput);
        musicModal.appendChild(modalContent);
        document.body.appendChild(musicModal);
    }
    musicModal.classList.add('show');
}

function initInviteFriends() {
    let inviteBtn = document.getElementById('inviteFriendsBtn');
    const customMessageContainer = document.querySelector('.custom-message-container');
    if (!inviteBtn) {
        inviteBtn = document.createElement('button');
        inviteBtn.id = 'inviteFriendsBtn';
        inviteBtn.className = 'feature-button';
        inviteBtn.textContent = '📩 邀請友人';
        customMessageContainer.appendChild(inviteBtn);
    }

    inviteBtn.addEventListener('click', () => {
        openInviteModal();
    });

    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');
    if (inviteCode) {
        let inviteCount = parseInt(localStorage.getItem('inviteCount') || '0', 10);
        inviteCount++;
        localStorage.setItem('inviteCount', inviteCount.toString());
        alert(`友人を招待してくださりありがとうございます！招待数: ${inviteCount}`);
    }
}

function getNextBirthdayPerson() {
    const currentBirthday = localStorage.getItem('currentBirthday');
    if (currentBirthday) {
        return currentBirthday;
    }
    if (typeof findNextBirthday === 'function') {
        const now = new Date();
        const nextBirthday = findNextBirthday(now);
        return nextBirthday.person ? nextBirthday.person.name : '大切な人';
    }
    return '大切な人';
}

function openInviteModal() {
    let inviteModal = document.getElementById('inviteModal');
    if (!inviteModal) {
        inviteModal = document.createElement('div');
        inviteModal.id = 'inviteModal';
        inviteModal.className = 'invite-modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'invite-modal-content';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'invite-close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            inviteModal.classList.remove('show');
        });

        const title = document.createElement('h2');
        title.textContent = '友人を招待してください';
        title.className = 'invite-modal-title';

        const inviteLink = document.createElement('input');
        inviteLink.id = 'inviteLink';
        inviteLink.type = 'text';
        inviteLink.readOnly = true;
        inviteLink.className = 'invite-link-input';
        inviteLink.value = generateInviteLink();

        const copyBtn = document.createElement('button');
        copyBtn.textContent = '友人を招待してください';
        copyBtn.className = 'invite-copy-btn';
        copyBtn.addEventListener('click', () => {
            inviteLink.select();
            document.execCommand('copy');
            alert('友人を招待してください');
        });

        const inviteMessage = document.createElement('textarea');
        inviteMessage.id = 'inviteMessage';
        inviteMessage.placeholder = '友人を招待してください';
        inviteMessage.className = 'invite-message-textarea';
        const birthdayPerson = localStorage.getItem('currentBirthday') || getNextBirthdayPerson();
        inviteMessage.value = `${birthdayPerson}の誕生日パーティーに友達を招待しましょう！`;

        const emailInput = document.createElement('input');
        emailInput.id = 'emailInput';
        emailInput.type = 'email';
        emailInput.placeholder = '友人を招待してください';
        emailInput.className = 'invite-email-input';

        const sendBtn = document.createElement('button');
        sendBtn.textContent = '送信';
        sendBtn.className = 'invite-send-btn';
        sendBtn.addEventListener('click', () => {
            const email = emailInput.value.trim();
            const message = inviteMessage.value.trim();
            if (email && message) {
                sendInviteEmail(email, message);
                inviteModal.classList.remove('show');
                emailInput.value = '';
                const birthdayPerson = localStorage.getItem('currentBirthday') || getNextBirthdayPerson();
                inviteMessage.value = `${birthdayPerson}の誕生日パーティーに友達を招待しましょう！`;
            } else {
                alert('友人を招待してください');
            }
        });

        const stats = document.createElement('p');
        stats.id = 'inviteStats';
        stats.className = 'invite-stats';
        stats.textContent = `友人を招待してください: ${localStorage.getItem('inviteCount') || '0'}`;

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
    inviteModal.classList.add('show');
    document.getElementById('inviteStats').textContent = `友人を招待してください: ${localStorage.getItem('inviteCount') || '0'}`;
}

function generateInviteLink() {
    const inviteCode = Math.random().toString(36).substring(2, 7);
    return `${window.location.origin}${window.location.pathname}?invite=${inviteCode}`;
}

function sendInviteEmail(email, message) {
    const subject = encodeURIComponent('友人を招待してください');
    const body = encodeURIComponent(`${message}\n\nリンクにアクセス: ${document.getElementById('inviteLink').value}`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    let inviteSentCount = parseInt(localStorage.getItem('inviteSentCount') || '0', 10);
    inviteSentCount++;
    localStorage.setItem('inviteSentCount', inviteSentCount.toString());
    alert(`友人を招待してください${email}! 友人を招待してください: ${inviteSentCount}`);
}

function createBalloons() {
    const balloonContainer = document.getElementById('balloonContainer');
    if (!balloonContainer) {
        console.error('#balloonContainer要素が見つかりません');
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

document.addEventListener('DOMContentLoaded', function() {
    try {
        if (typeof createBalloons === 'function') createBalloons();
        if (typeof initPhotoAlbum === 'function') initPhotoAlbum();
        if (typeof initGames === 'function') initGames();
        if (typeof initSocialShare === 'function') initSocialShare();
        if (typeof initMusicPlayer === 'function') initMusicPlayer();
    
        if (typeof initCustomMessage === 'function') initCustomMessage();
        if (typeof initCommunityFeatures === 'function') initCommunityFeatures();
        if (typeof initInviteFriends === 'function') initInviteFriends();
    
        if (typeof displaySavedCustomMessage === 'function') displaySavedCustomMessage();
    } catch (error) {
        console.error('機能の初期化中にエラーが発生しました:', error);
    }
});

window.addEventListener('beforeunload', () => {
    AudioManager.cleanup();
});

