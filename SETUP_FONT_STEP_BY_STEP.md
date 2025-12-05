# 🔤 HƯỚNG DẪN SETUP FONT - TỪNG BƯỚC

## ⚠️ Vấn Đề Hiện Tại

Certificate generation cần font TTF để hoạt động. CDN không hoạt động nên cần download thủ công.

## ✅ GIẢI PHÁP: Download Font Thủ Công (5 phút)

### Bước 1: Tạo Thư Mục Fonts

```bash
# Windows PowerShell
mkdir public\fonts

# Hoặc tạo thủ công:
# Tạo folder "fonts" trong folder "public"
```

### Bước 2: Download Font Inter

**Cách 1: Từ Google Fonts (Khuyến nghị)**

1. Mở browser và vào: **https://fonts.google.com/specimen/Inter**
2. Click nút **"Download family"** (góc trên bên phải)
3. File ZIP sẽ được download
4. Giải nén file ZIP
5. Tìm file: `Inter-Regular.ttf` (trong thư mục `static`)
6. Copy file `Inter-Regular.ttf` vào: `public/fonts/Inter-Regular.ttf`

**Cách 2: Direct Download Link**

Nếu Google Fonts không hoạt động, thử:
- https://github.com/rsms/inter/releases (tìm file TTF)
- Hoặc search "Inter font TTF download" trên Google

### Bước 3: Verify Font File

Đảm bảo:
- ✅ File name: `Inter-Regular.ttf` (chính xác)
- ✅ Location: `public/fonts/Inter-Regular.ttf`
- ✅ File size: ~150-200 KB (không phải 0 bytes)

### Bước 4: Restart Server

```bash
# Dừng server (Ctrl+C)
# Rồi chạy lại
npm run dev
```

### Bước 5: Test

Mở browser:
```
http://localhost:3000/api/certificate/image?name=Test&major=CS&issueDate=2024-01-15
```

**Kết quả mong đợi:**
- ✅ Browser hiển thị ảnh PNG (không phải JSON error)
- ✅ Console log: "📁 Loading local font: ..."
- ✅ Ảnh có text đẹp với font Inter

---

## 🔍 Kiểm Tra

### Check Font File Exists

```bash
# Windows PowerShell
dir public\fonts\Inter-Regular.ttf

# Hoặc check trong File Explorer:
# public/fonts/Inter-Regular.ttf
```

### Check Console Logs

Khi test API, bạn sẽ thấy trong terminal:
```
📁 Loading local font: C:\...\public\fonts\Inter-Regular.ttf
✅ Local font loaded: Inter, size: XXXXX bytes
Generating certificate image for: { name: 'Test', major: 'CS' }
Certificate image generated successfully, size: XXXXX bytes
```

---

## 🐛 Troubleshooting

### Lỗi: "Font file not found"

**Giải pháp:**
- Check đường dẫn: `public/fonts/Inter-Regular.ttf`
- Check tên file: phải là `Inter-Regular.ttf` (chính xác)
- Check file có tồn tại không

### Lỗi: "Font data is empty"

**Giải pháp:**
- File có thể bị corrupt
- Download lại font từ Google Fonts
- Check file size (phải > 100 KB)

### Lỗi: "Not a valid TTF file"

**Giải pháp:**
- Đảm bảo download đúng file TTF (không phải WOFF2)
- File extension phải là `.ttf`
- Thử download từ nguồn khác

---

## 📝 Alternative Fonts

Nếu không tìm được Inter, có thể dùng:

1. **Roboto**:
   - Download: https://fonts.google.com/specimen/Roboto
   - Đặt vào: `public/fonts/Roboto-Regular.ttf`

2. **Open Sans**:
   - Download: https://fonts.google.com/specimen/Open+Sans
   - Đặt vào: `public/fonts/OpenSans-Regular.ttf`

Code sẽ tự động detect và sử dụng font nào có sẵn.

---

## ✅ Checklist

- [ ] Đã tạo folder `public/fonts/`
- [ ] Đã download `Inter-Regular.ttf`
- [ ] Đã copy vào `public/fonts/Inter-Regular.ttf`
- [ ] File size > 100 KB
- [ ] Đã restart server
- [ ] Test API thành công

---

**Sau khi hoàn thành → Certificate generation sẽ hoạt động! 🎉**

