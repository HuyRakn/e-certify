# 📚 TÓM TẮT DỰ ÁN E-CERTIFY - TUẦN 1 ĐẾN TUẦN 3

## 🎯 MỤC ĐÍCH DỰ ÁN

Xây dựng hệ thống cấp chứng chỉ số trên blockchain Solana, sử dụng Compressed NFTs (cNFTs) để:
- ✅ Cấp chứng chỉ cho sinh viên một cách tự động
- ✅ Lưu trữ trên blockchain (không thể giả mạo)
- ✅ Khóa chuyển nhượng (Soulbound - sinh viên không thể bán/chuyển chứng chỉ)
- ✅ Hiển thị chứng chỉ trong ví sinh viên

---

## 📅 TUẦN 1: HẠ TẦNG & SMART CONTRACT

### 🎯 Mục tiêu
Chuẩn bị hạ tầng blockchain và smart contract để mint chứng chỉ.

### ✅ Đã làm gì?

#### 1. **Setup Merkle Tree** (Cây Merkle)
- Tạo script để khởi tạo Merkle Tree với:
  - `max_depth = 14` (có thể lưu ~16,384 chứng chỉ)
  - `max_buffer_size = 64`
- Merkle Tree là nơi lưu trữ các chứng chỉ đã nén (compressed)

#### 2. **Tạo Collection NFT**
- Tạo một Collection NFT để nhóm tất cả chứng chỉ của trường
- Giúp phân biệt chứng chỉ của trường với các NFT khác

#### 3. **Smart Contract (Anchor)**
- Viết smart contract với các chức năng:
  - `mint_credential`: Đúc chứng chỉ mới
  - `transfer_credential`: Chuyển chứng chỉ (bị khóa)
  - `burn_credential`: Hủy chứng chỉ
- **QUAN TRỌNG**: Khi mint, set `leaf_delegate` = Program PDA → Khóa chuyển nhượng (Soulbound)

#### 4. **Admin Minting Service**
- Tạo service để admin có thể mint hàng loạt chứng chỉ
- Sử dụng Bubblegum SDK để tương tác với Merkle Tree

### 📁 Files quan trọng
- `scripts/init-tree.ts` - Khởi tạo Merkle Tree
- `scripts/create-collection.ts` - Tạo Collection NFT
- `credify_program/src/lib.rs` - Smart Contract
- `ts/adminMint.ts` - Service minting

---

## 📅 TUẦN 2: DATA LAYER & STORAGE

### 🎯 Mục tiêu
Tạo ảnh chứng chỉ động và lưu trữ trên Arweave (decentralized storage).

### ✅ Đã làm gì?

#### 1. **Tạo Ảnh Chứng Chỉ Động**
- Sử dụng `satori` để vẽ ảnh chứng chỉ từ template SVG
- Ảnh được tạo động với thông tin sinh viên:
  - Tên sinh viên
  - Ngành học
  - Ngày cấp
  - ID chứng chỉ
- **KHÔNG dùng ảnh tĩnh** - mỗi chứng chỉ có ảnh riêng

#### 2. **Upload Lên Arweave**
- Sử dụng Irys SDK để upload:
  - Ảnh chứng chỉ → Arweave URL
  - Metadata JSON → Arweave URL
- Sử dụng Node Devnet (miễn phí cho development)

#### 3. **Metadata Chuẩn Metaplex**
- Tạo metadata JSON theo chuẩn Metaplex NFT:
  - `name`: Tên chứng chỉ
  - `symbol`: Ký hiệu
  - `image`: URL ảnh trên Arweave
  - `attributes`: Thông tin chi tiết (tên, ngành, ngày, email)

#### 4. **Batch Processing**
- Xử lý hàng loạt sinh viên từ file CSV
- Sử dụng `papaparse` để đọc CSV
- Xử lý song song với `Promise.all` (5 sinh viên/batch)
- Hiển thị progress bar và status real-time

### 📁 Files quan trọng
- `lib/utils/certificate-generator.ts` - Tạo ảnh chứng chỉ
- `lib/arweave/irys.ts` - Upload lên Arweave
- `lib/utils/metadata-builder.ts` - Tạo metadata
- `app/api/certificate/image/route.ts` - API tạo ảnh
- `app/(platform)/admin/certify/page.tsx` - UI upload CSV và mint

---

## 📅 TUẦN 3: MINTING PROCESS & SOULBOUND LOGIC

### 🎯 Mục tiêu
Hoàn thiện quy trình minting từ frontend và đảm bảo Soulbound logic hoạt động.

### ✅ Đã làm gì?

#### 1. **Kết Nối Ví Admin**
- Admin có thể connect wallet (Phantom, Solflare) từ trang web
- Kiểm tra số dư SOL trước khi mint
- Cảnh báo nếu số dư < 0.1 SOL

#### 2. **Batch Minting với TransactionBuilder**
- Gom nhiều lệnh mint vào một transaction
- Giảm chi phí và tăng tốc độ
- Xử lý lỗi và retry tự động

#### 3. **Xác Nhận Soulbound**
- Hiển thị thông tin Program PDA
- Yêu cầu admin xác nhận trước khi mint
- Đảm bảo chứng chỉ sẽ bị khóa chuyển nhượng

#### 4. **Lọc Chứng Chỉ Theo Collection**
- Chỉ hiển thị chứng chỉ thuộc Collection của trường
- Lọc bỏ NFT rác (spam NFTs)
- Sử dụng DAS API để lấy chứng chỉ từ ví sinh viên

#### 5. **Xử Lý Lỗi & Retry**
- Retry tự động khi gặp lỗi mạng
- Exponential backoff (đợi lâu hơn mỗi lần retry)
- Phân biệt lỗi có thể retry và không thể retry

### 📁 Files quan trọng
- `lib/services/batch-mint-service.ts` - Batch minting service
- `lib/utils/retry-utils.ts` - Retry logic
- `lib/utils/soulbound-verification.ts` - Verify Soulbound
- `app/api/cnft/route.ts` - API lấy chứng chỉ với collection filter
- `app/(platform)/passport/page.tsx` - Trang xem chứng chỉ của sinh viên

---

## 🔄 QUY TRÌNH HOẠT ĐỘNG TỔNG QUAN

### 1. **Admin Mint Chứng Chỉ**
```
Admin → Connect Wallet → Upload CSV → Mint
  ↓
Generate Ảnh → Upload Arweave → Tạo Metadata → Upload Arweave → Mint cNFT
  ↓
Chứng chỉ được lưu trên blockchain với Soulbound protection
```

### 2. **Sinh Viên Xem Chứng Chỉ**
```
Sinh viên → Connect Wallet → Mở Passport Page
  ↓
DAS API lấy chứng chỉ → Lọc theo Collection → Hiển thị
```

---

## 🔒 SOULBOUND LOGIC

### Tại sao quan trọng?
- Ngăn sinh viên bán/chuyển chứng chỉ
- Đảm bảo tính xác thực của chứng chỉ
- Chỉ admin mới có thể chuyển chứng chỉ

### Cách hoạt động?
1. Khi mint: Set `leaf_delegate` = Program PDA (địa chỉ của smart contract)
2. Khi transfer: Smart contract kiểm tra nếu `leaf_delegate` = Program PDA → Từ chối
3. Kết quả: Chứng chỉ bị khóa, không thể chuyển

---

## 📊 TÓM TẮT THAY ĐỔI

### Tuần 1: Blockchain Infrastructure
- ✅ Merkle Tree setup
- ✅ Collection NFT
- ✅ Smart Contract với Soulbound logic
- ✅ Admin minting service

### Tuần 2: Data & Storage
- ✅ Tạo ảnh chứng chỉ động
- ✅ Upload lên Arweave
- ✅ Metadata chuẩn Metaplex
- ✅ Batch processing từ CSV

### Tuần 3: Frontend & UX
- ✅ Wallet integration
- ✅ Batch minting tối ưu
- ✅ Collection filtering
- ✅ Error handling & retry

---

## 🎯 KẾT QUẢ CUỐI CÙNG

### Admin có thể:
- ✅ Connect wallet
- ✅ Upload CSV với danh sách sinh viên
- ✅ Mint hàng loạt chứng chỉ
- ✅ Xem kết quả và transaction signatures

### Sinh viên có thể:
- ✅ Connect wallet
- ✅ Xem chứng chỉ trong ví
- ✅ Verify chứng chỉ trên blockchain
- ✅ Chứng chỉ không thể chuyển nhượng (Soulbound)

---

## 📝 LƯU Ý QUAN TRỌNG

1. **Môi trường**: Tất cả đang chạy trên Devnet (test network)
2. **Chi phí**: Devnet miễn phí, nhưng cần SOL testnet để mint
3. **Collection**: Phải có Collection Mint address để filter chứng chỉ
4. **Wallet**: Cần Phantom hoặc Solflare wallet để test

---

**Tóm lại**: Đã xây dựng một hệ thống hoàn chỉnh để cấp chứng chỉ số trên blockchain Solana với tính năng Soulbound, lưu trữ decentralized, và UI/UX đầy đủ!

