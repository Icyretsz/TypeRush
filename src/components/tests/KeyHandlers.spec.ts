import { describe, it, expect, vi } from 'vitest'
import {
	shouldExtendWord,
	shouldAllowCharInMultiplayer,
	handleBackspaceLogic,
	handleCharacterInput,
	shouldStartTimer,
} from '../../game/logic/keyHandlers.ts'

describe('shouldExtendWord', () => {
	it('should return true when typed length exceeds original and in practice mode', () => {
		expect(shouldExtendWord(10, 8, true)).toBe(true)
	})

	it('should return false when not in practice mode', () => {
		expect(shouldExtendWord(10, 8, false)).toBe(false)
	})

	it('should return false when typed length is less than original', () => {
		expect(shouldExtendWord(5, 8, true)).toBe(false)
	})
})

describe('shouldAllowCharInMultiplayer', () => {
	it('should return true when next char matches pressed key', () => {
		expect(shouldAllowCharInMultiplayer('a', 'a')).toBe(true)
	})

	it('should return false when next char does not match pressed key', () => {
		expect(shouldAllowCharInMultiplayer('a', 'b')).toBe(false)
	})

	it('should return false when next char is undefined', () => {
		expect(shouldAllowCharInMultiplayer(undefined, 'a')).toBe(false)
	})
})

describe('handleBackspaceLogic', () => {
	it('should not update anything when typed is empty', () => {
		const setCaretIdx = vi.fn()
		const setLocalWords = vi.fn()

		handleBackspaceLogic(
			'',
			-1,
			'hello',
			'hello',
			0,
			setCaretIdx,
			setLocalWords
		)

		expect(setCaretIdx).not.toHaveBeenCalled()
		expect(setLocalWords).not.toHaveBeenCalled()
	})

	it('should update caret index when caret is at typed length', () => {
		const setCaretIdx = vi.fn()
		const setLocalWords = vi.fn()

		handleBackspaceLogic(
			'hel',
			2,
			'hello',
			'hello',
			0,
			setCaretIdx,
			setLocalWords
		)

		expect(setCaretIdx).toHaveBeenCalledWith(expect.any(Function))
		const updateFn = setCaretIdx.mock.calls[0][0]
		expect(updateFn(2)).toBe(1)
	})

	it('should trim word when typed length exceeds original', () => {
		const setCaretIdx = vi.fn()
		const setLocalWords = vi.fn()

		handleBackspaceLogic(
			'helloworld',
			9,
			'hello',
			'helloworld',
			0,
			setCaretIdx,
			setLocalWords
		)

		expect(setLocalWords).toHaveBeenCalled()
		const updateFn = setLocalWords.mock.calls[0][0]
		const result = updateFn(['helloworld', 'test'])
		expect(result[0]).toBe('helloworl')
	})

	it('should handle backspace when caret is not at typed length', () => {
		const setCaretIdx = vi.fn()
		const setLocalWords = vi.fn()

		handleBackspaceLogic(
			'hello',
			3,
			'hello',
			'hello',
			0,
			setCaretIdx,
			setLocalWords
		)

		expect(setCaretIdx).not.toHaveBeenCalled()
		expect(setLocalWords).not.toHaveBeenCalled()
	})

	it('should handle backspace at caret position -1', () => {
		const setCaretIdx = vi.fn()
		const setLocalWords = vi.fn()

		handleBackspaceLogic(
			'h',
			0,
			'hello',
			'hello',
			0,
			setCaretIdx,
			setLocalWords
		)

		const updateFn = setCaretIdx.mock.calls[0][0]
		expect(updateFn(0)).toBe(-1) // Math.max(-1, 0 - 1)
	})
})

describe('handleCharacterInput', () => {
	it('should extend word in practice mode when typed exceeds original', () => {
		const setLocalWords = vi.fn()
		const setCaretIdx = vi.fn()

		handleCharacterInput(
			'x',
			'hello',
			'hello',
			'hello',
			0,
			4,
			true,
			false,
			setLocalWords,
			setCaretIdx
		)

		expect(setLocalWords).toHaveBeenCalled()
		const updateFn = setLocalWords.mock.calls[0][0]
		const result = updateFn(['hello', 'test'])
		expect(result[0]).toBe('hellox')

		expect(setCaretIdx).toHaveBeenCalled()
	})

	it('should update caret in practice mode without extending', () => {
		const setLocalWords = vi.fn()
		const setCaretIdx = vi.fn()

		handleCharacterInput(
			'e',
			'h',
			'hello',
			'hello',
			0,
			0,
			true,
			false,
			setLocalWords,
			setCaretIdx
		)

		expect(setLocalWords).not.toHaveBeenCalled()
		expect(setCaretIdx).toHaveBeenCalled()
	})

	it('should handle edge case: extending at exact boundary', () => {
		const setLocalWords = vi.fn()
		const setCaretIdx = vi.fn()

		handleCharacterInput(
			'o',
			'hell',
			'hell',
			'hell',
			0,
			3, // at last char
			true,
			false,
			setLocalWords,
			setCaretIdx
		)

		expect(setLocalWords).toHaveBeenCalled()
		const updateFn = setLocalWords.mock.calls[0][0]
		const result = updateFn(['hell', 'world'])
		expect(result[0]).toBe('hello')
	})

	it('should prevent default in multiplayer when wrong char is pressed', () => {
		const setLocalWords = vi.fn()
		const setCaretIdx = vi.fn()

		const result = handleCharacterInput(
			'x',
			'hel',
			'hello',
			'hello',
			0,
			2,
			false,
			true, // isMultiplayerMode
			setLocalWords,
			setCaretIdx
		)

		expect(result).toBe(false)
		expect(setCaretIdx).not.toHaveBeenCalled()
	})

	it('should allow correct char in multiplayer mode', () => {
		const setLocalWords = vi.fn()
		const setCaretIdx = vi.fn()

		const result = handleCharacterInput(
			'l',
			'hel',
			'hello',
			'hello',
			0,
			2,
			false,
			true, // isMultiplayerMode
			setLocalWords,
			setCaretIdx
		)

		expect(result).toBe(true)
		expect(setCaretIdx).toHaveBeenCalled()
	})
})

describe('shouldStartTimer', () => {
	const blockedKeys = new Set(['Tab', 'Escape'])

	it('should return true when startTime is null and key is regular character', () => {
		expect(shouldStartTimer(null, 'h', blockedKeys)).toBe(true)
	})

	it('should return false when startTime is already set', () => {
		expect(shouldStartTimer(Date.now(), 'h', blockedKeys)).toBe(false)
	})

	it('should return false for space key', () => {
		expect(shouldStartTimer(null, ' ', blockedKeys)).toBe(false)
	})

	it('should return false for backspace key', () => {
		expect(shouldStartTimer(null, 'Backspace', blockedKeys)).toBe(false)
	})

	it('should return false for blocked keys', () => {
		expect(shouldStartTimer(null, 'Tab', blockedKeys)).toBe(false)
		expect(shouldStartTimer(null, 'Escape', blockedKeys)).toBe(false)
	})
})
