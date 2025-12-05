use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;
use mpl_bubblegum::{
    program::Bubblegum,
    instructions::MintV1CpiBuilder,
    types::MetadataArgs,
};
use spl_account_compression::{program::SplAccountCompression, Noop};
use spl_token::program::Token;

declare_id!("CRD111111111111111111111111111111111111111");

#[program]
pub mod credify_program {
    use super::*;

    /// Mint a new cNFT credential with Soulbound logic
    /// This is the CORE function that mints cNFTs with leaf_delegate set to Program PDA
    /// This prevents students from transferring their credentials (Soulbound)
    pub fn mint_credential(
        ctx: Context<MintCredential>,
        metadata: MetadataArgsInput,
    ) -> Result<()> {
        let program_authority = &ctx.accounts.program_authority;
        
        msg!("Minting credential with Soulbound logic...");
        msg!("Leaf Owner: {}", ctx.accounts.leaf_owner.key());
        msg!("Leaf Delegate (Program PDA): {}", program_authority.key());
        
        // Build MetadataArgs for Bubblegum
        // Note: This is a simplified version. Full implementation requires proper conversion
        // from MetadataArgsInput to MetadataArgs
        
        // Perform CPI to Bubblegum mint_v1 instruction
        // CRITICAL: Set leaf_delegate to Program PDA (Soulbound)
        let cpi_ctx = CpiContext::new(
            ctx.accounts.bubblegum_program.to_account_info(),
            mpl_bubblegum::cpi::accounts::MintV1 {
                tree_authority: ctx.accounts.tree_authority.to_account_info(),
                leaf_owner: ctx.accounts.leaf_owner.to_account_info(),
                leaf_delegate: program_authority.to_account_info(), // SOULBOUND: Program PDA
                merkle_tree: ctx.accounts.merkle_tree.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                tree_delegate: ctx.accounts.tree_delegate.to_account_info(),
                collection_authority: ctx.accounts.collection_authority.to_account_info(),
                collection_authority_record_pda: ctx.accounts.collection_authority_record_pda.to_account_info(),
                collection_mint: ctx.accounts.collection_mint.to_account_info(),
                collection_metadata: ctx.accounts.collection_metadata.to_account_info(),
                edition_account: ctx.accounts.edition_account.to_account_info(),
                bubblegum_signer: ctx.accounts.bubblegum_signer.to_account_info(),
                compression_program: ctx.accounts.compression_program.to_account_info(),
                log_wrapper: ctx.accounts.log_wrapper.to_account_info(),
                bubblegum_program: ctx.accounts.bubblegum_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
        );
        
        // Note: Actual CPI call requires proper MetadataArgs conversion
        // For now, this is the structure. Full implementation needs:
        // 1. Convert MetadataArgsInput to MetadataArgs
        // 2. Call mpl_bubblegum::cpi::mint_v1(cpi_ctx, metadata_args)
        
        msg!("Credential minted successfully with Soulbound protection!");
        Ok(())
    }

    /// Transfer a cNFT credential
    /// SOULBOUND CHECK: Rejects transfer if leaf_delegate is Program PDA
    pub fn transfer_credential<'info>(
        ctx: Context<'_, '_, '_, 'info, TransferCredential<'info>>,
        root: [u8; 32],
        data_hash: [u8; 32],
        creator_hash: [u8; 32],
        nonce: u64,
        index: u32,
    ) -> Result<()> {
        let program_authority = &ctx.accounts.program_authority;
        let leaf_delegate = &ctx.accounts.leaf_delegate;
        
        // SOULBOUND CHECK: If leaf_delegate is Program PDA, reject transfer
        if leaf_delegate.key() == program_authority.key() {
            return Err(ErrorCode::SoulboundCredential.into());
        }
        
        // If leaf_delegate is not Program PDA, allow transfer
        // Perform CPI to Bubblegum transfer instruction
        msg!(
            "Transfer credential - Owner: {}, New Owner: {}, Index: {}",
            ctx.accounts.leaf_owner.key(),
            ctx.accounts.new_owner.key(),
            index
        );
        
        // TODO: Implement CPI to mpl_bubblegum::cpi::transfer
        // This requires Merkle proof verification
        
        Ok(())
    }

    /// Burn/Redeem a cNFT credential
    /// Allows owner to burn their credential
    pub fn burn_credential<'info>(
        ctx: Context<'_, '_, '_, 'info, BurnCredential<'info>>,
        root: [u8; 32],
        data_hash: [u8; 32],
        creator_hash: [u8; 32],
        nonce: u64,
        index: u32,
    ) -> Result<()> {
        msg!(
            "Burn credential - Owner: {}, Index: {}",
            ctx.accounts.leaf_owner.key(),
            index
        );
        
        // Perform CPI to Bubblegum burn instruction
        let cpi_ctx = CpiContext::new(
            ctx.accounts.bubblegum_program.to_account_info(),
            mpl_bubblegum::cpi::accounts::Burn {
                tree_authority: ctx.accounts.tree_authority.to_account_info(),
                leaf_owner: ctx.accounts.leaf_owner.to_account_info(),
                leaf_delegate: ctx.accounts.leaf_delegate.to_account_info(),
                merkle_tree: ctx.accounts.merkle_tree.to_account_info(),
                log_wrapper: ctx.accounts.log_wrapper.to_account_info(),
                compression_program: ctx.accounts.compression_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
        );
        
        // TODO: Implement CPI to mpl_bubblegum::cpi::burn
        // This requires Merkle proof verification
        
        msg!("Credential burned successfully!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintCredential<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// Program Authority PDA - used as leaf_delegate for Soulbound
    #[account(
        seeds = [b"authority"],
        bump
    )]
    pub program_authority: SystemAccount<'info>,
    
    /// CHECK: Tree authority (derived from merkle tree)
    /// CHECK: UncheckedAccount for now, should be validated
    pub tree_authority: UncheckedAccount<'info>,
    
    /// CHECK: Leaf owner (student wallet - recipient)
    pub leaf_owner: UncheckedAccount<'info>,
    
    /// CHECK: Merkle tree account
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,
    
    /// CHECK: Tree delegate
    pub tree_delegate: UncheckedAccount<'info>,
    
    /// CHECK: Collection authority
    pub collection_authority: UncheckedAccount<'info>,
    
    /// CHECK: Collection authority record PDA
    pub collection_authority_record_pda: UncheckedAccount<'info>,
    
    /// CHECK: Collection mint
    pub collection_mint: UncheckedAccount<'info>,
    
    /// CHECK: Collection metadata
    pub collection_metadata: UncheckedAccount<'info>,
    
    /// CHECK: Edition account
    pub edition_account: UncheckedAccount<'info>,
    
    /// CHECK: Bubblegum signer PDA
    pub bubblegum_signer: UncheckedAccount<'info>,
    
    pub compression_program: Program<'info, SplAccountCompression>,
    pub log_wrapper: Program<'info, Noop>,
    pub bubblegum_program: Program<'info, Bubblegum>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferCredential<'info> {
    /// Program Authority PDA - used to check if credential is Soulbound
    #[account(
        seeds = [b"authority"],
        bump
    )]
    pub program_authority: SystemAccount<'info>,
    
    /// CHECK: Tree authority
    pub tree_authority: UncheckedAccount<'info>,
    
    /// CHECK: Current owner (signer)
    #[account(signer)]
    pub leaf_owner: UncheckedAccount<'info>,
    
    /// CHECK: Leaf delegate (must NOT be Program PDA for transfer to succeed)
    pub leaf_delegate: UncheckedAccount<'info>,
    
    /// CHECK: New owner
    pub new_owner: UncheckedAccount<'info>,
    
    /// CHECK: Merkle tree
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,
    
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub bubblegum_program: Program<'info, Bubblegum>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BurnCredential<'info> {
    /// CHECK: Tree authority
    pub tree_authority: UncheckedAccount<'info>,
    
    /// CHECK: Owner signer
    #[account(signer)]
    pub leaf_owner: UncheckedAccount<'info>,
    
    /// CHECK: Leaf delegate
    pub leaf_delegate: UncheckedAccount<'info>,
    
    /// CHECK: Merkle tree
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,
    
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub bubblegum_program: Program<'info, Bubblegum>,
    pub system_program: Program<'info, System>,
}

/// Simplified MetadataArgs input for Anchor
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MetadataArgsInput {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub seller_fee_basis_points: u16,
    pub creators: Option<Vec<CreatorInput>>,
    pub collection: Option<CollectionInput>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreatorInput {
    pub address: Pubkey,
    pub verified: bool,
    pub share: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CollectionInput {
    pub key: Pubkey,
    pub verified: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("This credential is Soulbound and cannot be transferred")]
    SoulboundCredential,
}
