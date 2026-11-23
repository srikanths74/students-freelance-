import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [liveNotification, setLiveNotification] = useState(null);

  useEffect(() => {
    const socketServerUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000'
      : window.location.origin;

    const newSocket = io(socketServerUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      timeout: 10000
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to real-time WebSocket');
      if (user) {
        newSocket.emit('join_user', user.id);
      }
    });

    newSocket.on('notification_ping', (notif) => {
      setLiveNotification(notif);
      // Auto-clear toast after 5s
      setTimeout(() => {
        setLiveNotification(null);
      }, 5000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, liveNotification, clearLiveNotification: () => setLiveNotification(null) }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
export default SocketContext;
