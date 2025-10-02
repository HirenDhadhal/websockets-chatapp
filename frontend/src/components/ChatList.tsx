import React from "react";
import { ChatListProps } from "../types/types";
import { useChatStore } from "../store/chatStore";
import ChatListHeader from "./ChatListHeader";

const ChatList: React.FC<ChatListProps> = ({ onChatSelect }) => {
  const allChatsOrder = useChatStore((state) => state.allChatsOrder);
  const allMessages = useChatStore((state) => state.allMessages);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const allUsersMapping = useChatStore((state) => state.allUsersMapping);
  const currentUser = useChatStore((state) => state.currentUser);
  const chatDetailsMap = useChatStore((state) => state.chatDetailsMap);
  const chatIdUserMapping = useChatStore((state) => state.chatIdUserMapping);
  const isLoadingAllMessages = useChatStore((state) => state.isLoadingChats);

  // Loading skeleton component
  const ChatSkeleton = () => (
    <div className="flex items-center p-3 px-5 border-b border-slate-100 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-slate-300 mr-3"></div>
      <div className="flex-1 overflow-hidden">
        <div className="h-4 bg-slate-300 rounded mb-2 w-3/4"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
      </div>
    </div>
  );

  return (
    <div className="w-full sm:w-[320px] bg-white border-r border-slate-200 h-[calc(100vh-120px)] sm:h-auto overflow-y-auto">
      <ChatListHeader />

      {isLoadingAllMessages ? (
        <>
          {Array.from({ length: 10 }, (_, index) => (
            <ChatSkeleton key={`skeleton-${index}`} />
          ))}
        </>
      ) : (
        allChatsOrder.map((chatId, idx) => (
          <div
            key={idx}
            className={`flex items-center p-3 px-5 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50 ${
              activeChatId === allChatsOrder[idx]
                ? "bg-teal-50 border-r-4 border-blue-500"
                : ""
            }`}
            onClick={() => onChatSelect(allChatsOrder[idx])}
          >
            <div className="flex-1 overflow-hidden">
              <div className="font-semibold text-slate-800 mb-0.5">
                {allUsersMapping &&
                  (chatDetailsMap[chatId].isGroup
                    ? chatDetailsMap[chatId].chatName
                      ? chatDetailsMap[chatId].chatName
                      : (() => {
                          const members = chatIdUserMapping[chatId].map(
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
                    : chatIdUserMapping[chatId][0] === currentUser?.email
                    ? allUsersMapping[chatIdUserMapping[chatId][1]]?.name
                    : allUsersMapping[chatIdUserMapping[chatId][0]]?.name)}
              </div>

              <div className="text-sm text-slate-500 truncate">
                {allMessages[String(chatId)]?.length
                  ? allMessages[String(chatId)][
                      allMessages[String(chatId)].length - 1
                    ].text
                  : null}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatList;
