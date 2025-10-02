import React, { useState, useRef, useEffect } from 'react';
import { BACKEND_URL } from '../constants';
import { useChatStore } from '../store/chatStore';
import ProfileModal from './ProfileModal';

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);

const Sidebar: React.FC = () => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false); 
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const setCurrentUser = useChatStore.getState().setCurrentUser;
  const settingsRef = useRef<HTMLDivElement>(null);

  const sidebarItems = [
    { icon: <MenuIcon />, name: 'menu', label: 'Menu' },
    { icon: <ProfileIcon />, name: 'profile', label: 'Profile' },
    { icon: <SettingsIcon />, name: 'settings', label: 'Settings' }
  ];

  const handleItemClick = (itemName: string) => {
    if (itemName === 'settings') {
      setShowSettingsModal(prevState => !prevState);
    }
    if (itemName === 'profile') { 
      setShowProfileModal(prevState => !prevState);
    }
  };

  const handleLogout = async () => {
    try {
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
      console.error('Logout error:', error);
      // Even if backend logout fails, clear frontend state
      setCurrentUser(null);
      window.location.href = '/login';
    }
  };

  const closeModal = () => {
    setShowSettingsModal(false);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
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
    <div className="hidden sm:flex flex-col w-[60px] bg-slate-500 p-2 text-slate-400">
      <div className="flex-grow"></div>

      <div className="flex flex-col items-center">
        {sidebarItems.map((item) => {
          if (item.name === 'settings') {
            return (
              <div key={item.name} ref={settingsRef} className="relative group">
                <div
                  onClick={() => handleItemClick(item.name)}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="w-11 h-11 mb-2 rounded-lg border-2 border-slate-500 flex items-center justify-center cursor-pointer transition-all hover:bg-black hover:border-white hover:text-white"
                >
                  {item.icon}
                </div>

                {hoveredItem === item.name && !showSettingsModal && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black text-white px-2 py-1 rounded text-sm whitespace-nowrap z-50">
                    {item.label}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-black"></div>
                  </div>
                )}
                
                {showSettingsModal && (
                  <>
                    <div
                      onClick={closeModal}
                      className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
                    />
                    <div
                      className="
                        bg-white rounded-lg shadow-xl text-slate-800 w-48 h-72 z-50
                        fixed md:absolute 
                        top-1/2 md:top-auto
                        left-1/2 md:left-full
                        -translate-x-1/2 md:translate-x-0
                        -translate-y-1/2 md:translate-y-0
                        md:bottom-0 md:ml-2
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
                          className="w-full mt-44 text-left px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          }
          return (
            <div
              key={item.name}
              className="relative group"
              onClick={() => handleItemClick(item.name)}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="w-11 h-11 mb-2 rounded-lg border-2 border-slate-500 flex items-center justify-center cursor-pointer transition-all hover:bg-black hover:border-white hover:text-white">
                {item.icon}
              </div>
              
              {hoveredItem === item.name && (
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black text-white px-2 py-1 rounded text-sm whitespace-nowrap z-50">
                  {item.label}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-black"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ProfileModal 
        isOpen={showProfileModal}
        onClose={closeProfileModal}
      />
    </div>
  );
};

export default Sidebar;