import { useEffect, useState } from 'react'
import { useGameStore } from '../../stores/useGameStore.ts'
import JoinRoomModal from '../../components/game/JoinRoomModal.tsx'
import MainGameContainer from '../../components/game/MainGameContainer.tsx'
import GameStartModal from '../../components/game/GameStartModal.tsx'
import { Button } from 'antd'
import { PiCrownFill } from 'react-icons/pi'
import GameFinishModal from '../../components/game/GameFinishModal.tsx'
import { SAMPLE_WORDS } from '../../common/constant.ts'

const Page = () => {
	const {
		connect,
		createRoom,
		joinRoom,
		connected,
		roomId,
		players,
		error,
		isGameStarted,
		startGame,
		displayFinishModal,
		setDisplayFinishModal,
	} = useGameStore()
	const [open, setOpen] = useState(true)
	const [confirmLoading, setConfirmLoading] = useState(false)
	const { renderStartModal, isHost, stopGame } = useGameStore()

	const handleOk = (values: { playerName: string; roomId?: string }) => {
		setConfirmLoading(true)

		connect()

		if (values.roomId) {
			joinRoom(values.roomId, values.playerName)
		} else {
			createRoom(values.playerName)
		}
	}

	useEffect(() => {
		if (connected && roomId && error.type === '') {
			setConfirmLoading(false)
			setOpen(false)
		}
		if (error.type !== '') {
			setConfirmLoading(false)
		}
	}, [connected, error, roomId])

	return (
		<div className='min-h-screen bg-[#383A3E] text-white flex flex-col'>
			<JoinRoomModal
				open={open}
				onOk={handleOk}
				confirmLoading={confirmLoading}
				error={error}
			/>

			<main className='flex gap-5 p-5'>
				<div className='flex-1 p-6 flex flex-col bg-[#414246] justify-between'>
					<div>
						<p>Room id: {roomId}</p>
						<p className='mb-6'>{players.length}/4</p>
						<div className='grid grid-cols-2 gap-6'>
							{players &&
								players.map(player => (
									<div
										key={player.id}
										className='h-28 bg-gray-200 rounded-xl p-5 text-black'
									>
										Player: {player.playerName}
										{player.isHost && <PiCrownFill className='inline ml-1' />}
									</div>
								))}
						</div>
					</div>

					{isHost && (
						<div className='flex justify-center mt-8 gap-5'>
							<Button
								onClick={() => {
									startGame(roomId)
								}}
								type='primary'
								disabled={isGameStarted}
							>
								START
							</Button>
							<Button danger type='primary' onClick={() => stopGame(roomId)}>
								STOP
							</Button>
						</div>
					)}
				</div>

				<aside className='w-80 p-6 bg-[#414246]'>
					<h2 className='text-sm font-semibold'>Lobby Settings</h2>
				</aside>
			</main>

			{renderStartModal && <GameStartModal duration={3} />}

			{displayFinishModal && (
				<GameFinishModal
					setDisplayFinishModal={setDisplayFinishModal}
					displayFinishModal={displayFinishModal}
				/>
			)}

			{roomId && isGameStarted && (
				<div className='flex justify-center items-center'>
					<MainGameContainer
						words={SAMPLE_WORDS}
						mode={'multiplayer'}
						duration={0}
					/>
				</div>
			)}
		</div>
	)
}

export default Page
