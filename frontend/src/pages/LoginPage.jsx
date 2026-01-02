import React from 'react'
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', loginData);
      
      if (response.data.success) {
        toast.success('Login successful!');
        
        // Check if user needs to complete onboarding
        if (!response.data.user.isOnboarded) {
          navigate('/onboarding');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-gray-900'>
      <div className='flex flex-col lg:flex-row w-full max-w-6xl mx-auto bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-emerald-500/20'>
        
        {/* Left Side - Login Form */}
        <div className='w-full lg:w-1/2 p-8 sm:p-12 flex flex-col bg-gray-900 text-white'>
          {/* Logo and Header */}
          <div className='mb-8'>
            <div className='flex items-center gap-2 mb-6'>
              <svg className='w-8 h-8 text-emerald-500' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/>
              </svg>
              <h1 className='text-2xl font-bold text-emerald-500'>Convo</h1>
            </div>
            
            <h2 className='text-3xl font-bold mb-2'>Welcome Back</h2>
            <p className='text-gray-400 text-sm'>Sign in to your account to continue your language journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className='flex-1 flex flex-col'>
            {/* Email Input */}
            <div className='mb-4'>
              <label className='block text-sm font-medium mb-2'>Email</label>
              <input
                type='email'
                name='email'
                value={loginData.email}
                onChange={handleInputChange}
                placeholder='hello@example.com'
                className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-500'
                required
              />
            </div>

            {/* Password Input */}
            <div className='mb-6'>
              <label className='block text-sm font-medium mb-2'>Password</label>
              <input
                type='password'
                name='password'
                value={loginData.password}
                onChange={handleInputChange}
                placeholder='••••••••'
                className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-500'
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading}
              className='w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 mb-4'
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Create Account Link */}
            <p className='text-center text-sm text-gray-400'>
              Don't have an account?{' '}
              <Link to='/signup' className='text-emerald-500 hover:underline font-medium'>
                Create one
              </Link>
            </p>
          </form>
        </div>

        {/* Right Side - Illustration and Info */}
        <div className='w-full lg:w-1/2 p-8 sm:p-12 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-800 to-emerald-950 text-white'>
          {/* Illustration */}
          <div className='mb-8 relative'>
            <img 
              src='/Video-call.png' 
              alt='Video call illustration' 
              className='w-full max-w-md h-auto object-contain'
            />
          </div>

          {/* Text Content */}
          <div className='text-center max-w-md'>
            <h3 className='text-2xl font-bold mb-3'>Connect with language partners worldwide</h3>
            <p className='text-emerald-200 text-sm'>
              Practice conversations, make friends, and improve your language skills together
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage
