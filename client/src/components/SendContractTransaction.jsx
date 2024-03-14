import React, { useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { notify } from '../utils/notifications';
import idl from '../idl/token_locker.json';
import { Program } from '@project-serum/anchor';

const programID = new PublicKey(idl.metadata.address);

const SendContractTransaction = () => {
	return <button>Send Contract Transaction</button>;
};

export default SendContractTransaction;
