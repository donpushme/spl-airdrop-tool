use anchor_lang::prelude::*;

#[account]
pub struct GlobalAccount {
    pub super_admin: Pubkey,
}

impl GlobalAccount {
    pub const DATA_SIZE: usize = 8 + std::mem::size_of::<GlobalAccount>();
}

#[account]
pub struct StoreAccount {
    pub host: Option<Pubkey>,
    pub client: Option<Pubkey>,
    pub sending_nfts: Vec<Pubkey>,  // Assuming this is a Vec since arrays need a fixed size
    pub recieving_nfts: Vec<Pubkey>, // Same as above
}

impl StoreAccount {
    pub const DATA_SIZE: usize = 8 + std::mem::size_of::<StoreAccount>();
}

