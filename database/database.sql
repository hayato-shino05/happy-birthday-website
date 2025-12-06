-- ============================================
-- Happy Birthday Website 用データベーススキーマ
-- Supabase PostgreSQL
-- ============================================

-- ============================================
-- 1. テーブル
-- ============================================

-- 誕生日テーブル
CREATE TABLE IF NOT EXISTS birthdays (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
  year INTEGER,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- カスタムメッセージ用テーブル
CREATE TABLE IF NOT EXISTS custom_messages (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  birthday_person VARCHAR(255),
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- メディアファイルテーブル
CREATE TABLE IF NOT EXISTS media_files (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('image', 'video')),
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  thumbnail_url TEXT,
  tags TEXT[],
  description TEXT,
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- バーチャルギフトテーブル
CREATE TABLE IF NOT EXISTS virtual_gifts (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  gift_emoji VARCHAR(10) NOT NULL,
  gift_name VARCHAR(100) NOT NULL,
  birthday_person VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 音声メッセージテーブル
CREATE TABLE IF NOT EXISTS audio_messages (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  audio_url TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  birthday_person VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 動画メッセージテーブル
CREATE TABLE IF NOT EXISTS video_messages (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER DEFAULT 0,
  birthday_person VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 掲示板投稿テーブル
CREATE TABLE IF NOT EXISTS bulletin_posts (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes INTEGER DEFAULT 0,
  birthday_person VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 掲示板返信テーブル
CREATE TABLE IF NOT EXISTS bulletin_replies (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES bulletin_posts(id) ON DELETE CASCADE,
  author VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. インデックス
-- ============================================

-- 誕生日テーブル用インデックス
CREATE INDEX IF NOT EXISTS idx_birthdays_month_day ON birthdays(month, day);

-- メッセージテーブル用インデックス
CREATE INDEX IF NOT EXISTS idx_messages_birthday_person ON custom_messages(birthday_person);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON custom_messages(created_at DESC);

-- メディアテーブル用インデックス
CREATE INDEX IF NOT EXISTS idx_media_file_type ON media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_tags ON media_files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media_files(created_at DESC);

-- ギフトテーブル用インデックス
CREATE INDEX IF NOT EXISTS idx_gifts_birthday_person ON virtual_gifts(birthday_person);
CREATE INDEX IF NOT EXISTS idx_gifts_created_at ON virtual_gifts(created_at DESC);

-- 音声メッセージテーブル用インデックス
CREATE INDEX IF NOT EXISTS idx_audio_birthday_person ON audio_messages(birthday_person);

-- 動画メッセージテーブル用インデックス
CREATE INDEX IF NOT EXISTS idx_video_birthday_person ON video_messages(birthday_person);

-- 掲示板投稿テーブル用インデックス
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON bulletin_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_likes ON bulletin_posts(likes DESC);

-- 掲示板返信テーブル用インデックス
CREATE INDEX IF NOT EXISTS idx_replies_post_id ON bulletin_replies(post_id);

-- ============================================
-- 3. 行レベルセキュリティ（RLS）
-- ============================================

-- すべてのテーブルで RLS を有効化
ALTER TABLE birthdays ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulletin_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulletin_replies ENABLE ROW LEVEL SECURITY;

-- 公開読み取りポリシー
CREATE POLICY "Public read birthdays" ON birthdays FOR SELECT USING (true);
CREATE POLICY "Public read messages" ON custom_messages FOR SELECT USING (true);
CREATE POLICY "Public read media" ON media_files FOR SELECT USING (true);
CREATE POLICY "Public read gifts" ON virtual_gifts FOR SELECT USING (true);
CREATE POLICY "Public read audio" ON audio_messages FOR SELECT USING (true);
CREATE POLICY "Public read video" ON video_messages FOR SELECT USING (true);
CREATE POLICY "Public read posts" ON bulletin_posts FOR SELECT USING (true);
CREATE POLICY "Public read replies" ON bulletin_replies FOR SELECT USING (true);

-- 公開挿入ポリシー
CREATE POLICY "Public insert messages" ON custom_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert media" ON media_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert gifts" ON virtual_gifts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert audio" ON audio_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert video" ON video_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert posts" ON bulletin_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert replies" ON bulletin_replies FOR INSERT WITH CHECK (true);

-- 公開更新ポリシー（いいね数用）
CREATE POLICY "Public update posts" ON bulletin_posts FOR UPDATE USING (true);

-- ============================================
-- 4. 関数
-- ============================================

-- updated_at を自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 用トリガー
CREATE TRIGGER update_birthdays_updated_at
  BEFORE UPDATE ON birthdays
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_files_updated_at
  BEFORE UPDATE ON media_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- likes をインクリメントする関数
CREATE OR REPLACE FUNCTION increment_post_likes(post_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_likes INTEGER;
BEGIN
  UPDATE bulletin_posts 
  SET likes = likes + 1 
  WHERE id = post_id_param
  RETURNING likes INTO new_likes;
  
  RETURN new_likes;
END;
$$ LANGUAGE plpgsql;

-- 返信数付きで投稿一覧を取得する関数
CREATE OR REPLACE FUNCTION get_posts_with_replies()
RETURNS TABLE (
  id INTEGER,
  author VARCHAR,
  content TEXT,
  image_url TEXT,
  likes INTEGER,
  birthday_person VARCHAR,
  created_at TIMESTAMPTZ,
  replies_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id,
    bp.author,
    bp.content,
    bp.image_url,
    bp.likes,
    bp.birthday_person,
    bp.created_at,
    COALESCE(COUNT(br.id), 0) as replies_count
  FROM bulletin_posts bp
  LEFT JOIN bulletin_replies br ON bp.id = br.post_id
  GROUP BY bp.id
  ORDER BY bp.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. ストレージバケット
-- ============================================

-- 注意: これらは Supabase Dashboard の Storage 画面で実行してください
-- もしくは Supabase CLI を使用してください

-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- ストレージ用ポリシー（SQL Editor で実行）
-- CREATE POLICY "Public read media storage" ON storage.objects
--   FOR SELECT USING (bucket_id = 'media');

-- CREATE POLICY "Public upload media storage" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'media');

-- CREATE POLICY "Public delete media storage" ON storage.objects
--   FOR DELETE USING (bucket_id = 'media');

-- ============================================
-- 6. リアルタイム
-- ============================================

-- 指定したテーブルで Realtime を有効化
ALTER PUBLICATION supabase_realtime ADD TABLE custom_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE bulletin_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE bulletin_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE virtual_gifts;

-- ============================================
-- 7. サンプルデータ（任意）
-- ============================================

-- 誕生日のサンプルデータ
-- INSERT INTO birthdays (name, month, day, year, message) VALUES
-- ('田中太郎', 3, 15, 1990, 'お誕生日おめでとう！'),
-- ('山田花子', 7, 22, 1995, 'Happy Birthday!');

-- ギフトのサンプル（参考用）
-- 利用可能なギフト例:
-- 🎂 バースデーケーキ
-- 💐 花束
-- 🎈 風船
-- 🎁 ギフトボックス
-- 🎊 紙吹雪
-- 🎉 パーティーハット
-- 🧸 テディベア
-- 💝 ハート型ギフト
