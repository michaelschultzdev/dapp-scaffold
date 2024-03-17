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
import { useRouter } from 'next/router';
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

let genBase = anchor.web3.Keypair.generate();

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
	const [lockName, setLockName] = useState('');
	const [tokenAccount, setTokenAccount] = useState('');
	const [selectedTokenAmount, setSelectedTokenAmount] = useState(0);
	const [totalAvailableTokenAmount, setTotalAvailableTokenAmount] = useState(0);
	const [ownerWallet, setOwnerWallet] = useState('');
	const [selectedDecimals, setSelectedTokenDecimals] = useState('');
	const [endDate, setEndDate] = useState();
	const [startDate, setStartDate] = useState();
	const [tokensWithMetadata, setTokensWithMetadata] = useState([]);
	const [recipientAddress, setRecipientAddress] = useState('');
	const [baseAccount, setBaseAccount] = useState(genBase);

	const [mintAddressPubKey, setMintAddressPubKey] = useState(
		new PublicKey('CLaSKXbuMp1BXTya62WDyZoPvgmfcqsdA18rAjBcn9Vw') // set to the SolFi token address bc I can't think of any other
	);

	const [metadata, setMetadata] = useState({
		tokenName: '',
		symbol: '',
	});

	const [lockInfo, setLockInfo] = useState({
		lockName: '',
		tokenAddress: '',
		owner: '',
		amount: 0,
		decimals: '',
		tokenName: '',
		symbol: '',
		startDate: null,
		endDate: null,
		baseAccount: '',
		userStatsPDA: '',
		vaultPDA: '',
	});

	const { networkConfiguration } = useNetworkConfiguration();
	const network = networkConfiguration;
	const endpoint = useMemo(() => clusterApiUrl(network), [network]);
	const connection = useMemo(() => new Connection(endpoint), [endpoint]);
	const programID = new PublicKey(idl.metadata.address);
	const router = useRouter();

	// Prevent form submission refresh
	function formPreventDefault(e) {
		e.preventDefault();
	}

	function onClickPreventDefault(e) {
		e.preventDefault();
	}

	// useEffect(() => {
	// 	console.log(startDate, 'end', endDate);
	// }, [startDate, endDate]);

	// const wallet = useWallet();
	const wallet = useWallet();

	useEffect(() => {
		if (!loadedProvider) return;
		if (genBase) {
			setBaseAccount(genBase);
		}
	}, [loadedProvider]);

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
		if (loadedProvider) {
			console.log('Connected to provider.');
			setOwnerWallet(loadedProvider.wallet.publicKey.toBase58());
			setRecipientAddress(loadedProvider.wallet.publicKey.toBase58());
		}
	}, [loadedProvider]);

	useEffect(() => {
		if (!loadedProvider) return;

		setLockInfo((prevState) => ({
			...prevState,
			baseAccount: baseAccount?.publicKey?.toString(),
		}));
	}, [loadedProvider, baseAccount]);

	useEffect(() => {
		async function fetchMetadata() {
			const metadata = await getTokenMetadata(mintAddressPubKey);
			setMetadata(metadata);
		}

		fetchMetadata();
	}, [mintAddressPubKey]);

	const feeAccount = new PublicKey(
		'FX9yNH3yRMUvmW5UASJ7nsQpnXvEhHF3i2xMBppwuU7t'
	);

	const userToken = useRef(null);

	const start = new BN(+new Date('2024-03-12T01:24:00'));
	// const end = new BN(+new Date('2024-03-14T12:24:00'));
	// console.log('start:', startDate, 'end:', endDate);

	// const start = new BN(+new Date(startDate));

	const end = new BN(+new Date('2024-03-14T12:24:00')); //a few days ago it ended, the date shown on the listlocks page is wrong on purpose

	const handleChange = (e, id) => {
		let value = e.target ? e.target.value : e[0].toISOString();
		if (id === 'lockName') {
			// Update ownerWallet state as well
			setLockName(value);
		}
		if (id === 'recipient') {
			// Update ownerWallet state as well
			setRecipientAddress(value);
		}
		if (id === 'amount') {
			setSelectedTokenAmount(value);
		}
		if (id === 'lockdate') {
			setEndDate(value);
		}
		setLockInfo((prevState) => ({
			...prevState,
			[id]: value,
		}));
	};

	const handleTokenChange = async (e) => {
		const selectedTokenAddress = e.target.value;
		const selectedToken = tokensWithMetadata.find(
			(token) => token.mint === selectedTokenAddress
		);

		setSelectedToken(selectedTokenAddress);
		setMintAddressPubKey(new PublicKey(selectedTokenAddress));

		// console.log('selectedToken WHAT IS TOKEN ACCOUNT?? ', selectedToken);

		setSelectedTokenDecimals(selectedToken ? selectedToken.decimals : ''); // Update selected decimals
		setSelectedTokenAmount(selectedToken ? selectedToken.amount : ''); // Update selected amount
		setTotalAvailableTokenAmount(selectedToken ? selectedToken.amount : ''); // Update selected amount
		setTokenAccount(selectedToken ? selectedToken.address : ''); // Update selected amount

		if (selectedToken && selectedToken.metadata) {
			setMetadata({
				tokenName: selectedToken.metadata.name,
				symbol: selectedToken.metadata.symbol,
			});
		}

		// Update lockInfo state with the selected token address and decimals
		setLockInfo((prevState) => ({
			...prevState,
			tokenAddress: tokenAccount,
			mint: selectedTokenAddress,
			owner: ownerWallet,
			amount: selectedTokenAmount,
			startDate: startDate,
			endDate: endDate,
			tokenName: selectedToken ? selectedToken.metadata.name : '',
			symbol: selectedToken ? selectedToken.metadata.symbol : '',
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
			startDate: start,
		}));
	}, []);

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
				const tokenAccountsLimited = tokenAccounts.value.slice(0, 1);

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
	}, [loadedProvider, selectedTokenAmount, selectedDecimals]);
	// Get the user's selected token and extract the mint address

	// useEffect(() => {
	// 	if (!selectedToken) return;

	// 	async function getMintData() {
	// 		setMintAddressPubKey(selectedToken.mint);
	// 		console.log('Mint address before state update:', selectedToken);
	// 	}
	// 	getMintData();

	// 	console.log('Mint address SETTTTT:', mintAddressPubKey);
	// }, [selectedToken, mintAddressPubKey]);
	// Commmand to run the vesting after all else is completed

	// Test the submission of all fields to database
	// async function testDBSubmission() {
	// 	const { data, error } = await supabase
	// 		.from('AlphaSubmissions')
	// 		.insert([lockInfo]);
	// 	if (error) {
	// 		throw error;
	// 	}
	// 	notify({ type: 'success', message: `Lock stored successfully!` });
	// }

	useEffect(() => {
		if (!loadedProvider) return;

		async function fetchAuxData() {
			console.log(
				'getting base account in fetchdata',
				baseAccount.publicKey.toString()
			);

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

			// Update lockInfo with userStatsPDA and vaultPDA
			setLockInfo((prevState) => ({
				...prevState,
				userStatsPDA: userStatsPDA.toString(),
				vaultPDA: vaultPDA.toString(),
			}));
		}

		fetchAuxData();
	}, [loadedProvider, baseAccount]);

	async function doVesting() {
		if (!mintAddressPubKey) {
			notify({ type: 'error', message: `You must select a token to lock!` });
			return;
		}
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

		// console.log('recipientToken', recipientToken);

		// console.log('feeAccount test first, this field should be a publicke.s...');
		// console.log(
		// 	'feeAccount test first, this field should be a publicke.s...',
		// 	feeAccount
		// );

		// console.log(
		// 	'connection',
		// 	connection,
		// 	'baseAccount',
		// 	baseAccount.publicKey,
		// 	'mintAddressPubKey',
		// 	mintAddressPubKey,
		// 	'feeAccount',
		// 	feeAccount
		// );

		const feeToken = await getOrCreateAssociatedTokenAccount(
			connection,
			baseAccount,
			mintAddressPubKey,
			feeAccount
		);

		const userToken = await getOrCreateAssociatedTokenAccount(
			connection,
			baseAccount.publicKey,
			mintAddressPubKey,
			loadedProvider.wallet.publicKey
		);

		let publicKeyRecipientAddress = new PublicKey(recipientAddress);

		// console.log(
		// 	'start',
		// 	start,
		// 	'end',
		// 	end,
		// 	'user',
		// 	loadedProvider.wallet.publicKey,
		// 	'userstats',
		// 	userStatsPDA,
		// 	'accounts',
		// 	{
		// 		user: loadedProvider.wallet.publicKey.toString(),
		// 		userStats: userStatsPDA.toString(),
		// 		userToken: userToken.address.toString(),
		// 		recipient: publicKeyRecipientAddress.toString(),
		// 		recipientToken: recipientToken.address.toString(),
		// 		feeToken: feeToken.address.toString(),
		// 		mint: mintAddressPubKey.toString(),
		// 		vault: vaultPDA.toString(),
		// 		clock: anchor.web3.SYSVAR_CLOCK_PUBKEY.toString(),
		// 		tokenProgram: TOKEN_PROGRAM_ID.toString(),
		// 		associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
		// 		baseAccount: baseAccount.publicKey.toString(),
		// 		feeAccount: feeAccount.toString(),
		// 		selectedTokenAmountNoLamports: new BN(selectedTokenAmount).toString(),
		// 		selectedTokenAmountLamports: new BN(
		// 			selectedTokenAmount * anchor.web3.LAMPORTS_PER_SOL
		// 		).toString(),
		// 	}
		// );
		// // console.log(publicKeyRecipientAddress);
		// // let tester = new PublicKey(ownerWallet.toString());
		// // console.log('fucked up owner wallet eh?', ownerWallet);

		// console.log(
		// 	'start',
		// 	start,
		// 	'end',
		// 	end,
		// 	'user',
		// 	loadedProvider.wallet.publicKey,
		// 	'userstats',
		// 	userStatsPDA
		// );

		const initial = await program.methods
			.initialize(new BN(1), new BN(1.5 * anchor.web3.LAMPORTS_PER_SOL))
			.accounts({
				baseAccount: baseAccount.publicKey,
				owner: loadedProvider.wallet.publicKey,
				feeAccount: feeAccount,
				systemProgram: anchor.web3.SystemProgram.programId,
			})
			.signers([baseAccount])
			.rpc();

		let userdata;
		try {
			userdata = await program.methods
				.createUserStats()
				.accounts({
					user: loadedProvider.wallet.publicKey,
					userStats: userStatsPDA,
					systemProgram: anchor.web3.SystemProgram.programId,
				})
				.rpc();
		} catch (error) {
			console.error('Error creating the real user stats:', error);
			// Handle the error as per your requirements, for example:
			// notify({ type: 'error', message: 'Error creating user stats' });
		}
		console.log('baseAccounBeingSubmitted', baseAccount.publicKey.toString());
		const transac = await program.methods
			.createVesting(
				new BN(selectedTokenAmount * anchor.web3.LAMPORTS_PER_SOL),
				start,
				end,
				true,
				nonce
			)
			.accounts({
				user: loadedProvider.wallet.publicKey,
				userStats: userStatsPDA,
				userToken: userToken.address,
				recipient: publicKeyRecipientAddress,
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
		console.log(
			'baseAccount After Database Call',
			baseAccount.publicKey.toString()
		);

		try {
			const { data, error } = await supabase
				.from('AlphaSubmissions')
				.insert([lockInfo]);
			if (error) {
				throw error;
			}
			// Show success toast message
			notify({
				type: 'success',
				message: `Tokens are locked!`,
				description:
					'You will be redirected to the locked tokens page shortly.',
			});
			// Redirect to "/all-locks" after a short delay
			setTimeout(() => {
				router.push('/listlocks');
			}, 2000); // 2000 milliseconds = 2 seconds
		} catch (error) {
			console.error('Error submitting data:', error.message);
			// Show error toast message if submission fails
			notify({
				type: 'error',
				message: `We had a problem!`,
				description: error.message,
			});
		}
	}

	return (
		<div className='flex lg:flex-row flex-col lg:space-x-5 lg:space-y-0 space-y-5 mt-5 min-w-7xl max-w-7xl mx-auto'>
			<div className='grow-1 rounded-xl bg-[#092E3A] p-7 lg:mx-0 mx-5 text-left'>
				<h2 className='text-2xl text-white pb-0 mb-0'>Lock Setup</h2>
				<hr className='border-[#1e4957] pb-1 mt-5' />

				<div className='mb-10 mt-5'>
					<h2 className='text-2xl text-white pb-0 mb-3'>
						Start Earning APY With Locked LP Tokens!
					</h2>
					<p className='mb-5 lg:max-w-4xl'>
						Enter your lock information below. Be sure to double-check it, as it
						is immutable once submitted. The lock will be tied to the expiration
						date, which once set cannot be unlocked by anyone for any reason.
					</p>
					<form className='mt-5' onSubmit={(e) => formPreventDefault(e)}>
						<div className='mb-5'>
							<label
								htmlFor='name'
								className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
							>
								Lock Name
							</label>
							<input
								type='text'
								id='lockName'
								value={lockName}
								onChange={(e) => handleChange(e, 'lockName')}
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
											? `${token.mint} (${token.metadata.symbol})`
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
								Unlock Recipient (The wallet that will receive the tokens once
								they're unlocked)
							</label>
							<div className='flex justify-center'>
								<input
									type='text'
									id='recipient'
									value={recipientAddress}
									onChange={(e) => handleChange(e, 'recipient')}
									className='bg-[#1e4957] border border-[#346b7d] text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
									placeholder='Lock Recipient Address'
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
								Lock END Date/Time (UTC)
							</label>
							<Flatpickr
								id='lockdate'
								value={endDate}
								onChange={(e) => handleChange(e, 'lockdate')}
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
								onClick={(e) => {
									onClickPreventDefault(e);
									doVesting();
								}}
								className='bg-gradient-to-t from-[#1e4553] to-[#103642] border border-[#33788f] text-white uppercase text-base rounded-lg font-bold cursor-pointer focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
								disabled={!publicKey}
							/>
						</div>
					</form>
					{/* <button className='border' onClick={() => testDBSubmission()}>
					Test DB Submisson
				</button> */}
				</div>
			</div>
			<div className='flex-col space-y-5 grow-0'>
				<div className='grow-0 flex-none rounded-xl bg-[#092E3A] p-7 flex flex-col space-y-5 lg:mx-0 mx-5'>
					<Details
						lockInfo={lockInfo.lockName}
						lockToken={selectedToken}
						lockOwner={recipientAddress}
						lockDate={lockInfo.endDate}
						lockAmount={selectedTokenAmount}
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
