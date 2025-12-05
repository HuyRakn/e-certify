# ⚡ HƯỚNG DẪN TEST NHANH

## ⚠️ QUAN TRỌNG: Setup Font Trước Khi Test

Certificate generation **CẦN font TTF** để hoạt động. 

**Nếu chưa setup font → Xem: `SETUP_FONT_STEP_BY_STEP.md`**

Quick setup:
1. Tạo folder: `public/fonts/`
2. Download Inter font từ: https://fonts.google.com/specimen/Inter
3. Copy `Inter-Regular.ttf` vào `public/fonts/Inter-Regular.ttf`
4. Restart server

---

## ✅ Test Image Generation API

### Cách 1: Test qua Browser
1. Mở browser và vào URL:
```
http://localhost:3000/api/certificate/image?name=Nguyen%20Van%20A&major=Computer%20Science&issueDate=2024-01-15
```

2. **Kết quả mong đợi**:
   - ✅ Browser hiển thị ảnh PNG (không phải JSON error)
   - ✅ Ảnh có gradient background màu tím/xanh
   - ✅ Ảnh có text: "APEC UNIVERSITY", tên sinh viên, ngành học, ngày cấp

### Cách 2: Test qua Terminal (curl)
```bash
curl "http://localhost:3000/api/certificate/image?name=Nguyen%20Van%20A&major=Computer%20Science&issueDate=2024-01-15" --output test-certificate.png
```

Sau đó mở file `test-certificate.png` để xem.

### Cách 3: Test với POST Request
```bash
curl -X POST http://localhost:3000/api/certificate/image \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyen Van A",
    "major": "Computer Science",
    "issueDate": "2024-01-15"
  }' \
  --output certificate.png
```

---

## 🔍 Kiểm Tra Lỗi

### Nếu vẫn gặp lỗi "No fonts are loaded":

1. **Check Internet Connection**:
   - Fonts được tải từ Google Fonts
   - Cần có internet để load fonts

2. **Check Console Logs**:
   - Mở DevTools (F12)
   - Xem tab Console để thấy error chi tiết

3. **Check Server Logs**:
   - Xem terminal nơi chạy `npm run dev`
   - Tìm error messages

### Nếu lỗi khác:

**Lỗi: "Failed to fetch font"**
- ✅ Đã fix: Code sẽ tự động fallback sang Roboto font
- Nếu vẫn lỗi: Check internet connection

**Lỗi: "sharp module not found"**
```bash
npm install sharp
```

**Lỗi: "satori module not found"**
```bash
npm install satori
```

---

## ✅ Checklist Test Thành Công

- [ ] Server chạy trên localhost:3000
- [ ] API endpoint trả về ảnh PNG (không phải JSON error)
- [ ] Ảnh có đầy đủ thông tin:
  - [ ] Header: "APEC UNIVERSITY"
  - [ ] Tên sinh viên
  - [ ] Ngành học
  - [ ] Ngày cấp
- [ ] Ảnh có gradient background đẹp
- [ ] Không có lỗi trong console

---

## 🎯 Test Cases

### Test Case 1: Basic Test
```
URL: http://localhost:3000/api/certificate/image?name=Test&major=CS&issueDate=2024-01-15
Expected: ✅ Ảnh PNG hiển thị
```

### Test Case 2: Vietnamese Characters
```
URL: http://localhost:3000/api/certificate/image?name=Nguyễn%20Văn%20A&major=Khoa%20Học%20Máy%20Tính&issueDate=2024-01-15
Expected: ✅ Ảnh PNG hiển thị với tiếng Việt
```

### Test Case 3: Long Name
```
URL: http://localhost:3000/api/certificate/image?name=Very%20Long%20Student%20Name%20Here&major=Computer%20Science&issueDate=2024-01-15
Expected: ✅ Ảnh PNG hiển thị, text không bị overflow
```

### Test Case 4: Missing Parameters
```
URL: http://localhost:3000/api/certificate/image
Expected: ✅ Ảnh PNG với default values
```

---

## 🐛 Troubleshooting

### Vấn đề: Fonts không load được

**Lỗi phổ biến**: "Unsupported OpenType signature wOF2"
- ✅ **Đã fix**: Code đã được update để load TTF fonts thay vì WOFF2
- Satori chỉ hỗ trợ TTF/OTF, không hỗ trợ WOFF2

**Giải pháp 1**: Check internet connection
```bash
# Test GitHub fonts (TTF)
curl https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.ttf
```

**Giải pháp 2**: Sử dụng local fonts (nếu cần offline)
- Download font Inter từ Google Fonts
- Đặt vào `public/fonts/Inter-Regular.ttf`
- Update `loadFont()` function để load từ local file

**Giải pháp 3**: Download font tự động
```bash
npm run download-font
```
Hoặc:
```bash
node scripts/download-font.js
```

Script sẽ tự động download Inter font và đặt vào `public/fonts/Inter-Regular.ttf`

**Giải pháp 4**: Download font thủ công
1. Vào: https://fonts.google.com/specimen/Inter
2. Download Inter-Regular.ttf
3. Đặt vào: `public/fonts/Inter-Regular.ttf`
4. Restart server

---

## 📊 Expected Output

Khi test thành công, bạn sẽ thấy:

1. **Browser**: Ảnh PNG hiển thị trực tiếp
2. **Terminal**: File PNG được download
3. **Console**: Logs như:
   ```
   Generating certificate image for: { name: 'Nguyen Van A', major: 'Computer Science' }
   Certificate image generated successfully, size: 123456 bytes
   ```

---

## ✅ Success Indicators

- ✅ URL trả về ảnh PNG (Content-Type: image/png)
- ✅ Ảnh có kích thước hợp lý (~100-500KB)
- ✅ Ảnh có đầy đủ thông tin
- ✅ Không có error trong console
- ✅ Response time < 3 giây

---

**Nếu tất cả test cases pass → Image Generation API hoạt động tốt! 🎉**

