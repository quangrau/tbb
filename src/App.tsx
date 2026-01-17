import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ROUTES } from "./utils/constants";

const HomePage = lazy(() => import("./pages/HomePage"));
const CreateRoomPage = lazy(() => import("./pages/CreateRoomPage"));
const JoinRoomPage = lazy(() => import("./pages/JoinRoomPage"));
const WaitingRoomPage = lazy(() => import("./pages/WaitingRoomPage"));
const ChallengePage = lazy(() => import("./pages/ChallengePage"));
const ResultsPage = lazy(() => import("./pages/ResultsPage"));
const ReviewPage = lazy(() => import("./pages/ReviewPage"));

function App() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <Routes>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.create} element={<CreateRoomPage />} />
        <Route path={ROUTES.join} element={<JoinRoomPage />} />
        <Route path={ROUTES.waiting} element={<WaitingRoomPage />} />
        <Route path={ROUTES.challenge} element={<ChallengePage />} />
        <Route path={ROUTES.results} element={<ResultsPage />} />
        <Route path={ROUTES.review} element={<ReviewPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
