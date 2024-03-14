import Details from './Details';
import CommDatails from './CommissionDetails';

import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_green.css';
import { notify } from '../utils/notifications';

import React from 'react';
import { useEffect, useState } from 'react';
import * as anchor from '@project-serum/anchor';
import {
	useConnection,
	useWallet,
	ConnectionProvider,
	WalletProvider,
} from '@solana/wallet-adapter-react';
import { Buffer } from 'buffer';
import idl from '../idl/token_locker.json'; //get the smartcontract data structure model from target folder in anchor rust
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils } from '@project-serum/anchor';
import { BN } from 'bn.js';
import {
	ASSOCIATED_TOKEN_PROGRAM_ID,
	getOrCreateAssociatedTokenAccount,
	TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

const programID = new PublicKey(idl.metadata.address);
const opts = {
	preflightCommitment: 'processed',
};

export default function LockerMain({ props }) {
	const [Loading, setLoading] = useState(false);
	const [datas, setData] = useState([]);
	const [walletaddress, setWalletAddress] = useState('');

	const { publicKey, sendTransaction } = useWallet();

	// console.log('main page call to wallet', wallet);

	useEffect(() => {
		if (!publicKey) {
			notify({
				type: 'error',
				message: 'Wallet needs to be connected to use the SolFi Locker.',
			});
		}
	}, [publicKey]);

	// console.log(publicKey);
	// notify({ type: 'error', message: `Transaction failed!`, description: error?.message, txid: signature });

	// const getProvider = () => {
	// 	//Creating a provider, the provider is authenication connection to solana
	// 	const connection = new Connection(network, opts.preflightCommitment);
	// 	const provider = new AnchorProvider(
	// 		connection,
	// 		window.solana,
	// 		opts.preflightCommitment
	// 	);
	// 	return provider;
	// };

	// // Reusable details
	// const provider = getProvider();
	const user = publicKey;
	const wallet = publicKey;
	const provider = WalletProvider;
	// console.log('prov', provider);

	// const sysProg = anchor.web3.SystemProgram.programId;

	const baseAccount = anchor.web3.Keypair.generate();
	const feeAccount = new PublicKey(
		'FX9yNH3yRMUvmW5UASJ7nsQpnXvEhHF3i2xMBppwuU7t'
	);

	//change this to be controlled by state.receipientField
	const recipient = new PublicKey(
		'Bkj7fVXttCm2A5P53z2K5u16jb8HTxRb5LzQhhSakVfb'
	);

	// console.log('base account', recipient.toString());

	const start = new BN(+new Date('2024-03-12T01:24:00'));
	const end = new BN(+new Date('2024-03-14T12:24:00'));
	const program = new Program(idl, programID, provider);

	// console.log(provider);

	// return <></>;

	// Change this to the field where they define their token
	let mint = new PublicKey('H5mWy9iYTPWSB1mbSnMKoYdGggbH1QrUPkgqFJQabqbX');
	let userToken;

	if (!provider.connection) {
		return;
	}

	console.log('provider', provider.connection, user, mint, user);

	async function beforeRun() {
		userToken = await getOrCreateAssociatedTokenAccount(
			provider.connection,
			user,
			mint,
			user
		);
	}

	// // Set Initialize
	// async function initializeLock() {
	// 	if (!provider) return;

	// 	await beforeRun();

	// 	const tx = await program.methods
	// 		.initialize(new BN(1), new BN(3 * anchor.web3.LAMPORTS_PER_SOL))
	// 		.accounts({
	// 			baseAccount: baseAccount.publicKey,
	// 			owner: provider.wallet.publicKey,
	// 			feeAccount: feeAccount,
	// 			systemProgram: anchor.web3.SystemProgram.programId,
	// 		})
	// 		.signers([baseAccount])
	// 		.rpc();

	// 	console.log('Your transaction signature', tx);

	// }

	// async function setUserData() {
	// 	const [userStatsPDA, _] = PublicKey.findProgramAddressSync(
	// 		[
	// 			anchor.utils.bytes.utf8.encode('user-stats'),
	// 			provider.wallet.publicKey.toBuffer(),
	// 		],
	// 		program.programId
	// 	);

	// 	let userdata = await program.methods
	// 		.createUserStats()
	// 		.accounts({
	// 			user: provider.wallet.publicKey,
	// 			userStats: userStatsPDA,
	// 			systemProgram: anchor.web3.SystemProgram.programId,
	// 		})
	// 		.rpc();

	// 	console.log('User data set, signature: ', userdata)
	// }

	// async function doVesting() {
	// 	const [userStatsPDA, _] = PublicKey.findProgramAddressSync(
	// 		[
	// 			anchor.utils.bytes.utf8.encode('user-stats'),
	// 			provider.wallet.publicKey.toBuffer(),
	// 		],
	// 		program.programId
	// 	);
	// 	const [vaultPDA, nonce] = PublicKey.findProgramAddressSync(
	// 		[baseAccount.publicKey.toBuffer()],
	// 		program.programId
	// 	);
	// 	const recipientToken = await getOrCreateAssociatedTokenAccount(
	// 		provider.connection,
	// 		user.payer,
	// 		mint,
	// 		recipient
	// 	);
	// 	const feeToken = await getOrCreateAssociatedTokenAccount(
	// 		provider.connection,
	// 		user.payer,
	// 		mint,
	// 		feeAccount
	// 	);

	// 	console.log('fee token done', feeToken.address.toString());

	// 	console.log('before actual vest');

	// 	// console.log(
	// 	//     'Start:', start, '\n',
	// 	//     'End:', end, '\n',
	// 	//     'Nonce:', nonce, '\n',
	// 	//     'user stats', userStatsPDA, '\n',
	// 	//     'User:', user.publicKey.toString(), '\n',
	// 	//     'User Token Address:', userToken.address.toString(), '\n',
	// 	//     'Recipient:', recipient.publicKey.toString(), '\n',
	// 	//     'Recipient Token Address:', recipientToken.address.toString(), '\n',
	// 	//     'Fee Token Address:', feeToken.address.toString(), '\n',
	// 	//     'Mint:', mint.toString(), '\n',
	// 	//     'Vault PDA:', vaultPDA.toString(), '\n',
	// 	//     'Anchor Web3 SYSVAR_CLOCK_PUBKEY:', anchor.web3.SYSVAR_CLOCK_PUBKEY.toString(), '\n',
	// 	//     'Token Program ID:', TOKEN_PROGRAM_ID.toString(), '\n',
	// 	//     'Associated Token Program ID:', ASSOCIATED_TOKEN_PROGRAM_ID.toString(), '\n',
	// 	//     'Base Account Public Key:', baseAccount.publicKey.toString(), '\n',
	// 	//     'Fee Account:', feeAccount.toString()
	// 	// );

	// 	console.log(userToken, userToken.address)

	// 	const tx = await program.methods
	// 		.createVesting(
	// 			new BN(10 * anchor.web3.LAMPORTS_PER_SOL),
	// 			start,
	// 			end,
	// 			true,
	// 			nonce
	// 		)
	// 		.accounts({
	// 			user: user.publicKey,
	// 			userStats: userStatsPDA,
	// 			userToken: userToken.address,
	// 			recipient: recipient,
	// 			recipientToken: recipientToken.address,
	// 			feeToken: feeToken.address,
	// 			mint: mint,
	// 			vault: vaultPDA,
	// 			clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
	// 			tokenProgram: TOKEN_PROGRAM_ID,
	// 			associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
	// 			baseAccount: baseAccount.publicKey,
	// 			feeAccount: feeAccount,
	// 		})
	// 		.signers([])
	// 		.rpc();
	// 	console.log('done!!');
	// 	console.log('Your transaction signature', tx);
	// 	console.log('Time expire set:', end, 'clock:', anchor.web3.SYSVAR_CLOCK_PUBKEY);
	// }

	// let lockInfo = "";

	// return (
	// 	<>
	// 		{/* <FeedPostDesign posts={datas} createPostFunction={createPostFunction} walletaddress={walletaddress} connect={connect} Loading={Loading} /> */}
	// 		<button className="text-white bg-black p-3 uppercase border border-white mt-10" onClick={() => initializeLock()}>Claim Your Lock Slot</button>
	// 		<button className="text-white bg-black p-3 uppercase border border-white mt-10" onClick={() => setUserData()}>User Data Next</button>
	// 		<button className="text-white bg-black p-3 uppercase border border-white mt-10" onClick={() => doVesting()}>Vest Now</button>

	// 		<div>
	// 			{/* {txId && <p>The transaction hash is {txId}</p>} */}
	// 			<ToastContainer position='top-center' autoClose={2000} />
	// 			<div className='flex lg:flex-row flex-col lg:space-x-5 lg:space-y-0 space-y-5 mt-5 max-w-7xl mx-auto'>
	// 				<div className='grow rounded-xl bg-[#092E3A] p-7 lg:mx-0 mx-5 text-left'>
	// 					<h2 className='text-2xl text-white pb-0 mb-0'>
	// 						Enter Lock Information
	// 					</h2>
	// 					<hr className='border-[#1e4957] pb-1 mt-5' />
	// 					<form
	// 						// onSubmit={(e) => sendSolana(e)}
	// 						className='mt-5'
	// 					>
	// 						<div className='mb-5'>
	// 							<label
	// 								htmlFor='name'
	// 								className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
	// 							>
	// 								Lock Name
	// 							</label>
	// 							<input
	// 								type='text'
	// 								id='lockname'
	// 								// value={lockInfo.name}
	// 								// onChange={(e) => handleChange(e, 'name')}
	// 								className='bg-[#1e4957] border border-[#346b7d] text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
	// 								placeholder='Token LP Lock'
	// 								required
	// 							/>
	// 						</div>
	// 						<div className='mb-5'>
	// 							<label
	// 								htmlFor='token'
	// 								className='block mb-2 text-sm font-medium text-white dark:text-white'
	// 							>
	// 								Select Your Token
	// 							</label>

	// 							<select
	// 								id='token'
	// 								// value={selectedToken}
	// 								// onChange={handleTokenChange}
	// 								className='minimal bg-[#1e4957] border border-[#346b7d] text-gray-200 text-sm rounded-lg focus:ring-[#1e4957] focus:border-[#1e4957] block w-full p-2.5 disabled:text-slate-500'
	// 							>
	// 								<option>-- Select a token --</option>
	// 								{/* {tokens.map((token) => (
	//                             <option key={token.address} value={token.address}>
	//                                 {token.address}
	//                             </option>
	//                         ))} */}
	// 							</select>
	// 						</div>
	// 						<div className='mb-5'>
	// 							<label
	// 								htmlFor='amount'
	// 								className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
	// 							>
	// 								Lock Amount
	// 								{/* {lockInfo.amount && (
	// 									<span className=''> - ({lockInfo.amount} available)</span>
	// 								)} */}
	// 							</label>
	// 							<div className='flex items-center'>
	// 								<input
	// 									type='text'
	// 									id='amount'
	// 									// value={lockInfo.amount}
	// 									// onChange={(e) => handleChange(e, 'amount')}
	// 									className='bg-[#1e4957] border border-[#346b7d] text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
	// 									placeholder="EG '100000000'"
	// 									required
	// 								/>
	// 							</div>
	// 						</div>
	// 						<div className='mb-4'>
	// 							<label
	// 								htmlFor='owner'
	// 								className='block mb-2 text-sm font-medium text-white dark:text-white'
	// 							>
	// 								Lock Owner
	// 							</label>
	// 							<input
	// 								type='text'
	// 								id='owner'
	// 								// value={ownerWallet}
	// 								// onChange={(e) => handleChange(e, 'owner')}
	// 								className='bg-[#1e4957] border border-[#346b7d] text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
	// 								required
	// 							/>
	// 						</div>

	// 						<input
	// 							type='text'
	// 							hidden
	// 							id='decimals'
	// 							// value={selectedDecimals}
	// 							// onChange={(e) => handleChange(e, 'decimals')}
	// 							className='bg-[#1e4957] border border-[#346b7d] text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 hidden'
	// 						/>

	// 						<div className='' suppressHydrationWarning>
	// 							<label
	// 								htmlFor='LockTime'
	// 								className='block mb-2 text-sm font-medium text-white dark:text-white'
	// 							>
	// 								Lock Date/Time
	// 							</label>
	// 							<Flatpickr
	// 								id='LockTime'
	// 								options={{ enableTime: true }}
	// 								// value={lockInfo.date} // Convert ISO string to Date object
	// 								className='text-white bg-[#1e4957] border border-[#346b7d] rounded-lg m-0 w-auto min-w-0 py-2 text-center formtime'
	// 							// onChange={(value) => handleChange(value, 'date')} // Use "date" as id
	// 							/>
	// 						</div>
	// 						<div className='mb-5 mt-6'>
	// 							<input
	// 								type='submit'
	// 								id='submit'
	// 								className='bg-gradient-to-t from-[#1e4553] to-[#103642] border border-[#33788f] text-white uppercase text-base rounded-lg font-bold cursor-pointer focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
	// 							// disabled={!publicKey}
	// 							/>
	// 						</div>
	// 					</form>
	// 				</div>
	// 				<div className='flex-col space-y-5'>
	// 					<div className='flex-none rounded-xl bg-[#092E3A] p-7 flex flex-col space-y-5 lg:mx-0 mx-5'>
	// 						<Details
	// 							lockInfo={lockInfo.name}
	// 							lockToken={lockInfo.token}
	// 							lockOwner={lockInfo.owner}
	// 							lockDate={lockInfo.date}
	// 							lockAmount={lockInfo.amount}
	// 						/>
	// 					</div>
	// 					<div className='flex-none rounded-xl bg-[#092E3A] p-7 flex flex-col space-y-5 lg:mx-0 mx-5'>
	// 						<CommDatails />
	// 					</div>
	// 				</div>
	// 			</div>
	// 		</div>
	// 	</>
	// )
}
