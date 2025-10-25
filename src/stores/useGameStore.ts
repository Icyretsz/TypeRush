import { create } from 'zustand'
import { io } from 'socket.io-client'
import type {
	Caret,
	Player,
	GameState,
	Room,
	GameError,
	PlayerStats,
} from '../common/types.ts'

export const useGameStore = create<GameState>((set, get) => ({
	socket: null,
	roomId: null,
	players: [],
	config: null,
	connected: false,
	playerName: null,
	error: { type: '', message: '' },
	isGameStarted: false,
	renderStartModal: false,
	isHost: false,
	leaderboard: [],
	position: null,
	displayFinishModal: false,
	selectedDuration: 15,

	connect: () => {
		if (get().socket) return
		const socket = io(
			import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
		)
		set({ socket })

		socket.on('connect', () => {
			set({ connected: true, socket })
		})

		socket.on('roomCreated', (room: Room) => {
			set({
				roomId: room.roomId,
				players: room.players,
				config: room.config,
				isHost: true,
			})
		})

		socket.on('roomJoined', (room: Room) => {
			set({
				roomId: room.roomId,
				players: room.players,
				config: room.config,
				error: { type: '', message: '' },
			})
		})

		socket.on('errorEvent', (err: GameError) => {
			set({ error: err })
		})

		socket.on('playersUpdated', (players: Player[]) => {
			set({ players })
		})

		socket.on('leaderboardUpdated', (playerId: string, stats: PlayerStats) => {
			const newLeaderboard = get().leaderboard
			newLeaderboard.push({ playerId, stats })
			console.log(newLeaderboard)
			if (playerId === get().socket?.id) {
				const position = newLeaderboard.findIndex(e => e.playerId === playerId)
				set({ leaderboard: newLeaderboard, position: position })
			} else {
				set({ leaderboard: newLeaderboard })
			}
		})

		socket.on('gameFinished', () => {
			set({ displayFinishModal: true, isGameStarted: false })
		})

		socket.on('caretUpdated', (payload: { playerId: string; caret: Caret }) => {
			set(state => ({
				players: state.players.map(p =>
					p.id === payload.playerId
						? {
								...p,
								progress: {
									...p.progress,
									caret: payload.caret,
								},
							}
						: p
				),
			}))
		})

		socket.on('disconnect', () => {
			set({
				connected: false,
				roomId: null,
				players: [],
				config: null,
				error: { type: '', message: '' },
				socket: null,
			})
		})

		socket.on('gameStarted', () => {
			set({ renderStartModal: true, leaderboard: [], players: [] })
		})

		socket.on('gameStopped', () => {
			set({ isGameStarted: false })
		})
	},

	createRoom: (playerName: string) => {
		get().socket?.emit('createRoom', { playerName: playerName })
	},

	setSelectedDuration: (duration: number) => {
		set({ selectedDuration: duration })
	},

	joinRoom: (roomId: string, playerName: string) => {
		get().socket?.emit('joinRoom', { roomId, playerName })
	},

	startGame: (roomId: string | null) => {
		if (!roomId) return
		get().socket?.emit('startGame', { roomId })
	},

	stopGame: (roomId: string | null) => {
		if (!roomId) return
		get().socket?.emit('stopGame', { roomId })
	},

	setIsGameStarted: (isGameStarted: boolean) => {
		set({ isGameStarted: isGameStarted })
	},

	setRenderStartModal: (renderStartModal: boolean) => {
		set({ renderStartModal: renderStartModal })
	},

	updateCaret: (caret: Caret, roomId: string) => {
		const socket = get().socket
		if (!socket) return

		set(state => ({
			players: state.players.map(p =>
				p.id === socket.id ? { ...p, progress: { caret } } : p
			),
		}))

		socket.emit('updateCaret', {
			caretIdx: caret.caretIdx,
			wordIdx: caret.wordIdx,
			roomId,
		})
	},

	handlePlayerFinish: (roomId: string | null, stats: PlayerStats) => {
		const socket = get().socket
		if (!socket || !roomId) return

		socket.emit('playerFinished', {
			roomId,
			stats,
		})
	},

	setDisplayFinishModal: (displayFinishModal: boolean) => {
		set({ displayFinishModal: displayFinishModal })
	},
}))
