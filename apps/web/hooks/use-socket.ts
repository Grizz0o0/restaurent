import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/domain/use-auth';

// Singleton socket instance to avoid multiple connections per page render (unless intended)
// But implementing inside hook with cleanup is effectively safe.
// Assuming backend URL is same as API URL or derived.

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useSocket = () => {
    // We only connect if user is authenticated for now (as per SocketGateway logic)
    const { isAuthenticated } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!isAuthenticated || !token) {
            return;
        }

        const socketInstance = io(SOCKET_URL, {
            auth: {
                token: token,
            },
            transports: ['websocket'], // Force websocket
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [isAuthenticated]);

    return socket;
};
