# 📋 CHECKLIST TRIỂN KHAI TUẦN 3 - MINTING PROCESS & SOULBOUND LOGIC

## 🎯 MỤC TIÊU
Xây dựng frontend minting process hoàn chỉnh với wallet integration, batch minting tối ưu, và student passport view với collection filtering.

---

## 📊 PHÂN TÍCH HIỆN TRẠNG

### ✅ Đã có:
- ✅ Wallet adapter setup (`app/components/wallet-provider.tsx`)
- ✅ Admin certify page với CSV upload (`app/(platform)/admin/certify/page.tsx`)
- ✅ Passport page với DAS API fetch (`app/(platform)/passport/page.tsx`)
- ✅ DAS API proxy route (`app/api/das/route.ts` và `app/api/cnft/route.ts`)
- ✅ Soulbound logic trong `adminMint.ts` (leaf_delegate = Program PDA)
- ✅ Batch processing với Promise.all (nhưng chưa dùng TransactionBuilder)

### ❌ Cần implement:
- ❌ Frontend wallet integration cho Admin (Teacher) minting
- ❌ Batch minting với TransactionBuilder (gom nhiều mint vào 1 transaction)
- ❌ Error handling và retry logic cho network issues
- ❌ Collection filtering trong DAS API và passport view
- ❌ Verify Soulbound enforcement trên frontend

---

## ✅ CHECKLIST CHI TIẾT

### **PHASE 1: Frontend Wallet Integration cho Admin** 💼

#### 1.1. Verify Wallet Provider Setup
- [ ] Kiểm tra `app/components/wallet-provider.tsx` đã setup đúng
- [ ] Verify WalletProvider wrap đúng layout
- [ ] Test wallet connection (Phantom, Solflare)

#### 1.2. Admin Certify Page - Wallet Integration
- [ ] **Cập nhật `app/(platform)/admin/certify/page.tsx`**:
  - [ ] Import `useWallet` từ `@solana/wallet-adapter-react`
  - [ ] Get `publicKey` và `connected` từ wallet
  - [ ] Hiển thị wallet connection status
  - [ ] Require wallet connection trước khi mint
  - [ ] Show wallet address khi connected
  - [ ] Add "Connect Wallet" button nếu chưa connect

#### 1.3. Wallet UI Components
- [ ] **Sử dụng `WalletIndicator` component** (đã có):
  - [ ] Import vào admin certify page
  - [ ] Hiển thị khi chưa connect wallet
  - [ ] Show wallet address khi connected

#### 1.4. Verify Wallet có đủ SOL
- [ ] **Thêm balance check**:
  - [ ] Fetch wallet balance trước khi mint
  - [ ] Warn nếu balance < threshold (ví dụ: 0.1 SOL)
  - [ ] Show balance trong UI

---

### **PHASE 2: Batch Minting với TransactionBuilder** ⚡

#### 2.1. Tạo Batch Minting Service
- [ ] **Tạo `lib/services/batch-mint-service.ts`**:
  - [ ] Import UMI và Bubblegum SDK
  - [ ] Setup UMI với wallet từ frontend
  - [ ] Function `createBatchMintTransaction()`:
    - [ ] Nhận array of students
    - [ ] For each student:
      - Generate image
      - Upload image to Arweave
      - Build metadata
      - Upload metadata to Arweave
      - Create mint instruction
    - [ ] Gom tất cả mint instructions vào một TransactionBuilder
    - [ ] Return TransactionBuilder

#### 2.2. TransactionBuilder Implementation
- [ ] **Sử dụng UMI TransactionBuilder**:
  ```typescript
  const builder = createTransactionBuilder(umi);
  
  for (const student of students) {
    // ... prepare mint instruction
    builder.add(mintV1Instruction);
  }
  
  return builder;
  ```
- [ ] **Optimize transaction size**:
  - [ ] Limit số instructions per transaction (ví dụ: 10-20 mints/transaction)
  - [ ] Split thành nhiều transactions nếu cần
  - [ ] Track transaction signatures

#### 2.3. Update Admin Mint Service
- [ ] **Cập nhật `ts/adminMint.ts`**:
  - [ ] Thêm function `batchMintWithTransactionBuilder()`:
    - [ ] Nhận students array
    - [ ] Prepare tất cả images và metadata trước
    - [ ] Group students vào batches (theo transaction size limit)
    - [ ] Create TransactionBuilder cho mỗi batch
    - [ ] Send và confirm transactions
    - [ ] Return results với transaction signatures
  - [ ] **Giữ lại function cũ** (`batchMintCredentials`) để backward compatibility
  - [ ] **Hoặc replace** với version mới dùng TransactionBuilder

#### 2.4. Frontend Integration
- [ ] **Cập nhật `app/(platform)/admin/certify/page.tsx`**:
  - [ ] Import batch mint service
  - [ ] Update `runBatchMint()` để:
    - [ ] Check wallet connection
    - [ ] Get wallet từ `useWallet()`
    - [ ] Pass wallet vào batch mint service
    - [ ] Handle transaction signatures
    - [ ] Update progress với transaction status

---

### **PHASE 3: Error Handling & Retry Logic** 🔄

#### 3.1. Network Error Handling
- [ ] **Tạo `lib/utils/retry-utils.ts`**:
  - [ ] Function `retryWithBackoff()`:
    - [ ] Retry với exponential backoff
    - [ ] Max retries: 3
    - [ ] Handle specific errors (network, RPC, etc.)
  - [ ] Function `isRetryableError()`:
    - [ ] Check nếu error có thể retry
    - [ ] Network errors: retry
    - [ ] Validation errors: không retry

#### 3.2. Transaction Error Handling
- [ ] **Handle transaction failures**:
  - [ ] Catch transaction errors
  - [ ] Parse error messages
  - [ ] Log errors chi tiết
  - [ ] Retry nếu là network/RPC error
  - [ ] Skip nếu là validation error

#### 3.3. Partial Success Handling
- [ ] **Handle partial batch success**:
  - [ ] Nếu một transaction fail, các transaction khác vẫn tiếp tục
  - [ ] Track success/failed cho từng student
  - [ ] Allow retry failed students
  - [ ] Export failed list để xử lý sau

#### 3.4. User Feedback
- [ ] **Error messages trong UI**:
  - [ ] Show specific error cho từng student
  - [ ] Show retry button cho failed students
  - [ ] Show network status warnings
  - [ ] Show transaction confirmation status

---

### **PHASE 4: Soulbound Enforcement Verification** 🔒

#### 4.1. Verify Soulbound Logic
- [ ] **Kiểm tra `ts/adminMint.ts`**:
  - [ ] Verify `leaf_delegate` = Program PDA
  - [ ] Verify Program PDA derivation đúng
  - [ ] Add validation check trước khi mint

#### 4.2. Frontend Verification
- [ ] **Thêm verification trong admin certify page**:
  - [ ] Verify Program PDA trước khi mint
  - [ ] Show Program PDA address trong UI
  - [ ] Warn nếu Program PDA không đúng
  - [ ] Add checkbox confirmation: "I understand credentials will be Soulbound"

#### 4.3. On-chain Verification
- [ ] **Verify sau khi mint**:
  - [ ] Fetch minted credential từ DAS API
  - [ ] Verify `ownership.delegate` = Program PDA
  - [ ] Show verification status trong results

#### 4.4. Transfer Rejection Test
- [ ] **Test transfer rejection**:
  - [ ] Thử transfer credential từ student wallet
  - [ ] Verify transaction bị reject
  - [ ] Show error message về Soulbound

---

### **PHASE 5: Student View với Collection Filtering** 👨‍🎓

#### 5.1. Update DAS API Route
- [ ] **Cập nhật `app/api/cnft/route.ts`**:
  - [ ] Thêm collection filter parameter
  - [ ] Filter assets theo `grouping` với `group_key = "collection"`
  - [ ] Filter theo Collection Mint address từ env
  - [ ] Return chỉ assets thuộc collection của trường

#### 5.2. Collection Filtering Logic
- [ ] **Implement filter function**:
  ```typescript
  function filterByCollection(assets: DasAsset[], collectionMint: string): DasAsset[] {
    return assets.filter(asset => {
      const collection = asset.grouping?.find(g => g.group_key === 'collection');
      return collection?.group_value === collectionMint;
    });
  }
  ```
- [ ] **Handle edge cases**:
  - [ ] Assets không có grouping
  - [ ] Assets có grouping nhưng không có collection
  - [ ] Multiple collections (nếu cần)

#### 5.3. Update Passport Page
- [ ] **Cập nhật `app/(platform)/passport/page.tsx`**:
  - [ ] Get Collection Mint từ env hoặc config
  - [ ] Pass collection filter vào API call
  - [ ] Filter results trên frontend (backup)
  - [ ] Show message nếu không có credentials trong collection
  - [ ] Show collection info trong UI

#### 5.4. Update Passport Card
- [ ] **Cập nhật `app/components/passport-card.tsx`**:
  - [ ] Verify asset có collection grouping
  - [ ] Show collection badge nếu có
  - [ ] Hide hoặc mark assets không có collection

#### 5.5. Spam Filtering UI
- [ ] **Add filtering options**:
  - [ ] Filter by collection (default: APEC collection)
  - [ ] Show/hide spam NFTs (optional toggle)
  - [ ] Count filtered vs total assets

---

### **PHASE 6: API Route Updates** 🔌

#### 6.1. Update Mint API Route
- [ ] **Cập nhật `app/api/mint/route.ts`**:
  - [ ] Accept wallet publicKey từ request (nếu frontend minting)
  - [ ] Support cả admin minting (server-side) và frontend minting
  - [ ] Return transaction signatures
  - [ ] Handle batch transaction results

#### 6.2. Create Frontend Mint API Route (Optional)
- [ ] **Tạo `app/api/mint/frontend/route.ts`** (nếu cần):
  - [ ] Accept wallet signature từ frontend
  - [ ] Verify signature
  - [ ] Execute batch mint với TransactionBuilder
  - [ ] Return transaction results

#### 6.3. Update DAS API Route
- [ ] **Cập nhật `app/api/das/route.ts`**:
  - [ ] Support collection filtering
  - [ ] Add collection parameter
  - [ ] Filter results trước khi return

---

### **PHASE 7: UI/UX Enhancements** 🎨

#### 7.1. Admin Certify Page Enhancements
- [ ] **Wallet connection UI**:
  - [ ] Show wallet address khi connected
  - [ ] Show balance
  - [ ] Disconnect button
  - [ ] Switch wallet option

- [ ] **Minting progress UI**:
  - [ ] Transaction progress (nếu batch transactions)
  - [ ] Show transaction signatures
  - [ ] Link to Solana Explorer
  - [ ] Estimated time remaining

- [ ] **Results display**:
  - [ ] Group by transaction
  - [ ] Show transaction details
  - [ ] Show Arweave URLs
  - [ ] Copy links functionality

#### 7.2. Passport Page Enhancements
- [ ] **Collection filter UI**:
  - [ ] Show active collection filter
  - [ ] Toggle để show/hide spam NFTs
  - [ ] Collection badge cho mỗi credential

- [ ] **Empty state**:
  - [ ] Message khi không có credentials trong collection
  - [ ] Link to courses để earn credentials

#### 7.3. Error States
- [ ] **Error UI components**:
  - [ ] Network error message
  - [ ] Transaction failed message
  - [ ] Retry buttons
  - [ ] Error details (expandable)

---

### **PHASE 8: Testing & Verification** ✅

#### 8.1. Wallet Integration Tests
- [ ] Test wallet connection
- [ ] Test wallet disconnect
- [ ] Test với nhiều wallets (Phantom, Solflare)
- [ ] Test balance check

#### 8.2. Batch Minting Tests
- [ ] Test batch minting với 5, 10, 20 students
- [ ] Verify transactions được gom đúng
- [ ] Verify transaction size không vượt limit
- [ ] Test với network errors (simulate)

#### 8.3. Error Handling Tests
- [ ] Test retry logic với network errors
- [ ] Test partial success scenarios
- [ ] Test error messages hiển thị đúng

#### 8.4. Soulbound Verification Tests
- [ ] Verify leaf_delegate = Program PDA sau khi mint
- [ ] Test transfer rejection
- [ ] Verify trên Solana Explorer

#### 8.5. Collection Filtering Tests
- [ ] Test filter với collection đúng
- [ ] Test filter với collection sai
- [ ] Test với assets không có collection
- [ ] Test với multiple collections

#### 8.6. End-to-End Tests
- [ ] Test full flow: Connect wallet → Upload CSV → Batch mint → View passport
- [ ] Verify credentials hiển thị đúng trong passport
- [ ] Verify collection filtering hoạt động
- [ ] Verify Soulbound enforcement

---

### **PHASE 9: Documentation & Cleanup** 📝

#### 9.1. Update Documentation
- [ ] **Cập nhật `README.md`**:
  - [ ] Thêm section Tuần 3
  - [ ] Document wallet integration
  - [ ] Document batch minting với TransactionBuilder
  - [ ] Document collection filtering

#### 9.2. Code Comments
- [ ] Add comments cho batch minting logic
- [ ] Document TransactionBuilder usage
- [ ] Document collection filtering logic

#### 9.3. Create Summary
- [ ] **Tạo `TUAN3_SUMMARY.md`**:
  - [ ] Tổng kết các thay đổi
  - [ ] Hướng dẫn sử dụng
  - [ ] Troubleshooting

---

## 🚨 LƯU Ý QUAN TRỌNG

### TransactionBuilder Optimization
- ✅ **CRITICAL**: Gom nhiều mint instructions vào một transaction
- ✅ Giảm số transactions → Giảm fees và tăng tốc độ
- ✅ Limit transaction size (không quá 1232 bytes per instruction)
- ✅ Split thành batches nếu cần

### Soulbound Enforcement
- ✅ **CRITICAL**: `leaf_delegate` PHẢI = Program PDA
- ✅ Verify trước khi mint
- ✅ Verify sau khi mint (on-chain)
- ✅ Test transfer rejection

### Collection Filtering
- ✅ **CRITICAL**: Filter theo `grouping[group_key="collection"]`
- ✅ Chỉ hiển thị credentials thuộc APEC collection
- ✅ Loại bỏ spam NFTs
- ✅ Handle edge cases (no grouping, wrong collection)

### Error Handling
- ✅ Retry với exponential backoff
- ✅ Distinguish retryable vs non-retryable errors
- ✅ Partial success handling
- ✅ User-friendly error messages

---

## 📅 TIMELINE ƯỚC TÍNH

- **Phase 1:** 2-3 giờ (Wallet Integration)
- **Phase 2:** 4-6 giờ (Batch Minting với TransactionBuilder)
- **Phase 3:** 2-3 giờ (Error Handling)
- **Phase 4:** 1-2 giờ (Soulbound Verification)
- **Phase 5:** 3-4 giờ (Collection Filtering)
- **Phase 6:** 2-3 giờ (API Updates)
- **Phase 7:** 2-3 giờ (UI Enhancements)
- **Phase 8:** 3-4 giờ (Testing)
- **Phase 9:** 1-2 giờ (Documentation)

**Tổng:** ~20-30 giờ làm việc

---

## ✅ CRITERIA HOÀN THÀNH TUẦN 3

1. ✅ Admin có thể connect wallet và mint từ frontend
2. ✅ Batch minting sử dụng TransactionBuilder (gom nhiều mints vào 1 transaction)
3. ✅ Error handling và retry logic hoạt động
4. ✅ Soulbound enforcement được verify (leaf_delegate = Program PDA)
5. ✅ Student passport chỉ hiển thị credentials trong APEC collection
6. ✅ Spam NFTs được filter out
7. ✅ UI/UX hoàn chỉnh với progress tracking

---

**Ngày tạo:** $(date)
**Người tạo:** Blockchain Frontend Expert AI Assistant
**Trạng thái:** ⏳ Chờ duyệt để bắt đầu triển khai

