import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MainGameContainer from '../../components/game/MainGameContainer.tsx'
import { TypingMode } from '../../common/constant.ts'
import * as keyHandlers from '../../game/logic/keyHandlers'

vi.mock('../../game/logic/keyHandlers', () => ({
	handleBackspaceLogic: vi.fn(),
	handleCharacterInput: vi.fn(() => true),
	shouldExtendWord: vi.fn(),
	shouldAllowCharInMultiplayer: vi.fn(),
	shouldStartTimer: vi.fn(),
}))

vi.mock('../../stores/useGameStore', () => ({
	useGameStore: vi.fn(() => ({
		updateCaret: vi.fn(),
		roomId: null,
		players: [],
		socket: null,
		handlePlayerFinish: vi.fn(),
		position: null,
	})),
}))

describe('MainGameContainer - handleKeyDown integration', () => {
	const mockWords = ['hello', 'world', 'test']

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should handle BACKSPACE key press', async () => {
		const user = userEvent.setup()

		render(
			<MainGameContainer
				words={mockWords}
				mode={TypingMode.PRACTICE}
				duration={0}
			/>
		)

		const input = screen.getByRole('textbox')

		await user.click(input)
		await user.type(input, 'hel')
		await user.keyboard('{Backspace}')

		expect(keyHandlers.handleBackspaceLogic).toHaveBeenCalled()
	})

	it('should handle regular character input', async () => {
		const user = userEvent.setup()

		render(
			<MainGameContainer
				words={mockWords}
				mode={TypingMode.PRACTICE}
				duration={0}
			/>
		)

		const input = screen.getByRole('textbox')

		await user.click(input)
		await user.type(input, 'h')

		expect(keyHandlers.handleCharacterInput).toHaveBeenCalled()
	})

	it('should block Tab key and not call any handlers', async () => {
		const user = userEvent.setup()

		render(
			<MainGameContainer
				words={mockWords}
				mode={TypingMode.PRACTICE}
				duration={0}
			/>
		)

		const input = screen.getByRole('textbox')

		await user.click(input)
		await user.keyboard('{Tab}')

		expect(keyHandlers.handleCharacterInput).not.toHaveBeenCalled()
		expect(keyHandlers.handleBackspaceLogic).not.toHaveBeenCalled()
	})
})
