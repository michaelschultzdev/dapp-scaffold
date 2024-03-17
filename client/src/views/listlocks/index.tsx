import { FC } from 'react';
import ListTheLocks from '../../components/ListTheLocks';

export const ListLocks: FC = ({}) => {
	return (
		<>
			<h1 className='text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-[hsl(195,85%,24%)] to-[#2baece] mt-10 mb-8'>
				All SolFi Locks
			</h1>
			<ListTheLocks />
		</>
	);
};
