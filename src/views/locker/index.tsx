import { FC } from 'react';
import LockerMain from '../../components/LockerMain';

export const LockerView: FC = ({}) => {
	return (
		<div className='md:hero mx-auto p-4'>
			<div className='md:hero-content flex flex-col'>
				<h1 className='text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-[hsl(195,85%,24%)] to-[#2baece] mt-10 mb-8'>
					Locker
				</h1>
				{/* CONTENT GOES HERE */}
				<div className='text-center'>
					<LockerMain props={{}} />
				</div>
			</div>
		</div>
	);
};
