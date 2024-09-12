use crate::*;

#[derive(Accounts)]
pub struct InitStore<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        space = StoreAccount::DATA_SIZE,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
        payer = admin
    )]
    pub store_account: Account<'info, StoreAccount>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl InitStore<'_> {
    pub fn process_instruction(ctx:&mut Context<Self>) -> Result<()>{
        let store_account: &mut Account<'_, StoreAccount> = &mut ctx.accounts.store_account;
        store_account.host = None;
        store_account.client = None;
        store_account.sending_nfts = Vec::new();
        store_account.recieving_nfts = Vec::new();
        Ok(())
    }
}