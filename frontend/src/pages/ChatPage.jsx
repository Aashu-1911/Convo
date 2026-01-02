import React from 'react'
import { useState, useRef, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [streamToken, setStreamToken] = useState(null);

  useEffect(() => {
    fetchStreamToken();
  }, []);

  const fetchStreamToken = async () => {
    try {
      const response = await axiosInstance.get('/chat/token');
      setStreamToken(response.data.token);
      // TODO: Initialize Stream Chat SDK with this token
      console.log('Stream token:', response.data.token);
    } catch (error) {
      console.error('Error fetching stream token:', error);
      toast.error('Failed to initialize chat');
    }
  };

  // Sample chat data
  const chatInfo = {
    name: 'Test Acc',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestAcc',
    members: 2,
    onlineCount: 2
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Test Acc',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestAcc',
      text: 'Doing fine!',
      time: 'Today at 7:33 AM',
      isOwn: false
    },
    {
      id: 2,
      sender: 'Test Acc',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestAcc',
      text: 'wbu? ••',
      time: 'Today at 7:33 AM',
      isOwn: false
    },
    {
      id: 3,
      sender: 'You',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      text: 'sup!',
      time: 'Today at 6:21 AM',
      isOwn: true
    },
    {
      id: 4,
      sender: 'You',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      text: 'Thanks!',
      time: 'Today at 7:35 AM',
      isOwn: true
    },
    {
      id: 5,
      sender: 'Test Acc',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestAcc',
      text: 'Look at this',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
      time: 'Today at 7:36 AM',
      isOwn: false
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'You',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
        text: message,
        time: 'Just now',
        isOwn: true
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  return (
    <div className='flex h-screen bg-gray-950'>
      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col'>
        {/* Top Header */}
        <header className='h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6'>
          {/* Left - Logo */}
          <div className='flex items-center gap-2'>
            <svg className='w-6 h-6 text-emerald-500' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/>
            </svg>
            <h1 className='text-xl font-bold text-emerald-500'>Convo</h1>
          </div>

          {/* Right - Icons */}
          <div className='flex items-center gap-4'>
            <button className='p-2 hover:bg-gray-800 rounded-lg transition-colors'>
              <svg className='w-5 h-5 text-white' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z'/>
              </svg>
            </button>
            <button className='p-2 hover:bg-gray-800 rounded-lg transition-colors'>
              <svg className='w-5 h-5 text-white' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'/>
              </svg>
            </button>
            <button className='p-1 hover:bg-gray-800 rounded-lg transition-colors'>
              <img 
                src='https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser' 
                alt='Profile'
                className='w-7 h-7 rounded-full'
              />
            </button>
            <button className='p-2 hover:bg-gray-800 rounded-lg transition-colors'>
              <svg className='w-5 h-5 text-white' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z'/>
              </svg>
            </button>
          </div>
        </header>

        {/* Chat Header */}
        <div className='bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <img 
              src={chatInfo.avatar} 
              alt={chatInfo.name}
              className='w-12 h-12 rounded-full'
            />
            <div>
              <h2 className='font-semibold text-white text-lg'>{chatInfo.name}</h2>
              <p className='text-sm text-gray-400'>
                {chatInfo.members} members, {chatInfo.onlineCount} online
              </p>
            </div>
          </div>

          {/* Video Call Button */}
          <button className='p-3 bg-emerald-500 hover:bg-emerald-600 rounded-full transition-colors'>
            <svg className='w-5 h-5 text-white' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z'/>
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className='flex-1 overflow-y-auto px-6 py-4 bg-gray-950'>
          {/* Date Divider */}
          <div className='flex items-center justify-center mb-6'>
            <div className='px-4 py-1 bg-gray-800 rounded-full text-xs text-gray-400'>
              Today at 6:21 AM
            </div>
          </div>

          {/* Messages */}
          <div className='space-y-4'>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                {!msg.isOwn && (
                  <img 
                    src={msg.avatar} 
                    alt={msg.sender}
                    className='w-10 h-10 rounded-full flex-shrink-0'
                  />
                )}

                {/* Message Content */}
                <div className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'} max-w-md`}>
                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-4 py-2 ${
                    msg.isOwn 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-800 text-white'
                  }`}>
                    {msg.text && <p className='text-sm'>{msg.text}</p>}
                    {msg.image && (
                      <img 
                        src={msg.image} 
                        alt='Shared image'
                        className='rounded-lg mt-2 max-w-xs'
                      />
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  <span className='text-xs text-gray-500 mt-1 px-1'>
                    {msg.sender} {msg.time}
                  </span>
                </div>

                {/* Avatar for own messages */}
                {msg.isOwn && (
                  <img 
                    src={msg.avatar} 
                    alt={msg.sender}
                    className='w-10 h-10 rounded-full flex-shrink-0'
                  />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className='bg-gray-900 border-t border-gray-800 px-6 py-4'>
          <form onSubmit={handleSendMessage} className='flex items-center gap-3'>
            {/* Emoji Button */}
            <button 
              type='button'
              className='p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0'
            >
              <svg className='w-6 h-6 text-gray-400' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z'/>
              </svg>
            </button>

            {/* Text Input */}
            <input
              type='text'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Type your message'
              className='flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-500'
            />

            {/* Send Button */}
            <button 
              type='submit'
              className='p-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors flex-shrink-0'
            >
              <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z'/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatPage
