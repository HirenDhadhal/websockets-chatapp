import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { BACKEND_URL } from "../constants";

const Dashboard = () => {
  const [msgs, setMsgs] = useState<string[]>(["hi there"]);
  const [roomids, setRoomids] = useState<number[]>([]);
  const [user, setUser] = useState(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
    if (!user) return;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            roomId: 123,
            //@ts-ignore
            email: user.email,
          },
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        console.log('Data printed here: ' + event.data);
      } catch (err) {
        console.error("Failed to receive message: ", err);
      }
    };

    console.log('logging the user before request: ' + user);
    axios
      .get(`${BACKEND_URL}/api/dashboard/roomids-per-user`, {
        withCredentials: true,
      })
      .then((res) => {
        // setRoomids(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.log("Error getting all the roomIds for user: " + err);
      });

    return () => {
      ws.close();
    };
  }, [user]);

  function sendMessageToSocket(text: string | undefined) {
    ws.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: text,
          //@ts-ignore
          email: user.email,
          roomId: 123,
        },
      })
    );
    console.log("msg sent to backend socket");
  }

  //1. Fetch all RoomId/chatIds from DB for current user
  //2. Store top 30 msg in chat for the top 30 chatId
  //3. Connect to Websocket for ALL those chatIds/RoomIds
  //4. Update the state when we receive new messages in any chatId [discard oldest, store newest]
  //5. Bring chatId on top on sending/receiving new msg
  //6. When new chat/group is created, add the ChatId-UserEmail mapping in the DB table

  // useEffect(() => {
  //   const ws = new WebSocket('ws://localhost:8000');

  //   ws.onmessage = (e) => {
  //     setMsgs((m) => [...m, e.data]);
  //   };

  //   wsRef.current = ws;

  //   ws.onopen = () => {
  //     ws.send(
  //       JSON.stringify({
  //         type: 'join',
  //         payload: {
  //           roomId: 123,
  //         },
  //       })
  //     );
  //   };

  //   return () => {
  //     ws.close();
  //   };
  // }, []);

  return (
    <div className="bg-red-200">
      <div className="h-[95vh]">
        {msgs.map((msg) => (
          <div className="bg-white text-black rounded p-4">{msg}</div>
        ))}
      </div>
      <div className="w-full bg-white flex">
        <input ref={inputRef} className="flex-1 p-4"></input>
        <button
          className="bg-purple-600 text-white p-4"
          onClick={() => sendMessageToSocket(inputRef.current?.value)}
        >
          Send Message
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
