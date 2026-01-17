import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useRoomStore } from '../stores/roomStore'
import { useDeviceId } from '../hooks/useDeviceId'
import {
  GRADE_OPTIONS,
  TERM_OPTIONS,
  QUESTIONS_COUNT_OPTIONS,
  TIME_PER_QUESTION_OPTIONS,
  MAX_PLAYERS_OPTIONS,
  DEFAULT_QUESTIONS_COUNT,
  DEFAULT_TIME_PER_QUESTION_SEC,
  DEFAULT_MAX_PLAYERS,
} from '../utils/constants'
import { getLastNickname, setLastNickname } from '../utils/joinFormPrefs'

export default function CreateRoomPage() {
  const navigate = useNavigate()
  const deviceId = useDeviceId()
  const { createRoom, isLoading, error } = useRoomStore(
    useShallow((state) => ({
      createRoom: state.createRoom,
      isLoading: state.isLoading,
      error: state.error,
    }))
  )

  const [grade, setGrade] = useState(3)
  const [term, setTerm] = useState(0) // Default to "All"
  const [nickname, setNickname] = useState(() => getLastNickname() || '')
  const [localError, setLocalError] = useState('')

  // Challenge settings (collapsed by default)
  const [showSettings, setShowSettings] = useState(false)
  const [questionsCount, setQuestionsCount] = useState(DEFAULT_QUESTIONS_COUNT)
  const [timePerQuestion, setTimePerQuestion] = useState(DEFAULT_TIME_PER_QUESTION_SEC)
  const [maxPlayers, setMaxPlayers] = useState(DEFAULT_MAX_PLAYERS)

  const handleCreate = async () => {
    const trimmedNickname = nickname.trim()
    if (!trimmedNickname) {
      setLocalError('Please enter a nickname')
      return
    }
    if (trimmedNickname.length > 20) {
      setLocalError('Nickname must be 20 characters or less')
      return
    }

    setLocalError('')
    try {
      setLastNickname(trimmedNickname)
      await createRoom(grade, term, deviceId, trimmedNickname, {
        questionsCount,
        timePerQuestionSec: timePerQuestion,
        maxPlayers,
      })
      navigate('/waiting')
    } catch {
      // Error is handled by store
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Create Room
        </h1>
        <p className="text-white/70">
          Set up a challenge for your friend
        </p>
      </div>

      <Card className="w-full max-w-md space-y-6">
        <Input
          label="Your Nickname"
          placeholder="Enter your name"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value)
            setLastNickname(e.target.value)
          }}
          maxLength={20}
          autoFocus
        />

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Grade Level
          </label>
          <div className="grid grid-cols-6 gap-2">
            {GRADE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setGrade(option.value)}
                className={`px-2 py-3 rounded-xl font-medium transition-all ${
                  grade === option.value
                    ? 'bg-yellow-400 text-purple-900'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Knowledge Range
          </label>
          <div className="grid grid-cols-5 gap-2">
            {TERM_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setTerm(option.value)}
                className={`px-2 py-3 rounded-xl font-medium transition-all ${
                  term === option.value
                    ? 'bg-yellow-400 text-purple-900'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Collapsible Challenge Settings */}
        <div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-white/80 text-sm font-medium hover:text-white transition-colors"
          >
            <span className="text-lg">{showSettings ? '▼' : '▶'}</span>
            Challenge Settings
          </button>

          {showSettings && (
            <div className="mt-3 p-4 bg-white/10 rounded-xl space-y-4">
              {/* Questions count */}
              <div>
                <label className="block text-white/70 text-xs font-medium mb-2">
                  Questions
                </label>
                <div className="flex gap-2">
                  {QUESTIONS_COUNT_OPTIONS.map((count) => (
                    <button
                      key={count}
                      onClick={() => setQuestionsCount(count)}
                      className={`flex-1 px-2 py-2 rounded-lg font-medium text-sm transition-all ${
                        questionsCount === count
                          ? 'bg-yellow-400 text-purple-900'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time per question */}
              <div>
                <label className="block text-white/70 text-xs font-medium mb-2">
                  Time per Question (seconds)
                </label>
                <div className="flex gap-2">
                  {TIME_PER_QUESTION_OPTIONS.map((time) => (
                    <button
                      key={time}
                      onClick={() => setTimePerQuestion(time)}
                      className={`flex-1 px-2 py-2 rounded-lg font-medium text-sm transition-all ${
                        timePerQuestion === time
                          ? 'bg-yellow-400 text-purple-900'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max players */}
              <div>
                <label className="block text-white/70 text-xs font-medium mb-2">
                  Max Players
                </label>
                <div className="flex gap-2">
                  {MAX_PLAYERS_OPTIONS.map((count) => (
                    <button
                      key={count}
                      onClick={() => setMaxPlayers(count)}
                      className={`flex-1 px-2 py-2 rounded-lg font-medium text-sm transition-all ${
                        maxPlayers === count
                          ? 'bg-yellow-400 text-purple-900'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {(localError || error) && (
          <p className="text-red-300 text-sm text-center">
            {localError || error}
          </p>
        )}

        <div className="space-y-3 pt-2">
          <Button
            fullWidth
            size="lg"
            onClick={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Room'}
          </Button>

          <Button
            fullWidth
            variant="outline"
            onClick={() => navigate('/')}
          >
            Back
          </Button>
        </div>
      </Card>
    </div>
  )
}
