import React from 'react'
import { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { StreamChat } from 'stream-chat';
import { 
  Chat, 
  Channel, 
  ChannelHeader, 
  ChannelList, 
  MessageInput, 
  MessageList, 
  Thread, 
  Window 
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import '../styles/chat.css';

const apiKey = import.meta.env.VITE_STREAM_API_KEY || 'your-stream-api-key';

const ChatPage = () => {
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [showFriendsList, setShowFriendsList] = useState(true);

  useEffect(() => {
    const initChat = async () => {
      try {
        console.log('Stream API Key:', apiKey);
        
        // Fetch current user data
        const userResponse = await axiosInstance.get('/auth/me');
        const userData = userResponse.data.user;
        console.log('User data:', userData);
        setCurrentUser(userData);

        // Fetch friends list
        const friendsResponse = await axiosInstance.get('/users/friends');
        setFriends(friendsResponse.data.friends || []);

        // Fetch Stream token
        const tokenResponse = await axiosInstance.get('/chat/token');
        const token = tokenResponse.data.token;
        console.log('Stream token received');

        // Initialize Stream Chat client
        const chatClient = StreamChat.getInstance(apiKey);

        // Disconnect if already connected to a different user
        if (chatClient.userID && chatClient.userID !== String(userData._id)) {
          await chatClient.disconnectUser();
        }

        // Only connect if not already connected
        if (!chatClient.userID) {
          // Connect user with properly formatted data
          await chatClient.connectUser(
            {
              id: String(userData._id),
              name: userData.fullName,
              image: userData.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.fullName}`,
            },
            token
          );
          console.log('Stream chat connected successfully');
        }

        setClient(chatClient);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing chat:', error);
        console.error('Error details:', error.response?.data || error.message);
        toast.error('Failed to initialize chat');
        setIsLoading(false);
      }
    };

    initChat();

    // Cleanup on unmount
    return () => {
      const cleanup = async () => {
        const chatClient = StreamChat.getInstance(apiKey);
        if (chatClient.userID) {
          await chatClient.disconnectUser();
        }
      };
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startChatWithFriend = async (friend) => {
    try {
      if (!client || !currentUser) return;

      const members = [String(currentUser._id), String(friend._id)].sort();
      const channelId = `messaging-${members.join('-')}`;

      const channel = client.channel('messaging', channelId, {
        members: members,
        name: friend.fullName,
        image: friend.profilePic,
      });

      await channel.watch();
      setSelectedChannel(channel);
      setShowFriendsList(false);
      toast.success(`Started chat with ${friend.fullName}`);
    } catch (error) {
      console.error('Error creating channel:', error);
      toast.error('Failed to start chat');
    }
  };

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center bg-gray-950'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-white'>Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className='flex h-screen items-center justify-center bg-gray-950'>
        <div className='text-center text-white'>
          <p>Failed to load chat. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const filters = { type: 'messaging', members: { $in: [client.userID] } };
  const sort = { last_message_at: -1 };

  return (
    <div className='flex h-screen bg-gray-950'>
      <Chat client={client} theme='str-chat__theme-dark'>
        {/* Sidebar - Channel List or Friends */}
        <div className='w-80 bg-gray-900 border-r border-gray-800 flex flex-col'>
          {/* Sidebar Header */}
          <div className='h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4'>
            <h2 className='text-white font-semibold text-lg'>
              {showFriendsList ? 'Friends' : 'Chats'}
            </h2>
            <button
              onClick={() => setShowFriendsList(!showFriendsList)}
              className='p-2 hover:bg-gray-700 rounded-lg transition-colors text-emerald-500'
            >
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                {showFriendsList ? (
                  <path d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z'/>
                ) : (
                  <path d='M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'/>
                )}
              </svg>
            </button>
          </div>

          {/* Content Area */}
          <div className='flex-1 overflow-y-auto'>
            {showFriendsList ? (
              /* Friends List */
              <div className='p-4 space-y-2'>
                {friends.length === 0 ? (
                  <div className='text-center py-8 text-gray-400'>
                    <p>No friends yet</p>
                    <p className='text-sm mt-2'>Add friends to start chatting</p>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div
                      key={friend._id}
                      onClick={() => startChatWithFriend(friend)}
                      className='flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors'
                    >
                      <img
                        src={friend.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.fullName}`}
                        alt={friend.fullName}
                        className='w-12 h-12 rounded-full'
                      />
                      <div className='flex-1'>
                        <h3 className='text-white font-medium'>{friend.fullName}</h3>
                        <p className='text-gray-400 text-sm'>@{friend.username}</p>
                      </div>
                      <svg className='w-5 h-5 text-emerald-500' fill='currentColor' viewBox='0 0 24 24'>
                        <path d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z'/>
                      </svg>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Channel List */
              <ChannelList 
                filters={filters} 
                sort={sort}
                options={{ limit: 10 }}
                onSelect={(channel) => setSelectedChannel(channel)}
              />
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className='flex-1 flex flex-col'>
          {selectedChannel ? (
            <Channel channel={selectedChannel}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          ) : (
            <div className='flex-1 flex items-center justify-center bg-gray-950'>
              <div className='text-center'>
                <svg className='w-24 h-24 text-gray-700 mx-auto mb-4' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z'/>
                </svg>
                <h2 className='text-white text-xl font-semibold mb-2'>Select a conversation</h2>
                <p className='text-gray-400'>Choose a friend to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </Chat>
    </div>
  );
}

export default ChatPage
