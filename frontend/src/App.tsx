import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [msgs, setMsgs] = useState(['hi there']);
  const inputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket>(null);

  useEffect(() => {
    const ws = new WebSocket('http://localhost:8080');

    ws.onmessage = (e) => {
      setMsgs((m) => [...m, e.data]);
    };

    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'join',
          payload: {
            roomId: 'red',
          },
        })
      );
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className='bg-red-200'>
      <div className='h-[95vh]'>
        {msgs.map((msg) => (
          <div className='bg-white text-black rounded p-4'>{msg}</div>
        ))}
      </div>
      <div className='w-full bg-white flex'>
        <input ref={inputRef} className='flex-1 p-4'></input>
        <button
          className='bg-purple-600 text-white p-4'
          onClick={() => {
            wsRef.current?.send(
              JSON.stringify({
                type: 'chat',
                payload: { message: inputRef.current?.value },
              })
            );
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}

export default App;
