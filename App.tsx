
import React, { useState, useEffect } from 'react';
import { Profile, Chat } from './types.ts';
import { supabaseService, supabase } from './services/supabaseService.ts';
import ChatList from './components/ChatList.tsx';
import Conversation from './components/Conversation.tsx';
import Auth from './components/Auth.tsx';
import { Icons } from './constants.tsx';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAppData = async () => {
    try {
      const user = await supabaseService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        const userChats = await supabaseService.getChats(user.id);
        setChats(userChats);
        if (userChats.length > 0) setActiveChat(userChats[0]);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("App initialization error", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check initial session
    loadAppData();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        loadAppData();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setChats([]);
        setActiveChat(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f0f2f5]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium animate-pulse">Initializing GeminiChat...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={loadAppData} />;
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#dadbd3]">
      <div className="w-full md:w-[35%] lg:w-[30%] xl:w-[25%] flex flex-col bg-white border-r border-gray-300 h-full">
        <header className="bg-[#f0f2f5] p-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src={currentUser.avatar_url} className="w-10 h-10 rounded-full border border-gray-200 object-cover" alt="Me" />
            <span className="font-semibold text-gray-700 hidden sm:inline">{currentUser.display_name}</span>
          </div>
          <div className="flex gap-1 text-gray-500">
             <button onClick={handleLogout} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-red-500" title="Logout">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             </button>
             <button className="p-2 hover:bg-gray-200 rounded-full transition-colors" title="New Chat">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
             </button>
          </div>
        </header>
        
        <div className="p-2 bg-white sticky top-0 z-10">
          <div className="bg-[#f0f2f5] flex items-center px-3 py-1.5 rounded-lg border border-transparent focus-within:border-[#00a884] transition-all shadow-sm">
            <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search or start new chat" 
              className="bg-transparent border-none focus:outline-none text-sm w-full text-gray-700"
            />
          </div>
        </div>

        <ChatList 
          chats={chats} 
          activeChatId={activeChat?.id} 
          onSelectChat={setActiveChat} 
          currentUser={currentUser} 
        />
      </div>

      <div className="hidden md:flex flex-1 flex-col bg-[#efeae2] relative h-full">
        {activeChat ? (
          <Conversation chat={activeChat} currentUser={currentUser} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-64 h-64 opacity-10 mb-8">
                <svg className="w-full h-full text-gray-800" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98 1 4.29L1.05 23l6.91-1.95c1.28.6 2.7.95 4.04.95 5.52 0 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            <h1 className="text-3xl font-light text-gray-700 mb-4">WhatsApp Web</h1>
            <p className="text-gray-500 max-w-md leading-relaxed">
              Send and receive messages without keeping your phone online. 
              <br/>Use GeminiChat on up to 4 linked devices simultaneously.
            </p>
            <div className="absolute bottom-10 text-[11px] text-gray-400 flex items-center uppercase tracking-widest">
              <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
              End-to-end encrypted
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
