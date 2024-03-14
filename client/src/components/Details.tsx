import React from 'react';

export default function Details({
	lockInfo,
	lockToken,
	lockOwner,
	lockDate,
	lockAmount,
}) {
	return (
		<>
			<h2 className='text-2xl text-white pb-0 mb-0'>Lock Details</h2>
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
						Lock Name:{' '}
						<span className='font-semibold text-gray-900 dark:text-white'>
							{lockInfo ? lockInfo : '...Lock'}
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
						Token:{' '}
						<span className='font-semibold text-gray-900 dark:text-white break-all'>
							{lockToken ? lockToken : 'No token selected'}
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
						Lock Amount:{' '}
						<span className='font-semibold text-gray-900 dark:text-white break-all'>
							{lockAmount ? lockAmount : 'No amount entered'}
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
						Lock Date:{' '}
						<span className='font-semibold text-gray-900 dark:text-white break-all text-sm'>
							{lockDate ? lockDate : 'No date selected'}
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
						Lock Owner(s):{' '}
						<span className='font-semibold text-gray-900 dark:text-white break-all'>
							{lockOwner ? lockOwner : 'No owner address entered'}
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
						Lock Cost:{' '}
						<span className='font-semibold text-gray-900 dark:text-white'>
							(Free during Alpha Release)
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
						Features:{' '}
						<span className='font-semibold text-gray-900 dark:text-white'>
							Free Relock, <br />
							Staking Rewards - (After Alpha Release)
						</span>
					</span>
				</li>
			</ul>
		</>
	);
}
