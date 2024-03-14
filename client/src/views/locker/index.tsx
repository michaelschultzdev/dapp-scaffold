import { FC } from 'react';
// import LockerMain from '../../components/LockerMain';
import SendContractTransaction from '../../components/SendContractTransaction';

export const LockerView: FC = ({}) => {
	return (
		<>
			<h1 className='text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-[hsl(195,85%,24%)] to-[#2baece] mt-10 mb-8'>
				SolFi Locker RC
			</h1>
			<SendContractTransaction />
			{/* <LockerMain props={{}} /> */}
		</>
	);
};
