import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useGameStore } from '../../stores/useGameStore.ts'
import Caret from './Caret.tsx'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { type MainGameContainerProps } from '../../common/types.ts'
import {
	InputKey,
	CharacterState,
	PlayerColor,
	TypingMode,
	BLOCKED_KEYS,
} from '../../common/constant.ts'
import { TbReload } from 'react-icons/tb'
import {
	handleBackspaceLogic,
	handleCharacterInput,
} from '../../game/logic/keyHandlers.ts'
import {
	generateWordResults,
	shouldAdvanceToNextWord,
} from '../../game/logic/typingLogic.ts'
import { calculateTypingStats } from '../../game/logic/statsCalculator.ts'
import { ResultsModal } from './ResultsModal.tsx'
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
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

	const { updateCaret, roomId, players, socket, handlePlayerFinish, position } =
		useGameStore()

	const [localWords, setLocalWords] = useState<string[]>(words)
	const [currentWordIdx, setCurrentWordIdx] = useState(0)
	const [typed, setTyped] = useState<string>('')
	const [caretIdx, setCaretIdx] = useState(-1)
	const [wordResults, setWordResults] = useState<Record<number, string[]>>({})

	const [results, setResults] = useState<null | {
		accuracy: number
		wpm: number
		rawWpm: number
		correct: number
		incorrect: number
	}>(null)

	const [startTime, setStartTime] = useState<number | null>(null)
	const [remainingTime, setRemainingTime] = useState<number>(duration)
	const [timeElapsed, setTimeElapsed] = useState<number>(0)

	const currentWordLocal = useMemo(
		() => localWords[currentWordIdx] ?? null,
		[currentWordIdx, localWords]
	)

	const currentWordOriginal = useMemo(
		() => words[currentWordIdx] ?? null,
		[currentWordIdx, words]
	)

	const isTimedMode = duration !== 0
	const isPracticeMode = mode === TypingMode.PRACTICE
	const isMultiplayerMode = mode === TypingMode.MULTIPLAYER

	const handleSpacePress = () => {
		if (!shouldAdvanceToNextWord(typed, currentWordIdx, words.length)) return

		setCaretIdx(-1)

		const currentResults = generateWordResults(typed, currentWordOriginal)

		setWordResults(prev => ({
			...prev,
			[currentWordIdx]: currentResults,
		}))

		setCurrentWordIdx(prev => {
			const nextIdx = prev + 1
			if (!localWords[nextIdx]) return prev
			return nextIdx
		})
		setTyped('')
	}

	const handleReset = useCallback(() => {
		setCurrentWordIdx(0)
		setTyped('')
		setWordResults({})
		setCaretIdx(-1)
		setLocalWords(words)
		if (roomId) {
			updateCaret({ caretIdx: -1, wordIdx: 0 }, roomId)
		}
		if (timerRef.current) {
			clearInterval(timerRef.current)
			timerRef.current = null
		}
		setRemainingTime(duration)
		setStartTime(null)
		setTimeElapsed(0)
		setResults(null)
	}, [words, roomId, updateCaret, duration])

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

		if (!startTime) {
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
		caretRefs.current = Array.from({ length: 4 }, () => null)
	}, [])

	useEffect(() => {
		if (!startTime) return

		timerRef.current = setInterval(() => {
			if (isTimedMode) setRemainingTime(prev => prev - 1)
			else setTimeElapsed(prev => prev + 1)
		}, 1000)

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current)
				timerRef.current = null
			}
		}
	}, [isTimedMode, startTime])

	useEffect(() => {
		setRemainingTime(duration)
	}, [duration])

	useEffect(() => {
		if (remainingTime === 0 && isTimedMode && timerRef.current) {
			const stats = calculateTypingStats(wordResults, duration, timeElapsed)
			setResults(stats)
			if (timerRef.current) clearInterval(timerRef.current)
		}
	}, [
		handleReset,
		remainingTime,
		isTimedMode,
		wordResults,
		duration,
		timeElapsed,
	])

	useEffect(() => {
		if (
			currentWordIdx === words.length - 1 &&
			caretIdx === currentWordOriginal.length - 1
		) {
			const stats = calculateTypingStats(wordResults, duration, timeElapsed)
			setResults(stats)
			if (timerRef.current) clearInterval(timerRef.current)
			handlePlayerFinish(roomId, stats)
		}
	}, [
		currentWordIdx,
		caretIdx,
		duration,
		words,
		handlePlayerFinish,
		roomId,
		currentWordOriginal.length,
		wordResults,
		timeElapsed,
	])

	useEffect(() => {
		if (!roomId) return
		if (caretIdx !== -1 || currentWordIdx !== 0) {
			updateCaret({ caretIdx, wordIdx: currentWordIdx }, roomId)
		}
	}, [caretIdx, currentWordIdx, roomId, updateCaret])

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
			{duration !== 0 ? (
				<div className='mb-[10px] text-4xl font-bold text-accent-primary'>
					{remainingTime}
				</div>
			) : (
				<div className='mb-[10px] text-4xl font-bold text-accent-primary'>
					{timeElapsed}
				</div>
			)}
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
							let state = ''
							if (wordIdx < currentWordIdx) {
								const storedResults = wordResults[wordIdx]
								if (storedResults && storedResults[idx]) {
									state =
										storedResults[idx] === CharacterState.CORRECT
											? 'text-white'
											: storedResults[idx] === CharacterState.INCORRECT
												? 'text-red-500'
												: ''
								}
							} else if (wordIdx === currentWordIdx) {
								if (idx < typed.length) {
									state = typed[idx] === char ? 'text-white' : 'text-red-500'
								} else if (idx >= currentWordOriginal.length) {
									state = 'text-red-500'
								}
							}
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
				// <Modal
				// 	open={!!results}
				// 	onCancel={handleReset}
				// 	footer={[
				// 		<Button key='close' onClick={handleReset}>
				// 			Close
				// 		</Button>,
				// 	]}
				// 	title='Your Results'
				// >
				// 	{results && (
				// 		<div>
				// 			<p>Accuracy: {results.accuracy.toFixed(1)}%</p>
				// 			<p>WPM: {results.wpm.toFixed(1)}</p>
				// 			<p>Raw WPM: {results.rawWpm.toFixed(1)}</p>
				// 			<p>Correct chars: {results.correct}</p>
				// 			<p>Incorrect chars: {results.incorrect}</p>
				// 		</div>
				// 	)}
				// </Modal>
				<ResultsModal
					isOpen={!!results}
					results={results}
					position={position}
					onClose={handleReset}
				/>
			)}
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
