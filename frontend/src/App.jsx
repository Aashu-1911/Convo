import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx' 
import SignupPage from './pages/SignupPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotificationsPage from './pages/NotificationsPage.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import CallPage from './pages/CallPage.jsx'
import toast, { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <div className=' h-screen' data-theme="forest">
      <button onClick={() => toast.success('This is a toast!')}>Create a toast</button>
      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path="signup" element={<SignupPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="call" element={<CallPage />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App
