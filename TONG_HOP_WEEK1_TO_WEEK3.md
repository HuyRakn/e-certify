# 📋 TỔNG HỢP WEEK 1-3: E-CERTIFY PROJECT

## 🎯 MỤC ĐÍCH
Hệ thống cấp chứng chỉ số trên Solana blockchain với Compressed NFTs (cNFTs), có tính năng Soulbound (không thể chuyển nhượng).

---

## 📅 WEEK 1: HẠ TẦNG & SMART CONTRACT

### ✅ Đã làm gì?

1. **Setup Merkle Tree** (`scripts/init-tree.ts`)
   - **Dùng để:** Lưu trữ chứng chỉ compressed NFT (max_depth=14, ~16,384 chứng chỉ)

2. **Tạo Collection NFT** (`scripts/create-collection.ts`)
   - **Dùng để:** Nhóm tất cả chứng chỉ của trường, phân biệt với NFT khác

3. **Smart Contract** (`credify_program/src/lib.rs`)
   - **Dùng để:** Mint/transfer/burn chứng chỉ với logic Soulbound
   - **Soulbound:** Set `leaf_delegate` = Program PDA khi mint → Khóa chuyển nhượng

4. **Admin Minting Service** (`ts/adminMint.ts`)
   - **Dùng để:** Service để admin mint hàng loạt chứng chỉ

5. **API Route** (`app/api/mint/route.ts`)
   - **Dùng để:** Endpoint để frontend gọi mint

---

## 📅 WEEK 2: DATA LAYER & STORAGE

### ✅ Đã làm gì?

1. **Tạo Ảnh Chứng Chỉ Động** (`lib/utils/certificate-generator.ts`)
   - **Dùng để:** Tạo ảnh PNG tự động với thông tin sinh viên (không dùng ảnh tĩnh)
   - **Test:** `http://localhost:3000/api/certificate/image?name=...&major=...&issueDate=...`

2. **Font Loader** (`lib/utils/font-loader.ts`)
   - **Dùng để:** Load font TTF từ local hoặc CDN cho việc render ảnh

3. **Upload Arweave** (`lib/arweave/irys.ts`)
   - **Dùng để:** Lưu trữ ảnh và metadata trên Arweave (permanent, decentralized)

4. **Metadata Builder** (`lib/utils/metadata-builder.ts`)
   - **Dùng để:** Tạo metadata JSON theo chuẩn Metaplex NFT standard

5. **Batch Processing** (`app/(platform)/admin/certify/page.tsx`)
   - **Dùng để:** Xử lý hàng loạt sinh viên từ CSV với Promise.all

---

## 📅 WEEK 3: MINTING PROCESS & SOULBOUND LOGIC

### ✅ Đã làm gì?

1. **Wallet Integration** (`app/(platform)/admin/certify/page.tsx`)
   - **Dùng để:** Connect wallet admin từ trang web để mint chứng chỉ

2. **Batch Minting** (`lib/services/batch-mint-service.ts`)
   - **Dùng để:** Gom nhiều mint instructions vào 1 transaction (giảm chi phí, tăng tốc độ)

3. **Soulbound Verification** (`lib/utils/soulbound-verification.ts`)
   - **Dùng để:** Verify chứng chỉ có Soulbound protection (không thể chuyển nhượng)

4. **Retry Logic** (`lib/utils/retry-utils.ts`)
   - **Dùng để:** Retry tự động khi gặp lỗi mạng với exponential backoff

5. **Student Passport** (`app/(platform)/passport/page.tsx`)
   - **Dùng để:** Sinh viên xem chứng chỉ trong ví của họ

6. **Collection Filtering** (`app/api/cnft/route.ts`)
   - **Dùng để:** Lọc chỉ hiển thị chứng chỉ thuộc Collection của trường (loại bỏ spam NFTs)

7. **Progress Tracking** (`app/(platform)/admin/certify/page.tsx`)
   - **Dùng để:** Hiển thị progress real-time khi minting

---

## 🧪 CÁCH TEST TRÊN WEB

### Week 1:
```bash
# Scripts
ts-node scripts/init-tree.ts
ts-node scripts/create-collection.ts
anchor build && anchor deploy --provider.cluster devnet

# API
curl -X POST http://localhost:3000/api/mint -d '{...}'
```

### Week 2:
```
# API tạo ảnh
http://localhost:3000/api/certificate/image?name=Test&major=CS&issueDate=2024-01-15

# CSV Upload
http://localhost:3000/admin/certify → Upload CSV
```

### Week 3:
```
# Admin Minting
http://localhost:3000/admin/certify → Connect wallet → Upload CSV → Mint

# Student Passport
http://localhost:3000/passport → Connect wallet → Xem certificates
```

---

## 📁 FILES QUAN TRỌNG

### Week 1:
- `scripts/init-tree.ts` - Init Merkle Tree
- `scripts/create-collection.ts` - Create Collection
- `credify_program/src/lib.rs` - Smart Contract
- `ts/adminMint.ts` - Minting service
- `app/api/mint/route.ts` - API endpoint

### Week 2:
- `lib/utils/certificate-generator.ts` - Generate image
- `lib/utils/font-loader.ts` - Load fonts
- `lib/arweave/irys.ts` - Upload to Arweave
- `lib/utils/metadata-builder.ts` - Build metadata
- `app/api/certificate/image/route.ts` - Image API

### Week 3:
- `lib/services/batch-mint-service.ts` - Batch minting
- `lib/utils/retry-utils.ts` - Retry logic
- `lib/utils/soulbound-verification.ts` - Verify Soulbound
- `app/(platform)/admin/certify/page.tsx` - Admin UI
- `app/(platform)/passport/page.tsx` - Student UI
- `app/api/cnft/route.ts` - Get certificates API

---

## 🎯 KẾT QUẢ

### Admin có thể:
- ✅ Connect wallet
- ✅ Upload CSV với danh sách sinh viên
- ✅ Mint hàng loạt chứng chỉ
- ✅ Xem progress và transaction signatures

### Sinh viên có thể:
- ✅ Connect wallet
- ✅ Xem chứng chỉ trong ví
- ✅ Verify chứng chỉ trên blockchain
- ✅ Chứng chỉ không thể chuyển nhượng (Soulbound)

---

## 🚀 TEST SCRIPTS

```bash
npm run test:week1  # Test Week 1 structure
npm run test:week2  # Test Week 2 structure
npm run test:week3  # Test Week 3 structure
```

