# 🔤 HƯỚNG DẪN SETUP FONTS CHO CERTIFICATE GENERATION

## ⚠️ Vấn Đề

Satori (thư viện tạo ảnh) yêu cầu **TTF/OTF fonts**, không hỗ trợ WOFF2. Fonts được load từ CDN (jsDelivr) khi có internet.

## ✅ Giải Pháp 1: Sử Dụng CDN (Mặc Định)

Code sẽ tự động load fonts từ jsDelivr CDN. Chỉ cần có internet connection.

**Fonts được thử theo thứ tự:**
1. Inter (từ jsDelivr)
2. Roboto (từ jsDelivr)
3. Open Sans (từ jsDelivr)
4. Noto Sans (từ jsDelivr)

## 🔧 Giải Pháp 2: Sử Dụng Local Fonts (Offline)

Nếu không có internet hoặc muốn dùng fonts riêng:

### Bước 1: Download Font TTF

Tải một font TTF từ:
- Google Fonts: https://fonts.google.com/ (chọn TTF format)
- Hoặc từ: https://github.com/google/fonts

**Fonts được khuyến nghị:**
- Inter: https://fonts.google.com/specimen/Inter
- Roboto: https://fonts.google.com/specimen/Roboto
- Open Sans: https://fonts.google.com/specimen/Open+Sans

### Bước 2: Đặt Font Vào Project

1. Tạo thư mục `public/fonts/` (nếu chưa có)
2. Đặt file font TTF vào đó, ví dụ: `public/fonts/Inter-Regular.ttf`

### Bước 3: Update Code

Cập nhật `lib/utils/font-loader.ts` để load từ local:

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

export async function loadFontForSatori(): Promise<{
  name: string;
  data: ArrayBuffer;
  weight?: number;
  style?: string;
}> {
  try {
    // Try to load from local file first
    const fontPath = join(process.cwd(), 'public', 'fonts', 'Inter-Regular.ttf');
    const fontData = readFileSync(fontPath);
    
    return {
      name: 'Inter',
      data: fontData.buffer,
      weight: 400,
      style: 'normal',
    };
  } catch (error) {
    // Fallback to CDN...
    // (existing CDN code)
  }
}
```

## 🧪 Test Font Loading

### Test CDN Connection

```bash
# Test jsDelivr CDN
curl https://cdn.jsdelivr.net/gh/rsms/inter@latest/docs/font-files/Inter-Regular.ttf --output test-font.ttf

# Check if it's a valid TTF
file test-font.ttf
# Should show: "TrueType font data"
```

### Test Local Font

```bash
# Check if font file exists
ls -lh public/fonts/Inter-Regular.ttf

# Verify it's TTF
file public/fonts/Inter-Regular.ttf
```

## 🐛 Troubleshooting

### Lỗi: "Failed to load fonts from CDN"

**Nguyên nhân:**
- Không có internet
- CDN bị block
- Firewall/proxy issues

**Giải pháp:**
1. Check internet connection
2. Thử dùng VPN nếu CDN bị block
3. Hoặc setup local fonts (xem Giải Pháp 2)

### Lỗi: "Unsupported OpenType signature wOF2"

**Nguyên nhân:**
- Code đang cố load WOFF2 thay vì TTF

**Giải pháp:**
- ✅ Đã fix trong code mới
- Đảm bảo đang dùng `loadFontForSatori()` từ `font-loader.ts`

### Lỗi: "Font data is empty"

**Nguyên nhân:**
- CDN trả về empty response
- File font bị corrupt

**Giải pháp:**
- Thử font khác
- Check network connection
- Verify font file integrity

## 📝 Quick Fix (Temporary)

Nếu cần test ngay mà không có internet, có thể comment out font requirement tạm thời:

```typescript
// In certificate-generator.ts
fonts: [], // Temporarily disable fonts
```

⚠️ **Lưu ý**: Ảnh sẽ không đẹp vì không có fonts, nhưng sẽ chạy được.

## ✅ Best Practice

1. **Development**: Dùng CDN fonts (mặc định)
2. **Production**: 
   - Option 1: Dùng CDN (nhanh, không cần storage)
   - Option 2: Embed fonts vào project (offline, nhưng tăng bundle size)
   - Option 3: Load fonts từ CDN với cache headers tốt

---

**Nếu vẫn gặp vấn đề, check console logs để xem font nào đang được load và lỗi cụ thể.**

