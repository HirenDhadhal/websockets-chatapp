import { useEffect, useState } from "react";
import { WS_URL } from "../constants";

export const useSocket = () => {
  //TODO=> try useRef instead of useState
  const [socket, setSocket] = useState<WebSocket | null>(null);
  //   const user = useUser();

  useEffect(() => {
    // if (!user) return;
    const ws = new WebSocket(`${WS_URL}`);

    ws.onopen = () => {
      console.log("websocket connected");

      setSocket(ws);
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return () => {
      ws.close();
    };
    //TODO => Socket should depend on the LoggedInUser/isAuthenticated state
  }, []);

  return socket;
};
