import { Button, Modal } from 'antd'
import type { ResultsModalProps } from '../../common/types.ts'

export const ResultsModal = ({
	isOpen,
	results,
	position,
	onClose,
}: ResultsModalProps) => (
	<Modal
		centered
		open={isOpen}
		onCancel={onClose}
		footer={[
			<Button key='close' onClick={onClose}>
				Close
			</Button>,
		]}
		title='Your Results'
	>
		{results && (
			<div>
				<p>Accuracy: {results.accuracy.toFixed(1)}%</p>
				<p>WPM: {results.wpm.toFixed(1)}</p>
				<p>Raw WPM: {results.rawWpm.toFixed(1)}</p>
				<p>Correct chars: {results.correct}</p>
				<p>Incorrect chars: {results.incorrect}</p>
				{position !== null && position !== undefined && (
					<p>Position: {position + 1}</p>
				)}
			</div>
		)}
	</Modal>
)
