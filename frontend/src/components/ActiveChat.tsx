import React, { useEffect, useRef, useState, useCallback } from "react";
import { ActiveChatProps } from "../types/types";
import { useChatStore } from "../store/chatStore";
import AddUsersToGroupModal from "./AddUsersToGroupModal";
import GroupChatIcon from "../assets/group-chat.svg";

const ActiveChat: React.FC<ActiveChatProps> = ({
  messages,
  activeChatId,
  onClose,
  socket,
}) => {
  const currentUser = useChatStore((state) => state.currentUser);
  const allUsersMapping = useChatStore((state) => state.allUsersMapping);
  const allMessages = useChatStore((state) => state.allMessages);
  const chatDetailsMap = useChatStore((state) => state.chatDetailsMap);
  const chatIdUserMapping = useChatStore((state) => state.chatIdUserMapping);
  const setAllMessages = useChatStore.getState().setAllMessages;
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddUsersModal, setShowAddUsersModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (!currentUser || !allUsersMapping) {
    return;
  }

  if (!activeChatId) {
    return (
      <div className="hidden sm:flex flex-1 items-center justify-center bg-slate-100 text-slate-500">
        Select a chat to start messaging
      </div>
    );
  }

  useEffect(() => {
    if (messagesEndRef.current && shouldScrollToBottom) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages, activeChatId, shouldScrollToBottom]);

  useEffect(() => {
    setHasMoreMessages(true);
    setShouldScrollToBottom(true);
    setShowDropdown(false);
    setShowAddUsersModal(false);
  }, [activeChatId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const isGroupChat = chatDetailsMap[activeChatId]?.isGroup || false;

  const handleAddUsersClick = () => {
    setShowAddUsersModal(true);
    setShowDropdown(false);
  };

  const closeAddUsersModal = () => {
    setShowAddUsersModal(false);
  };

  const fetchOlderMessages = useCallback(
    async (chatId: number, beforeTimestamp: string) => {
      if (isLoadingOlderMessages || !hasMoreMessages) return;

      setIsLoadingOlderMessages(true);

      try {
        const response = await fetch(
          `/api/chats/${chatId}/messages/before/${beforeTimestamp}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch older messages");
        }

        const olderMessages: {
          userEmail: string;
          text: string;
          sentAt: string;
        }[] = await response.json();

        if (olderMessages.length === 0) {
          setHasMoreMessages(false);
          return;
        }

        const transformedMessages = olderMessages.map((msg) => ({
          email: msg.userEmail,
          text: msg.text,
          timestamp: msg.sentAt,
        }));

        const currentMessages = allMessages[String(chatId)] || [];
        const updatedMessages = [...transformedMessages, ...currentMessages];

        setAllMessages({
          ...allMessages,
          [String(chatId)]: updatedMessages,
        });

        // If we got less than 30 messages, we've reached the end
        if (olderMessages.length < 30) {
          setHasMoreMessages(false);
        }
      } catch (error) {
        console.error("Error fetching older messages:", error);
      } finally {
        setIsLoadingOlderMessages(false);
      }
    },
    [isLoadingOlderMessages, hasMoreMessages, allMessages, setAllMessages]
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const element = e.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = element;

      if (scrollTop < 100 && hasMoreMessages && !isLoadingOlderMessages) {
        const currentMessages = messages[String(activeChatId)];
        if (currentMessages && currentMessages.length >= 30) {
          const oldestTimestamp = currentMessages[0].timestamp;
          fetchOlderMessages(activeChatId, oldestTimestamp);
          setShouldScrollToBottom(false);
        }
      }

      // Check if user is near bottom to enable auto-scroll for new messages
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldScrollToBottom(isNearBottom);
    },
    [
      activeChatId,
      messages,
      hasMoreMessages,
      isLoadingOlderMessages,
      fetchOlderMessages,
    ]
  );

  function sendMessageToSocket(text: string | undefined, roomId: number) {
    socket!.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: text,
          //@ts-ignore
          email: currentUser.email,
          roomId: roomId,
        },
      })
    );

    setShouldScrollToBottom(true);
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (inputRef.current) {
        const text = inputRef.current.value.trim();
        if (!text) return;
        sendMessageToSocket(text, activeChatId);
        inputRef.current.value = "";
      }
    }
  };

  const renderAvatar = () => {
    if (chatDetailsMap[activeChatId].isGroup) {
      return "GC";
    }

    // Determine which user to show in 1-on-1 chat
    const otherUserEmail =
      chatIdUserMapping[activeChatId][0] === currentUser?.email
        ? chatIdUserMapping[activeChatId][1]
        : chatIdUserMapping[activeChatId][0];

    const user = allUsersMapping[otherUserEmail];

    if (user?.image) {
      return (
        <img
          src={user.image}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      );
    } else {
      return (
        <span className="text-sm">
          {user?.name?.charAt(0).toUpperCase() ?? "?"}
        </span>
      );
    }
  };

  const LoadingIndicator = () => (
    <div className="flex justify-center py-4">
      <div className="flex items-center gap-2 text-slate-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span className="text-sm">Loading older messages...</span>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-100">
      <div className="bg-white p-4 px-5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="sm:hidden inline-flex items-center justify-center w-8 h-8 mr-2.5 text-slate-800 text-lg cursor-pointer"
          >
            ←
          </button>
          <div className="w-10 h-10 rounded-full mr-3 bg-gray-300 flex items-center justify-center font-bold text-gray-600">
            {chatDetailsMap[activeChatId].isGroup ? (
              <img
                src={GroupChatIcon}
                alt="Group Chat"
                className="w-full h-full object-cover"
              />
            ) : (
              renderAvatar()
            )}
          </div>
          <div>
            <div className="font-semibold text-slate-800">
              {allUsersMapping &&
                (chatDetailsMap[activeChatId].isGroup
                  ? chatDetailsMap[activeChatId].chatName
                    ? chatDetailsMap[activeChatId].chatName
                    : (() => {
                        const members = chatIdUserMapping[activeChatId].map(
                          (email) => allUsersMapping[email]?.name || email
                        );

                        if (members.length === 2) {
                          return members.join(", ");
                        } else if (members.length > 2) {
                          return `${members[0]}, ${members[1]} +${
                            members.length - 2
                          } others`;
                        } else {
                          return "No Name Group";
                        }
                      })()
                  : chatIdUserMapping[activeChatId][0] === currentUser?.email
                  ? allUsersMapping[chatIdUserMapping[activeChatId][1]]?.name
                  : allUsersMapping[chatIdUserMapping[activeChatId][0]]?.name)}
            </div>
          </div>
        </div>
        <div className="relative" ref={dropdownRef}>
          <div
            className="text-2xl cursor-pointer hover:bg-slate-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            ⋯
          </div>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-2 min-w-[180px] z-10">
              {isGroupChat && (
                <button
                  onClick={handleAddUsersClick}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <span>👥</span>
                  Add Members
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        ref={messagesEndRef}
        className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 scrollbar-hide"
        onScroll={handleScroll}
      >
        {isLoadingOlderMessages && <LoadingIndicator />}

        {!hasMoreMessages && messages[String(activeChatId)]?.length > 0 && (
          <div className="flex justify-center py-2">
            <span className="text-xs text-slate-400 bg-slate-200 px-3 py-1 rounded-full">
              Beginning of conversation
            </span>
          </div>
        )}

        {messages[String(activeChatId)]?.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${
              msg.email === currentUser?.email ? "flex-row-reverse" : ""
            }`}
          >
            <div className="flex flex-col items-center">
              {msg.email === currentUser.email ? (
                <span className="text-xs text-slate-500 mb-1">{"You"}</span>
              ) : (
                <span className="text-xs text-slate-500 mb-1">
                  {allUsersMapping[msg.email]?.name}
                </span>
              )}
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-600 flex-shrink-0 overflow-hidden">
                {allUsersMapping[msg.email]?.image ? (
                  <img
                    src={allUsersMapping[msg.email].image}
                    alt={allUsersMapping[msg.email].name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm">
                    {allUsersMapping[msg.email]?.name
                      ?.charAt(0)
                      .toUpperCase() ?? "?"}
                  </span>
                )}
              </div>
            </div>
            <div
              className={`max-w-[70%] p-2.5 px-4 rounded-2xl shadow-sm ${
                msg.email === currentUser?.email
                  ? "bg-blue-500 text-white"
                  : "bg-white"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div id="bottom-anchor" />
      </div>

      <div className="p-4 px-5 bg-white border-t border-slate-200 flex items-center gap-2.5">
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 p-2.5 px-4 border border-slate-200 rounded-full outline-none focus:border-blue-500"
          ref={inputRef}
          onKeyDown={handleKeyPress}
          defaultValue=""
        />
        <button
          className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl"
          onClick={() => {
            if (inputRef.current) {
              const text = inputRef.current.value.trim();
              if (!text) return;
              sendMessageToSocket(text, activeChatId);
              inputRef.current.value = "";
            }
          }}
        >
          ➤
        </button>
      </div>

      {showAddUsersModal && (
        <AddUsersToGroupModal
          closeModal={closeAddUsersModal}
          activeChatId={activeChatId}
          socket={socket}
        />
      )}
    </div>
  );
};

export default ActiveChat;
