import React, { useCallback, useEffect, useRef } from 'react';
import Details from './Details';
import CommDatails from './CommissionDetails';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
	Transaction,
	SystemProgram,
	PublicKey,
	Account,
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
import { Program } from '@project-serum/anchor';
import { BN } from 'bn.js';

const programID = new PublicKey(idl.metadata.address);

const SendContractTransaction = () => {
	const { connection } = useConnection();
	const { publicKey, sendTransaction } = useWallet();

	const mint = new PublicKey('H5mWy9iYTPWSB1mbSnMKoYdGggbH1QrUPkgqFJQabqbX');
	const recipient = new PublicKey(
		'Bkj7fVXttCm2A5P53z2K5u16jb8HTxRb5LzQhhSakVfb'
	);
	const feeAccount = new PublicKey(
		'FX9yNH3yRMUvmW5UASJ7nsQpnXvEhHF3i2xMBppwuU7t'
	);
	const program = new Program(idl, programID, connection);
	const baseAccount = anchor.web3.Keypair.generate();
	const userToken = useRef(null);

	const start = new BN(+new Date('2024-03-12T01:24:00'));
	const end = new BN(+new Date('2024-03-14T12:24:00'));

	// Replace with actual lock info from DB and CA
	let lockInfo = {};

	useEffect(() => {
		async function getUserToken() {
			if (!publicKey) {
				return;
			}
			const token = await getOrCreateAssociatedTokenAccount(
				connection,
				publicKey,
				mint,
				publicKey
			);
			userToken.current = token;
		}
		getUserToken();
	});

	const initializeLock = useCallback(async () => {
		if (!publicKey) {
			notify({ type: 'error', message: `Wallet not connected!` });
			console.log('error', `Send Transaction: Wallet not connected!`);
			return;
		}

		// console.log('user token', userToken.current);

		let signature = '';

		try {
			const tx = new Transaction().add(
				program.instruction.initialize(
					new BN(1),
					new BN(3 * anchor.web3.LAMPORTS_PER_SOL),
					{
						accounts: {
							baseAccount: baseAccount.publicKey,
							owner: publicKey,
							feeAccount,
							systemProgram: SystemProgram.programId,
						},
						signers: [baseAccount],
					}
				)
			);

			signature = await sendTransaction(tx, connection, {
				signers: [baseAccount],
			});

			signature = await sendTransaction(tx, connection);

			await connection.confirmTransaction(signature, 'confirmed');

			console.log(signature);
			notify({
				type: 'success',
				message: 'Transaction successful!',
				txid: signature,
			});
		} catch (error) {
			console.log('error', `Transaction failed! ${error?.message}`);
			notify({
				type: 'error',
				message: `Transaction failed!`,
				description: error?.message,
				txid: signature,
			});
		}
	}, [connection, publicKey, sendTransaction]);

	return (
		<div className='flex lg:flex-row flex-col lg:space-x-5 lg:space-y-0 space-y-5 mt-5 min-w-7xl max-w-7xl mx-auto'>
			<div className='grow rounded-xl bg-[#092E3A] p-7 lg:mx-0 mx-5 text-left'>
				<h2 className='text-2xl text-white pb-0 mb-0'>
					Enter Lock Information
				</h2>
				<hr className='border-[#1e4957] pb-1 mt-5' />

				<div className='mb-10 mt-5'>
					<h2 className='text-2xl text-white pb-0 mb-5'>Step 1:</h2>
					<p className='mb-5'>
						Make sure the wallet you wish to lock with is connected, then press
						the Reserve Slot button to create a space especially for your lock.
					</p>
					<button
						className='px-10 sm:w-full py-3 bg-gradient-to-b rounded from-[#5892a5] to-[#095670] items-center'
						onClick={() => initializeLock()}
					>
						Reserve Slot
					</button>
				</div>
				<h2 className='text-2xl text-white pb-0 mb-3'>Step 2:</h2>
				<form
					// onSubmit={(e) => sendSolana(e)}
					className='mt-5'
				>
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

// import React, { useCallback } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
// import { notify } from '../utils/notifications';
// import idl from '../idl/token_locker.json';
// import { Program } from '@project-serum/anchor';

// const programID = new PublicKey(idl.metadata.address);

// const SendContractTransaction = () => {
// 	const { connection } = useConnection();
// 	const { publicKey, sendTransaction } = useWallet();

// 	const onClick = useCallback(async () => {
// 		if (!publicKey) {
// 			notify({ type: 'error', message: `Wallet not connected!` });
// 			console.log('error', `Send Transaction: Wallet not connected!`);
// 			return;
// 		}

// 		let signature = '';
// 		try {
// 			const program = new Program(idl, programID, connection);
// 			const tx = new Transaction().add(
// 				SystemProgram.transfer({
// 					fromPubkey: publicKey,
// 					toPubkey: program.programId,
// 					lamports: 1_000_000,
// 				})
// 			);

// 			signature = await sendTransaction(tx, connection);

// 			await connection.confirmTransaction(signature, 'confirmed');

// 			console.log(signature);
// 			notify({
// 				type: 'success',
// 				message: 'Transaction successful!',
// 				txid: signature,
// 			});
// 		} catch (error) {
// 			console.log('error', `Transaction failed! ${error?.message}`);
// 			notify({
// 				type: 'error',
// 				message: `Transaction failed!`,
// 				description: error?.message,
// 				txid: signature,
// 			});
// 		}
// 	}, [connection, publicKey, sendTransaction]);

// 	return <button onClick={onClick}>Send Contract Transaction</button>;
// };

// export default SendContractTransaction;
