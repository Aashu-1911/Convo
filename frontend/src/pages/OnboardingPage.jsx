import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    bio: '',
    nativeLanguage: '',
    learningLanguage: '',
    location: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Beth'
  });

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Russian', 'Japanese', 'Korean', 'Mandarin', 'Arabic', 'Hindi',
    'Turkish', 'Dutch', 'Swedish', 'Polish', 'Greek', 'Hebrew'
  ];

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerateAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setProfileData({
      ...profileData,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      // Map frontend data to backend expected format
      const onboardingData = {
        fullName: profileData.fullName,
        bio: profileData.bio,
        nativeLanguage: profileData.nativeLanguage,
        learningLanguages: [profileData.learningLanguage], // Backend expects array
        location: profileData.location,
        profilePic: profileData.avatar
      };

      const response = await axiosInstance.post('/auth/onboarding', onboardingData);
      
      if (response.data.success) {
        toast.success('Profile completed successfully!');
        navigate('/');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to complete onboarding. Please try again.';
      toast.error(errorMessage);
      
      // Show specific missing fields if provided
      if (error.response?.data?.missingFields) {
        console.error('Missing fields:', error.response.data.missingFields);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-gray-950'>
      <div className='w-full max-w-lg bg-gray-900 rounded-xl p-8 border border-gray-800'>
        {/* Title */}
        <h1 className='text-2xl font-bold text-white text-center mb-8'>Complete Your Profile</h1>

        <form onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <div className='flex flex-col items-center mb-6'>
            <div className='w-32 h-32 rounded-full overflow-hidden bg-gray-800 mb-4'>
              <img 
                src={profileData.avatar} 
                alt='Avatar'
                className='w-full h-full object-cover'
              />
            </div>
            <button
              type='button'
              onClick={handleGenerateAvatar}
              className='px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-medium rounded-lg transition-colors flex items-center gap-2'
            >
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z'/>
              </svg>
              Generate Random Avatar
            </button>
          </div>

          {/* Full Name */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-white mb-2'>Full Name</label>
            <input
              type='text'
              name='fullName'
              value={profileData.fullName}
              onChange={handleInputChange}
              placeholder='Beth Doe'
              className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-500'
              required
            />
          </div>

          {/* Bio */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-white mb-2'>Bio</label>
            <textarea
              name='bio'
              value={profileData.bio}
              onChange={handleInputChange}
              placeholder='Tell others about yourself and your language learning goals'
              rows='4'
              className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-500 resize-none'
            ></textarea>
          </div>

          {/* Language Selection Row */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            {/* Native Language */}
            <div>
              <label className='block text-sm font-medium text-white mb-2'>Native Language</label>
              <select
                name='nativeLanguage'
                value={profileData.nativeLanguage}
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white appearance-none cursor-pointer'
                required
              >
                <option value='' className='text-gray-500'>Select your native language</option>
                {languages.map(lang => (
                  <option key={lang} value={lang} className='text-white'>{lang}</option>
                ))}
              </select>
            </div>

            {/* Learning Language */}
            <div>
              <label className='block text-sm font-medium text-white mb-2'>Learning Language</label>
              <select
                name='learningLanguage'
                value={profileData.learningLanguage}
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white appearance-none cursor-pointer'
                required
              >
                <option value='' className='text-gray-500'>Select language you're learning</option>
                {languages.map(lang => (
                  <option key={lang} value={lang} className='text-white'>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-white mb-2'>Location</label>
            <div className='relative'>
              <div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500'>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/>
                </svg>
              </div>
              <input
                type='text'
                name='location'
                value={profileData.location}
                onChange={handleInputChange}
                placeholder='City, Country'
                className='w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-500'
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={isLoading}
            className='w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2'
          >
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/>
            </svg>
            {isLoading ? 'Completing...' : 'Complete Onboarding'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingPage
