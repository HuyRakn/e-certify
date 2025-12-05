# 🚀 Hướng dẫn Build & Deploy

## Phase 3: Build và Deploy Anchor Program

### Yêu cầu
- Rust và Cargo đã cài đặt
- Anchor CLI đã cài đặt (`anchor --version`)
- Solana CLI đã cài đặt và config cho Devnet
- Wallet có SOL trên Devnet (cho transaction fees)

### Bước 1: Kiểm tra môi trường

```bash
# Kiểm tra Anchor version (cần 0.32.x)
anchor --version

# Kiểm tra Solana CLI
solana --version

# Kiểm tra wallet và balance
solana address
solana balance

# Nếu chưa có SOL, airdrop trên Devnet
solana airdrop 2
```

### Bước 2: Build Program

```bash
# Từ thư mục root
anchor build
```

Nếu build thành công, bạn sẽ thấy:
- `target/deploy/credify_program.so` (program binary)
- `target/idl/credify_program.json` (IDL file)
- `target/types/credify_program.ts` (TypeScript types)

### Bước 3: Deploy lên Devnet

```bash
# Deploy với cluster devnet
anchor deploy --provider.cluster devnet
```

Hoặc sử dụng script:
```bash
# Windows PowerShell
.\scripts\build-and-deploy.ps1

# Linux/Mac
chmod +x scripts/build-and-deploy.sh
./scripts/build-and-deploy.sh
```

### Bước 4: Verify Deployment

Sau khi deploy, bạn sẽ nhận được Program ID. Verify trên Solana Explorer:
```
https://explorer.solana.com/address/<PROGRAM_ID>?cluster=devnet
```

### Bước 5: Update Program ID (nếu cần)

Nếu Program ID thay đổi sau khi deploy:

1. Update trong `credify_program/src/lib.rs`:
```rust
declare_id!("<NEW_PROGRAM_ID>");
```

2. Update trong `Anchor.toml`:
```toml
[programs.devnet]
credify_program = "<NEW_PROGRAM_ID>"
```

3. Rebuild và redeploy:
```bash
anchor build
anchor deploy --provider.cluster devnet
```

---

## Phase 4: Chạy Unit Tests

### Chạy tests trên Devnet

```bash
anchor test --provider.cluster devnet
```

Hoặc sử dụng npm script:
```bash
npm run anchor:test
```

### Test Cases

Tests sẽ verify:
1. ✅ Program Authority PDA derivation
2. ✅ Soulbound logic (reject transfer khi leaf_delegate = Program PDA)
3. ✅ Allow transfer khi leaf_delegate ≠ Program PDA
4. ✅ Error codes
5. ✅ Program IDL structure

### Troubleshooting

**Lỗi: "Program account not found"**
- Đảm bảo program đã được deploy
- Kiểm tra Program ID trong `Anchor.toml` và `lib.rs` khớp nhau

**Lỗi: "Insufficient funds"**
- Airdrop thêm SOL: `solana airdrop 2`

**Lỗi: "RPC endpoint not found"**
- Kiểm tra `.env.local` có `RPC_URL` hoặc `HELIUS_API_KEY_URL`
- Đảm bảo RPC endpoint hỗ trợ Devnet

---

## Verification Checklist

Sau khi build và deploy thành công:

- [ ] Program binary được tạo (`target/deploy/credify_program.so`)
- [ ] IDL file được tạo (`target/idl/credify_program.json`)
- [ ] Program được deploy lên Devnet
- [ ] Program ID khớp trong `lib.rs` và `Anchor.toml`
- [ ] Unit tests pass
- [ ] Program có thể query được trên Solana Explorer

---

## Next Steps

Sau khi deploy thành công:

1. **Test minting**: Chạy `scripts/init-tree.ts` và `scripts/create-collection.ts`
2. **Test admin minting**: Chạy `npm run admin:mint` hoặc qua API `/api/mint`
3. **Verify Soulbound**: Kiểm tra credentials không thể transfer (leaf_delegate = Program PDA)

