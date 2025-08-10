// 基本的なSupabase設定ファイル

// Supabase接続情報
const SUPABASE_URL = "${SUPABASE_URL}";
const SUPABASE_KEY = "${SUPABASE_ANON_KEY}";
// Supabaseクライアントの初期化
let supabase;

// ドキュメントの準備ができたらSupabaseを初期化
document.addEventListener('DOMContentLoaded', () => {
    if (SUPABASE_URL === '${SUPABASE_URL}' || SUPABASE_KEY === '${SUPABASE_ANON_KEY}') {
        console.warn('⚠️ Supabase設定が未設定です！環境変数を設定してください。');
        console.warn('📋 必要な環境変数:');
        console.warn('   • SUPABASE_URL - Supabaseプロジェクト URL');
        console.warn('   • SUPABASE_ANON_KEY - Supabase anonymous key');
        console.warn('🔧 Vercelダッシュボードで設定: Project Settings → Environment Variables');
    }
    initSupabase();
});

/**
 * Supabase接続の初期化
 */
function initSupabase() {
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabaseが初期化されました');
        
        // 接続確認
        checkSupabaseConnection();
    } catch (error) {
        console.error('Supabaseの初期化エラー:', error);
        alert('データベースに接続できません。ネットワーク接続を確認し、後でもう一度お試しください。');
    }
}

/**
 * Supabase接続を確認
 * @returns {Promise<boolean>} 接続ステータス
 */
async function checkSupabaseConnection() {
    try {
        const { data, error } = await supabase.from('birthdays').select('count');
        if (error) throw error;
        console.log('Supabase接続成功！');
        return true;
    } catch (error) {
        console.error('Supabase接続エラー:', error);
        return false;
    }
}



/**
 * テキストメッセージを保存
 * @param {string} sender 送信者
 * @param {string} message メッセージ内容
 * @param {string} birthdayPerson 受信者
 * @returns {Promise<boolean>} 保存結果
 */
async function saveCustomMessage(sender, message, birthdayPerson) {
    try {
        const { data, error } = await supabase
            .from('custom_messages')
            .insert([
                { 
                    sender: sender,
                    message: message,
                    birthday_person: birthdayPerson
                }
            ]);
            
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('メッセージ保存エラー:', error);
        return false;
    }
}

/**
 * 誕生日の人に対する最新のテキストメッセージを取得
 * @param {string} birthdayPerson 受信者
 * @returns {Promise<Object>} メッセージ
 */
async function getLatestCustomMessage(birthdayPerson) {
    try {
        const { data, error } = await supabase
            .from('custom_messages')
            .select('*')
            .eq('birthday_person', birthdayPerson)
            .order('created_at', { ascending: false })
            .limit(1);
            
        if (error) throw error;
        return data && data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error('メッセージ取得エラー:', error);
        return null;
    }
}

/**
 * 音声データをSupabase Storageに保存
 * @param {Blob} audioBlob 音声データ
 * @param {string} sender 送信者
 * @param {string} birthdayPerson 受信者
 * @returns {Promise<boolean>} 保存結果
 */
async function saveAudioMessageToSupabase(audioBlob, sender, birthdayPerson) {
    try {
        // ユニークなファイル名を作成
        const fileName = `audio_${Date.now()}.webm`;
        
        // 音声ファイルをアップロード
        const { data: fileData, error: fileError } = await supabase
            .storage
            .from('audio')
            .upload(fileName, audioBlob);
            
        if (fileError) throw fileError;
        
        // 公開URLを取得
        const { data: urlData } = await supabase
            .storage
            .from('audio')
            .getPublicUrl(fileName);
            
        const audioUrl = urlData.publicUrl;
        
        // データベースに情報を保存
        const { data, error } = await supabase
            .from('audio_messages')
            .insert([
                { 
                    sender: sender,
                    audio_data: audioUrl,
                    birthday_person: birthdayPerson
                }
            ]);
            
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('音声メッセージ保存エラー:', error);
        return false;
    }
}

/**
 * 音声メッセージリストを取得
 * @param {string} birthdayPerson 受信者
 * @returns {Promise<Array>} 音声メッセージリスト
 */
async function getAudioMessages(birthdayPerson) {
    try {
        const { data, error } = await supabase
            .from('audio_messages')
            .select('*')
            .eq('birthday_person', birthdayPerson)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('音声メッセージ取得エラー:', error);
        return [];
    }
}

/**
 * 動画データをSupabase Storageに保存
 * @param {Blob} videoBlob 動画データ
 * @param {string} videoName 動画名
 * @param {string} sender 送信者
 * @param {string} birthdayPerson 受信者
 * @returns {Promise<boolean>} 保存結果
 */
async function saveVideoMessageToSupabase(videoBlob, videoName, sender, birthdayPerson) {
    try {
        // 動画サイズを確認
        if (videoBlob.size > 10 * 1024 * 1024) { // 10MB制限
            throw new Error('動画が大きすぎます。サイズまたは長さを減らしてください。');
        }
        
        // ユニークなファイル名を作成
        const fileName = `video_${Date.now()}.webm`;
        
        // 動画ファイルをアップロード
        const { data: fileData, error: fileError } = await supabase
            .storage
            .from('video')
            .upload(fileName, videoBlob);
            
        if (fileError) throw fileError;
        
        // 公開URLを取得
        const { data: urlData } = await supabase
            .storage
            .from('video')
            .getPublicUrl(fileName);
            
        const videoUrl = urlData.publicUrl;
        
        // データベースに情報を保存
        const { data, error } = await supabase
            .from('video_messages')
            .insert([
                { 
                    sender: sender,
                    video_name: videoName,
                    video_url: videoUrl,
                    birthday_person: birthdayPerson
                }
            ]);
            
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('動画メッセージ保存エラー:', error);
        alert('動画保存エラー: ' + error.message);
        return false;
    }
}

/**
 * 動画メッセージリストを取得
 * @param {string} birthdayPerson 受信者
 * @returns {Promise<Array>} 動画リスト
 */
async function getVideoMessages(birthdayPerson) {
    try {
        const { data, error } = await supabase
            .from('video_messages')
            .select('*')
            .eq('birthday_person', birthdayPerson)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('動画メッセージ取得エラー:', error);
        return [];
    }
}









