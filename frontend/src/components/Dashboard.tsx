import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { BACKEND_URL } from "../constants";
import { useChatState } from "../hooks/useChatState";

interface Message {
  email: string;
  text: string;
  timestamp: string;
}

interface newMessageFromWS {
  message: string;
  email: string;
  chatId: number;
  timestamp: string;
}

const Dashboard = () => {
  const [msgs, setMsgs] = useState<string[]>(["hi there"]);
  const [roomids, setRoomids] = useState<number[]>([]);
  const [user, setUser] = useState(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isLoadingChats, setIsLoadingChats] = useState(false); //{true, false}
  const [isLoadingOlderChats, setIsLoadingOlderChats] = useState(false); //{true, false}
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({});
  const [allChatsOrder, setAllChatsOrder] = useState<number[]>([]);
  const [chatIdToTimestampMapping, setChatIdToTimestampMapping] = useState<
    [number, string][]
  >([]);
  const wsRef = useRef<WebSocket>(null);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/auth/status`, {
        withCredentials: true,
      })
      .then((res) => {
        setUser(res.data.user);
        console.log(res.data.user);
      })
      .catch((err) => {
        console.log("Not authenticated:");
      });
  }, []);

  const ws = new WebSocket("ws://localhost:8000");
  useEffect(() => {
    //TODO -> Redirect the user to Login page and clear cookies if any
    if (!user) return;

    ws.onmessage = (event) => {
      try {
        //Type = JSON {message, email, chatId, timestamp}
        const newMessageData: newMessageFromWS = JSON.parse(event.data);
        const { message, email, chatId, timestamp } = newMessageData;

        const newMessage: Message = {
          email,
          text: message,
          timestamp,
        };

        setAllMessages((prev) => {
          const existingMessages = prev[chatId] || [];
          return {
            ...prev,
            [chatId]: [newMessage, ...existingMessages],
          };
        });

        setChatIdToTimestampMapping((prev) => {
          const filtered = prev.filter(([id]) => id !== chatId);

          // Add new updated entry
          const updated: [number, string][] = [
            [chatId, timestamp],
            ...filtered,
          ];

          // Sort by timestamp DESCENDING
          updated.sort((a, b) => Number(b[1]) - Number(a[1]));

          //Sort the final ChatIds list
          const sortedChatIds = updated.map(([chatId]) => chatId);

          setAllChatsOrder(sortedChatIds);

          return updated;
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
        const { roomIds, messages } = res.data;
        setRoomids(roomIds);
        //messages = {email, text, timestamp}
        setAllMessages(messages);

        //TODO => update allChatOrder as per the timestamp of latestMsgReceived
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
                email: user.email,
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
  }, [user]);

  function sendMessageToSocket(text: string | undefined, roomId: number) {
    ws.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: text,
          //@ts-ignore
          email: user.email,
          roomId: roomId,
        },
      })
    );
  }

  function createNewRoom(emails: string[]) {
    if (!ws) {
      return;
    }
    //send request to Backend route with all Emails to be added to new room
    let userEmails: string[] = emails;
    //@ts-ignore
    userEmails.push(user.email);

    console.log(userEmails);

    axios
      .post(
        `${BACKEND_URL}/api/dashboard/create-new-chat`,
        { emails: userEmails },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        let newRoomId = res.data;
        console.log(newRoomId);

        //WS-Send "AskToJoin" event for others
        for (const email in userEmails) {
          console.log("Sending out AskToJoin");
          ws.send(
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

        //Update the state for current user as a new room was joined
        setRoomids((prev) => [...prev, newRoomId]);
      })
      .catch((err) => {
        console.log("Error creating new Room");
        console.log(err);
      });
  }

  return (
    <div className="bg-red-200">
      <div className="h-[95vh]">
        {msgs.map((msg) => (
          <div className="bg-white text-black rounded p-4">{msg}</div>
        ))}
      </div>
      <div>
        {allChatsOrder.length > 0 ? (
          allChatsOrder.map((chatid) => <p>{chatid}</p>)
        ) : (
          <p>Loading Chats....</p>
        )}
      </div>
      <div>
        {roomids.length === 0 ? (
          <p>No rooms joined yet.</p>
        ) : (
          roomids.map((roomId) => (
            <div
              key={roomId}
              style={{ marginBottom: "1rem", backgroundColor: "slategray" }}
            >
              <h3>Room {roomId}</h3>
              {allMessages[roomId]?.length > 0 ? (
                allMessages[roomId].map((msg, index) => (
                  <p key={index}>
                    <strong>{msg.email}:</strong> {msg.text}
                  </p>
                ))
              ) : (
                <p>No messages yet.</p>
              )}
            </div>
          ))
        )}
      </div>
      <div>
        <button
          className="bg-green-600 text-white p-4"
          onClick={() => createNewRoom(["tradingcrypto147@gmail.com"])}
        >
          Create New Room
        </button>
      </div>
      {activeChatId && (
        <div className="w-full bg-white flex">
          <input ref={inputRef} className="flex-1 p-4"></input>
          <button
            className="bg-purple-600 text-white p-4"
            onClick={() =>
              sendMessageToSocket(inputRef.current?.value, activeChatId)
            }
          >
            Send Message
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
