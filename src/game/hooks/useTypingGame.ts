import { useState, useCallback, useMemo } from 'react'
import {
	generateWordResults,
	shouldAdvanceToNextWord,
} from '../logic/typingLogic'
import { calculateTypingStats } from '../logic/statsCalculator'
import type { GameResults } from '../../common/types.ts'

export const useTypingGame = (
	words: string[],
	duration: number,
	onFinish?: (stats: GameResults) => void
) => {
	const [localWords, setLocalWords] = useState<string[]>(words)
	const [currentWordIdx, setCurrentWordIdx] = useState(0)
	const [typed, setTyped] = useState<string>('')
	const [caretIdx, setCaretIdx] = useState(-1)
	const [wordResults, setWordResults] = useState<Record<number, string[]>>({})
	const [results, setResults] = useState<GameResults | null>(null)

	const currentWordLocal = useMemo(
		() => localWords[currentWordIdx] ?? null,
		[currentWordIdx, localWords]
	)

	const currentWordOriginal = useMemo(
		() => words[currentWordIdx] ?? null,
		[currentWordIdx, words]
	)

	const handleSpacePress = useCallback(() => {
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
	}, [typed, currentWordIdx, words, currentWordOriginal, localWords])

	const handleReset = useCallback(() => {
		setCurrentWordIdx(0)
		setTyped('')
		setWordResults({})
		setCaretIdx(-1)
		setLocalWords(words)
		setResults(null)
	}, [words])

	const finishGame = useCallback(
		(timeElapsed: number) => {
			const stats = calculateTypingStats(wordResults, duration, timeElapsed)
			setResults(stats)
			if (onFinish) onFinish(stats)
			return stats
		},
		[wordResults, duration, onFinish]
	)

	return {
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
		handleReset,
		finishGame,
	}
}
