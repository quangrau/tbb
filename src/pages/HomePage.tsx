import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl md:text-6xl font-bold text-bb-ink">
            The Battle Board
          </h1>
          <p className="mt-3 text-lg md:text-xl font-bold text-bb-muted">
            Challenge your friends to a math duel!
          </p>
        </div>

        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <div className="space-y-4">
              <Button fullWidth size="lg" onClick={() => navigate("/create")}>
                Create Room
              </Button>

              <Button
                fullWidth
                size="lg"
                variant="secondary"
                onClick={() => navigate("/join")}
              >
                Join Room
              </Button>
            </div>
          </Card>
        </div>

        <p className="mt-8 text-center text-bb-muted text-sm font-bold">
          A math learning game for primary school students
        </p>
      </div>
    </div>
  );
}
