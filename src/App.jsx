import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth.jsx'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import ForumPage from './pages/ForumPage.jsx'
import ThreadPage from './pages/ThreadPage.jsx'
import NewThreadPage from './pages/NewThreadPage.jsx'
import DailyWordPage from './pages/DailyWordPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import { RegisterPage, LoginPage } from './pages/AuthPages.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="forum" element={<ForumPage />} />
            <Route path="forum/:category" element={<ForumPage />} />
            <Route path="thread/:id" element={<ThreadPage />} />
            <Route path="new-thread" element={<NewThreadPage />} />
            <Route path="daily-word" element={<DailyWordPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="login" element={<LoginPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
