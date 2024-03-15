import React, {
	useCallback,
	useEffect,
	useRef,
	useMemo,
	useState,
} from 'react';
import Details from './Details';
import CommDatails from './CommissionDetails';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
	Transaction,
	SystemProgram,
	PublicKey,
	Account,
	Connection,
	getParsedTranscation,
	clusterApiUrl,
} from '@solana/web3.js';
import { notify } from '../utils/notifications';
import {
	ASSOCIATED_TOKEN_PROGRAM_ID,
	getOrCreateAssociatedTokenAccount,
	TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_green.css';
import idl from '../idl/token_locker.json';
import * as anchor from '@project-serum/anchor';
import {
	Program,
	setProvider,
	web3,
	AnchorProvider,
	signAndSendTransaction,
} from '@project-serum/anchor';
import {
	NetworkConfigurationProvider,
	useNetworkConfiguration,
} from '../contexts/NetworkConfigurationProvider';
import { BN } from 'bn.js';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
	'https://ipudikgouqovvhvvwege.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdWRpa2dvdXFvdnZodnZ3ZWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk0NjkxMDUsImV4cCI6MjAyNTA0NTEwNX0.P9BLA8DB-fYzIanWDr92Pfwt5wyKMzgxdDeKu7731x0'
);

const SendContractTransaction = () => {
	const { publicKey, sendTransaction } = useWallet();
	const [loadedProvider, setLoadedProvider] = useState(null);

	const { networkConfiguration } = useNetworkConfiguration();
	const network = networkConfiguration;
	const endpoint = useMemo(() => clusterApiUrl(network), [network]);
	const connection = useMemo(() => new Connection(endpoint), [endpoint]);
	const programID = new PublicKey(idl.metadata.address);

	// const wallet = useWallet();
	const wallet = useWallet();

	const provider = new AnchorProvider(connection, wallet, {
		commitment: 'processed',
	});
	const program = new Program(idl, programID, provider);

	useEffect(() => {
		if (provider.wallet?.publicKey) {
			console.log('proggggg', provider);
			setLoadedProvider(provider);
			console.log('THE PROVIDER', loadedProvider, 'provider itself', provider);
			notify({
				type: 'success',
				message: `Wallet connected: ${provider.wallet.publicKey}`,
			});
		} else {
			console.log('nuttin');
		}
	}, [provider.wallet]);

	useEffect(() => {
		console.log('THE PROVIDER ZZZZ', loadedProvider);
	}, [loadedProvider]);

	const mint = new PublicKey('H5mWy9iYTPWSB1mbSnMKoYdGggbH1QrUPkgqFJQabqbX');
	const recipient = new PublicKey(
		'Bkj7fVXttCm2A5P53z2K5u16jb8HTxRb5LzQhhSakVfb'
	);
	const feeAccount = new PublicKey(
		'FX9yNH3yRMUvmW5UASJ7nsQpnXvEhHF3i2xMBppwuU7t'
	);

	// const program = new Program(idl, programID, connection);
	const baseAccount = anchor.web3.Keypair.generate();
	const userToken = useRef(null);

	const start = new BN(+new Date('2024-03-12T01:24:00'));
	const end = new BN(+new Date('2024-03-14T12:24:00'));

	let userdata;

	// Replace with actual lock info from DB and CA
	let lockInfo = {};

	useEffect(() => {
		if (!loadedProvider) return;

		if (loadedProvider.wallet.publicKey) {
			async function getUserToken() {
				console.log('provider is loaded...', connection);
				const token = await getOrCreateAssociatedTokenAccount(
					connection,
					baseAccount.publicKey,
					mint,
					loadedProvider.wallet.publicKey
				);
				userToken.current = token;
			}
			getUserToken();
		}
	}, [loadedProvider]);

	const initializeLock = useCallback(async () => {
		if (!loadedProvider) {
			notify({ type: 'error', message: `Wallet not connected!` });
			console.log('error', `Send Transaction: Wallet not connected!`);
			return;
		}

		try {
			const transaction = await program.methods
				.initialize(new BN(1), new BN(3 * anchor.web3.LAMPORTS_PER_SOL))
				.accounts({
					baseAccount: baseAccount.publicKey,
					owner: loadedProvider.wallet.publicKey,
					feeAccount: feeAccount,
					systemProgram: anchor.web3.SystemProgram.programId,
				})
				.signers([baseAccount])
				.rpc();

			// console.log('lewall', wallet);

			notify({
				type: 'success',
				message: `Slot Reserved!`,
				description: transaction,
			});

			// await web3.sendAndConfirmTransaction(connection, transaction, [
			// 	baseAccount,
			// ]);
		} catch (error) {
			console.log('error', `Transaction failed! ${error?.message}`);
			notify({
				type: 'error',
				message: `Transaction failed!`,
				description: error?.message,
			});
		}
		createUserStats();
	}, [loadedProvider]);

	const createUserStats = useCallback(async () => {
		if (!loadedProvider) {
			notify({ type: 'error', message: `Wallet not connected!` });
			console.log('error', `Send Transaction: Wallet not connected!`);
			return;
		}

		try {
			const [userStatsPDA, _] = PublicKey.findProgramAddressSync(
				[
					anchor.utils.bytes.utf8.encode('user-stats'),
					loadedProvider.wallet.publicKey.toBuffer(),
				],
				program.programId
			);

			userdata = await program.methods
				.createUserStats()
				.accounts({
					user: loadedProvider.wallet.publicKey,
					userStats: userStatsPDA,
					systemProgram: anchor.web3.SystemProgram.programId,
				})
				.rpc();
		} catch (error) {
			console.log('error', `Transaction failed! ${error?.message}`);
			notify({
				type: 'error',
				message: `Transaction failed!`,
				description: error?.message,
			});
		}
	}, [loadedProvider]);

	async function doVesting(e) {
		e.preventDefault();
		const [userStatsPDA, _] = PublicKey.findProgramAddressSync(
			[
				anchor.utils.bytes.utf8.encode('user-stats'),
				loadedProvider.wallet.publicKey.toBuffer(),
			],
			program.programId
		);
		const [vaultPDA, nonce] = PublicKey.findProgramAddressSync(
			[baseAccount.publicKey.toBuffer()],
			program.programId
		);
		const recipientToken = await getOrCreateAssociatedTokenAccount(
			connection,
			baseAccount.publicKey,
			mint,
			loadedProvider.wallet.publicKey
		);
		const feeToken = await getOrCreateAssociatedTokenAccount(
			connection,
			baseAccount.publicKey,
			mint,
			feeAccount
		);

		// console.log('fee token done', feeToken.address.toString());

		const userToken = await getOrCreateAssociatedTokenAccount(
			connection,
			baseAccount.publicKey,
			mint,
			loadedProvider.wallet.publicKey
		);

		console.log('got user token', userToken);

		const tx = await program.methods
			.createVesting(
				new BN(10 * anchor.web3.LAMPORTS_PER_SOL),
				start,
				end,
				true,
				nonce
			)
			.accounts({
				user: loadedProvider.wallet.publicKey,
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
		console.log('done!!');
		console.log('Your transaction signature', tx);
		console.log(
			'Time expire set:',
			end,
			'clock:',
			anchor.web3.SYSVAR_CLOCK_PUBKEY
		);
	}

	return (
		<div className='flex lg:flex-row flex-col lg:space-x-5 lg:space-y-0 space-y-5 mt-5 min-w-7xl max-w-7xl mx-auto'>
			<div className='grow rounded-xl bg-[#092E3A] p-7 lg:mx-0 mx-5 text-left'>
				<h2 className='text-2xl text-white pb-0 mb-0'>Lock Setup</h2>
				<hr className='border-[#1e4957] pb-1 mt-5' />

				<div className='mb-10 mt-5'>
					<h2 className='text-2xl text-white pb-0 mb-5'>Step 1:</h2>
					<p className='mb-5 lg:max-w-4xl'>
						Make sure the wallet you wish to lock with is connected, then press
						the Reserve Slot button to create a space especially for your lock.
						You will see two transactions happen, and each will cost a very
						small amount of SOL.
					</p>
					<button
						className='px-10 sm:w-full py-3 bg-gradient-to-b rounded from-[#5892a5] to-[#095670] items-center'
						onClick={() => initializeLock()}
					>
						Reserve Slot
					</button>
					{/* <button
						className='px-10 sm:w-full py-3 bg-gradient-to-b rounded from-[#5892a5] to-[#095670] items-center'
						onClick={() => createUserStats()}
					>
						User Data
					</button> */}
				</div>
				<h2 className='text-2xl text-white pb-0 mb-3'>Step 2:</h2>
				<p className='mb-5 lg:max-w-4xl'>
					Enter your lock information below. Be sure to double-check it, as it
					is immutable once submitted. The lock will be tied to the expiration
					date, which once set cannot be unlocked by anyone for any reason.
				</p>
				<form onSubmit={(e) => doVesting(e)} className='mt-5'>
					<div className='mb-5'>
						<label
							htmlFor='name'
							className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
						>
							Lock Name
						</label>
						<input
							type='text'
							id='lockname'
							// value={lockInfo.name}
							// onChange={(e) => handleChange(e, 'name')}
							className='bg-[#1e4957] border border-[#346b7d] text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
							placeholder='Token LP Lock'
							required
						/>
					</div>
					<div className='mb-5'>
						<label
							htmlFor='token'
							className='block mb-2 text-sm font-medium text-white dark:text-white'
						>
							Select Your Token
						</label>

						<select
							id='token'
							// value={selectedToken}
							// onChange={handleTokenChange}
							className='minimal bg-[#1e4957] border border-[#346b7d] text-gray-200 text-sm rounded-lg focus:ring-[#1e4957] focus:border-[#1e4957] block w-full p-2.5 disabled:text-slate-500'
						>
							<option>-- Select a token --</option>
							{/* {tokens.map((token) => (
	                            <option key={token.address} value={token.address}>
	                                {token.address}
	                            </option>
	                        ))} */}
						</select>
					</div>
					<div className='mb-5'>
						<label
							htmlFor='amount'
							className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
						>
							Lock Amount
							{/* {lockInfo.amount && (
										<span className=''> - ({lockInfo.amount} available)</span>
									)} */}
						</label>
						<div className='flex items-center'>
							<input
								type='text'
								id='amount'
								// value={lockInfo.amount}
								// onChange={(e) => handleChange(e, 'amount')}
								className='bg-[#1e4957] border border-[#346b7d] text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
								placeholder="EG '100000000'"
								required
							/>
						</div>
					</div>
					<div className='mb-4'>
						<label
							htmlFor='owner'
							className='block mb-2 text-sm font-medium text-white dark:text-white'
						>
							Lock Owner
						</label>
						<input
							type='text'
							id='owner'
							// value={ownerWallet}
							// onChange={(e) => handleChange(e, 'owner')}
							className='bg-[#1e4957] border border-[#346b7d] text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
							required
						/>
					</div>

					<input
						type='text'
						hidden
						id='decimals'
						// value={selectedDecimals}
						// onChange={(e) => handleChange(e, 'decimals')}
						className='bg-[#1e4957] border border-[#346b7d] text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 hidden'
					/>

					<div className='' suppressHydrationWarning>
						<label
							htmlFor='LockTime'
							className='block mb-2 text-sm font-medium text-white dark:text-white'
						>
							Lock Date/Time
						</label>
						<Flatpickr
							id='LockTime'
							options={{ enableTime: true }}
							// value={lockInfo.date} // Convert ISO string to Date object
							className='text-white bg-[#1e4957] border border-[#346b7d] rounded-lg m-0 w-auto min-w-0 py-2 text-center formtime'
							// onChange={(value) => handleChange(value, 'date')} // Use "date" as id
						/>
					</div>
					<div className='mb-5 mt-6'>
						<input
							type='submit'
							id='submit'
							className='bg-gradient-to-t from-[#1e4553] to-[#103642] border border-[#33788f] text-white uppercase text-base rounded-lg font-bold cursor-pointer focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
							// disabled={!publicKey}
						/>
					</div>
				</form>
			</div>
			<div className='flex-col space-y-5'>
				<div className='flex-none rounded-xl bg-[#092E3A] p-7 flex flex-col space-y-5 lg:mx-0 mx-5'>
					<Details
						lockInfo={lockInfo.name}
						lockToken={lockInfo.token}
						lockOwner={lockInfo.owner}
						lockDate={lockInfo.date}
						lockAmount={lockInfo.amount}
					/>
				</div>
				<div className='flex-none rounded-xl bg-[#092E3A] p-7 flex flex-col space-y-5 lg:mx-0 mx-5'>
					<CommDatails />
				</div>
			</div>
		</div>
	);
};

export default SendContractTransaction;
