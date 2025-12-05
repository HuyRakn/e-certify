# 🧪 HƯỚNG DẪN TEST TUẦN 2

## 📋 Test Checklist

### 1. Unit Tests

#### Test Image Generation
```bash
# Run test script
npx ts-node scripts/test-tuan2.ts
```

**Expected Results:**
- ✅ Image generation works
- ✅ Generated buffer is valid PNG
- ✅ Buffer size > 0

#### Test Metadata Building
**Expected Results:**
- ✅ Metadata structure valid
- ✅ All required fields present
- ✅ Attributes array correct

#### Test Full Flow
**Expected Results:**
- ✅ Image generated
- ✅ Image uploaded to Arweave
- ✅ Metadata built correctly
- ✅ Metadata uploaded to Arweave
- ✅ URLs accessible

---

### 2. Integration Tests

#### Test Image Generation API
```bash
# Start dev server
npm run dev

# Test GET endpoint
curl "http://localhost:3000/api/certificate/image?name=John%20Doe&major=Computer%20Science&issueDate=2024-01-15" --output test-certificate.png

# Verify image
# Open test-certificate.png in image viewer
```

**Expected Results:**
- ✅ API returns PNG image
- ✅ Image contains student name
- ✅ Image contains major
- ✅ Image contains issue date
- ✅ Image design matches template

#### Test POST Endpoint
```bash
curl -X POST http://localhost:3000/api/certificate/image \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@test.com",
    "major": "Business",
    "issueDate": "2024-01-15"
  }' \
  --output test-certificate-post.png
```

---

### 3. End-to-End Test

#### Test Batch Minting với CSV

1. **Tạo CSV file test** (`test-students.csv`):
```csv
student_email,student_name,major,issue_date,wallet
alice@test.com,Alice Nguyen,Computer Science,2024-01-15,<WALLET_ADDRESS_1>
bob@test.com,Bob Tran,Business,2024-01-15,<WALLET_ADDRESS_2>
```

2. **Mở Admin Certify Page**:
   - Navigate to `/admin/certify`
   - Enter Collection Mint và Merkle Tree addresses
   - Upload CSV file

3. **Verify Processing**:
   - ✅ CSV parsed correctly
   - ✅ Progress bar shows progress
   - ✅ Student statuses update in real-time
   - ✅ Images generated for each student
   - ✅ Images uploaded to Arweave
   - ✅ Metadata uploaded to Arweave
   - ✅ Credentials minted successfully

4. **Verify Results**:
   - ✅ Transaction signatures returned
   - ✅ Arweave URLs accessible
   - ✅ Metadata URLs accessible
   - ✅ Credentials visible on Solana Explorer

---

### 4. Performance Tests

#### Test Batch Size
- Test với 5, 10, 20 students
- Monitor processing time
- Verify không bị timeout
- Verify memory usage hợp lý

#### Test Parallel Processing
- Verify Promise.all hoạt động đúng
- Verify không có race conditions
- Verify error handling cho từng student

---

### 5. Verification trên Blockchain

#### Verify Metadata URLs
1. Copy metadata URL từ mint result
2. Open trong browser: `https://arweave.net/<txId>`
3. Verify JSON structure đúng Metaplex standard
4. Verify image URL trong metadata

#### Verify Image URLs
1. Copy image URL từ mint result
2. Open trong browser: `https://arweave.net/<txId>`
3. Verify image hiển thị đúng
4. Verify image quality và content

#### Verify on Solana Explorer
1. Copy transaction signature
2. Open: `https://explorer.solana.com/tx/<signature>?cluster=devnet`
3. Verify transaction thành công
4. Verify metadata URI trỏ đến Arweave

---

## 🐛 Troubleshooting

### Lỗi: "PAYER_SECRET_KEY not found"
**Giải pháp:** Đảm bảo `.env.local` có `PAYER_SECRET_KEY`

### Lỗi: "Image generation failed"
**Giải pháp:**
- Kiểm tra satori và sharp đã cài đặt
- Kiểm tra fonts có load được không
- Xem error message chi tiết

### Lỗi: "Irys upload failed"
**Giải pháp:**
- Kiểm tra Irys balance (có thể cần fund)
- Kiểm tra network connection
- Verify Irys URL đúng (devnet.irys.xyz)

### Lỗi: "Metadata validation failed"
**Giải pháp:**
- Kiểm tra metadata structure
- Verify tất cả required fields có
- Check attributes array format

### Arweave URLs không accessible
**Giải pháp:**
- Đợi vài phút (Arweave cần time để propagate)
- Verify transaction ID đúng
- Check network connection

---

## ✅ Test Results Template

```
Date: _______________
Tester: _______________

✅ Image Generation: PASS / FAIL
✅ Metadata Building: PASS / FAIL
✅ Full Flow: PASS / FAIL
✅ API Endpoints: PASS / FAIL
✅ Batch Processing: PASS / FAIL
✅ Arweave URLs: PASS / FAIL
✅ On-chain Verification: PASS / FAIL

Issues Found:
- _______________________________
- _______________________________

Performance:
- Batch size tested: ___
- Processing time: ___ seconds
- Memory usage: ___ MB

Notes:
- _______________________________
```

