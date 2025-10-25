import React from 'react'
import TypingAnimation from '../components/game/TypingAnimationLogo.tsx'
import PracticeMode from '../components/game/PracticeMode.tsx'
const LandingPage = (): React.JSX.Element => {
	return (
		<div className='flex min-h-screen items-center justify-center flex-col gap-10 mt-[-50px]'>
			<div className='text-center'>
				<h1 className='text-8xl font-bold tracking-tight'>
					<TypingAnimation text='TypeRush' speed={200} colorSplit={4} />
				</h1>
			</div>
			<PracticeMode />
		</div>
	)
}

export default LandingPage
