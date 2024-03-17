import type { NextPage } from 'next';
import Head from 'next/head';
import { ListLocks } from '../views';

export const Locker: NextPage = (props) => {
	return (
		<div>
			<Head>
				<title>SolFi Locker</title>
				<meta
					name='description'
					content='Locker Utility – Lock your Solana SPL LP or Tokens today!'
				/>
			</Head>
			<ListLocks />
		</div>
	);
};

export default Locker;
