import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CreateRoomPage from './pages/CreateRoomPage'
import JoinRoomPage from './pages/JoinRoomPage'
import WaitingRoomPage from './pages/WaitingRoomPage'
import ChallengePage from './pages/ChallengePage'
import ResultsPage from './pages/ResultsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create" element={<CreateRoomPage />} />
      <Route path="/join" element={<JoinRoomPage />} />
      <Route path="/waiting" element={<WaitingRoomPage />} />
      <Route path="/challenge" element={<ChallengePage />} />
      <Route path="/results" element={<ResultsPage />} />
    </Routes>
  )
}

export default App
