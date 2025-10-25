import { CharacterState } from '../../common/constant.ts'

export interface TypingStats {
	accuracy: number
	wpm: number
	rawWpm: number
	correct: number
	incorrect: number
}

export const countCharacters = (
	wordResults: Record<number, string[]>
): { correct: number; incorrect: number } => {
	let correct = 0
	let incorrect = 0

	Object.values(wordResults).forEach(results => {
		results.forEach(r => {
			if (r === CharacterState.CORRECT) correct++
			if (r === CharacterState.INCORRECT) incorrect++
		})
	})

	return { correct, incorrect }
}

export const calculateAccuracy = (
	correct: number,
	incorrect: number
): number => {
	const totalTyped = correct + incorrect
	return totalTyped > 0 ? (correct / totalTyped) * 100 : 0
}

export const calculateWPM = (
	correctChars: number,
	timeInMinutes: number
): number => {
	if (timeInMinutes === 0) return 0
	return correctChars / 5 / timeInMinutes
}

export const calculateRawWPM = (
	totalChars: number,
	timeInMinutes: number
): number => {
	if (timeInMinutes === 0) return 0
	return totalChars / 5 / timeInMinutes
}

export const calculateTypingStats = (
	wordResults: Record<number, string[]>,
	duration: number,
	timeElapsed: number
): TypingStats => {
	const { correct, incorrect } = countCharacters(wordResults)
	const totalTyped = correct + incorrect
	const accuracy = calculateAccuracy(correct, incorrect)
	const timeInMinutes = duration !== 0 ? duration / 60 : timeElapsed / 60
	const wpm = calculateWPM(correct, timeInMinutes)
	const rawWpm = calculateRawWPM(totalTyped, timeInMinutes)

	return { accuracy, wpm, rawWpm, correct, incorrect }
}
