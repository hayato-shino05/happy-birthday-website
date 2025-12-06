# 🗄️ Database Schema

> Complete database documentation for Happy Birthday Website using Supabase (PostgreSQL)

---

## Overview

The application uses **Supabase** as the backend with:
- PostgreSQL database
- Real-time subscriptions
- Storage for media files
- Row Level Security (RLS)

---

## Tables

### `birthdays`

Stores birthday person information.

```sql
CREATE TABLE birthdays (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
  year INTEGER,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_birthdays_month_day ON birthdays(month, day);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `name` | VARCHAR(255) | Birthday person's name |
| `month` | INTEGER | Birth month (1-12) |
| `day` | INTEGER | Birth day (1-31) |
| `year` | INTEGER | Birth year (optional) |
| `message` | TEXT | Custom message |
| `created_at` | TIMESTAMPTZ | Creation time |
| `updated_at` | TIMESTAMPTZ | Last update |

---

### `custom_messages`

Birthday messages from visitors.

```sql
CREATE TABLE custom_messages (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  birthday_person VARCHAR(255),
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_birthday_person ON custom_messages(birthday_person);
CREATE INDEX idx_messages_created_at ON custom_messages(created_at DESC);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `sender` | VARCHAR(255) | Sender's name |
| `message` | TEXT | Message content (max 1000 chars) |
| `birthday_person` | VARCHAR(255) | Target birthday person |
| `media_url` | TEXT | Attached media URL |
| `created_at` | TIMESTAMPTZ | Creation time |

---

### `media_files`

Uploaded photos and videos.

```sql
CREATE TABLE media_files (
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

CREATE INDEX idx_media_file_type ON media_files(file_type);
CREATE INDEX idx_media_tags ON media_files USING GIN(tags);
CREATE INDEX idx_media_created_at ON media_files(created_at DESC);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `file_name` | VARCHAR(255) | Original filename |
| `file_path` | TEXT | Storage URL |
| `file_type` | VARCHAR(50) | 'image' or 'video' |
| `file_size` | INTEGER | Size in bytes |
| `width` | INTEGER | Image/video width |
| `height` | INTEGER | Image/video height |
| `duration` | INTEGER | Video duration (seconds) |
| `thumbnail_url` | TEXT | Video thumbnail |
| `tags` | TEXT[] | Array of tags |
| `description` | TEXT | File description |
| `uploaded_by` | VARCHAR(255) | Uploader name |
| `created_at` | TIMESTAMPTZ | Upload time |

---

### `virtual_gifts`

Virtual gifts sent to birthday person.

```sql
CREATE TABLE virtual_gifts (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  gift_emoji VARCHAR(10) NOT NULL,
  gift_name VARCHAR(100) NOT NULL,
  birthday_person VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gifts_birthday_person ON virtual_gifts(birthday_person);
CREATE INDEX idx_gifts_created_at ON virtual_gifts(created_at DESC);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `sender` | VARCHAR(255) | Sender's name |
| `gift_emoji` | VARCHAR(10) | Gift emoji |
| `gift_name` | VARCHAR(100) | Gift name |
| `birthday_person` | VARCHAR(255) | Recipient |
| `created_at` | TIMESTAMPTZ | Send time |

**Available Gifts:**
| Emoji | Name |
|-------|------|
| 🎂 | Birthday Cake |
| 💐 | Flowers |
| 🎈 | Balloons |
| 🎁 | Gift Box |
| 🎊 | Confetti |
| 🎉 | Party Hat |
| 🧸 | Teddy Bear |
| 💝 | Heart Gift |

---

### `audio_messages`

Voice messages.

```sql
CREATE TABLE audio_messages (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  audio_url TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  birthday_person VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audio_birthday_person ON audio_messages(birthday_person);
CREATE INDEX idx_audio_created_at ON audio_messages(created_at DESC);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `sender` | VARCHAR(255) | Sender's name |
| `audio_url` | TEXT | Audio file URL (stored in Supabase Storage) |
| `duration` | INTEGER | Duration in seconds |
| `birthday_person` | VARCHAR(255) | Recipient |
| `created_at` | TIMESTAMPTZ | Creation time |

---

### `video_messages`

Video messages.

```sql
CREATE TABLE video_messages (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER DEFAULT 0,
  birthday_person VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_video_birthday_person ON video_messages(birthday_person);
CREATE INDEX idx_video_created_at ON video_messages(created_at DESC);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `sender` | VARCHAR(255) | Sender's name |
| `video_url` | TEXT | Video file URL (stored in Supabase Storage) |
| `thumbnail_url` | TEXT | Thumbnail URL |
| `duration` | INTEGER | Duration in seconds |
| `birthday_person` | VARCHAR(255) | Recipient |
| `created_at` | TIMESTAMPTZ | Creation time |

---

### `bulletin_posts`

Social media style posts.

```sql
CREATE TABLE bulletin_posts (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes INTEGER DEFAULT 0,
  birthday_person VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_created_at ON bulletin_posts(created_at DESC);
CREATE INDEX idx_posts_likes ON bulletin_posts(likes DESC);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `author` | VARCHAR(255) | Post author |
| `content` | TEXT | Post content |
| `image_url` | TEXT | Attached image |
| `likes` | INTEGER | Like count |
| `birthday_person` | VARCHAR(255) | Target person |
| `created_at` | TIMESTAMPTZ | Post time |

---

### `bulletin_replies`

Replies to bulletin posts.

```sql
CREATE TABLE bulletin_replies (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES bulletin_posts(id) ON DELETE CASCADE,
  author VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_replies_post_id ON bulletin_replies(post_id);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `post_id` | INTEGER | Parent post ID |
| `author` | VARCHAR(255) | Reply author |
| `content` | TEXT | Reply content |
| `created_at` | TIMESTAMPTZ | Reply time |

---

## Storage Buckets

### `media`

Main storage bucket for all uploads.

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true);

-- Storage policy (public read)
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- Upload policy (authenticated or anon)
CREATE POLICY "Upload Access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media');
```

**File Organization:**
```
media/
├── uploads/           # General uploads
├── photos/            # Gallery photos
├── videos/            # Video files
├── audio/             # Audio recordings
└── thumbnails/        # Video thumbnails
```

**Supported File Types:**
| Type | Extensions | Max Size |
|------|------------|----------|
| Images | jpg, png, gif, webp | 50MB |
| Videos | mp4, webm, ogg | 50MB |
| Audio | mp3, wav, ogg | 20MB |

---

## API Endpoints

### Birthdays

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/birthdays` | List all birthdays |
| POST | `/api/birthdays` | Create birthday |
| GET | `/api/birthdays/[id]` | Get by ID |
| PUT | `/api/birthdays/[id]` | Update birthday |
| DELETE | `/api/birthdays/[id]` | Delete birthday |
| GET | `/api/birthdays/check` | Check today's birthday |
| GET | `/api/birthdays/next` | Get next birthday |

**Query Parameters:**
- `month` - Filter by month
- `limit` - Limit results
- `orderBy` - Sort field
- `order` - asc/desc

---

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages` | List messages |
| POST | `/api/messages` | Create message |
| GET | `/api/messages/[id]` | Get by ID |
| DELETE | `/api/messages/[id]` | Delete message |
| GET | `/api/messages/latest` | Get latest |

**Query Parameters:**
- `birthdayPerson` - Filter by recipient
- `limit` - Limit results
- `offset` - Pagination offset

---

### Media

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/media` | List media files |
| GET | `/api/media/[id]` | Get by ID |
| DELETE | `/api/media/[id]` | Delete file |
| GET | `/api/media/tags` | Get all tags |
| POST | `/api/upload` | Upload file |

**Query Parameters:**
- `type` - 'image' or 'video'
- `tag` - Filter by tag
- `search` - Search filename/description
- `limit` - Limit results

---

### Gifts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gifts` | List gifts |
| POST | `/api/gifts` | Send gift |
| GET | `/api/gifts/[id]` | Get by ID |
| DELETE | `/api/gifts/[id]` | Delete gift |

---

### Audio Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audio` | List audio messages |
| POST | `/api/audio` | Create audio message record |

**Query Parameters:**
- `birthdayPerson` - Filter by recipient
- `limit` - Limit results

---

### Video Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/video` | List video messages |
| POST | `/api/video` | Create video message record |

**Query Parameters:**
- `birthdayPerson` - Filter by recipient
- `limit` - Limit results

---

### File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload file to Supabase Storage |

**Request Body:** `multipart/form-data` with `file` field

**Response:**
```json
{
  "success": true,
  "data": { /* media_file record */ },
  "url": "https://..."
}
```

---

## Real-time Subscriptions

Enable real-time for tables:

```sql
-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE custom_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE bulletin_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE bulletin_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE virtual_gifts;
```

**Client Usage:**
```typescript
const subscription = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'custom_messages'
  }, (payload) => {
    // Handle real-time update
  })
  .subscribe()
```

---

## Row Level Security

```sql
-- Enable RLS
ALTER TABLE birthdays ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulletin_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulletin_replies ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read" ON birthdays FOR SELECT USING (true);
CREATE POLICY "Public read" ON custom_messages FOR SELECT USING (true);
CREATE POLICY "Public read" ON media_files FOR SELECT USING (true);
CREATE POLICY "Public read" ON virtual_gifts FOR SELECT USING (true);
CREATE POLICY "Public read" ON bulletin_posts FOR SELECT USING (true);
CREATE POLICY "Public read" ON bulletin_replies FOR SELECT USING (true);

-- Public insert access
CREATE POLICY "Public insert" ON custom_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON media_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON virtual_gifts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON bulletin_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON bulletin_replies FOR INSERT WITH CHECK (true);
```

---

## Database Functions

### Get Next Birthday

```sql
CREATE OR REPLACE FUNCTION get_next_birthday()
RETURNS TABLE (
  id INTEGER,
  name VARCHAR,
  month INTEGER,
  day INTEGER,
  days_until INTEGER
) AS $$
DECLARE
  today_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
  today_day INTEGER := EXTRACT(DAY FROM CURRENT_DATE);
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.month,
    b.day,
    CASE 
      WHEN b.month > today_month OR (b.month = today_month AND b.day >= today_day)
      THEN (b.month - today_month) * 30 + (b.day - today_day)
      ELSE (12 - today_month + b.month) * 30 + (b.day - today_day)
    END AS days_until
  FROM birthdays b
  ORDER BY days_until ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
```

### Increment Post Likes

```sql
CREATE OR REPLACE FUNCTION increment_likes(post_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_likes INTEGER;
BEGIN
  UPDATE bulletin_posts 
  SET likes = likes + 1 
  WHERE id = post_id
  RETURNING likes INTO new_likes;
  
  RETURN new_likes;
END;
$$ LANGUAGE plpgsql;
```

---

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy URL and anon key

### 2. Run Migrations

Execute SQL scripts in Supabase SQL Editor:

1. Create tables (in order)
2. Create indexes
3. Enable RLS
4. Create policies
5. Create functions
6. Create storage bucket

### 3. Configure Environment

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Entity Relationship Diagram

```
┌─────────────┐     ┌──────────────────┐
│  birthdays  │     │  custom_messages │
├─────────────┤     ├──────────────────┤
│ id          │     │ id               │
│ name        │◄────│ birthday_person  │
│ month       │     │ sender           │
│ day         │     │ message          │
│ year        │     │ media_url        │
│ message     │     │ created_at       │
└─────────────┘     └──────────────────┘
       │
       │            ┌──────────────────┐
       │            │  virtual_gifts   │
       │            ├──────────────────┤
       └───────────►│ birthday_person  │
                    │ sender           │
                    │ gift_emoji       │
                    │ gift_name        │
                    └──────────────────┘

┌─────────────────┐     ┌───────────────────┐
│ bulletin_posts  │     │ bulletin_replies  │
├─────────────────┤     ├───────────────────┤
│ id              │◄────│ post_id           │
│ author          │     │ author            │
│ content         │     │ content           │
│ image_url       │     │ created_at        │
│ likes           │     └───────────────────┘
│ created_at      │
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│  media_files    │     │ audio_messages  │
├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │
│ file_name       │     │ sender          │
│ file_path       │     │ audio_url       │
│ file_type       │     │ duration        │
│ tags[]          │     │ birthday_person │
└─────────────────┘     └─────────────────┘
```
