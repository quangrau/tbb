import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CreateRoomPage from './pages/CreateRoomPage'
import JoinRoomPage from './pages/JoinRoomPage'
import WaitingRoomPage from './pages/WaitingRoomPage'
import ChallengePage from './pages/ChallengePage'
import ResultsPage from './pages/ResultsPage'
import { ROUTES } from './utils/constants'

function App() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<HomePage />} />
      <Route path={ROUTES.create} element={<CreateRoomPage />} />
      <Route path={ROUTES.join} element={<JoinRoomPage />} />
      <Route path={ROUTES.waiting} element={<WaitingRoomPage />} />
      <Route path={ROUTES.challenge} element={<ChallengePage />} />
      <Route path={ROUTES.results} element={<ResultsPage />} />
    </Routes>
  )
}

export default App
