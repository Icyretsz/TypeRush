export const GAME_DURATION = [15, 30, 60, 0]

export const SAMPLE_WORDS = [
	'about',
	'after',
	'again',
	// 'animal',
	// 'around',
	// 'before',
	// 'between',
	// 'cause',
	// 'change',
	// 'country',
	// 'different',
	// 'example',
	// 'father',
	// 'follow',
	// 'great',
	// 'house',
	// 'important',
	// 'large',
	// 'little',
	// 'mother',
	// 'number',
	// 'other',
	// 'people',
	// 'place',
	// 'point',
	// 'right',
	// 'small',
	// 'student',
	// 'system',
	// 'water',
]

export const InputKey = {
	SPACE: ' ',
	BACKSPACE: 'Backspace',
	ARROW_LEFT: 'ArrowLeft',
	ARROW_RIGHT: 'ArrowRight',
	ARROW_UP: 'ArrowUp',
	ARROW_DOWN: 'ArrowDown',
	TAB: 'Tab',
	ENTER: 'Enter',
	ESCAPE: 'Escape',
	ALT: 'Alt',
	CONTROL: 'Control',
	SHIFT: 'Shift',
	META: 'Meta',
}

export const BLOCKED_KEYS = new Set([
	InputKey.TAB,
	InputKey.ENTER,
	InputKey.ARROW_UP,
	InputKey.ARROW_DOWN,
	InputKey.ARROW_LEFT,
	InputKey.ARROW_RIGHT,
	InputKey.ALT,
	InputKey.CONTROL,
	InputKey.META,
	InputKey.SHIFT,
	InputKey.ESCAPE,
])

export const TypingMode = {
	PRACTICE: 'practice',
	MULTIPLAYER: 'multiplayer',
} as const

export const PlayerColor = {
	RED: '#ef4444',
	GREEN: '#22c55e',
	AMBER: '#f59e0b',
	BLUE: '#3b82f6',
	GRAY: '#6b7280',
}

export const CharacterState = {
	CORRECT: 'correct',
	INCORRECT: 'incorrect',
	UNTYPED: 'untyped',
}
