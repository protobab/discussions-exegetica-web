import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth.jsx'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import { ForumPage, ThreadPage, NewThreadPage } from './pages/ForumPages.jsx'
import { GroupsPage, GroupDetailPage, GroupJoinPage } from './pages/GroupPages.jsx'
import { RegisterPage, LoginPage, ForgotPasswordPage, ChangePasswordPage } from './pages/AuthPages.jsx'
import DailyWordPage from './pages/DailyWordPage.jsx'
import ArmchairPage from './pages/ArmchairPage.jsx'
import ArmchairSessionPage from './pages/ArmchairSessionPage.jsx'
import ArmchairPostPage from './pages/ArmchairPostPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import BibleStudyPage from './pages/BibleStudyPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import JoinPage from './pages/JoinPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx'
import TermsOfUsePage from './pages/TermsOfUsePage.jsx'
import PrayerOfSalvationPage from './pages/PrayerOfSalvationPage.jsx'

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
            <Route path="groups" element={<GroupsPage />} />
            <Route path="groups/:id" element={<GroupDetailPage />} />
            <Route path="groups/join/:code" element={<GroupJoinPage />} />
            <Route path="daily-word" element={<DailyWordPage />} />
            <Route path="armchair" element={<ArmchairPage />} />
            <Route path="armchair/session/:id" element={<ArmchairSessionPage />} />
            <Route path="armchair/post/:id" element={<ArmchairPostPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="bible" element={<BibleStudyPage />} />
            <Route path="profile/:username" element={<ProfilePage />} />
            <Route path="join/:code" element={<JoinPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="privacy" element={<PrivacyPolicyPage />} />
            <Route path="terms" element={<TermsOfUsePage />} />
            <Route path="salvation" element={<PrayerOfSalvationPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
