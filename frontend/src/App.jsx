import React, { use, useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
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
  const {data, isLoading, error} = useQuery({
    queryKey:["todos"],
    queryFn: async() =>{
      const res = await axios.get('https://jsonplaceholder.typicode.com/todos');
      // const data = await res.json();
      return res.data;
    }

  });

  console.log({data, isLoading, error});

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
