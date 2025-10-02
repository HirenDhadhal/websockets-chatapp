import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../constants";
// import Header from "./Header";
// import Sidebar from "./Sidebar";
// import ChatList from "./ChatList";
// import ActiveChat from "./ActiveChat";
// import { chats, messages, Chat } from "./data";
import { useSocket } from "../hooks/useSocket";
import { useChatStore } from "../store/chatStore";
import ActiveChat from "./ActiveChat";
import ChatList from "./ChatList";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { GroupChat, Message, newMessageFromWS } from "../types/types";
import NewChat from "./NewChat";

const Dashboard = () => {
  const allMessages = useChatStore((state) => state.allMessages);
  const currentUser = useChatStore((state) => state.currentUser);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const selectedUsers = useChatStore((state) => state.selectedUsers);

  const setAllMessages = useChatStore.getState().setAllMessages;
  const setAllChatsOrder = useChatStore.getState().setAllChatsOrder;
  const setIsLoadingChats = useChatStore.getState().setIsLoadingChats;
  const setActiveChatId = useChatStore.getState().setActiveChatId;
  const setAllUsersMapping = useChatStore.getState().setAllUsersMapping;
  const setCurrentUser = useChatStore.getState().setCurrentUser;
  const setChatDetailsMap = useChatStore.getState().setChatDetailsMap;
  const setSelectedUsers = useChatStore.getState().setSelectedUsers;
  const setChatIdUserMapping = useChatStore.getState().setChatIdUserMapping;
  const setChatIdToTimestampMapping =
    useChatStore.getState().setChatIdToTimestampMapping;

  const socket = useSocket();

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/auth/status`, {
        withCredentials: true,
      })
      .then((res) => {
        const newUser = {
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          image: res.data.user.image,
        };
        setCurrentUser(newUser);
        // setUser(newUser);
      })
      .catch((err) => {
        console.log("Not authenticated: " + err);
      });
  }, []);

  useEffect(() => {
    //TODO -> Redirect the user to Login page and clear cookies if any
    // if (!user || !socket) return;
    // if (!currentUser) {
    //   window.location.href = '/login';
    //   return;
    // }

    if(!socket || !currentUser){
      return;
    }

    socket.onmessage = (event) => {
      try {
        const newMessageData: newMessageFromWS = JSON.parse(event.data);
        const { message, email, chatId, timestamp } = newMessageData;

        const newMessage: Message = {
          email,
          text: message,
          timestamp,
        };

        useChatStore.setState((state) => {
          const chatIdNum = Number(chatId);
          const chatIdStr = String(chatId);

          const updatedMessages = {
            ...state.allMessages,
            [chatIdStr]: [...(state.allMessages[chatIdStr] || []), newMessage],
          };

          const filtered = state.chatIdToTimestampMapping.filter(
            ([id]) => id !== chatIdNum
          );

          const updatedMapping: [number, string][] = [
            [chatIdNum, timestamp],
            ...filtered,
          ];
          updatedMapping.sort((a, b) => Number(b[1]) - Number(a[1]));

          const sortedChatIds = updatedMapping.map(([id]) => id);

          if (!state.allMessages[chatIdStr]) {
            return {
              allMessages: updatedMessages,
              chatIdToTimestampMapping: updatedMapping,
              allChatsOrder: sortedChatIds,
              activeChatId: chatIdNum,
            };
          } else {
            return {
              allMessages: updatedMessages,
              chatIdToTimestampMapping: updatedMapping,
              allChatsOrder: sortedChatIds,
            };
          }
        });
      } catch (err) {
        console.error("Failed to receive message: ", err);
      }
    };

    setIsLoadingChats(true);
    axios
      .get(`${BACKEND_URL}/api/dashboard/roomids-per-user`, {
        withCredentials: true,
      })
      .then((res) => {
        const {
          roomIds,
          messages,
          allUsersMapping,
          groupChatData,
          usersPerRoom,
        } = res.data as {
          roomIds: number[];
          messages: Record<string, Message[]>;
          allUsersMapping: Record<
            string,
            { id: number; name: string; email: string; image: string }
          >;
          groupChatData: GroupChat[];
          usersPerRoom: Record<number, string[]>;
        };

        setAllMessages(messages);
        setAllUsersMapping(allUsersMapping);
        setChatIdUserMapping(usersPerRoom);

        const chatDetailsMap = groupChatData.reduce<Record<number, GroupChat>>(
          (acc, chat) => {
            acc[chat.chatId] = chat;
            return acc;
          },
          {}
        );

        setChatDetailsMap(chatDetailsMap);

        const ChatIdToTimestampMapping: [number, string][] = roomIds.map(
          (chatId: number) => {
            let length = 1;
            if(messages[chatId]){
              length = messages[chatId].length;
            }
            return [chatId, messages[chatId]?.[length-1]?.timestamp || "0"];
          }
        );

        ChatIdToTimestampMapping.sort((a, b) => Number(b[1]) - Number(a[1]));
        setChatIdToTimestampMapping(ChatIdToTimestampMapping);

        const sortedChatIds = ChatIdToTimestampMapping.map(
          ([chatId]) => chatId
        );
        
        setAllChatsOrder(sortedChatIds);

        //Re-SUBSCRIBE TO THESE RoomIds
        for (const roomId of roomIds) {
          socket!.send(
            JSON.stringify({
              type: "rejoin",
              payload: {
                roomId: roomId,
                //@ts-ignore
                email: currentUser.email,
              },
            })
          );
        }
      })
      .catch((err) => {
        console.log("Error getting all the roomIds for user: " + err);
      })
      .finally(() => {
        setIsLoadingChats(false);
      });
  }, [currentUser]);

  //TEST
  // const [activeChatId, setActiveChatId] = useState<number | null>(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  const [showChatWindow, setShowChatWindow] = useState(false);

  // Handle showing the active chat window on mobile
  const handleChatSelect = (id: number) => {
    setActiveChatId(id);
    if (selectedUsers.length > 0) {
      setSelectedUsers([]);
    }
    if (isMobile) {
      setShowChatWindow(true);
    }
  };

  // Handle closing the active chat on mobile
  const handleCloseChat = () => {
    setShowChatWindow(false);
  };

  // Listen for window resize to switch between mobile/desktop logic
  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 640;
      setIsMobile(mobileView);
      // If resizing to desktop, always hide the mobile overlay
      if (!mobileView) {
        setShowChatWindow(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine which panes to show
  const showChatListPane = !isMobile || !showChatWindow;
  const showActiveChatPane = !isMobile || showChatWindow;

  return (
    <div className="bg-red-200">
      <div className="flex flex-col h-screen font-sans bg-slate-100">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 relative">
            {showChatListPane && (
              <div className="w-full sm:w-auto">
                <ChatList onChatSelect={handleChatSelect} />
              </div>
            )}

            {selectedUsers.length > 0 && socket && <NewChat socket={socket} />}

            {showActiveChatPane && activeChatId && (
              <div
                className={`
                flex-1 flex flex-col
                ${
                  isMobile
                    ? "absolute top-0 left-0 w-full h-full bg-white z-10 transform transition-transform duration-300"
                    : ""
                }
                ${isMobile && showChatWindow ? "translate-x-0" : ""}
                ${isMobile && !showChatWindow ? "translate-x-full" : ""}
             `}
              >
                <ActiveChat
                  messages={allMessages}
                  activeChatId={activeChatId}
                  onClose={handleCloseChat}
                  socket={socket}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
