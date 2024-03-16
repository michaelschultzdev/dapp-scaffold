import React from 'react';

export default function CommDatails() {
	return (
		<>
			<h2 className='text-2xl text-white pb-0 mb-0'>Commission Details</h2>
			<hr className='border-[#1e4957] pb-1 mt-0' />
			<ul className='space-y-4 text-left text-gray-500 dark:text-gray-400'>
				<li className='flex items-center space-x-3 rtl:space-x-reverse'>
					<svg
						className='flex-shrink-0 w-3.5 h-3.5 text-green-500 dark:text-green-400'
						aria-hidden='true'
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 16 12'
					>
						<path
							stroke='currentColor'
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M1 5.917 5.724 10.5 15 1.5'
						/>
					</svg>
					<span>
						Rate:{' '}
						<span className='font-semibold text-gray-900 dark:text-white'>
							<span className=''>14%/Month</span> (Alpha-disabled)
						</span>
					</span>
				</li>
				{/* <li className='flex items-center space-x-3 rtl:space-x-reverse'>
					<svg
						className='flex-shrink-0 w-3.5 h-3.5 text-green-500 dark:text-green-400'
						aria-hidden='true'
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 16 12'
					>
						<path
							stroke='currentColor'
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M1 5.917 5.724 10.5 15 1.5'
						/>
					</svg>
					<span>
						Estimated Profit:{' '}
						<span className='font-semibold text-gray-900 dark:text-white'>
							<span className=''>18 SOL</span>
						</span>
					</span>
				</li> */}
				<li className='flex items-center space-x-3 rtl:space-x-reverse'>
					<svg
						className='flex-shrink-0 w-3.5 h-3.5 text-green-500 dark:text-green-400'
						aria-hidden='true'
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 16 12'
					>
						<path
							stroke='currentColor'
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M1 5.917 5.724 10.5 15 1.5'
						/>
					</svg>
					<span>
						Dropoff:{' '}
						<span className='font-semibold text-gray-900 dark:text-white'>
							<span className=''>+10% / -10%</span>
						</span>
					</span>
				</li>

				<li className='flex items-center space-x-3 rtl:space-x-reverse max-w-xs'>
					<svg
						className='flex-shrink-0 w-3.5 h-3.5 text-green-500 dark:text-green-400'
						aria-hidden='true'
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 16 12'
					>
						<path
							stroke='currentColor'
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M1 5.917 5.724 10.5 15 1.5'
						/>
					</svg>
					<span>
						Return Feature:{' '}
						<span className='font-semibold text-gray-900 dark:text-white'>
							<span className=' break-all'>
								Initial 1 SOL Lock + Staking Reward
							</span>{' '}
						</span>
					</span>
				</li>
				<li className='flex items-center space-x-3 rtl:space-x-reverse'>
					<svg
						className='flex-shrink-0 w-3.5 h-3.5 text-green-500 dark:text-green-400'
						aria-hidden='true'
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 16 12'
					>
						<path
							stroke='currentColor'
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M1 5.917 5.724 10.5 15 1.5'
						/>
					</svg>
					<span>
						Currency:{' '}
						<span className='font-semibold text-gray-900 dark:text-white'>
							<span className=''>SOL</span>
						</span>
					</span>
				</li>
			</ul>
		</>
	);
}
