// Next, React
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';
import pkg from '../../../package.json';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';

export const HomeView: FC = ({}) => {
	const wallet = useWallet();
	const { connection } = useConnection();

	const balance = useUserSOLBalanceStore((s) => s.balance);
	const { getUserSOLBalance } = useUserSOLBalanceStore();

	useEffect(() => {
		if (wallet.publicKey) {
			console.log(wallet.publicKey.toBase58());
			getUserSOLBalance(wallet.publicKey, connection);
		}
	}, [wallet.publicKey, connection, getUserSOLBalance]);

	return (
		<div className='md:hero mx-auto p-4'>
			<div className='md:hero-content flex flex-col'>
				<div className='mt-6'>
					<div className='text-sm font-normal align-bottom text-right text-[#3e889d] mt-4'>
						v{pkg.version}
					</div>
					<h1 className='text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-tl from-[hsl(195,85%,24%)] to-[#2baece] mb-4'>
						SolFi Locker
					</h1>
				</div>
				<h4 className='md:w-full text-2x1 md:text-4xl text-center text-slate-200 my-2 mb-12'>
					<p className='mb-2'>
						SolFi - The first decentralized APY-earning locker on Solana.
					</p>
					<p className='text-slate-400 text-2xl leading-snug'>
						Burning is wasteful. Lock your tokens, establish trust, and earn
						APY!
					</p>
				</h4>
				<div className='mx-auto flex gap-10 bg-white/5 px-6 ring-1 ring-white/10 sm:rounded-3xl lg:mx-0 lg:max-w-none sm:flex-col lg:items-center lg:pt-16 lg:pb-20 xl:gap-x-20 xl:px-20'>
					<h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
						The DApp Is Now In Beta!
					</h2>
					<p className='text-lg leading-8 text-gray-300'>
						Our Beta release is now live! The locker can now be used for any
						type of token, and will earn APY for any user who locks liquidity
						pool tokens. The beta app is still in development, so please report
						any bugs or issues to our team.
					</p>
					<ul
						role='list'
						className='grid grid-cols-1 gap-x-8 gap-y-3 text-base leading-7 text-white sm:grid-cols-2'
					>
						<li className='flex gap-x-3'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 20 20'
								fill='currentColor'
								aria-hidden='true'
								data-slot='icon'
								className='h-7 w-5 flex-none'
							>
								<path
									fill-rule='evenodd'
									d='M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z'
									clip-rule='evenodd'
								></path>
							</svg>
							Secure and decentralized
						</li>
						<li className='flex gap-x-3'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 20 20'
								fill='currentColor'
								aria-hidden='true'
								data-slot='icon'
								className='h-7 w-5 flex-none'
							>
								<path
									fill-rule='evenodd'
									d='M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z'
									clip-rule='evenodd'
								></path>
							</svg>
							Audited RC program
						</li>
						<li className='flex gap-x-3'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 20 20'
								fill='currentColor'
								aria-hidden='true'
								data-slot='icon'
								className='h-7 w-5 flex-none'
							>
								<path
									fill-rule='evenodd'
									d='M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z'
									clip-rule='evenodd'
								></path>
							</svg>
							Lock fee refunded after 6 months
						</li>
						<li className='flex gap-x-3'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 20 20'
								fill='currentColor'
								aria-hidden='true'
								data-slot='icon'
								className='h-7 w-5 flex-none'
							>
								<path
									fill-rule='evenodd'
									d='M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z'
									clip-rule='evenodd'
								></path>
							</svg>
							High APY for locked assets
						</li>
						<li className='flex gap-x-3'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 20 20'
								fill='currentColor'
								aria-hidden='true'
								data-slot='icon'
								className='h-7 w-5 flex-none'
							>
								<path
									fill-rule='evenodd'
									d='M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z'
									clip-rule='evenodd'
								></path>
							</svg>
							Access to team for any tech help
						</li>
						<li className='flex gap-x-3'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 20 20'
								fill='currentColor'
								aria-hidden='true'
								data-slot='icon'
								className='h-7 w-5 flex-none'
							>
								<path
									fill-rule='evenodd'
									d='M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z'
									clip-rule='evenodd'
								></path>
							</svg>
							A new way to launch, lock, &amp; earn
						</li>
					</ul>
					<div className='flex justify-center items-center mt-10'>
						<Link href='/locker'>
							<div className='px-10 py-3 bg-gradient-to-b rounded from-[#5892a5] to-[#095670] items-center'>
								Launch Locker
							</div>
						</Link>
					</div>
					{/* <RequestAirdrop /> */}
				</div>

				{/* <h4 className='md:w-full text-2xl text-slate-300 my-2'>
						{wallet && (
							<div className='flex flex-row justify-center'>
								<div>{(balance || 0).toLocaleString()}</div>
								<div className='text-slate-600 ml-2'>SOL</div>
							</div>
						)}
					</h4> */}
			</div>
		</div>
	);
};
