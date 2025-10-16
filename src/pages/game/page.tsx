import MainGameContainer from '../../components/MainGameContainer.tsx'
import { SAMPLE_WORDS } from '../../common/constant.ts'

const Page = () => {
	return (
		<div className='w-screen h-screen flex justify-center items-center'>
			<MainGameContainer words={SAMPLE_WORDS} mode={'practice'} duration={15} />
		</div>
	)
}

export default Page
