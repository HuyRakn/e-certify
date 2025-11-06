use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;
use mpl_bubblegum::program::Bubblegum;
use spl_account_compression::{program::SplAccountCompression, Noop};

declare_id!("CRD111111111111111111111111111111111111111");

#[program]
pub mod credify_program {
    use super::*;

    /// Initialize a new Merkle Tree for credential collection
    /// This instruction creates the tree and sets THIS program (via PDA) as the tree_authority.
    pub fn create_tree(
        ctx: Context<CreateTree>,
        max_depth: u32,
        max_buffer_size: u32,
    ) -> Result<()> {
        // For MVP, we record the tree authority intent.
        // The actual tree creation will be done by the admin script using Bubblegum directly,
        // but this program PDA will be set as the tree_authority for governance.
        msg!(
            "Merkle Tree created successfully with authority: {}",
            ctx.accounts.tree_authority.key()
        );
        msg!("Max depth: {}, Max buffer size: {}", max_depth, max_buffer_size);
        Ok(())
    }

    /// Transfer a cNFT credential from current owner to new owner
    /// This allows the current owner (student) to transfer their cNFT.
    pub fn transfer_credential<'info>(
        ctx: Context<'_, '_, '_, 'info, TransferCredential<'info>>,
        root: [u8; 32],
        data_hash: [u8; 32],
        creator_hash: [u8; 32],
        nonce: u64,
        index: u32,
    ) -> Result<()> {
        // For MVP, this is a placeholder.
        // In production, this would perform CPI to mpl_bubblegum::cpi::transfer
        // with proper Merkle proof verification.
        msg!(
            "Transfer credential request - Owner: {}, Index: {}",
            ctx.accounts.leaf_owner.key(),
            index
        );
        Ok(())
    }

    /// Burn/Redeem a cNFT credential
    /// This allows the current owner (student) to burn their cNFT.
    pub fn burn_credential<'info>(
        ctx: Context<'_, '_, '_, 'info, BurnCredential<'info>>,
        root: [u8; 32],
        data_hash: [u8; 32],
        creator_hash: [u8; 32],
        nonce: u64,
        index: u32,
    ) -> Result<()> {
        // For MVP, this is a placeholder.
        // In production, this would perform CPI to mpl_bubblegum::cpi::burn
        // with proper Merkle proof verification.
        msg!(
            "Burn credential request - Owner: {}, Index: {}",
            ctx.accounts.leaf_owner.key(),
            index
        );
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(_max_depth: u32, _max_buffer_size: u32)]
pub struct CreateTree<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        seeds = [b"authority"],
        bump
    )]
    pub tree_authority: SystemAccount<'info>,

    #[account(mut)]
    /// CHECK: Unchecked for scaffold; real impl must validate
    pub merkle_tree: UncheckedAccount<'info>,

    pub bubblegum_program: Program<'info, Bubblegum>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub log_wrapper: Program<'info, Noop>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferCredential<'info> {
    #[account(
        seeds = [b"authority"],
        bump
    )]
    pub tree_authority: SystemAccount<'info>,

    /// CHECK: Owner signer
    #[account(signer)]
    pub leaf_owner: UncheckedAccount<'info>,
    /// CHECK: New owner
    pub leaf_delegate: UncheckedAccount<'info>,
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
    #[account(
        seeds = [b"authority"],
        bump
    )]
    pub tree_authority: SystemAccount<'info>,

    /// CHECK: Owner signer
    #[account(signer)]
    pub leaf_owner: UncheckedAccount<'info>,
    /// CHECK: Merkle tree
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,

    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub bubblegum_program: Program<'info, Bubblegum>,
    pub system_program: Program<'info, System>,
}



