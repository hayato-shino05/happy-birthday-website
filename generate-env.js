const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_URL_MEDIA = process.env.SUPABASE_URL_MEDIA || '';

const envContent = `window.env = window.env || {};
window.env.SUPABASE_URL = "${SUPABASE_URL}";
window.env.SUPABASE_ANON_KEY = "${SUPABASE_ANON_KEY}";
window.env.SUPABASE_URL_MEDIA = "${SUPABASE_URL_MEDIA}";
`;

try {
  fs.writeFileSync('env.js', envContent);
  console.log('Đã tạo file env.js thành công');
} catch (error) {
  console.error('Lỗi khi tạo file env.js:', error);
  process.exit(1);
}