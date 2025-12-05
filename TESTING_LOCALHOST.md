# 🧪 HƯỚNG DẪN TEST TRÊN LOCALHOST:3000

## 🚀 BƯỚC 1: KHỞI ĐỘNG SERVER

```bash
# Cài đặt dependencies (nếu chưa có)
npm install

# Chạy development server
npm run dev
```

Server sẽ chạy tại: **http://localhost:3000**

---

## 📋 BƯỚC 2: CHUẨN BỊ TEST

### 2.1. Setup Environment Variables

Đảm bảo file `.env.local` có các biến sau:

```env
# Solana RPC
RPC_URL=https://api.devnet.solana.com
# hoặc
HELIUS_API_KEY_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY

# Wallet (cho Irys upload)
PAYER_SECRET_KEY=[...] # Secret key của wallet có SOL

# Collection & Merkle Tree
NEXT_PUBLIC_APEC_COLLECTION=YOUR_COLLECTION_MINT_ADDRESS
MERKLE_TREE=YOUR_MERKLE_TREE_ADDRESS

# Program ID (nếu đã deploy)
CREDIFY_PROGRAM_ID=YOUR_PROGRAM_ID
```

### 2.2. Chuẩn Bị Wallet

1. **Cài đặt Phantom Wallet**:
   - Tải từ: https://phantom.app/
   - Tạo wallet mới hoặc import wallet

2. **Lấy SOL Testnet**:
   - Vào: https://faucet.solana.com/
   - Nhập địa chỉ wallet
   - Request SOL (cần ít nhất 0.1 SOL để test)

---

## 🧪 BƯỚC 3: TEST CÁC TÍNH NĂNG

### Test 1: Image Generation API ✅

**Mục đích**: Test tạo ảnh chứng chỉ động

**Cách test**:
1. Mở browser: `http://localhost:3000/api/certificate/image?name=Nguyen%20Van%20A&major=Computer%20Science&issueDate=2024-01-15`
2. Hoặc dùng curl:
```bash
curl "http://localhost:3000/api/certificate/image?name=Nguyen%20Van%20A&major=Computer%20Science&issueDate=2024-01-15" --output test-certificate.png
```

**Kết quả mong đợi**:
- ✅ Browser hiển thị ảnh PNG
- ✅ Ảnh có tên sinh viên, ngành học, ngày cấp
- ✅ Ảnh được tạo động (không phải static)

---

### Test 2: Admin Certify Page (Mint Chứng Chỉ) ✅

**Mục đích**: Test mint chứng chỉ từ frontend

**Cách test**:

1. **Mở trang Admin**:
   - Navigate to: `http://localhost:3000/admin/certify`

2. **Connect Wallet**:
   - Click "Select Wallet"
   - Chọn Phantom hoặc Solflare
   - Approve connection
   - ✅ Verify: Wallet address hiển thị, balance hiển thị

3. **Nhập Collection & Merkle Tree**:
   - Collection Mint Address: Nhập address từ `.env.local`
   - Merkle Tree Address: Nhập address từ `.env.local`
   - ✅ Verify: Input fields có giá trị

4. **Xác Nhận Soulbound**:
   - ✅ Verify: Card "Soulbound Protection" hiển thị
   - ✅ Verify: Program PDA address hiển thị
   - Check checkbox: "I understand credentials will be Soulbound"
   - ✅ Verify: Checkbox được check

5. **Upload CSV**:
   - Tạo file CSV với nội dung:
   ```csv
   student_email,student_name,major,issue_date,wallet
   student1@test.com,Nguyen Van A,Computer Science,2024-01-15,ADDRESS_1
   student2@test.com,Tran Thi B,Business,2024-01-15,ADDRESS_2
   ```
   - Click "Upload CSV"
   - ✅ Verify: Số lượng students được parse hiển thị

6. **Mint Chứng Chỉ**:
   - Click "Mint Certificates"
   - ✅ Verify: Progress bar hiển thị
   - ✅ Verify: Student statuses update real-time
   - ✅ Verify: Transaction signatures hiển thị
   - ✅ Verify: Links to Solana Explorer hoạt động

**Kết quả mong đợi**:
- ✅ Mint thành công
- ✅ Transaction signatures có thể verify trên Solana Explorer
- ✅ Progress tracking hoạt động
- ✅ Error handling hoạt động (nếu có lỗi)

---

### Test 3: Student Passport Page (Xem Chứng Chỉ) ✅

**Mục đích**: Test xem chứng chỉ trong ví sinh viên

**Cách test**:

1. **Mở trang Passport**:
   - Navigate to: `http://localhost:3000/passport`

2. **Connect Wallet**:
   - Click "Select Wallet"
   - Chọn wallet đã được mint chứng chỉ
   - Approve connection
   - ✅ Verify: Wallet connected

3. **Xem Chứng Chỉ**:
   - ✅ Verify: Loading state hiển thị
   - ✅ Verify: Chứng chỉ hiển thị (nếu có)
   - ✅ Verify: Chỉ hiển thị chứng chỉ trong APEC Collection
   - ✅ Verify: Spam NFTs bị filter out

4. **Verify Chứng Chỉ**:
   - Click "Verify Certificate" trên một chứng chỉ
   - ✅ Verify: Navigate đến trang verify
   - ✅ Verify: Thông tin chứng chỉ hiển thị đúng

**Kết quả mong đợi**:
- ✅ Chứng chỉ hiển thị đúng
- ✅ Collection filtering hoạt động
- ✅ UI đẹp và responsive

---

### Test 4: Collection Filtering ✅

**Mục đích**: Verify chỉ hiển thị chứng chỉ trong Collection của trường

**Cách test**:

1. **Mint chứng chỉ với Collection đúng**:
   - Mint chứng chỉ với Collection Mint từ `.env.local`
   - ✅ Verify: Mint thành công

2. **Mint chứng chỉ với Collection sai** (nếu có):
   - Mint với Collection khác
   - ✅ Verify: Chứng chỉ này KHÔNG hiển thị trong passport

3. **Check API Response**:
   - Mở DevTools → Network
   - Xem request `/api/cnft?owner=...&collection=...`
   - ✅ Verify: Response chỉ có chứng chỉ trong Collection

**Kết quả mong đợi**:
- ✅ Collection filtering hoạt động đúng
- ✅ Spam NFTs bị filter out

---

### Test 5: Error Handling ✅

**Mục đích**: Test xử lý lỗi và retry logic

**Cách test**:

1. **Test Wallet Connection Error**:
   - Disconnect wallet
   - Try mint
   - ✅ Verify: Error message hiển thị

2. **Test Insufficient Balance**:
   - Dùng wallet có < 0.1 SOL
   - Try mint
   - ✅ Verify: Warning hiển thị

3. **Test Network Error** (simulate):
   - Disconnect internet tạm thời
   - Try mint
   - ✅ Verify: Retry logic hoạt động
   - ✅ Verify: Error message user-friendly

**Kết quả mong đợi**:
- ✅ Error handling hoạt động
- ✅ Retry logic hoạt động
- ✅ Error messages rõ ràng

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Wallet connection failed"
**Giải pháp**:
- Refresh page
- Check wallet extension đã enable
- Try với wallet khác (Solflare)

### Lỗi: "Insufficient balance"
**Giải pháp**:
- Lấy SOL testnet từ faucet: https://faucet.solana.com/
- Check balance trên Solana Explorer

### Lỗi: "Collection Mint not found"
**Giải pháp**:
- Verify Collection Mint address trong `.env.local`
- Check address trên Solana Explorer

### Lỗi: "Merkle Tree not found"
**Giải pháp**:
- Run script init tree: `npx ts-node scripts/init-tree.ts`
- Copy Merkle Tree address vào `.env.local`

### Lỗi: "Image generation failed"
**Giải pháp**:
- Check `satori` và `sharp` đã install
- Check fonts có load được không
- Xem console logs để debug

### Lỗi: "Arweave upload failed"
**Giải pháp**:
- Check `PAYER_SECRET_KEY` trong `.env.local`
- Check Irys balance (có thể cần fund)
- Check network connection

---

## ✅ CHECKLIST TEST HOÀN CHỈNH

### Setup
- [ ] Server chạy trên localhost:3000
- [ ] `.env.local` đã config đúng
- [ ] Wallet đã cài đặt và có SOL testnet
- [ ] Collection Mint và Merkle Tree đã setup

### Test Image Generation
- [ ] API endpoint hoạt động
- [ ] Ảnh được tạo động
- [ ] Ảnh có đầy đủ thông tin

### Test Admin Minting
- [ ] Wallet connection hoạt động
- [ ] Balance check hoạt động
- [ ] Soulbound confirmation hoạt động
- [ ] CSV upload hoạt động
- [ ] Batch minting hoạt động
- [ ] Progress tracking hoạt động
- [ ] Transaction signatures hiển thị

### Test Student Passport
- [ ] Wallet connection hoạt động
- [ ] Chứng chỉ hiển thị đúng
- [ ] Collection filtering hoạt động
- [ ] Verify certificate hoạt động

### Test Error Handling
- [ ] Error messages rõ ràng
- [ ] Retry logic hoạt động
- [ ] Partial success được handle

---

## 🎯 QUICK TEST (5 PHÚT)

Nếu muốn test nhanh:

1. **Start server**: `npm run dev`
2. **Mở**: `http://localhost:3000/admin/certify`
3. **Connect wallet**
4. **Upload CSV** với 1-2 students
5. **Mint** và verify transaction trên Solana Explorer

---

## 📊 EXPECTED RESULTS

Sau khi test xong, bạn sẽ có:
- ✅ Chứng chỉ được mint thành công
- ✅ Transaction signatures có thể verify
- ✅ Chứng chỉ hiển thị trong passport page
- ✅ Collection filtering hoạt động
- ✅ Soulbound protection được enforce

---

**Happy Testing! 🚀**

