import type { NextPage } from 'next';
import Head from 'next/head';
import { HomeView } from '../views';

const Home: NextPage = (props) => {
	return (
		<div>
			<Head>
				<title>SolFi LP Token Locker with APY Rewards</title>
				<meta
					name='description'
					content='SoliDefi ($SOLFI) Solana Token and Liquidity Pool LP Locker, with APY rewards'
				/>
			</Head>

			<HomeView />
		</div>
	);
};

export default Home;
