import type { NextPage } from 'next';
import Head from 'next/head';
import { BasicsView } from '../views';

const Locker: NextPage = (props) => {
	return (
		<div>
			<Head>
				<title>Solana Scaffold</title>
				<meta name='description' content='Basic Functionality' />
			</Head>
			<BasicsView />
		</div>
	);
};

export default Locker;
