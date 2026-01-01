import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CallPage = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const handleEndCall = () => {
    navigate('/chat');
  };

  const participants = [
    {
      id: 1,
      name: 'Beth Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Beth',
      isMuted: false,
      isVideoOn: true
    },
    {
      id: 2,
      name: 'You',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      isMuted: true,
      isVideoOn: true
    }
  ];

  return (
    <div className='h-screen bg-gray-950 flex flex-col items-center justify-center p-6'>
      {/* Video Grid */}
      <div className='flex flex-col gap-4 w-full max-w-2xl mb-8'>
        {participants.map((participant, index) => (
          <div 
            key={participant.id} 
            className='relative bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl overflow-hidden aspect-video flex items-center justify-center'
          >
            {/* Three dots menu */}
            <button className='absolute top-4 left-4 p-2 hover:bg-gray-700/50 rounded-lg transition-colors'>
              <svg className='w-5 h-5 text-white' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'/>
              </svg>
            </button>

            {/* Status icons - top right */}
            <div className='absolute top-4 right-4 flex items-center gap-2'>
              {participant.isMuted && (
                <div className='p-1.5 bg-gray-900/70 rounded-lg'>
                  <svg className='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z'/>
                  </svg>
                </div>
              )}
              {!participant.isVideoOn && (
                <div className='p-1.5 bg-gray-900/70 rounded-lg'>
                  <svg className='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z'/>
                  </svg>
                </div>
              )}
              <div className='p-1.5 bg-gray-900/70 rounded-lg'>
                <svg className='w-4 h-4 text-emerald-500' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/>
                </svg>
              </div>
            </div>

            {/* Avatar/Video */}
            <div className='flex flex-col items-center'>
              <img 
                src={participant.avatar} 
                alt={participant.name}
                className='w-32 h-32 rounded-full mb-4'
              />
            </div>

            {/* Name tag - bottom left */}
            <div className='absolute bottom-4 left-4 px-3 py-1.5 bg-gray-900/70 rounded-lg'>
              <div className='flex items-center gap-2'>
                <span className='text-white text-sm font-medium'>{participant.name}</span>
                {participant.isMuted && (
                  <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z'/>
                  </svg>
                )}
              </div>
            </div>

            {/* Muted message for current user */}
            {participant.id === 2 && participant.isMuted && (
              <div className='absolute bottom-16 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-gray-900/80 rounded-lg'>
                <svg className='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/>
                </svg>
                <span className='text-white text-sm'>You are muted. Unmute to speak.</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Control Buttons */}
      <div className='flex items-center gap-4'>
        {/* Microphone */}
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`relative p-4 rounded-full transition-all ${
            isMuted 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 24 24'>
            {isMuted ? (
              <path d='M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z'/>
            ) : (
              <path d='M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z'/>
            )}
          </svg>
          {isMuted && (
            <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-950'></span>
          )}
        </button>

        {/* Video */}
        <button 
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`relative p-4 rounded-full transition-all ${
            isVideoOff 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 24 24'>
            {isVideoOff ? (
              <path d='M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z'/>
            ) : (
              <path d='M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z'/>
            )}
          </svg>
          {isVideoOff && (
            <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-950'></span>
          )}
        </button>

        {/* Screen Share */}
        <button className='p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-all'>
          <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zm-7-3.53v-2.19c-2.78 0-4.61.85-6 2.72.56-2.67 2.11-5.33 6-5.87V7l4 3.73-4 3.74z'/>
          </svg>
        </button>

        {/* Chat */}
        <button className='p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-all'>
          <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z'/>
          </svg>
        </button>

        {/* Settings */}
        <button className='p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-all'>
          <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'/>
          </svg>
        </button>

        {/* End Call */}
        <button 
          onClick={handleEndCall}
          className='p-4 bg-red-500 hover:bg-red-600 rounded-full transition-all'
        >
          <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z'/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default CallPage
