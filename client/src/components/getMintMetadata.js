import { Metaplex } from '@metaplex-foundation/js';
import { Connection, PublicKey } from '@solana/web3.js';
import { ENV, TokenListProvider } from '@solana/spl-token-registry';

async function getTokenMetadata(mintaddy) {
	const connection = new Connection('https://api.devnet.solana.com');
	const metaplex = Metaplex.make(connection);
	let mintAddress;

	if (!mintaddy) {
		mintAddress = new PublicKey('3eWNRsWsbeJJHEnP5jKsMzynpnYvUD6ef8VCL2qxTw2U');
	} else {
		mintAddress = new PublicKey(mintaddy);
	}

	console.log('There is a mint address, if it ends in Tw2U, it is not pulling the actual mint address from the user wallet: ', mintAddress.toString());

	let tokenName;
	let tokenSymbol;
	let tokenLogo;

	const metadataAccount = metaplex
		.nfts()
		.pdas()
		.metadata({ mint: mintAddress });

	const metadataAccountInfo = await connection.getAccountInfo(metadataAccount);

	// console.log('is there metadata?')

	if (metadataAccountInfo) {
		const token = await metaplex
			.nfts()
			.findByMint({ mintAddress: mintAddress });
		tokenName = token.name;
		tokenSymbol = token.symbol;
		tokenLogo = token.json?.image;
	} else {
		const provider = await new TokenListProvider().resolve();
		const tokenList = provider.filterByChainId(ENV.MainnetBeta).getList();
		// console.log(tokenList);
		const tokenMap = tokenList.reduce((map, item) => {
			map.set(item.address, item);
			return map;
		}, new Map());

		const token = tokenMap.get(mintAddress.toBase58());

		if (!token) {
			return {
				name: 'Unknown',
				symbol: 'UNK',
				logo: 'https://cdn.discordapp.com/attachments/893341080289482516/893341107606745866/unknown.png'
			};
		} else {
			tokenName = token.name;
			tokenSymbol = token.symbol;
			tokenLogo = token.logoURI;
		}
	}

	// Return metadata as an object
	return {
		tokenName: tokenName,
		symbol: tokenSymbol,
		logo: tokenLogo
	};
}

export default getTokenMetadata;
