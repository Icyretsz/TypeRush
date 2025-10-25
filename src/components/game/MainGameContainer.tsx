import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../stores/useGameStore.ts'
import Caret from './Caret.tsx'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { type MainGameContainerProps } from '../../common/types.ts'
import {
	InputKey,
	PlayerColor,
	TypingMode,
	BLOCKED_KEYS,
} from '../../common/constant.ts'
import { TbReload } from 'react-icons/tb'
import {
	handleBackspaceLogic,
	handleCharacterInput,
	shouldStartTimer,
} from '../../game/logic/keyHandlers.ts'
import { useTypingGame } from '../../game/hooks/useTypingGame'
import { useGameTimer } from '../../game/hooks/useGameTimer'
import { GameTimer } from './GameTimer'
import { ResultsModal } from './ResultsModal'
import { getCharacterDisplayState } from '../../game/logic/typingLogic.ts'

gsap.registerPlugin(Flip)

const PLAYER_COLORS = [
	PlayerColor.RED,
	PlayerColor.GREEN,
	PlayerColor.AMBER,
	PlayerColor.BLUE,
]

const getPlayerColor = (playerIndex: number) => {
	return PLAYER_COLORS[playerIndex] || PlayerColor.GRAY
}

const MainGameContainer = ({
	words,
	mode,
	duration,
}: MainGameContainerProps) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const caretRefs = useRef<(HTMLSpanElement | null)[]>([])
	const hasFinishedRef = useRef(false)

	const { updateCaret, roomId, players, socket, handlePlayerFinish, position } =
		useGameStore()

	const [startTime, setStartTime] = useState<number | null>(null)

	const isTimedMode = duration !== 0
	const isPracticeMode = mode === TypingMode.PRACTICE
	const isMultiplayerMode = mode === TypingMode.MULTIPLAYER

	const {
		localWords,
		currentWordIdx,
		typed,
		caretIdx,
		wordResults,
		results,
		currentWordLocal,
		currentWordOriginal,
		setLocalWords,
		setTyped,
		setCaretIdx,
		handleSpacePress,
		handleReset: resetGameState,
		finishGame,
	} = useTypingGame(words, duration, stats => {
		handlePlayerFinish(roomId, stats)
	})

	const { remainingTime, timeElapsed, resetTimer, stopTimer } = useGameTimer(
		duration,
		isTimedMode,
		startTime,
		() => {
			if (!hasFinishedRef.current) {
				hasFinishedRef.current = true
				finishGame(timeElapsed)
			}
		}
	)

	const handleReset = useCallback(() => {
		resetGameState()
		resetTimer()
		setStartTime(null)
		hasFinishedRef.current = false // Reset the flag
		if (roomId) {
			updateCaret({ caretIdx: -1, wordIdx: 0 }, roomId)
		}
	}, [resetGameState, resetTimer, roomId, updateCaret])

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === InputKey.SPACE) {
			e.preventDefault()
			handleSpacePress()
			return
		}

		if (BLOCKED_KEYS.has(e.key)) {
			e.preventDefault()
			return
		}

		if (e.key === InputKey.BACKSPACE) {
			handleBackspaceLogic(
				typed,
				caretIdx,
				currentWordOriginal,
				currentWordLocal,
				currentWordIdx,
				setCaretIdx,
				setLocalWords
			)
			return
		}

		if (shouldStartTimer(startTime, e.key, BLOCKED_KEYS)) {
			setStartTime(Date.now())
		}

		const shouldNotPreventDefault = handleCharacterInput(
			e.key,
			typed,
			currentWordOriginal,
			currentWordLocal,
			currentWordIdx,
			caretIdx,
			isPracticeMode,
			isMultiplayerMode,
			setLocalWords,
			setCaretIdx
		)

		if (!shouldNotPreventDefault) {
			e.preventDefault()
		}
	}

	useEffect(() => {
		if (
			!hasFinishedRef.current &&
			currentWordIdx === words.length - 1 &&
			caretIdx === currentWordOriginal.length - 1
		) {
			hasFinishedRef.current = true
			finishGame(timeElapsed)
			stopTimer()
		}
	}, [
		currentWordIdx,
		caretIdx,
		currentWordOriginal.length,
		words.length,
		finishGame,
		timeElapsed,
		stopTimer,
	])

	useEffect(() => {
		if (!roomId || isPracticeMode) return
		if (caretIdx !== -1 || currentWordIdx !== 0) {
			updateCaret({ caretIdx, wordIdx: currentWordIdx }, roomId)
		}
	}, [caretIdx, currentWordIdx, isPracticeMode, roomId, updateCaret])

	useEffect(() => {
		caretRefs.current = Array.from({ length: 4 }, () => null)
	}, [])

	// Animate opponent carets
	useEffect(() => {
		if (!socket) return

		const otherPlayers = players.filter(p => p.id !== socket.id)

		otherPlayers.forEach((player, playerIndex) => {
			const caretElement = caretRefs.current[playerIndex]
			if (!caretElement) return

			const caret = player.progress?.caret
			if (!caret) return

			const { caretIdx: playerCaretIdx, wordIdx: playerWordIdx } = caret
			let target: HTMLElement | null = null

			if (playerCaretIdx === -1) {
				target = containerRef.current?.querySelector(
					`[data-word="${playerWordIdx}"][data-char="0"]`
				) as HTMLElement | null

				if (target) {
					const state = Flip.getState(caretElement)
					target.parentNode?.insertBefore(caretElement, target)
					Flip.from(state, {
						duration: 0.4,
						ease: 'power1.inOut',
					})
				}
				return
			}

			target = containerRef.current?.querySelector(
				`[data-word="${playerWordIdx}"][data-char="${playerCaretIdx}"]`
			) as HTMLElement | null

			if (!target) return

			const state = Flip.getState(caretElement)
			target.appendChild(caretElement)
			Flip.from(state, {
				duration: 0.4,
				ease: 'power1.inOut',
			})
		})
	}, [players, socket])

	// Animate own caret
	useEffect(() => {
		const caretElement = caretRefs.current[3]
		if (!caretElement) return

		let target: HTMLElement | null = null
		if (caretIdx === -1) {
			target = containerRef.current?.querySelector(
				`[data-word="${currentWordIdx}"][data-char="0"]`
			) as HTMLElement | null

			if (target) {
				const state = Flip.getState(caretElement)
				target.parentNode?.insertBefore(caretElement, target)
				Flip.from(state, {
					duration: 0.4,
					ease: 'power1.inOut',
				})
			}
			return
		}

		target = containerRef.current?.querySelector(
			`[data-word="${currentWordIdx}"][data-char="${caretIdx}"]`
		) as HTMLElement | null

		if (!target) return

		const state = Flip.getState(caretElement)
		target.appendChild(caretElement)
		Flip.from(state, {
			duration: 0.15,
			ease: 'power1.inOut',
		})
	}, [currentWordIdx, caretIdx, localWords])

	const otherPlayers = socket ? players.filter(p => p.id !== socket.id) : []

	return (
		<div>
			<GameTimer time={isTimedMode ? remainingTime : timeElapsed} />
			<div className='flex flex-col gap-5 mb-10'>
				{players.map((player, idx) => {
					return (
						<div key={idx}>
							<p>{player.playerName}</p>
							<p>caretIdx: {player.progress.caret.caretIdx}</p>
							<p>wordIdx: {player.progress.caret.wordIdx}</p>
						</div>
					)
				})}
			</div>
			<div
				ref={containerRef}
				tabIndex={0}
				className='max-h-[400px] text-gray-500 w-[1200px] flex flex-wrap gap-4 relative'
			>
				<Caret
					ref={el => {
						caretRefs.current[3] = el
					}}
					color={getPlayerColor(3)}
				/>
				{otherPlayers.map((player, playerIndex) => (
					<Caret
						key={player.id}
						ref={el => {
							caretRefs.current[playerIndex] = el
						}}
						isOpponent
						playerName={player.playerName}
						color={getPlayerColor(playerIndex)}
					/>
				))}
				{localWords?.map((word, wordIdx) => (
					<span className='text-3xl' key={wordIdx}>
						{word === currentWordLocal && (
							<input
								className='text-3xl opacity-0 absolute flex focus:outline-none focus:ring-0 focus:border-transparent'
								autoFocus
								type='text'
								value={typed}
								onKeyDown={e => handleKeyDown(e)}
								onChange={e => {
									const value = e.target.value.replace(/ /g, '')
									setTyped(value)
								}}
							/>
						)}
						{word?.split('').map((char, idx) => {
							const state = getCharacterDisplayState(
								wordIdx,
								idx,
								currentWordIdx,
								typed,
								char,
								wordResults,
								currentWordOriginal
							)
							return (
								<span
									key={idx}
									className={state}
									data-word={wordIdx}
									data-char={idx}
								>
									{char}
								</span>
							)
						})}
					</span>
				))}
			</div>

			{mode === TypingMode.PRACTICE && (
				<>
					<ResultsModal
						isOpen={!!results}
						results={results}
						onClose={handleReset}
					/>
					<TbReload
						className='size-8 cursor-pointer mt-[50px] mx-auto text-gray-400'
						onClick={handleReset}
					/>
				</>
			)}

			{mode === TypingMode.MULTIPLAYER && (
				<ResultsModal
					isOpen={results != null && position != null}
					results={results}
					position={position}
					onClose={handleReset}
				/>
			)}
		</div>
	)
}

export default MainGameContainer
