import React, { useState, useRef } from "react";
import { useChatStore } from "../store/chatStore";
import { User } from "../types/types";
import { BACKEND_URL } from "../constants";

interface AddUsersToGroupModalProps {
  closeModal: () => void;
  activeChatId: number;
  socket: WebSocket | null;
}

const AddUsersToGroupModal: React.FC<AddUsersToGroupModalProps> = ({
  closeModal,
  activeChatId,
  socket,
}) => {
  const allUsersMapping = useChatStore((state) => state.allUsersMapping);
  const chatIdUserMapping = useChatStore((state) => state.chatIdUserMapping);
  const setChatIdUserMapping = useChatStore.getState().setChatIdUserMapping;
  
  const [checkedUsers, setCheckedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const userRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const usersInCurrentChat = chatIdUserMapping[activeChatId] || [];

  // Filter users: show all except those already in the group
  const availableUsers = allUsersMapping
    ? Object.entries(allUsersMapping).filter(
        ([email, user]) =>
          !usersInCurrentChat.includes(email) &&
          (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  const handleUserCheckboxChange = (user: User, email: string, isChecked: boolean) => {
    if (isChecked) {
      setCheckedUsers([...checkedUsers, user]);
    } else {
      setCheckedUsers(checkedUsers.filter((u) => u.email !== email));
    }
  };

  const handleAddUsersToGroup = async () => {
    if (checkedUsers.length === 0) return;
    
    setIsLoading(true);
    
    try {
      const userEmails = checkedUsers.map(user => user.email);
      
      const response = await fetch(`${BACKEND_URL}/api/dashboard/add-new-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: activeChatId,
          userEmails: userEmails,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add users to group');
      }

      if (socket) {
        for (const email of userEmails) {
          socket.send(
            JSON.stringify({
              type: "asktojoin",
              payload: {
                roomId: activeChatId,
                email: email,
              },
            })
          );
        }
      }

      const updatedMapping = {
        ...chatIdUserMapping,
        [activeChatId]: [...usersInCurrentChat, ...userEmails],
      };
      setChatIdUserMapping(updatedMapping);

      closeModal();
      
      // TODO: You could add a toast notification here
      console.log('Successfully added users to group');
      
    } catch (error) {
      console.error('Error adding users to group:', error);
      // TODO: Show error notification
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={closeModal}
      >
        <div
          className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md sm:w-96 max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">
              Add Users to Group
            </h3>
            <button
              onClick={closeModal}
              className="text-slate-400 hover:text-slate-600 text-xl font-bold w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          <div className="p-4 flex-1 overflow-hidden flex flex-col">
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  🔍
                </div>
              </div>
            </div>

            <div className="flex-1 mb-4 overflow-hidden">
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                Available Users
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableUsers.map(([email, user]) => (
                  <div
                    key={email}
                    className="flex items-center p-2 rounded-lg hover:bg-slate-50"
                  >
                    <input
                      ref={(el) => {
                        userRefs.current[email] = el;
                      }}
                      type="checkbox"
                      className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      onChange={(e) =>
                        handleUserCheckboxChange(user, email, e.target.checked)
                      }
                    />
                    <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center mr-3 text-sm font-semibold text-slate-600">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-sm font-medium text-slate-800 truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {email}
                      </div>
                    </div>
                  </div>
                ))}

                {availableUsers.length === 0 && (
                  <div className="text-center text-slate-500 text-sm py-4">
                    {searchTerm ? "No users found" : "All users are already in this group"}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-600">
                  Selected: {checkedUsers.length} user
                  {checkedUsers.length !== 1 ? "s" : ""}
                </span>
              </div>
              <button
                onClick={handleAddUsersToGroup}
                disabled={checkedUsers.length === 0 || isLoading}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  checkedUsers.length > 0 && !isLoading
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding Users...
                  </div>
                ) : (
                  `Add Users to Group (${checkedUsers.length})`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUsersToGroupModal;