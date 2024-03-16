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
import getTokenMetadata from './getMintMetadata';
import { notify } from '../utils/notifications';
import {
	ASSOCIATED_TOKEN_PROGRAM_ID,
	getOrCreateAssociatedTokenAccount,
	TOKEN_PROGRAM_ID,
	getAssociatedTokenAddress,
	getAssociatedTokenAddressSync,
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
	function truncate(str) {
		return str.length > 10
			? str.substring(0, 5) + '...' + str.substring(str.length - 5)
			: str;
	}
	const { publicKey, sendTransaction } = useWallet();
	const [loadedProvider, setLoadedProvider] = useState(null);

	const [tokens, setTokens] = useState([]);
	const [selectedToken, setSelectedToken] = useState('');
	const [selectedTokenAccount, setSelectedTokenAccount] = useState('');
	const [tokenAccount, setTokenAccount] = useState('');
	const [selectedTokenAmount, setSelectedTokenAmount] = useState(0);
	const [totalAvailableTokenAmount, setTotalAvailableTokenAmount] = useState(0);
	const [ownerWallet, setOwnerWallet] = useState('');
	const [selectedDecimals, setSelectedTokenDecimals] = useState('');
	const [tokensWithMetadata, setTokensWithMetadata] = useState([]);

	const [mintAddressPubKey, setMintAddressPubKey] = useState('');
	const [metadata, setMetadata] = useState({
		tokenName: '',
		symbol: '',
		logo: '',
	});

	const [lockInfo, setLockInfo] = useState({
		lockName: '',
		token: '',
		owner: '',
		amount: 0,
		decimals: '',
		tokenName: '',
		symbol: '',
		logo: null,
		date: null,
	});

	const { networkConfiguration } = useNetworkConfiguration();
	const network = networkConfiguration;
	const endpoint = useMemo(() => clusterApiUrl(network), [network]);
	const connection = useMemo(() => new Connection(endpoint), [endpoint]);
	console.log;
	const programID = new PublicKey(idl.metadata.address);

	// const wallet = useWallet();
	const wallet = useWallet();

	const provider = new AnchorProvider(connection, wallet, {
		commitment: 'processed',
	});
	const program = new Program(idl, programID, provider);

	useEffect(() => {
		if (provider.wallet?.publicKey) {
			setLoadedProvider(provider);
			notify({
				type: 'success',
				message: `Wallet connected!`,
				description: truncate(provider.wallet.publicKey.toBase58()),
			});
		} else {
		}
	}, [provider.wallet]);

	useEffect(() => {
		if (loadedProvider) console.log('Connected to provider.');
	}, [loadedProvider]);

	useEffect(() => {
		async function fetchMetadata() {
			const metadata = await getTokenMetadata(mintAddressPubKey);
			setMetadata(metadata);
		}

		fetchMetadata();
	}, [mintAddressPubKey]);

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

	const handleChange = (e, id) => {
		let value = e.target ? e.target.value : e[0].toISOString();
		// Check if the field being changed is "owner"
		if (id === 'owner') {
			// Update ownerWallet state as well
			setOwnerWallet(value);
		}
		if (id === 'amount') {
			setSelectedTokenAmount(value);
		}
		setLockInfo((prevState) => ({
			...prevState,
			[id]: value,
		}));
	};

	const handleTokenChange = async (e) => {
		const selectedTokenAddress = e.target.value;
		const selectedToken = tokens.find(
			(token) => token.address === selectedTokenAddress
		);
		// const selectedMint = tokens.find((token) => token.mint === selectedMint);
		setSelectedToken(selectedToken);

		console.log('selectedToken WHAT IS TOKEN ACCOUNT?? ', selectedToken);

		setSelectedTokenDecimals(selectedToken ? selectedToken.decimals : ''); // Update selected decimals
		setSelectedTokenAmount(selectedToken ? selectedToken.amount : ''); // Update selected amount
		setTotalAvailableTokenAmount(selectedToken ? selectedToken.amount : ''); // Update selected amount

		if (metadata) {
		}

		// Update lockInfo state with the selected token address and decimals
		setLockInfo((prevState) => ({
			...prevState,
			token: tokenAccount,
			mint: selectedToken,
			owner: ownerWallet,
			amount: selectedTokenAmount,
			tokenName: metadata.tokenName,
			symbol: metadata.symbol,
			logo: metadata.logo,
			decimals: selectedToken ? selectedToken.decimals : '', // Update decimals in lockInfo
		}));
	};

	const handleMaxAmount = () => {
		setSelectedTokenAmount(totalAvailableTokenAmount); // Set the lock amount to the maximum available token amount
	};

	// Ensure lockInfo.date is initialized on the client side
	useEffect(() => {
		setLockInfo((prevState) => ({
			...prevState,
			date: new Date().toISOString(),
		}));
	}, []);

	// Initialize the lock by creating a user stats account

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

	// Create user stats
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

	// Fetch the user's token accounts and store them in the tokens state
	// Modify fetchTokensWithMetadata function to limit the number of tokens fetched
	useEffect(() => {
		if (!loadedProvider) return;
		const fetchTokensWithMetadata = async () => {
			try {
				const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
					loadedProvider.wallet.publicKey,
					{ programId: TOKEN_PROGRAM_ID }
				);

				// Limit the number of tokens fetched to 5
				const tokenAccountsLimited = tokenAccounts.value.slice(0, 5);

				const uniqueTokens = new Set();

				for (const { pubkey, account } of tokenAccountsLimited) {
					const MY_WALLET_ADDRESS = loadedProvider.wallet.publicKey.toString();

					const accounts = await connection.getParsedProgramAccounts(
						TOKEN_PROGRAM_ID,
						{
							filters: [
								{
									dataSize: 165,
								},
								{
									memcmp: {
										offset: 32,
										bytes: MY_WALLET_ADDRESS,
									},
								},
							],
						}
					);

					accounts.forEach((account, i) => {
						const token = {
							address: pubkey.toBase58(),
							mint: account.account.data.parsed.info.mint,
							amount: account.account.data.parsed.info.tokenAmount.uiAmount,
							decimals: account.account.data.parsed.info.tokenAmount.decimals,
						};
						uniqueTokens.add(token);
					});
				}

				const tokensWithMetadata = await Promise.all(
					Array.from(uniqueTokens).map(async (token) => {
						if (token.mint) {
							console.log('WE GOT A MINT', token.mint.toString());
							const metadata = await getTokenMetadata(token.mint.toString()); // Fetch metadata for each token
							return {
								...token,
								metadata,
							};
						} else {
							return token;
						}
					})
				);

				setTokensWithMetadata(tokensWithMetadata);

				console.log('TOKENS WITH METADATA', tokensWithMetadata);

				// Update lockInfo state with the selected token address and decimals
				setLockInfo((prevState) => ({
					...prevState,
					token: tokenAccount,
					owner: ownerWallet,
					amount: selectedTokenAmount,
					decimals: selectedDecimals, // Update decimals in lockInfo
				}));
			} catch (error) {
				console.error('Error fetching tokens:', error);
			}
		};

		fetchTokensWithMetadata();
	}, [
		loadedProvider,
		tokenAccount,
		ownerWallet,
		selectedTokenAmount,
		selectedDecimals,
	]);
	// Get the user's selected token and extract the mint address

	useEffect(() => {
		if (!selectedToken) return;

		async function getMintData() {
			setMintAddressPubKey(selectedToken.mint);
		}
		c;
		getMintData();
	}, [selectedToken]);
	// Commmand to run the vesting after all else is completed

	async function doVesting() {
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
			mintAddressPubKey,
			loadedProvider.wallet.publicKey
		);
		const feeToken = await getOrCreateAssociatedTokenAccount(
			connection,
			baseAccount.publicKey,
			mintAddressPubKey,
			feeAccount
		);

		const userToken = await getOrCreateAssociatedTokenAccount(
			connection,
			baseAccount.publicKey,
			mintAddressPubKey,
			loadedProvider.wallet.publicKey
		);

		console.log('VESTING START - got user token', userToken);

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
				mint: mintAddressPubKey,
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
			<div className='grow-1 rounded-xl bg-[#092E3A] p-7 lg:mx-0 mx-5 text-left'>
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
				<form className='mt-5'>
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
							value={lockInfo.user}
							onChange={(e) => handleChange(e, 'name')}
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
							value={selectedToken}
							onChange={handleTokenChange}
							className='minimal bg-[#1e4957] border border-[#346b7d] text-gray-200 text-sm rounded-lg focus:ring-[#1e4957] focus:border-[#1e4957] block w-full p-2.5 disabled:text-slate-500'
						>
							<option value=''>-- Select a token --</option>
							{tokensWithMetadata.map((token) => (
								<option key={token.mint} value={token.mint}>
									{token.metadata
										? `${token.metadata.name} (${token.metadata.symbol})`
										: token.mint}
								</option>
							))}
						</select>
					</div>
					<div className='mb-5'>
						<label
							htmlFor='amount'
							className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
						>
							Lock Amount
							{totalAvailableTokenAmount ? (
								<span className=''>
									{' '}
									- ({totalAvailableTokenAmount} available)
								</span>
							) : (
								''
							)}
						</label>
						<div className='flex items-center justify-center'>
							<input
								type='text'
								id='lockamount'
								value={selectedTokenAmount}
								onChange={(e) => handleChange(e, 'amount')}
								className='bg-[#1e4957] border border-[#346b7d] text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
								placeholder='0'
								required
							/>
							<a
								href='#'
								onClick={handleMaxAmount}
								className=' text-sm uppercase font-bold ml-2 tecen bg-[#14333d] border border-[#317186] text-white rounded-lg focus:ring-[#4096b3] focus:border-[#5fafc9] w-28 text-center py-2.5 px-2.5'
							>
								use max
							</a>
						</div>
					</div>
					<div className='mb-4'>
						<label
							htmlFor='owner'
							className='block mb-2 text-sm font-medium text-white dark:text-white'
						>
							Lock Owner
						</label>
						<div className='flex justify-center'>
							<input
								type='text'
								id='lockowner'
								value={lockInfo.owner}
								onChange={(e) => handleChange(e, 'owner')}
								className='bg-[#1e4957] border border-[#346b7d] text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
								placeholder='Owner Address'
								required
							/>
						</div>
					</div>

					<input
						type='text'
						hidden
						id='decimals'
						value={selectedDecimals}
						onChange={(e) => handleChange(e, 'decimals')}
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
							id='lockdate'
							value={lockInfo.date}
							onChange={(date) =>
								setLockInfo((prevState) => ({ ...prevState, date }))
							}
							className='bg-[#1e4957] border border-[#346b7d] text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
							placeholder='Select Date and Time'
							options={{
								enableTime: true,
								altInput: true,
								altFormat: 'F j, Y h:i K',
								dateFormat: 'Y-m-d H:i:S',
							}}
							required
						/>
					</div>
					<div className='mb-5 mt-6'>
						<input
							type='submit'
							id='submit'
							className='bg-gradient-to-t from-[#1e4553] to-[#103642] border border-[#33788f] text-white uppercase text-base rounded-lg font-bold cursor-pointer focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
							disabled={!publicKey}
						/>
					</div>
				</form>
			</div>
			<div className='flex-col space-y-5 grow-0'>
				<div className='grow-0 flex-none rounded-xl bg-[#092E3A] p-7 flex flex-col space-y-5 lg:mx-0 mx-5'>
					<Details
						lockInfo={lockInfo.lockName}
						lockToken={lockInfo.token}
						lockOwner={lockInfo.owner}
						lockDate={lockInfo.date}
						lockAmount={totalAvailableTokenAmount}
					/>
				</div>
				<div className=' grow-0 flex-none rounded-xl bg-[#092E3A] p-7 flex flex-col space-y-5 lg:mx-0 mx-5'>
					<CommDatails />
				</div>
			</div>
		</div>
	);
};

export default SendContractTransaction;
