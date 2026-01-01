import React from 'react'
import { useState } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  // Sample data - replace with actual data from API
  const friends = [
    {
      id: 1,
      name: "Burak Örkmez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Burak",
      nativeLanguage: "Turkish",
      learningLanguage: "English"
    },
    {
      id: 2,
      name: "Beth Doe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Beth",
      nativeLanguage: "Portuguese",
      learningLanguage: "Spanish"
    }
  ];

  const newLearners = [
    {
      id: 1,
      name: "John Doe",
      location: "Istanbul, Turkey",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      nativeLanguage: "Mandarin",
      learningLanguage: "Spanish",
      bio: "dasdasdasa"
    },
    {
      id: 2,
      name: "Test Acc",
      location: "Istanbul, Turkey",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Test",
      nativeLanguage: "Spanish",
      learningLanguage: "Japanese",
      bio: "sdsdsdsad"
    },
    {
      id: 3,
      name: "Sofia Garcia",
      location: "Madrid",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",
      nativeLanguage: "Spanish",
      learningLanguage: "German",
      bio: "Language teacher looking to improve my German skills."
    },
    {
      id: 4,
      name: "Kenji Tanaka",
      location: "Tokyo",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji",
      nativeLanguage: "Japanese",
      learningLanguage: "English",
      bio: "Tech professional looking for language exchange partners."
    },
    {
      id: 5,
      name: "Elena Petrov",
      location: "Moscow",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
      nativeLanguage: "Russian",
      learningLanguage: "French",
      bio: "University student studying languages and international relations."
    },
    {
      id: 6,
      name: "Marco Rossi",
      location: "Rome",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marco",
      nativeLanguage: "Italian",
      learningLanguage: "Mandarin",
      bio: "Food blogger interested in cultural exchange through cuisine."
    }
  ];

  const currentUser = {
    name: "Kyle Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kyle",
    online: true
  };

  return (
    <div className='flex h-screen bg-gray-950 text-white'>
      {/* Sidebar */}
      <aside className='w-64 bg-gray-900 flex flex-col border-r border-gray-800'>
        {/* Logo */}
        <div className='p-6 border-b border-gray-800'>
          <div className='flex items-center gap-2'>
            <svg className='w-6 h-6 text-emerald-500' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/>
            </svg>
            <h1 className='text-xl font-bold text-emerald-500'>Streamify</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className='flex-1 p-4'>
          <Link 
            to='/' 
            className='flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 text-white mb-2 hover:bg-gray-700 transition-colors'
          >
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'/>
            </svg>
            <span className='font-medium'>Home</span>
          </Link>
          
          <Link 
            to='/friends' 
            className='flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white mb-2 transition-colors'
          >
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'/>
            </svg>
            <span className='font-medium'>Friends</span>
          </Link>
          
          <Link 
            to='/notifications' 
            className='flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors'
          >
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z'/>
            </svg>
            <span className='font-medium'>Notifications</span>
          </Link>
        </nav>

        {/* User Profile at Bottom */}
        <div className='p-4 border-t border-gray-800'>
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className='w-10 h-10 rounded-full'
              />
              <span className='absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-gray-900'></span>
            </div>
            <div className='flex-1'>
              <p className='font-medium text-sm'>{currentUser.name}</p>
              <p className='text-xs text-emerald-500'>Online</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className='flex-1 flex flex-col overflow-hidden'>
        {/* Top Header */}
        <header className='h-16 border-b border-gray-800 flex items-center justify-end px-6 gap-4'>
          <button className='p-2 hover:bg-gray-800 rounded-lg transition-colors'>
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z'/>
            </svg>
          </button>
          <button className='p-2 hover:bg-gray-800 rounded-lg transition-colors'>
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'/>
            </svg>
          </button>
          <button className='p-1 hover:bg-gray-800 rounded-lg transition-colors'>
            <img 
              src={currentUser.avatar} 
              alt='Profile'
              className='w-7 h-7 rounded-full'
            />
          </button>
          <button className='p-2 hover:bg-gray-800 rounded-lg transition-colors'>
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z'/>
            </svg>
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className='flex-1 overflow-y-auto p-6'>
          {/* Your Friends Section */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-2xl font-bold'>Your Friends</h2>
              <button className='px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2'>
                <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'/>
                </svg>
                Friend Requests
              </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {friends.map(friend => (
                <div key={friend.id} className='bg-gray-900 border border-gray-800 rounded-lg p-4'>
                  <div className='flex items-center gap-3 mb-3'>
                    <img 
                      src={friend.avatar} 
                      alt={friend.name}
                      className='w-12 h-12 rounded-full'
                    />
                    <h3 className='font-semibold'>{friend.name}</h3>
                  </div>
                  
                  <div className='flex gap-2 mb-3'>
                    <span className='px-3 py-1 bg-emerald-500 text-white text-xs rounded-full font-medium'>
                      🌍 Native: {friend.nativeLanguage}
                    </span>
                    <span className='px-3 py-1 bg-gray-800 text-white text-xs rounded-full font-medium'>
                      🎯 Learning: {friend.learningLanguage}
                    </span>
                  </div>
                  
                  <button className='w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors'>
                    Message
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Meet New Learners Section */}
          <div>
            <div className='mb-4'>
              <h2 className='text-2xl font-bold mb-1'>Meet New Learners</h2>
              <p className='text-gray-400 text-sm'>Discover perfect language exchange partners based on your profile</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {newLearners.map(learner => (
                <div key={learner.id} className='bg-gray-900 border border-gray-800 rounded-lg p-5'>
                  <div className='flex items-start gap-3 mb-3'>
                    <img 
                      src={learner.avatar} 
                      alt={learner.name}
                      className='w-12 h-12 rounded-full'
                    />
                    <div className='flex-1'>
                      <h3 className='font-semibold text-white'>{learner.name}</h3>
                      <p className='text-xs text-gray-400 flex items-center gap-1'>
                        <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 24 24'>
                          <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/>
                        </svg>
                        {learner.location}
                      </p>
                    </div>
                  </div>
                  
                  <div className='flex gap-2 mb-3'>
                    <span className='px-2 py-1 bg-emerald-500 text-white text-xs rounded-full font-medium'>
                      🌍 Native: {learner.nativeLanguage}
                    </span>
                    <span className='px-2 py-1 bg-gray-800 text-white text-xs rounded-full font-medium'>
                      🎯 Learning: {learner.learningLanguage}
                    </span>
                  </div>
                  
                  <p className='text-sm text-gray-400 mb-4 line-clamp-2'>{learner.bio}</p>
                  
                  <button className='w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2'>
                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/>
                    </svg>
                    Send Friend Request
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage
