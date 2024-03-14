import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { BN } from 'bn.js';
import { TokenLocker } from '../target/types/token_locker';
import { PublicKey } from '@solana/web3.js';
import {
	ASSOCIATED_TOKEN_PROGRAM_ID,
	createMint,
	getOrCreateAssociatedTokenAccount,
	mintTo,
	TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
// import * as common from "@project-serum/common";
import { NodeWallet } from '@project-serum/common';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

describe('token-locker', () => {
	function sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	// Configure the client to use the local cluster.
	const baseAccount = anchor.web3.Keypair.generate();

	const provider = anchor.AnchorProvider.env();

	anchor.setProvider(provider);

	/*
	The functions within the token_locker module interact with the BaseAccount to initialize it, configure fee-related parameters, and perform various token locking and unlocking operations.

	In the initialize function, the BaseAccount instance is initialized with the provided fee-related parameters if it hasn't been initialized before.
	
	In the create_vesting function, the BaseAccount is consulted to calculate and deduct fees from the total amount being vested.
	
	In the unlock function, the BaseAccount is accessed to retrieve the bump seed used for generating derived account addresses.
	
	Overall, the BaseAccount serves as a central repository for important configuration and state data required by the token locker program.
	*/

	const feeAccount = new PublicKey(
		'FX9yNH3yRMUvmW5UASJ7nsQpnXvEhHF3i2xMBppwuU7t'
	);

	// Fee account is merely an account we dictate to receive fees, this can be anything but we want the fees to go to us

	const recipient = new PublicKey(
		'Bkj7fVXttCm2A5P53z2K5u16jb8HTxRb5LzQhhSakVfb'
	);

	// Recipient is the account that will receive the vested tokens after unlock, in this case the connected wallet is depositing and receiving

	//can't use mint here bc we need to use a local cluster
	// const mint = new PublicKey('H5mWy9iYTPWSB1mbSnMKoYdGggbH1QrUPkgqFJQabqbX');

	console.log('wallets initialized');

	//@ts-ignore
	const user: NodeWallet = provider.wallet;

	// const start = new BN(+new Date() / 1000 + 5);
	// const end = new BN(+new Date() / 1000 + 15);

	const start = new BN(+new Date('2024-03-12T01:24:00'));
	const end = new BN(+new Date('2024-03-14T12:24:00'));

	const program = anchor.workspace.TokenLocker as Program<TokenLocker>;
	let mint: PublicKey;
	let userToken;

	console.log('conneccted wallet', user.publicKey.toBase58());

	// console.log('Your provider', provider.connection);
	// console.log('Your user.payer', user.payer.publicKey);
	// console.log('Your user.pubkey', user.publicKey);

	before(async () => {
		//

		// mint
		// mint = await createMint(
		// 	provider.connection,
		// 	user.payer,
		// 	user.publicKey,
		// 	user.publicKey,
		// 	DECIMALS
		// );

		mint = new PublicKey('H5mWy9iYTPWSB1mbSnMKoYdGggbH1QrUPkgqFJQabqbX');

		console.log('user balance of mint', mint);

		// console.log('Your mint', mint);
		// get user associated token account
		userToken = await getOrCreateAssociatedTokenAccount(
			provider.connection,
			user.payer,
			mint,
			user.publicKey
		);
		await delay(10000);
		// console.log('usertoken.address', userToken.address.toBase58());
		// mint
		// await mintTo(
		// 	provider.connection,
		// 	user.payer,
		// 	mint,
		// 	userToken.address,
		// 	user.publicKey,
		// 	10 * anchor.web3.LAMPORTS_PER_SOL
		// );
		// console.log('minting');
	});

	it('Is initialized!', async () => {
		// Add your test here.
		const tx = await program.methods
			.initialize(new BN(1), new BN(3 * anchor.web3.LAMPORTS_PER_SOL))
			.accounts({
				baseAccount: baseAccount.publicKey,
				owner: provider.wallet.publicKey,
				feeAccount: feeAccount,
				systemProgram: anchor.web3.SystemProgram.programId,
			})
			.signers([baseAccount])
			.rpc();
		console.log('Your transaction signature', tx);
	});

	// Note that this (create user stats) should be done in tandem with the initialize function, if we're already putting in an address and pressing continue we may as well also get this part done. If it fails, revert to a version that has no user stats set.

	it('create user stats', async () => {
		const [userStatsPDA, _] = PublicKey.findProgramAddressSync(
			[
				anchor.utils.bytes.utf8.encode('user-stats'),
				provider.wallet.publicKey.toBuffer(),
			],
			program.programId
		);

		await program.methods
			.createUserStats()
			.accounts({
				user: provider.wallet.publicKey,
				userStats: userStatsPDA,
				systemProgram: anchor.web3.SystemProgram.programId,
			})
			.rpc();
	});

	it('Creating vesting', async () => {
		const [userStatsPDA, _] = PublicKey.findProgramAddressSync(
			[
				anchor.utils.bytes.utf8.encode('user-stats'),
				provider.wallet.publicKey.toBuffer(),
			],
			program.programId
		);
		const [vaultPDA, nonce] = PublicKey.findProgramAddressSync(
			[baseAccount.publicKey.toBuffer()],
			program.programId
		);
		const recipientToken = await getOrCreateAssociatedTokenAccount(
			provider.connection,
			user.payer,
			mint,
			recipient
		);
		const feeToken = await getOrCreateAssociatedTokenAccount(
			provider.connection,
			user.payer,
			mint,
			feeAccount
		);
		const tx = await program.methods
			.createVesting(
				new BN(10 * anchor.web3.LAMPORTS_PER_SOL),
				start,
				end,
				true,
				nonce
			)
			.accounts({
				user: user.publicKey,
				userStats: userStatsPDA,
				userToken: userToken.address,
				recipient: recipient,
				recipientToken: recipientToken.address,
				feeToken: feeToken.address,
				mint: mint,
				vault: vaultPDA,
				clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
				tokenProgram: TOKEN_PROGRAM_ID,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				baseAccount: baseAccount.publicKey,
				feeAccount: feeAccount,
			})
			.signers([])
			.rpc();
		console.log('Your transaction signature', tx);
	});

	it('unlock', async () => {
		await sleep(30000);
		const [userStatsPDA, _] = PublicKey.findProgramAddressSync(
			[
				anchor.utils.bytes.utf8.encode('user-stats'),
				provider.wallet.publicKey.toBuffer(),
			],
			program.programId
		);

		const account = await program.account.userStats.fetch(userStatsPDA);
		const vestList = account.vestList;
		const [vaultPDA, nonce] = PublicKey.findProgramAddressSync(
			[baseAccount.publicKey.toBuffer()],
			program.programId
		);
		const recipientToken = await getOrCreateAssociatedTokenAccount(
			provider.connection,
			user.payer,
			mint,
			recipient
		);

		const tx = await program.methods
			.unlock(vestList.length - 1, new BN(10 * anchor.web3.LAMPORTS_PER_SOL))
			.accounts({
				user: user.publicKey,
				userStats: userStatsPDA,
				recipientToken: recipientToken.address,
				mint: mint,
				vault: vaultPDA,
				clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
				tokenProgram: TOKEN_PROGRAM_ID,
				baseAccount: baseAccount.publicKey,
			})
			.signers([])
			.rpc();
		console.log('Your transaction signature', tx);
	});
});
