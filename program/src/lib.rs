use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
    program_pack::Pack,
};

// Declare the program ID
solana_program::declare_id!("A9wy4icR7uQnffj16zLDonoaSt4dhwaMudLo34nfccej");

// Program entrypoint
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("E-Certify program entrypoint");

    // Parse instruction data
    if instruction_data.is_empty() {
        return Err(ProgramError::InvalidInstructionData);
    }

    let instruction = instruction_data[0];
    match instruction {
        0 => {
            msg!("Initialize Issuer instruction");
            initialize_issuer(program_id, accounts, &instruction_data[1..])
        }
        1 => {
            msg!("Create Merkle Tree instruction");
            create_merkle_tree(program_id, accounts, &instruction_data[1..])
        }
        2 => {
            msg!("Issue Credential instruction");
            issue_credential(program_id, accounts, &instruction_data[1..])
        }
        _ => {
            msg!("Unknown instruction: {}", instruction);
            Err(ProgramError::InvalidInstructionData)
        }
    }
}

fn initialize_issuer(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority = next_account_info(account_info_iter)?;
    let issuer_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    // Verify authority is signer
    if !authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Create issuer account
    let issuer_data = IssuerData {
        authority: *authority.key,
        name: "APEC University".to_string(),
        logo_uri: "https://apecgroup.net/logo.png".to_string(),
        website: "https://apecgroup.net".to_string(),
        bump: 0,
        is_active: true,
        credential_count: 0,
        merkle_tree_count: 0,
    };

    // In a real implementation, you would serialize and store this data
    msg!("Initialized issuer: {}", issuer_data.name);
    msg!("Authority: {}", issuer_data.authority);
    
    Ok(())
}

fn create_merkle_tree(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority = next_account_info(account_info_iter)?;
    let issuer_account = next_account_info(account_info_iter)?;
    let merkle_tree_account = next_account_info(account_info_iter)?;

    // Verify authority is signer
    if !authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    msg!("Created merkle tree for issuer: {}", issuer_account.key);
    
    Ok(())
}

fn issue_credential(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority = next_account_info(account_info_iter)?;
    let issuer_account = next_account_info(account_info_iter)?;

    // Verify authority is signer
    if !authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    msg!("Issuing credential via CPI");
    msg!("Authority: {}", authority.key);
    msg!("Issuer: {}", issuer_account.key);
    
    Ok(())
}

#[derive(Debug)]
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

#[derive(Debug)]
pub struct MerkleTreeData {
    pub authority: Pubkey,
    pub merkle_tree: Pubkey,
    pub max_depth: u32,
    pub max_buffer_size: u32,
    pub tree_name: String,
    pub created_at: i64,
    pub is_active: bool,
}