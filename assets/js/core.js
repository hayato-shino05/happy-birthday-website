let birthdays = [];
let lastBirthdayCheck = null;

async function loadBirthdays() {
    try {
        if (!supabase) {
            console.error("Supabaseが初期化されていません");
            return;
        }
        
        const { data, error } = await supabase
            .from('birthdays')
            .select('*')
            .order('month')
            .order('day');
            
        if (error) {
            console.error("誕生日データの読み込み中にエラーが発生しました:", error);
            return;
        }
        
        birthdays = data.map(item => ({
            name: item.name,
            month: item.month,
            day: item.day,
            year: item.year,
            message: item.message || ` ${item.name}さん、お誕生日おめでとうございます！ `
        }));
        
        console.log("Supabaseから誕生日リストをロードしました:", birthdays);
        checkBirthdayAndInitialize();
    } catch (error) {
        console.error("Supabaseからの誕生日の読み込み中にエラーが発生しました:", error);
    }
}

function checkIfBirthday(date) {
    try {
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        
        return birthdays.find(person => {
            // 実際の月（1-12）と日を比較
            const monthMatch = (checkDate.getMonth() + 1) === person.month;
            const dayMatch = checkDate.getDate() === person.day;
            
            // コンソールスパムを防ぐためにデバッグを削除
            
            return monthMatch && dayMatch;
        });
    } catch (error) {
        console.error('checkIfBirthdayでエラーが発生しました:', error);
        return null;
    }
}

function findNextBirthday(currentDate) {
    try {
        let nearestPerson = null;
        let nearestDate = null;
        let smallestDiff = Infinity;

        // 元の配列に影響を与えないように、birthdays配列のコピーを作成
        const birthdaysList = [...birthdays];

        for (const person of birthdaysList) {
            // 今年の誕生日を作成
            let birthday = new Date(currentDate.getFullYear(), person.month - 1, person.day);
            
            // 今年の誕生日が過ぎている場合は、来年で計算
            if (currentDate > birthday) {
                birthday = new Date(currentDate.getFullYear() + 1, person.month - 1, person.day);
            }

            const diff = birthday - currentDate;
            console.log(`${person.name}を確認中:`, {
                birthday: birthday,
                diff: diff,
                currentSmallest: smallestDiff
            });

            if (diff < smallestDiff && diff >= 0) {
                smallestDiff = diff;
                nearestDate = birthday;
                nearestPerson = person;
                console.log(`新しい最も近い人: ${person.name}`);
            }
        }

        console.log('最終的に最も近い人:', nearestPerson?.name);
        return { person: nearestPerson, date: nearestDate };
    } catch (error) {
        console.error('次の誕生日の検索中にエラーが発生しました:', error);
        return { person: null, date: null };
    }
}

function displayCountdown(targetDate, person) {
    try {
        const now = new Date();
        const diff = targetDate - now;
        
        // 時間が経過した場合（負の値）、次の誕生日を探す
        if (diff < 0) {
            console.log('時間が経過しました。次の誕生日を探しています...');
            
            // checkBirthdayAndInitializeを呼び出す代わりに、直接次の誕生日を探す
            const nextBirthday = findNextBirthday(new Date());
            if (nextBirthday.person) {
                // 次の誕生日の情報を更新
                localStorage.setItem('nextBirthdayDate', nextBirthday.date.toISOString());
                localStorage.setItem('nextBirthdayPerson', JSON.stringify(nextBirthday.person));
                
                // 新しい情報でdisplayCountdownを再帰的に呼び出す
                displayCountdown(nextBirthday.date, nextBirthday.person);
            }
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            countdownElement.classList.remove('hidden');
            
            // 表示されているHTMLが既に存在するか確認
            const titleElement = countdownElement.querySelector('h1');
            
            // HTMLが存在しないか、別の人の誕生日が表示されている場合、HTML全体を再生成
            if (!titleElement || titleElement.dataset.person !== person.name) {
                const currentLang = localStorage.getItem('language') || 'ja';
                const t = translations && translations[currentLang] ? translations[currentLang] : translations['ja'];
                
                countdownElement.innerHTML = `
                    <h1 data-person="${person.name}">${person.name}${t.countdownTemplate}</h1>
                    <div class="time">
                        <div>
                            <span id="days">${days}</span>
                            <div>${t.days}</div>
                        </div>
                        <div>
                            <span id="hours">${hours}</span>
                            <div>${t.hours}</div>
                        </div>
                        <div>
                            <span id="minutes">${minutes}</span>
                            <div>${t.minutes}</div>
                        </div>
                        <div>
                            <span id="seconds">${seconds}</span>
                            <div>${t.seconds}</div>
                        </div>
                    </div>
                `;
            } else {
                // HTMLが既に存在する場合、ちらつきを防ぐためにカウントダウンの数字のみを更新
                const daysElement = countdownElement.querySelector('#days');
                const hoursElement = countdownElement.querySelector('#hours');
                const minutesElement = countdownElement.querySelector('#minutes');
                const secondsElement = countdownElement.querySelector('#seconds');
                
                if (daysElement) daysElement.textContent = days;
                if (hoursElement) hoursElement.textContent = hours;
                if (minutesElement) minutesElement.textContent = minutes;
                if (secondsElement) secondsElement.textContent = seconds;
            }
        }
    } catch (error) {
        console.error('カウントダウンの表示中にエラーが発生しました:', error);
    }
}

async function checkBirthdayAndInitialize() {
    try {
        const now = new Date();
        
        const lastCheck = localStorage.getItem('lastBirthdayCheck');
        const lastCheckDate = lastCheck ? new Date(lastCheck) : null;
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayAt23 = new Date(today.getTime() + 23 * 60 * 60 * 1000); // 今日の23:00
        
        const shouldCheck = !lastCheckDate || 
                           (now >= todayAt23 && 
                            (!lastCheckDate || lastCheckDate < todayAt23));
        
        console.log("新しい誕生日チェック: " + (shouldCheck ? "はい" : "いいえ") + 
                   (lastCheck ? ", 最終チェック: " + new Date(lastCheck).toLocaleString() : ""));
        
        if (birthdays.length === 0 || shouldCheck) {
            if (birthdays.length === 0) {
                await loadBirthdays();
                if (birthdays.length === 0) {
                    console.error("誕生日データをロードできません");
                    return;
                }
            }
            
            localStorage.setItem('lastBirthdayCheck', now.toISOString());
            lastBirthdayCheck = now;
            
            const birthdayPerson = checkIfBirthday(now);

            if (birthdayPerson) {
                const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
                const lastShownDate = localStorage.getItem('lastBirthdayShown');
                const sessionEffectsShown = sessionStorage.getItem('birthdayEffectsShown');
                
                localStorage.setItem('lastBirthdayShown', today);
                localStorage.setItem('currentBirthday', birthdayPerson.name);
                localStorage.setItem('birthdayPerson', birthdayPerson.name);
                
                if (sessionEffectsShown !== today) {
                    console.log('エフェクト付きで誕生日を表示');
                    showBirthdayContent(birthdayPerson, true); // エフェクトあり
                    sessionStorage.setItem('birthdayEffectsShown', today);
                } else {
                    console.log('エフェクトなしで誕生日を表示');
                    showBirthdayContent(birthdayPerson, false); // エフェクトなし
                }
            } else {
                localStorage.removeItem('lastBirthdayShown');
                localStorage.removeItem('currentBirthday');
                
                const nextBirthday = findNextBirthday(new Date());
                if (nextBirthday.person) {
                    localStorage.setItem('nextBirthdayDate', nextBirthday.date.toISOString());
                    localStorage.setItem('nextBirthdayPerson', JSON.stringify(nextBirthday.person));
                    displayCountdown(nextBirthday.date, nextBirthday.person);
                }
            }
        } else {
            const nextBirthdayDateStr = localStorage.getItem('nextBirthdayDate');
            const nextBirthdayPersonStr = localStorage.getItem('nextBirthdayPerson');
            
            if (nextBirthdayDateStr && nextBirthdayPersonStr) {
                const nextBirthdayDate = new Date(nextBirthdayDateStr);
                const nextBirthdayPerson = JSON.parse(nextBirthdayPersonStr);
                displayCountdown(nextBirthdayDate, nextBirthdayPerson);
            }
        }
    } catch (error) {
        console.error('checkBirthdayAndInitializeでエラーが発生しました:', error);
    }
}

function updateCountdownTime() {
    try {
        const now = new Date();
        const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        const lastBirthdayShown = localStorage.getItem('lastBirthdayShown');
        
        if (lastBirthdayShown === today) {
            const countdownElement = document.getElementById('countdown');
            if (countdownElement) countdownElement.classList.add('hidden');
            return; 
        }
        
        const nextBirthdayDateStr = localStorage.getItem('nextBirthdayDate');
        const nextBirthdayPersonStr = localStorage.getItem('nextBirthdayPerson');
        
        if (!nextBirthdayDateStr || !nextBirthdayPersonStr) {
            checkBirthdayAndInitialize();
            return;
        }
        
        const nextBirthdayDate = new Date(nextBirthdayDateStr);
        const nextBirthdayPerson = JSON.parse(nextBirthdayPersonStr);
        
        displayCountdown(nextBirthdayDate, nextBirthdayPerson);
    } catch (error) {
        console.error('updateCountdownTimeでエラーが発生しました:', error);
    }
}

function showBirthdayContent(birthdayPerson, showEffects = true) {
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        countdownElement.classList.add('hidden');
    }

    const birthdayContent = document.getElementById('birthdayContent');
    if (birthdayContent) {
        birthdayContent.classList.remove('hidden');
        
        if (showEffects) {
            birthdayContent.classList.add('appearing');
            
            setTimeout(() => {
                birthdayContent.classList.remove('appearing');
            }, 1000);
        }
    }

    const birthdayTitle = document.getElementById('birthdayTitle');
    if (birthdayTitle) {
        birthdayTitle.classList.add('birthday-title', 'birthday-title-visible');
        birthdayTitle.textContent = 'お誕生日おめでとうございます';
    }

    const birthdayMessage = document.getElementById('birthdayMessage');
    if (birthdayMessage) {
        birthdayMessage.textContent = birthdayPerson.message;
        birthdayMessage.classList.add('celebrating', 'birthday-message-visible');
    }

    const cake2DContainer = document.querySelector('.cake-2d-container');
    if (cake2DContainer) {
        cake2DContainer.classList.add('cake-2d-visible');
    }
    
    const blowButton = document.getElementById('blowButton');
    if (blowButton) {
        blowButton.classList.add('blow-button-visible');
        
        if (showEffects) {
            setTimeout(() => {
                blowButton.classList.add('blow-button-hidden');
                
                setTimeout(() => {
                    blowButton.classList.remove('blow-button-hidden');
                    blowButton.classList.add('blow-button-animated');
                }, 100);
            }, 1000);
        } else {
            blowButton.classList.add('blow-button-animated');
        }
        
        blowButton.onclick = function() {
            if (typeof blowOutCandle === 'function') {
                blowOutCandle();
            } else {
                console.log('ろうそくを吹き消し処理中...');
                const flames = document.querySelectorAll('.flame');
                if (flames && flames.length > 0) {
                    flames.forEach((flame, index) => {
                        setTimeout(() => {
                            flame.classList.add('flame-hidden');
                        }, index * 200);
                    });
                }
            }
        };
    }
    
    const micPermissionBtn = document.getElementById('micPermissionBtn');
    if (micPermissionBtn) {
        micPermissionBtn.classList.add('mic-permission-hidden');
    }
    
    const cakeContainer = document.querySelector('.cake-container');
    if (cakeContainer) {
        cakeContainer.classList.add('cake-container-hidden');
    }
    
    const birthdayMessageContainer = document.querySelector('.birthday-message');
    if (birthdayMessageContainer) {
        birthdayMessageContainer.classList.add('birthday-message-container-visible');
    }

    document.body.classList.add('birthday-background');

    setTimeout(() => {
    createConfetti();
        
        setTimeout(createConfetti, 2000);
    }, 500);

    setTimeout(playBirthdayMusic, 1200);
    
    setTimeout(displaySavedCustomMessage, 1500);
    
    if (typeof createBalloons === 'function') {
        setTimeout(createBalloons, 1000);
    }
}



function playBirthdayMusic() {
    const audio = new Audio('assets/audio/happy-birthday.mp3');
    audio.play().catch(e => {
        console.log('自動再生が防止されました:', e);
        const playButton = document.getElementById('playMusic');
        if (playButton) {
            playButton.textContent = '▶️';
        }
    });
}

function debugDate() {
    const now = new Date();
    console.log('現在の日付:', {
        fullDate: now,
        month: now.getMonth() + 1, 
        date: now.getDate(),
        year: now.getFullYear()
    });
    
    const birthdayPerson = checkIfBirthday(now);
    console.log('誕生日チェック結果:', birthdayPerson);
    
    birthdays.forEach(person => {
        console.log(`${person.name}を確認中:`, {
            personMonth: person.month,
            currentMonth: now.getMonth() + 1,
            personDay: person.day,
            currentDay: now.getDate(),
            isMatch: (now.getMonth() + 1) === person.month && now.getDate() === person.day
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadBirthdays, 1000);
    setTimeout(checkBirthdayAndInitialize, 1500);
    setInterval(updateCountdownTime, 1000);
    
    initPhotoAlbum();
    initGames();
    initSocialShare();
    initMusicPlayer();
    
    const theme = detectSeasonAndFestival();
    applyTheme(theme);
    
    const savedLang = localStorage.getItem('language') || 'ja';
    document.getElementById('languageSelect').value = savedLang;
    applyLanguage(savedLang);
    
    const languageSelect = document.getElementById('languageSelect');
    languageSelect.addEventListener('change', function() {
        const selectedLang = this.value;
        applyLanguage(selectedLang);
    });
    
    initCustomMessage();
    displaySavedCustomMessage();
    setupDailyBirthdayCheck();
});

function setupDailyBirthdayCheck() {
    setInterval(() => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        
        if (hours === 0 && minutes === 0) {
            console.log('0時 - 毎日の誕生日チェック');
            checkBirthdayAndInitialize();
        }
    }, 60000);
    
    console.log('毎日の誕生日チェック設定完了');
}