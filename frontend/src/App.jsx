// import React, { use, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx' 
import SignupPage from './pages/SignupPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotificationsPage from './pages/NotificationsPage.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import CallPage from './pages/CallPage.jsx'
import toast, { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { axiosInstance } from './lib/axios.js'

const App = () => {
  // const [data, setData] = React.useState(null);
  // const [isLoading, setIsLoading] = React.useState(true);
  // const [error, setError] = React.useState(null);

  // useEffect(() => {
  //   const getData = async () => {
  //     try {
  //       const data = await fetch('https://jsonplaceholder.typicode.com/todos');
  //       const json = await data.json();
  //       setData(json);
  //     } catch (error) {
  //       setError(error);
  //     } finally{
  //       setIsLoading(false);
  //     }
  //   };
  //   getData();
  // }, []);

  //Tanstack Query
  const {data:authData, isLoading, error} = useQuery({
    queryKey:["authUser"],
    queryFn: async() =>{
      const res = await axiosInstance.get('https://localhost:5001/api/auth/me');
      // const data = await res.json();
      return res.data;
    },
    retry: false,
  });

  const authUser = authData?.user;

  return (
    <div className=' h-screen' data-theme="forest">
      <button onClick={() => toast.success('This is a toast!')}>Create a toast</button>
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to ="/login"/>}/>
        <Route path="signup" element={!authUser ? <SignupPage /> : <Navigate to ="/"/>} />
        <Route path="login" element={!authUser ? <LoginPage /> : <Navigate to ="/"/>} />
        <Route path="notifications" element={authUser ? <NotificationsPage /> : <Navigate to ="/login"/>} />
        <Route path="onboarding" element={authUser ? <OnboardingPage /> : <Navigate to ="/login"/>} />
        <Route path="chat" element={authUser ? <ChatPage /> : <Navigate to ="/login"/>} />
        <Route path="call" element={authUser ? <CallPage /> : <Navigate to ="/login"/>} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App
