import React, { useState, useRef } from "react";
import { useChatStore } from "../store/chatStore";
import { NewChatProps, User } from "../types/types";

const NewChatModal: React.FC<NewChatProps> = ({ closeModal, top, left }) => {
  const allUsersMapping = useChatStore((state) => state.allUsersMapping);
  const [checkedUsers, setCheckedUsers] = useState<User[]>([]);
  const setCreateNewChat = useChatStore.getState().setCreateNewChat;
  const setActiveChatId = useChatStore.getState().setActiveChatId;
  const setSelectedUsers = useChatStore.getState().setSelectedUsers;
  const chatIdUserMapping = useChatStore((state) => state.chatIdUserMapping);
  const currentUser = useChatStore((state) => state.currentUser);

  const [isGroupChatActive, setIsGroupChatActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); //TODO => This should be Debounced and optimized
  const userRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleCreateNewChat = () => {
    setCreateNewChat(true);
    //TODO => Check if the below line state updates are Slow and cause any issues
    setSelectedUsers(checkedUsers);
    setActiveChatId(null);
    closeModal();
  };

  function handleTwoUserChat(user: User) {
    for (const [chatId, userEmails] of Object.entries(chatIdUserMapping)) {
      if (
        ((user.email === userEmails[0] &&
          currentUser?.email === userEmails[1]) ||
          (user.email === userEmails[1] &&
            currentUser?.email === userEmails[0])) &&
        userEmails.length === 2
      ) {
        setSelectedUsers([]);
        setActiveChatId(parseInt(chatId));
        closeModal();
        return;
      }
    }

    setCreateNewChat(true);
    setSelectedUsers([user]);
    setActiveChatId(null);
    closeModal();
  }

  const toggleGroupChatMode = () => {
    setIsGroupChatActive(!isGroupChatActive);
    setSelectedUsers([]);

    Object.values(userRefs.current).forEach((ref) => {
      if (ref) ref.checked = false;
    });
  };

  const handleUserCheckboxChange = (user: User, isChecked: boolean) => {
    if (isChecked) {
      setCheckedUsers([...checkedUsers, user]);
    } else {
      setCheckedUsers(checkedUsers.filter((u) => u !== user));
    }
  };

  // Filter users based on search term for Email and UserName
  const filteredUsers = allUsersMapping
    ? Object.entries(allUsersMapping).filter(
        ([email, user]) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div
      className="new-chat-modal fixed bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow"
      style={{
        top: top,
        left: left,
        width: "350px",
        height: "600px",
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">New Chat</h3>
        <button
          onClick={closeModal}
          className="text-slate-400 hover:text-slate-600 text-xl font-bold w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      <div className="p-4 h-full overflow-y-auto flex flex-col">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-700 mb-3">
            Choose Chat Type
          </h4>
          <div className="space-y-3">
            <button
              onClick={toggleGroupChatMode}
              className={`w-full p-3 text-left rounded-lg border transition-colors group ${
                isGroupChatActive
                  ? "border-green-500 bg-green-50"
                  : "border-slate-200 hover:border-green-300 hover:bg-green-50"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    isGroupChatActive ? "bg-green-200" : "bg-green-100"
                  }`}
                >
                  <span className="text-green-600 font-semibold">👥</span>
                </div>
                <div>
                  <div
                    className={`font-medium ${
                      isGroupChatActive
                        ? "text-green-700"
                        : "text-slate-800 group-hover:text-green-700"
                    }`}
                  >
                    Create Group Conversation
                  </div>
                  <div className="text-xs text-slate-500">
                    {isGroupChatActive
                      ? "Click to deactivate"
                      : "Create a group conversation"}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              🔍
            </div>
          </div>
        </div>

        <div className="flex-1 mb-4">
          <h4 className="text-sm font-medium text-slate-700 mb-3">
            {isGroupChatActive ? "Select Users for Group" : "All Users"}
          </h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {isGroupChatActive && (
              <div className="border-t border-slate-200 pt-4 mt-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-600">
                    Selected: {checkedUsers.length} user
                    {checkedUsers.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <button
                  onClick={handleCreateNewChat}
                  disabled={checkedUsers.length === 0}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    checkedUsers.length > 0
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Create Group ({checkedUsers.length})
                </button>
              </div>
            )}
            {filteredUsers.map(([email, user]) => (
              <div
                key={email}
                className={`flex items-center p-2 rounded-lg transition-colors ${
                  !isGroupChatActive ? "hover:bg-slate-50 cursor-pointer" : ""
                }`}
                onClick={() => handleTwoUserChat(user)}
              >
                {isGroupChatActive && (
                  <input
                    ref={(el) => {
                      userRefs.current[email] = el;
                    }}
                    type="checkbox"
                    className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    onChange={(e) =>
                      handleUserCheckboxChange(user, e.target.checked)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
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
                  <div className="text-xs text-slate-500 truncate">{email}</div>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-4">
                No users found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
