import React, { useState, useRef, useEffect } from 'react';
import { BACKEND_URL } from '../constants';
import { useChatStore } from '../store/chatStore';

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);


const Header: React.FC = () => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { setCurrentUser } = useChatStore.getState();
  const settingsRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { icon: <MenuIcon />, name: 'menu' },
    { icon: <ProfileIcon />, name: 'profile' },
    { icon: <SettingsIcon />, name: 'settings' }
  ];

  const handleItemClick = (itemName: string) => {
    if (itemName === 'settings') {
      setShowSettingsModal(prevState => !prevState);
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to clear session/cookies
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setCurrentUser(null);
      
      window.location.href = '/login';
      
    } catch (error) {
      // Even if backend logout fails, clear frontend state
      console.error('Logout error:', error);
      setCurrentUser(null);
      window.location.href = '/login';
    }
  };
  
  const closeModal = () => {
    setShowSettingsModal(false);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSettingsModal && settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsModal]);

  return (
    <>
      <div className="hidden sm:flex bg-slate-800 text-white p-3 px-5 items-center text-lg font-semibold">
        <div className="w-6 h-6 bg-white rounded-md mr-2.5 flex items-center justify-center text-slate-800 font-bold text-xs">⚡</div>
        Ripple
      </div>

      <div className="sm:hidden">
        <div className="bg-slate-800 text-white p-3 px-5">
          <div className="flex items-center text-lg font-semibold">
            <div className="w-6 h-6 bg-white rounded-md mr-2.5 flex items-center justify-center text-slate-800 font-bold text-xs">⚡</div>
            Ripple
          </div>
        </div>
        <div className="flex bg-slate-800 p-2.5 px-5 justify-around border-b border-slate-600 text-slate-400">
          {navItems.map((item) => {
            if (item.name === 'settings') {
              return (
                <div key={item.name} ref={settingsRef} className="relative">
                  <div
                    onClick={() => handleItemClick(item.name)}
                    className="w-10 h-10 rounded-lg border-2 border-slate-500 flex items-center justify-center cursor-pointer transition-all hover:bg-black hover:border-white hover:text-white"
                  >
                    {item.icon}
                  </div>
                </div>
              );
            }
            return (
              <div
                key={item.name}
                onClick={() => handleItemClick(item.name)}
                className="w-10 h-10 rounded-lg border-2 border-slate-500 flex items-center justify-center cursor-pointer transition-all hover:bg-black hover:border-white hover:text-white"
              >
                {item.icon}
              </div>
            );
          })}
        </div>
      </div>

      {showSettingsModal && (
        <div ref={settingsRef}>
          <div
            onClick={closeModal}
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
          />
          <div
            className="
              fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              bg-white rounded-lg shadow-xl text-slate-800 w-64 z-50
            "
          >
            <div className="flex justify-between items-center p-3 border-b border-slate-200">
              <h3 className="font-semibold">Settings</h3>
              <button onClick={closeModal} className="text-xl leading-none hover:text-red-500">
                &times;
              </button>
            </div>

            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full mt-8 text-left px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
