import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Home from "../../features/home/pages/Home";
import MainLayout from "../layouts/MainLayout";
import SignIn from "../../features/auth/pages/SignIn";
import SignUp from "../../features/auth/pages/SignUp";
import VerifyEmail from "../../features/auth/pages/VerifyEmail";
import AccountSuspended from "../../features/auth/pages/AccountSuspended";
import Profile from "../../features/auth/pages/Profile";
import RequireAuth from "../../features/auth/RequireAuth";
import CreateRoom from "../../features/rooms/pages/CreateRoom";
import JoinRoom from "../../features/rooms/pages/JoinRoom";
import WaitingRoom from "../../features/rooms/pages/WaitingRoom";
import GameRoom from "../../features/game/pages/GameRoom";
import Results from "../../features/game/pages/Results";
import SyncAnalysis from "../../features/sync/pages/SyncAnalysis";
import Leaderboard from "../../features/leaderboard/pages/Leaderboard";
import QuizList from "../../features/quizzes/pages/QuizList";
import QuizDetails from "../../features/quizzes/pages/QuizDetails";
import CreateQuiz from "../../features/quizzes/pages/CreateQuiz";
import AIPractice from "../../features/ai/pages/AIPractice";
import PrivacyPolicy from "../../features/legal/pages/PrivacyPolicy";
import TermsAndServices from "../../features/legal/pages/TermsAndServices";
import NotFound from "../pages/NotFound";
import AdminDashboard from "../../features/admin/pages/AdminDashboard";
import AdminUsersPage from "../../features/admin/pages/AdminUsersPage";
import AdminQuizzesPage from "../../features/admin/pages/AdminQuizzesPage";
import AdminSynchronizationPage from "../../features/admin/pages/AdminSynchronizationPage";
import { useAuth } from "../contexts/AuthContext";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function SuspensionRedirect() {
  const { accountSuspension } = useAuth();
  const { pathname } = useLocation();

  if (accountSuspension && pathname !== "/account-suspended") {
    return <Navigate to="/account-suspended" replace />;
  }

  return null;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SuspensionRedirect />
      <MainLayout>
        <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-services" element={<TermsAndServices />} />

        <Route
          path="/create-room"
          element={<CreateRoom />}
        />

        <Route
          path="/join-room"
          element={<JoinRoom />}
        />

        <Route
          path="/waiting-room/:roomCode"
          element={<WaitingRoom />}
        />

        <Route
          path="/game/:roomCode"
          element={<GameRoom />}
        />

        <Route
          path="/results/:roomCode"
          element={<Results />}
        />

        <Route
          path="/sync-analysis"
          element={<RequireAuth allowedRoles={["host", "researcher", "super_admin"]}><SyncAnalysis /></RequireAuth>}
        />
        <Route path="/admin" element={<RequireAuth allowedRoles={["super_admin"]}><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/users" element={<RequireAuth allowedRoles={["super_admin"]}><AdminUsersPage /></RequireAuth>} />
        <Route path="/admin/quizzes" element={<RequireAuth allowedRoles={["super_admin"]}><AdminQuizzesPage /></RequireAuth>} />
        <Route path="/admin/synchronization" element={<RequireAuth allowedRoles={["super_admin"]}><AdminSynchronizationPage /></RequireAuth>} />

        <Route
          path="/leaderboard"
          element={<Leaderboard />}
        />

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/account-suspended" element={<AccountSuspended />} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

        <Route path="/quizzes" element={<RequireAuth><QuizList /></RequireAuth>} />

        <Route path="/quizzes/create" element={<RequireAuth><CreateQuiz /></RequireAuth>} />

        <Route path="/quizzes/:quizId" element={<RequireAuth><QuizDetails /></RequireAuth>} />

        <Route path="/ai-practice" element={<RequireAuth><AIPractice /></RequireAuth>} />

          <Route path="*" element={<NotFound />} />

        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
