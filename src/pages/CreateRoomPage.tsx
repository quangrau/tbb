import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useRoomStore } from '../stores/roomStore'
import { useDeviceId } from '../hooks/useDeviceId'
import { GRADE_OPTIONS, TERM_OPTIONS } from '../utils/constants'
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
  const [term, setTerm] = useState(1)
  const [nickname, setNickname] = useState(() => getLastNickname() || '')
  const [localError, setLocalError] = useState('')

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
      await createRoom(grade, term, deviceId, trimmedNickname)
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
          <div className="grid grid-cols-3 gap-2">
            {GRADE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setGrade(option.value)}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
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
            Term
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TERM_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setTerm(option.value)}
                className={`px-3 py-3 rounded-xl font-medium transition-all ${
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
