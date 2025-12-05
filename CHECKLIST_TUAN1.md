# 📋 CHECKLIST TRIỂN KHAI TUẦN 1 - HẠ TẦNG & SMART CONTRACT

## 🎯 MỤC TIÊU
Thiết lập hạ tầng Solana hoàn chỉnh với Helius RPC (Devnet), khởi tạo Merkle Tree tối ưu, và viết Smart Contract Anchor với logic Soulbound để mint cNFTs.

---

## 📊 PHÂN TÍCH HIỆN TRẠNG

### ✅ Đã có:
- ✅ Anchor program structure (`credify_program/`)
- ✅ Dependencies đã cài: `@metaplex-foundation/mpl-bubblegum@^5.0.2`, `mpl-bubblegum@^2.1.1`
- ✅ Cấu trúc cơ bản của `credify_program/src/lib.rs` (nhưng chưa implement CPI thực sự)
- ✅ File `ts/adminMint.ts` (nhưng đang dùng mock logic)

### ❌ Cần xử lý:
- ❌ Folder `apec_credify/` chỉ có Anchor.toml rỗng → **CẦN XÓA**
- ❌ Chưa có script khởi tạo Merkle Tree với thông số `max_depth=14, max_buffer_size=64`
- ❌ Smart Contract chưa có CPI thực sự đến `mpl-bubblegum`
- ❌ Chưa implement logic Soulbound (set `leaf_delegate` = Program PDA)
- ❌ Chưa có unit tests cho Anchor program
- ❌ Chưa có file `.env.example` hoặc `.env.local` template

---

## ✅ CHECKLIST CHI TIẾT

### **PHASE 1: Dọn dẹp & Chuẩn bị Môi trường** 🔧

#### 1.1. Xóa file/folder rác
- [ ] **Xóa folder `apec_credify/`** (chỉ có Anchor.toml rỗng, không cần thiết)
- [ ] Kiểm tra và xóa các file test/example không cần thiết trong `scripts/`

#### 1.2. Kiểm tra Environment Variables
- [ ] **Verify `.env.local` đã có đủ các biến cần thiết:**
  - ✅ `RPC_URL` hoặc `HELIUS_API_KEY_URL` (Helius RPC Devnet)
  - ✅ `NEXT_PUBLIC_DAS_URL` (cho DAS API)
  - ✅ `PAYER_SECRET_KEY` (admin payer keypair - JSON array format)
  - ⏳ `MERKLE_TREE` (sẽ được set sau khi init tree)
  - ⏳ `COLLECTION_MINT` (sẽ được set sau khi tạo collection)
  - ⏳ `NEXT_PUBLIC_APEC_COLLECTION` (sẽ được set sau khi tạo collection)
- [ ] **(Optional)** Tạo `.env.example` nếu muốn document cho team (không bắt buộc nếu đã có `.env.local`)
- [ ] Verify `.gitignore` đã ignore `.env.local` (không commit secrets)

#### 1.3. Cập nhật Anchor.toml
- [ ] Cấu hình `Anchor.toml` ở root để:
  - Set `cluster = "devnet"` (thay vì localnet)
  - Cấu hình RPC URL từ env variable
  - Đảm bảo `programs.localnet.credify_program` đúng với program ID

---

### **PHASE 2: Script Khởi tạo Merkle Tree** 🌳

#### 2.1. Tạo script TypeScript để init Merkle Tree
- [ ] Tạo file `scripts/init-tree.ts` với các chức năng:
  - [ ] Import dependencies: `@metaplex-foundation/mpl-bubblegum`, `@solana/web3.js`, `@solana/spl-account-compression`
  - [ ] Load payer từ `PAYER_SECRET_KEY` env variable
  - [ ] Kết nối đến Helius RPC (Devnet)
  - [ ] Tính toán account size cho Merkle Tree với `max_depth=14, max_buffer_size=64`
  - [ ] Tạo tree account (System Account)
  - [ ] Gọi Bubblegum instruction `createTree` với:
    - `maxDepth = 14`
    - `maxBufferSize = 64`
    - `treeAuthority` = Program PDA (derived từ `credify_program`)
  - [ ] Log ra Merkle Tree address và Tree Authority PDA
  - [ ] Lưu addresses vào `.env.local` hoặc output file

#### 2.2. Tạo Collection NFT (nếu chưa có)
- [ ] Tạo script `scripts/create-collection.ts` để:
  - [ ] Tạo Metaplex Collection NFT
  - [ ] Set metadata cho collection
  - [ ] Lưu Collection Mint address

#### 2.3. Test script init tree
- [ ] Chạy `ts-node scripts/init-tree.ts` trên Devnet
- [ ] Verify Merkle Tree được tạo thành công trên Solana Explorer
- [ ] Verify Tree Authority là Program PDA

---

### **PHASE 3: Viết lại Smart Contract Anchor** 💎

#### 3.1. Cập nhật `credify_program/src/lib.rs`

##### 3.1.1. Function `mint_credential` (MỚI - Quan trọng nhất)
- [ ] Tạo instruction mới `mint_credential` với Context `MintCredential<'info>`
- [ ] **Logic Soulbound CỐT LÕI:**
  - [ ] Derive Program PDA: `[b"authority"]` → `tree_authority`
  - [ ] Set `leaf_delegate` = Program PDA (KHÔNG phải student wallet)
  - [ ] Thực hiện CPI đến `mpl_bubblegum::cpi::mint_v1` hoặc `mint_to_collection_v1`
  - [ ] Truyền đúng accounts:
    - `tree_authority` = Program PDA
    - `leaf_owner` = student wallet (recipient)
    - `leaf_delegate` = Program PDA (SOULBOUND - khóa transfer)
    - `merkle_tree` = Merkle Tree account
    - `payer` = admin/payer
    - `collection_mint`, `collection_metadata`, `collection_edition`
    - `bubblegum_program`, `compression_program`, `log_wrapper`
  - [ ] Validate metadata args (name, symbol, uri, creators, collection)

##### 3.1.2. Function `create_tree` (CẬP NHẬT)
- [ ] **XÓA** function này hoặc đánh dấu deprecated (vì tree sẽ được init bằng script)
- [ ] Hoặc giữ lại nhưng chỉ validate, không tạo tree thực sự

##### 3.1.3. Function `transfer_credential` (CẬP NHẬT)
- [ ] **THÊM CHECK:** Verify `leaf_delegate` == Program PDA
- [ ] **REJECT transfer:** Nếu `leaf_delegate` là Program PDA → return error (Soulbound không cho phép transfer)
- [ ] Hoặc chỉ cho phép transfer nếu signer là Program Authority (admin)

##### 3.1.4. Function `burn_credential` (CẬP NHẬT)
- [ ] Implement CPI thực sự đến `mpl_bubblegum::cpi::burn`
- [ ] Validate Merkle proof
- [ ] Cho phép owner burn (hoặc chỉ admin)

#### 3.2. Cập nhật Account Structs
- [ ] **MintCredential<'info>** (MỚI):
  ```rust
  #[derive(Accounts)]
  pub struct MintCredential<'info> {
      #[account(mut)]
      pub payer: Signer<'info>,
      
      #[account(
          seeds = [b"authority"],
          bump
      )]
      pub tree_authority: SystemAccount<'info>, // Program PDA
      
      /// CHECK: Leaf owner (student wallet)
      pub leaf_owner: UncheckedAccount<'info>,
      
      /// CHECK: Merkle tree
      #[account(mut)]
      pub merkle_tree: UncheckedAccount<'info>,
      
      /// CHECK: Collection mint
      pub collection_mint: UncheckedAccount<'info>,
      
      /// CHECK: Collection metadata
      pub collection_metadata: UncheckedAccount<'info>,
      
      /// CHECK: Collection edition
      pub collection_edition: UncheckedAccount<'info>,
      
      pub bubblegum_program: Program<'info, Bubblegum>,
      pub compression_program: Program<'info, SplAccountCompression>,
      pub log_wrapper: Program<'info, Noop>,
      pub system_program: Program<'info, System>,
      pub token_program: Program<'info, Token>,
  }
  ```

- [ ] Cập nhật `TransferCredential` để validate Soulbound
- [ ] Cập nhật `BurnCredential` để implement CPI thực sự

#### 3.3. Build & Deploy
- [ ] Chạy `anchor build` để compile program
- [ ] Fix các lỗi compilation (nếu có)
- [ ] Deploy lên Devnet: `anchor deploy --provider.cluster devnet`
- [ ] Verify program ID trên Solana Explorer

---

### **PHASE 4: Unit Tests** 🧪

#### 4.1. Tạo test file
- [ ] Tạo `credify_program/tests/credify_program.ts` (hoặc `.js`)
- [ ] Setup test environment:
  - [ ] Import Anchor, web3.js, Bubblegum SDK
  - [ ] Setup provider với Helius RPC
  - [ ] Load payer keypair
  - [ ] Derive Program PDA

#### 4.2. Test Cases
- [ ] **Test 1: Mint Credential với Soulbound**
  - [ ] Gọi `mint_credential` instruction
  - [ ] Verify cNFT được mint thành công
  - [ ] Verify `leaf_delegate` = Program PDA (không phải student wallet)
  - [ ] Verify student KHÔNG THỂ transfer (test transfer sẽ fail)

- [ ] **Test 2: Transfer Credential bị reject**
  - [ ] Thử transfer cNFT từ student wallet
  - [ ] Verify transaction bị reject với error "Soulbound credential cannot be transferred"

- [ ] **Test 3: Burn Credential**
  - [ ] Test burn cNFT thành công
  - [ ] Verify cNFT bị xóa khỏi Merkle Tree

- [ ] **Test 4: Admin có thể transfer (nếu cần)**
  - [ ] Test admin (Program Authority) có thể transfer credential
  - [ ] Verify logic phân quyền

#### 4.3. Chạy tests
- [ ] Chạy `anchor test --provider.cluster devnet`
- [ ] Fix các lỗi test (nếu có)
- [ ] Đảm bảo tất cả tests pass

---

### **PHASE 5: Tích hợp với Admin Script** 🔗

#### 5.1. Cập nhật `ts/adminMint.ts`
- [ ] **XÓA** tất cả mock logic
- [ ] Implement thực sự:
  - [ ] Load Merkle Tree và Collection từ env
  - [ ] Derive Program PDA
  - [ ] Gọi Anchor instruction `mint_credential` thay vì gọi Bubblegum trực tiếp
  - [ ] Hoặc gọi Bubblegum nhưng set `leaf_delegate` = Program PDA
  - [ ] Handle transaction signing và confirmation
  - [ ] Log kết quả mint (asset ID, transaction signature)

#### 5.2. Cập nhật API Route
- [ ] Cập nhật `app/api/mint/route.ts`:
  - [ ] Import và sử dụng `adminMint.ts` thực sự
  - [ ] Xóa mock logic
  - [ ] Handle errors properly

---

### **PHASE 6: Documentation & Verification** 📝

#### 6.1. Cập nhật README
- [ ] Thêm section "Tuần 1 - Setup Instructions"
- [ ] Document cách chạy `scripts/init-tree.ts`
- [ ] Document cách deploy program
- [ ] Document cách test

#### 6.2. Verification Checklist
- [ ] ✅ Merkle Tree được tạo với `max_depth=14, max_buffer_size=64`
- [ ] ✅ Tree Authority = Program PDA
- [ ] ✅ Smart Contract deploy thành công lên Devnet
- [ ] ✅ Mint cNFT thành công với `leaf_delegate` = Program PDA
- [ ] ✅ Student KHÔNG THỂ transfer cNFT (Soulbound hoạt động)
- [ ] ✅ Unit tests pass
- [ ] ✅ Không còn mock/zero logic nào

---

## 🚨 LƯU Ý QUAN TRỌNG

### Zero Mock Policy
- ❌ **TUYỆT ĐỐI KHÔNG** dùng mock transactions
- ❌ **TUYỆT ĐỐI KHÔNG** dùng placeholder addresses (`1111...1111`)
- ✅ Tất cả phải là on-chain transactions thực sự

### Soulbound Logic
- ✅ **BẮT BUỘC:** Khi mint cNFT, `leaf_delegate` PHẢI = Program PDA
- ✅ Điều này khóa chức năng transfer của student
- ✅ Chỉ Program Authority (admin) mới có thể transfer (nếu cần)

### Thông số Merkle Tree
- ✅ `max_depth = 14` (hỗ trợ ~16,384 credentials)
- ✅ `max_buffer_size = 64` (tối ưu cho hackathon)

---

## 📅 TIMELINE ƯỚC TÍNH

- **Phase 1:** 1-2 giờ (Dọn dẹp & Setup)
- **Phase 2:** 3-4 giờ (Script init tree)
- **Phase 3:** 6-8 giờ (Smart Contract)
- **Phase 4:** 3-4 giờ (Unit Tests)
- **Phase 5:** 2-3 giờ (Tích hợp)
- **Phase 6:** 1-2 giờ (Documentation)

**Tổng:** ~16-23 giờ làm việc

---

## ✅ CRITERIA HOÀN THÀNH TUẦN 1

1. ✅ Merkle Tree được khởi tạo thành công trên Devnet với thông số đúng
2. ✅ Smart Contract deploy và có thể mint cNFTs
3. ✅ Logic Soulbound hoạt động (student không thể transfer)
4. ✅ Unit tests pass
5. ✅ Không còn mock/zero logic
6. ✅ Code sẵn sàng cho production on-chain

---

**Ngày tạo:** $(date)
**Người tạo:** Solana Expert AI Assistant
**Trạng thái:** ⏳ Chờ duyệt để bắt đầu triển khai

