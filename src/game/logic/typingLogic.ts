import { CharacterState } from '../../common/constant.ts'

export const calculateCharacterState = (
	typed: string,
	originalWord: string,
	charIndex: number
): string => {
	if (charIndex >= typed.length) {
		return CharacterState.UNTYPED
	}
	return typed[charIndex] === originalWord[charIndex]
		? CharacterState.CORRECT
		: CharacterState.INCORRECT
}

export const generateWordResults = (
	typed: string,
	originalWord: string
): string[] => {
	const results = originalWord
		.split('')
		.map((_char, idx) => calculateCharacterState(typed, originalWord, idx))

	// Handle overflow characters
	if (typed.length > originalWord.length) {
		const overflowCount = typed.length - originalWord.length
		for (let i = 0; i < overflowCount; i++) {
			results.push(CharacterState.INCORRECT)
		}
	}

	return results
}

export const shouldAdvanceToNextWord = (
	typed: string,
	currentWordIdx: number,
	totalWords: number
): boolean => {
	return typed.trim() !== '' && currentWordIdx < totalWords - 1
}

export const getCharacterDisplayState = (
	wordIdx: number,
	charIdx: number,
	currentWordIdx: number,
	typed: string,
	char: string,
	wordResults: Record<number, string[]>
): string => {
	if (wordIdx < currentWordIdx) {
		const storedResults = wordResults[wordIdx]
		if (storedResults && storedResults[charIdx]) {
			if (storedResults[charIdx] === CharacterState.CORRECT) {
				return 'text-white'
			}
			if (storedResults[charIdx] === CharacterState.INCORRECT) {
				return 'text-red-500'
			}
		}
		return ''
	}

	if (wordIdx === currentWordIdx && charIdx < typed.length) {
		return typed[charIdx] === char ? 'text-white' : 'text-red-500'
	}

	return ''
}
