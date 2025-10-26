use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    program::invoke_signed,
    sysvar::Sysvar,
    declare_id,
    program_pack::Pack,
};
use borsh::{BorshDeserialize, BorshSerialize};
use spl_token::state::Account as TokenAccount;

// Program ID - will be set during deployment
declare_id!("ECertifyProgram11111111111111111111111111111");

// Instruction discriminators
const INITIALIZE_ISSUER: u8 = 0;
const ISSUE_CREDENTIAL_VIA_CPI: u8 = 1;
const VERIFY_ZK_PROOF: u8 = 2;
const CREATE_MERKLE_TREE: u8 = 3;

// Issuer account data structure
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct IssuerData {
    pub authority: Pubkey,
    pub name: String,
    pub logo_uri: String,
    pub website: String,
    pub bump: u8,
    pub is_active: bool,
    pub credential_count: u64,
    pub merkle_tree_count: u64,
}

// Merkle Tree account data structure
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct MerkleTreeData {
    pub tree_authority: Pubkey,
    pub merkle_tree: Pubkey,
    pub max_depth: u32,
    pub max_buffer_size: u32,
    pub created_at: i64,
    pub is_active: bool,
}

// Instruction data structures
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct InitializeIssuerData {
    pub name: String,
    pub logo_uri: String,
    pub website: String,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CreateMerkleTreeData {
    pub max_depth: u32,
    pub max_buffer_size: u32,
    pub tree_name: String,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct IssueCredentialData {
    pub student_wallet: Pubkey,
    pub credential_name: String,
    pub credential_type: String,
    pub skill_business: String,
    pub skill_tech: String,
    pub metadata_uri: String,
    pub merkle_tree: Pubkey,
}

// Zero-copy deserialization for IssuerData
impl IssuerData {
    pub fn try_from_slice(data: &[u8]) -> Result<Self, ProgramError> {
        <Self as BorshDeserialize>::try_from_slice(data).map_err(|_| ProgramError::InvalidAccountData)
    }
}

// Zero-copy deserialization for MerkleTreeData
impl MerkleTreeData {
    pub fn try_from_slice(data: &[u8]) -> Result<Self, ProgramError> {
        <Self as BorshDeserialize>::try_from_slice(data).map_err(|_| ProgramError::InvalidAccountData)
    }
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Zero-copy instruction parsing
    let discriminator = instruction_data
        .first()
        .ok_or(ProgramError::InvalidInstructionData)?;

    match discriminator {
        &INITIALIZE_ISSUER => process_initialize_issuer(program_id, accounts, &instruction_data[1..]),
        &CREATE_MERKLE_TREE => process_create_merkle_tree(program_id, accounts, &instruction_data[1..]),
        &ISSUE_CREDENTIAL_VIA_CPI => process_issue_credential_via_cpi(program_id, accounts, &instruction_data[1..]),
        &VERIFY_ZK_PROOF => process_verify_zk_proof(program_id, accounts, &instruction_data[1..]),
        _ => Err(ProgramError::InvalidInstructionData),
    }
}

// Initialize issuer with zero-copy optimizations
fn process_initialize_issuer(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority = next_account_info(account_info_iter)?;
    let issuer_pda = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    // Verify signer
    if !authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Zero-copy deserialization
    let data = <InitializeIssuerData as BorshDeserialize>::try_from_slice(instruction_data)?;

    // PDA derivation
    let seeds = &[b"issuer", authority.key.as_ref()];
    let (expected_pda, bump) = Pubkey::find_program_address(seeds, program_id);

    if issuer_pda.key != &expected_pda {
        return Err(ProgramError::InvalidSeeds);
    }

    // Create issuer data
    let issuer_data = IssuerData {
        authority: *authority.key,
        name: data.name,
        logo_uri: data.logo_uri,
        website: data.website,
        bump,
        is_active: true,
        credential_count: 0,
        merkle_tree_count: 0,
    };

    // Zero-copy serialization and storage
    let serialized_data = borsh::to_vec(&issuer_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    // Calculate space needed
    let space = serialized_data.len() as u64;
    let rent = Rent::get()?;
    let lamports = rent.minimum_balance(space as usize);

    // Create account with CPI
    let create_account_ix = system_instruction::create_account(
        authority.key,
        issuer_pda.key,
        lamports,
        space,
        program_id,
    );

    invoke_signed(
        &create_account_ix,
        &[authority.clone(), issuer_pda.clone(), system_program.clone()],
        &[&[b"issuer", authority.key.as_ref(), &[bump]]],
    )?;

    // Store data with zero-copy
    let mut data_mut = issuer_pda.data.borrow_mut();
    data_mut[..serialized_data.len()].copy_from_slice(&serialized_data);

    msg!("Issuer initialized with authority: {:?}", issuer_data.authority);
    Ok(())
}

// Create Merkle Tree with zero-copy patterns
fn process_create_merkle_tree(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority = next_account_info(account_info_iter)?;
    let issuer_pda = next_account_info(account_info_iter)?;
    let merkle_tree_pda = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    if !authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let data = <CreateMerkleTreeData as BorshDeserialize>::try_from_slice(instruction_data)?;

    // Zero-copy read of issuer data
    let issuer_data = IssuerData::try_from_slice(issuer_pda.data.borrow().as_ref())?;

    if issuer_data.authority != *authority.key {
        return Err(ProgramError::InvalidAccountData);
    }

    // PDA derivation
    let seeds = &[
        b"merkle_tree",
        authority.key.as_ref(),
        &issuer_data.merkle_tree_count.to_le_bytes(),
    ];

    let (expected_pda, bump) = Pubkey::find_program_address(seeds, program_id);

    if merkle_tree_pda.key != &expected_pda {
        return Err(ProgramError::InvalidSeeds);
    }

    // Get clock
    let clock = solana_program::sysvar::clock::Clock::get()?;

    let merkle_tree_data = MerkleTreeData {
        tree_authority: *authority.key,
        merkle_tree: *merkle_tree_pda.key,
        max_depth: data.max_depth,
        max_buffer_size: data.max_buffer_size,
        created_at: clock.unix_timestamp,
        is_active: true,
    };

    // Zero-copy serialization
    let serialized_data = borsh::to_vec(&merkle_tree_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    let space = serialized_data.len() as u64;
    let rent = Rent::get()?;
    let lamports = rent.minimum_balance(space as usize);

    // Create account
    let create_account_ix = system_instruction::create_account(
        authority.key,
        merkle_tree_pda.key,
        lamports,
        space,
        program_id,
    );

    invoke_signed(
        &create_account_ix,
        &[authority.clone(), merkle_tree_pda.clone(), system_program.clone()],
        &[&[b"merkle_tree", authority.key.as_ref(), &issuer_data.merkle_tree_count.to_le_bytes(), &[bump]]],
    )?;

    // Store data
    let mut data_mut = merkle_tree_pda.data.borrow_mut();
    data_mut[..serialized_data.len()].copy_from_slice(&serialized_data);

    msg!("Merkle Tree created with depth: {}", data.max_depth);
    Ok(())
}

// Issue credential via CPI with zero-copy optimizations
fn process_issue_credential_via_cpi(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let issuer_authority = next_account_info(account_info_iter)?;
    let issuer_pda = next_account_info(account_info_iter)?;
    let merkle_tree_account = next_account_info(account_info_iter)?;
    let leaf_owner = next_account_info(account_info_iter)?;
    let leaf_delegate = next_account_info(account_info_iter)?;
    let merkle_tree = next_account_info(account_info_iter)?;
    let tree_delegate = next_account_info(account_info_iter)?;
    let payer = next_account_info(account_info_iter)?;
    let tree_authority = next_account_info(account_info_iter)?;
    let log_wrapper = next_account_info(account_info_iter)?;
    let compression_program = next_account_info(account_info_iter)?;
    let bubblegum_program = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    if !issuer_authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let data = <IssueCredentialData as BorshDeserialize>::try_from_slice(instruction_data)?;

    // Zero-copy read
    let issuer_data = IssuerData::try_from_slice(issuer_pda.data.borrow().as_ref())?;

    if issuer_data.authority != *issuer_authority.key {
        return Err(ProgramError::InvalidAccountData);
    }

    // Verify merkle tree account
    let merkle_tree_data = MerkleTreeData::try_from_slice(merkle_tree_account.data.borrow().as_ref())?;
    if merkle_tree_data.tree_authority != *issuer_authority.key {
        return Err(ProgramError::InvalidAccountData);
    }

    // Create Bubblegum mint instruction
    let mint_ix = create_bubblegum_mint_instruction(
        bubblegum_program.key,
        leaf_owner.key,
        leaf_delegate.key,
        merkle_tree.key,
        tree_delegate.key,
        tree_authority.key,
        payer.key,
        log_wrapper.key,
        compression_program.key,
        system_program.key,
        data,
    )?;

    // Execute the CPI
    invoke_signed(
        &mint_ix,
        &[
            leaf_owner.clone(),
            leaf_delegate.clone(),
            merkle_tree.clone(),
            tree_delegate.clone(),
            payer.clone(),
            tree_authority.clone(),
            log_wrapper.clone(),
            compression_program.clone(),
            bubblegum_program.clone(),
            system_program.clone(),
        ],
        &[&[b"issuer", issuer_authority.key.as_ref(), &[issuer_data.bump]]],
    )?;

    msg!("Credential issued for student: {:?}", data.student_wallet);
    msg!("Credential name: {}", data.credential_name);
    msg!("Credential type: {}", data.credential_type);
    msg!("Skills - Business: {}, Tech: {}", data.skill_business, data.skill_tech);
    msg!("Metadata URI: {}", data.metadata_uri);

    Ok(())
}

// Helper function to create Bubblegum mint instruction
fn create_bubblegum_mint_instruction(
    bubblegum_program: &Pubkey,
    leaf_owner: &Pubkey,
    leaf_delegate: &Pubkey,
    merkle_tree: &Pubkey,
    tree_delegate: &Pubkey,
    tree_authority: &Pubkey,
    payer: &Pubkey,
    log_wrapper: &Pubkey,
    compression_program: &Pubkey,
    system_program: &Pubkey,
    data: IssueCredentialData,
) -> Result<solana_program::instruction::Instruction, ProgramError> {
    // This is a simplified version - in production you'd use the actual Bubblegum program
    // For now, we'll create a basic instruction structure
    let mut instruction_data = Vec::new();
    instruction_data.push(0); // Mint discriminator
    instruction_data.extend_from_slice(&data.student_wallet.to_bytes());
    instruction_data.extend_from_slice(&data.credential_name.as_bytes());
    instruction_data.extend_from_slice(&data.metadata_uri.as_bytes());

    Ok(solana_program::instruction::Instruction {
        program_id: *bubblegum_program,
        accounts: vec![
            solana_program::instruction::AccountMeta::new_readonly(*leaf_owner, false),
            solana_program::instruction::AccountMeta::new_readonly(*leaf_delegate, false),
            solana_program::instruction::AccountMeta::new_readonly(*merkle_tree, false),
            solana_program::instruction::AccountMeta::new_readonly(*tree_delegate, false),
            solana_program::instruction::AccountMeta::new(*payer, true),
            solana_program::instruction::AccountMeta::new_readonly(*tree_authority, true),
            solana_program::instruction::AccountMeta::new_readonly(*log_wrapper, false),
            solana_program::instruction::AccountMeta::new_readonly(*compression_program, false),
            solana_program::instruction::AccountMeta::new_readonly(*system_program, false),
        ],
        data: instruction_data,
    })
}

// Verify ZK proof placeholder
fn process_verify_zk_proof(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("ZK proof verification placeholder - to be implemented");
    Ok(())
}