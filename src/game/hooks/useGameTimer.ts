import { useState, useEffect, useRef, useCallback } from 'react'

export const useGameTimer = (
	duration: number,
	isTimedMode: boolean,
	startTime: number | null,
	onTimesUp?: () => void
) => {
	const [remainingTime, setRemainingTime] = useState(duration)
	const [timeElapsed, setTimeElapsed] = useState(0)
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
		if (remainingTime === 0 && isTimedMode && onTimesUp) {
			onTimesUp()
			if (timerRef.current) clearInterval(timerRef.current)
		}
	}, [remainingTime, isTimedMode, onTimesUp])

	const resetTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current)
			timerRef.current = null
		}
		setRemainingTime(duration)
		setTimeElapsed(0)
	}, [duration])

	const stopTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current)
			timerRef.current = null
		}
	}, [])

	return {
		remainingTime,
		timeElapsed,
		resetTimer,
		stopTimer,
	}
}
