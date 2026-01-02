import React from 'react'
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [friendRequests, setFriendRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingRequest, setAcceptingRequest] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [userResponse, requestsResponse] = await Promise.all([
        axiosInstance.get('/auth/me'),
        axiosInstance.get('/users/friend-requests')
      ]);

      setCurrentUser(userResponse.data.user);
      setFriendRequests(requestsResponse.data.incomingRequests);
      setAcceptedRequests(requestsResponse.data.acceptedRequests);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        toast.error('Failed to load notifications');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      setAcceptingRequest(requestId);
      await axiosInstance.put(`/users/friend-requests/${requestId}/accept`);
      toast.success('Friend request accepted!');
      // Refresh data to update the lists
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to accept friend request';
      toast.error(errorMessage);
    } finally {
      setAcceptingRequest(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center bg-gray-950'>
        <div className='text-white text-xl'>Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

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
            <h1 className='text-xl font-bold text-emerald-500'>Convo</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className='flex-1 p-4'>
          <Link 
            to='/' 
            className='flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white mb-2 transition-colors'
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
            className='flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 text-white mb-2 hover:bg-gray-700 transition-colors'
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
                src={currentUser.profilePic} 
                alt={currentUser.fullName}
                className='w-10 h-10 rounded-full'
              />
              <span className='absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-gray-900'></span>
            </div>
            <div className='flex-1'>
              <p className='font-medium text-sm'>{currentUser.fullName}</p>
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
              src={currentUser.profilePic} 
              alt='Profile'
              className='w-7 h-7 rounded-full'
            />
          </button>
          <button 
            onClick={handleLogout}
            className='p-2 hover:bg-gray-800 rounded-lg transition-colors'
            title='Logout'
          >
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z'/>
            </svg>
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className='flex-1 overflow-y-auto p-6'>
          <h1 className='text-3xl font-bold mb-8'>Notifications</h1>

          {/* Friend Requests Section */}
          <div className='mb-8'>
            <div className='flex items-center gap-2 mb-4'>
              <svg className='w-5 h-5 text-emerald-500' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'/>
              </svg>
              <h2 className='text-lg font-semibold'>Friend Requests</h2>
              {friendRequests.length > 0 && (
                <span className='px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full'>
                  {friendRequests.length}
                </span>
              )}
            </div>

            <div className='space-y-3'>
              {friendRequests.length === 0 ? (
                <p className='text-gray-500 text-sm'>No pending friend requests</p>
              ) : (
                friendRequests.map(request => (
                  <div key={request._id} className='flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg p-4'>
                    <div className='flex items-center gap-3'>
                      <img 
                        src={request.sender.profilePic} 
                        alt={request.sender.fullName}
                        className='w-12 h-12 rounded-full'
                      />
                      <div>
                        <h3 className='font-semibold'>{request.sender.fullName}</h3>
                        <div className='flex gap-2 mt-1'>
                          <span className='px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full font-medium'>
                            Native: {request.sender.nativeLanguage}
                          </span>
                          {request.sender.learningLanguages && request.sender.learningLanguages[0] && (
                            <span className='px-2 py-0.5 bg-gray-800 text-white text-xs rounded-full font-medium'>
                              Learning: {request.sender.learningLanguages[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAcceptRequest(request._id)}
                      disabled={acceptingRequest === request._id}
                      className='px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors'
                    >
                      {acceptingRequest === request._id ? 'Accepting...' : 'Accept'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New Connections Section */}
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <svg className='w-5 h-5 text-emerald-500' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z'/>
              </svg>
              <h2 className='text-lg font-semibold'>New Connections</h2>
            </div>

            <div className='space-y-3'>
              {acceptedRequests.length === 0 ? (
                <p className='text-gray-500 text-sm'>No new connections</p>
              ) : (
                acceptedRequests.map(connection => (
                  <div key={connection._id} className='flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg p-4'>
                    <div className='flex items-center gap-3'>
                      <img 
                        src={connection.recipient.profilePic} 
                        alt={connection.recipient.fullName}
                        className='w-12 h-12 rounded-full'
                      />
                      <div>
                        <h3 className='font-medium'>{connection.recipient.fullName} accepted your friend request</h3>
                        <div className='flex items-center gap-1 mt-1'>
                          <svg className='w-3 h-3 text-gray-400' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z'/>
                          </svg>
                          <span className='text-xs text-gray-400'>Recently</span>
                        </div>
                      </div>
                    </div>
                    <Link 
                      to='/'
                      className='px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1'
                    >
                      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                        <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/>
                      </svg>
                      View Friend
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default NotificationsPage
