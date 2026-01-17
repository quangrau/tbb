import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
          The Battle Board
        </h1>
        <p className="text-xl text-white/80">
          Challenge your friends to a math duel!
        </p>
      </div>

      <Card className="w-full max-w-md">
        <div className="space-y-4">
          <Button
            fullWidth
            size="lg"
            onClick={() => navigate('/create')}
          >
            Create Room
          </Button>

          <Button
            fullWidth
            size="lg"
            variant="secondary"
            onClick={() => navigate('/join')}
          >
            Join Room
          </Button>
        </div>
      </Card>

      <p className="mt-8 text-white/60 text-sm">
        A math learning game for Primary 2-4 students
      </p>
    </div>
  )
}
