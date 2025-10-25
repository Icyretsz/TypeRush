import type { GameTimerProps } from '../../common/types.ts'

export const GameTimer = ({ time, className = '' }: GameTimerProps) => (
	<div
		className={`mb-[10px] text-4xl font-bold text-accent-primary ${className}`}
	>
		{time}
	</div>
)
