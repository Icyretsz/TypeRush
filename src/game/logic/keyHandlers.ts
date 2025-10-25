export const shouldExtendWord = (
	typedLength: number,
	originalWordLength: number,
	isPracticeMode: boolean
): boolean => {
	return typedLength >= originalWordLength && isPracticeMode
}

export const shouldAllowCharInMultiplayer = (
	nextChar: string | undefined,
	pressedKey: string
): boolean => {
	return !!nextChar && nextChar === pressedKey
}

export const handleBackspaceLogic = (
	typed: string,
	caretIdx: number,
	currentWordOriginal: string,
	currentWordLocal: string,
	currentWordIdx: number,
	setCaretIdx: (fn: (prev: number) => number) => void,
	setLocalWords: (fn: (prev: string[]) => string[]) => void
) => {
	if (typed.length === 0) return

	const newLength = typed.length - 1

	if (caretIdx === newLength) {
		setCaretIdx(prev => Math.max(-1, prev - 1))
	}

	// Delete extended characters if typed length exceeds original word length
	if (newLength >= currentWordOriginal.length) {
		const newWord = currentWordLocal.slice(0, newLength)
		setLocalWords(prev => {
			const newLocalWords = [...prev]
			newLocalWords[currentWordIdx] = newWord
			return newLocalWords
		})
	}
}

export const handleCharacterInput = (
	key: string,
	typed: string,
	currentWordOriginal: string,
	currentWordLocal: string,
	currentWordIdx: number,
	caretIdx: number,
	isPracticeMode: boolean,
	isMultiplayerMode: boolean,
	setLocalWords: (fn: (prev: string[]) => string[]) => void,
	setCaretIdx: (fn: (prev: number) => number) => void
): boolean => {
	if (
		shouldExtendWord(typed.length, currentWordOriginal.length, isPracticeMode)
	) {
		const newWord = currentWordLocal + key
		setLocalWords(prev => {
			const newLocalWords = [...prev]
			newLocalWords[currentWordIdx] = newWord
			return newLocalWords
		})
	}

	if (isMultiplayerMode) {
		const nextChar = currentWordLocal?.[caretIdx + 1]
		if (shouldAllowCharInMultiplayer(nextChar, key)) {
			setCaretIdx(prev => prev + 1)
			return true
		}
		return false // preventDefault
	}

	setCaretIdx(prev => prev + 1)
	return true
}
