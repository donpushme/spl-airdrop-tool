use anchor_lang::{prelude::*, AnchorDeserialize};

pub mod instructions;
pub mod constants;
pub mod state;
use instructions::*;
use constants::*;
use state::*;

declare_id!("9jN2iuZGCRbBa1gBsvEjEqr3SmaDAzPzsqGNEXH3DkxN");

#[program]
pub mod swap {
    use super::*;

    /**
     * Initialize global account
     * super admin sets to the caller of this instruction
     */
    pub fn initialize(mut ctx: Context<Initialize>) -> Result<()> {
        Initialize::process_instruction(&mut ctx)
    }

    /**
     * Initialize the temparory PDA to store NFTs
     */
    pub fn init_store(mut ctx:Context<InitStore>) -> Result<()> {
        InitStore::process_instruction(&mut ctx)
    }
}