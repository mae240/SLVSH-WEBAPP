import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/components/AuthProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { TournamentPage } from '@/pages/TournamentPage'
import { RoundPage } from '@/pages/RoundPage'
import { LeaderboardPage } from '@/pages/LeaderboardPage'
import { AdminPage } from '@/pages/AdminPage'
import { AdminTournamentPage } from '@/pages/AdminTournamentPage'
import { AdminPredictionsPage } from '@/pages/AdminPredictionsPage'
import { AdminRoute } from '@/components/AdminRoute'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<DashboardPage />} />
                <Route path="tournament/:slug" element={<TournamentPage />} />
                <Route path="tournament/:slug/round/:roundId" element={<RoundPage />} />
                <Route path="tournament/:slug/leaderboard" element={<LeaderboardPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route element={<AdminRoute />}>
                  <Route path="admin" element={<AdminPage />} />
                  <Route path="admin/tournament/:tournamentId" element={<AdminTournamentPage />} />
                  <Route path="admin/tournament/:tournamentId/predictions" element={<AdminPredictionsPage />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  )
}
