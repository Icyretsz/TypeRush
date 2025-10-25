import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GameDurationSelector from '../game/GameDurationSelector.tsx'
import { GAME_DURATION } from '../../common/constant'

const mockSetSelectedDuration = vi.fn()

describe('GameDurationSelector', () => {
	it('should render all duration options', () => {
		render(
			<GameDurationSelector
				selectedDuration={15}
				setSelectedDuration={mockSetSelectedDuration}
			/>
		)

		expect(screen.getByText('15')).toBeInTheDocument()
		expect(screen.getByText('30')).toBeInTheDocument()
		expect(screen.getByText('60')).toBeInTheDocument()
		expect(screen.getByText('No time')).toBeInTheDocument()
	})

	it.each(GAME_DURATION)(
		'should call setSelectedDuration when duration %s is clicked',
		async duration => {
			const user = userEvent.setup()
			render(
				<GameDurationSelector
					selectedDuration={15}
					setSelectedDuration={mockSetSelectedDuration}
				/>
			)
			const displayText = duration === 0 ? 'No time' : duration.toString()
			const durationElement = screen.getByText(displayText)
			await user.click(durationElement)
			expect(mockSetSelectedDuration).toHaveBeenCalledWith(duration)
		}
	)

	it('should apply non-selected styling to unselected durations', () => {
		render(
			<GameDurationSelector
				selectedDuration={30}
				setSelectedDuration={mockSetSelectedDuration}
			/>
		)

		const unselectedElement = screen.getByText('15')
		expect(unselectedElement).toHaveClass('text-gray-400')
		expect(unselectedElement).not.toHaveClass(
			'font-bold',
			'text-accent-primary'
		)
	})
})
