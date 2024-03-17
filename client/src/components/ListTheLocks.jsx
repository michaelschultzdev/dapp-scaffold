import React, {
	useCallback,
	useEffect,
	useRef,
	useMemo,
	useState,
} from 'react';
import {
	Transaction,
	SystemProgram,
	PublicKey,
	Account,
	Connection,
	getParsedTranscation,
	clusterApiUrl,
} from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { notify } from '../utils/notifications';
import getTokenMetadata from './getMintMetadata';
import {
	Program,
	setProvider,
	web3,
	AnchorProvider,
	signAndSendTransaction,
} from '@project-serum/anchor';
import {
	ASSOCIATED_TOKEN_PROGRAM_ID,
	getOrCreateAssociatedTokenAccount,
	TOKEN_PROGRAM_ID,
	getAssociatedTokenAddress,
	getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
import { createClient } from '@supabase/supabase-js';
import idl from '../idl/token_locker.json';
import {
	NetworkConfigurationProvider,
	useNetworkConfiguration,
} from '../contexts/NetworkConfigurationProvider';
import { BN } from 'bn.js';

const supabase = createClient(
	'https://ipudikgouqovvhvvwege.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdWRpa2dvdXFvdnZodnZ3ZWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk0NjkxMDUsImV4cCI6MjAyNTA0NTEwNX0.P9BLA8DB-fYzIanWDr92Pfwt5wyKMzgxdDeKu7731x0'
);

const ListTheLocks = () => {
	const [locks, setLocks] = useState([]);
	const [loadedProvider, setLoadedProvider] = useState(null);
	const [tokensWithMetadata, setTokensWithMetadata] = useState([]);
	const [metadata, setMetadata] = useState([]);
	const [endTimeTemp, setEndTimeTemp] = useState();

	const { networkConfiguration } = useNetworkConfiguration();
	const network = networkConfiguration;
	const [formattedEndDates, setFormattedEndDates] = useState([]);

	const endpoint = useMemo(() => clusterApiUrl(network), [network]);
	const connection = useMemo(() => new Connection(endpoint), [endpoint]);
	const programID = new PublicKey(idl.metadata.address);
	const [mintAddressPubKey, setMintAddressPubKey] = useState(
		new PublicKey('CLaSKXbuMp1BXTya62WDyZoPvgmfcqsdA18rAjBcn9Vw') // This can be whatever because it gets replaced. set to the SolFi token address bc I can't think of any other
	);

	function truncate(str) {
		return str.length > 10
			? str.substring(0, 5) + '...' + str.substring(str.length - 5)
			: str;
	}

	// Prevent form submission refresh
	function formPreventDefault(e) {
		e.preventDefault();
	}

	function onClickPreventDefault(e) {
		e.preventDefault();
	}

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
		async function fetchMetadata() {
			const metadata = await getTokenMetadata(mintAddressPubKey);
			setMetadata(metadata);
		}

		fetchMetadata();
	}, [mintAddressPubKey]);

	useEffect(() => {
		// Function to fetch locks from Supabase
		const fetchLocks = async () => {
			try {
				// Query locks from Supabase
				const { data, error } = await supabase
					.from('AlphaSubmissions')
					.select('*');
				if (error) {
					throw error;
				}
				// Set locks state with fetched data
				setLocks(data);
			} catch (error) {
				console.error('Error fetching locks:', error.message);
			}
		};

		// Call fetchLocks function
		fetchLocks();
	}, []); // Empty dependency array ensures useEffect runs only once

	useEffect(() => {
		// Function to format end dates
		const formatEndDates = () => {
			const formattedDates = locks.map((lock) => {
				const lockEndDate = new Date(lock.endDate);
				const options = {
					year: 'numeric',
					month: 'numeric',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
					hour12: true,
				};
				return lockEndDate.toLocaleString('en-US', options);
			});
			setFormattedEndDates(formattedDates);
		};

		// Call formatEndDates function
		formatEndDates();
	}, [locks]);

	async function handleUnlock(
		id,
		mintaddress,
		recipientaddress,
		baseAccountAddress,
		pdaAddress,
		vaultAddress,
		amount
	) {
		// console.log('BASE??', baseAccountAddress);
		// console.log('imported pda', pdaAddress);
		// console.log('imported vault', vaultAddress);

		let mint = new PublicKey(mintaddress);
		let recipient = new PublicKey(recipientaddress);
		let vaultPDA = new PublicKey(vaultAddress);

		// console.log('imported recipient', recipient);

		// const formattedData = JSON.parse(baseAccountAddress.toString());
		// const secretKeyArray = Object.values(formattedData._keypair.secretKey);
		// const secretKeyUint8 = Uint8Array.from(secretKeyArray);
		// const baseAccount = anchor.web3.Keypair.fromSecretKey(secretKeyUint8);

		// console.log(base);

		// const baseAccount = anchor.web3.Keypair.fromSecretKey(
		// 	Uint8Array.from(formattedData)
		// );

		// console.log('formattedData after keypair call', baseAccount);

		let baseAccount = new PublicKey(baseAccountAddress);
		// let userStatsPDA = new PublicKey(pdaAddress);
		// let vaultPDA = new PublicKey(vaultAddress);
		// const baseAccount = anchor.web3.Keypair.generate();
		// console.log('passed in baseAccountAddress', baseAccountAddress);
		// console.log('now active base', baseAccount);

		try {
			// Function to unlock tokens
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
				[baseAccount.toBuffer()],
				program.programId
			);
			const recipientToken = await getOrCreateAssociatedTokenAccount(
				connection,
				provider.wallet.publicKey,
				mint,
				recipient
			);

			console.log(userStatsPDA.toString());

			// !!! We can use this to check the vesting info of the user, so we know what the start time and end time are before it goes into the program to unlock the tokens.

			async function getUsrData(address) {
				console.log(address);
				try {
					const [userStatsPDA, _] = PublicKey.findProgramAddressSync(
						[anchor.utils.bytes.utf8.encode('user-stats'), address.toBuffer()],
						program.programId
					);

					const account = await program.account.userStats.fetch(userStatsPDA);
					console.log('Vesting Info:', account);
					console.log('Vesting start:', account.vestList[0].startTs.toString());
					console.log('Vesting end:', account.vestList[0].endTs.toString());
					// Now you have the vesting info, you can use it as needed
				} catch (error) {
					console.error('Error getting user data:', error.message);
					// Handle error
				}
			}

			getUsrData(loadedProvider.wallet.publicKey);

			const tx = await program.methods
				.unlock(
					vestList.length - 1,
					new BN(amount * anchor.web3.LAMPORTS_PER_SOL)
				)
				.accounts({
					user: loadedProvider.wallet.publicKey,
					userStats: userStatsPDA,
					recipientToken: recipientToken.address,
					mint: mint,
					vault: vaultPDA,
					clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
					tokenProgram: TOKEN_PROGRAM_ID,
					baseAccount: baseAccount,
				})
				.signers([])
				.rpc();

			notify({ type: 'success', message: 'Tokens unlocked!' });
		} catch (error) {
			let errorMessage = 'Error unlocking tokens.';
			if (
				error.message.includes(
					'program expected this account to be already initialized'
				)
			) {
				errorMessage = 'Error! Are you trying to unlock too early?';
			}
			notify({
				type: 'error',
				message: errorMessage,
				description: error.message,
			});
		}
	}

	return (
		<div className='flex lg:flex-row flex-col lg:space-x-5 lg:space-y-0 space-y-5 mt-5 min-w-7xl max-w-7xl sm:mx-auto mx-5'>
			<div className='grow-1 rounded-xl bg-[#092E3A] p-7 lg:mx-0 mx-0 text-left w-full'>
				<h2 className='text-2xl text-white pb-0 mb-0'>All LP / Token Locks</h2>
				<hr className='border-[#1e4957] pb-1 mt-5' />

				<div className='mb-0 lg:mb-0 mt-5'>
					<ul role='list' className='divide-y divide-[#396874]'>
						{locks.map((lock, index) => (
							<li
								key={lock.id}
								className='flex sm:flex-row flex-col justify-between gap-y-5 sm:gap-y-0 gap-x-6 py-5 hover:bg-[#0c1b1e] px-2 rounded'
							>
								<div className='flex min-w-0 gap-x-4'>
									{/* <img
										className='h-12 w-12 flex-none rounded-full bg-gray-800'
										src={metadata.logo}
										alt=''
									/> */}
									<div className='min-w-0 flex-auto'>
										<p className='text-sm font-semibold leading-6 text-white'>
											{lock.lockName}
										</p>
										<p className='mt-1 truncate text-xs leading-5 text-[#48c4e3]'>
											{truncate(lock.token)} ({lock.symbol})
										</p>
									</div>
								</div>
								<div className='shrink-0 sm:flex sm:flex-col sm:items-end'>
									<p className='text-sm leading-6 text-white'>
										{truncate(lock.owner)}
									</p>
									<p className='mt-1 text-xs leading-5 text-gray-100'>
										Total Locked: {lock.amount} - Unlock Date:{' '}
										{formattedEndDates[index]}
									</p>
									<div
										className=' text-center sm:text-left justify-center cursor-pointer mt-3 flex items-center gap-x-1.5 bg-[#1d4e5a] rounded px-2 py-1'
										onClick={() =>
											handleUnlock(
												lock.id,
												lock.mint,
												lock.owner,
												lock.baseAccount,
												lock.userStatsPDA,
												lock.vaultPDA,
												lock.amount
											)
										}
									>
										<div className='flex-none rounded-full bg-[#276271] p-1'>
											<div className='h-1.5 w-1.5 rounded-full bg-[#0aceff]' />
										</div>

										<div>Unlock Tokens</div>
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
};

export default ListTheLocks;
