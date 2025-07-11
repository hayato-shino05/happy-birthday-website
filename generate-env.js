// Script tạo file env.js từ biến môi trường Vercel
const fs = require('fs');

// Lấy các biến môi trường từ Vercel hoặc sử dụng giá trị rỗng nếu không có
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// Nội dung file env.js
const envContent = `
// Tệp này được tạo tự động bởi generate-env.js
// KHÔNG CHỈNH SỬA THỦ CÔNG - các thay đổi sẽ bị ghi đè
window.env = window.env || {};
window.env.SUPABASE_URL = "${SUPABASE_URL}";
window.env.SUPABASE_ANON_KEY = "${SUPABASE_ANON_KEY}";
`;

// Ghi file env.js
try {
  fs.writeFileSync('env.js', envContent);
  console.log('Đã tạo file env.js thành công');
} catch (error) {
  console.error('Lỗi khi tạo file env.js:', error);
  process.exit(1);
} 