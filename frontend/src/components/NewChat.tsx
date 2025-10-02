import React, { useRef } from "react";
import { useChatStore } from "../store/chatStore";
import { GroupChat, NewChatModalProps, User } from "../types/types";
import axios from "axios";
import { BACKEND_URL } from "../constants";

const NewChat: React.FC<NewChatModalProps> = ({ socket }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const groupChatNameRef = useRef<HTMLInputElement>(null);
  const currentUser = useChatStore((state) => state.currentUser);
  const chatIdToTimestampMapping = useChatStore(
    (state) => state.chatIdToTimestampMapping
  );
  const selectedUsers = useChatStore((state) => state.selectedUsers);
  
  const setSelectedUsers = useChatStore.getState().setSelectedUsers;
  const setIsLoadingMoreChats = useChatStore.getState().setIsLoadingMoreChats;
  const setChatIdToTimestampMapping =
    useChatStore.getState().setChatIdToTimestampMapping;

  const formatChatName = (users: User[]): string => {
    if (users.length === 0) return "New Chat";
    if (users.length === 1) return users[0].name;
    if (users.length === 2) return `${users[0].name}, ${users[1].name}`;

    const othersCount = users.length - 2;
    return `${users[0].name}, ${users[1].name} +${othersCount}`;
  };

  function sendMessageToSocket(text: string | undefined, roomId: number) {
    if (currentUser === null || socket === null) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: text,
          email: currentUser.email,
          roomId: roomId,
        },
      })
    );
  }

  const handleSendMessage = () => {
    if (!currentUser) {
      return;
    }

    if (inputRef.current && socket) {
      const text = inputRef.current.value.trim();
      inputRef.current.value = "";

      if (!text) return;

      let emails: string[] = [];
      selectedUsers.map((user) => emails.push(user.email));
      emails.push(currentUser?.email);

      setIsLoadingMoreChats(true);
      const groupChatName = groupChatNameRef.current?.value.trim() || "";

      //TODO => on Sending message, send list of (allUsers + CurrentUser) to backend to fetch newChatId
      //and send the message in that chatId to WS

      //Keep this logic if we don't want users to create group of 2 if a Chat already exists b/w them two
      // if (emails.length === 2) {
      //   for (const [chatId, userEmails] of Object.entries(chatIdUserMapping)) {
      //     if (
      //       (emails[0] === chatIdUserMapping[parseInt(chatId)][0] &&
      //         emails[1] === chatIdUserMapping[parseInt(chatId)][1]) ||
      //       (emails[0] === chatIdUserMapping[parseInt(chatId)][1] &&
      //         emails[1] === chatIdUserMapping[parseInt(chatId)][0])
      //     ) {
      //       console.log("matched");
      //       setSelectedUsers([]);
      //       setActiveChatId(parseInt(chatId));
      //       return;
      //     }
      //   }
      // }

      axios
        .post(
          `${BACKEND_URL}/api/dashboard/create-new-chat`,
          { emails, groupChatName },
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          let newRoomId: number = res.data.chatId;
          const newChatData: GroupChat = res.data.groupChatData;

          //WS-Send "AskToJoin" event for others
          for (const email of emails) {
            socket.send(
              JSON.stringify({
                type: "asktojoin",
                payload: {
                  roomId: newRoomId,
                  //@ts-ignore
                  email: email,
                },
              })
            );
          }

          sendMessageToSocket(text, newRoomId);

          //TODO =>  add that in the all required state variables:
          //   - setAllChatsOrder
          const updatedChatToTimestampMapping: [number, string][] = [
            ...chatIdToTimestampMapping,
            [newRoomId, Date.now().toString()],
          ];

          const updatedMapping = updatedChatToTimestampMapping.sort(
            (a, b) => Number(b[1]) - Number(a[1])
          );

          setChatIdToTimestampMapping(updatedMapping);

          const sortedChatIds = updatedMapping.map(([chatId]) => chatId);

          useChatStore.setState((state) => ({
            roomids: sortedChatIds,
            // allChatsOrder: sortedChatIds,
            chatDetailsMap: {
              [newRoomId]: newChatData,
              ...state.chatDetailsMap,
            },
            chatIdUserMapping: {
              [newRoomId]: emails,
              ...state.chatIdUserMapping,
            },
          }));

          setSelectedUsers([]);
          // setActiveChatId(newRoomId);
        })
        .catch((err) => {
          console.log("Error creating new Room");
          console.log(err);
        });

      //TODO => Show loader in chat while we fetch newChatId from backend using some state Variable [isLoadingMoreChats]

      //Update all the user-RoomId related state variables
      setIsLoadingMoreChats(false);
    }
  };

  const onClose = () => {
    setSelectedUsers([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <>
      {selectedUsers && (
        <div className="h-full w-full flex flex-col bg-slate-100">
          {/* Chat Header */}
          <div className="bg-white p-4 px-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onClose}
                className="sm:hidden inline-flex items-center justify-center w-8 h-8 mr-2.5 text-slate-800 text-lg cursor-pointer"
              >
                ←
              </button>
              <div className="w-10 h-10 rounded-full mr-3 bg-gray-300 flex items-center justify-center font-bold text-gray-600">
                {"CH"}
              </div>
              <div>
                <div className="font-semibold text-slate-800">
                  {formatChatName(selectedUsers)}
                </div>
                {selectedUsers.length > 1 && (
                  <input
                    ref={groupChatNameRef}
                    type="text"
                    placeholder="Enter group chat name (optional)"
                    className="text-sm text-slate-600 bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none placeholder-slate-400 w-full max-w-xs"
                  />
                )}
              </div>
            </div>
            <div className="text-2xl cursor-pointer">⋯</div>
          </div>

          {/* Messages Area - Empty for new chat */}
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 scrollbar-hide">
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div>Send a Message to Start Chatting</div>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 px-5 bg-white border-t border-slate-200 flex items-center gap-2.5">
            <input
              type="text"
              placeholder="Type a message"
              className="flex-1 p-2.5 px-4 border border-slate-200 rounded-full outline-none focus:border-blue-500"
              ref={inputRef}
              defaultValue=""
              onKeyDown={handleKeyPress}
            />
            <button
              className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl"
              onClick={handleSendMessage}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NewChat;
