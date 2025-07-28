import axios from "axios";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "../constants";

interface NewMessage {
  email: string;
  chatId: number;
  message: string;
  timestamp: string;
}

interface Message {
  email: string;
  text: string;
  timestamp: string;
}

export const useChatState = () => {
  const [currentUser, setcurrentUser] = useState(null); //{email, userName, userId}

  const [isLoadingChats, setIsLoadingChats] = useState(false); //{true, false}
  const [isLoadingOlderChats, setIsLoadingOlderChats] = useState(false); //{true, false}

  const [activeChatId, setActiveChatId] = useState(null);
  const [isConnected, setIsConnected] = useState(false); //Notify user connection is lost

  const [socket, setSocket] = useState<WebSocket | null>(null);

  const [roomids, setRoomids] = useState<number[]>([]);
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({});
  const [allChatsOrder, setAllChatsOrder] = useState<number[]>([]);
  const [chatIdToTimestampMapping, setChatIdToTimestampMapping] = useState<
    [number, string][]
  >([]); //{chatId, LatestMessage_TimeStamp}

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/auth/status`, {
        withCredentials: true,
      })
      .then((res) => {
        setcurrentUser(res.data.user);
        console.log(res.data.user);
      })
      .catch((err) => {
        console.log("Not authenticated:");
      });
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const ws = new WebSocket("ws://localhost:8000");
    ws.onopen = () => {
      setSocket(ws);
    };
    ws.onclose = () => {
      setSocket(null);
    };

    setIsLoadingChats(true);

    axios
      .get(`${BACKEND_URL}/api/dashboard/roomids-per-user`, {
        withCredentials: true,
      })
      .then((res) => {
        const { roomIds, messages } = res.data;
        setRoomids(roomIds);
        //messages = {email, text, timestamp}
        setAllMessages(messages);

        const ChatIdToTimestampMapping: [number, string][] = roomIds.map(
          (chatId: number) => {
            return [chatId, messages[chatId]?.[0]?.timestamp || "0"];
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
          ws.send(
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
        //TODO => Have an error message display to user and Retry
      })
      .finally(() => {
        setIsLoadingChats(false);
      });
  }, [currentUser]);

  const logoutUser = () => {
    setcurrentUser(null);
    setAllChatsOrder([]);
    setAllMessages({});
    setActiveChatId(null);
    setIsConnected(false);
  };

  const addNewMessage = (message: string) => {
    //new msg from backend/WS
    const ParsedMsg: NewMessage = JSON.parse(message);
  };

  const loadMoreMessages = () => {
    //load older messages for a single chatId [increase stored msg count]
    //Query backendURL at "/:chatid/messages/before/:timestamp"
  };

  const sendMessage = () => {
    //sent message from frontend WS to backend WS
  };

  return {
    currentUser,
    socket,
    allChatsOrder,
    allMessages,
    chatIdToTimestampMapping,
    activeChatId,
    roomids,
    isLoadingChats,
    isLoadingOlderChats,
    setActiveChatId,
    logoutUser,
    setAllMessages,
    setAllChatsOrder,
    setChatIdToTimestampMapping,
  };
};
