use crate::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        space = GlobalAccount::DATA_SIZE,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
        payer = admin
    )]
    pub global_account: Account<'info, GlobalAccount>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl Initialize<'_> {
    pub fn process_instruction(ctx:&mut Context<Self>) -> Result<()>{
        let global_account: &mut Account<'_, GlobalAccount> = &mut ctx.accounts.global_account;

        global_account.super_admin = ctx.accounts.admin.key();
    
        Ok(())
    }
}
